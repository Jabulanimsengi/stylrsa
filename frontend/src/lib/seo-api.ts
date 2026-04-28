/**
 * SEO API client for fetching cached page data from backend
 */
import { toErrorMessage } from '@/lib/server/build-runtime';

// Get API URL dynamically to handle env var changes
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

// Check if we should skip API calls (only during build phase with localhost)
function shouldSkipFetch(): boolean {
  const apiUrl = getApiBaseUrl();

  // Always skip localhost API during build - it won't be accessible
  if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
    const isBuildPhase =
      process.env.IS_BUILD_PHASE === 'true' ||
      process.env.NEXT_PHASE === 'phase-production-build';

    if (isBuildPhase) {
      return true;
    }
  }

  return false;
}

export interface SeoKeyword {
  id: number;
  keyword: string;
  slug: string;
  category: string;
  priority: number;
}

export interface SeoLocation {
  id: number;
  name: string;
  slug: string;
  type: string;
  province: string;
  provinceSlug: string;
  parentLocationId: number | null;
}

interface SeoRelatedLink {
  label: string;
  url: string;
  type?: 'service' | 'location';
}

export interface SeoPageCache {
  id: number;
  keywordId: number;
  locationId: number;
  url: string;
  h1: string;
  h2Headings: string[];
  h3Headings: string[];
  introText: string;
  metaTitle: string;
  metaDescription: string;
  schemaMarkup: unknown;
  relatedServices: SeoRelatedLink[];
  nearbyLocations: SeoRelatedLink[];
  serviceCount: number;
  salonCount: number;
  avgPrice: number | null;
  lastGenerated: Date;
  keyword?: SeoKeyword;
  location?: SeoLocation;
}

/**
 * Fetch cached SEO page data by URL
 * Returns null on any error to allow local fallback generation
 */
export async function getSeoPageByUrl(url: string): Promise<SeoPageCache | null> {
  if (shouldSkipFetch()) return null;

  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/by-url?url=${encodeURIComponent(url)}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Get top keywords for static generation
 */
export async function getTopKeywords(limit: number = 100): Promise<{ slug: string }[]> {
  if (shouldSkipFetch()) return [];

  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/keywords/top?limit=${limit}`, {
      next: { revalidate: 86400 },
      cache: 'force-cache',
    });

    if (!response.ok) {
      console.warn(`Failed to fetch keywords: ${response.status} ${response.statusText}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching keywords, returning empty array:', toErrorMessage(error));
    return [];
  }
}

/**
 * Get all provinces
 */
export async function getProvinces(): Promise<{ provinceSlug: string }[]> {
  if (shouldSkipFetch()) return [];

  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/locations/provinces`, {
      next: { revalidate: 86400 },
      cache: 'force-cache',
    });

    if (!response.ok) {
      console.warn(`Failed to fetch provinces: ${response.status} ${response.statusText}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching provinces, returning empty array:', toErrorMessage(error));
    return [];
  }
}

/**
 * Get top cities for static generation
 */
export async function getTopCities(limit: number = 100): Promise<{ slug: string; provinceSlug: string }[]> {
  if (shouldSkipFetch()) return [];

  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/locations/cities/top?limit=${limit}`, {
      next: { revalidate: 86400 },
      cache: 'force-cache',
    });

    if (!response.ok) {
      console.warn(`Failed to fetch cities: ${response.status} ${response.statusText}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching cities, returning empty array:', toErrorMessage(error));
    return [];
  }
}

/**
 * Get location by ID
 * Returns null on any error to allow fallback
 */
export async function getLocationById(id: number): Promise<SeoLocation | null> {
  if (shouldSkipFetch()) return null;

  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/locations/${id}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Get first cached page for a keyword (any location)
 * Returns null on any error to allow fallback
 */
export async function getFirstPageForKeyword(slug: string): Promise<SeoPageCache | null> {
  if (shouldSkipFetch()) return null;

  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/keyword/${slug}/first`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Get keyword by slug
 * Returns null on any error to allow fallback
 */
export async function getKeywordBySlug(slug: string): Promise<SeoKeyword | null> {
  if (shouldSkipFetch()) return null;

  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/keywords/${slug}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}
