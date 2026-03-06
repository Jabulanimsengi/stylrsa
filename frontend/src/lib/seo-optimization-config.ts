/**
 * SEO Optimization Configuration
 * Centralized configuration for SEO-related patterns and settings
 * Based on Google Search Console data analysis
 */

/**
 * Keyword patterns that trigger specific meta title/description formats
 * These patterns showed the highest CTR in Search Console data
 */
export const HIGH_CTR_KEYWORD_PATTERNS = {
    // Walk-in patterns (27% CTR in small towns)
    walkIn: {
        slugPatterns: ['walk-in', 'walkin', 'walk-ins'],
        titleFormat: 'Walk-In {service} {city} - No Booking Needed',
        descriptionFormat: 'Walk-in {service} in {city} - no booking required! {count} salons accepting walk-ins today. See wait times & book now.',
        avgCtr: 0.27,
    },

    // 24-hour / late night patterns (10-23% CTR)
    twentyFourHour: {
        slugPatterns: ['24-hour', '24hour', 'late-night', 'late'],
        titleFormat: '24-Hour {service} {city} - Open Now',
        descriptionFormat: '{service} open 24/7 in {city}. Late night & weekend appointments available. {count} verified pros. Book now!',
        avgCtr: 0.15,
    },

    // Mobile service patterns (20-40% CTR)
    mobile: {
        slugPatterns: ['mobile'],
        titleFormat: 'Mobile {service} {city} - We Come to You',
        descriptionFormat: 'Mobile {service} in {city} - we come to you! {count} verified pros, {price}. Book your home appointment online!',
        avgCtr: 0.30,
    },

    // Pricing patterns (15-30% CTR)
    pricing: {
        slugPatterns: ['price', 'prices', 'affordable', 'cheap', 'budget'],
        titleFormat: '{service} Prices {city} - From R150',
        descriptionFormat: 'Compare {service} prices in {city} {price}. {count} affordable options with real reviews. Find the best value!',
        avgCtr: 0.22,
    },

    // Top 10 / best patterns (high impressions, needs improvement)
    top10: {
        slugPatterns: ['top-10', 'top10', 'best'],
        titleFormat: 'Top 10 {service} {city} ({month} {year})',
        descriptionFormat: 'Top 10 {service} in {city} ranked by reviews. {count} verified pros, prices {price}. Compare ratings & book online!',
        avgCtr: 0.05, // Current CTR - needs improvement
    },
};

/**
 * Power words that improve CTR in meta titles
 */
export const POWER_WORDS = {
    urgency: ['Now', 'Today', 'Instant', 'Same-Day', 'Quick'],
    trust: ['Verified', 'Trusted', 'Top-Rated', 'Reviewed'],
    value: ['Affordable', 'Best Value', 'Compare', 'Save'],
    action: ['Book', 'Find', 'Discover', 'Get', 'Browse'],
    social: ['10K+ Customers', 'Local Pros', 'Real Reviews'],
};

/**
 * Keywords that should always show price information
 * These have high price-sensitivity search intent
 */
export const PRICE_SENSITIVE_KEYWORDS = [
    'price',
    'prices',
    'affordable',
    'cheap',
    'budget',
    'cost',
    'how much',
];

/**
 * Keywords that indicate time-sensitive searches
 * These should emphasize availability and instant booking
 */
export const TIME_SENSITIVE_KEYWORDS = [
    'now',
    'today',
    'same-day',
    'walk-in',
    'near me',
    'open',
    '24-hour',
    'emergency',
    'urgent',
];

/**
 * Meta title character limits
 */
export const META_TITLE_LIMITS = {
    optimal: 60,
    max: 70,
    min: 30,
};

/**
 * Meta description character limits
 */
export const META_DESCRIPTION_LIMITS = {
    optimal: 155,
    max: 160,
    min: 100,
};

/**
 * Priority cities based on Search Console impressions
 * These should have the most optimized meta tags
 */
export const PRIORITY_CITIES = [
    { name: 'Pretoria', province: 'Gauteng', impressions: 997 },
    { name: 'Sandton', province: 'Gauteng', impressions: 832 },
    { name: 'Randburg', province: 'Gauteng', impressions: 798 },
    { name: 'Johannesburg', province: 'Gauteng', impressions: 687 },
    { name: 'Centurion', province: 'Gauteng', impressions: 454 },
    { name: 'Kempton Park', province: 'Gauteng', impressions: 432 },
    { name: 'Cape Town', province: 'Western Cape', impressions: 356 },
];

/**
 * High-performing page types to expand
 * Based on CTR analysis from Search Console
 */
export const HIGH_PERFORMING_PAGE_TYPES = [
    { pattern: 'hair-salon-walk-ins-welcome', avgCtr: 0.15, recommendation: 'Expand to all cities' },
    { pattern: 'mobile-nail-service-near-me', avgCtr: 0.30, recommendation: 'High demand - scale aggressively' },
    { pattern: 'nail-salon-prices-near-me', avgCtr: 0.22, recommendation: 'Price-focused searches convert well' },
    { pattern: '24-hour-massage-near-me', avgCtr: 0.15, recommendation: 'Late-night segment has high intent' },
    { pattern: 'thai-massage-near-me', avgCtr: 0.08, recommendation: 'Specific style searches work well' },
];

/**
 * Underperforming page types that need improvement
 */
export const UNDERPERFORMING_PAGE_TYPES = [
    { pattern: 'services/massage-body-treatments', avgCtr: 0.004, issue: 'Too generic' },
    { pattern: 'services/aesthetics-advanced-skin', avgCtr: 0.02, issue: 'Position very low' },
    { pattern: 'salons/location', avgCtr: 0.004, issue: 'No specific service' },
];
