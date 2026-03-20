import { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import styles from './how-it-works.module.css';
import { SALON_LISTING_MONTHLY_PRICE, SALON_LISTING_PRICE } from '@/constants/plans';
import { buildAuthRoute } from '@/constants/routes';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

const clientSteps = [
  {
    step: '01',
    title: 'Search',
    description:
      'Search by treatment type, city, or salon name. Filter by availability, service category, or area and see approved profiles.',
  },
  {
    step: '02',
    title: 'Compare',
    description:
      'Browse galleries, service menus, pricing, and client reviews before deciding who fits what you need.',
  },
  {
    step: '03',
    title: 'Connect',
    description:
      'Tap Book Now and send your details through the WhatsApp handoff flow. No extra apps or complicated setup.',
  },
  {
    step: '04',
    title: 'Confirm',
    description:
      'Finish the booking directly with the salon, including date, time, deposits, and any special requirements.',
  },
];

const providerSteps = [
  {
    step: '01',
    title: 'Sign up',
    description: 'Register as a service provider, verify your email, and get ready to build your listing.',
  },
  {
    step: '02',
    title: 'Build your profile',
    description:
      `Add your services, prices, location, and contact details, then activate the ${SALON_LISTING_MONTHLY_PRICE} plan.`,
  },
  {
    step: '03',
    title: 'Show your work',
    description:
      'Upload gallery images, before-and-after content, and service details so clients can understand your offering properly.',
  },
  {
    step: '04',
    title: 'Receive bookings',
    description:
      'Booking requests come to your WhatsApp so you stay in control of pricing, deposits, and scheduling with 0% commission.',
  },
];

const planIncludes = [
  'Verified salon profile badge',
  'Unlimited service listings with custom pricing',
  'Unlimited gallery image uploads',
  'Short video and before-and-after content',
  'Boosted visibility in search results',
  'Direct WhatsApp booking handoff',
  '0% commission on every booking',
  'Dashboard for availability, promotions, and profile updates',
  'Priority support from the Stylr SA team',
];

const summaryItems = [
  {
    label: 'For clients',
    value: 'Search, compare, and book with confidence',
  },
  {
    label: 'For providers',
    value: `One ${SALON_LISTING_MONTHLY_PRICE} plan`,
  },
  {
    label: 'Bookings',
    value: 'Direct WhatsApp handoff',
  },
];

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
  description: `List your salon on Stylr SA with one ${SALON_LISTING_MONTHLY_PRICE} plan for service providers.`,
  totalTime: 'PT15M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'ZAR',
    value: '299',
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
      text: `Complete your salon profile and submit payment for the ${SALON_LISTING_MONTHLY_PRICE} listing plan.`,
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
  description: `Learn how clients book services on Stylr SA and how service providers list their salons on the single ${SALON_LISTING_MONTHLY_PRICE} plan.`,
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

function StepSection({
  eyebrow,
  title,
  description,
  steps,
}: {
  eyebrow: string;
  title: string;
  description: string;
  steps: Array<{ step: string; title: string; description: string }>;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <span className={styles.sectionEyebrow}>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className={styles.stepsGrid}>
        {steps.map((item) => (
          <article key={item.step} className={styles.stepCard}>
            <span className={styles.stepNumber}>{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function HowItWorksPage() {
  const providerListingHref = buildAuthRoute.providerRegister('/create-salon');

  return (
    <div className={styles.pageShell}>
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

      <main className={styles.container}>
        <section className={styles.heroSection}>
          <div className={styles.heroPanel}>
            <span className={styles.eyebrow}>How It Works</span>
            <h1 className={styles.title}>A simple flow for clients and beauty professionals.</h1>
            <p className={styles.subtitle}>
              Stylr SA helps clients discover the right salons and gives service providers a clean
              way to present their work, pricing, and booking details in one place.
            </p>

            <div className={styles.summaryGrid}>
              {summaryItems.map((item) => (
                <article key={item.label} className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>{item.label}</span>
                  <strong className={styles.summaryValue}>{item.value}</strong>
                </article>
              ))}
            </div>

            <div className={styles.heroActions}>
              <Link href="/salons" className={styles.primaryAction}>
                Explore salons
              </Link>
              <Link href="/prices" className={styles.secondaryAction}>
                View pricing
              </Link>
            </div>
          </div>

          <aside className={styles.infoCard}>
            <span className={styles.cardBadge}>Service provider plan</span>
            <h2 className={styles.cardTitle}>One straightforward plan for going live.</h2>
            <p className={styles.cardText}>
              Create your profile, publish your services, and receive direct booking handoff
              through WhatsApp.
            </p>

            <div className={styles.priceRow}>
              <strong className={styles.price}>{SALON_LISTING_MONTHLY_PRICE}</strong>
              <span className={styles.priceSuffix}>per month</span>
            </div>

            <ul className={styles.metaList}>
              <li>Monthly billing</li>
              <li>0% commission</li>
              <li>Direct client contact</li>
            </ul>

            <Link href={providerListingHref} className={styles.cardAction}>
              Start for {SALON_LISTING_PRICE}
            </Link>
          </aside>
        </section>

        <StepSection
          eyebrow="For Clients"
          title="Book in four simple steps."
          description="The client flow is designed to help people move from discovery to confirmation without friction."
          steps={clientSteps}
        />

        <StepSection
          eyebrow="For Salons And Professionals"
          title="Set up your listing and start receiving bookings."
          description="The provider flow keeps setup clear and focused so you can publish quickly and manage enquiries directly."
          steps={providerSteps}
        />

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>What&apos;s Included</span>
            <h2>What the listing plan actually gives you.</h2>
            <p>
              The plan focuses on the things that matter most: visibility, a strong profile, and a
              direct way for clients to reach you.
            </p>
          </div>

          <div className={styles.includePanel}>
            <ul className={styles.includeList}>
              {planIncludes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaPanel}>
            <span className={styles.sectionEyebrow}>Next Step</span>
            <h2>Ready to list your salon?</h2>
            <p>
              View the plan details or create your provider account and start building your profile.
            </p>
            <div className={styles.heroActions}>
              <Link href={providerListingHref} className={styles.primaryAction}>
                Create provider account
              </Link>
              <Link href="/prices" className={styles.secondaryAction}>
                See full pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
