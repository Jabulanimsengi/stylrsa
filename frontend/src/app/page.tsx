import type { Metadata } from 'next';
import Script from 'next/script';
import HomePageClient from './HomePageClient';

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

// Fetch initial data server-side
async function getInitialData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_ORIGIN || 'http://127.0.0.1:5000';
  const isBuildPhase = process.env.IS_BUILD_PHASE === 'true' || process.env.NEXT_PHASE === 'phase-production-build';

  // Only skip fetching during build time when API is localhost
  if (isBuildPhase && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'))) {
    return {
      featuredSalons: [] as any[],
      allSalons: [] as any[],
      availableNowSalons: [] as any[],
      mobileSalons: [] as any[],
    };
  }

  console.log('Fetching initial data from:', apiUrl);
  try {
    // Fetch salon data in parallel for faster loading
    const [featuredSalonsRes, allSalonsRes, availableNowRes, mobileSalonsRes] = await Promise.all([
      // Fetch featured/recommended salons - 5 minute revalidation (admin changes)
      fetch(`${apiUrl}/api/salons/featured`, {
        next: { revalidate: 300 },
      }),
      // Fetch all salons for Featured Salons section - 30 minute revalidation
      fetch(`${apiUrl}/api/salons/approved`, {
        next: { revalidate: 1800 },
      }),
      // Fetch available now salons - 5 minute revalidation (highly dynamic)
      fetch(`${apiUrl}/api/salons/approved?openNow=true`, {
        next: { revalidate: 300 },
      }),
      // Fetch mobile salons - 1 hour revalidation
      fetch(`${apiUrl}/api/salons/approved?offersMobile=true`, {
        next: { revalidate: 3600 },
      }),
    ]);

    const featuredSalonsData = featuredSalonsRes.ok
      ? await featuredSalonsRes.json()
      : [];

    if (!featuredSalonsRes.ok) console.error('Featured salons fetch failed:', featuredSalonsRes.status);
    if (!allSalonsRes.ok) console.error('All salons fetch failed:', allSalonsRes.status);

    const allSalonsData = allSalonsRes.ok
      ? await allSalonsRes.json()
      : { salons: [] };

    const availableNowData = availableNowRes.ok
      ? await availableNowRes.json()
      : { salons: [] };

    const mobileSalonsData = mobileSalonsRes.ok
      ? await mobileSalonsRes.json()
      : { salons: [] };

    console.log('Fetched salons counts:', {
      featured: Array.isArray(featuredSalonsData) ? featuredSalonsData.length : 0,
      all: (allSalonsData.salons || allSalonsData || []).length,
      available: (availableNowData.salons || availableNowData || []).length,
      mobile: (mobileSalonsData.salons || mobileSalonsData || []).length
    });

    return {
      featuredSalons: Array.isArray(featuredSalonsData) ? featuredSalonsData : [],
      allSalons: allSalonsData.salons || allSalonsData || [],
      availableNowSalons: availableNowData.salons || availableNowData || [],
      mobileSalons: mobileSalonsData.salons || mobileSalonsData || [],
    };
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    return {
      featuredSalons: [] as any[],
      allSalons: [] as any[],
      availableNowSalons: [] as any[],
      mobileSalons: [] as any[],
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
        initialAllSalons={initialData.allSalons}
        initialAvailableNowSalons={initialData.availableNowSalons}
        initialMobileSalons={initialData.mobileSalons}
      />
    </>
  );
}
