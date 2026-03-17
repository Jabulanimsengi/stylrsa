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
const URLS_PER_SITEMAP = 45000; // Stay under Google's 50,000 limit

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
    const seoUrls = generateSeoKeywordUrls();
    const serviceUrls = generateServiceUrls();
    const salonUrls = generateSalonUrls();

    return {
        seoPages: seoUrls.length,
        servicePages: serviceUrls.length,
        salonPages: salonUrls.length,
        totalPages: seoUrls.length + serviceUrls.length + salonUrls.length,
        sitemapsNeeded: Math.ceil(seoUrls.length / URLS_PER_SITEMAP),
    };
}
