import React from 'react';
import Link from 'next/link';
import styles from './SEOLandingPage.module.css';

interface Breadcrumb {
  label: string;
  url: string;
}

interface RelatedLink {
  label: string;
  url: string;
  type: 'service' | 'location';
}

interface FaqItem {
  question: string;
  answer: string;
}

interface SEOLandingPageProps {
  h1: string;
  h2Headings: string[];
  h3Headings?: string[];
  introText: string;
  metaTitle: string;
  metaDescription: string;
  breadcrumbs: Breadcrumb[];
  schemaMarkup?: unknown;
  serviceCount: number;
  salonCount: number;
  avgPrice?: number;
  relatedServices?: RelatedLink[];
  nearbyLocations?: RelatedLink[];
  faqItems?: FaqItem[];
  children?: React.ReactNode;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  keyword: string;
  locationName: string;
}

export default function SEOLandingPage({
  h1,
  h2Headings,
  introText,
  breadcrumbs,
  schemaMarkup,
  serviceCount,
  salonCount,
  avgPrice,
  relatedServices,
  nearbyLocations,
  faqItems,
  children,
  ctaTitle,
  ctaDescription,
  ctaButtonText = 'Browse All Services',
  ctaButtonLink = '/services',
  keyword,
  locationName,
}: SEOLandingPageProps) {
  return (
    <div className={styles.container}>
      {schemaMarkup ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      ) : null}

      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <ol className={styles.breadcrumbList}>
          {breadcrumbs.map((crumb, index) => (
            <li key={`${crumb.url}-${index}`} className={styles.breadcrumbItem}>
              {index < breadcrumbs.length - 1 ? (
                <>
                  <Link href={crumb.url} className={styles.breadcrumbLink}>
                    {crumb.label}
                  </Link>
                  <span className={styles.breadcrumbSeparator}>/</span>
                </>
              ) : (
                <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.h1}>{h1}</h1>
      </header>

      {(serviceCount > 0 || salonCount > 0) && (
        <div className={styles.statsBar}>
          {serviceCount > 0 && (
            <div className={styles.statItem}>
              <span className={styles.statValue}>{serviceCount}</span>
              <span className={styles.statLabel}>
                Service{serviceCount !== 1 ? 's' : ''} Available
              </span>
            </div>
          )}
          {salonCount > 0 && (
            <div className={styles.statItem}>
              <span className={styles.statValue}>{salonCount}</span>
              <span className={styles.statLabel}>
                Verified Salon{salonCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {avgPrice ? (
            <div className={styles.statItem}>
              <span className={styles.statValue}>R{avgPrice.toFixed(0)}</span>
              <span className={styles.statLabel}>Average Price</span>
            </div>
          ) : null}
        </div>
      )}

      <section className={styles.introSection}>
        <div className={styles.introText}>
          {introText.split('\n\n').map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {children ? (
        <div className={styles.mainContent}>{children}</div>
      ) : (
        h2Headings.map((heading) => (
          <section key={heading} className={styles.contentSection}>
            <h2 className={styles.h2}>{heading}</h2>
            <div className={styles.sectionContent}>
              <p className={styles.paragraph}>
                Discover the best {keyword.toLowerCase()} services in{' '}
                {locationName}. Our verified professionals are ready to serve
                you.
              </p>
            </div>
          </section>
        ))
      )}

      {relatedServices && relatedServices.length > 0 && (
        <section className={styles.linksSection}>
          <h2 className={styles.h2}>Related Services in {locationName}</h2>
          <div className={styles.linksGrid}>
            {relatedServices.map((service) => (
              <Link
                key={service.url}
                href={service.url}
                className={styles.linkCard}
                prefetch={false}
              >
                <span className={styles.linkLabel}>{service.label}</span>
                <span className={styles.linkArrow} aria-hidden="true">{'->'}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {nearbyLocations && nearbyLocations.length > 0 && (
        <section className={styles.linksSection}>
          <h2 className={styles.h2}>{keyword} in Nearby Areas</h2>
          <div className={styles.linksGrid}>
            {nearbyLocations.map((location) => (
              <Link
                key={location.url}
                href={location.url}
                className={styles.linkCard}
                prefetch={false}
              >
                <span className={styles.linkLabel}>{location.label}</span>
                <span className={styles.linkArrow} aria-hidden="true">{'->'}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {faqItems && faqItems.length > 0 && (
        <section className={styles.faqSection}>
          <h2 className={styles.h2}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <article key={item.question} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{item.question}</h3>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            {ctaTitle || `Ready to Book ${keyword} in ${locationName}?`}
          </h2>
          <p className={styles.ctaDescription}>
            {ctaDescription ||
              `Browse ${
                serviceCount > 0
                  ? `${serviceCount} verified services`
                  : 'our verified professionals'
              } and book your appointment online today.`}
          </p>
          <Link href={ctaButtonLink} className={styles.ctaButton}>
            {ctaButtonText}
          </Link>
        </div>
      </section>
    </div>
  );
}
