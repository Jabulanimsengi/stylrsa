import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { EventsGateway } from 'src/events/events.gateway';
import { WhatsAppService } from 'src/notifications/whatsapp.service';
import { generateSalonSlug } from 'src/common/slug.util';

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type PlanPaymentStatus =
  | 'PENDING_SELECTION'
  | 'AWAITING_PROOF'
  | 'PROOF_SUBMITTED'
  | 'VERIFIED';
type SalonApplicationStatus =
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'REJECTED';

type AdminBookingRow = {
  id: string;
  sourceType: 'ACCOUNT_BOOKING' | 'WHATSAPP_INTENT';
  createdAt: Date;
  bookingTime: Date;
  salonName: string;
  serviceName: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  status: string;
  totalCost: number;
  depositAmount: number;
  whatsappClicks: number | null;
  whatsappSentAt: Date | null;
  notes: string | null;
};

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
    private whatsAppService: WhatsAppService,
  ) { }

  private async generateApplicationSalonSlug(
    salonName: string,
    city: string,
  ): Promise<string> {
    const baseSlug = generateSalonSlug(salonName, city);
    const existing = await this.prisma.salon.findUnique({
      where: { slug: baseSlug },
      select: { id: true },
    });

    if (!existing) {
      return baseSlug;
    }

    let suffix = 2;
    while (true) {
      const candidate = `${baseSlug}-${suffix}`;
      const candidateExists = await this.prisma.salon.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!candidateExists) {
        return candidate;
      }
      suffix += 1;
    }
  }

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
      // Fall through to raw SQL.
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
      // No-op if the fallback path is unavailable too.
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
        city: true,
        province: true,
        isVerified: true,
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

  async getSalonApplications() {
    return this.prisma.salonApplication.findMany({
      where: {
        status: {
          in: ['SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED'],
        },
      },
      orderBy: { createdAt: 'desc' },
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
        city: true,
        province: true,
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
      select: { id: true },
    });

    if (!current) {
      throw new NotFoundException('Salon not found');
    }

    if (status === 'APPROVED') {
      const approvedServiceCount = await this.prisma.service.count({
        where: {
          salonId,
          approvalStatus: 'APPROVED',
        },
      });

      if (approvedServiceCount < 2) {
        throw new ForbiddenException(
          'A salon needs at least 2 approved services before it can go live.',
        );
      }
    }

    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data: { approvalStatus: status },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
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

      if (status === 'APPROVED') {
        void this.whatsAppService.sendSalonApprovalMessage({
          phoneNumber: updated.whatsapp ?? updated.owner.phoneNumber ?? null,
          ownerName: updated.owner.firstName ?? null,
          salonName: updated.name,
        });
      }
    }

    return updated;
  }

  async updateSalonApplicationStatus(
    applicationId: string,
    status: SalonApplicationStatus,
    adminId?: string,
    adminNotes?: string,
  ) {
    const updated = await this.prisma.salonApplication.update({
      where: { id: applicationId },
      data: {
        status,
        adminNotes: adminNotes?.trim() || null,
        reviewedAt: new Date(),
      },
    });

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SALON_APPLICATION_STATUS_UPDATE',
        targetType: 'SALON_APPLICATION',
        targetId: applicationId,
        metadata: {
          status,
          adminNotes: adminNotes?.trim() || null,
        },
      });
    }

    return updated;
  }

  async publishSalonApplication(applicationId: string, adminId?: string) {
    const application = await this.prisma.salonApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Salon application not found');
    }

    if (application.status === 'PUBLISHED' && application.publishedSalonId) {
      return this.prisma.salon.findUnique({
        where: { id: application.publishedSalonId },
      });
    }

    const slug = await this.generateApplicationSalonSlug(
      application.salonName,
      application.city,
    );
    const generatedPassword = randomBytes(24).toString('hex');
    const passwordHash = await argon2.hash(generatedPassword);
    const [firstName, ...rest] = application.contactPersonName.trim().split(' ');
    const lastName = rest.join(' ') || 'Owner';

    const salon = await this.prisma.$transaction(async (tx) => {
      const placeholderOwner = await tx.user.create({
        data: {
          email: `salon-${application.id}@placeholder.stylrsa.local`,
          password: passwordHash,
          firstName: firstName || 'Salon',
          lastName,
          role: 'SALON_OWNER',
          onboardingStatus: 'COMPLETE',
          phoneNumber: application.whatsappNumber ?? application.phoneNumber,
          emailVerified: true,
        },
      });

      const createdSalon = await tx.salon.create({
        data: {
          ownerId: placeholderOwner.id,
          name: application.salonName,
          slug,
          description: application.description ?? null,
          province: application.province,
          city: application.city,
          town: application.town,
          address: application.address,
          latitude: application.latitude ?? null,
          longitude: application.longitude ?? null,
          contactEmail: application.email,
          phoneNumber: application.phoneNumber,
          whatsapp: application.whatsappNumber ?? application.phoneNumber,
          website: application.website ?? null,
          facebookUrl: application.facebookUrl ?? null,
          instagramUrl: application.instagramUrl ?? null,
          tiktokUrl: application.tiktokUrl ?? null,
          googleReviewsUrl: application.googleReviewsUrl ?? null,
          freshaReviewsUrl: application.freshaReviewsUrl ?? null,
          booksyReviewsUrl: application.booksyReviewsUrl ?? null,
          bookingType: application.bookingType,
          offersMobile: application.offersMobile,
          mobileFee: application.mobileFee ?? null,
          operatingHours: application.operatingHours ?? [],
          operatingDays: application.operatingDays,
          bankName: application.bankName,
          accountHolder: application.accountHolder,
          accountNumber: application.accountNumber,
          branchCode: application.branchCode ?? null,
          heroImages: application.portfolioImageUrls ?? [],
          approvalStatus: 'APPROVED',
          isVerified: true,
          planCode: 'PREMIUM',
          visibilityWeight: 5,
          maxListings: 9999,
          planPriceCents: 29900,
          planPaymentStatus: 'VERIFIED',
          planVerifiedAt: new Date(),
          commissionRate: 0,
        },
      });

      await tx.salonApplication.update({
        where: { id: applicationId },
        data: {
          status: 'PUBLISHED',
          reviewedAt: new Date(),
          publishedSalonId: createdSalon.id,
        },
      });

      return createdSalon;
    });

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SALON_APPLICATION_PUBLISHED',
        targetType: 'SALON_APPLICATION',
        targetId: applicationId,
        metadata: {
          publishedSalonId: salon.id,
        },
      });
    }

    return salon;
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
        owner: { select: { id: true } },
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

  async setSalonPlan(
    salonId: string,
    _planCode: string,
    overrides?: {
      visibilityWeight?: number;
      maxListings?: number;
    },
  ) {
    const FALLBACK = {
      visibilityWeight: 5,
      maxListings: 9999,
      priceCents: 29900,
    };

    let plan: {
      visibilityWeight?: number | null;
      maxListings?: number | null;
      priceCents?: number | null;
    } | null = null;

    try {
      plan = await (this.prisma as any).plan.findUnique({
        where: { code: 'PREMIUM' },
      });
    } catch {
      plan = null;
    }

    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data: {
        visibilityWeight:
          overrides?.visibilityWeight ??
          plan?.visibilityWeight ??
          FALLBACK.visibilityWeight,
        maxListings:
          overrides?.maxListings ?? plan?.maxListings ?? FALLBACK.maxListings,
        planCode: 'PREMIUM',
        planPriceCents: plan?.priceCents ?? FALLBACK.priceCents,
      },
    });

    try {
      this.eventsGateway.server.emit('visibility:updated', {
        entity: 'salon',
        id: salonId,
      });
    } catch {
      // Websocket refresh is best-effort.
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
        planProofSubmittedAt: true,
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
      data.commissionRate = 0.0;
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

  async deleteSalonWithCascade(
    salonId: string,
    adminId: string,
    reason?: string,
  ) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: { id: true, name: true, ownerId: true },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

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
          facebookUrl: true,
          instagramUrl: true,
          tiktokUrl: true,
          googleReviewsUrl: true,
          freshaReviewsUrl: true,
          booksyReviewsUrl: true,
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
        try {
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
          // Fall back to raw SQL below.
        }

        if (!archived) {
          try {
            const exists = (
              await (this.prisma as any).$queryRaw<{ exists: boolean }[]>`
                SELECT to_regclass('"DeletedSalonArchive"') IS NOT NULL as exists
              `
            )[0]?.exists;
            if (exists) {
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
            }
          } catch {
            // Archival is best-effort.
          }
        }
      }
    } catch {
      // Archival is best-effort.
    }

    await (this.prisma as any).$transaction(async (tx: any) => {
      const services = await tx.service.findMany({
        where: { salonId },
        select: { id: true },
      });
      const serviceIds = services.map((service: { id: string }) => service.id);

      if (serviceIds.length > 0) {
        await tx.promotion.deleteMany({
          where: { serviceId: { in: serviceIds } },
        });
        await tx.serviceLike.deleteMany({
          where: { serviceId: { in: serviceIds } },
        });
      }

      await tx.favorite.deleteMany({ where: { salonId } });
      await tx.galleryImage.deleteMany({ where: { salonId } });
      await tx.booking.deleteMany({ where: { salonId } });
      await tx.service.deleteMany({ where: { salonId } });
      await tx.salon.delete({ where: { id: salonId } });
    });

    try {
      const message =
        `Your salon "${salon.name}" has been removed by an administrator.` +
        (reason?.trim() ? ` Reason: ${reason.trim()}` : '');
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
      // Notification is best-effort.
    }

    try {
      this.eventsGateway.server.emit('salon:deleted', {
        id: salonId,
        by: adminId,
      });
    } catch {
      // No-op.
    }

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
    try {
      const rows = await (this.prisma as any).deletedSalonArchive?.findMany?.({
        orderBy: { deletedAt: 'desc' },
      });
      if (Array.isArray(rows)) {
        return rows;
      }
    } catch {
      // Fall through to raw SQL.
    }

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
    let archive: Record<string, any> | null = null;

    try {
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

    if (!archive) {
      throw new NotFoundException('Archived profile not found');
    }

    const salonId: string = archive.salonId as string;
    const ownerId: string = archive.ownerId as string;
    const salonData: any = archive.salon ?? {};
    const servicesData: any[] = Array.isArray(archive.services)
      ? archive.services
      : [];

    const existing = await this.prisma.salon.findFirst({
      where: { OR: [{ id: salonId }, { ownerId }] },
    });

    if (existing) {
      throw new NotFoundException(
        'Cannot restore: owner already has a salon or id is taken',
      );
    }

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
        facebookUrl: salonData.facebookUrl ?? null,
        instagramUrl: salonData.instagramUrl ?? null,
        tiktokUrl: salonData.tiktokUrl ?? null,
        googleReviewsUrl: salonData.googleReviewsUrl ?? null,
        freshaReviewsUrl: salonData.freshaReviewsUrl ?? null,
        booksyReviewsUrl: salonData.booksyReviewsUrl ?? null,
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
        planCode: salonData.planCode ?? 'PREMIUM',
        visibilityWeight:
          typeof salonData.visibilityWeight === 'number'
            ? salonData.visibilityWeight
            : 5,
        maxListings:
          typeof salonData.maxListings === 'number'
            ? salonData.maxListings
            : 9999,
        featuredUntil: salonData.featuredUntil
          ? new Date(salonData.featuredUntil)
          : null,
      },
    });

    for (const service of servicesData) {
      try {
        await this.prisma.service.create({
          data: {
            id: String(service.id),
            title: String(service.title),
            description: String(service.description ?? ''),
            price: Number(service.price ?? 0),
            duration: Number(service.duration ?? 0),
            images: Array.isArray(service.images)
              ? (service.images as string[])
              : [],
            approvalStatus: service.approvalStatus ?? 'PENDING',
            salonId: createdSalon.id,
            categoryId: (service.categoryId as string | undefined) ?? null,
          },
        });
      } catch {
        // Best-effort restore for individual services.
      }
    }

    try {
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
        // No-op.
      }
    }

    try {
      void this.logAction({
        adminId: createdSalon.ownerId,
        action: 'SALON_RESTORE',
        targetType: 'SALON',
        targetId: createdSalon.id,
      });
    } catch {
      // No-op.
    }

    return createdSalon;
  }

  private escapeCsvValue(value: string | number | null | undefined) {
    if (value === null || typeof value === 'undefined') {
      return '';
    }

    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  async getBookingsOverview(): Promise<AdminBookingRow[]> {
    const [bookings, intents, salons, services] = await Promise.all([
      this.prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          salon: {
            select: {
              name: true,
            },
          },
          service: {
            select: {
              title: true,
            },
          },
        },
      }),
      this.prisma.bookingWhatsAppIntent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      this.prisma.salon.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
      this.prisma.service.findMany({
        select: {
          id: true,
          title: true,
        },
      }),
    ]);

    const salonNameById = new Map(salons.map((salon) => [salon.id, salon.name]));
    const serviceNameById = new Map(
      services.map((service) => [service.id, service.title]),
    );

    const bookingRows: AdminBookingRow[] = bookings.map((booking) => ({
      id: booking.id,
      sourceType: 'ACCOUNT_BOOKING',
      createdAt: booking.createdAt,
      bookingTime: booking.bookingTime,
      salonName: booking.salon.name,
      serviceName: booking.service.title,
      clientName:
        [booking.user.firstName, booking.user.lastName]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Registered user',
      clientPhone: booking.clientPhone ?? null,
      clientEmail: booking.user.email ?? null,
      status: booking.status,
      totalCost: booking.totalCost ?? 0,
      depositAmount: 0,
      whatsappClicks: null,
      whatsappSentAt: null,
      notes: booking.clientNotes ?? null,
    }));

    const intentRows: AdminBookingRow[] = intents.map((intent) => ({
      id: intent.id,
      sourceType: 'WHATSAPP_INTENT',
      createdAt: intent.createdAt,
      bookingTime: intent.bookingTime,
      salonName: salonNameById.get(intent.salonId) ?? 'Unknown salon',
      serviceName: serviceNameById.get(intent.serviceId) ?? 'Unknown service',
      clientName: `${intent.clientFirstName} ${intent.clientLastName}`.trim(),
      clientPhone: intent.clientPhone ?? null,
      clientEmail: intent.clientEmail ?? null,
      status: intent.depositStatus,
      totalCost: intent.totalCost ?? 0,
      depositAmount: intent.depositAmount ?? 0,
      whatsappClicks: intent.whatsappClicks ?? 0,
      whatsappSentAt: intent.whatsappSentAt ?? null,
      notes: intent.clientNotes ?? null,
    }));

    return [...bookingRows, ...intentRows].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async exportBookingsCsv() {
    const rows = await this.getBookingsOverview();
    const header = [
      'id',
      'sourceType',
      'createdAt',
      'bookingTime',
      'salonName',
      'serviceName',
      'clientName',
      'clientPhone',
      'clientEmail',
      'status',
      'totalCost',
      'depositAmount',
      'whatsappClicks',
      'whatsappSentAt',
      'notes',
    ];

    const csvRows = rows.map((row) =>
      [
        row.id,
        row.sourceType,
        row.createdAt.toISOString(),
        row.bookingTime.toISOString(),
        row.salonName,
        row.serviceName,
        row.clientName,
        row.clientPhone,
        row.clientEmail,
        row.status,
        row.totalCost.toFixed(2),
        row.depositAmount.toFixed(2),
        row.whatsappClicks,
        row.whatsappSentAt ? row.whatsappSentAt.toISOString() : '',
        row.notes,
      ]
        .map((value) => this.escapeCsvValue(value))
        .join(','),
    );

    return `${header.join(',')}\n${csvRows.join('\n')}`;
  }

  async getMetrics() {
    const [salonsPending, servicesPending] = await Promise.all([
      this.prisma.salon.count({ where: { approvalStatus: 'PENDING' } }),
      this.prisma.service.count({ where: { approvalStatus: 'PENDING' } }),
    ]);

    const [oldestSalon, oldestService] = await Promise.all([
      this.prisma.salon.findFirst({
        where: { approvalStatus: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      this.prisma.service.findFirst({
        where: { approvalStatus: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      salonsPending,
      servicesPending,
      oldest: {
        salon: oldestSalon?.createdAt ?? null,
        service: oldestService?.createdAt ?? null,
      },
    };
  }
}
