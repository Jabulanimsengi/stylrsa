import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Script from 'next/script';
import type { Salon } from '@/types';
import SalonProfileClient from './SalonProfileClient';
import { generateSalonStructuredData, generateSalonBreadcrumb } from '@/lib/salonSeoHelpers';

/**
 * Check if a string looks like a UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

const buildApiUrl = (base: string | undefined, path: string) => {
  if (!base) return path;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const fetchSalonWithTimeout = async (url: string, timeoutMs = 5000): Promise<Salon | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // SSR: Always fetch fresh data, no caching for real-time availability
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!res.ok) {
      console.warn(`[fetchSalon] Response not OK: ${res.status} from ${url}`);
      return null;
    }
    const data: Salon = await res.json();
    return data;
  } catch (error: any) {
    // Log specific error for debugging
    if (error.name === 'AbortError') {
      console.warn(`[fetchSalon] Request timed out after ${timeoutMs}ms: ${url}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.warn(`[fetchSalon] Backend not running at: ${url}`);
    } else {
      console.warn(`[fetchSalon] Fetch error: ${error.message}`);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

async function getSalon(id: string): Promise<Salon | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_PATH;
  const isBuildPhase = process.env.IS_BUILD_PHASE === 'true' || process.env.NEXT_PHASE === 'phase-production-build';

  // Only skip fetching during build time when API is localhost
  if (isBuildPhase && (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'))) {
    return null;
  }

  if (!baseUrl) {
    console.error('ERROR: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_BASE_PATH is not set.');
    return null;
  }

  const url = buildApiUrl(baseUrl, `/api/salons/${id}`);

  try {
    // Increased timeout for sleeping backends (Render free tier can take 30-60s to wake)
    const salon = await fetchSalonWithTimeout(url, 15000);

    if (!salon) {
      console.warn(`[getSalon] Salon not found at: ${url}`);
      return null;
    }

    return salon;

  } catch (error) {
    console.error(`[getSalon] Failed to fetch salon ${id} from ${url}`, error);
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const salon = await getSalon(id);

  if (!salon) {
    return {
      title: 'Salon Not Found',
      description: 'The requested salon could not be found.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  // Build dynamic title and description
  const title = `${salon.name} - ${salon.city || 'South Africa'} | Stylr SA`;
  const description = salon.description
    ? `${salon.description.substring(0, 155)}...`
    : `Book appointments at ${salon.name} in ${salon.city || 'South Africa'}. Professional salon services with easy online booking.`;

  // Build keywords from services
  const serviceKeywords = salon.services?.map(s => s.name || s.title).filter(Boolean).join(', ') || '';
  const keywords = `${salon.name}, salon ${salon.city || 'South Africa'}, ${serviceKeywords}, hair salon, beauty salon, book appointment`;

  // Use slug for canonical URL if available, fallback to ID
  const salonIdentifier = salon.slug || salon.id;
  const canonicalUrl = `${siteUrl}/salons/${salonIdentifier}`;
  const imageUrl = salon.logo || salon.backgroundImage || salon.gallery?.[0]?.imageUrl || `${siteUrl}/logo-transparent.png`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Stylr SA',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${salon.name} - Salon in ${salon.city || 'South Africa'}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

// ISR Configuration - Pages cached for 24 hours, regenerated in background
export const revalidate = 86400; // Cache pages for 24 hours
export const dynamicParams = true; // Allow dynamic routes

// Note: Using ISR instead of force-dynamic to reduce serverless function invocations
// Pages are generated on first visit and served from cache for subsequent requests

export default async function SalonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const salon = await getSalon(id);

  if (!salon) {
    return <SalonProfileClient initialSalon={null} salonId={id} />;
  }

  // Redirect from UUID to slug for SEO-friendly URLs
  // If user visits /salons/uuid-here and salon has a slug, redirect to /salons/slug-here
  if (isUUID(id) && salon.slug && salon.slug !== id) {
    redirect(`/salons/${salon.slug}`);
  }

  const structuredData = generateSalonStructuredData(salon);
  const breadcrumbData = generateSalonBreadcrumb(salon);

  // Create UI breadcrumbs
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Salons', href: '/salons' },
    ...(salon.city ? [{ label: salon.city, href: `/salons?city=${encodeURIComponent(salon.city)}` }] : []),
    ...(salon.town && salon.town !== salon.city ? [{ label: salon.town, href: `/salons?town=${encodeURIComponent(salon.town)}` }] : []),
    { label: salon.name }
  ];

  return (
    <>
      <Script
        id="salon-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        strategy="beforeInteractive"
      />
      <Script
        id="salon-breadcrumb-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        strategy="beforeInteractive"
      />
      <SalonProfileClient
        initialSalon={salon}
        salonId={id}
        breadcrumbItems={breadcrumbItems}
      />
    </>
  );
}