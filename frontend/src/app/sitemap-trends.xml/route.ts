import { NextResponse } from 'next/server';
import {
  buildMinimalUrlsetXml,
  hasUnsafeXmlPayload,
  isValidUrlsetXml,
} from '@/lib/sitemap-response';
import {
  shouldSkipBackendFetchDuringBuild,
  toErrorMessage,
} from '@/lib/server/build-runtime';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN || process.env.BACKEND_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (shouldSkipBackendFetchDuringBuild(BACKEND_URL)) {
    return new NextResponse(buildMinimalUrlsetXml(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Source': 'build-fallback',
      },
    });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/seo/sitemap-trends`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trends sitemap');
    }

    const xml = await response.text();
    if (!isValidUrlsetXml(xml) || hasUnsafeXmlPayload(xml)) {
      throw new Error('Backend returned invalid trends sitemap XML');
    }

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.warn('Trends sitemap backend unavailable, using minimal fallback:', toErrorMessage(error));
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
