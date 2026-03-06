import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ location: string; city: string }>;
};

// City data with SEO information
const CITY_DATA: Record<string, Record<string, {
  name: string;
  province: string;
  description: string;
  keywords: string[];
  population?: string;
}>> = {
  'gauteng': {
    'johannesburg': {
      name: 'Johannesburg',
      province: 'Gauteng',
      description: 'Find the best hair salons, nail salons, spas, and beauty services near you in Johannesburg.',
      keywords: ['hair salon near me Johannesburg', 'nail salon near me Johannesburg', 'spa near me Johannesburg']
    },

    'pretoria': {
      name: 'Pretoria',
      province: 'Gauteng',
      population: '2.5M',
      description: 'Discover top beauty salons, hair stylists, nail technicians, and spa services near you in Pretoria. Book appointments for hair braiding, weaving, natural hair care, gel nails, acrylic nails, full body massages, facials, microblading, lash extensions, and professional makeup in Tshwane. Find affordable salons and luxury wellness centers.',
      keywords: [
        'hair salon near me Pretoria',
        'nail salon near me Pretoria',
        'spa near me Pretoria',
        'best hair salon in Pretoria',
        'african hair salon near me Pretoria',
        'beauty salon near me Pretoria',
        'massage near me Pretoria',
        'manicure near me Pretoria',
        'hairdresser near me Pretoria',
        'natural hair salon near me Pretoria',
        'gel nails near me Pretoria',
        'facial near me Pretoria',
        'makeup artist near me Pretoria',
        'spa packages near me Pretoria',
        'nail bar Pretoria',
        'hair extensions near me Pretoria',
        'bridal hairstylist near me Pretoria',
        'day spa near me Pretoria',
        'waxing near me Pretoria',
        'beauty therapist near me Pretoria'
      ]
    },
    'sandton': {
      name: 'Sandton',
      province: 'Gauteng',
      description: 'Book luxury beauty services, premium hair salons, upscale nail bars, and exclusive spa treatments in Sandton. Find top-rated salons for balayage, keratin treatments, hair highlights, luxury manicures, gel nails, hot stone massages, hydrafacials, microblading, lash extensions, and bridal beauty packages. Experience world-class beauty and wellness.',
      keywords: [
        'luxury spa near me Sandton',
        'best hair salon in Sandton',
        'nail salon near me Sandton',
        'spa near me Sandton',
        'hair salon near me Sandton',
        'balayage near me Sandton',
        'keratin treatment near me Sandton',
        'gel nails near me Sandton',
        'makeup artist near me Sandton',
        'hydrafacial near me Sandton',
        'microblading near me Sandton',
        'lash extensions near me Sandton',
        'day spa Sandton',
        'luxury nail spa Sandton',
        'bridal makeup near me Sandton',
        'hair highlights near me Sandton',
        'full body massage Sandton',
        'beauty salon packages Sandton',
        'medical spa near me Sandton',
        'premium beauty services Sandton'
      ]
    },
    'soweto': {
      name: 'Soweto',
      province: 'Gauteng',
      population: '1.3M',
      description: 'Find affordable hair salons, nail technicians, beauty therapists, and wellness services near you in Soweto. Book appointments for african hair braiding, weaving, dreadlocks, natural hair styling, gel nails, manicures, pedicures, massages, facials, makeup, and beauty treatments. Support local salons and mobile hairstylists.',
      keywords: [
        'hair salon near me Soweto',
        'african hair braiding near me Soweto',
        'beauty salon near me Soweto',
        'nail salon near me Soweto',
        'hairdresser near me Soweto',
        'affordable hair salon Soweto',
        'natural hair salon near me Soweto',
        'dreadlocks salon near me Soweto',
        'hair weaving near me Soweto',
        'manicure near me Soweto',
        'makeup artist near me Soweto',
        'mobile hairstylist near me Soweto',
        'spa near me Soweto',
        'massage near me Soweto',
        'gel nails near me Soweto',
        'hair extensions near me Soweto',
        'facial near me Soweto',
        'braiding salon Soweto',
        'beauty therapist Soweto',
        'walk-in salon near me Soweto'
      ]
    },
    'midrand': {
      name: 'Midrand',
      province: 'Gauteng',
      description: 'Discover quality hair salons, nail bars, spas, and beauty services in Midrand. Book appointments for hair styling, braiding, weaving, gel nails, manicures, massages, facials, makeup, lash extensions, and wellness treatments. Find convenient beauty salons between Johannesburg and Pretoria.',
      keywords: [
        'hair salon near me Midrand',
        'nail salon near me Midrand',
        'spa near me Midrand',
        'beauty salon near me Midrand',
        'hairdresser near me Midrand',
        'gel nails near me Midrand',
        'massage near me Midrand',
        'manicure near me Midrand',
        'hair braiding near me Midrand',
        'makeup artist near me Midrand',
        'facial near me Midrand',
        'lash extensions near me Midrand',
        'nail bar Midrand',
        'beauty services Midrand',
        'spa packages Midrand'
      ]
    }
  },
  'western-cape': {
    'cape-town': {
      name: 'Cape Town',
      province: 'Western Cape',
      population: '4.7M',
      description: 'Find premium hair salons, nail spas, luxury day spas, and beauty professionals near you in Cape Town. Book appointments for hair styling, balayage, keratin treatments, gel nails, nail art, Swedish massages, hot stone therapy, hydrafacials, microblading, lash extensions, and bridal beauty packages. Experience Mother City beauty excellence.',
      keywords: [
        'hair salon near me Cape Town',
        'nail salon near me Cape Town',
        'spa near me Cape Town',
        'best hair salon in Cape Town',
        'beauty salon near me Cape Town',
        'luxury spa near me Cape Town',
        'day spa Cape Town',
        'massage near me Cape Town',
        'gel nails near me Cape Town',
        'balayage near me Cape Town',
        'hydrafacial near me Cape Town',
        'microblading near me Cape Town',
        'makeup artist near me Cape Town',
        'hairdresser near me Cape Town',
        'manicure near me Cape Town',
        'facial near me Cape Town',
        'lash extensions Cape Town',
        'nail art near me Cape Town',
        'bridal makeup Cape Town',
        'keratin treatment Cape Town'
      ]
    },
    'stellenbosch': {
      name: 'Stellenbosch',
      province: 'Western Cape',
      description: 'Book quality hair salons, nail services, spa treatments, and beauty professionals in Stellenbosch. Find salons offering hair styling, coloring, gel nails, manicures, massages, facials, makeup, and wellness treatments in the Winelands.',
      keywords: [
        'hair salon near me Stellenbosch',
        'nail salon near me Stellenbosch',
        'spa near me Stellenbosch',
        'beauty salon near me Stellenbosch',
        'hairdresser near me Stellenbosch',
        'massage near me Stellenbosch',
        'gel nails near me Stellenbosch',
        'manicure near me Stellenbosch',
        'makeup artist near me Stellenbosch',
        'facial near me Stellenbosch'
      ]
    }
  },
};

// All city layout pages generated on-demand
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location, city } = await params;

  const cityInfo = CITY_DATA[location]?.[city];

  if (!cityInfo) {
    return {
      title: '💇 Salons & Beauty Services Near Me | Stylr SA',
      description: '✓ Find verified salons and beauty professionals near you in South Africa. Book online instantly!',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  const canonicalUrl = `${siteUrl}/salons/location/${location}/${city}`;

  // Enhanced title with emojis and trust signals
  const title = `⭐ Best Salons in ${cityInfo.name} | Book Online Today | Stylr SA`;

  // Enhanced description with trust signals and CTAs
  const description = `✓ Top-rated salons in ${cityInfo.name} ✓ Instant online booking ✓ Verified reviews ✓ 5% cashback. Find hair, nails, spa & beauty services near you!`;

  const keywords = cityInfo.keywords.join(', ');

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Best Salons in ${cityInfo.name} | Stylr SA`,
      description,
      url: canonicalUrl,
      siteName: 'Stylr SA',
      type: 'website',
      locale: 'en_ZA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best Salons in ${cityInfo.name} | Stylr SA`,
      description,
    },
  };
}

export default async function CityLayout({ children, params }: Props) {
  const { location, city } = await params;
  const cityInfo = CITY_DATA[location]?.[city];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

  if (!cityInfo) {
    return <>{children}</>;
  }

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
        name: cityInfo.province,
        item: `${siteUrl}/salons/location/${location}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: cityInfo.name,
        item: `${siteUrl}/salons/location/${location}/${city}`,
      },
    ],
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/salons/location/${location}/${city}`,
    name: `Stylr SA - ${cityInfo.name}`,
    description: cityInfo.description,
    url: `${siteUrl}/salons/location/${location}/${city}`,
    areaServed: {
      '@type': 'City',
      name: cityInfo.name,
      containedIn: {
        '@type': 'State',
        name: cityInfo.province,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {children}
    </>
  );
}
