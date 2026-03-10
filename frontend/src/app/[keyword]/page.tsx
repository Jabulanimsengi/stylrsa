import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getFirstPageForKeyword,
} from '@/lib/seo-api';
import { generateNationalSeoPageContent, isValidKeyword } from '@/lib/seo-generation';

interface PageProps {
  params: Promise<{
    keyword: string;
  }>;
}

// Force dynamic rendering so the page always fetches fresh SEO data
// Without this, Next.js pre-renders the page at build time when the backend
// is unreachable (in Docker build), resulting in 'Not Found' being cached
export const dynamic = 'force-dynamic';

// Top priority keywords to pre-build
const PRIORITY_KEYWORDS = ['hair-salon', 'nail-salon', 'braiding', 'barbershop', 'spa', 'makeup', 'waxing', 'massage'];

/**
 * Generate static params for crucial keyword pages only (~8 pages)
 * Other pages will be generated on-demand via ISR
 */
export async function generateStaticParams() {
  return PRIORITY_KEYWORDS.map(keyword => ({ keyword }));
}

/**
 * Generate metadata from cached SEO data or local fallback
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { keyword } = await params;

  // Filter out invalid paths early
  const invalidPrefixes = ['_vercel', '_next', 'api', 'static', 'favicon'];
  const invalidExtensions = ['.js', '.css', '.json', '.ico', '.png', '.jpg', '.svg', '.woff', '.woff2', '.xml', '.txt'];

  if (
    invalidPrefixes.includes(keyword) ||
    invalidExtensions.some(ext => keyword.endsWith(ext))
  ) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `https://www.stylrsa.co.za/${keyword}`;

  // Try API first
  try {
    const cachedPage = await getFirstPageForKeyword(keyword);
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
  // Only use local fallback if it's a known static keyword
  if (isValidKeyword(keyword)) {
    const localPage = generateNationalSeoPageContent(keyword);
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
  }

  return {
    title: 'Service | Stylr SA',
    description: 'Browse services and book your appointment online.',
  };
}

/**
 * Keyword-only SEO landing page
 * Uses backend API data when available, falls back to local generation
 */
export default async function KeywordPage({ params }: PageProps) {
  const { keyword } = await params;

  // Filter out invalid paths (Vercel scripts, static files, etc.)
  const invalidPrefixes = ['_vercel', '_next', 'api', 'static', 'favicon'];
  const invalidExtensions = ['.js', '.css', '.json', '.ico', '.png', '.jpg', '.svg', '.woff', '.woff2', '.xml', '.txt'];

  if (
    invalidPrefixes.includes(keyword) ||
    invalidExtensions.some(ext => keyword.endsWith(ext))
  ) {
    notFound();
  }

  let pageData: any = null;

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
          <li className="text-gray-900 font-medium">
            {pageData.keyword?.keyword || keyword}
          </li>
        </ol>
      </nav>

      {/* H1 Heading */}
      <h1 className="text-4xl font-bold mb-6">{pageData.h1}</h1>

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
      {pageData.nearbyLocations && pageData.nearbyLocations.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {pageData.keyword?.keyword || keyword} in Nearby Locations
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
          Ready to Book {pageData.keyword?.keyword || keyword}?
        </h2>
        <p className="text-gray-700 mb-6">
          Browse our verified professionals and book your appointment online
          today.
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
