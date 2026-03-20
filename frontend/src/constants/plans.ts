export type PlanCode = 'FREE' | 'PREMIUM';

// Legacy plan codes for existing users (not available for new signups)
export type LegacyPlanCode = 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';
export type AllPlanCodes = PlanCode | LegacyPlanCode;

export interface PlanFeature {
  name: string;
  value: string | boolean;
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

export const SALON_LISTING_PLAN_CODE: PlanCode = 'PREMIUM';
export const SALON_LISTING_PRICE_CENTS = 29900;
export const SALON_LISTING_PRICE = 'R299';
export const SALON_LISTING_MONTHLY_PRICE = `${SALON_LISTING_PRICE}/month`;

// Single salon listing plan details for the public pricing page.
export const PLAN_FEATURES: PlanFeature[] = [
  { name: 'Monthly listing fee', value: SALON_LISTING_MONTHLY_PRICE },
  { name: 'Service listings', value: 'Unlimited' },
  { name: 'Gallery images', value: 'Unlimited' },
  { name: 'Short video uploads', value: true },
  { name: 'Before & after gallery', value: true },
  { name: 'Search visibility', value: '5x boosted' },
  { name: 'Featured profile badge', value: true },
  { name: 'WhatsApp bookings', value: true },
  { name: 'Commission on bookings', value: '0%' },
  { name: 'Support', value: 'Priority' },
];

// Active plans available for new signups
export const APP_PLANS: AppPlan[] = [
  {
    code: 'PREMIUM',
    name: 'Service Listing Plan',
    price: SALON_LISTING_PRICE,
    priceCents: SALON_LISTING_PRICE_CENTS,
    maxListings: 'Unlimited',
    visibilityWeight: 5,
    description: 'List your services, upload images, and receive WhatsApp bookings with 0% commission.',
    features: [
      'Unlimited service listings',
      'Unlimited gallery images',
      'Short video uploads',
      'Before and after gallery',
      '5x visibility boost',
      'Featured salon badge',
      'WhatsApp booking handoff',
      '0% commission on bookings',
      'Priority support',
    ],
    popular: true,
  },
];

// Legacy plans remain available only for displaying grandfathered records.
export const LEGACY_PLANS: AppPlan[] = [
  {
    code: 'FREE',
    name: 'Legacy Free',
    price: 'R0',
    priceCents: 0,
    maxListings: 'Unlimited',
    visibilityWeight: 1,
    description: 'Grandfathered salon plan. No longer offered to new service providers.',
    features: [
      'Grandfathered legacy salon plan',
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

// Default salon plan for new service-provider signups
export const DEFAULT_PLAN: PlanCode = SALON_LISTING_PLAN_CODE;
