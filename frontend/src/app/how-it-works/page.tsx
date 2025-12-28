import { Metadata } from 'next';
import Script from 'next/script';
import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

// HowTo Schema for rich snippets
const howToBookSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Book a Salon Appointment on Stylr SA',
  description: 'Book beauty services online in South Africa - Find and book appointments at salons, spas, and beauty professionals in your area.',
  totalTime: 'PT5M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'ZAR',
    value: '0'
  },
  step: [
    {
      '@type': 'HowToStep',
      name: 'Discover Salons',
      text: 'Use our powerful search and filter tools to find top-rated salons, specific services, or must-have beauty products in your area.',
      position: 1
    },
    {
      '@type': 'HowToStep',
      name: 'Book & Pay',
      text: 'Select a service, choose a time slot that works for you, and confirm your booking instantly. Purchase products from your favorite local sellers with secure checkout.',
      position: 2
    },
    {
      '@type': 'HowToStep',
      name: 'Earn Cashback',
      text: 'Get 5% cashback on every booking. Use it to pay for future appointments or products!',
      position: 3
    },
    {
      '@type': 'HowToStep',
      name: 'Enjoy Your Service',
      text: 'Attend your appointment and leave a review to help the community. Track your product orders right to your door.',
      position: 4
    }
  ]
};

// HowTo Schema for salon owners
const howToListSalonSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to List Your Salon on Stylr SA',
  description: 'List your salon or beauty business on South Africa\'s premier beauty platform - Free to join, pay only when you earn.',
  totalTime: 'PT15M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'ZAR',
    value: '0'
  },
  step: [
    {
      '@type': 'HowToStep',
      name: 'Create Your Free Profile',
      text: 'Sign up in minutes and build a beautiful profile showcasing your salon, your unique services, and your team\'s talent. There are no monthly fees or subscription costs.',
      position: 1
    },
    {
      '@type': 'HowToStep',
      name: 'List Your Services',
      text: 'Add as many services as you offer with photos, pricing, and descriptions. Upload videos, before & after photos, and showcase your team members — all included free.',
      position: 2
    },
    {
      '@type': 'HowToStep',
      name: 'Manage Your Business',
      text: 'Use our intuitive dashboard to manage your schedule, accept new bookings, communicate with clients via our built-in chat, and track your performance.',
      position: 3
    },
    {
      '@type': 'HowToStep',
      name: 'Get Paid Weekly',
      text: 'Payouts are processed every Friday directly to your bank account. We only charge 32% commission on completed bookings.',
      position: 4
    }
  ]
};

// Breadcrumb Schema
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'How It Works',
      item: `${siteUrl}/how-it-works`
    }
  ]
};

export const metadata: Metadata = {
  title: '📖 How It Works | Book Salons Online in 4 Easy Steps | Stylr SA',
  description: '✓ Discover salons ✓ Book instantly ✓ Earn 5% cashback ✓ Enjoy your service. Learn how Stylr SA makes booking beauty services easy for clients and salon owners.',
  keywords: 'how to book salon, salon booking guide, Stylr SA tutorial, list salon online, beauty platform South Africa',
  alternates: {
    canonical: `${siteUrl}/how-it-works`,
  },
  openGraph: {
    title: 'How It Works | Stylr SA',
    description: 'Your next favorite salon is just a few clicks away. Learn how to book beauty services or list your salon on Stylr SA.',
    type: 'website',
    url: `${siteUrl}/how-it-works`,
  },
};

export default function HowItWorksPage() {
  return (
    <div className={styles.container}>
      {/* HowTo Schemas for rich snippets */}
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
        Your next favorite salon is just a few clicks away. We&apos;ve made our platform simple and intuitive for everyone.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>For Clients</h2>
        <p className={styles.paragraph}>
          <strong>Discover:</strong> Use our powerful search and filter tools to find top-rated salons, specific services, or must-have
          beauty products in your area.
        </p>
        <p className={styles.paragraph}>
          <strong>Book &amp; Buy:</strong> Select a service, choose a time slot that works for you, and confirm your booking instantly.
          Purchase products from your favorite local sellers with secure checkout.
        </p>
        <p className={styles.paragraph}>
          <strong>Earn Cashback:</strong> Get 5% cashback on every booking. Use it to pay for future appointments or products!
        </p>
        <p className={styles.paragraph}>
          <strong>Enjoy:</strong> Attend your appointment and leave a review to help the community. Track your product orders right to
          your door.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>For Salon &amp; Business Owners</h2>
        <p className={styles.paragraph}>
          <strong>Create Your Profile — FREE:</strong> Sign up in minutes and build a beautiful profile showcasing your salon, your unique
          services, and your team&apos;s talent. There are no monthly fees or subscription costs.
        </p>
        <p className={styles.paragraph}>
          <strong>List Unlimited Services:</strong> Add as many services as you offer with photos, pricing, and descriptions.
          Upload videos, before &amp; after photos, and showcase your team members — all included free.
        </p>
        <p className={styles.paragraph}>
          <strong>Pay Only When You Earn:</strong> Unlike competitors who charge R399-R1,500 per month regardless of bookings,
          we only charge a 32% commission on completed bookings. This breaks down as:
        </p>
        <ul className={styles.list}>
          <li><strong>25%</strong> — Platform fee (marketing, tech, support)</li>
          <li><strong>5%</strong> — Client cashback (keeps customers coming back)</li>
          <li><strong>2%</strong> — Secure payment processing</li>
        </ul>
        <p className={styles.paragraph}>
          No clients? No charge. We only succeed when you succeed. View our <Link href="/prices" className={styles.link}>pricing details</Link>.
        </p>
        <p className={styles.paragraph}>
          <strong>Manage Your Business:</strong> Use our intuitive dashboard to manage your schedule, accept new bookings, communicate
          with clients via our built-in chat, and track your performance.
        </p>
        <p className={styles.paragraph}>
          <strong>Get Paid Weekly:</strong> Payouts are processed every Friday directly to your bank account.
        </p>
        <p className={styles.paragraph}>
          <strong>Sell &amp; Grow:</strong> List your beauty products on our marketplace, manage orders, and reach a wider audience than
          ever before.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Payment Options</h2>
        <p className={styles.paragraph}>
          We believe everyone should have access to our platform, regardless of their banking status. That&apos;s why we offer flexible
          payment options for users who don&apos;t have traditional bank accounts.
        </p>
        <p className={styles.paragraph}>
          <strong>Card Payments:</strong> Clients can pay securely using any major credit or debit card through our payment partner.
        </p>
        <p className={styles.paragraph}>
          <strong>Cashback Payments:</strong> Clients can use their accumulated cashback balance to pay for bookings.
        </p>
        <p className={styles.paragraph}>
          <strong>EFT &amp; Cash Deposits:</strong> For clients who prefer bank transfers, we accept EFT payments. Cash deposits can
          be made at any bank branch.
        </p>
      </section>
    </div>
  );
}
