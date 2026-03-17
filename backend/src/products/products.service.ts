import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { calculateVisibilityScore } from 'src/common/visibility';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

interface ProductFilters {
  category?: string;
  priceMin?: string;
  priceMax?: string;
  search?: string;
  inStock?: string;
}

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 60); // Limit length
}

/**
 * Check if a string is a UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) { }

  /**
   * Generate a unique slug for a product
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    // Check for uniqueness and append counter if needed
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
      if (counter > 100) {
        // Fallback: append random string
        slug = `${baseSlug}-${Date.now().toString(36)}`;
        break;
      }
    }

    return slug;
  }

  async create(user: any, dto: CreateProductDto) {
    // Enforce plan-based listing cap for product seller
    const currentCount = await this.prisma.product.count({
      where: { sellerId: user.id },
    });
    const maxListings = user.sellerMaxListings ?? 2;
    if (currentCount >= maxListings) {
      throw new ForbiddenException(
        `Listing limit reached for your plan (max ${maxListings} products). Upgrade your plan to add more.`,
      );
    }

    // Generate unique slug from product name
    const slug = await this.generateUniqueSlug(dto.name);

    const product = await this.prisma.product.create({
      data: {
        ...dto,
        slug,
        sellerId: user.id,
      },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const sellerName = user.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : 'A seller';

    for (const admin of admins) {
      const notification = await this.notificationsService.create(
        admin.id,
        `New product "${product.name}" by ${sellerName} is pending approval.`,
        { link: '/admin?tab=products' },
      );
      this.eventsGateway.sendNotificationToUser(
        admin.id,
        'newNotification',
        notification,
      );
    }

    return product;
  }

  async findAllApproved(filters: ProductFilters = {}) {
    const { category, priceMin, priceMax, search, inStock } = filters;

    const where: any = {
      approvalStatus: 'APPROVED',
    };

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search) {
      const term = search.trim();
      if (term.length > 0) {
        where.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ];
      }
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) {
        const min = Number(priceMin);
        if (!Number.isNaN(min)) where.price.gte = min;
      }
      if (priceMax) {
        const max = Number(priceMax);
        if (!Number.isNaN(max)) where.price.lte = max;
      }
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            // following fields may not exist in older prisma types
            sellerVisibilityWeight: true,
            sellerFeaturedUntil: true,
          },
        },
      },
    });

    const score = (p: {
      seller?: {
        sellerVisibilityWeight?: number | null;
      } | null;
      createdAt: Date | string;
    }) =>
      calculateVisibilityScore({
        visibilityWeight: p.seller?.sellerVisibilityWeight ?? 1,
        createdAt: p.createdAt,
      });

    return products.sort((a, b) => {
      const sb = score(b) - score(a);
      if (sb !== 0) return sb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async findOne(idOrSlug: string) {
    // Try to find by ID first (if it looks like a UUID), then by slug
    let product;

    if (isUUID(idOrSlug)) {
      product = await this.prisma.product.findUnique({
        where: { id: idOrSlug },
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              // Seller profile fields for banking/payment info
              sellerWhatsapp: true,
              sellerWebsite: true,
              sellerBankName: true,
              sellerBankAccountHolder: true,
              sellerBankAccountNumber: true,
              sellerBankBranchCode: true,
              sellerBankAccountType: true,
              sellerPaymentNote: true,
            },
          },
        },
      });
    }

    // If not found by ID (or not a UUID), try by slug
    if (!product) {
      product = await this.prisma.product.findUnique({
        where: { slug: idOrSlug },
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              // Seller profile fields for banking/payment info
              sellerWhatsapp: true,
              sellerWebsite: true,
              sellerBankName: true,
              sellerBankAccountHolder: true,
              sellerBankAccountNumber: true,
              sellerBankBranchCode: true,
              sellerBankAccountType: true,
              sellerPaymentNote: true,
            },
          },
        },
      });
    }

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Return different errors for different statuses to help frontend show appropriate messages
    if (product.approvalStatus === 'PENDING') {
      throw new ForbiddenException('This product is pending approval and will be available soon.');
    }

    if (product.approvalStatus === 'REJECTED') {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  findMyProducts(user: any) {
    return this.prisma.product.findMany({
      where: { sellerId: user.id },
    });
  }

  findProductsForSeller(user: any, sellerId: string) {
    if (user.id !== sellerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to view these products.',
      );
    }

    return this.prisma.product.findMany({ where: { sellerId } });
  }

  async update(user: any, productId: string, dto: UpdateProductDto) {
    await this.findProductAndCheckOwnership(productId, user);
    return this.prisma.product.update({
      where: { id: productId },
      data: { ...dto, approvalStatus: 'PENDING' },
    });
  }

  async remove(user: any, productId: string) {
    await this.findProductAndCheckOwnership(productId, user);
    await this.prisma.product.delete({ where: { id: productId } });
  }

  private async findProductAndCheckOwnership(productId: string, user: any) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.sellerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to perform this action.',
      );
    }
    return product;
  }
}
