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

const LOCATION_INFO: Record<string, { name: string }> = {
  'gauteng': {
    name: 'Gauteng',
  },
  'western-cape': {
    name: 'Western Cape',
  },
};

export default async function SalonsLocationLayout({ children, params }: Props) {
  const { location } = await params;
  const locationInfo = LOCATION_INFO[location] || { name: 'South Africa' };
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
        item: `${siteUrl}/salons/location/${location}`,
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
