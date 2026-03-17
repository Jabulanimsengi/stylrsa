/**
 * SEO Static Generation Utilities
 * 
 * This module provides functions to generate static params for SEO pages
 * using local data (no backend API calls during build time).
 * 
 * This enables 10K+ static pages to be generated at build time for better SEO.
 * 
 * SEO_KEYWORDS is imported from seo-keywords.generated.ts which is auto-generated
 * from the database using: npx ts-node scripts/sync-keywords-to-frontend.ts
 */

import { PROVINCES, getAllCities, getCitiesByProvince } from './locationData';
import { CATEGORY_INFO } from './nearYouContent';
// Import synced keywords from database
import { SEO_KEYWORDS as DB_KEYWORDS, SEO_KEYWORDS_SET, isValidKeyword } from './seo-keywords.generated';

// Re-export the database synced keywords
export const SEO_KEYWORDS = DB_KEYWORDS;
export { SEO_KEYWORDS_SET, isValidKeyword };

// All service category slugs (16 original categories from CATEGORY_INFO)
export const ORIGINAL_CATEGORIES = Object.keys(CATEGORY_INFO);

// HIGH PRIORITY keywords for static generation (most searched)
// These get pre-rendered at build time, others use ISR fallback
export const HIGH_PRIORITY_KEYWORDS = [
    // Original categories (16) - always statically generate
    ...ORIGINAL_CATEGORIES,
    // Top searched extended keywords (add ~15 high-volume)
    'knotless-braids',
    'faux-locs',
    'dreadlocks',
    'sew-in-weave',
    'gel-extensions',
    'hydrafacial',
    'fade-haircut',
    'classic-lashes',
    'brazilian-blowout',
    'frontal-installation',
    'loc-retwist',
    'couples-massage',
    'full-body-massage',
    'afro-hair-salon',
    'day-spa',
];

// Use this for static generation to keep build times reasonable
// Full SEO_KEYWORDS are still valid at runtime via ISR
export const STATIC_BUILD_KEYWORDS = HIGH_PRIORITY_KEYWORDS;

// Get all province slugs
export function getAllProvinces() {
    return Object.keys(PROVINCES);
}

// Get all cities with their province slugs
export function getAllCitiesWithProvinces() {
    return getAllCities().map(city => ({
        citySlug: city.slug,
        provinceSlug: PROVINCES[
            Object.keys(PROVINCES).find(
                p => PROVINCES[p].cities.some(c => c.slug === city.slug)
            ) || 'gauteng'
        ]?.slug || 'gauteng',
    }));
}

/**
 * Generate static params for keyword-only pages
 * Uses HIGH_PRIORITY_KEYWORDS for build, full SEO_KEYWORDS valid at runtime via ISR
 */
export function getAllStaticKeywordParams(): { keyword: string }[] {
    return STATIC_BUILD_KEYWORDS.map(keyword => ({ keyword }));
}

/**
 * Generate static params for keyword + province pages
 * e.g., /haircuts-styling/gauteng, /knotless-braids/western-cape
 */
export function getAllKeywordProvinceParams(): { keyword: string; province: string }[] {
    const provinces = getAllProvinces();
    const params: { keyword: string; province: string }[] = [];

    for (const keyword of STATIC_BUILD_KEYWORDS) {
        for (const province of provinces) {
            params.push({ keyword, province });
        }
    }

    return params;
}

/**
 * Generate static params for keyword + province + city pages
 * e.g., /haircuts-styling/gauteng/johannesburg
 */
export function getAllKeywordCityParams(): { keyword: string; province: string; city: string }[] {
    const params: { keyword: string; province: string; city: string }[] = [];

    for (const keyword of STATIC_BUILD_KEYWORDS) {
        for (const provinceSlug of Object.keys(PROVINCES)) {
            const province = PROVINCES[provinceSlug];
            for (const city of province.cities) {
                params.push({
                    keyword,
                    province: provinceSlug,
                    city: city.slug,
                });
            }
        }
    }

    return params;
}

/**
 * Generate static params for province pages
 * e.g., /salons/location/gauteng
 */
export function getAllProvinceParams(): { location: string }[] {
    return Object.keys(PROVINCES).map(provinceSlug => ({
        location: provinceSlug,
    }));
}

/**
 * Generate static params for location city pages
 * e.g., /salons/location/gauteng/johannesburg
 */
export function getAllLocationCityParams(): { location: string; city: string }[] {
    const params: { location: string; city: string }[] = [];

    for (const provinceSlug of Object.keys(PROVINCES)) {
        const province = PROVINCES[provinceSlug];
        for (const city of province.cities) {
            params.push({
                location: provinceSlug,
                city: city.slug,
            });
        }
    }

    return params;
}

/**
 * Generate static params for salon city pages
 * e.g., /salons/near-you/gauteng/johannesburg
 */
export function getAllSalonCityParams(): { province: string; city: string }[] {
    const params: { province: string; city: string }[] = [];

    for (const provinceSlug of Object.keys(PROVINCES)) {
        const province = PROVINCES[provinceSlug];
        for (const city of province.cities) {
            params.push({
                province: provinceSlug,
                city: city.slug,
            });
        }
    }

    return params;
}

/**
 * Generate static params for service category + province pages
 * e.g., /services/haircuts-styling/near-you/gauteng
 */
export function getAllServiceProvinceParams(): { province: string }[] {
    const params: { province: string }[] = [];

    for (const provinceSlug of Object.keys(PROVINCES)) {
        params.push({ province: provinceSlug });
    }

    return params;
}

/**
 * Generate static params for service category + province + city pages
 * e.g., /services/haircuts-styling/near-you/gauteng/johannesburg
 */
export function getAllServiceCityParams(): { province: string; city: string }[] {
    const params: { province: string; city: string }[] = [];

    for (const provinceSlug of Object.keys(PROVINCES)) {
        const province = PROVINCES[provinceSlug];
        for (const city of province.cities) {
            params.push({
                province: provinceSlug,
                city: city.slug,
            });
        }
    }

    return params;
}

// Log stats for debugging
export function getStaticGenerationStats() {
    return {
        originalCategories: ORIGINAL_CATEGORIES.length,
        totalKeywords: SEO_KEYWORDS.length, // All keywords from database
        provinces: Object.keys(PROVINCES).length,
        cities: getAllCities().length,
        totalKeywordPages: getAllStaticKeywordParams().length,
        totalKeywordProvincePages: getAllKeywordProvinceParams().length,
        totalKeywordCityPages: getAllKeywordCityParams().length,
        totalSalonCityPages: getAllSalonCityParams().length,
        totalServiceProvincePages: getAllServiceProvinceParams().length * ORIGINAL_CATEGORIES.length,
        totalServiceCityPages: getAllServiceCityParams().length * ORIGINAL_CATEGORIES.length,
    };
}

/**
 * Convert a slug to a human-readable name
 * e.g., 'knotless-braids' -> 'Knotless Braids'
 */
export function slugToName(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function buildRelatedServiceLinks(
    keyword: string,
    province?: string,
    city?: string
) {
    const preferredKeywords = [
        'hair-salon',
        'nail-salon',
        'braiding',
        'barbershop',
        'makeup',
        'massage',
        'waxing',
        'spa',
    ];

    const keywordPool = Array.from(new Set([...preferredKeywords, ...SEO_KEYWORDS]));

    return keywordPool
        .filter(slug => slug !== keyword)
        .slice(0, 6)
        .map(slug => ({
            label: `${slugToName(slug)}${city ? ` in ${slugToName(city)}` : province ? ` in ${slugToName(province)}` : ' in South Africa'}`,
            url: city
                ? `/${slug}/${province}/${city}`
                : province
                    ? `/${slug}/${province}`
                    : `/${slug}`,
        }));
}

function buildNearbyLocationLinks(keyword: string, province?: string, city?: string) {
    if (!province) {
        return Object.values(PROVINCES)
            .slice(0, 8)
            .map(provinceInfo => ({
                label: `${slugToName(keyword)} in ${provinceInfo.name}`,
                url: `/${keyword}/${provinceInfo.slug}`,
            }));
    }

    if (!city) {
        return getCitiesByProvince(province)
            .slice(0, 8)
            .map(cityInfo => ({
                label: `${slugToName(keyword)} in ${cityInfo.name}`,
                url: `/${keyword}/${province}/${cityInfo.slug}`,
            }));
    }

    const siblingCities = getCitiesByProvince(province)
        .filter(cityInfo => cityInfo.slug !== city)
        .slice(0, 7)
        .map(cityInfo => ({
            label: `${slugToName(keyword)} in ${cityInfo.name}`,
            url: `/${keyword}/${province}/${cityInfo.slug}`,
        }));

    return [
        {
            label: `${slugToName(keyword)} in ${slugToName(province)}`,
            url: `/${keyword}/${province}`,
        },
        ...siblingCities,
    ];
}

/**
 * Get location info from local data
 */
export function getLocalLocationInfo(provinceSlug: string, citySlug?: string) {
    const province = PROVINCES[provinceSlug];
    if (!province) return null;

    if (citySlug) {
        const city = province.cities.find(c => c.slug === citySlug);
        if (!city) return null;
        return {
            province: province.name,
            provinceSlug: province.slug,
            name: city.name,
            slug: city.slug,
            description: city.description || `${city.name}, ${province.name}`,
        };
    }

    return {
        province: province.name,
        provinceSlug: province.slug,
        name: province.name,
        slug: province.slug,
        description: province.description || `${province.name}, South Africa`,
    };
}

/**
 * Generate local SEO page content for keyword/province/city pages
 * This is used as fallback when the backend API doesn't have the page
 */
export function generateLocalSeoPageContent(
    keyword: string,
    province: string,
    city?: string
) {
    const keywordName = slugToName(keyword);
    const location = getLocalLocationInfo(province, city);

    if (!location) return null;

    const locationName = location.name;
    const provinceName = location.province;
    const keywordLower = keywordName.toLowerCase();

    // Generate H1 heading
    const h1 = `${keywordName} in ${locationName}${city ? `, ${provinceName}` : ''}`;

    // Generate meta title and description
    const metaTitle = `${keywordName} in ${locationName}${city ? `, ${provinceName}` : ''} | Stylr SA`;
    const metaDescription = `Browse ${keywordLower} services in ${locationName}${city ? `, ${provinceName}` : ''}. Discover salons and beauty professionals, compare options, and book with Stylr SA.`;

    // Generate intro text
    const introText = `Looking for professional ${keywordLower} services in ${locationName}? Stylr SA connects you with verified beauty professionals and salons offering ${keywordLower} in ${locationName} and surrounding areas.

Whether you need a quick appointment or want to browse multiple options, our platform makes it easy to find, compare, and book ${keywordLower} services. All providers are verified and reviewed by real customers.`;

    // Generate H2 headings
    const h2Headings = [
        `Why Explore ${keywordName} Services in ${locationName}?`,
        `How to Book ${keywordName} in ${locationName}`,
        `Popular ${keywordName} Styles and Options`,
        `${keywordName} Prices in ${locationName}`,
    ];

    // Generate schema markup
    const schemaMarkup = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${keywordName} in ${locationName}`,
        description: metaDescription,
        itemListElement: [
            {
                "@type": "ListItem",
                "position": 1,
                "item": {
                    "@type": "LocalBusiness",
                    "name": `${keywordName} Salons in ${locationName}`,
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": locationName,
                        "addressRegion": provinceName,
                        "addressCountry": "ZA"
                    }
                }
            }
        ]
    };

    return {
        h1,
        metaTitle,
        metaDescription,
        introText,
        h2Headings,
        schemaMarkup,
        serviceCount: 0,
        salonCount: 0,
        avgPrice: null,
        keyword: {
            keyword: keywordName,
            slug: keyword,
        },
        location: {
            name: locationName,
            province: provinceName,
            slug: city || province,
        },
        relatedServices: buildRelatedServiceLinks(keyword, province, city),
        nearbyLocations: buildNearbyLocationLinks(keyword, province, city),
    };
}

/**
 * Generate national SEO page content for top-level keyword pages (e.g. /hair-salon)
 * Prevents cannibalization with provincial pages by focusing on South Africa as a whole.
 */
export function generateNationalSeoPageContent(keyword: string) {
    const keywordName = slugToName(keyword);
    const locationName = "South Africa";
    const keywordLower = keywordName.toLowerCase();

    // Generate H1 heading
    const h1 = `${keywordName} in ${locationName}`;

    // Generate meta title and description
    const metaTitle = `${keywordName} in ${locationName} | Stylr SA`;
    const metaDescription = `Browse ${keywordLower} services across ${locationName}. Discover salons and beauty professionals nationwide, compare options, and book with Stylr SA.`;

    // Generate intro text
    const introText = `Looking for expert ${keywordLower} services in ${locationName}? Stylr SA connects you with the highest-rated beauty professionals and salons offering ${keywordLower} nationwide.

Whether you are in Johannesburg, Cape Town, Durban, or anywhere else in the country, our platform makes it easy to find, compare, and book the best ${keywordLower} services. All providers are verified and reviewed by real customers.`;

    // Generate H2 headings
    const h2Headings = [
        `Why Explore ${keywordName} Services on Stylr SA?`,
        `How to Book ${keywordName} Anywhere in South Africa`,
        `Popular ${keywordName} Styles and Trends`,
        `Average ${keywordName} Prices Nationwide`,
    ];

    // Generate schema markup for a national directory page
    const schemaMarkup = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${keywordName} in ${locationName}`,
        description: metaDescription,
        itemListElement: [
            // Placeholder for top provinces to signal national relevance
            {
                "@type": "ListItem",
                "position": 1,
                "url": `https://www.stylrsa.co.za/${keyword}/gauteng`,
                "name": `${keywordName} in Gauteng`
            },
            {
                "@type": "ListItem",
                "position": 2,
                "url": `https://www.stylrsa.co.za/${keyword}/western-cape`,
                "name": `${keywordName} in Western Cape`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "url": `https://www.stylrsa.co.za/${keyword}/kwazulu-natal`,
                "name": `${keywordName} in KwaZulu-Natal`
            }
        ]
    };

    return {
        h1,
        metaTitle,
        metaDescription,
        introText,
        h2Headings,
        schemaMarkup,
        serviceCount: 0,
        salonCount: 0,
        avgPrice: null,
        keyword: {
            keyword: keywordName,
            slug: keyword,
        },
        location: {
            name: locationName,
            province: locationName,
            slug: 'south-africa',
        },
        relatedServices: buildRelatedServiceLinks(keyword),
        nearbyLocations: buildNearbyLocationLinks(keyword),
    };
}
