// backend/src/admin/admin.service.ts

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type PlanCode = 'FREE' | 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';
type PlanPaymentStatus =
  | 'PENDING_SELECTION'
  | 'AWAITING_PROOF'
  | 'PROOF_SUBMITTED'
  | 'VERIFIED';
import { NotificationsService } from 'src/notifications/notifications.service';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) { }

  private async logAction(params: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    reason?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    const { adminId, action, targetType, targetId, reason, metadata } = params;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await (this.prisma as any).adminActionLog?.create?.({
        data: {
          adminId,
          action,
          targetType,
          targetId,
          reason: reason ?? null,
          metadata: (metadata ?? undefined) as any,
        },
      });
      return;
    } catch {
      // Fallback to raw SQL
    }
    try {
      const exists = (
        await (this.prisma as any).$queryRaw<{ exists: boolean }[]>`
          SELECT to_regclass('"AdminActionLog"') IS NOT NULL as exists
        `
      )[0]?.exists;
      if (exists) {
        const metaJson = metadata ? JSON.stringify(metadata) : null;
        await (this.prisma as any).$executeRawUnsafe(
          `INSERT INTO "AdminActionLog" ("adminId","action","targetType","targetId","reason","metadata")
           VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
          adminId,
          action,
          targetType,
          targetId,
          reason ?? null,
          metaJson,
        );
      }
    } catch {
      // noop
    }
  }

  async getPendingSalons() {
    return this.prisma.salon.findMany({
      where: { approvalStatus: 'PENDING' },
      select: {
        id: true,
        name: true,
        approvalStatus: true,
        createdAt: true,
        planCode: true,
        planPriceCents: true,
        planPaymentStatus: true,
        planPaymentReference: true,
        planProofSubmittedAt: true,
        planVerifiedAt: true,
        visibilityWeight: true,
        maxListings: true,
        featuredUntil: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getAllSalons() {
    return this.prisma.salon.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        approvalStatus: true,
        isVerified: true,
        createdAt: true,
        planCode: true,
        planPriceCents: true,
        planPaymentStatus: true,
        planPaymentReference: true,
        planProofSubmittedAt: true,
        planVerifiedAt: true,
        visibilityWeight: true,
        maxListings: true,
        featuredUntil: true,
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async updateSalonStatus(
    salonId: string,
    status: ApprovalStatus,
    adminId?: string,
  ) {
    const current = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: { planPaymentStatus: true, planCode: true },
    });
    if (!current) {
      throw new NotFoundException('Salon not found');
    }
    // Note: Admin can approve salons regardless of payment status
    // Payment verification is handled separately in the payment verification flow
    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data: { approvalStatus: status },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SALON_STATUS_UPDATE',
        targetType: 'SALON',
        targetId: salonId,
        metadata: { status },
      });
    }

    if (updated.owner) {
      const message = `Your salon "${updated.name}" has been ${status.toLowerCase()}.`;
      const notification = await this.notificationsService.create(
        updated.owner.id,
        message,
        { link: '/dashboard' },
      );
      this.eventsGateway.sendNotificationToUser(
        updated.owner.id,
        'newNotification',
        notification,
      );
    }

    return updated;
  }

  async toggleSalonVerification(salonId: string, adminId?: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data: { isVerified: !salon.isVerified },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SALON_VERIFICATION_TOGGLE',
        targetType: 'SALON',
        targetId: salonId,
        metadata: { isVerified: updated.isVerified },
      });
    }

    if (updated.owner) {
      const message = `Your salon "${updated.name}" has been ${updated.isVerified ? 'verified' : 'unverified'}.`;
      const notification = await this.notificationsService.create(
        updated.owner.id,
        message,
        { link: '/dashboard' },
      );
      this.eventsGateway.sendNotificationToUser(
        updated.owner.id,
        'newNotification',
        notification,
      );
    }

    return updated;
  }

  async getPendingServices() {
    return this.prisma.service.findMany({
      where: { approvalStatus: 'PENDING' },
      include: { salon: true },
    });
  }

  async updateServiceStatus(
    serviceId: string,
    status: ApprovalStatus,
    adminId?: string,
  ) {
    const updated = await this.prisma.service.update({
      where: { id: serviceId },
      data: { approvalStatus: status },
      include: {
        salon: {
          select: {
            name: true,
            owner: { select: { id: true } },
          },
        },
      },
    });

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SERVICE_STATUS_UPDATE',
        targetType: 'SERVICE',
        targetId: serviceId,
        metadata: { status },
      });
    }

    const ownerId = updated.salon?.owner?.id;
    if (ownerId) {
      const message = `Your service "${updated.title}" has been ${status.toLowerCase()}.`;
      const notification = await this.notificationsService.create(
        ownerId,
        message,
        { link: '/dashboard?tab=services' },
      );
      this.eventsGateway.sendNotificationToUser(
        ownerId,
        'newNotification',
        notification,
      );
    }

    return updated;
  }

  async getPendingReviews() {
    return this.prisma.review.findMany({
      where: { approvalStatus: 'PENDING' },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        salon: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async updateReviewStatus(
    reviewId: string,
    status: ApprovalStatus,
    adminId?: string,
  ) {
    const existing = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        salonId: true,
        rating: true,
      },
    });
    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { approvalStatus: status },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        salon: {
          select: {
            name: true,
            ownerId: true,
          }
        },
      },
    });

    // Recalculate salon average rating
    if (existing?.salonId) {
      const agg = await this.prisma.review.aggregate({
        where: { salonId: existing.salonId, approvalStatus: 'APPROVED' },
        _avg: { rating: true },
      });
      await this.prisma.salon.update({
        where: { id: existing.salonId },
        data: { avgRating: agg._avg.rating ?? 0 },
      });
    }

    // Notify review author
    if (updated.author) {
      const authorMessage = `Your review for ${updated.salon?.name ?? 'the salon'} has been ${status.toLowerCase()}.`;
      const authorNotification = await this.notificationsService.create(
        updated.author.id,
        authorMessage,
        { link: '/my-profile?tab=reviews' },
      );
      this.eventsGateway.sendNotificationToUser(
        updated.author.id,
        'newNotification',
        authorNotification,
      );
    }

    // NEW: Notify salon owner when review is approved
    if (status === 'APPROVED' && updated.salon?.ownerId && updated.author) {
      const authorName = `${updated.author.firstName} ${updated.author.lastName.charAt(0)}.`;
      const rating = existing?.rating ?? 0;
      const ownerMessage = `${authorName} left a ${rating}-star review for your salon. Tap to view and respond.`;

      const ownerNotification = await this.notificationsService.create(
        updated.salon.ownerId,
        ownerMessage,
        { link: '/dashboard?tab=reviews' },
      );

      this.eventsGateway.sendNotificationToUser(
        updated.salon.ownerId,
        'newNotification',
        ownerNotification,
      );
    }

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'REVIEW_STATUS_UPDATE',
        targetType: 'REVIEW',
        targetId: reviewId,
        metadata: { status },
      });
    }

    return updated;
  }

  async getPendingProducts() {
    return this.prisma.product.findMany({
      where: { approvalStatus: 'PENDING' },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sellerPlanCode: true,
            sellerPlanPriceCents: true,
            sellerPlanPaymentStatus: true,
            sellerPlanPaymentReference: true,
            sellerPlanProofSubmittedAt: true,
            sellerPlanVerifiedAt: true,
          },
        },
      },
    });
  }

  async updateProductStatus(
    productId: string,
    status: ApprovalStatus,
    adminId?: string,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        seller: {
          select: {
            id: true,
            sellerPlanPaymentStatus: true,
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (
      status === 'APPROVED' &&
      product.seller?.sellerPlanPaymentStatus !== 'VERIFIED'
    ) {
      throw new ForbiddenException(
        'Cannot approve product until seller payment has been verified.',
      );
    }
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { approvalStatus: status },
      include: {
        seller: { select: { id: true } },
      },
    });

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'PRODUCT_STATUS_UPDATE',
        targetType: 'PRODUCT',
        targetId: productId,
        metadata: { status },
      });
    }

    if (updated.seller) {
      const message = `Your product "${updated.name}" has been ${status.toLowerCase()}.`;
      const notification = await this.notificationsService.create(
        updated.seller.id,
        message,
        { link: '/product-dashboard' },
      );
      this.eventsGateway.sendNotificationToUser(
        updated.seller.id,
        'newNotification',
        notification,
      );
    }

    return updated;
  }

  async setSalonPlan(
    salonId: string,
    planCode: string,
    overrides?: {
      visibilityWeight?: number;
      maxListings?: number;
      featuredUntil?: Date | null;
    },
  ) {
    const FALLBACKS: Record<
      string,
      { visibilityWeight: number; maxListings: number; priceCents: number }
    > = {
      FREE: { visibilityWeight: 0, maxListings: 1, priceCents: 0 },
      STARTER: { visibilityWeight: 1, maxListings: 3, priceCents: 4900 },
      ESSENTIAL: { visibilityWeight: 2, maxListings: 7, priceCents: 9900 },
      GROWTH: { visibilityWeight: 3, maxListings: 15, priceCents: 19900 },
      PRO: { visibilityWeight: 4, maxListings: 27, priceCents: 29900 },
      ELITE: { visibilityWeight: 5, maxListings: 9999, priceCents: 49900 },
      PREMIUM: { visibilityWeight: 5, maxListings: 9999, priceCents: 39900 },
    };
    type PlanPartial = {
      visibilityWeight?: number | null;
      maxListings?: number | null;
      priceCents?: number | null;
    };
    // Normalize and validate incoming plan code (handle 'undefined'/'null' strings)
    const normalizedPlan =
      !planCode || planCode === 'undefined' || planCode === 'null'
        ? undefined
        : planCode;
    const isValidPlan =
      !!normalizedPlan &&
      ['FREE', 'STARTER', 'ESSENTIAL', 'GROWTH', 'PRO', 'ELITE', 'PREMIUM'].includes(
        normalizedPlan,
      );
    let plan: PlanPartial | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      plan = isValidPlan
        ? ((await (this.prisma as any).plan.findUnique({
          where: { code: normalizedPlan },
        })) as unknown as PlanPartial)
        : null;
    } catch {
      // noop: Plan table may be absent in some environments; fallbacks cover values
    }
    const visibilityWeight =
      overrides?.visibilityWeight ??
      plan?.visibilityWeight ??
      (isValidPlan ? FALLBACKS[normalizedPlan] : undefined)?.visibilityWeight ??
      1;
    const maxListings =
      overrides?.maxListings ??
      plan?.maxListings ??
      (isValidPlan ? FALLBACKS[normalizedPlan] : undefined)?.maxListings ??
      2;
    const planPriceCents =
      plan?.priceCents ??
      (isValidPlan ? FALLBACKS[normalizedPlan]?.priceCents : undefined);
    const data: any = {
      visibilityWeight,
      maxListings,
    };
    if (isValidPlan) data.planCode = normalizedPlan as PlanCode;
    if (normalizedPlan === 'FREE') {
      data.planPaymentStatus = 'VERIFIED';
      data.planProofSubmittedAt = null;
      data.planVerifiedAt = new Date();
    }
    if (planPriceCents !== undefined) data.planPriceCents = planPriceCents;
    if (
      overrides &&
      Object.prototype.hasOwnProperty.call(overrides, 'featuredUntil')
    ) {
      data.featuredUntil = overrides.featuredUntil ?? null;
    }
    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data,
    });
    try {
      this.eventsGateway.server.emit('visibility:updated', {
        entity: 'salon',
        id: salonId,
      });
    } catch {
      // noop: websocket not critical for persistence
    }
    return updated;
  }

  async setSellerPlan(
    sellerId: string,
    planCode: string,
    overrides?: {
      visibilityWeight?: number;
      maxListings?: number;
      featuredUntil?: Date | null;
    },
  ) {
    const FALLBACKS: Record<
      string,
      { visibilityWeight: number; maxListings: number; priceCents: number }
    > = {
      FREE: { visibilityWeight: 0, maxListings: 1, priceCents: 0 },
      STARTER: { visibilityWeight: 1, maxListings: 3, priceCents: 4900 },
      ESSENTIAL: { visibilityWeight: 2, maxListings: 7, priceCents: 9900 },
      GROWTH: { visibilityWeight: 3, maxListings: 15, priceCents: 19900 },
      PRO: { visibilityWeight: 4, maxListings: 27, priceCents: 29900 },
      ELITE: { visibilityWeight: 5, maxListings: 9999, priceCents: 49900 },
      PREMIUM: { visibilityWeight: 5, maxListings: 9999, priceCents: 39900 },
    };
    type SellerPlanPartial = {
      visibilityWeight?: number | null;
      maxListings?: number | null;
      priceCents?: number | null;
    };
    const normalizedPlan =
      !planCode || planCode === 'undefined' || planCode === 'null'
        ? undefined
        : planCode;
    const isValidPlan =
      !!normalizedPlan &&
      ['FREE', 'STARTER', 'ESSENTIAL', 'GROWTH', 'PRO', 'ELITE', 'PREMIUM'].includes(
        normalizedPlan,
      );
    let plan: SellerPlanPartial | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      plan = isValidPlan
        ? ((await (this.prisma as any).plan.findUnique({
          where: { code: normalizedPlan },
        })) as unknown as SellerPlanPartial)
        : null;
    } catch {
      // noop: Plan table may be absent in some environments; fallbacks cover values
    }
    const sellerVisibilityWeight =
      overrides?.visibilityWeight ??
      plan?.visibilityWeight ??
      (isValidPlan ? FALLBACKS[normalizedPlan] : undefined)?.visibilityWeight ??
      1;
    const sellerMaxListings =
      overrides?.maxListings ??
      plan?.maxListings ??
      (isValidPlan ? FALLBACKS[normalizedPlan] : undefined)?.maxListings ??
      2;
    const sellerPlanPriceCents =
      plan?.priceCents ??
      (isValidPlan ? FALLBACKS[normalizedPlan]?.priceCents : undefined);
    const data: any = {
      sellerVisibilityWeight,
      sellerMaxListings,
    };
    if (isValidPlan) data.sellerPlanCode = normalizedPlan as PlanCode;
    if (sellerPlanPriceCents !== undefined)
      data.sellerPlanPriceCents = sellerPlanPriceCents;
    if (
      overrides &&
      Object.prototype.hasOwnProperty.call(overrides, 'featuredUntil')
    ) {
      data.sellerFeaturedUntil = overrides.featuredUntil ?? null;
    }
    const updated = await this.prisma.user.update({
      where: { id: sellerId },
      data,
    });
    try {
      this.eventsGateway.server.emit('visibility:updated', {
        entity: 'seller',
        id: sellerId,
      });
    } catch {
      // noop: websocket not critical for persistence
    }
    return updated;
  }

  async updateSalonPlanPaymentStatus(params: {
    salonId: string;
    status: PlanPaymentStatus;
    adminId?: string;
    paymentReference?: string | null;
  }) {
    const { salonId, status, adminId, paymentReference } = params;
    const existing = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        planPaymentStatus: true,
        planProofSubmittedAt: true,
        planCode: true,
      },
    });
    if (!existing) {
      throw new NotFoundException('Salon not found');
    }
    const data: any = { planPaymentStatus: status };
    if (typeof paymentReference !== 'undefined') {
      data.planPaymentReference = paymentReference?.trim().length
        ? paymentReference.trim()
        : null;
    }
    const now = new Date();
    if (status === 'VERIFIED') {
      data.planVerifiedAt = now;
      // Set commission rate: FREE has 32% commission, paid plans have 0%
      data.commissionRate = existing.planCode === 'FREE' ? 0.32 : 0.0;
    } else {
      data.planVerifiedAt = null;
    }
    if (status === 'PROOF_SUBMITTED') {
      data.planProofSubmittedAt = existing.planProofSubmittedAt ?? now;
    }
    if (status === 'AWAITING_PROOF' || status === 'PENDING_SELECTION') {
      data.planProofSubmittedAt = null;
    }

    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data,
    });

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SALON_PLAN_PAYMENT_UPDATE',
        targetType: 'SALON',
        targetId: salonId,
        metadata: {
          status,
          paymentReference: data.planPaymentReference ?? null,
        },
      });
    }

    return updated;
  }

  async updateSellerPlanPaymentStatus(params: {
    sellerId: string;
    status: PlanPaymentStatus;
    adminId?: string;
    paymentReference?: string | null;
  }) {
    const { sellerId, status, adminId, paymentReference } = params;
    const existing = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        role: true,
        sellerPlanPaymentStatus: true,
        sellerPlanProofSubmittedAt: true,
      },
    });
    if (!existing || existing.role !== 'PRODUCT_SELLER') {
      throw new NotFoundException('Seller not found');
    }

    const data: any = { sellerPlanPaymentStatus: status };
    if (typeof paymentReference !== 'undefined') {
      data.sellerPlanPaymentReference = paymentReference?.trim().length
        ? paymentReference.trim()
        : null;
    }
    const now = new Date();
    if (status === 'VERIFIED') {
      data.sellerPlanVerifiedAt = now;
    } else {
      data.sellerPlanVerifiedAt = null;
    }
    if (status === 'PROOF_SUBMITTED') {
      data.sellerPlanProofSubmittedAt =
        existing.sellerPlanProofSubmittedAt ?? now;
    }
    if (status === 'AWAITING_PROOF' || status === 'PENDING_SELECTION') {
      data.sellerPlanProofSubmittedAt = null;
    }

    const updated = await this.prisma.user.update({
      where: { id: sellerId },
      data,
    });

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SELLER_PLAN_PAYMENT_UPDATE',
        targetType: 'SELLER',
        targetId: sellerId,
        metadata: {
          status,
          paymentReference: data.sellerPlanPaymentReference ?? null,
        },
      });
    }

    return updated;
  }

  async deleteSalonWithCascade(
    salonId: string,
    adminId: string,
    reason?: string,
  ) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: { id: true, name: true, ownerId: true },
    });
    if (!salon) throw new NotFoundException('Salon not found');

    // Snapshot salon and its services for archival
    try {
      const snapshot = await this.prisma.salon.findUnique({
        where: { id: salonId },
        select: {
          id: true,
          ownerId: true,
          name: true,
          description: true,
          backgroundImage: true,
          province: true,
          heroImages: true,
          city: true,
          town: true,
          address: true,
          latitude: true,
          longitude: true,
          contactEmail: true,
          phoneNumber: true,
          whatsapp: true,
          website: true,
          bookingType: true,
          offersMobile: true,
          mobileFee: true,
          isAvailableNow: true,
          operatingHours: true,
          operatingDays: true,
          approvalStatus: true,
          avgRating: true,
          planCode: true,
          visibilityWeight: true,
          maxListings: true,
          featuredUntil: true,
          services: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              duration: true,
              images: true,
              approvalStatus: true,
              categoryId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
      if (snapshot) {
        let archived = false;
        // Try via Prisma Client model (when generated)
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await (this.prisma as any).deletedSalonArchive?.create?.({
            data: {
              salonId: snapshot.id,
              ownerId: snapshot.ownerId,
              salon: snapshot as unknown as object,
              services: (snapshot.services ?? []) as unknown as object,
              reason: reason ?? null,
              deletedBy: adminId,
            },
          });
          archived = true;
        } catch {
          // fall through to raw SQL
        }

        if (!archived) {
          try {
            const exists = (
              await (this.prisma as any).$queryRaw<{ exists: boolean }[]>`
              SELECT to_regclass('"DeletedSalonArchive"') IS NOT NULL as exists
            `
            )[0]?.exists;
            if (exists) {
              // Use parameterized raw SQL with explicit JSONB casts
              const svcJson = JSON.stringify(snapshot.services ?? []);
              const salonJson = JSON.stringify({
                ...snapshot,
                services: undefined,
              });
              await (this.prisma as any).$executeRawUnsafe(
                `INSERT INTO "DeletedSalonArchive" ("salonId","ownerId","salon","services","reason","deletedBy")
                 VALUES ($1,$2,$3::jsonb,$4::jsonb,$5,$6)`,
                snapshot.id,
                snapshot.ownerId,
                salonJson,
                svcJson,
                reason ?? null,
                adminId,
              );
              archived = true;
            }
          } catch {
            // noop: archival fallback failed
          }
        }
      }
    } catch {
      // Archival is best-effort; proceed with deletion if archive table is unavailable
    }

    await (this.prisma as any).$transaction(async (tx: any) => {
      const services = await tx.service.findMany({
        where: { salonId },
        select: { id: true },
      });
      const serviceIds = services.map((s) => s.id);

      if (serviceIds.length > 0) {
        await tx.promotion.deleteMany({
          where: { serviceId: { in: serviceIds } },
        });
        await tx.serviceLike.deleteMany({
          where: { serviceId: { in: serviceIds } },
        });
      }

      await tx.review.deleteMany({ where: { salonId } });
      await tx.favorite.deleteMany({ where: { salonId } });
      await tx.galleryImage.deleteMany({ where: { salonId } });
      await tx.booking.deleteMany({ where: { salonId } });
      await tx.service.deleteMany({ where: { salonId } });
      await tx.salon.delete({ where: { id: salonId } });
    });

    try {
      const message =
        `Your salon "${salon.name}" has been removed by an administrator.` +
        (reason && reason.trim().length > 0 ? ` Reason: ${reason.trim()}` : '');
      const notification = await this.notificationsService.create(
        salon.ownerId,
        message,
        { link: '/create-salon' },
      );
      this.eventsGateway.sendNotificationToUser(
        salon.ownerId,
        'newNotification',
        notification,
      );
    } catch {
      // noop: notification is best-effort
    }

    try {
      this.eventsGateway.server.emit('salon:deleted', {
        id: salonId,
        by: adminId,
      });
    } catch {
      // noop
    }

    // Log action
    void this.logAction({
      adminId,
      action: 'SALON_DELETE',
      targetType: 'SALON',
      targetId: salonId,
      reason: reason ?? null,
    });

    return { ok: true };
  }

  async getDeletedSalons() {
    // Try typed client first
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const rows = await (this.prisma as any).deletedSalonArchive?.findMany?.({
        orderBy: { deletedAt: 'desc' },
      });
      if (Array.isArray(rows)) return rows;
    } catch {
      // fall through
    }
    // Fallback to raw SQL if model or client is not generated
    try {
      const rows = await (this.prisma as any).$queryRawUnsafe(
        'SELECT id, "salonId", "ownerId", salon, services, reason, "deletedBy", "deletedAt", "restoredAt" FROM "DeletedSalonArchive" ORDER BY "deletedAt" DESC',
      );
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  async restoreDeletedSalon(archiveId: string) {
    // Load archive
    let archive: Record<string, any> | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      archive = await (this.prisma as any).deletedSalonArchive?.findUnique?.({
        where: { id: archiveId },
      });
    } catch {
      archive = null;
    }
    if (!archive) {
      try {
        const rows = await (this.prisma as any).$queryRaw`
          SELECT id, "salonId", "ownerId", salon, services, reason, "deletedBy", "deletedAt", "restoredAt"
          FROM "DeletedSalonArchive" WHERE id = ${archiveId} LIMIT 1
        `;
        archive = rows?.[0] ?? null;
      } catch {
        archive = null;
      }
    }
    if (!archive) throw new NotFoundException('Archived profile not found');

    const salonId: string = archive.salonId as string;
    const ownerId: string = archive.ownerId as string;
    const salonData: any = archive.salon ?? {};
    const servicesData: any[] = Array.isArray(archive.services)
      ? archive.services
      : [];

    // Ensure no existing salon blocks restoration (ownerId is unique on Salon)
    const existing = await this.prisma.salon.findFirst({
      where: { OR: [{ id: salonId }, { ownerId }] },
    });
    if (existing) {
      throw new NotFoundException(
        'Cannot restore: owner already has a salon or id is taken',
      );
    }

    // Re-create salon
    const createdSalon = await this.prisma.salon.create({
      data: {
        id: salonId,
        ownerId,
        name: String(salonData.name),
        description: salonData.description ?? null,
        backgroundImage: salonData.backgroundImage ?? null,
        province: String(salonData.province ?? ''),
        heroImages: Array.isArray(salonData.heroImages)
          ? (salonData.heroImages as string[])
          : [],
        city: String(salonData.city ?? ''),
        town: String(salonData.town ?? ''),
        address: salonData.address ?? null,
        latitude: salonData.latitude ?? null,
        longitude: salonData.longitude ?? null,
        contactEmail: salonData.contactEmail ?? null,
        phoneNumber: salonData.phoneNumber ?? null,
        whatsapp: salonData.whatsapp ?? null,
        website: salonData.website ?? null,
        bookingType: salonData.bookingType ?? 'ONSITE',
        offersMobile: !!salonData.offersMobile,
        mobileFee: salonData.mobileFee ?? null,
        isAvailableNow: !!salonData.isAvailableNow,
        operatingHours: salonData.operatingHours ?? null,
        operatingDays: Array.isArray(salonData.operatingDays)
          ? (salonData.operatingDays as string[])
          : [],
        approvalStatus: salonData.approvalStatus ?? 'PENDING',
        avgRating:
          typeof salonData.avgRating === 'number' ? salonData.avgRating : 0,
        planCode: salonData.planCode ?? 'STARTER',
        visibilityWeight:
          typeof salonData.visibilityWeight === 'number'
            ? salonData.visibilityWeight
            : 1,
        maxListings:
          typeof salonData.maxListings === 'number' ? salonData.maxListings : 2,
        featuredUntil: salonData.featuredUntil
          ? new Date(salonData.featuredUntil)
          : null,
      },
    });

    // Re-create services
    for (const svc of servicesData) {
      try {
        await this.prisma.service.create({
          data: {
            id: String(svc.id),
            title: String(svc.title),
            description: String(svc.description ?? ''),
            price: Number(svc.price ?? 0),
            duration: Number(svc.duration ?? 0),
            images: Array.isArray(svc.images) ? (svc.images as string[]) : [],
            approvalStatus: svc.approvalStatus ?? 'PENDING',
            salonId: createdSalon.id,
            categoryId: (svc.categoryId as string | undefined) ?? null,
          },
        });
      } catch {
        // Skip individual service failures to ensure best-effort restoration
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await (this.prisma as any).deletedSalonArchive?.update?.({
        where: { id: archiveId },
        data: { restoredAt: new Date() },
      });
    } catch {
      try {
        await (this.prisma as any).$executeRaw`
          UPDATE "DeletedSalonArchive" SET "restoredAt" = NOW() WHERE id = ${archiveId}
        `;
      } catch {
        // noop
      }
    }

    // Attempt to log restore action
    try {
      const ownerId: string = createdSalon.ownerId;
      void this.logAction({
        adminId: ownerId, // if we need real admin id, controller can pass it; using ownerId as placeholder otherwise
        action: 'SALON_RESTORE',
        targetType: 'SALON',
        targetId: createdSalon.id,
      });
    } catch {
      // noop
    }

    return createdSalon;
  }

  async getMetrics() {
    const [salonsPending, servicesPending, reviewsPending, productsPending] =
      await Promise.all([
        this.prisma.salon.count({ where: { approvalStatus: 'PENDING' } }),
        this.prisma.service.count({ where: { approvalStatus: 'PENDING' } }),
        this.prisma.review.count({ where: { approvalStatus: 'PENDING' } }),
        this.prisma.product.count({ where: { approvalStatus: 'PENDING' } }),
      ]);

    const oldestSalon = await this.prisma.salon.findFirst({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    const oldestService = await this.prisma.service.findFirst({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    const oldestReview = await this.prisma.review.findFirst({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    const oldestProduct = await this.prisma.product.findFirst({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    return {
      salonsPending,
      servicesPending,
      reviewsPending,
      productsPending,
      oldest: {
        salon: oldestSalon?.createdAt ?? null,
        service: oldestService?.createdAt ?? null,
        review: oldestReview?.createdAt ?? null,
        product: oldestProduct?.createdAt ?? null,
      },
    };
  }

  async getAllSellers() {
    const sellers = await this.prisma.user.findMany({
      where: { role: 'PRODUCT_SELLER' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        sellerPlanCode: true,
        sellerPlanPriceCents: true,
        sellerPlanPaymentStatus: true,
        sellerPlanPaymentReference: true,
        sellerPlanProofSubmittedAt: true,
        sellerPlanVerifiedAt: true,
        sellerVisibilityWeight: true,
        sellerMaxListings: true,
        sellerFeaturedUntil: true,
        // Business profile fields
        sellerBusinessName: true,
        sellerContactPerson: true,
        sellerContactPhone: true,
        sellerContactEmail: true,
        sellerPhysicalAddress: true,
        sellerProvincesServed: true,
        sellerApprovalStatus: true,
        sellerProfileSubmittedAt: true,
        sellerApprovedAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return sellers.map((seller) => ({
      id: seller.id,
      email: seller.email,
      firstName: seller.firstName,
      lastName: seller.lastName,
      sellerPlanCode: seller.sellerPlanCode,
      sellerPlanPriceCents: seller.sellerPlanPriceCents,
      sellerPlanPaymentStatus: seller.sellerPlanPaymentStatus,
      sellerPlanPaymentReference: seller.sellerPlanPaymentReference,
      sellerPlanProofSubmittedAt: seller.sellerPlanProofSubmittedAt,
      sellerPlanVerifiedAt: seller.sellerPlanVerifiedAt,
      sellerVisibilityWeight: seller.sellerVisibilityWeight,
      sellerMaxListings: seller.sellerMaxListings,
      sellerFeaturedUntil: seller.sellerFeaturedUntil,
      // Business profile fields
      sellerBusinessName: seller.sellerBusinessName,
      sellerContactPerson: seller.sellerContactPerson,
      sellerContactPhone: seller.sellerContactPhone,
      sellerContactEmail: seller.sellerContactEmail,
      sellerPhysicalAddress: seller.sellerPhysicalAddress,
      sellerProvincesServed: seller.sellerProvincesServed,
      sellerApprovalStatus: seller.sellerApprovalStatus,
      sellerProfileSubmittedAt: seller.sellerProfileSubmittedAt,
      sellerApprovedAt: seller.sellerApprovedAt,
      productsCount: seller._count.products,
      pendingProductsCount: 0, // Would need separate query for pending count
    }));
  }

  async updateSellerApprovalStatus(
    sellerId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    adminId: string,
  ) {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: { id: true, role: true, sellerApprovalStatus: true },
    });
    if (!seller || seller.role !== 'PRODUCT_SELLER') {
      throw new NotFoundException('Seller not found');
    }

    const data: any = { sellerApprovalStatus: status };
    if (status === 'APPROVED') {
      data.sellerApprovedAt = new Date();
    } else {
      data.sellerApprovedAt = null;
    }

    const updated = await this.prisma.user.update({
      where: { id: sellerId },
      data,
    });

    // Log the action
    void this.logAction({
      adminId,
      action: 'SELLER_APPROVAL_UPDATE',
      targetType: 'SELLER',
      targetId: sellerId,
      metadata: { status },
    });

    // Notify the seller
    try {
      const message =
        status === 'APPROVED'
          ? '🎉 Congratulations! Your seller profile has been approved. You can now add products to your store.'
          : status === 'REJECTED'
            ? 'Your seller profile was not approved. Please update your information and resubmit.'
            : 'Your seller profile status has been updated.';

      const notification = await this.notificationsService.create(
        sellerId,
        message,
        { link: '/product-dashboard' },
      );
      this.eventsGateway.sendNotificationToUser(
        sellerId,
        'newNotification',
        notification,
      );
    } catch {
      // noop: notification is best-effort
    }

    return updated;
  }

  async deleteSellerWithCascade(
    sellerId: string,
    adminId: string,
    reason?: string,
  ) {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId, role: 'PRODUCT_SELLER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    if (!seller) throw new NotFoundException('Seller not found');

    // Snapshot seller and products for archival
    try {
      const snapshot = await this.prisma.user.findUnique({
        where: { id: sellerId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          sellerPlanCode: true,
          sellerPlanPriceCents: true,
          sellerPlanPaymentStatus: true,
          sellerPlanPaymentReference: true,
          sellerPlanProofSubmittedAt: true,
          sellerPlanVerifiedAt: true,
          sellerVisibilityWeight: true,
          sellerMaxListings: true,
          sellerFeaturedUntil: true,
          products: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              images: true,
              isOnSale: true,
              salePrice: true,
              stock: true,
              approvalStatus: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (snapshot) {
        let archived = false;
        // Try via Prisma Client model
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await (this.prisma as any).deletedSellerArchive?.create?.({
            data: {
              sellerId: snapshot.id,
              seller: snapshot as unknown as object,
              products: (snapshot.products ?? []) as unknown as object,
              reason: reason ?? null,
              deletedBy: adminId,
            },
          });
          archived = true;
        } catch (err) {
          // fall through to raw SQL
        }

        if (!archived) {
          try {
            const exists = (
              await (this.prisma as any).$queryRaw<{ exists: boolean }[]>`
                SELECT to_regclass('"DeletedSellerArchive"') IS NOT NULL as exists
              `
            )[0]?.exists;
            if (exists) {
              const productsJson = JSON.stringify(snapshot.products ?? []);
              const sellerJson = JSON.stringify({
                ...snapshot,
                products: undefined,
              });
              await (this.prisma as any).$executeRawUnsafe(
                `INSERT INTO "DeletedSellerArchive" ("sellerId","seller","products","reason","deletedBy")
                 VALUES ($1,$2::jsonb,$3::jsonb,$4,$5)`,
                snapshot.id,
                sellerJson,
                productsJson,
                reason ?? null,
                adminId,
              );
              archived = true;
            }
          } catch (err) {
            // noop: archival fallback failed
          }
        }
      }
    } catch (err) {
      // Archival is best-effort; proceed with deletion
    }

    // Delete seller's products and related data
    await (this.prisma as any).$transaction(async (tx: any) => {
      const products = await tx.product.findMany({
        where: { sellerId },
        select: { id: true },
      });
      const productIds = products.map((p) => p.id);

      if (productIds.length > 0) {
        // Delete product promotions
        await tx.promotion.deleteMany({
          where: { productId: { in: productIds } },
        });
        // Delete product orders
        await tx.productOrder.deleteMany({
          where: { productId: { in: productIds } },
        });
      }

      // Delete products
      await tx.product.deleteMany({ where: { sellerId } });

      // Find all conversations involving the seller
      const conversations = await tx.conversation.findMany({
        where: {
          OR: [{ user1Id: sellerId }, { user2Id: sellerId }],
        },
        select: { id: true },
      });
      const conversationIds = conversations.map((c) => c.id);

      // Delete ALL messages in those conversations (including messages from other users)
      if (conversationIds.length > 0) {
        await tx.message.deleteMany({
          where: { conversationId: { in: conversationIds } },
        });
      }

      // Now safe to delete the conversations
      await tx.conversation.deleteMany({
        where: {
          OR: [{ user1Id: sellerId }, { user2Id: sellerId }],
        },
      });

      // Delete seller's notifications
      await tx.notification.deleteMany({ where: { userId: sellerId } });

      // Finally delete the user account
      await tx.user.delete({ where: { id: sellerId } });
    });

    try {
      this.eventsGateway.server.emit('seller:deleted', {
        id: sellerId,
        by: adminId,
      });
    } catch {
      // noop
    }

    void this.logAction({
      adminId,
      action: 'SELLER_DELETE',
      targetType: 'SELLER',
      targetId: sellerId,
      reason: reason ?? null,
    });

    return { ok: true };
  }

  async getDeletedSellersArchive() {
    // Try typed client first
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const rows = await (this.prisma as any).deletedSellerArchive?.findMany?.({
        orderBy: { deletedAt: 'desc' },
        where: { restoredAt: null },
      });
      if (Array.isArray(rows)) {
        return rows;
      }
    } catch (err) {
      // fall through
    }
    // Fallback to raw SQL
    try {
      const rows: any = await (this.prisma as any).$queryRawUnsafe(
        'SELECT id, "sellerId", seller, products, reason, "deletedBy", "deletedAt", "restoredAt" FROM "DeletedSellerArchive" WHERE "restoredAt" IS NULL ORDER BY "deletedAt" DESC',
      );
      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      return [];
    }
  }

  async restoreDeletedSeller(archiveId: string) {
    // Load archive
    let archive: Record<string, any> | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      archive = await (this.prisma as any).deletedSellerArchive?.findUnique?.({
        where: { id: archiveId },
      });
    } catch {
      archive = null;
    }
    if (!archive) {
      try {
        const rows = await (this.prisma as any).$queryRaw`
          SELECT id, "sellerId", seller, products, reason, "deletedBy", "deletedAt", "restoredAt"
          FROM "DeletedSellerArchive" WHERE id = ${archiveId} LIMIT 1
        `;
        archive = rows?.[0] ?? null;
      } catch {
        archive = null;
      }
    }
    if (!archive) throw new NotFoundException('Archived seller not found');

    const sellerId: string = archive.sellerId as string;
    const sellerData: any = archive.seller ?? {};
    const productsData: any[] = Array.isArray(archive.products)
      ? archive.products
      : [];

    // Check if seller already exists
    const existing = await this.prisma.user.findUnique({
      where: { id: sellerId },
    });

    let createdSeller;
    if (existing) {
      // Seller exists - update their data and role
      createdSeller = await this.prisma.user.update({
        where: { id: sellerId },
        data: {
          role: 'PRODUCT_SELLER',
          sellerPlanCode: sellerData.sellerPlanCode ?? 'STARTER',
          sellerPlanPriceCents: sellerData.sellerPlanPriceCents ?? null,
          sellerPlanPaymentStatus:
            sellerData.sellerPlanPaymentStatus ?? 'PENDING_SELECTION',
          sellerPlanPaymentReference:
            sellerData.sellerPlanPaymentReference ?? null,
          sellerPlanProofSubmittedAt: sellerData.sellerPlanProofSubmittedAt
            ? new Date(sellerData.sellerPlanProofSubmittedAt)
            : null,
          sellerPlanVerifiedAt: sellerData.sellerPlanVerifiedAt
            ? new Date(sellerData.sellerPlanVerifiedAt)
            : null,
          sellerVisibilityWeight: sellerData.sellerVisibilityWeight ?? 1,
          sellerMaxListings: sellerData.sellerMaxListings ?? 3,
          sellerFeaturedUntil: sellerData.sellerFeaturedUntil
            ? new Date(sellerData.sellerFeaturedUntil)
            : null,
        },
      });
    } else {
      // Seller doesn't exist - create new account
      createdSeller = await this.prisma.user.create({
        data: {
          id: sellerId,
          email: String(sellerData.email),
          firstName: String(sellerData.firstName ?? ''),
          lastName: String(sellerData.lastName ?? ''),
          role: 'PRODUCT_SELLER',
          password: '', // Will need to reset password
          sellerPlanCode: sellerData.sellerPlanCode ?? 'STARTER',
          sellerPlanPriceCents: sellerData.sellerPlanPriceCents ?? null,
          sellerPlanPaymentStatus:
            sellerData.sellerPlanPaymentStatus ?? 'PENDING_SELECTION',
          sellerPlanPaymentReference:
            sellerData.sellerPlanPaymentReference ?? null,
          sellerPlanProofSubmittedAt: sellerData.sellerPlanProofSubmittedAt
            ? new Date(sellerData.sellerPlanProofSubmittedAt)
            : null,
          sellerPlanVerifiedAt: sellerData.sellerPlanVerifiedAt
            ? new Date(sellerData.sellerPlanVerifiedAt)
            : null,
          sellerVisibilityWeight: sellerData.sellerVisibilityWeight ?? 1,
          sellerMaxListings: sellerData.sellerMaxListings ?? 3,
          sellerFeaturedUntil: sellerData.sellerFeaturedUntil
            ? new Date(sellerData.sellerFeaturedUntil)
            : null,
        },
      });
    }

    // Re-create products
    for (const prod of productsData) {
      try {
        // Check if product already exists
        const existingProduct = await this.prisma.product.findUnique({
          where: { id: String(prod.id) },
        });

        if (existingProduct) {
          // Update existing product
          await this.prisma.product.update({
            where: { id: String(prod.id) },
            data: {
              name: String(prod.name),
              description: String(prod.description ?? ''),
              price: Number(prod.price ?? 0),
              images: Array.isArray(prod.images)
                ? (prod.images as string[])
                : [],
              isOnSale: prod.isOnSale ?? false,
              salePrice: prod.salePrice ?? null,
              stock: Number(prod.stock ?? 0),
              approvalStatus: prod.approvalStatus ?? 'PENDING',
              sellerId: createdSeller.id,
            },
          });
        } else {
          // Create new product
          await this.prisma.product.create({
            data: {
              id: String(prod.id),
              name: String(prod.name),
              description: String(prod.description ?? ''),
              price: Number(prod.price ?? 0),
              images: Array.isArray(prod.images)
                ? (prod.images as string[])
                : [],
              isOnSale: prod.isOnSale ?? false,
              salePrice: prod.salePrice ?? null,
              stock: Number(prod.stock ?? 0),
              approvalStatus: prod.approvalStatus ?? 'PENDING',
              sellerId: createdSeller.id,
            },
          });
        }
      } catch (err) {
        // Skip individual product failures
      }
    }

    // Mark archive as restored
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await (this.prisma as any).deletedSellerArchive?.update?.({
        where: { id: archiveId },
        data: { restoredAt: new Date() },
      });
    } catch {
      try {
        await (this.prisma as any).$executeRaw`
          UPDATE "DeletedSellerArchive" SET "restoredAt" = NOW() WHERE id = ${archiveId}
        `;
      } catch {
        // noop
      }
    }

    void this.logAction({
      adminId: sellerId,
      action: 'SELLER_RESTORE',
      targetType: 'SELLER',
      targetId: createdSeller.id,
    });

    return createdSeller;
  }

  async diagnosticDeletedSellersTable() {
    const result = {
      tableExists: false,
      recordCount: 0,
      canUsePrismaClient: false,
      canUseRawSQL: false,
      error: null as string | null,
      sampleRecords: [] as any[],
    };

    try {
      // Check if table exists
      const tableCheck = await (this.prisma as any).$queryRaw<
        { exists: boolean }[]
      >`
        SELECT to_regclass('"DeletedSellerArchive"') IS NOT NULL as exists
      `;
      result.tableExists = tableCheck[0]?.exists ?? false;

      if (result.tableExists) {
        // Try counting via raw SQL
        try {
          const countResult: any = await (this.prisma as any).$queryRawUnsafe(
            'SELECT COUNT(*) as count FROM "DeletedSellerArchive"'
          );
          result.recordCount = parseInt(countResult[0]?.count ?? '0', 10);
          result.canUseRawSQL = true;
        } catch (err) {
          result.error = `Count failed: ${err?.message || err}`;
        }

        // Try fetching sample records
        try {
          const rows: any = await (this.prisma as any).$queryRawUnsafe(
            'SELECT id, "sellerId", "deletedAt", reason, "deletedBy" FROM "DeletedSellerArchive" ORDER BY "deletedAt" DESC LIMIT 5',
          );
          result.sampleRecords = Array.isArray(rows) ? rows : [];
        } catch (err) {
          result.error = `${result.error || ''} Fetch failed: ${err?.message || err}`;
        }

        // Try Prisma client
        try {
          const prismaRows: any = await (this.prisma as any).deletedSellerArchive?.findMany?.({
            take: 1,
          });
          result.canUsePrismaClient = Array.isArray(prismaRows);
        } catch (err) {
          result.error = `${result.error || ''} Prisma client failed: ${err?.message || err}`;
        }
      }
    } catch (err) {
      result.error = `Table check failed: ${err?.message || err}`;
    }

    return result;
  }

  async getManageFeaturedSalons() {
    const now = new Date();

    // Get currently featured salons
    const featured = await this.prisma.salon.findMany({
      where: {
        approvalStatus: 'APPROVED',
        featuredUntil: { gte: now },
      },
      orderBy: [
        { visibilityWeight: 'desc' },
        { featuredUntil: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        city: true,
        province: true,
        backgroundImage: true,
        featuredUntil: true,
        visibilityWeight: true,
        planCode: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get available (non-featured) approved salons
    const available = await this.prisma.salon.findMany({
      where: {
        approvalStatus: 'APPROVED',
        OR: [
          { featuredUntil: null },
          { featuredUntil: { lt: now } },
        ],
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        city: true,
        province: true,
        backgroundImage: true,
        planCode: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return { featured, available };
  }

  async featureSalon(
    salonId: string,
    durationDays: number,
    adminId?: string,
  ) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: { approvalStatus: true, name: true, ownerId: true },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    if (salon.approvalStatus !== 'APPROVED') {
      throw new ForbiddenException(
        'Only approved salons can be featured',
      );
    }

    const now = new Date();
    const featuredUntil = new Date(now);
    featuredUntil.setDate(featuredUntil.getDate() + durationDays);

    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data: { featuredUntil },
    });

    // Log admin action
    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SALON_FEATURED',
        targetType: 'SALON',
        targetId: salonId,
        metadata: { durationDays, featuredUntil: featuredUntil.toISOString() },
      });
    }

    // Notify salon owner
    try {
      const message = `Your salon "${salon.name}" has been featured on the homepage for ${durationDays} days!`;
      const notification = await this.notificationsService.create(
        salon.ownerId,
        message,
        { link: '/dashboard' },
      );
      this.eventsGateway.sendNotificationToUser(
        salon.ownerId,
        'newNotification',
        notification,
      );
    } catch {
      // Notification is best-effort
    }

    return updated;
  }

  async unfeatureSalon(salonId: string, adminId?: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: { name: true, ownerId: true },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data: { featuredUntil: null },
    });

    // Log admin action
    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SALON_UNFEATURED',
        targetType: 'SALON',
        targetId: salonId,
      });
    }

    return updated;
  }
}
