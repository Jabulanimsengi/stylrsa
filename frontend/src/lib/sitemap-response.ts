const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

export function buildMinimalUrlsetXml(loc: string = `${SITE_URL}/`): string {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
}

export function buildMinimalSitemapIndexXml(
  sitemapLocs: string[] = [`${SITE_URL}/sitemap-static.xml`],
): string {
  const now = new Date().toISOString();
  const items = sitemapLocs
    .map(
      (loc) => `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`;
}

export function isValidUrlsetXml(xml: string): boolean {
  return xml.includes('<?xml') &&
    xml.includes('<urlset') &&
    /<url(\s|>)/.test(xml) &&
    xml.includes('<loc>');
}

export function isValidSitemapIndexXml(xml: string): boolean {
  return xml.includes('<?xml') &&
    xml.includes('<sitemapindex') &&
    /<sitemap(\s|>)/.test(xml) &&
    xml.includes('<loc>');
}

export function hasUnsafeXmlPayload(xml: string): boolean {
  return xml.includes(';// ') ||
    xml.includes('function(') ||
    xml.includes('<!DOCTYPE html') ||
    xml.includes('<script') ||
    xml.includes('webpack');
}
