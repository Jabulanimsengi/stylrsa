type Sanitizable = string | null | undefined;

const ensureAbsoluteUrl = (baseUrl: string, url: Sanitizable) => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${normalized}`;
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

async function fetchSalon(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_PATH;

  // Skip during build if no API URL configured
  if (!baseUrl) {
    return null;
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/salons/${id}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for layout

  try {
    const res = await fetch(url, {
      next: { revalidate: 21600 }, // 6 hours - reduced ISR frequency
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return res.json();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export default async function SalonLayout({ children, params }: Props) {
  const { id } = await params;
  const salon = await fetchSalon(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  // Use slug for URLs if available for better SEO
  const salonIdentifier = salon?.slug || id;
  const businessId = `${siteUrl}/salons/${salonIdentifier}#localbusiness`;

  const breadcrumbSchema = salon ? {
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
        name: salon.name,
        item: `${siteUrl}/salons/${salon.slug || salon.id}`,
      },
    ],
  } : null;

  const normalizedImages = salon?.heroImages && Array.isArray(salon.heroImages) && salon.heroImages.length > 0
    ? (salon.heroImages as string[])
      .map((img: string) => ensureAbsoluteUrl(siteUrl, img))
      .filter((img): img is string => Boolean(img))
    : salon?.backgroundImage
      ? [ensureAbsoluteUrl(siteUrl, salon.backgroundImage)].filter((img): img is string => Boolean(img))
      : undefined;

  const jsonLd = salon
    ? {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': businessId,
      name: salon.name,
      description: salon.description || undefined,
      image: normalizedImages,
      url: `${siteUrl}/salons/${salon.slug || salon.id}`,
      telephone: salon.phoneNumber || undefined,
      email: salon.contactEmail || undefined,
      address: {
        '@type': 'PostalAddress',
        addressLocality: salon.city,
        addressRegion: salon.province,
        streetAddress: salon.address || `${salon.town || ''}`.trim(),
        addressCountry: 'ZA',
      },
      geo:
        salon.latitude && salon.longitude
          ? {
            '@type': 'GeoCoordinates',
            latitude: salon.latitude,
            longitude: salon.longitude,
          }
          : undefined,
      priceRange: '$$',
    }
    : null;

  return (
    <>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
