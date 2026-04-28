import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getSeoPageByUrl,
  getLocationById,
} from '@/lib/seo-api';
import { buildSeoLandingRobots } from '@/lib/seoIndexability';
import { buildKeywordLandingMetadata } from '@/lib/seoMetadataHelpers';
import { hasBlockedSeoSegment } from '@/lib/seoRouteGuard';
import CachedSeoLandingPage from '@/components/SEOLandingPage/CachedSeoLandingPage';
import { toErrorMessage } from '@/lib/server/build-runtime';

interface PageProps {
  params: Promise<{
    keyword: string;
    province: string;
    city: string;
    suburb: string;
  }>;
}

// ISR - suburb pages generated on-demand only
// Removed force-dynamic to allow ISR caching with on-demand generation
export const dynamicParams = true;
export const revalidate = 86400; // Cache for 24 hours

/**
 * Generate metadata from cached SEO data
 * Returns safe defaults if data unavailable
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { keyword, province, city, suburb } = await params;

  if (hasBlockedSeoSegment([keyword, province, city, suburb])) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
    };
  }

  const url = `/${keyword}/${province}/${city}/${suburb}`;
  const canonicalUrl = `https://www.stylrsa.co.za${url}`;
  const metadataFields = buildKeywordLandingMetadata({ keyword, province, city, suburb });

  try {
    const cachedPage = await getSeoPageByUrl(url);

    if (!cachedPage) {
      return {
        title: 'Service Not Found | Stylr SA',
        description: 'The service you are looking for could not be found.',
        robots: { index: false, follow: true },
      };
    }

    return {
      title: metadataFields.title,
      description: metadataFields.description,
      robots: buildSeoLandingRobots(cachedPage, 'suburb'),
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
  } catch (error) {
    console.warn(`Failed to generate metadata for ${url}:`, toErrorMessage(error));
    return {
      title: 'Service | Stylr SA',
      description: 'Browse services and book your appointment online.',
      robots: { index: false, follow: true },
    };
  }
}

/**
 * Keyword + Province + City + Suburb SEO landing page
 * Generated on-demand with ISR, handles offline backend gracefully
 */
export default async function KeywordProvinceCitySuburbPage({
  params,
}: PageProps) {
  const { keyword, province, city, suburb } = await params;

  if (hasBlockedSeoSegment([keyword, province, city, suburb])) {
    notFound();
  }

  const url = `/${keyword}/${province}/${city}/${suburb}`;

  try {
    const cachedPage = await getSeoPageByUrl(url);

    if (!cachedPage) {
      notFound();
    }

    let parentCity = null;
    if (cachedPage.location?.parentLocationId) {
      try {
        parentCity = await getLocationById(cachedPage.location.parentLocationId);
      } catch (error) {
        console.warn('Failed to fetch parent city:', toErrorMessage(error));
      }
    }

    return (
      <CachedSeoLandingPage
        pageData={cachedPage}
        keywordFallback={keyword}
        locationFallback={suburb}
        breadcrumbs={[
          { label: 'Home', url: '/' },
          { label: cachedPage.keyword?.keyword || keyword, url: `/${keyword}` },
          { label: cachedPage.location?.province || province, url: `/${keyword}/${province}` },
          ...(parentCity ? [{ label: parentCity.name, url: `/${keyword}/${province}/${city}` }] : []),
          { label: cachedPage.location?.name || suburb, url: `/${keyword}/${province}/${city}/${suburb}` },
        ]}
      />
    );
  } catch (error) {
    console.warn(`Error rendering SEO page for ${url}:`, toErrorMessage(error));
    notFound();
  }
}
