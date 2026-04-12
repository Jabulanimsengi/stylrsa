import type { Salon, Service } from '@/types';
import { PROVINCES } from '@/lib/locationData';
import { getCategorySlug } from '@/utils/categorySlug';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

type SeoLink = {
  label: string;
  url: string;
};

function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeServiceName(service: Service): string {
  return service.title || service.name || 'Beauty service';
}

export function buildSalonServiceSlug(service: Service): string {
  const serviceNameSlug = slugifySegment(normalizeServiceName(service)) || 'beauty-service';
  return `${serviceNameSlug}-${service.id}`;
}

export function extractServiceIdFromSlug(serviceSlugOrId: string): string {
  const uuidMatch = serviceSlugOrId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  return uuidMatch?.[0] || serviceSlugOrId;
}

export function buildSalonServicePath(salon: Salon, service: Service): string {
  const salonIdentifier = salon.slug || salon.id;
  return `/salons/${salonIdentifier}/services/${buildSalonServiceSlug(service)}`;
}

function normalizeServiceCategory(service: Service): string | null {
  if (typeof service.category === 'string' && service.category.trim().length > 0) {
    return service.category.trim();
  }

  if (service.category && typeof service.category === 'object' && 'name' in service.category) {
    const name = (service.category as { name?: string }).name;
    return typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
  }

  return null;
}

function resolveProvinceSlug(provinceName?: string | null): string | null {
  if (!provinceName) {
    return null;
  }

  const normalized = provinceName.trim().toLowerCase();
  const provinceEntry = Object.entries(PROVINCES).find(([, province]) => province.name.toLowerCase() === normalized);
  return provinceEntry?.[0] || slugifySegment(provinceName);
}

function resolveCitySlug(provinceSlug: string | null, cityName?: string | null): string | null {
  if (!provinceSlug || !cityName) {
    return null;
  }

  const province = PROVINCES[provinceSlug];
  const normalized = cityName.trim().toLowerCase();
  const city = province?.cities.find((item) => item.name.toLowerCase() === normalized || item.slug === normalized);
  return city?.slug || slugifySegment(cityName);
}

function getLocationSegments(salon: Salon) {
  const provinceSlug = resolveProvinceSlug(salon.province);
  const citySlug = resolveCitySlug(provinceSlug, salon.city);
  const townSlug = salon.town && salon.town !== salon.city
    ? resolveCitySlug(provinceSlug, salon.town)
    : null;

  return {
    provinceSlug,
    citySlug,
    townSlug,
  };
}

function buildPriceRange(services: Service[]) {
  const prices = services
    .map((service) => service.price)
    .filter((price): price is number => typeof price === 'number' && !Number.isNaN(price));

  if (prices.length === 0) {
    return '$$';
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return `R${min.toFixed(0)}`;
  }

  return `R${min.toFixed(0)}-R${max.toFixed(0)}`;
}

function buildOpeningHoursSpecification(operatingHours: Salon['operatingHours']) {
  if (!operatingHours) {
    return undefined;
  }

  const dayMap: Record<string, string> = {
    monday: 'https://schema.org/Monday',
    tuesday: 'https://schema.org/Tuesday',
    wednesday: 'https://schema.org/Wednesday',
    thursday: 'https://schema.org/Thursday',
    friday: 'https://schema.org/Friday',
    saturday: 'https://schema.org/Saturday',
    sunday: 'https://schema.org/Sunday',
  };

  if (Array.isArray(operatingHours)) {
    const items = operatingHours
      .map((entry) => {
        const day = dayMap[entry.day?.trim().toLowerCase()];
        if (!day || !entry.open || !entry.close) {
          return null;
        }

        return {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day,
          opens: entry.open,
          closes: entry.close,
        };
      })
      .filter(Boolean);

    return items.length > 0 ? items : undefined;
  }

  if (typeof operatingHours === 'object') {
    const items = Object.entries(operatingHours)
      .map(([dayKey, value]) => {
        if (typeof value !== 'string') {
          return null;
        }

        const day = dayMap[dayKey.trim().toLowerCase().replace(/\./g, '')];
        const [opens, closes] = value.split('-').map((part) => part.trim());
        if (!day || !opens || !closes || value.toLowerCase().includes('closed')) {
          return null;
        }

        return {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day,
          opens,
          closes,
        };
      })
      .filter(Boolean);

    return items.length > 0 ? items : undefined;
  }

  return undefined;
}

export function buildSalonServiceUrl(salon: Salon, service: Service): string {
  return `${siteUrl}${buildSalonServicePath(salon, service)}`;
}

export function buildSalonLocationLinks(salon: Salon): SeoLink[] {
  const { provinceSlug, citySlug } = getLocationSegments(salon);
  const links: SeoLink[] = [];

  if (provinceSlug && salon.province) {
    links.push({
      label: `Salons in ${salon.province}`,
      url: `/salons/location/${provinceSlug}`,
    });
  }

  if (provinceSlug && citySlug && salon.city) {
    links.push({
      label: `Salons in ${salon.city}`,
      url: `/salons/location/${provinceSlug}/${citySlug}`,
    });
  }

  return links;
}

export function buildSalonServiceLinks(salon: Salon): SeoLink[] {
  const { provinceSlug, citySlug, townSlug } = getLocationSegments(salon);
  if (!provinceSlug) {
    return [];
  }

  const seen = new Set<string>();

  return (salon.services || [])
    .map((service) => {
      const categoryName = normalizeServiceCategory(service);
      if (!categoryName) {
        return null;
      }

      const categorySlug = getCategorySlug(categoryName);
      const dedupeKey = `${categorySlug}:${provinceSlug}:${citySlug}:${townSlug}`;
      if (seen.has(dedupeKey)) {
        return null;
      }

      seen.add(dedupeKey);

      if (citySlug && townSlug && salon.town && salon.town !== salon.city) {
        return {
          label: `${categoryName} in ${salon.town}, ${salon.city}`,
          url: `/${categorySlug}/${provinceSlug}/${citySlug}/${townSlug}`,
        };
      }

      if (citySlug && salon.city) {
        return {
          label: `${categoryName} in ${salon.city}`,
          url: `/${categorySlug}/${provinceSlug}/${citySlug}`,
        };
      }

      return {
        label: `${categoryName} in ${salon.province}`,
        url: `/${categorySlug}/${provinceSlug}`,
      };
    })
    .filter((link): link is SeoLink => Boolean(link))
    .slice(0, 6);
}

/**
 * Generate LocalBusiness structured data for a salon
 */
export function generateSalonStructuredData(salon: Salon): object {
  const salonIdentifier = salon.slug || salon.id;
  const services = salon.services || [];
  const serviceNames = services.map(normalizeServiceName);
  const categoryNames = services
    .map(normalizeServiceCategory)
    .filter((category): category is string => Boolean(category));

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': `${siteUrl}/salons/${salonIdentifier}`,
    name: salon.name,
    url: `${siteUrl}/salons/${salonIdentifier}`,
    image: salon.logo || salon.backgroundImage || salon.gallery?.[0]?.imageUrl || `${siteUrl}/logo-transparent.png`,
    description: salon.description || `Professional beauty services at ${salon.name}`,
    telephone: salon.phoneNumber || undefined,
    email: salon.contactEmail || undefined,
    priceRange: buildPriceRange(services),
    mainEntityOfPage: `${siteUrl}/salons/${salonIdentifier}`,
    areaServed: [
      salon.town,
      salon.city,
      salon.province,
      'South Africa',
    ].filter(Boolean),
    knowsAbout: Array.from(new Set([...serviceNames, ...categoryNames])).slice(0, 12),
  };

  const sameAs = [
    salon.website,
    salon.facebookUrl,
    salon.instagramUrl,
    salon.tiktokUrl,
    salon.googleReviewsUrl,
    salon.freshaReviewsUrl,
    salon.booksyReviewsUrl,
  ].filter(Boolean);
  if (sameAs.length > 0) {
    structuredData.sameAs = sameAs;
  }

  if (salon.address || salon.city || salon.province) {
    structuredData.address = {
      '@type': 'PostalAddress',
      streetAddress: salon.address || undefined,
      addressLocality: salon.town || salon.city || undefined,
      addressRegion: salon.province || undefined,
      addressCountry: 'ZA',
    };
  }

  if (salon.latitude && salon.longitude) {
    structuredData.geo = {
      '@type': 'GeoCoordinates',
      latitude: salon.latitude,
      longitude: salon.longitude,
    };
  }

  const openingHoursSpecification = buildOpeningHoursSpecification(salon.operatingHours);
  if (openingHoursSpecification) {
    structuredData.openingHoursSpecification = openingHoursSpecification;
  }

  if (salon.avgRating && salon.reviewCount) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: salon.avgRating,
      reviewCount: salon.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (services.length > 0) {
    structuredData.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `${salon.name} services`,
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        url: buildSalonServiceUrl(salon, service),
        availability: 'https://schema.org/InStock',
        price: service.price || undefined,
        priceCurrency: 'ZAR',
        itemOffered: {
          '@type': 'Service',
          name: normalizeServiceName(service),
          description: service.description || undefined,
          category: normalizeServiceCategory(service) || undefined,
          provider: {
            '@type': 'BeautySalon',
            name: salon.name,
            url: `${siteUrl}/salons/${salonIdentifier}`,
          },
        },
      })),
    };
  }

  return structuredData;
}

/**
 * Generate breadcrumb structured data for salon page
 */
export function generateSalonBreadcrumb(salon: Salon): object {
  const { provinceSlug, citySlug } = getLocationSegments(salon);
  const items: Array<Record<string, unknown>> = [
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
  ];

  let currentPosition = 3;

  if (provinceSlug && salon.province) {
    items.push({
      '@type': 'ListItem',
      position: currentPosition++,
      name: salon.province,
      item: `${siteUrl}/salons/location/${provinceSlug}`,
    });
  }

  if (provinceSlug && citySlug && salon.city) {
    items.push({
      '@type': 'ListItem',
      position: currentPosition++,
      name: salon.city,
      item: `${siteUrl}/salons/location/${provinceSlug}/${citySlug}`,
    });
  }

  items.push({
    '@type': 'ListItem',
    position: currentPosition,
    name: salon.name,
    item: `${siteUrl}/salons/${salon.slug || salon.id}`,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
