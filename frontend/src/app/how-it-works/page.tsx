import { Metadata } from 'next';
import Script from 'next/script';
import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

const howToBookSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Book a Salon Appointment on Stylr SA',
  description: 'Find salons, choose a service, and complete your booking handoff quickly on Stylr SA.',
  totalTime: 'PT5M',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Discover salons',
      text: 'Use search and filters to find salons, services, and beauty professionals near you.',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Choose your service',
      text: 'Compare pricing, images, and salon details before selecting the service you want.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Share your booking details',
      text: 'Enter your booking information and continue through the WhatsApp handoff flow.',
      position: 3,
    },
    {
      '@type': 'HowToStep',
      name: 'Confirm with the salon',
      text: 'Complete the booking with the salon directly, including any deposit instructions and final appointment details.',
      position: 4,
    },
  ],
};

const howToListSalonSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to List Your Salon on Stylr SA',
  description: 'List your salon on Stylr SA with one R399/month plan for service providers.',
  totalTime: 'PT15M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'ZAR',
    value: '399',
  },
  step: [
    {
      '@type': 'HowToStep',
      name: 'Create your account',
      text: 'Register as a service provider and verify your email address.',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Create your salon profile',
      text: 'Complete your salon profile and submit payment for the R399/month listing plan.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'List your services and portfolio',
      text: 'Add unlimited services, upload gallery images, and showcase your work.',
      position: 3,
    },
    {
      '@type': 'HowToStep',
      name: 'Receive bookings through WhatsApp',
      text: 'Receive booking handoff through your salon WhatsApp number with 0% commission charged by Stylr SA.',
      position: 4,
    },
  ],
};

const breadcrumbSchema = {
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
      name: 'How It Works',
      item: `${siteUrl}/how-it-works`,
    },
  ],
};

export const metadata: Metadata = {
  title: 'How It Works | Stylr SA',
  description: 'Learn how clients book services on Stylr SA and how service providers list their salons on the single R399/month plan.',
  keywords: 'how Stylr SA works, salon booking guide, list your salon, service provider pricing, Stylr SA pricing',
  alternates: {
    canonical: `${siteUrl}/how-it-works`,
  },
  openGraph: {
    title: 'How It Works | Stylr SA',
    description: 'See how clients book services and how service providers list on Stylr SA.',
    type: 'website',
    url: `${siteUrl}/how-it-works`,
  },
};

export default function HowItWorksPage() {
  return (
    <div className={styles.container}>
      <Script
        id="howto-book-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToBookSchema) }}
        strategy="beforeInteractive"
      />
      <Script
        id="howto-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToListSalonSchema) }}
        strategy="beforeInteractive"
      />
      <Script
        id="howto-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="beforeInteractive"
      />

      <PageNav />
      <h1 className={styles.pageTitle}>How It Works</h1>
      <p className={styles.paragraph}>
        Stylr SA keeps discovery simple for clients and gives service providers one clear listing plan.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>For Clients</h2>
        <p className={styles.paragraph}>
          <strong>Discover:</strong> Search salons and services by treatment, city, availability, and profile quality.
        </p>
        <p className={styles.paragraph}>
          <strong>Choose:</strong> Compare services, prices, galleries, and trust signals before you book.
        </p>
        <p className={styles.paragraph}>
          <strong>Continue:</strong> Enter your booking details and continue through the WhatsApp handoff flow.
        </p>
        <p className={styles.paragraph}>
          <strong>Confirm:</strong> Final booking confirmation, deposits, and policies are handled directly with the salon.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>For Service Providers</h2>
        <p className={styles.paragraph}>
          <strong>Register and verify your email:</strong> Create a service-provider account and complete your email verification code.
        </p>
        <p className={styles.paragraph}>
          <strong>Create your salon profile:</strong> Submit your salon details and activate the single listing plan for <strong>R399/month</strong>.
        </p>
        <p className={styles.paragraph}>
          <strong>List your services and portfolio:</strong> Add unlimited services, upload gallery images, and showcase your work in one place.
        </p>
        <p className={styles.paragraph}>
          <strong>Receive WhatsApp bookings:</strong> Clients continue through your salon WhatsApp number, and Stylr SA charges <strong>0% commission</strong> on those bookings.
        </p>
        <p className={styles.paragraph}>
          <strong>Manage your profile:</strong> Use the dashboard to update services, images, availability, promotions, and booking messaging.
        </p>
        <p className={styles.paragraph}>
          View our <Link href="/prices" className={styles.link}>pricing details</Link>.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What the Plan Includes</h2>
        <ul className={styles.list}>
          <li>Unlimited service listings</li>
          <li>Unlimited gallery images</li>
          <li>Short video uploads and before-and-after content</li>
          <li>Boosted visibility in search</li>
          <li>WhatsApp booking handoff</li>
          <li>0% commission on bookings</li>
        </ul>
      </section>
    </div>
  );
}
