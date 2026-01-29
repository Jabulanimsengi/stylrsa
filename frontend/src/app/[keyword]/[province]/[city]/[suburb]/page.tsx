import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getSeoPageByUrl,
  getLocationById,
} from '@/lib/seo-api';

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

// No suburb pages pre-built - all generated on-demand
export async function generateStaticParams() {
  return [];
}

/**
 * Generate metadata from cached SEO data
 * Returns safe defaults if data unavailable
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { keyword, province, city, suburb } = await params;
  const url = `/${keyword}/${province}/${city}/${suburb}`;

  try {
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
  } catch (error) {
    console.warn('Failed to generate metadata for:', url, error);
    return {
      title: 'Service | Stylr SA',
      description: 'Browse services and book your appointment online.',
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
        console.warn('Failed to fetch parent city:', error);
      }
    }

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
            <li>
              <a href={`/${keyword}/${province}`} className="hover:text-primary">
                {cachedPage.location?.province || province}
              </a>
            </li>
            <li>/</li>
            {parentCity && (
              <>
                <li>
                  <a
                    href={`/${keyword}/${province}/${city}`}
                    className="hover:text-primary"
                  >
                    {parentCity.name}
                  </a>
                </li>
                <li>/</li>
              </>
            )}
            <li className="text-gray-900 font-medium">
              {cachedPage.location?.name || suburb}
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
              {cachedPage.keyword.keyword} in Nearby Suburbs
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
            {cachedPage.location?.name || suburb}?
          </h2>
          <p className="text-gray-700 mb-6">
            {cachedPage.serviceCount > 0
              ? `Browse ${cachedPage.serviceCount} verified services and book your appointment online today.`
              : 'Be the first to list your services in this area!'}
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
  } catch (error) {
    console.warn('Error rendering SEO page for:', url, error);
    notFound();
  }
}
