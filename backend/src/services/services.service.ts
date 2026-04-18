// backend/src/services/services.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { slugify } from '../common/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
    private mailService: MailService,
  ) { }

  private async notifyAdminsServicePending(serviceTitle: string, salonName: string) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of admins) {
      const notification = await this.notificationsService.create(
        admin.id,
        `Service "${serviceTitle}" for salon "${salonName}" is pending approval.`,
        { link: '/admin?tab=services' },
      );
      this.eventsGateway.sendNotificationToUser(
        admin.id,
        'newNotification',
        notification,
      );
    }
  }

  private async notifyOwnerServicePending(ownerId: string, serviceTitle: string) {
    const notification = await this.notificationsService.create(
      ownerId,
      `Your service "${serviceTitle}" is awaiting admin approval.`,
      { link: '/dashboard?tab=services' },
    );
    this.eventsGateway.sendNotificationToUser(
      ownerId,
      'newNotification',
      notification,
    );
  }

  async create(user: any, dto: CreateServiceDto) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: dto.salonId },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }

    // FIX: Allow ADMIN or the actual owner to create a service for the salon
    if (salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to add a service to this salon',
      );
    }

    // Handle empty string categoryId by converting to undefined
    const createData = {
      ...dto,
      images: dto.images || [],
      categoryId:
        dto.categoryId && dto.categoryId.trim() !== ''
          ? dto.categoryId
          : undefined,
    };

    const service = await this.prisma.service.create({ data: createData });

    // Auto-create SEO Keyword for this service
    try {
      const keywordSlug = slugify(service.title);
      // Check if keyword exists
      const existingKeyword = await this.prisma.seoKeyword.findUnique({
        where: { slug: keywordSlug },
      });

      if (!existingKeyword) {
        // Create new keyword
        await this.prisma.seoKeyword.create({
          data: {
            keyword: service.title,
            slug: keywordSlug,
            category: 'Service', // Default to generic Service category
            priority: 5, // High priority for actual services
            searchVolume: 100, // Default estimate
            difficulty: 30,
            variations: [service.title + ' near me', 'best ' + service.title],
          },
        });
        console.log(`[ServicesService] Auto-created SEO keyword: ${service.title} (${keywordSlug})`);
      }
    } catch (error) {
      // Don't fail the service creation if SEO keyword fails (it might be a duplicate slug race condition)
      console.warn(`[ServicesService] Failed to auto-create SEO keyword for ${service.title}:`, error.message);
    }

    if (user.role !== 'ADMIN') {
      await this.notifyAdminsServicePending(service.title, salon.name);
      await this.notifyOwnerServicePending(salon.ownerId, service.title);
    }

    // Send admin email notification
    if (user.role !== 'ADMIN') {
      await this.mailService.notifyAdminNewService(
        salon.name,
        service.title,
        `R${service.price}`,
        `${user.firstName || ''} ${user.lastName || ''} (${user.email})`.trim(),
      );
    }

    return service;
  }

  findAll() {
    return this.prisma.service.findMany();
  }

  findOne(id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async update(user: any, id: string, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    // FIX: Allow ADMIN to update any service
    if (service.salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this service',
      );
    }

    // Handle empty string categoryId by converting to undefined
    const requiresApproval = user.role !== 'ADMIN';

    const updateData = {
      ...dto,
      categoryId:
        dto.categoryId !== undefined && dto.categoryId.trim() === ''
          ? undefined
          : dto.categoryId,
      approvalStatus: requiresApproval ? 'PENDING' : undefined,
    };

    const updatedService = await this.prisma.service.update({
      where: { id },
      data: updateData,
    });

    // Auto-create SEO Keyword if title changed
    if (dto.title) {
      try {
        const keywordSlug = slugify(dto.title);
        // Check if keyword exists
        const existingKeyword = await this.prisma.seoKeyword.findUnique({
          where: { slug: keywordSlug },
        });

        if (!existingKeyword) {
          // Create new keyword
          await this.prisma.seoKeyword.create({
            data: {
              keyword: dto.title,
              slug: keywordSlug,
              category: 'Service',
              priority: 5,
              searchVolume: 100,
              difficulty: 30,
              variations: [dto.title + ' near me', 'best ' + dto.title],
            },
          });
          console.log(`[ServicesService] Auto-created SEO keyword on update: ${dto.title} (${keywordSlug})`);
        }
      } catch (error) {
        console.warn(`[ServicesService] Failed to auto-create SEO keyword on update for ${dto.title}:`, error.message);
      }
    }

    if (requiresApproval) {
      await this.notifyAdminsServicePending(
        updatedService.title,
        service.salon.name,
      );
      await this.notifyOwnerServicePending(
        service.salon.ownerId,
        updatedService.title,
      );
    }

    return updatedService;
  }

  async setDiscount(user: any, id: string, discountPercentage: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    if (service.salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this service discount',
      );
    }

    if (discountPercentage <= 0 || discountPercentage >= 100) {
      throw new BadRequestException('Discount percentage must be between 1 and 95.');
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        discountPercentage,
      },
    });
  }

  async clearDiscount(user: any, id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    if (service.salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to clear this service discount',
      );
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        discountPercentage: null,
      },
    });
  }

  async remove(user: any, id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    // FIX: Allow ADMIN to delete any service
    if (service.salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to delete this service',
      );
    }

    const bookingCount = await this.prisma.booking.count({
      where: { serviceId: id },
    });

    if (bookingCount > 0) {
      throw new ForbiddenException(
        'Cannot delete service with existing bookings. Please contact support if you need to remove this service.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.serviceLike.deleteMany({ where: { serviceId: id } });
      await tx.promotion.deleteMany({ where: { serviceId: id } });
      return tx.service.delete({ where: { id } });
    });
  }

  findAllForSalon(salonId: string) {
    return this.prisma.service.findMany({
      where: { salonId: salonId },
    });
  }

  async findFeatured() {
    const items = await this.prisma.service.findMany({
      where: { approvalStatus: 'APPROVED' },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            province: true,
            ownerId: true,
            visibilityWeight: true,
            createdAt: true,
          },
        },
      },
      take: 20,
    });
    return items
      .sort((a: any, b: any) => {
        const sv = (b.salon?.visibilityWeight ?? 1) - (a.salon?.visibilityWeight ?? 1);
        if (sv !== 0) return sv;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 5);
  }

  async findAllApproved(page: number = 1, pageSize: number = 10, user?: any) {
    // Rank globally by visibility score then recency, and only then paginate.
    // Only include services that have at least one image (for featured display on home page)
    const items = await this.prisma.service.findMany({
      where: {
        approvalStatus: 'APPROVED',
        images: { isEmpty: false },
      },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            province: true,
            ownerId: true,
            visibilityWeight: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Attach isLikedByCurrentUser if user present
    const userId: string | null = user?.id ?? null;
    let withLikeFlag = items as any[];
    if (userId) {
      const serviceIds = items.map((s) => s.id);
      const liked = await this.prisma.serviceLike.findMany({
        where: { userId, serviceId: { in: serviceIds } },
        select: { serviceId: true },
      });
      const likedSet = new Set(liked.map((l) => l.serviceId));
      withLikeFlag = items.map((s: any) => ({ ...s, isLikedByCurrentUser: likedSet.has(s.id) }));
    }

    const ordered = withLikeFlag.sort((a: any, b: any) => {
      const sv = (b.salon?.visibilityWeight ?? 1) - (a.salon?.visibilityWeight ?? 1);
      if (sv !== 0) return sv;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = ordered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      services: ordered.slice(start, end),
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async search(filters: any, user?: any) {
    const {
      q,
      category,
      categoryId,
      priceMin,
      priceMax,
      province,
      city,
      sortBy,
      limit = 100,
    } = filters || {};

    console.log('[ServicesService] Search filters:', filters);

    const where: any = {
      approvalStatus: 'APPROVED',
      // Only include services with images (exclude menu-style listings)
      images: { isEmpty: false },
    };

    if (q) {
      where.title = { contains: String(q), mode: 'insensitive' };
      console.log('[ServicesService] Filtering by service name:', q);
    }
    if (categoryId) {
      where.categoryId = String(categoryId);
      console.log('[ServicesService] Filtering by categoryId:', categoryId);
    } else if (category) {
      where.category = {
        name: { contains: String(category), mode: 'insensitive' },
      };
      console.log('[ServicesService] Filtering by category name:', category);
    }
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = Number(priceMin);
      if (priceMax) where.price.lte = Number(priceMax);
    }
    const salonFilter: any = {};
    if (province) {
      salonFilter.province = {
        equals: String(province),
        mode: 'insensitive',
      };
    }
    if (city) {
      salonFilter.OR = [
        { city: { equals: String(city), mode: 'insensitive' } },
        { town: { equals: String(city), mode: 'insensitive' } },
      ];
    }
    if (Object.keys(salonFilter).length > 0) {
      where.salon = { is: salonFilter };
    }

    let orderBy: Record<string, 'asc' | 'desc'> | undefined;
    if (sortBy === 'price') orderBy = { price: 'asc' };
    if (sortBy === 'latest') orderBy = { createdAt: 'desc' };

    console.log('[ServicesService] Prisma where clause:', JSON.stringify(where, null, 2));

    const items = await this.prisma.service.findMany({
      where,
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            province: true,
            ownerId: true,
            visibilityWeight: true,
          },
        },
        category: { select: { id: true, name: true } },
      },
      take: Math.min(limit, 200), // Limit results to prevent slow queries
    });

    console.log('[ServicesService] Found', items.length, 'services');
    if (items.length > 0 && items.length <= 5) {
      console.log('[ServicesService] Sample results:', items.map(s => ({
        id: s.id,
        title: s.title,
        categoryId: s.categoryId,
        categoryName: s.category?.name
      })));
    }

    // Attach isLikedByCurrentUser if user present
    const userId: string | null = user?.id ?? null;
    let withLikeFlag = items as any[];
    if (userId) {
      const serviceIds = items.map((s) => s.id);
      const liked = await this.prisma.serviceLike.findMany({
        where: { userId, serviceId: { in: serviceIds } },
        select: { serviceId: true },
      });
      const likedSet = new Set(liked.map((l) => l.serviceId));
      withLikeFlag = items.map((s: any) => ({ ...s, isLikedByCurrentUser: likedSet.has(s.id) }));
    }

    if (orderBy) {
      return withLikeFlag;
    }
    return withLikeFlag.sort((a: any, b: any) => {
      const sv = (b.salon?.visibilityWeight ?? 1) - (a.salon?.visibilityWeight ?? 1);
      if (sv !== 0) return sv;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async autocomplete(q: string) {
    if (!q || String(q).trim().length === 0) {
      return { venues: [], services: [] };
    }

    const searchTerm = String(q).trim();

    // 1. Find matching Approved Salons (Venues)
    const venues = await this.prisma.salon.findMany({
      where: {
        name: { contains: searchTerm, mode: 'insensitive' },
        approvalStatus: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
      },
      take: 4,
    });

    // 2. Find matching Services of Approved Salons
    const rawServices = await this.prisma.service.findMany({
      where: {
        title: { contains: searchTerm, mode: 'insensitive' },
        salon: {
          approvalStatus: 'APPROVED'
        }
      },
      select: {
        id: true,
        title: true,
        salon: { select: { id: true, name: true } },
      },
      take: 10,
      distinct: ['title'],
      orderBy: { title: 'asc' },
    });

    // We just return distinct service titles, and maybe keeping one salon as an example
    // but the frontend primarily needs the title to search /services?service=TITLE
    const services = rawServices.map((r) => ({
      id: r.id,
      title: r.title,
      salon: r.salon,
    }));

    return {
      venues,
      services: services.slice(0, 5) // Limit distinct services to 5
    };
  }
}
