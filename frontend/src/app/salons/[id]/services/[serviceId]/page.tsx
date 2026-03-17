import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import Script from 'next/script';
import type { Salon, Service } from '@/types';
import { buttonVariants } from '@/components/ui';
import styles from './ServiceSeoPage.module.css';
import { cn } from '@/lib/utils';
import {
  buildSalonLocationLinks,
  buildSalonServiceSlug,
  buildSalonServiceLinks,
  extractServiceIdFromSlug,
  buildSalonServiceUrl,
  generateSalonBreadcrumb,
} from '@/lib/salonSeoHelpers';
import { getInternalBackendOrigin } from '@/lib/server/backend-origin';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
const SALON_REVALIDATE_SECONDS = 300;
export const revalidate = 300;

const buildApiUrl = (base: string | undefined, path: string) => {
  if (!base) return path;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const fetchSalonWithTimeout = async (url: string, timeoutMs = 15000): Promise<Salon | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      next: { revalidate: SALON_REVALIDATE_SECONDS },
      signal: controller.signal,
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

async function getSalon(id: string): Promise<Salon | null> {
  const baseUrl =
    getInternalBackendOrigin() ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_PATH ||
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    'http://127.0.0.1:5000';
  const isBuildPhase = process.env.IS_BUILD_PHASE === 'true' || process.env.NEXT_PHASE === 'phase-production-build';

  if (isBuildPhase && (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'))) {
    return null;
  }

  return fetchSalonWithTimeout(buildApiUrl(baseUrl, `/api/salons/${id}`));
}

function getServiceName(service: Service) {
  return service.title || service.name || 'Beauty service';
}

function getServiceCategory(service: Service) {
  if (typeof service.category === 'string' && service.category.trim().length > 0) {
    return service.category.trim();
  }

  if (service.category && typeof service.category === 'object' && 'name' in service.category) {
    const name = (service.category as { name?: string }).name;
    return typeof name === 'string' ? name : '';
  }

  return '';
}

function buildServiceStructuredData(salon: Salon, service: Service) {
  const serviceName = getServiceName(service);
  const serviceUrl = buildSalonServiceUrl(salon, service);

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': serviceUrl,
    name: serviceName,
    description: service.description,
    category: getServiceCategory(service) || undefined,
    serviceType: getServiceCategory(service) || undefined,
    areaServed: [salon.town, salon.city, salon.province, 'South Africa'].filter(Boolean),
    provider: {
      '@type': 'BeautySalon',
      name: salon.name,
      url: `${siteUrl}/salons/${salon.slug || salon.id}`,
      telephone: salon.phoneNumber || undefined,
      address: {
        '@type': 'PostalAddress',
        addressLocality: salon.town || salon.city || undefined,
        addressRegion: salon.province || undefined,
        addressCountry: 'ZA',
      },
    },
    offers: {
      '@type': 'Offer',
      url: serviceUrl,
      price: service.price,
      priceCurrency: 'ZAR',
      availability: 'https://schema.org/InStock',
    },
  };
}

function buildServiceBreadcrumb(salon: Salon, service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Salons',
        item: `${siteUrl}/salons`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: salon.name,
        item: `${siteUrl}/salons/${salon.slug || salon.id}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: getServiceName(service),
        item: buildSalonServiceUrl(salon, service),
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; serviceId: string }>;
}): Promise<Metadata> {
  const { id, serviceId } = await params;
  const salon = await getSalon(id);
  const resolvedServiceId = extractServiceIdFromSlug(serviceId);
  const service = salon?.services?.find((item) => item.id === resolvedServiceId);

  if (!salon || !service) {
    return {
      title: 'Service Not Found | Stylr SA',
      description: 'The requested service could not be found.',
      robots: { index: false, follow: true },
    };
  }

  const serviceName = getServiceName(service);
  const locationLabel = [salon.town && salon.town !== salon.city ? salon.town : null, salon.city, salon.province]
    .filter(Boolean)
    .join(', ');
  const canonicalUrl = buildSalonServiceUrl(salon, service);
  const imageUrl = service.images?.[0] || salon.backgroundImage || salon.logo || `${siteUrl}/logo-transparent.png`;
  const category = getServiceCategory(service);

  const title = `${serviceName} at ${salon.name} | ${locationLabel} | Stylr SA`;
  const description = service.description?.trim().length
    ? `${service.description.slice(0, 140)} Book ${serviceName.toLowerCase()} at ${salon.name} in ${locationLabel}.`
    : `Book ${serviceName.toLowerCase()} at ${salon.name} in ${locationLabel}. View pricing, salon details, and booking options on Stylr SA.`;

  const keywords = Array.from(new Set([
    serviceName,
    category,
    salon.name,
    salon.city,
    salon.town,
    salon.province,
    `${serviceName} ${salon.city}`,
    `${serviceName} ${salon.province}`,
  ].filter(Boolean))).join(', ');

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Stylr SA',
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${serviceName} at ${salon.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SalonServiceSeoPage({
  params,
}: {
  params: Promise<{ id: string; serviceId: string }>;
}) {
  const { id, serviceId } = await params;
  const salon = await getSalon(id);
  const resolvedServiceId = extractServiceIdFromSlug(serviceId);
  const service = salon?.services?.find((item) => item.id === resolvedServiceId);

  if (!salon || !service) {
    notFound();
  }

  const canonicalServiceSlug = buildSalonServiceSlug(service);
  if (serviceId !== canonicalServiceSlug) {
    permanentRedirect(`/salons/${salon.slug || salon.id}/services/${canonicalServiceSlug}`);
  }

  const serviceName = getServiceName(service);
  const category = getServiceCategory(service);
  const serviceUrl = buildSalonServiceUrl(salon, service);
  const bookingUrl = `/salons/${salon.slug || salon.id}?serviceId=${service.id}`;
  const locationLinks = buildSalonLocationLinks(salon);
  const serviceLinks = buildSalonServiceLinks(salon).filter((link) => !category || !link.label.startsWith(category));
  const serviceStructuredData = buildServiceStructuredData(salon, service);
  const breadcrumbData = buildServiceBreadcrumb(salon, service);
  const salonBreadcrumbData = generateSalonBreadcrumb(salon);

  return (
    <div className={styles.page}>
      <Script
        id="service-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
      />
      <Script
        id="service-breadcrumb-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <Script
        id="service-salon-breadcrumb-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(salonBreadcrumbData) }}
      />

      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/salons">Salons</Link>
        <span>/</span>
        <Link href={`/salons/${salon.slug || salon.id}`}>{salon.name}</Link>
        <span>/</span>
        <span>{serviceName}</span>
      </nav>

      <section className={styles.hero}>
        <article className={styles.card}>
          <span className={styles.eyebrow}>Service detail</span>
          <h1 className={styles.title}>{serviceName}</h1>
          <p className={styles.description}>
            {service.description || `Book ${serviceName.toLowerCase()} at ${salon.name} and explore a cleaner service page built for search, discovery, and direct booking.`}
          </p>

          <div className={styles.metaRow}>
            {category && <span className={styles.metaPill}>{category}</span>}
            <span className={styles.metaPill}>R{service.price.toFixed(0)}</span>
            <span className={styles.metaPill}>{service.duration} min</span>
            <span className={styles.metaPill}>{salon.city}, {salon.province}</span>
          </div>

          <div className={styles.ctaRow}>
            <Link href={bookingUrl} className={cn(buttonVariants({ variant: 'default', size: 'lg' }), styles.ctaButton)}>
              Book this service
            </Link>
            <Link href={`/salons/${salon.slug || salon.id}`} className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), styles.ctaButton)}>
              View salon profile
            </Link>
          </div>
        </article>

        <aside className={styles.card}>
          <h2 className={styles.infoTitle}>Salon snapshot</h2>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Salon</span>
              <span className={styles.infoValue}>{salon.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Location</span>
              <span className={styles.infoValue}>{[salon.town, salon.city, salon.province].filter(Boolean).join(', ')}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Service URL</span>
              <span className={styles.infoValue}>{serviceUrl.replace(siteUrl, '')}</span>
            </div>
          </div>
        </aside>
      </section>

      {locationLinks.length > 0 && (
        <section className={styles.linksSection}>
          <h2 className={styles.linksTitle}>Explore this area</h2>
          <div className={styles.linkGrid}>
            {locationLinks.map((link) => (
              <Link key={link.url} href={link.url} className={styles.linkCard}>
                <span>{link.label}</span>
                <span className={styles.linkArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {serviceLinks.length > 0 && (
        <section className={styles.linksSection}>
          <h2 className={styles.linksTitle}>Related services in this area</h2>
          <div className={styles.linkGrid}>
            {serviceLinks.map((link) => (
              <Link key={link.url} href={link.url} className={styles.linkCard}>
                <span>{link.label}</span>
                <span className={styles.linkArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
