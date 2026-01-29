export type PlanCode = 'FREE' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';

// Legacy plan codes for existing users (not available for new signups)
export type LegacyPlanCode = 'STARTER';
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

// Active plans available for new signups
export const APP_PLANS: AppPlan[] = [
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
  },
  {
    code: 'ESSENTIAL',
    name: 'Essential',
    price: 'R99',
    originalPrice: 'R149',
    priceCents: 9900,
    maxListings: 'Unlimited',
    visibilityWeight: 3,
    description: 'Boost your visibility and get more clients with priority placement.',
    features: [
      'Unlimited service listings',
      'Unlimited gallery images',
      'Priority search ranking',
      '3x visibility boost',
      'Featured salon badge',
      'Advanced analytics',
      'Priority support',
      'No commission on bookings',
    ],
  },
  {
    code: 'GROWTH',
    name: 'Growth',
    price: 'R199',
    originalPrice: 'R299',
    priceCents: 19900,
    maxListings: 'Unlimited',
    visibilityWeight: 5,
    description: 'Maximize visibility and grow your business faster with premium features.',
    features: [
      'Everything in Essential',
      'Premium search ranking',
      '5x visibility boost',
      'Highlighted in search results',
      'Premium salon badge',
      'Booking insights & trends',
      'Dedicated account manager',
      'No commission on bookings',
    ],
    popular: true,
  },
  {
    code: 'PRO',
    name: 'Pro',
    price: 'R299',
    originalPrice: 'R399',
    priceCents: 29900,
    maxListings: 'Unlimited',
    visibilityWeight: 7,
    description: 'Professional tools and maximum exposure for established businesses.',
    features: [
      'Everything in Growth',
      'Top search placement',
      '7x visibility boost',
      'Featured on homepage',
      'Pro salon badge',
      'Advanced marketing tools',
      'Custom branding options',
      'No commission on bookings',
    ],
  },
  {
    code: 'ELITE',
    name: 'Elite',
    price: 'R499',
    originalPrice: 'R699',
    priceCents: 49900,
    maxListings: 'Unlimited',
    visibilityWeight: 10,
    description: 'Ultimate package for market leaders. Maximum visibility and premium support.',
    features: [
      'Everything in Pro',
      'Guaranteed top placement',
      '10x visibility boost',
      'Featured in all promotions',
      'Elite salon badge',
      'White-glove support',
      'API access for integrations',
      'No commission on bookings',
    ],
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
    description: 'Legacy starter plan - grandfathered',
    features: ['10 service listings', 'Gallery up to 20 images', 'Email support'],
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
