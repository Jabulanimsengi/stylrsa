import { Metadata } from 'next';
import Script from 'next/script';
import styles from '../info-page.module.css';
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

      <h1 className={styles.pageTitle}>How It Works</h1>
      <p className={styles.paragraph}>
        Stylr SA connects South Africans with the hair, beauty, and wellness professionals who are right for them — and gives service providers a simple, affordable place to grow their bookings online.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How it works for clients</h2>
        <p className={styles.paragraph}>
          <strong>Search:</strong> Search by treatment type, city, or salon name. Filter by availability, service category, or area — and see only approved, verified profiles.
        </p>
        <p className={styles.paragraph}>
          <strong>Compare:</strong> Browse real gallery images, read transparent service menus with actual prices, and check client reviews before you decide. No surprises.
        </p>
        <p className={styles.paragraph}>
          <strong>Connect:</strong> Tap &ldquo;Book Now&rdquo; on any service. Your details go straight to the salon&apos;s WhatsApp — no apps to download, no accounts to create.
        </p>
        <p className={styles.paragraph}>
          <strong>Confirm:</strong> Confirm your appointment directly with the salon — dates, deposits, and any special requirements are handled in a real conversation, not a form.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How it works for salons and professionals</h2>
        <p className={styles.paragraph}>
          <strong>Sign up:</strong> Register as a service provider in minutes. Verify your email and you&apos;re in.
        </p>
        <p className={styles.paragraph}>
          <strong>Build your profile:</strong> Add your services, prices, location, and contact details. Activate the <strong>R399/month</strong> listing plan to go live.
        </p>
        <p className={styles.paragraph}>
          <strong>Show your work:</strong> Upload unlimited gallery images, before-and-after photos, and short video clips. Your profile becomes your online portfolio.
        </p>
        <p className={styles.paragraph}>
          <strong>Receive bookings:</strong> When clients are ready, their booking request comes directly to your WhatsApp. You stay in control of pricing, deposits, and scheduling — and Stylr SA takes <strong>0% commission</strong>.
        </p>
        <p className={styles.paragraph}>
          <strong>Manage everything:</strong> Use your dashboard to update services, run promotions, manage availability, and keep your profile looking its best year-round.
        </p>
        <p className={styles.paragraph}>
          View our <Link href="/prices" className={styles.link}>pricing details</Link>.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What the plan includes</h2>
        <ul className={styles.list}>
          <li>Verified salon profile badge</li>
          <li>Unlimited service listings with custom pricing</li>
          <li>Unlimited gallery image uploads</li>
          <li>Short video and before-and-after content</li>
          <li>Boosted search visibility (5× more prominent in results)</li>
          <li>Direct WhatsApp booking handoff</li>
          <li>0% commission on every booking</li>
          <li>Dashboard to manage availability, promotions, and messaging</li>
          <li>Priority support from the Stylr SA team</li>
        </ul>
      </section>
    </div>
  );
}
