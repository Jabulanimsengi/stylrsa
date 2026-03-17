import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/dashboard/*',
          '/admin',
          '/admin/*',
          '/my-profile',
          '/my-bookings',
          '/my-favorites',
          '/my-trends',
          '/create-salon',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/debug-auth',
          '/test-*',
          '/clear-cache',
        ],
      },
      // Special rule for Googlebot to ensure full access to public content
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/dashboard/*',
          '/admin',
          '/admin/*',
          '/my-profile',
          '/my-bookings',
          '/my-favorites',
          '/my-trends',
          '/create-salon',
          '/login',
          '/register',
          '/debug-auth',
          '/test-*',
        ],
        crawlDelay: 0,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
