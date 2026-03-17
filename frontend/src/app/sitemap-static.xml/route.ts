import { NextResponse } from 'next/server';
import {
  buildMinimalUrlsetXml,
  hasUnsafeXmlPayload,
  isValidUrlsetXml,
} from '@/lib/sitemap-response';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN || process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/seo/sitemap-static`, {
      next: { revalidate: 86400 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch static sitemap');
    }

    const xml = await response.text();
    if (!isValidUrlsetXml(xml) || hasUnsafeXmlPayload(xml)) {
      throw new Error('Backend returned invalid static sitemap XML');
    }

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating static sitemap:', error);
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
