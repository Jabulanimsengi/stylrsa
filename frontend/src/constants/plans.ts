export type PlanCode = 'FREE';

// Legacy plan codes for existing users (not available for new signups)
export type LegacyPlanCode = 'FREE' | 'ESSENTIAL' | 'GROWTH' | 'STARTER' | 'PRO' | 'ELITE';
export type AllPlanCodes = PlanCode | LegacyPlanCode;

export interface PlanFeature {
  name: string;
  free: string | boolean;
}

export interface AppPlan {
  code: PlanCode | LegacyPlanCode;
  name: string;
  price: string;
  originalPrice?: string;
  specialPrice?: string;
  specialEnds?: string;
  priceCents: number;
  maxListings: number | 'Unlimited';
  visibilityWeight: number;
  description: string;
  features: string[];
  popular?: boolean;
  isLegacy?: boolean;
}

// Commission breakdown (32% total)
export const COMMISSION_RATES = {
  TOTAL: 0.32,        // 32% total commission
  PLATFORM: 0.25,     // 25% platform fee
  CASHBACK: 0.05,     // 5% client cashback
  PAYMENT: 0.02,      // 2% payment processing
};

// Feature comparison for pricing table
export const PLAN_FEATURES: PlanFeature[] = [
  { name: 'Listing Fee', free: 'FREE' },
  { name: 'Service Listings', free: 'Unlimited' },
  { name: 'Gallery Images', free: 'Unlimited' },
  { name: 'Short Video Uploads', free: true },
  { name: 'Before & After Gallery', free: true },
  { name: 'Analytics Dashboard', free: 'Full Access' },
  { name: 'Search Visibility', free: 'Equal for all' },
  { name: 'Team Member Profiles', free: 'Unlimited' },
  { name: 'Job Posting Board', free: true },
  { name: 'Support', free: 'Email & Chat' },
  { name: 'Commission on Bookings', free: '32%' },
];

// Active plans available for new signups - now just FREE
export const APP_PLANS: AppPlan[] = [
  {
    code: 'FREE',
    name: 'Free Forever',
    price: 'R0',
    priceCents: 0,
    maxListings: 'Unlimited',
    visibilityWeight: 5,
    description: 'List your services for free. We only earn when you earn through completed bookings.',
    features: [
      '100% FREE to list',
      'Unlimited service listings',
      'Unlimited gallery images',
      'Video uploads & before/after gallery',
      'Full analytics dashboard',
      'Equal search visibility',
      'Unlimited team profiles',
      'Job posting access',
      '32% commission ONLY on completed bookings',
    ],
    popular: true,
  },
];

// Legacy plans for existing users only (grandfathered)
export const LEGACY_PLANS: AppPlan[] = [
  {
    code: 'STARTER',
    name: 'Starter (Legacy)',
    price: 'R99/month',
    priceCents: 9900,
    maxListings: 10,
    visibilityWeight: 2,
    description: 'Legacy starter plan',
    features: ['10 service listings', 'Gallery up to 20 images', 'Email support'],
    isLegacy: true,
  },
  {
    code: 'PRO',
    name: 'Pro (Legacy)',
    price: 'R199/month',
    priceCents: 19900,
    maxListings: 25,
    visibilityWeight: 3,
    description: 'Legacy pro plan',
    features: ['25 listings', 'Priority visibility', 'Priority support'],
    isLegacy: true,
  },
  {
    code: 'ELITE',
    name: 'Elite (Legacy)',
    price: 'R299/month',
    priceCents: 29900,
    maxListings: 'Unlimited',
    visibilityWeight: 5,
    description: 'Legacy elite plan',
    features: ['Unlimited listings', 'Premium visibility', 'Dedicated support'],
    isLegacy: true,
  },
  {
    code: 'ESSENTIAL',
    name: 'Essential (Legacy)',
    price: 'R99/month',
    priceCents: 9900,
    maxListings: 7,
    visibilityWeight: 2,
    description: 'Legacy essential plan',
    features: ['Up to 7 listings', 'Basic visibility', 'Email support'],
    isLegacy: true,
  },
  {
    code: 'GROWTH',
    name: 'Growth (Legacy)',
    price: 'R199/month',
    priceCents: 19900,
    maxListings: 15,
    visibilityWeight: 3,
    description: 'Legacy growth plan',
    features: ['Up to 15 listings', 'Priority visibility', 'Email support'],
    isLegacy: true,
  },
];

// All plans including legacy (for displaying existing user's plan)
export const ALL_PLANS: AppPlan[] = [...APP_PLANS, ...LEGACY_PLANS];

// Lookup by code (includes legacy plans for existing users)
export const PLAN_BY_CODE: Record<AllPlanCodes, AppPlan> = ALL_PLANS.reduce(
  (acc, plan) => {
    acc[plan.code as AllPlanCodes] = plan;
    return acc;
  },
  {} as Record<AllPlanCodes, AppPlan>,
);

// Default plan for new signups
export const DEFAULT_PLAN: PlanCode = 'FREE';
