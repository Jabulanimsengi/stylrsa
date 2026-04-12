/**
 * Local Sitemap Generation Utilities
 * 
 * Generates sitemaps using local data (SEO_KEYWORDS + locations)
 * instead of relying on backend. This ensures all URLs are in
 * the sitemap even if the backend is down.
 */

import { PROVINCES } from './locationData';
import { SEO_KEYWORDS, ORIGINAL_CATEGORIES } from './seo-generation';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
export const URLS_PER_SITEMAP = 45000; // Stay under Google's 50,000 limit
const PROVINCE_SLUGS = Object.keys(PROVINCES);
const TOTAL_CITIES = PROVINCE_SLUGS.reduce(
    (count, provinceSlug) => count + PROVINCES[provinceSlug].cities.length,
    0,
);
const URLS_PER_KEYWORD = 1 + PROVINCE_SLUGS.length + TOTAL_CITIES;
const URLS_PER_SERVICE_CATEGORY = 2 + PROVINCE_SLUGS.length + TOTAL_CITIES;

export interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

/**
 * Generate all SEO keyword page URLs
 * Pattern: /[keyword]/[province]/[city]
 */
export function generateSeoKeywordUrls(): SitemapUrl[] {
    const urls: SitemapUrl[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const keyword of SEO_KEYWORDS) {
        // Keyword-only page: /knotless-braids
        urls.push({
            loc: `${SITE_URL}/${keyword}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: 0.8,
        });

        // Keyword + Province pages: /knotless-braids/gauteng
        for (const provinceSlug of Object.keys(PROVINCES)) {
            urls.push({
                loc: `${SITE_URL}/${keyword}/${provinceSlug}`,
                lastmod: today,
                changefreq: 'weekly',
                priority: 0.7,
            });

            // Keyword + Province + City pages: /knotless-braids/gauteng/johannesburg
            const province = PROVINCES[provinceSlug];
            for (const city of province.cities) {
                urls.push({
                    loc: `${SITE_URL}/${keyword}/${provinceSlug}/${city.slug}`,
                    lastmod: today,
                    changefreq: 'weekly',
                    priority: 0.6,
                });
            }
        }
    }

    return urls;
}

function appendSeoKeywordUrls(
    urls: SitemapUrl[],
    keyword: string,
    today: string,
    startOffset: number,
    maxUrls: number,
): number {
    let remainingOffset = startOffset;
    let remainingSlots = maxUrls;

    const pushUrl = (loc: string, changefreq: SitemapUrl['changefreq'], priority: number) => {
        if (remainingSlots <= 0) return;
        if (remainingOffset > 0) {
            remainingOffset -= 1;
            return;
        }

        urls.push({
            loc,
            lastmod: today,
            changefreq,
            priority,
        });
        remainingSlots -= 1;
    };

    pushUrl(`${SITE_URL}/${keyword}`, 'weekly', 0.8);

    for (const provinceSlug of PROVINCE_SLUGS) {
        pushUrl(`${SITE_URL}/${keyword}/${provinceSlug}`, 'weekly', 0.7);

        const province = PROVINCES[provinceSlug];
        for (const city of province.cities) {
            pushUrl(`${SITE_URL}/${keyword}/${provinceSlug}/${city.slug}`, 'weekly', 0.6);

            if (remainingSlots <= 0) {
                return maxUrls;
            }
        }

        if (remainingSlots <= 0) {
            return maxUrls;
        }
    }

    return maxUrls - remainingSlots;
}

export function getSeoKeywordUrlCount(): number {
    return SEO_KEYWORDS.length * URLS_PER_KEYWORD;
}

export function getServiceUrlCount(): number {
    return ORIGINAL_CATEGORIES.length * URLS_PER_SERVICE_CATEGORY;
}

export function getSalonUrlCount(): number {
    return 2 * (PROVINCE_SLUGS.length + TOTAL_CITIES);
}

export function getSeoSitemapSegmentCount(): number {
    return Math.ceil(getSeoKeywordUrlCount() / URLS_PER_SITEMAP);
}

export function getSeoSitemapSegmentUrls(segmentNum: number): SitemapUrl[] {
    if (!Number.isInteger(segmentNum) || segmentNum < 0) {
        return [];
    }

    const totalUrls = getSeoKeywordUrlCount();
    const startIndex = segmentNum * URLS_PER_SITEMAP;

    if (startIndex >= totalUrls) {
        return [];
    }

    const urlsNeeded = Math.min(URLS_PER_SITEMAP, totalUrls - startIndex);
    const startKeywordIndex = Math.floor(startIndex / URLS_PER_KEYWORD);
    let offsetWithinKeyword = startIndex % URLS_PER_KEYWORD;
    let remaining = urlsNeeded;
    const urls: SitemapUrl[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (
        let keywordIndex = startKeywordIndex;
        keywordIndex < SEO_KEYWORDS.length && remaining > 0;
        keywordIndex += 1
    ) {
        const added = appendSeoKeywordUrls(
            urls,
            SEO_KEYWORDS[keywordIndex],
            today,
            offsetWithinKeyword,
            remaining,
        );

        remaining -= added;
        offsetWithinKeyword = 0;
    }

    return urls;
}

/**
 * Generate all service category page URLs
 * Pattern: /services/[category]/near-you/[province]/[city]
 */
export function generateServiceUrls(): SitemapUrl[] {
    const urls: SitemapUrl[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const category of ORIGINAL_CATEGORIES) {
        // Category page: /services/haircuts-styling
        urls.push({
            loc: `${SITE_URL}/services/${category}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: 0.8,
        });

        // Category near-you: /services/haircuts-styling/near-you
        urls.push({
            loc: `${SITE_URL}/services/${category}/near-you`,
            lastmod: today,
            changefreq: 'weekly',
            priority: 0.7,
        });

        // Category + Province: /services/haircuts-styling/near-you/gauteng
        for (const provinceSlug of Object.keys(PROVINCES)) {
            urls.push({
                loc: `${SITE_URL}/services/${category}/near-you/${provinceSlug}`,
                lastmod: today,
                changefreq: 'weekly',
                priority: 0.6,
            });

            // Category + Province + City
            const province = PROVINCES[provinceSlug];
            for (const city of province.cities) {
                urls.push({
                    loc: `${SITE_URL}/services/${category}/near-you/${provinceSlug}/${city.slug}`,
                    lastmod: today,
                    changefreq: 'weekly',
                    priority: 0.5,
                });
            }
        }
    }

    return urls;
}

/**
 * Generate salon location URLs
 * Pattern: /salons/near-you/[province]/[city]
 */
export function generateSalonUrls(): SitemapUrl[] {
    const urls: SitemapUrl[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const provinceSlug of Object.keys(PROVINCES)) {
        urls.push({
            loc: `${SITE_URL}/salons/near-you/${provinceSlug}`,
            lastmod: today,
            changefreq: 'daily',
            priority: 0.7,
        });

        urls.push({
            loc: `${SITE_URL}/salons/location/${provinceSlug}`,
            lastmod: today,
            changefreq: 'daily',
            priority: 0.7,
        });

        const province = PROVINCES[provinceSlug];
        for (const city of province.cities) {
            urls.push({
                loc: `${SITE_URL}/salons/near-you/${provinceSlug}/${city.slug}`,
                lastmod: today,
                changefreq: 'daily',
                priority: 0.6,
            });

            urls.push({
                loc: `${SITE_URL}/salons/location/${provinceSlug}/${city.slug}`,
                lastmod: today,
                changefreq: 'daily',
                priority: 0.6,
            });
        }
    }

    return urls;
}

/**
 * Generate XML from URL list
 */
export function generateSitemapXml(urls: SitemapUrl[]): string {
    const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Split URLs into multiple sitemaps (max 45,000 each)
 */
export function splitIntoSitemaps(urls: SitemapUrl[]): SitemapUrl[][] {
    const sitemaps: SitemapUrl[][] = [];
    for (let i = 0; i < urls.length; i += URLS_PER_SITEMAP) {
        sitemaps.push(urls.slice(i, i + URLS_PER_SITEMAP));
    }
    return sitemaps;
}

/**
 * Get total counts for sitemap stats
 */
export function getSitemapStats() {
    const seoPages = getSeoKeywordUrlCount();
    const servicePages = getServiceUrlCount();
    const salonPages = getSalonUrlCount();

    return {
        seoPages,
        servicePages,
        salonPages,
        totalPages: seoPages + servicePages + salonPages,
        sitemapsNeeded: Math.ceil(seoPages / URLS_PER_SITEMAP),
    };
}
