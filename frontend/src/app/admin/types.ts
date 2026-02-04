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
