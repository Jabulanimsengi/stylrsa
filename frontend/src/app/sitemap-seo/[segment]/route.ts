import { NextResponse } from 'next/server';
import {
    generateSitemapXml,
    getSeoSitemapSegmentCount,
    getSeoSitemapSegmentUrls,
} from '@/lib/sitemap-generator';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN ||
    process.env.BACKEND_URL ||
    'http://localhost:5000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

function hasUnsafePayload(xml: string): boolean {
    return xml.includes(';// ') ||
        xml.includes('function(') ||
        xml.includes('<!DOCTYPE html') ||
        xml.includes('<script') ||
        xml.includes('webpack');
}

function isValidSitemapXml(xml: string): boolean {
    return xml.includes('<?xml') &&
        xml.includes('<urlset') &&
        /<url(\s|>)/.test(xml) &&
        xml.includes('<loc>');
}

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

/**
 * SEO Sitemap Route Handler
 * Handles /sitemap-seo/[segment]
 * Mapped from /sitemap-seo-[segment].xml via next.config.ts rewrite
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ segment: string }> }
) {
    try {
        const { segment } = await params;
        const segmentNum = parseInt(segment, 10);

        if (!segment || !/^\d+$/.test(segment) || Number.isNaN(segmentNum) || segmentNum < 0) {
            return new NextResponse(buildMinimalSitemapXml(), {
                status: 200,
                headers: { 'Content-Type': 'application/xml; charset=utf-8' },
            });
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(
                `${BACKEND_URL}/seo/sitemap-seo-${segment}`,
                {
                    signal: controller.signal,
                    next: { revalidate: 86400 },
                }
            );
            clearTimeout(timeoutId);

            if (response.ok) {
                const xml = await response.text();

                if (isValidSitemapXml(xml) && !hasUnsafePayload(xml)) {
                    return new NextResponse(xml, {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/xml; charset=utf-8',
                            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                            'X-Source': 'backend',
                        },
                    });
                }

                console.error(`Backend returned invalid XML for sitemap-seo-${segment}`);
            } else {
                console.error(
                    `SEO sitemap-seo-${segment} error: ${response.status} ${response.statusText}`
                );
            }
        } catch (error) {
            console.warn('Backend SEO sitemap unavailable, using fallback:', error);
        }

        const totalSegments = getSeoSitemapSegmentCount();
        if (segmentNum < totalSegments) {
            const urls = getSeoSitemapSegmentUrls(segmentNum);
            const xml = generateSitemapXml(urls);

            return new NextResponse(xml, {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                    'X-Source': 'local-fallback',
                    'X-Total-URLs': urls.length.toString(),
                    'X-Segment': segmentNum.toString(),
                    'X-Total-Segments': totalSegments.toString(),
                },
            });
        }

        return new NextResponse(buildMinimalSitemapXml(), {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=300, s-maxage=300',
                'X-Source': 'minimal-fallback',
            },
        });
    } catch (error) {
        console.error('Sitemap generation error:', error);

        return new NextResponse(buildMinimalSitemapXml(), {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=300, s-maxage=300',
                'X-Source': 'error-fallback',
            },
        });
    }
}
