import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getSeoPageByUrl,
} from '@/lib/seo-api';
import { generateLocalSeoPageContent, SEO_KEYWORDS } from '@/lib/seo-generation';
import { hasBlockedSeoSegment } from '@/lib/seoRouteGuard';

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

// Top priority keywords to pre-build
const PRIORITY_KEYWORDS = ['hair-salon', 'nail-salon', 'braiding', 'barbershop', 'spa'];
const PRIORITY_PROVINCES = ['gauteng', 'western-cape'];
const PRIORITY_CITIES = ['johannesburg', 'pretoria', 'cape-town', 'sandton'];

/**
 * Generate static params for crucial pages only (~75 pages)
 * Other pages will be generated on-demand via ISR
 */
export async function generateStaticParams() {
  const params = [];
  for (const keyword of PRIORITY_KEYWORDS) {
    for (const province of PRIORITY_PROVINCES) {
      for (const city of PRIORITY_CITIES) {
        params.push({ keyword, province, city });
      }
    }
  }
  return params;
}

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

  try {
    // Try to get cached page from API first
    const cachedPage = await getSeoPageByUrl(url);

    if (cachedPage) {
      return {
        title: cachedPage.metaTitle,
        description: cachedPage.metaDescription,
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title: cachedPage.metaTitle,
          description: cachedPage.metaDescription,
          type: 'website',
          url: canonicalUrl,
          siteName: 'Stylr SA',
          locale: 'en_ZA',
        },
        twitter: {
          card: 'summary_large_image',
          title: cachedPage.metaTitle,
          description: cachedPage.metaDescription,
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
      title: localPage.metaTitle,
      description: localPage.metaDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: localPage.metaTitle,
        description: localPage.metaDescription,
        type: 'website',
        url: canonicalUrl,
        siteName: 'Stylr SA',
        locale: 'en_ZA',
      },
      twitter: {
        card: 'summary_large_image',
        title: localPage.metaTitle,
        description: localPage.metaDescription,
        site: '@stylrsa',
      },
    };
  }

  return {
    title: 'Service | Stylr SA',
    description: 'Browse services and book your appointment online.',
  };
}

/**
 * Keyword + Province + City SEO landing page
 * Uses backend API data when available, falls back to local generation
 */
export default async function KeywordProvinceCityPage({ params }: PageProps) {
  const { keyword, province, city } = await params;

  // Filter out invalid paths (Vercel scripts, static files, etc.)
  if (hasBlockedSeoSegment([keyword, province, city])) {
    notFound();
  }

  // Check if this is a valid SEO keyword
  if (!SEO_KEYWORDS.includes(keyword)) {
    notFound();
  }

  const url = `/${keyword}/${province}/${city}`;
  let pageData: any = null;

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

  // Parse schema markup
  const schemaMarkup = pageData.schemaMarkup;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Schema.org JSON-LD */}
      {schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      )}

      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-600">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-primary">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${keyword}`} className="hover:text-primary">{pageData.keyword?.keyword || keyword}</Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${keyword}/${province}`} className="hover:text-primary">{pageData.location?.province || province}</Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">
            {pageData.location?.name || city}
          </li>
        </ol>
      </nav>

      {/* H1 Heading */}
      <h1 className="text-4xl font-bold mb-6">{pageData.h1}</h1>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            {pageData.serviceCount}
          </span>
          <span className="text-gray-600">Services Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            {pageData.salonCount}
          </span>
          <span className="text-gray-600">Verified Salons</span>
        </div>
        {pageData.avgPrice && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              R{Number(pageData.avgPrice).toFixed(0)}
            </span>
            <span className="text-gray-600">Average Price</span>
          </div>
        )}
      </div>

      {/* Intro Text */}
      <div className="prose max-w-none mb-8">
        {pageData.introText.split('\n\n').map((paragraph: string, index: number) => (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* H2 Sections */}
      {pageData.h2Headings.map((heading: string, index: number) => (
        <section key={index} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{heading}</h2>
          <div className="text-gray-700">
            {/* Content will be added in task 5 */}
            <p>Content for {heading}</p>
          </div>
        </section>
      ))}

      {/* Related Services */}
      {pageData.relatedServices && pageData.relatedServices.length > 0 && pageData.location && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Related Services in {pageData.location.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pageData.relatedServices.map((service: any, index: number) => (
              <Link
                key={index}
                href={service.url}
                className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all"
              >
                <span className="text-sm font-medium">{service.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Locations */}
      {pageData.nearbyLocations && pageData.nearbyLocations.length > 0 && pageData.keyword && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {pageData.keyword.keyword} in Nearby Areas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pageData.nearbyLocations.map((location: any, index: number) => (
              <Link
                key={index}
                href={location.url}
                className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all"
              >
                <span className="text-sm font-medium">{location.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="mt-12 p-8 bg-primary/10 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Book {pageData.keyword?.keyword || keyword} in{' '}
          {pageData.location?.name || city}?
        </h2>
        <p className="text-gray-700 mb-6">
          Browse {pageData.serviceCount} verified services and book your
          appointment online today.
        </p>
        <Link
          href="/services"
          className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Browse All Services
        </Link>
      </section>
    </div>
  );
}

