import { NextResponse } from 'next/server';
import { getSeoSitemapSegmentCount } from '@/lib/sitemap-generator';
import {
  buildMinimalSitemapIndexXml,
  hasUnsafeXmlPayload,
  isValidSitemapIndexXml,
} from '@/lib/sitemap-response';
import {
  shouldSkipBackendFetchDuringBuild,
  toErrorMessage,
} from '@/lib/server/build-runtime';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN || process.env.BACKEND_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Sitemap Index - Lists all available sitemaps
 * PRIORITY: Backend first (1.2M+ URLs), local fallback (~25K URLs)
 */
export async function GET() {
  if (shouldSkipBackendFetchDuringBuild(BACKEND_URL)) {
    return new NextResponse(buildMinimalSitemapIndexXml(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Source': 'build-fallback',
      },
    });
  }

  // Try backend first - it has 1.2M+ URLs from the database
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${BACKEND_URL}/seo/sitemap-index`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const xml = await response.text();

      if (isValidSitemapIndexXml(xml) && !hasUnsafeXmlPayload(xml)) {
        return new NextResponse(xml, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            'X-Source': 'backend',
          },
        });
      }
      console.error('Backend returned invalid sitemap index XML');
    }
  } catch (error: unknown) {
    console.warn('Backend sitemap unavailable, using local fallback:', toErrorMessage(error));
  }

  // Fallback to local generation (~25K URLs from locationData.ts)
  try {
    const today = new Date().toISOString().split('T')[0];
    const seoSitemapCount = getSeoSitemapSegmentCount();

    const sitemaps: string[] = [];

    // Static pages
    sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-static.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);

    // Local SEO sitemaps
    for (let i = 0; i < seoSitemapCount; i++) {
      sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-seo-local-${i}.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);
    }

    // Services
    sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-services-local.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);

    // Salons (still from backend/dynamic)
    sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-salons.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);

    // Trends (dynamic)
    sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-trends.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('')}
</sitemapindex>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Source': 'local-fallback',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return new NextResponse(buildMinimalSitemapIndexXml(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Source': 'error-fallback',
      },
    });
  }
}
