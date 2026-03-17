// SEO helper functions for generating metadata and structured data

import type { Metadata } from 'next';
import {
  generateNearYouTitle,
  generateNearYouDescription,
  generateNearYouKeywords,
  CATEGORY_INFO,
} from './nearYouContent';
import { getProvinceInfo, getCityInfo } from './locationData';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

/**
 * Generate metadata for a "near you" page
 * @param hasResults - Whether the page has any results (for no-index on empty pages)
 */
export function generateNearYouMetadata(
  categorySlug: string | null,
  provinceSlug: string | null,
  citySlug: string | null,
  hasResults: boolean = true
): Metadata {
  const title = generateNearYouTitle(categorySlug, provinceSlug, citySlug);
  const description = generateNearYouDescription(categorySlug, provinceSlug, citySlug);
  const keywords = generateNearYouKeywords(categorySlug, provinceSlug, citySlug);

  // Build canonical URL
  let canonicalPath = '';
  if (categorySlug && citySlug && provinceSlug) {
    canonicalPath = `/services/${categorySlug}/near-you/${provinceSlug}/${citySlug}`;
  } else if (categorySlug && provinceSlug) {
    canonicalPath = `/services/${categorySlug}/near-you/${provinceSlug}`;
  } else if (categorySlug) {
    canonicalPath = `/services/${categorySlug}/near-you`;
  } else if (citySlug && provinceSlug) {
    canonicalPath = `/salons/location/${provinceSlug}/${citySlug}`;
  } else if (provinceSlug) {
    canonicalPath = `/salons/location/${provinceSlug}`;
  } else {
    canonicalPath = '/salons/near-you';
  }

  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const shouldIndex = hasResults && Boolean(categorySlug);

  return {
    title,
    description,
    keywords,
    // Generic "near you" salon pages overlap with stronger /salons/location pages.
    robots: shouldIndex
      ? undefined
      : {
          index: false,
          follow: true,
        },
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
          url: `${siteUrl}/logo-transparent.png`,
          width: 800,
          height: 600,
          alt: 'Stylr SA',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(
  categorySlug: string | null,
  provinceSlug: string | null,
  citySlug: string | null
): object {
  const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
  ];

  if (categorySlug) {
    const category = CATEGORY_INFO[categorySlug];
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: 'Services',
      item: `${siteUrl}/services`,
    });
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: category?.name || 'Category',
      item: `${siteUrl}/services/${categorySlug}`,
    });
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: 'Near You',
      item: `${siteUrl}/services/${categorySlug}/near-you`,
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: 'Salons',
      item: `${siteUrl}/salons`,
    });
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: 'Near You',
      item: `${siteUrl}/salons/near-you`,
    });
  }

  if (provinceSlug) {
    const province = getProvinceInfo(provinceSlug);
    if (province) {
      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: province.name,
        item: categorySlug
          ? `${siteUrl}/services/${categorySlug}/near-you/${provinceSlug}`
          : `${siteUrl}/salons/near-you/${provinceSlug}`,
      });
    }
  }

  if (citySlug && provinceSlug) {
    const city = getCityInfo(provinceSlug, citySlug);
    if (city) {
      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: city.name,
        item: categorySlug
          ? `${siteUrl}/services/${categorySlug}/near-you/${provinceSlug}/${citySlug}`
          : `${siteUrl}/salons/near-you/${provinceSlug}/${citySlug}`,
      });
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

/**
 * Generate LocalBusiness structured data for a location
 */
export function generateLocalBusinessSchema(
  categorySlug: string | null,
  provinceSlug: string | null,
  citySlug: string | null
): object | null {
  if (!citySlug || !provinceSlug) {
    return null;
  }

  const city = getCityInfo(provinceSlug, citySlug);
  const province = getProvinceInfo(provinceSlug);
  const category = categorySlug ? CATEGORY_INFO[categorySlug] : null;

  if (!city || !province) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: category
      ? `${category.name} Services in ${city.name}`
      : `Salons in ${city.name}`,
    description: category
      ? `Browse ${category.serviceName} services in ${city.name}, ${province.name}`
      : `Browse salons and beauty services in ${city.name}, ${province.name}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: province.name,
      addressCountry: 'ZA',
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
    },
    url: categorySlug
      ? `${siteUrl}/services/${categorySlug}/near-you/${provinceSlug}/${citySlug}`
      : `${siteUrl}/salons/near-you/${provinceSlug}/${citySlug}`,
  };
}

/**
 * Generate Service structured data
 */
export function generateServiceSchema(
  categorySlug: string | null,
  provinceSlug: string | null,
  citySlug: string | null
): object | null {
  if (!categorySlug) {
    return null;
  }

  const category = CATEGORY_INFO[categorySlug];
  const province = provinceSlug ? getProvinceInfo(provinceSlug) : null;
  const city = provinceSlug && citySlug ? getCityInfo(provinceSlug, citySlug) : null;

  if (!category) {
    return null;
  }

  const serviceArea = city
    ? {
        '@type': 'City',
        name: city.name,
      }
    : province
    ? {
        '@type': 'State',
        name: province.name,
      }
    : {
        '@type': 'Country',
        name: 'South Africa',
      };

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: category.name,
    provider: {
      '@type': 'Organization',
      name: 'Stylr SA',
      url: siteUrl,
    },
    areaServed: serviceArea,
    description: category.descriptionBase,
    url: citySlug && provinceSlug
      ? `${siteUrl}/services/${categorySlug}/near-you/${provinceSlug}/${citySlug}`
      : provinceSlug
      ? `${siteUrl}/services/${categorySlug}/near-you/${provinceSlug}`
      : `${siteUrl}/services/${categorySlug}/near-you`,
  };
}

