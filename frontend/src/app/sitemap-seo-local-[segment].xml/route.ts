import { NextResponse } from 'next/server';
import {
    generateSeoKeywordUrls,
    generateSitemapXml,
    splitIntoSitemaps
} from '@/lib/sitemap-generator';
import { buildMinimalUrlsetXml } from '@/lib/sitemap-response';

/**
 * Local SEO Sitemap - Paginated (45,000 URLs per segment)
 * Pattern: /sitemap-seo-local-0.xml, /sitemap-seo-local-1.xml, etc.
 */
export async function GET(
    request: Request
) {
    try {
        const { pathname } = new URL(request.url);
        const segmentMatch = pathname.match(/sitemap-seo-local-(\d+)\.xml$/);
        const segment = segmentMatch?.[1] ?? '';
        const segmentNum = parseInt(segment, 10);

        if (isNaN(segmentNum) || segmentNum < 0) {
            return new NextResponse(buildMinimalUrlsetXml(), {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Cache-Control': 'public, max-age=300, s-maxage=300',
                    'X-Source': 'minimal-fallback',
                },
            });
        }

        // Generate all SEO URLs and split into segments
        const allUrls = generateSeoKeywordUrls();
        const segments = splitIntoSitemaps(allUrls);

        if (segmentNum >= segments.length) {
            return new NextResponse(buildMinimalUrlsetXml(), {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Cache-Control': 'public, max-age=300, s-maxage=300',
                    'X-Source': 'minimal-fallback',
                },
            });
        }

        const xml = generateSitemapXml(segments[segmentNum]);

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hour cache
                'X-Total-URLs': segments[segmentNum].length.toString(),
                'X-Segment': segmentNum.toString(),
                'X-Total-Segments': segments.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error generating local SEO sitemap:', error);
        return new NextResponse(buildMinimalUrlsetXml(), {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=300, s-maxage=300',
                'X-Source': 'minimal-fallback',
            },
        });
    }
}
