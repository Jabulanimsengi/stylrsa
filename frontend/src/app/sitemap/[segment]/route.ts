import { NextResponse } from 'next/server';
import {
    shouldSkipBackendFetchDuringBuild,
    toErrorMessage,
} from '@/lib/server/build-runtime';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN ||
    process.env.BACKEND_URL ||
    'http://localhost:5000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

function buildMinimalSitemapXml(): string {
    const now = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
}

function isValidSitemapXml(xml: string): boolean {
    return xml.includes('<?xml') &&
        xml.includes('<urlset') &&
        /<url(\s|>)/.test(xml) &&
        xml.includes('<loc>');
}

/**
 * Generic Sitemap Route Handler
 * Handles /sitemap/[segment]
 * Mapped from /sitemap-[segment].xml via next.config.ts rewrite
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ segment: string }> }
) {
    try {
        const { segment } = await params;

        // Validate segment is a number
        if (!segment || !/^\d+$/.test(segment)) {
            return new NextResponse(buildMinimalSitemapXml(), {
                status: 200,
                headers: { 'Content-Type': 'application/xml; charset=utf-8' },
            });
        }

        if (shouldSkipBackendFetchDuringBuild(BACKEND_URL)) {
            return new NextResponse(buildMinimalSitemapXml(), {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Cache-Control': 'public, max-age=300',
                    'X-Source': 'build-fallback',
                },
            });
        }

        // Fetch from backend (reusing the same backend endpoint structure if applicable, 
        // or assuming this maps to the same SEO sitemaps if that was the intent.
        // Based on user request, this seems to mirror the SEO sitemap logic)
        const response = await fetch(
            `${BACKEND_URL}/seo/sitemap-seo-${segment}`,
            { next: { revalidate: 86400 } }
        );

        if (!response.ok) {
            return new NextResponse(buildMinimalSitemapXml(), {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Cache-Control': 'public, max-age=300',
                },
            });
        }

        const xml = await response.text();

        if (!isValidSitemapXml(xml)) {
            return new NextResponse(buildMinimalSitemapXml(), {
                status: 200,
                headers: { 'Content-Type': 'application/xml; charset=utf-8' },
            });
        }

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.warn('Segment sitemap backend unavailable, using minimal fallback:', toErrorMessage(error));

        return new NextResponse(buildMinimalSitemapXml(), {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
            },
        });
    }
}
