import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonDto, UpdateSalonDto, UpdateSalonPlanDto } from './dto';
import { compareByVisibilityThenRecency } from 'src/common/visibility';
import {
  normalizeOperatingHours,
  isOpenNowFromHours,
} from './utils/operating-hours.util';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';
import { generateSalonSlug, isUUID } from '../common/slug.util';
import { MailService } from '../mail/mail.service';

type PlanCode = 'PREMIUM';
type PlanPaymentStatus =
  | 'PENDING_SELECTION'
  | 'AWAITING_PROOF'
  | 'PROOF_SUBMITTED'
  | 'VERIFIED';

const PLAN_FALLBACKS: Record<
  PlanCode,
  { visibilityWeight: number; maxListings: number; priceCents: number }
> = {
  PREMIUM: { visibilityWeight: 5, maxListings: 9999, priceCents: 39900 },
};

@Injectable()
export class SalonsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
    private mailService: MailService,
  ) { }

  private async notifyAdminsSalonPending(salonName: string, actorName?: string) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of admins) {
      const notification = await this.notificationsService.create(
        admin.id,
        actorName
          ? `Salon "${salonName}" updated by ${actorName} is pending approval.`
          : `Salon "${salonName}" is pending approval.`,
        { link: '/admin?tab=salons' },
      );
      this.eventsGateway.sendNotificationToUser(
        admin.id,
        'newNotification',
        notification,
      );
    }
  }

  private async notifyOwnerSalonPending(ownerId: string, salonName: string) {
    const notification = await this.notificationsService.create(
      ownerId,
      `Your salon "${salonName}" is awaiting admin approval.`,
      { link: '/dashboard' },
    );
    this.eventsGateway.sendNotificationToUser(
      ownerId,
      'newNotification',
      notification,
    );
  }

  /**
   * Generate a unique slug for a salon
   * If the base slug already exists, append a number suffix
   */
  private async generateUniqueSlug(name: string, city: string): Promise<string> {
    const baseSlug = generateSalonSlug(name, city);

    // Check if base slug exists
    const existing = await this.prisma.salon.findUnique({
      where: { slug: baseSlug },
      select: { id: true },
    });

    if (!existing) {
      return baseSlug;
    }

    // Find all slugs that start with the base slug
    const similarSlugs = await this.prisma.salon.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: { slug: true },
    });

    // Extract numbers from existing slugs and find the next available
    const numbers = similarSlugs
      .map(s => {
        const match = s.slug?.match(new RegExp(`^${baseSlug}-(\\d+)$`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 2;
    return `${baseSlug}-${nextNumber}`;
  }

  /**
   * Validate that image URL is from trusted source (Cloudinary)
   * Prevents external URL injection for security
   */
  private validateImageUrl(url: string | null | undefined, fieldName: string): void {
    if (!url) return; // null/undefined is OK

    const cloudinaryDomain = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudinaryDomain) {
      // If Cloudinary not configured, accept any URL (backward compatibility)
      return;
    }

    try {
      const urlObj = new URL(url);
      const isCloudinary = urlObj.hostname.includes('cloudinary.com') ||
        urlObj.hostname.includes('res.cloudinary.com');

      if (!isCloudinary) {
        throw new BadRequestException(
          `Invalid ${fieldName} URL. Only Cloudinary URLs are allowed for security reasons.`
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Invalid ${fieldName} URL format.`);
    }
  }

  private async resolvePlanMeta(planCode: PlanCode) {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { code: planCode },
        select: {
          visibilityWeight: true,
          maxListings: true,
          priceCents: true,
        },
      });
      if (plan) {
        return plan;
      }
    } catch {
      // fall back to static defaults below
    }
    return PLAN_FALLBACKS[planCode];
  }

  async create(userId: string, dto: CreateSalonDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const isAdmin = user.role === 'ADMIN';
    const canCreateSalon = user.role === 'SALON_OWNER' || isAdmin;
    if (!canCreateSalon) {
      throw new ForbiddenException(
        `You are not authorized to create a salon. Your account role is '${user.role}'. Please contact support if you believe this is an error.`
      );
    }

    const existingSalon = await this.prisma.salon.findFirst({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (existingSalon) {
      throw new ForbiddenException('You already have a salon profile.');
    }

    const requestedPlan =
      typeof (dto as any).planCode === 'string'
        ? ((dto as any).planCode as PlanCode)
        : 'PREMIUM';
    if (requestedPlan !== 'PREMIUM') {
      throw new ForbiddenException(
        'Only the R399 premium salon listing plan is available.',
      );
    }

    const planMeta = await this.resolvePlanMeta(requestedPlan);
    const paymentReferenceRaw = (dto as any).paymentReference;
    const paymentReference =
      typeof paymentReferenceRaw === 'string' &&
        paymentReferenceRaw.trim().length > 0
        ? paymentReferenceRaw.trim()
        : dto.name.trim();
    const planPaymentStatus: PlanPaymentStatus = 'VERIFIED';
    const adminConfirmEmailVerified = Boolean((dto as any).adminConfirmEmailVerified);
    const depositRequired = Boolean((dto as any).depositRequired);
    const depositPercentage =
      depositRequired
        ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              typeof (dto as any).depositPercentage === 'number'
                ? (dto as any).depositPercentage
                : 50,
            ),
          ),
        )
        : null;
    const paymentInstructions =
      typeof (dto as any).paymentInstructions === 'string' &&
        (dto as any).paymentInstructions.trim().length > 0
        ? (dto as any).paymentInstructions.trim()
        : null;
    const cancellationPolicy =
      typeof (dto as any).cancellationPolicy === 'string' &&
        (dto as any).cancellationPolicy.trim().length > 0
        ? (dto as any).cancellationPolicy.trim()
        : null;
    const specialConditions =
      typeof (dto as any).specialConditions === 'string' &&
        (dto as any).specialConditions.trim().length > 0
        ? (dto as any).specialConditions.trim()
        : null;

    const normalizedOperatingHours = normalizeOperatingHours(
      (dto as any).operatingHours,
    );

    const normalizedOperatingDays = Array.isArray((dto as any).operatingDays)
      ? (dto as any).operatingDays.filter(
        (day: any) => typeof day === 'string' && day.trim().length > 0,
      )
      : normalizedOperatingHours.map((oh) => oh.day);

    // Generate unique slug for SEO-friendly URLs
    const slug = await this.generateUniqueSlug(dto.name, (dto as any).city || '');

    const data: any = {
      ownerId: userId,
      name: dto.name,
      slug,
      description: (dto as any).description,
      address: (dto as any).address,
      province: (dto as any).province,
      city: (dto as any).city,
      town: (dto as any).town,
      website: (dto as any).website,
      facebookUrl: (dto as any).facebookUrl,
      instagramUrl: (dto as any).instagramUrl,
      tiktokUrl: (dto as any).tiktokUrl,
      googleReviewsUrl: (dto as any).googleReviewsUrl,
      freshaReviewsUrl: (dto as any).freshaReviewsUrl,
      booksyReviewsUrl: (dto as any).booksyReviewsUrl,
      latitude: (dto as any).latitude,
      longitude: (dto as any).longitude,
      heroImages: (dto as any).heroImages ?? [],
      backgroundImage: (dto as any).backgroundImage,
      contactEmail: (dto as any).email ?? (dto as any).contactEmail,
      phoneNumber: (dto as any).phone ?? (dto as any).phoneNumber,
      whatsapp: (dto as any).whatsapp ?? null,
      offersMobile: (dto as any).offersMobile,
      mobileFee: (dto as any).mobileFee,
      bookingType: (dto as any).bookingType ?? 'ONSITE',
      operatingHours: normalizedOperatingHours,
      operatingDays: normalizedOperatingDays,
      bookingMessage:
        typeof (dto as any).bookingMessage === 'string' &&
          (dto as any).bookingMessage.trim().length > 0
          ? (dto as any).bookingMessage.trim()
          : null,
      depositRequired,
      depositPercentage,
      paymentInstructions,
      cancellationPolicy,
      specialConditions,
      bankName:
        typeof (dto as any).bankName === 'string' &&
          (dto as any).bankName.trim().length > 0
          ? (dto as any).bankName.trim()
          : null,
      accountHolder:
        typeof (dto as any).accountHolder === 'string' &&
          (dto as any).accountHolder.trim().length > 0
          ? (dto as any).accountHolder.trim()
          : null,
      accountNumber:
        typeof (dto as any).accountNumber === 'string' &&
          (dto as any).accountNumber.trim().length > 0
          ? (dto as any).accountNumber.trim()
          : null,
      branchCode:
        typeof (dto as any).branchCode === 'string' &&
          (dto as any).branchCode.trim().length > 0
          ? (dto as any).branchCode.trim()
          : null,
      planCode: requestedPlan,
      visibilityWeight: planMeta.visibilityWeight,
      maxListings: planMeta.maxListings,
      planPriceCents: planMeta.priceCents,
      commissionRate: 0.0,
      approvalStatus: isAdmin ? 'APPROVED' : 'PENDING',
      isVerified: isAdmin,
      planPaymentStatus,
      planPaymentReference: paymentReference,
      planProofSubmittedAt: null,
      planVerifiedAt: new Date(),
    };

    console.log('SalonsService.create called for user:', userId);
    console.log('Payload:', JSON.stringify(dto, null, 2));

    let salon;
    try {
      console.log('Attempting to create salon in DB...');
      salon = await this.prisma.salon.create({ data });
      const userUpdateData: Record<string, unknown> = {};
      if (isAdmin && adminConfirmEmailVerified && !user.emailVerified) {
        userUpdateData.emailVerified = true;
      }
      if (!isAdmin && user.onboardingStatus !== 'COMPLETE') {
        userUpdateData.onboardingStatus = 'COMPLETE';
      }
      if (Object.keys(userUpdateData).length > 0) {
        await this.prisma.user.update({
          where: { id: userId },
          data: userUpdateData as any,
        });
      }
      console.log('Salon created successfully:', salon.id);
    } catch (err: any) {
      console.error(
        'Salon create failed:',
        err?.message || err,
        err?.meta || '',
      );
      throw err;
    }

    try {
      if (isAdmin) {
        const admins = await this.prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });

        for (const admin of admins) {
          const notification = await this.notificationsService.create(
            admin.id,
            `Admin-created salon "${salon.name}" is now live.`,
            { link: '/admin?tab=salons' },
          );
          this.eventsGateway.sendNotificationToUser(
            admin.id,
            'newNotification',
            notification,
          );
        }
      } else {
        await this.notifyAdminsSalonPending(
          salon.name,
          user.firstName || 'a user',
        );
        await this.notifyOwnerSalonPending(salon.ownerId, salon.name);
      }

      // Send admin email notification
      if (!isAdmin) {
        const location = [(dto as any).city, (dto as any).province].filter(Boolean).join(', ');
        await this.mailService.notifyAdminNewSalon(
          salon.name,
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          user.email,
          location || 'Not specified',
        );
      }
    } catch (notifyErr) {
      console.error('Failed to send notifications after salon creation:', notifyErr);
      // Do not fail the request if notifications fail
    }

    return salon;
  }

  findAll() {
    return this.prisma.salon.findMany({
      include: {
        services: true,
      },
    });
  }

  async updatePlan(user: any, dto: UpdateSalonPlanDto, ownerId: string) {
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this plan',
      );
    }

    const salon = await this.prisma.salon.findFirst({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        planCode: true,
        planPaymentStatus: true,
        planPaymentReference: true,
        planProofSubmittedAt: true,
        planVerifiedAt: true,
      },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    const data: any = {};
    const planCodeRaw = dto.planCode
      ? (dto.planCode as string).toUpperCase()
      : undefined;
    let normalizedPlan: PlanCode | undefined;
    if (planCodeRaw) {
      if (!PLAN_FALLBACKS[planCodeRaw as PlanCode]) {
        throw new ForbiddenException('Invalid package selection.');
      }
      normalizedPlan = planCodeRaw as PlanCode;
      const planMeta = await this.resolvePlanMeta(normalizedPlan);
      data.planCode = normalizedPlan;
      data.visibilityWeight = planMeta.visibilityWeight;
      data.maxListings = planMeta.maxListings;
      data.planPriceCents = planMeta.priceCents;
      data.commissionRate = 0.0;
    }

    const planChanged =
      normalizedPlan && normalizedPlan !== (salon.planCode as PlanCode | null);
    const currentStatus = (salon.planPaymentStatus ??
      'PENDING_SELECTION') as PlanPaymentStatus;
    let nextStatus: PlanPaymentStatus | undefined;

    if (planChanged) {
      nextStatus = dto.hasSentProof ? 'PROOF_SUBMITTED' : 'AWAITING_PROOF';
    }
    if (typeof dto.hasSentProof === 'boolean') {
      if (dto.hasSentProof) {
        nextStatus = 'PROOF_SUBMITTED';
      } else {
        nextStatus =
          planChanged || currentStatus !== 'PENDING_SELECTION'
            ? 'AWAITING_PROOF'
            : 'PENDING_SELECTION';
      }
    }
    if (!planChanged && currentStatus === 'VERIFIED') {
      nextStatus = 'VERIFIED';
    }

    if (nextStatus) {
      data.planPaymentStatus = nextStatus;
      if (nextStatus === 'PROOF_SUBMITTED') {
        data.planProofSubmittedAt = salon.planProofSubmittedAt ?? new Date();
        data.planVerifiedAt = null;
      } else if (
        nextStatus === 'AWAITING_PROOF' ||
        nextStatus === 'PENDING_SELECTION'
      ) {
        data.planProofSubmittedAt = null;
        data.planVerifiedAt = null;
      } else if (nextStatus === 'VERIFIED') {
        // Preserve existing verification timestamp when already verified
        data.planVerifiedAt = salon.planVerifiedAt ?? new Date();
      }
    }

    if (typeof dto.paymentReference !== 'undefined') {
      const trimmed =
        typeof dto.paymentReference === 'string' &&
          dto.paymentReference.trim().length > 0
          ? dto.paymentReference.trim()
          : salon.name.trim();
      data.planPaymentReference = trimmed;
    }

    if (Object.keys(data).length === 0) {
      return this.prisma.salon.findFirst({ where: { ownerId } });
    }

    return this.prisma.salon.update({
      where: { id: salon.id },
      data,
    });
  }

  /**
   * Track salon view
   * Fire-and-forget operation that should not block responses
   */
  async trackView(salonId: string, userId?: string, ipAddress?: string) {
    try {
      // Use a transaction to ensure atomicity, but with a timeout to prevent hangs
      await Promise.race([
        this.prisma.$transaction(async (tx) => {
          // Create view record
          await tx.salonView.create({
            data: {
              salonId,
              userId,
              ipAddress,
            },
          });

          // Increment view count atomically
          await tx.salon.update({
            where: { id: salonId },
            data: {
              viewCount: {
                increment: 1,
              },
            },
          });
        }),
        // Timeout after 5 seconds to prevent hanging
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('View tracking timeout')), 5000)
        ),
      ]);
    } catch (error) {
      // Silently fail view tracking to not disrupt user experience
      // Log error for debugging but don't throw
      console.error('Failed to track salon view:', error instanceof Error ? error.message : error);
    }
  }

  /**
   * Find a salon by slug or ID
   * Supports both UUID lookups (for backward compatibility) and slug lookups (for SEO)
   */
  async findOne(idOrSlug: string, user?: any, ipAddress?: string) {
    // Determine if we're looking up by UUID or slug
    const isId = isUUID(idOrSlug);

    const salon = await this.prisma.salon.findFirst({
      where: isId
        ? { id: idOrSlug }
        : { slug: idOrSlug },
      include: {
        services: {
          where: {
            approvalStatus: 'APPROVED',
          },
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            category: true,
          },
        },
        gallery: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!salon) {
      throw new NotFoundException(`Salon not found`);
    }

    // Track view (fire-and-forget to avoid blocking response)
    this.trackView(salon.id, user?.id, ipAddress).catch((error) => {
      // Silently fail - view tracking should not disrupt UX
      console.error('Failed to track salon view:', error);
    });

    // Attach isFavorited for the salon if user is present
    let salonWithFavorite: any = { ...salon };
    const userId: string | null = user?.id ?? null;

    if (userId) {
      // Check if this salon is favorited by the user
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_salonId: {
            userId: userId,
            salonId: salon.id,
          },
        },
      });
      salonWithFavorite.isFavorited = !!favorite;

      // Attach isLikedByCurrentUser for returned services if they exist
      if (Array.isArray(salonWithFavorite.services) && salonWithFavorite.services.length > 0) {
        const svcIds = salonWithFavorite.services.map((s: any) => s.id);
        const liked = await this.prisma.serviceLike.findMany({
          where: { userId, serviceId: { in: svcIds } },
          select: { serviceId: true },
        });
        const likedSet = new Set(liked.map((l) => l.serviceId));
        salonWithFavorite.services = salonWithFavorite.services.map((s: any) => ({
          ...s,
          isLikedByCurrentUser: likedSet.has(s.id),
        }));
      }
    } else {
      // No user logged in, set isFavorited to false
      salonWithFavorite.isFavorited = false;
    }

    salonWithFavorite.reviews = [];
    salonWithFavorite.avgRating = 0;
    salonWithFavorite.reviewCount = 0;

    return salonWithFavorite;
  }

  async update(user: any, id: string, dto: UpdateSalonDto) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    // FIX: Allow ADMIN to update any salon
    if (salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this salon',
      );
    }

    // Validate image URLs for security (only Cloudinary allowed)
    this.validateImageUrl(dto.backgroundImage, 'backgroundImage');
    this.validateImageUrl(dto.logo, 'logo');
    if (dto.heroImages && Array.isArray(dto.heroImages)) {
      dto.heroImages.forEach((url, index) => {
        this.validateImageUrl(url, `heroImages[${index}]`);
      });
    }

    // Whitelist fields that exist on the Prisma Salon model to avoid unknown-argument errors
    const allowedFields: (
      | keyof UpdateSalonDto
      | 'backgroundImage'
      | 'logo'
      | 'heroImages'
    )[] = [
        'name',
        'description',
        'backgroundImage',
        'logo',
        'heroImages',
        'province',
        'city',
        'town',
        'address',
        'latitude',
        'longitude',
        'contactEmail',
        'phoneNumber',
        'whatsapp',
        'website',
        'facebookUrl',
        'instagramUrl',
        'tiktokUrl',
        'googleReviewsUrl',
        'freshaReviewsUrl',
        'booksyReviewsUrl',
        'bankName',
        'accountHolder',
        'accountNumber',
        'branchCode',
        'depositRequired',
        'depositPercentage',
        'paymentInstructions',
        'cancellationPolicy',
        'specialConditions',
        'bookingType',
        'offersMobile',
        'mobileFee',
        'operatingHours',
      ];

    const requiresApproval = user.role !== 'ADMIN';
    const updateData: any = {};
    for (const key of allowedFields) {
      const value = (dto as any)[key];
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    // bookingType passes through as a string
    // operatingHours already whitelisted above; no extra transformation required

    if (updateData.operatingHours) {
      const normalizedHours = normalizeOperatingHours(
        updateData.operatingHours,
      );
      updateData.operatingHours = normalizedHours;
      updateData.operatingDays = normalizedHours.map((entry) => entry.day);
    }

    if (typeof updateData.depositRequired === 'boolean' && !updateData.depositRequired) {
      updateData.depositPercentage = null;
      updateData.paymentInstructions = null;
    }

    if (typeof updateData.depositPercentage === 'number') {
      updateData.depositPercentage = Math.min(
        100,
        Math.max(0, Math.round(updateData.depositPercentage)),
      );
    }

    for (const textField of [
      'whatsapp',
      'bankName',
      'accountHolder',
      'accountNumber',
      'branchCode',
      'paymentInstructions',
      'cancellationPolicy',
      'specialConditions',
    ] as const) {
      if (typeof updateData[textField] === 'string') {
        const trimmed = updateData[textField].trim();
        updateData[textField] = trimmed.length > 0 ? trimmed : null;
      }
    }

    if (requiresApproval && Object.keys(updateData).length > 0) {
      updateData.approvalStatus = 'PENDING';
    }

    const updatedSalon = await this.prisma.salon.update({
      where: { id },
      data: updateData,
    });

    if (requiresApproval && Object.keys(updateData).length > 0) {
      const actorName =
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email ||
        'the salon owner';
      await this.notifyAdminsSalonPending(updatedSalon.name, actorName);
      await this.notifyOwnerSalonPending(updatedSalon.ownerId, updatedSalon.name);
    }

    return updatedSalon;
  }

  async remove(user: any, id: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    // FIX: Allow ADMIN to delete any salon
    if (salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to delete this salon',
      );
    }

    return this.prisma.salon.delete({
      where: { id },
    });
  }

  async getAggregateRating(category: string, city: string, province: string) {
    // Find all salons with services in this category and location
    const salons = await this.prisma.salon.findMany({
      where: {
        city: {
          equals: city,
          mode: 'insensitive',
        },
        province: {
          equals: province,
          mode: 'insensitive',
        },
        approvalStatus: 'APPROVED',
        services: {
          some: {
            category: {
              name: {
                contains: category,
                mode: 'insensitive',
              },
            },
            approvalStatus: 'APPROVED',
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (salons.length === 0) {
      return null;
    }

    const salonIds = salons.map((s) => s.id);
    if (salonIds.length < 5) {
      return null;
    }

    return null;
  }

  findMySalon(user: any, ownerId: string) {
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to view this salon');
    }
    return this.prisma.salon.findFirst({ where: { ownerId } });
  }

  async findAllApproved(filters: any, user: any) {
    try {
      const {
        province,
        city,
        service,
        category,
        q,
        offersMobile,
        sortBy,
        openNow,
        priceMin,
        priceMax,
        lat,
        lon,
        radius,
      } = filters || {};

      const where: any = {
        approvalStatus: 'APPROVED',
      };

      if (province)
        where.province = { equals: String(province), mode: 'insensitive' } as any;
      if (city) {
        where.OR = [
          { city: { equals: String(city), mode: 'insensitive' } as any },
          { town: { equals: String(city), mode: 'insensitive' } as any },
        ];
      }
      if (offersMobile === 'true' || offersMobile === true)
        where.offersMobile = true;

      // Service-based filters
      const servicesFilter: any = {};
      if (service || q) {
        servicesFilter.title = {
          contains: String(service || q),
          mode: 'insensitive',
        } as any;
      }
      if (category) {
        // Convert slug format to searchable terms
        // e.g., "makeup-beauty" → search for "makeup" AND "beauty" in category name
        // This matches slugs like "makeup-beauty" to names like "Makeup & Beauty"
        const searchTerms = String(category).split('-').filter(term => term.length > 0);
        if (searchTerms.length > 0) {
          servicesFilter.AND = [
            ...(servicesFilter.AND || []),
            ...searchTerms.map(term => ({
              category: {
                name: { contains: term, mode: 'insensitive' } as any,
              },
            })),
          ];
        }
      }
      if (priceMin || priceMax) {
        servicesFilter.price = {};
        if (priceMin) servicesFilter.price.gte = Number(priceMin);
        if (priceMax) servicesFilter.price.lte = Number(priceMax);
      }
      if (Object.keys(servicesFilter).length > 0) {
        where.services = { some: servicesFilter };
      }

      let orderBy: any;
      if (sortBy === 'rating' || sortBy === 'top_rated')
        orderBy = { visibilityWeight: 'desc' };

      // Fetch base list with optimized select (use pre-computed avgRating)
      let salons = await this.prisma.salon.findMany({
        where,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          backgroundImage: true,
          logo: true,
          heroImages: true,
          province: true,
          city: true,
          town: true,
          address: true,
          latitude: true,
          longitude: true,
          contactEmail: true,
          phoneNumber: true,
          whatsapp: true,
          website: true,
          facebookUrl: true,
          instagramUrl: true,
          tiktokUrl: true,
          googleReviewsUrl: true,
          freshaReviewsUrl: true,
          booksyReviewsUrl: true,
          bookingType: true,
          offersMobile: true,
          mobileFee: true,
          operatingHours: true,
          operatingDays: true,
          isVerified: true,
          avgRating: true,        // Pre-computed - no need to calculate!
          viewCount: true,
          visibilityWeight: true,
          createdAt: true,
          // Include top 5 services for map display
          services: {
            where: { approvalStatus: 'APPROVED' },
            take: 5,
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              title: true,
              price: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      salons = salons.map((s: any) => {
        return {
          ...s,
          avgRating: 0,
          reviewCount: 0,
          viewCount: s.viewCount || 0
        };
      });

      // Derive availability from operatingHours at query-time
      const now = new Date();
      salons = salons.map((s: any) => ({
        ...s,
        isAvailableNow: isOpenNowFromHours(s.operatingHours, now),
      }));

      // Filter by availability if requested
      if (openNow === 'true' || openNow === true) {
        salons = salons.filter((s: any) => s.isAvailableNow);
      }

      // Default ranking by visibility score when no explicit distance/price sort
      if (!sortBy || sortBy === 'latest') {
        salons = salons.sort((a: any, b: any) =>
          compareByVisibilityThenRecency(
            {
              visibilityWeight: a.visibilityWeight,
              createdAt: a.createdAt,
            },
            {
              visibilityWeight: b.visibilityWeight,
              createdAt: b.createdAt,
            },
          ),
        );
      }

      // Sort by distance in memory if requested and coordinates provided
      if (sortBy === 'distance' && lat && lon) {
        const R = 6371; // km
        const toRad = (v: number) => (v * Math.PI) / 180;
        const userLat = Number(lat);
        const userLon = Number(lon);
        const maxRadius = radius ? Number(radius) : null;

        salons = salons
          .map((s) => {
            if (s.latitude == null || s.longitude == null)
              return { ...s, __dist: Number.POSITIVE_INFINITY };
            const dLat = toRad(s.latitude - userLat);
            const dLon = toRad(s.longitude - userLon);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(userLat)) *
              Math.cos(toRad(s.latitude)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c;
            return { ...s, __dist: d };
          })
          .filter((s: any) => {
            // Filter by radius if specified
            if (maxRadius && s.__dist !== Number.POSITIVE_INFINITY) {
              return s.__dist <= maxRadius;
            }
            return true;
          })
          .sort((a: any, b: any) => a.__dist - b.__dist)
          .map(({ __dist, ...rest }: any) => ({
            ...rest,
            distance: __dist !== Number.POSITIVE_INFINITY ? __dist : null
          }));
      }

      // Attach favorite flag if logged-in
      if (user) {
        const favoriteSalons = await this.prisma.favorite.findMany({
          where: { userId: user.id },
          select: { salonId: true },
        });
        const favoriteSalonIds = new Set(favoriteSalons.map((f) => f.salonId));
        salons = salons.map((salon) => ({
          ...salon,
          isFavorited: favoriteSalonIds.has(salon.id),
        }));
      }

      // Optional price sort using min service price
      if (sortBy === 'price') {
        const mins = await this.prisma.service.groupBy({
          by: ['salonId'],
          _min: { price: true },
          where: { salonId: { in: salons.map((s) => s.id) } },
        });
        const minMap = new Map(mins.map((m) => [m.salonId, m._min.price ?? 0]));
        salons = salons.sort(
          (a, b) => Number(minMap.get(a.id) ?? 0) - Number(minMap.get(b.id) ?? 0),
        );
      }

      // Night shift filter - salons open after 6pm (18:00)
      if (sortBy === 'night_shift') {
        salons = salons.filter((s: any) => {
          const hours = s.operatingHours;
          if (!hours) return false;

          // Check if any day has closing time >= 18:00
          const hasNightHours = (hoursData: any): boolean => {
            if (Array.isArray(hoursData)) {
              return hoursData.some((day: any) => {
                const closeTime = day?.close;
                if (!closeTime) return false;
                const [hour] = closeTime.split(':').map(Number);
                return hour >= 18; // Open until 6pm or later
              });
            }
            if (typeof hoursData === 'object') {
              return Object.values(hoursData).some((time: any) => {
                if (typeof time === 'string') {
                  // Format: "09:00 - 21:00"
                  const parts = time.split('-');
                  if (parts.length >= 2) {
                    const closeTime = parts[1].trim();
                    const [hour] = closeTime.split(':').map(Number);
                    return hour >= 18;
                  }
                }
                return false;
              });
            }
            return false;
          };

          return hasNightHours(hours);
        });
      }

      return salons;
    } catch (error) {
      console.error('findAllApproved DB error, returning empty list:', error?.message || error);
      return [];
    }
  }

  findNearby(lat: number, lon: number) {
    console.log(`Finding salons near lat: ${lat}, lon: ${lon}`);
    return this.prisma.salon.findMany();
  }

  async findFeatured(user?: any) {
    try {
      let salons = await this.prisma.salon.findMany({
        where: {
          approvalStatus: 'APPROVED',
        },
      });

      salons = salons.map((s: any) => {
        return {
          ...s,
          avgRating: 0,
          reviewCount: 0,
          viewCount: s.viewCount || 0
        };
      });

      salons.sort((a: any, b: any) => {
        const weightDiff = (b.visibilityWeight || 0) - (a.visibilityWeight || 0);
        if (weightDiff !== 0) {
          return weightDiff;
        }

        const verifiedDiff = Number(Boolean(b.isVerified)) - Number(Boolean(a.isVerified));
        if (verifiedDiff !== 0) {
          return verifiedDiff;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      // Attach favorite flag if logged-in
      if (user) {
        const favoriteSalons = await this.prisma.favorite.findMany({
          where: { userId: user.id },
          select: { salonId: true },
        });
        const favoriteSalonIds = new Set(favoriteSalons.map((f) => f.salonId));
        salons = salons.map((salon) => ({
          ...salon,
          isFavorited: favoriteSalonIds.has(salon.id),
        }));
      }

      return salons;
    } catch (error) {
      console.error('findFeatured DB error, returning empty list:', error?.message || error);
      return [];
    }
  }

  async findRecommended(user: any) {
    if (!user) {
      return [];
    }

    // Get user's favorites
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        salon: {
          include: {
            services: {
              where: { approvalStatus: 'APPROVED' },
              select: { categoryId: true, category: { select: { name: true } } }
            }
          }
        }
      }
    });

    // Get user's booking history
    const bookings = await this.prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        service: {
          include: {
            salon: {
              include: {
                services: {
                  where: { approvalStatus: 'APPROVED' },
                  select: { categoryId: true, category: { select: { name: true } } }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Extract preferred categories from favorites and bookings
    const preferredCategories = new Set<string>();
    favorites.forEach(fav => {
      fav.salon.services?.forEach(service => {
        if (service.category?.name) {
          preferredCategories.add(service.category.name);
        }
      });
    });
    bookings.forEach(booking => {
      booking.service.salon.services?.forEach(service => {
        if (service.category?.name) {
          preferredCategories.add(service.category.name);
        }
      });
    });

    // Get favorite salon IDs to exclude them
    const favoriteSalonIds = new Set(favorites.map(f => f.salonId));

    // Find similar salons based on categories
    let recommendedSalons = await this.prisma.salon.findMany({
      where: {
        approvalStatus: 'APPROVED',
        id: {
          notIn: Array.from(favoriteSalonIds)
        },
        services: {
          some: {
            approvalStatus: 'APPROVED',
            category: preferredCategories.size > 0 ? {
              name: {
                in: Array.from(preferredCategories)
              }
            } : undefined
          }
        }
      },
      include: {
        services: {
          where: { approvalStatus: 'APPROVED' },
          select: { categoryId: true, category: { select: { name: true } } }
        }
      },
      orderBy: [
        { viewCount: 'desc' },
        { visibilityWeight: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 12
    });

    // If no category-based recommendations, get top-rated salons
    if (recommendedSalons.length === 0) {
      recommendedSalons = await this.prisma.salon.findMany({
        where: {
          approvalStatus: 'APPROVED',
          id: {
            notIn: Array.from(favoriteSalonIds)
          }
        },
        include: {
          services: {
            where: { approvalStatus: 'APPROVED' },
            select: { categoryId: true }
          }
        },
        orderBy: [
          { visibilityWeight: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 12
      });
    }

    // Remove legacy review metrics from recommendation cards.
    recommendedSalons = recommendedSalons.map((s: any) => {
      return {
        ...s,
        avgRating: 0,
        reviewCount: 0,
        viewCount: s.viewCount || 0,
        isFavorited: favoriteSalonIds.has(s.id)
      };
    });

    return recommendedSalons;
  }

  async updateMySalon(user: any, dto: UpdateSalonDto, ownerId: string) {
    // FIX: Allow ADMIN to update any salon
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this salon',
      );
    }
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: ownerId }, // Use ownerId to find the salon
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }
    return this.update(user, salon.id, dto);
  }

  async toggleAvailability(user: any, ownerId: string) {
    // FIX: Allow ADMIN to update any salon
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this salon',
      );
    }
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: ownerId }, // Use ownerId to find the salon
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }
    return this.prisma.salon.update({
      where: { id: salon.id },
      data: { isAvailableNow: !salon.isAvailableNow },
    });
  }

  async updateBookingMessage(user: any, bookingMessage: string, ownerId: string) {
    // Allow ADMIN to update any salon
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this salon',
      );
    }

    // Validate message length (max 200 characters)
    if (bookingMessage && bookingMessage.length > 200) {
      throw new BadRequestException(
        'Booking message cannot exceed 200 characters',
      );
    }

    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: ownerId },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    return this.prisma.salon.update({
      where: { id: salon.id },
      data: {
        bookingMessage: bookingMessage || null, // Set to null if empty string
      },
    });
  }

  async findBookingsForMySalon(user: any, ownerId: string) {
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to view these bookings',
      );
    }
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: ownerId },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }
    return this.prisma.booking.findMany({
      where: { salonId: salon.id },
      include: {
        service: true,
        user: true,
      },
    });
  }

  async findServicesForMySalon(user: any, ownerId: string) {
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to view these services',
      );
    }
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: ownerId },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }
    return this.prisma.service.findMany({ where: { salonId: salon.id } });
  }
}
