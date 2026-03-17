import { NextResponse } from 'next/server';
import { generateServiceUrls, generateSitemapXml } from '@/lib/sitemap-generator';
import { buildMinimalUrlsetXml } from '@/lib/sitemap-response';

/**
 * Local Services Sitemap - All service category × location combinations
 */
export async function GET() {
    try {
        const urls = generateServiceUrls();
        const xml = generateSitemapXml(urls);

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                'X-Total-URLs': urls.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error generating local services sitemap:', error);
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
