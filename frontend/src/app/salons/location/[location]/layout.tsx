import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ location: string }>;
};

// Generate static params for location pages (Gauteng & Western Cape only)
export async function generateStaticParams() {
  return [
    { location: 'gauteng' },
    { location: 'western-cape' },
  ];
}

const LOCATION_INFO: Record<string, { name: string; description: string; keywords: string }> = {
  'gauteng': {
    name: 'Gauteng',
    description: 'Find top-rated salons and beauty professionals in Gauteng, South Africa. Book appointments at the best hair salons, nail salons, spas, and barbershops in Johannesburg, Pretoria, and surrounding areas.',
    keywords: 'Gauteng salons, Johannesburg hair salon, Pretoria beauty salon, Gauteng spa, Johannesburg nail salon, Pretoria barbershop, Gauteng braiding salon',
  },
  'western-cape': {
    name: 'Western Cape',
    description: 'Discover premier salons and beauty services in the Western Cape. Book appointments at top-rated hair salons, nail salons, and spas in Cape Town, Stellenbosch, and the Garden Route.',
    keywords: 'Western Cape salons, Cape Town hair salon, Cape Town beauty salon, Western Cape spa, Cape Town nail salon, Stellenbosch salon',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const locationInfo = LOCATION_INFO[location] || {
    name: 'South Africa',
    description: 'Find the best salons and beauty professionals in South Africa',
    keywords: 'South Africa salons, beauty services, hair salon',
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  const canonicalUrl = `${siteUrl}/salons/${location}`;

  const title = `Salons in ${locationInfo.name} | Hair, Nails, Spa & Beauty Services`;
  const description = locationInfo.description;

  return {
    title,
    description,
    keywords: locationInfo.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Stylr SA',
      type: 'website',
      locale: 'en_ZA',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SalonsLocationLayout({ children, params }: Props) {
  const { location } = await params;
  const locationInfo = LOCATION_INFO[location] || { name: 'South Africa', description: '', keywords: '' };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Salons',
        item: `${siteUrl}/salons`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: locationInfo.name,
        item: `${siteUrl}/salons/${location}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
