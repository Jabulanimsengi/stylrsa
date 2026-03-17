import { NextResponse } from 'next/server';
import { buildMinimalUrlsetXml } from '@/lib/sitemap-response';

export async function GET() {
  return new NextResponse(buildMinimalUrlsetXml(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Source': 'minimal-fallback',
    },
  });
}
