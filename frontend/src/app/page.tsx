import type { Metadata } from 'next';
import Script from 'next/script';
import HomePageClient from './HomePageClient';
import { getInternalBackendOrigin } from '@/lib/server/backend-origin';
import { applyComputedAvailability } from '@/lib/salonAvailability';
import type { Salon } from '@/types';

// Cache the homepage and revalidate in the background to keep TTFB stable.
export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

// Generate metadata for homepage
export const metadata: Metadata = {
  title: 'Stylr SA - Book Beauty & Wellness Services Near You',
  description: 'Book beauty & wellness services near you. Browse salons, spas, and beauty professionals. Read reviews and book online instantly.',
  keywords: 'salon booking South Africa, beauty services, hair salon, nail salon, spa, makeup artist, braiding, barbershop, wellness, Johannesburg, Cape Town, Pretoria, Sandton, Gauteng, Western Cape',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Stylr SA - Book Beauty & Wellness Services Near You',
    description: 'Book beauty & wellness services near you. Browse salons, spas, and beauty professionals across South Africa.',
    url: siteUrl,
    siteName: 'Stylr SA',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/logo-transparent.png`,
        width: 1200,
        height: 630,
        alt: 'Stylr SA - Beauty & Wellness Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stylr SA - Book Beauty & Wellness Services Near You',
    description: 'Book beauty & wellness services near you across South Africa',
    images: [`${siteUrl}/logo-transparent.png`],
  },
};

function normalizeSalonList(data: unknown): Salon[] {
  if (Array.isArray(data)) {
    return data as Salon[];
  }

  if (data && typeof data === 'object' && 'salons' in data) {
    const salons = (data as { salons?: unknown }).salons;
    return Array.isArray(salons) ? salons as Salon[] : [];
  }

  return [];
}

function isLocalOrigin(origin: string): boolean {
  return origin.includes('localhost') || origin.includes('127.0.0.1');
}

function allowLocalBackendFetchInDev(): boolean {
  return (
    process.env.ENABLE_LOCAL_BACKEND_FETCH === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_LOCAL_BACKEND_FETCH === 'true'
  );
}

// Fetch initial data server-side
async function getInitialData() {
  const apiUrl = getInternalBackendOrigin();
  const isBuildPhase = process.env.IS_BUILD_PHASE === 'true' || process.env.NEXT_PHASE === 'phase-production-build';
  const isDevPhase = process.env.NODE_ENV !== 'production';
  const isLocalBackend = isLocalOrigin(apiUrl);

  // Only skip fetching during build time when API is localhost
  if (isBuildPhase && isLocalBackend) {
    return {
      featuredSalons: [] as Salon[],
      availableNowSalons: [] as Salon[],
    };
  }

  // In development, skip server-side homepage fetches against localhost unless explicitly opted in.
  if (isDevPhase && isLocalBackend && !allowLocalBackendFetchInDev()) {
    return {
      featuredSalons: [] as Salon[],
      availableNowSalons: [] as Salon[],
    };
  }

  console.log('Fetching initial data from:', apiUrl);
  try {
    // Fetch salon data in parallel for faster loading
    const [featuredSalonsRes, approvedSalonsRes] = await Promise.all([
      // Fetch featured salons - admin-weighted ordering, includes closed salons too.
      fetch(`${apiUrl}/api/salons/featured?limit=12`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(4000),
      }),
      // Fetch a broader approved pool and derive "available now" locally so status stays in sync.
      fetch(`${apiUrl}/api/salons/approved?limit=48`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(4000),
      }),
    ]);

    const featuredSalonsData = featuredSalonsRes.ok
      ? await featuredSalonsRes.json()
      : [];

    if (!featuredSalonsRes.ok) console.error('Featured salons fetch failed:', featuredSalonsRes.status);

    const approvedSalonsData = approvedSalonsRes.ok
      ? await approvedSalonsRes.json()
      : { salons: [] };

    if (!approvedSalonsRes.ok) console.error('Approved salons fetch failed:', approvedSalonsRes.status);

    const featuredSalons = applyComputedAvailability(normalizeSalonList(featuredSalonsData));
    const approvedSalons = applyComputedAvailability(normalizeSalonList(approvedSalonsData));
    const availableNowSalons = approvedSalons
      .filter((salon) => salon.isAvailableNow)
      .slice(0, 12);

    console.log('Fetched salons counts:', {
      featured: featuredSalons.length,
      available: availableNowSalons.length,
    });

    return {
      featuredSalons,
      availableNowSalons,
    };
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    return {
      featuredSalons: [] as Salon[],
      availableNowSalons: [] as Salon[],
    };
  }
}

export default async function HomePage() {
  const initialData = await getInitialData();

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'Stylr SA',
    legalName: 'Stylr South Africa',
    alternateName: ['stylrsa', 'Stylr', 'Stylr South Africa'],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      '@id': `${siteUrl}/#logo`,
      url: `${siteUrl}/logo-transparent.png`,
      width: '800',
      height: '600',
      caption: 'Stylr SA Logo',
    },
    image: `${siteUrl}/logo-transparent.png`,
    description: 'South Africa\'s premier platform for discovering and booking beauty services. Connect with top-rated salons, hair stylists, braiders, nail technicians, makeup artists, and wellness professionals across South Africa.',
    foundingDate: '2024',
    // Force cache invalidation
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
      addressRegion: 'Gauteng',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['en', 'zu', 'xh', 'af'],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '50000',
      bestRating: '5',
      worstRating: '1',
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
  };

  // WebSite Schema with search action
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'Stylr SA',
    alternateName: 'stylrsa.co.za',
    description: 'Book beauty services online - Find salons, stylists, and beauty professionals in South Africa',
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/salons?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
    ],
  };

  return (
    <>
      {/* Structured Data - beforeInteractive ensures Google sees this immediately */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        strategy="beforeInteractive"
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        strategy="beforeInteractive"
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="beforeInteractive"
      />

      {/* Client Component with server-rendered initial data */}
      <HomePageClient
        initialFeaturedSalons={initialData.featuredSalons}
        initialAvailableNowSalons={initialData.availableNowSalons}
      />
    </>
  );
}
