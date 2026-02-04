import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getTopKeywords,
  getProvinces,
  getSeoPageByUrl,
} from '@/lib/seo-api';

interface PageProps {
  params: Promise<{
    keyword: string;
    province: string;
  }>;
}

// ISR - pages cached for 24 hours, regenerated in background
export const dynamicParams = true; // Allow any params (ISR)
export const revalidate = 86400; // Cache for 24 hours

// Top priority keywords and provinces to pre-build
const PRIORITY_KEYWORDS = ['hair-salon', 'nail-salon', 'braiding', 'barbershop', 'spa'];
const PRIORITY_PROVINCES = ['gauteng', 'western-cape', 'kwazulu-natal'];

/**
 * Generate static params for crucial pages only (~15 pages)
 * Other pages will be generated on-demand via ISR
 */
export async function generateStaticParams() {
  const params = [];
  for (const keyword of PRIORITY_KEYWORDS) {
    for (const province of PRIORITY_PROVINCES) {
      params.push({ keyword, province });
    }
  }
  return params;
}

/**
 * Generate metadata from cached SEO data
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { keyword, province } = await params;

  // Filter out invalid paths early
  const invalidPrefixes = ['_vercel', '_next', 'api', 'static', 'favicon'];
  const invalidExtensions = ['.js', '.css', '.json', '.ico', '.png', '.jpg', '.svg', '.woff', '.woff2', '.xml', '.txt'];

  if (
    invalidPrefixes.includes(keyword) ||
    invalidExtensions.some(ext => province.endsWith(ext))
  ) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
    };
  }

  const url = `/${keyword}/${province}`;

  const cachedPage = await getSeoPageByUrl(url);

  if (!cachedPage) {
    return {
      title: 'Service Not Found | Stylr SA',
      description: 'The service you are looking for could not be found.',
    };
  }

  const canonicalUrl = `https://www.stylrsa.co.za${url}`;

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
 * Keyword + Province SEO landing page
 */
export default async function KeywordProvincePage({ params }: PageProps) {
  const { keyword, province } = await params;

  // Filter out invalid paths (Vercel scripts, static files, etc.)
  const invalidPrefixes = ['_vercel', '_next', 'api', 'static', 'favicon'];
  const invalidExtensions = ['.js', '.css', '.json', '.ico', '.png', '.jpg', '.svg', '.woff', '.woff2', '.xml', '.txt'];

  if (
    invalidPrefixes.includes(keyword) ||
    invalidExtensions.some(ext => province.endsWith(ext))
  ) {
    notFound();
  }

  const url = `/${keyword}/${province}`;

  // Fetch cached page data
  const cachedPage = await getSeoPageByUrl(url);

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
          <li>
            <a href={`/${keyword}`} className="hover:text-primary">
              {cachedPage.keyword?.keyword || keyword}
            </a>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">
            {cachedPage.location?.name || province}
          </li>
        </ol>
      </nav>

      {/* H1 Heading */}
      <h1 className="text-4xl font-bold mb-6">{cachedPage.h1}</h1>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            {cachedPage.serviceCount}
          </span>
          <span className="text-gray-600">Services Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            {cachedPage.salonCount}
          </span>
          <span className="text-gray-600">Verified Salons</span>
        </div>
        {cachedPage.avgPrice && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              R{Number(cachedPage.avgPrice).toFixed(0)}
            </span>
            <span className="text-gray-600">Average Price</span>
          </div>
        )}
      </div>

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
      {cachedPage.nearbyLocations && cachedPage.keyword && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {cachedPage.keyword.keyword} in Other Cities
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
          Ready to Book {cachedPage.keyword?.keyword || keyword} in{' '}
          {cachedPage.location?.name || province}?
        </h2>
        <p className="text-gray-700 mb-6">
          Browse {cachedPage.serviceCount} verified services and book your
          appointment online today.
        </p>
        <a
          href={`/services?province=${cachedPage.location?.name || province}`}
          className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Browse All Services
        </a>
      </section>
    </div>
  );
}
