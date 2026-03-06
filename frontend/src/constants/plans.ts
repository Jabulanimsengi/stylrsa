export type PlanCode = 'FREE' | 'PREMIUM';

// Legacy plan codes for existing users (not available for new signups)
export type LegacyPlanCode = 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';
export type AllPlanCodes = PlanCode | LegacyPlanCode;

export interface PlanFeature {
  name: string;
  free: string | boolean;
  premium: string | boolean;
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

// Commission breakdown (32% total on FREE plan)
export const COMMISSION_RATES = {
  TOTAL: 0.32,        // 32% total commission
  PLATFORM: 0.25,     // 25% platform fee
  CASHBACK: 0.05,     // 5% client cashback
  PAYMENT: 0.02,      // 2% payment processing
};

// Feature comparison for pricing table
export const PLAN_FEATURES: PlanFeature[] = [
  { name: 'Listing Fee', free: 'FREE', premium: 'R399/month' },
  { name: 'Service Listings', free: 'Unlimited', premium: 'Unlimited' },
  { name: 'Gallery Images', free: 'Unlimited', premium: 'Unlimited' },
  { name: 'Short Video Uploads', free: true, premium: true },
  { name: 'Before & After Gallery', free: true, premium: true },
  { name: 'Analytics Dashboard', free: 'Basic', premium: 'Advanced' },
  { name: 'Search Visibility', free: 'Standard', premium: '5x Boosted' },
  { name: 'Team Member Profiles', free: 'Unlimited', premium: 'Unlimited' },
  { name: 'Job Posting Board', free: true, premium: true },
  { name: 'Support', free: 'Email', premium: 'Priority' },
  { name: 'Commission on Bookings', free: '32%', premium: '0%' },
  { name: 'Featured Salon Badge', free: false, premium: true },
  { name: 'Priority Search Ranking', free: false, premium: true },
];

// Active plans available for new signups
export const APP_PLANS: AppPlan[] = [
  {
    code: 'PREMIUM',
    name: 'Premium',
    price: 'R399',
    priceCents: 39900,
    maxListings: 'Unlimited',
    visibilityWeight: 5,
    description: 'Maximum visibility and zero commission. Grow your business without limits.',
    features: [
      'Unlimited service listings',
      'Unlimited gallery images',
      'Unlimited treatments listed',
      'Priority search ranking',
      '5x visibility boost',
      'Featured salon badge',
      'Advanced analytics & insights',
      'Prioritised support',
      'No commission on bookings (0%)',
    ],
    popular: true,
  },
];

// Legacy plans for existing users only (grandfathered)
export const LEGACY_PLANS: AppPlan[] = [
  {
    code: 'FREE',
    name: 'Free',
    price: 'R0',
    priceCents: 0,
    maxListings: 'Unlimited',
    visibilityWeight: 1,
    description: 'Perfect for getting started. List your services for free with commission-based earnings.',
    features: [
      '100% FREE to list',
      'Unlimited service listings',
      'Unlimited gallery images',
      'Video uploads & before/after gallery',
      'Basic analytics dashboard',
      'Standard search visibility',
      'Unlimited team profiles',
      'Job posting access',
      '32% commission on completed bookings',
    ],
    isLegacy: true,
  },
  {
    code: 'STARTER',
    name: 'Starter (Legacy)',
    price: 'R99/month',
    priceCents: 9900,
    maxListings: 10,
    visibilityWeight: 2,
    description: 'Legacy starter plan - grandfathered',
    features: ['10 service listings', 'Gallery up to 20 images', 'Email support'],
    isLegacy: true,
  },
  {
    code: 'ESSENTIAL',
    name: 'Essential (Legacy)',
    price: 'R99/month',
    priceCents: 9900,
    maxListings: 'Unlimited',
    visibilityWeight: 3,
    description: 'Legacy essential plan - grandfathered',
    features: ['Unlimited listings', '3x visibility', 'No commission'],
    isLegacy: true,
  },
  {
    code: 'GROWTH',
    name: 'Growth (Legacy)',
    price: 'R199/month',
    priceCents: 19900,
    maxListings: 'Unlimited',
    visibilityWeight: 5,
    description: 'Legacy growth plan - grandfathered',
    features: ['Unlimited listings', '5x visibility', 'No commission'],
    isLegacy: true,
  },
  {
    code: 'PRO',
    name: 'Pro (Legacy)',
    price: 'R299/month',
    priceCents: 29900,
    maxListings: 'Unlimited',
    visibilityWeight: 7,
    description: 'Legacy pro plan - grandfathered',
    features: ['Unlimited listings', '7x visibility', 'No commission'],
    isLegacy: true,
  },
  {
    code: 'ELITE',
    name: 'Elite (Legacy)',
    price: 'R499/month',
    priceCents: 49900,
    maxListings: 'Unlimited',
    visibilityWeight: 10,
    description: 'Legacy elite plan - grandfathered',
    features: ['Unlimited listings', '10x visibility', 'No commission'],
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
export const DEFAULT_PLAN: PlanCode = 'PREMIUM';
