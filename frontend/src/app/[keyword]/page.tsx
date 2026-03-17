import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getFirstPageForKeyword,
  type SeoPageCache,
} from '@/lib/seo-api';
import { generateNationalSeoPageContent, isValidKeyword } from '@/lib/seo-generation';
import { buildSeoLandingRobots } from '@/lib/seoIndexability';
import { buildKeywordLandingMetadata } from '@/lib/seoMetadataHelpers';
import { isBlockedSeoSegment } from '@/lib/seoRouteGuard';
import CachedSeoLandingPage from '@/components/SEOLandingPage/CachedSeoLandingPage';

interface PageProps {
  params: Promise<{
    keyword: string;
  }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

/**
 * Generate metadata from cached SEO data or local fallback
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { keyword } = await params;

  // Filter out invalid paths early
  if (isBlockedSeoSegment(keyword)) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `https://www.stylrsa.co.za/${keyword}`;
  const metadataFields = buildKeywordLandingMetadata({ keyword });

  // Try API first
  try {
    const cachedPage = await getFirstPageForKeyword(keyword);
    if (cachedPage) {
      return {
        title: metadataFields.title,
        description: metadataFields.description,
        robots: buildSeoLandingRobots(cachedPage, 'national'),
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
  // Only use local fallback if it's a known static keyword
  if (isValidKeyword(keyword)) {
    const localPage = generateNationalSeoPageContent(keyword);
    if (localPage) {
      return {
        title: metadataFields.title,
        description: metadataFields.description,
        robots: buildSeoLandingRobots(localPage, 'national'),
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
  }

  return {
    title: 'Service | Stylr SA',
    description: 'Browse services and book your appointment online.',
    robots: { index: false, follow: true },
  };
}

/**
 * Keyword-only SEO landing page
 * Uses backend API data when available, falls back to local generation
 */
export default async function KeywordPage({ params }: PageProps) {
  const { keyword } = await params;

  // Filter out invalid paths (framework assets, static files, etc.)
  if (isBlockedSeoSegment(keyword)) {
    notFound();
  }

  let pageData: SeoPageCache | ReturnType<typeof generateNationalSeoPageContent> | null = null;

  // Try API first
  try {
    pageData = await getFirstPageForKeyword(keyword);
  } catch {
    // API unavailable, will use local fallback
  }

  // Fall back to local generation (national level)
  // Only use local fallback if it's a known static keyword
  if (!pageData && isValidKeyword(keyword)) {
    pageData = generateNationalSeoPageContent(keyword);
  }

  if (!pageData) {
    notFound();
  }

  return (
    <CachedSeoLandingPage
      pageData={pageData}
      keywordFallback={keyword}
      locationFallback="South Africa"
      breadcrumbs={[
        { label: 'Home', url: '/' },
        { label: pageData.keyword?.keyword || keyword, url: `/${keyword}` },
      ]}
    />
  );
}
