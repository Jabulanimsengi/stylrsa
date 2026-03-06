import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSellerPlanDto } from './dto/update-seller-plan.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

type PlanCode = 'FREE' | 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE' | 'PREMIUM';
type PlanPaymentStatus =
  | 'PENDING_SELECTION'
  | 'AWAITING_PROOF'
  | 'PROOF_SUBMITTED'
  | 'VERIFIED';

// Aligned with main plan prices (promotional pricing)
const PLAN_FALLBACKS: Record<
  PlanCode,
  { visibilityWeight: number; maxListings: number; priceCents: number }
> = {
  FREE: { visibilityWeight: 0, maxListings: 1, priceCents: 0 },
  STARTER: { visibilityWeight: 2, maxListings: 10, priceCents: 9900 },  // R99/month
  PRO: { visibilityWeight: 3, maxListings: 25, priceCents: 19900 },     // R199/month
  ELITE: { visibilityWeight: 5, maxListings: 9999, priceCents: 29900 }, // R299/month
  ESSENTIAL: { visibilityWeight: 2, maxListings: 7, priceCents: 9900 },
  GROWTH: { visibilityWeight: 3, maxListings: 15, priceCents: 19900 },
  PREMIUM: { visibilityWeight: 5, maxListings: 9999, priceCents: 39900 },
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) { }

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
      if (plan) return plan;
    } catch {
      // swallow and fall back
    }
    return PLAN_FALLBACKS[planCode];
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        profileImage: true,
        // Seller plan fields
        sellerPlanCode: true,
        sellerPlanPriceCents: true,
        sellerPlanPaymentStatus: true,
        sellerPlanPaymentReference: true,
        sellerPlanProofSubmittedAt: true,
        sellerPlanVerifiedAt: true,
        sellerVisibilityWeight: true,
        sellerMaxListings: true,
        // Seller profile fields
        sellerWhatsapp: true,
        sellerWebsite: true,
        sellerBankName: true,
        sellerBankAccountHolder: true,
        sellerBankAccountNumber: true,
        sellerBankBranchCode: true,
        sellerBankAccountType: true,
        sellerPaymentNote: true,
        // Seller business profile fields
        sellerBusinessName: true,
        sellerContactPerson: true,
        sellerContactPhone: true,
        sellerContactEmail: true,
        sellerPhysicalAddress: true,
        sellerProvincesServed: true,
        sellerApprovalStatus: true,
        sellerProfileSubmittedAt: true,
        sellerApprovedAt: true,
      },
    });
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });
    const { password, ...result } = user;
    return result;
  }

  async updateSellerPlan(userId: string, dto: UpdateSellerPlanDto) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        sellerPlanCode: true,
        sellerPlanPaymentStatus: true,
        sellerPlanPaymentReference: true,
        sellerPlanProofSubmittedAt: true,
        sellerPlanVerifiedAt: true,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    if (seller.role !== 'PRODUCT_SELLER') {
      throw new ForbiddenException('Only product sellers can select a package');
    }

    const planCode = (dto.planCode as string).toUpperCase() as PlanCode;
    if (!PLAN_FALLBACKS[planCode]) {
      throw new ForbiddenException('Invalid package selection.');
    }

    const planMeta = await this.resolvePlanMeta(planCode);
    const currentStatus = (seller.sellerPlanPaymentStatus ??
      'PENDING_SELECTION') as PlanPaymentStatus;
    const planChanged = planCode !== (seller.sellerPlanCode as PlanCode | null);

    let nextStatus: PlanPaymentStatus = currentStatus;
    if (planCode === 'FREE') {
      nextStatus = 'VERIFIED';
    }
    if (planChanged) {
      nextStatus = planCode === 'FREE' ? 'VERIFIED' : dto.hasSentProof ? 'PROOF_SUBMITTED' : 'AWAITING_PROOF';
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
    } else if (currentStatus === 'PENDING_SELECTION' && !planChanged) {
      nextStatus = 'AWAITING_PROOF';
    }

    if (!planChanged && currentStatus === 'VERIFIED') {
      nextStatus = 'VERIFIED';
    }

    const paymentReferenceRaw = dto.paymentReference;
    const defaultRef =
      `${seller.firstName} ${seller.lastName}`.trim() || 'Product Seller';
    const paymentReference =
      typeof paymentReferenceRaw === 'string' &&
        paymentReferenceRaw.trim().length > 0
        ? paymentReferenceRaw.trim()
        : defaultRef;

    const data: any = {
      sellerPlanCode: planCode,
      sellerVisibilityWeight: planMeta.visibilityWeight,
      sellerMaxListings: planMeta.maxListings,
      sellerPlanPriceCents: planMeta.priceCents,
      sellerPlanPaymentStatus: nextStatus,
      sellerPlanPaymentReference: paymentReference,
    };

    if (nextStatus === 'VERIFIED') {
      data.sellerPlanProofSubmittedAt = null;
      data.sellerPlanVerifiedAt = new Date();
    } else if (nextStatus === 'PROOF_SUBMITTED') {
      data.sellerPlanProofSubmittedAt =
        seller.sellerPlanProofSubmittedAt ?? new Date();
      data.sellerPlanVerifiedAt = null;
    } else if (
      nextStatus === 'AWAITING_PROOF' ||
      nextStatus === 'PENDING_SELECTION'
    ) {
      data.sellerPlanProofSubmittedAt = null;
      data.sellerPlanVerifiedAt = null;
    }

    if (planChanged) {
      data.sellerPlanVerifiedAt = null;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    const { password, ...result } = updated;
    return result;
  }

  async submitSellerProfile(userId: string) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        sellerBusinessName: true,
        sellerContactPerson: true,
        sellerContactPhone: true,
        sellerPhysicalAddress: true,
        sellerProvincesServed: true,
        sellerApprovalStatus: true,
      },
    });

    if (!seller) {
      throw new NotFoundException('User not found');
    }
    if (seller.role !== 'PRODUCT_SELLER') {
      throw new ForbiddenException('Only product sellers can submit a seller profile');
    }

    // Validate required fields
    if (!seller.sellerBusinessName?.trim()) {
      throw new ForbiddenException('Business name is required');
    }
    if (!seller.sellerContactPerson?.trim()) {
      throw new ForbiddenException('Contact person name is required');
    }
    if (!seller.sellerContactPhone?.trim()) {
      throw new ForbiddenException('Contact phone is required');
    }
    if (!seller.sellerPhysicalAddress?.trim()) {
      throw new ForbiddenException('Physical address is required');
    }
    if (!seller.sellerProvincesServed?.length) {
      throw new ForbiddenException('Please select at least one province you serve');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        sellerApprovalStatus: 'PENDING',
        sellerProfileSubmittedAt: new Date(),
        sellerApprovedAt: null, // Reset if re-submitting
      },
    });

    // Notify all admins about the new seller profile submission
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      const businessName = seller.sellerBusinessName || 'Unknown Business';
      const message = `📋 New seller profile submitted: "${businessName}" is waiting for approval.`;

      for (const admin of admins) {
        const notification = await this.notificationsService.create(
          admin.id,
          message,
          { link: '/admin?tab=sellers' },
        );
        this.eventsGateway.sendNotificationToUser(
          admin.id,
          'newNotification',
          notification,
        );
      }
    } catch (error) {
      // Notification is best-effort, don't fail the submission
      console.error('Failed to notify admins about seller profile:', error);
    }

    const { password, ...result } = updated;
    return result;
  }

  async saveDraftSellerProfile(userId: string, dto: UpdateUserDto) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!seller) {
      throw new NotFoundException('User not found');
    }
    if (seller.role !== 'PRODUCT_SELLER') {
      throw new ForbiddenException('Only product sellers can update seller profile');
    }

    // Only allow updating seller business profile fields (not approval status)
    const allowedFields = [
      'sellerBusinessName',
      'sellerContactPerson',
      'sellerContactPhone',
      'sellerContactEmail',
      'sellerPhysicalAddress',
      'sellerProvincesServed',
      'sellerWhatsapp',
      'sellerWebsite',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (dto[field] !== undefined) {
        updateData[field] = dto[field];
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { password, ...result } = updated;
    return result;
  }
}
