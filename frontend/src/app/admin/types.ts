// Admin-specific types

import type {
    Salon,
    Service,
    Review,
    Product,
    PlanCode,
    PlanPaymentStatus,
    SellerSummary,
    ApprovalStatus,
} from '@/types';

export type PendingSalon = Pick<Salon, 'id' | 'name' | 'approvalStatus' | 'createdAt' | 'city' | 'province' | 'isVerified'> & {
    owner: { id: string; email: string; firstName: string; lastName: string };
    visibilityWeight?: number;
    maxListings?: number;
    featuredUntil?: string | null;
    planCode?: PlanCode | null;
    planPriceCents?: number | null;
    planPaymentStatus?: PlanPaymentStatus | null;
    planPaymentReference?: string | null;
    planProofSubmittedAt?: string | null;
    planVerifiedAt?: string | null;
};

export type PendingService = Service & { salon: { name: string } };

export type PendingReview = Review & {
    author: { firstName: string };
    salon: { name: string }
};

export type PendingProduct = Product & {
    seller: {
        id: string;
        firstName: string;
        lastName: string;
        sellerPlanCode?: PlanCode | null;
        sellerPlanPriceCents?: number | null;
        sellerPlanPaymentStatus?: PlanPaymentStatus | null;
        sellerPlanPaymentReference?: string | null;
        sellerPlanProofSubmittedAt?: string | null;
        sellerPlanVerifiedAt?: string | null;
    };
};

export type SellerRow = SellerSummary & {
    sellerPlanPaymentStatus?: PlanPaymentStatus | null;
};

export type SellerDeletionTarget = {
    sellerId: string;
    name: string;
};

export type Top10RequestStatus =
    | 'PENDING'
    | 'CONTACTED'
    | 'MATCHED'
    | 'COMPLETED'
    | 'CANCELLED';

export type Top10RequestRow = {
    id: string;
    fullName: string;
    category: string;
    serviceNeeded: string;
    budget: number;
    serviceType: 'onsite' | 'in_salon' | string;
    location: string;
    preferredDate?: string | null;
    preferredTime?: string | null;
    phone: string;
    whatsapp?: string | null;
    email?: string | null;
    styleOrLook?: string | null;
    createdAt: string;
    status: Top10RequestStatus;
};

export type AdminAuditLog = {
    id: string;
    action: string;
    targetType: string;
    targetId: string;
    reason?: string | null;
    createdAt: string;
};

export type PendingPromotionRow = {
    id: string;
    originalPrice: number;
    promotionalPrice: number;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    service?: {
        title?: string | null;
        salon?: {
            name?: string | null;
        } | null;
    } | null;
    product?: {
        name?: string | null;
        seller?: {
            firstName?: string | null;
            lastName?: string | null;
        } | null;
    } | null;
};

export type DeletedSellerArchiveRow = {
    id: string;
    deletedAt?: string | null;
    reason?: string | null;
    seller?: {
        firstName?: string | null;
        lastName?: string | null;
    } | null;
};

export type DeletedSalonArchiveRow = {
    id: string;
    deletedAt?: string | null;
    reason?: string | null;
    salon?: {
        name?: string | null;
    } | null;
};

export const PLAN_PAYMENT_LABELS: Record<PlanPaymentStatus, string> = {
    PENDING_SELECTION: 'Package not selected',
    AWAITING_PROOF: 'Awaiting proof of payment',
    PROOF_SUBMITTED: 'Proof submitted',
    VERIFIED: 'Payment verified',
};

export const formatRand = (value: number) => `R${(value / 100).toFixed(2)}`;

export const ensureArray = <T,>(value: unknown): T[] =>
    Array.isArray(value) ? (value as T[]) : [];

// Re-export commonly used types
export type { ApprovalStatus, PlanCode, PlanPaymentStatus };
