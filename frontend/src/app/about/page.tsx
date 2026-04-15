import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './about.module.css';
import { buildAuthRoute } from '@/constants/routes';

const audienceCards = [
  {
    title: 'For clients',
    points: [
      'Find verified salons and specialists without relying on guesswork.',
      'Compare prices, galleries, reviews, and rules before you book.',
      'Send a quick booking request, then confirm directly with the salon on WhatsApp.',
    ],
  },
  {
    title: 'For salon owners',
    points: [
      'Create a profile built for discovery, trust, and direct enquiries.',
      'Show your services, pricing, location, and proof of quality clearly.',
      'Receive direct WhatsApp booking requests and keep the final conversation in your own flow.',
    ],
  },
];

export const metadata: Metadata = {
  title: 'About Stylr SA - Our Mission, Story, and Vision',
  description:
    "Learn about Stylr SA's mission to improve how South Africa discovers and books beauty services.",
  keywords:
    'about Stylr SA, beauty platform South Africa, salon booking, beauty careers, professional stylists',
  openGraph: {
    title: 'About Stylr SA - Our Mission and Vision',
    description:
      'Discover how Stylr SA is improving beauty discovery and booking in South Africa.',
    type: 'website',
    url: 'https://stylrsa.co.za/about',
  },
};

export default function AboutPage() {
  const providerListingHref = buildAuthRoute.providerRegister('/create-salon');

  return (
    <div className={styles.pageShell}>
      <main className={styles.container}>
        <section className={styles.heroPanel}>
          <span className={styles.eyebrow}>About Stylr SA</span>
          <h1 className={styles.heroTitle}>Built to make salon discovery clearer, faster, and more trusted.</h1>
          <p className={styles.heroSubtitle}>
            Stylr SA helps clients find the right salon with confidence and helps salon owners present their businesses properly online.
            The goal is simple: better discovery, better decisions, and a smoother path into real bookings.
          </p>
          <div className={styles.heroActions}>
            <Link href="/salons" className={styles.primaryAction}>
              Browse salons
            </Link>
            <Link href={providerListingHref} className={styles.secondaryAction}>
              List your salon
            </Link>
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>Our Mission</span>
            <h2 className={styles.sectionTitle}>Make beauty discovery feel professional instead of scattered.</h2>
          </div>
          <p className={styles.paragraph}>
            Stylr SA exists to make finding and booking beauty and wellness services in South Africa as simple as it should be.
            We connect strong local beauty professionals with clients who are searching for their exact expertise.
          </p>
          <p className={styles.paragraph}>
            Instead of forcing people to rely on random social posts, WhatsApp groups, and incomplete listings, we give both sides a cleaner way to connect.
          </p>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>Our Story</span>
            <h2 className={styles.sectionTitle}>We built the platform around a real local problem.</h2>
          </div>
          <p className={styles.paragraph}>
            Finding a trusted braider, nail tech, barber, or aesthetic professional often meant too much uncertainty.
            People had to piece together information from social media, word-of-mouth, and incomplete profile pages.
          </p>
          <p className={styles.paragraph}>
            Stylr SA was created to fix that with one platform where salons can present their work properly and clients can compare what matters before they commit.
          </p>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>What We Do</span>
            <h2 className={styles.sectionTitle}>Support both sides of the booking journey.</h2>
          </div>
          <div className={styles.audienceStack}>
            {audienceCards.map((card) => (
              <article key={card.title} className={styles.audienceCard}>
                <h3 className={styles.audienceTitle}>{card.title}</h3>
                <ul className={styles.pointList}>
                  {card.points.map((point) => (
                    <li key={point} className={styles.pointItem}>
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>Our Vision</span>
            <h2 className={styles.sectionTitle}>Raise the standard for beauty discovery in South Africa.</h2>
          </div>
          <p className={styles.paragraph}>
            We are building a platform that helps independent professionals compete better, helps clients make stronger decisions,
            and makes local salons easier to discover without noise or confusion.
          </p>
          <p className={styles.paragraph}>
            Every salon deserves a clearer digital presence. Every client deserves a better way to find the right one.
          </p>
        </section>
      </main>
    </div>
  );
}
