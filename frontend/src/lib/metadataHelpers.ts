/**
 * Metadata Helpers
 * Utility functions to ensure consistent, SEO-friendly metadata across the site
 */

import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
const SITE_NAME = 'Stylr SA';
const DEFAULT_IMAGE = `${SITE_URL}/logo-transparent.png`;

export interface MetadataConfig {
  title: string;
  description: string;
  keywords?: string;
  path: string; // e.g., "/salons/gauteng" (without domain)
  image?: string;
  noIndex?: boolean; // Set to true for pages you don't want indexed
  type?: 'website' | 'article' | 'profile';
}

/**
 * Generate complete, SEO-optimized metadata for a page
 * Ensures all required fields are present and canonical URLs are correct
 */
export function generatePageMetadata(config: MetadataConfig): Metadata {
  const {
    title,
    description,
    keywords,
    path,
    image = DEFAULT_IMAGE,
    noIndex = false,
    type = 'website',
  } = config;

  // Ensure path starts with / and doesn't have trailing slash (except for root)
  const normalizedPath = path === '/' ? '' : path.replace(/\/$/, '').replace(/^([^/])/, '/$1');
  const canonicalUrl = `${SITE_URL}${normalizedPath}`;

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };

  // Add keywords if provided
  if (keywords) {
    metadata.keywords = keywords;
  }

  // Add robots meta tag for no-index pages
  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: true, // Still follow links
    };
  }

  return metadata;
}

/**
 * Ensure a URL is absolute and properly formatted
 */
export function ensureAbsoluteUrl(urlOrPath: string): string {
  // If already absolute, return as-is
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }

  // Add domain to relative path
  const normalizedPath = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${SITE_URL}${normalizedPath}`;
}

/**
 * Normalize a URL path (remove trailing slashes, ensure leading slash)
 */
export function normalizePath(path: string): string {
  if (path === '/') return '/';
  return path.replace(/\/$/, '').replace(/^([^/])/, '/$1');
}

/**
 * Generate metadata for error pages (404, 500, etc.)
 */
export function generateErrorMetadata(statusCode: number, path: string): Metadata {
  const titles: Record<number, string> = {
    404: 'Page Not Found',
    500: 'Server Error',
    403: 'Access Denied',
  };

  const descriptions: Record<number, string> = {
    404: 'The page you are looking for could not be found.',
    500: 'An error occurred while processing your request.',
    403: 'You do not have permission to access this page.',
  };

  return generatePageMetadata({
    title: `${titles[statusCode] || 'Error'} | ${SITE_NAME}`,
    description: descriptions[statusCode] || 'An error occurred.',
    path,
    noIndex: true, // Don't index error pages
  });
}

/**
 * Generate metadata for paginated content
 * @param pageNumber - Current page number (1-indexed)
 * @param totalPages - Total number of pages
 */
export function generatePaginatedMetadata(
  baseConfig: Omit<MetadataConfig, 'path'>,
  basePath: string,
  pageNumber: number,
  totalPages: number
): Metadata {
  const isFirstPage = pageNumber === 1;
  const title = isFirstPage ? baseConfig.title : `${baseConfig.title} - Page ${pageNumber}`;

  const metadata = generatePageMetadata({
    ...baseConfig,
    title,
    path: isFirstPage ? basePath : `${basePath}?page=${pageNumber}`,
    // Don't index pages beyond the first page
    noIndex: !isFirstPage,
  });

  // For paginated content, canonical should point to page 1
  if (!isFirstPage) {
    metadata.alternates = {
      canonical: ensureAbsoluteUrl(basePath),
    };
  }

  // Add rel="next" and rel="prev" for pagination
  if (pageNumber > 1) {
    metadata.alternates = {
      ...metadata.alternates,
      // @ts-ignore - Next.js supports this but types are incomplete
      prev: pageNumber === 2
        ? ensureAbsoluteUrl(basePath)
        : ensureAbsoluteUrl(`${basePath}?page=${pageNumber - 1}`),
    };
  }

  if (pageNumber < totalPages) {
    metadata.alternates = {
      ...metadata.alternates,
      // @ts-ignore - Next.js supports this but types are incomplete
      next: ensureAbsoluteUrl(`${basePath}?page=${pageNumber + 1}`),
    };
  }

  return metadata;
}

/**
 * Get site URL (useful for components that need the base URL)
 */
export function getSiteUrl(): string {
  return SITE_URL;
}

/**
 * Get site name
 */
export function getSiteName(): string {
  return SITE_NAME;
}

/**
 * Generate a safe metadata object that won't crash the build
 * Use this as a fallback in try-catch blocks
 */
export function generateFallbackMetadata(path: string = '/'): Metadata {
  return {
    title: SITE_NAME,
    description: 'Book beauty and wellness services in South Africa',
    alternates: {
      canonical: ensureAbsoluteUrl(path),
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

/**
 * Validate metadata configuration
 * Returns array of validation errors (empty if valid)
 */
export function validateMetadata(metadata: Metadata): string[] {
  const errors: string[] = [];

  if (!metadata.title) {
    errors.push('Missing title');
  }

  if (!metadata.description) {
    errors.push('Missing description');
  }

  if (!metadata.alternates?.canonical) {
    errors.push('Missing canonical URL');
  } else {
    const canonical = metadata.alternates.canonical as string;
    if (!canonical.startsWith('http://') && !canonical.startsWith('https://')) {
      errors.push('Canonical URL must be absolute (include https://)');
    }
    if (canonical.endsWith('/') && canonical !== SITE_URL + '/') {
      errors.push('Canonical URL should not have trailing slash');
    }
  }

  if (metadata.description && metadata.description.length > 160) {
    errors.push(`Description too long (${metadata.description.length} chars, max 160)`);
  }

  if (metadata.title) {
    const titleLength = typeof metadata.title === 'string' ? metadata.title.length : metadata.title.absolute?.length || 0;
    if (titleLength > 60) {
      errors.push(`Title too long (${titleLength} chars, recommended max 60)`);
    }
  }

  return errors;
}
