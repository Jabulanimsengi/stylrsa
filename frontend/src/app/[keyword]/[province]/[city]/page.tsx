import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getSeoPageByUrl,
  type SeoPageCache,
} from '@/lib/seo-api';
import { generateLocalSeoPageContent, SEO_KEYWORDS } from '@/lib/seo-generation';
import { buildSeoLandingRobots } from '@/lib/seoIndexability';
import { buildKeywordLandingMetadata } from '@/lib/seoMetadataHelpers';
import { hasBlockedSeoSegment } from '@/lib/seoRouteGuard';
import CachedSeoLandingPage from '@/components/SEOLandingPage/CachedSeoLandingPage';

interface PageProps {
  params: Promise<{
    keyword: string;
    province: string;
    city: string;
  }>;
}

// ISR - pages cached for 24 hours, regenerated in background
export const dynamicParams = true; // Allow any params (ISR)
export const revalidate = 86400; // Cache for 24 hours

/**
 * Generate metadata from cached SEO data or local fallback
 * Returns safe defaults if data unavailable
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { keyword, province, city } = await params;

  // Filter out invalid paths early
  if (hasBlockedSeoSegment([keyword, province, city])) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
    };
  }

  const url = `/${keyword}/${province}/${city}`;
  const canonicalUrl = `https://www.stylrsa.co.za${url}`;
  const metadataFields = buildKeywordLandingMetadata({ keyword, province, city });

  try {
    // Try to get cached page from API first
    const cachedPage = await getSeoPageByUrl(url);

    if (cachedPage) {
      return {
        title: metadataFields.title,
        description: metadataFields.description,
        robots: buildSeoLandingRobots(cachedPage, 'city'),
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title: metadataFields.title,
          description: metadataFields.description,
          type: 'website',
          url: canonicalUrl,
          siteName: 'Stylr SA',
          locale: 'en_ZA',
        },
        twitter: {
          card: 'summary_large_image',
          title: metadataFields.title,
          description: metadataFields.description,
          site: '@stylrsa',
        },
      };
    }
  } catch {
    // Fall through to local generation
  }

  // Generate metadata from local data as fallback
  const localPage = generateLocalSeoPageContent(keyword, province, city);
  if (localPage) {
    return {
      title: metadataFields.title,
      description: metadataFields.description,
      robots: buildSeoLandingRobots(localPage, 'city'),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: metadataFields.title,
        description: metadataFields.description,
        type: 'website',
        url: canonicalUrl,
        siteName: 'Stylr SA',
        locale: 'en_ZA',
      },
      twitter: {
        card: 'summary_large_image',
        title: metadataFields.title,
        description: metadataFields.description,
        site: '@stylrsa',
      },
    };
  }

  return {
    title: 'Service | Stylr SA',
    description: 'Browse services and book your appointment online.',
    robots: { index: false, follow: true },
  };
}

/**
 * Keyword + Province + City SEO landing page
 * Uses backend API data when available, falls back to local generation
 */
export default async function KeywordProvinceCityPage({ params }: PageProps) {
  const { keyword, province, city } = await params;

  // Filter out invalid paths (framework assets, static files, etc.)
  if (hasBlockedSeoSegment([keyword, province, city])) {
    notFound();
  }

  // Check if this is a valid SEO keyword
  if (!SEO_KEYWORDS.includes(keyword)) {
    notFound();
  }

  const url = `/${keyword}/${province}/${city}`;
  let pageData: SeoPageCache | ReturnType<typeof generateLocalSeoPageContent> | null = null;

  // Try to get cached page from API first
  try {
    pageData = await getSeoPageByUrl(url);
  } catch {
    // API unavailable, will use local fallback
  }

  // Fall back to local generation if API doesn't have the data
  if (!pageData) {
    pageData = generateLocalSeoPageContent(keyword, province, city);
  }

  // If still no data (invalid location), return 404
  if (!pageData) {
    notFound();
  }

  return (
    <CachedSeoLandingPage
      pageData={pageData}
      keywordFallback={keyword}
      locationFallback={city}
      breadcrumbs={[
        { label: 'Home', url: '/' },
        { label: pageData.keyword?.keyword || keyword, url: `/${keyword}` },
        { label: pageData.location?.province || province, url: `/${keyword}/${province}` },
        { label: pageData.location?.name || city, url: `/${keyword}/${province}/${city}` },
      ]}
    />
  );
}

