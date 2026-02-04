import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getTopKeywords,
  getFirstPageForKeyword,
  getKeywordBySlug,
} from '@/lib/seo-api';

interface PageProps {
  params: Promise<{
    keyword: string;
  }>;
}

// ISR - pages cached for 24 hours, regenerated in background
export const dynamicParams = true; // Allow any params (ISR)
export const revalidate = 86400; // Cache for 24 hours

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
 * Generate metadata from cached SEO data
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

  // Try to find cached page data
  const cachedPage = await getFirstPageForKeyword(keyword);

  if (!cachedPage) {
    return {
      title: 'Service Not Found | Stylr SA',
      description: 'The service you are looking for could not be found.',
    };
  }

  const canonicalUrl = `https://www.stylrsa.co.za${cachedPage.url}`;

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

/**
 * Keyword-only SEO landing page
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

  // Fetch keyword data
  const keywordData = await getKeywordBySlug(keyword);

  if (!keywordData) {
    notFound();
  }

  // Try to find cached page data (any location for this keyword)
  const cachedPage = await getFirstPageForKeyword(keyword);

  if (!cachedPage) {
    notFound();
  }

  // Parse schema markup
  const schemaMarkup = cachedPage.schemaMarkup;

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
            <a href="/" className="hover:text-primary">
              Home
            </a>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{keywordData.keyword}</li>
        </ol>
      </nav>

      {/* H1 Heading */}
      <h1 className="text-4xl font-bold mb-6">{cachedPage.h1}</h1>

      {/* Intro Text */}
      <div className="prose max-w-none mb-8">
        {cachedPage.introText.split('\n\n').map((paragraph: string, index: number) => (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* H2 Sections */}
      {cachedPage.h2Headings.map((heading: string, index: number) => (
        <section key={index} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{heading}</h2>
          <div className="text-gray-700">
            {/* Content will be added in task 5 */}
            <p>Content for {heading}</p>
          </div>
        </section>
      ))}

      {/* Related Services */}
      {cachedPage.relatedServices && cachedPage.location && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Related Services in {cachedPage.location.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cachedPage.relatedServices.map((service: any, index: number) => (
              <a
                key={index}
                href={service.url}
                className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all"
              >
                <span className="text-sm font-medium">{service.label}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Locations */}
      {cachedPage.nearbyLocations && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {keywordData.keyword} in Nearby Locations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cachedPage.nearbyLocations.map((location: any, index: number) => (
              <a
                key={index}
                href={location.url}
                className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all"
              >
                <span className="text-sm font-medium">{location.label}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="mt-12 p-8 bg-primary/10 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Book {keywordData.keyword}?
        </h2>
        <p className="text-gray-700 mb-6">
          Browse our verified professionals and book your appointment online
          today.
        </p>
        <a
          href="/services"
          className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Browse All Services
        </a>
      </section>
    </div>
  );
}
