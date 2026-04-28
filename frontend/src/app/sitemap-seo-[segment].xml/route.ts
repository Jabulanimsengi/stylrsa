import { NextResponse } from 'next/server';
import {
  generateSitemapXml,
  getSeoSitemapSegmentCount,
  getSeoSitemapSegmentUrls,
} from '@/lib/sitemap-generator';
import {
  shouldSkipBackendFetchDuringBuild,
  toErrorMessage,
} from '@/lib/server/build-runtime';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN ||
  process.env.BACKEND_URL ||
  'http://localhost:5000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

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
 * Dynamic SEO sitemap route - paginated keyword×location combinations
 * Supports: /sitemap-seo-0.xml, /sitemap-seo-1.xml, /sitemap-seo-2.xml, etc.
 * PRIORITY: Backend first, then local fallback
 */
export async function GET(
  request: Request
) {
  const { pathname } = new URL(request.url);
  const segmentMatch = pathname.match(/sitemap-seo-(\d+)\.xml$/);
  const segment = segmentMatch?.[1] ?? '';
  const segmentNum = parseInt(segment, 10);

  // Validate segment is a number
  if (!segment || !/^\d+$/.test(segment) || isNaN(segmentNum) || segmentNum < 0) {
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
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Source': 'build-fallback',
      },
    });
  }

  // Try backend first with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(
      `${BACKEND_URL}/seo/sitemap-seo-${segment}`,
      {
        signal: controller.signal,
        next: { revalidate: 86400 }  // Cache for 24 hours
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const xml = await response.text();

      // Validate it's actually XML and doesn't contain JS code
      const hasJsPattern = xml.includes(';// ') ||
        xml.includes('function(') ||
        xml.includes('<!DOCTYPE html') ||
        xml.includes('<script') ||
        xml.includes('webpack');

      if (isValidSitemapXml(xml) && !hasJsPattern) {
        return new NextResponse(xml, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            'X-Source': 'backend',
          },
        });
      }
      console.error(`Backend returned invalid XML for segment ${segment}`);
    } else {
      console.error(`Backend error for segment ${segment}: ${response.status}`);
    }
  } catch (error: unknown) {
    console.warn(`Backend sitemap-seo-${segment} unavailable:`, toErrorMessage(error));
  }

  // Fallback to local generation
  try {
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
  } catch (error) {
    console.warn('Local SEO sitemap generation failed, using minimal fallback:', toErrorMessage(error));
  }

  return new NextResponse(buildMinimalSitemapXml(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'X-Source': 'minimal-fallback',
    },
  });
}
