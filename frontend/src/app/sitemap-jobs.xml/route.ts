import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

// Job roles to generate pages for
const JOB_ROLES = [
  'hairdresser',
  'nail-tech',
  'makeup-artist',
  'barber',
  'massage-therapist',
  'esthetician',
  'beauty-professional',
  'hair-stylist',
  'lash-technician',
  'brow-artist',
  'salon-manager',
  'spa-therapist',
];

// South African provinces (Gauteng & Western Cape only)
const PROVINCES = [
  { slug: 'gauteng', name: 'Gauteng' },
  { slug: 'western-cape', name: 'Western Cape' },
];

// Major cities per province
const CITIES: Record<string, string[]> = {
  gauteng: [
    'johannesburg', 'pretoria', 'sandton', 'soweto', 'midrand', 'centurion',
    'randburg', 'roodepoort', 'benoni', 'boksburg', 'germiston', 'alberton',
    'kempton-park', 'edenvale', 'fourways', 'rosebank', 'bryanston',
  ],
  'western-cape': [
    'cape-town', 'stellenbosch', 'somerset-west', 'paarl', 'george',
    'bellville', 'durbanville', 'claremont', 'sea-point', 'camps-bay',
  ],
};

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  
  const urls: string[] = [];
  
  // Generate URLs for each role + province combination
  for (const role of JOB_ROLES) {
    for (const province of PROVINCES) {
      urls.push(`${SITE_URL}/jobs/${role}/${province.slug}`);
      
      // Generate URLs for each role + city combination
      const cities = CITIES[province.slug] || [];
      for (const city of cities) {
        urls.push(`${SITE_URL}/jobs/${role}/${city}`);
      }
    }
  }
  
  // Also add general jobs pages
  urls.push(`${SITE_URL}/jobs`);
  urls.push(`${SITE_URL}/candidates`);
  urls.push(`${SITE_URL}/employers`);
  urls.push(`${SITE_URL}/careers`);
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
