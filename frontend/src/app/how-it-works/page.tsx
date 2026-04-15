import { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import styles from "./how-it-works.module.css";
import { SALON_LISTING_MONTHLY_PRICE, SALON_LISTING_PRICE } from "@/constants/plans";
import { buildAuthRoute } from "@/constants/routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stylrsa.co.za";

const providerSteps = [
  {
    step: "01",
    title: "Sign up",
    description: "Create your salon owner account and verify your email address.",
  },
  {
    step: "02",
    title: "Complete your profile",
    description: "Add your salon name, address, contact details, services, and location.",
  },
  {
    step: "03",
    title: "Pay the monthly fee",
    description: `Pay ${SALON_LISTING_MONTHLY_PRICE} to the Softkore Capitec account and use your salon name as the reference.`,
  },
  {
    step: "04",
    title: "Wait for approval",
    description: "Admin reviews your listing and confirms approval. You are then notified on WhatsApp.",
  },
];

const clientSteps = [
  {
    step: "01",
    title: "Search",
    description: "Browse approved salons, compare services, and view profile details.",
  },
  {
    step: "02",
    title: "Choose a salon",
    description: "Look through pricing, galleries, and contact information before deciding.",
  },
  {
    step: "03",
    title: "Book through WhatsApp",
    description: "Send a quick structured booking request and continue the final confirmation directly with the salon on WhatsApp.",
  },
];

const checklistItems = [
  "Your salon name and exact address",
  "A WhatsApp number or contact phone number",
  "A short salon description",
  "Your service list and pricing",
  `Payment of ${SALON_LISTING_PRICE} with your salon name as the reference`,
];

const howToBookSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Book a Salon Appointment on Stylr SA",
  description: "Find salons, compare services, and book through WhatsApp on Stylr SA.",
  totalTime: "PT5M",
  step: [
    {
      "@type": "HowToStep",
      name: "Search salons",
      text: "Browse approved salons and compare their services and profile details.",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "Choose a salon",
      text: "Review pricing, location, and service details before choosing a salon.",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "Book through WhatsApp",
      text: "Send a quick booking request with your details, then continue the final confirmation with the salon on WhatsApp.",
      position: 3,
    },
  ],
};

const howToListSalonSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to List Your Salon on Stylr SA",
  description: `List your salon on Stylr SA with the ${SALON_LISTING_MONTHLY_PRICE} salon listing plan.`,
  totalTime: "PT15M",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "ZAR",
    value: "299",
  },
  step: providerSteps.map((item, index) => ({
    "@type": "HowToStep",
    name: item.title,
    text: item.description,
    position: index + 1,
  })),
};

export const metadata: Metadata = {
  title: "How It Works | Stylr SA",
  description: `See how salon owners list their businesses and how clients book services on Stylr SA.`,
  alternates: {
    canonical: `${siteUrl}/how-it-works`,
  },
  openGraph: {
    title: "How It Works | Stylr SA",
    description: "See how salon owners list and how clients book on Stylr SA.",
    type: "website",
    url: `${siteUrl}/how-it-works`,
  },
};

export default function HowItWorksPage() {
  const providerListingHref = buildAuthRoute.providerRegister("/create-salon");

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

      <main className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>How It Works</span>
            <h1 className={styles.title}>A simple flow for salon owners and clients.</h1>
            <p className={styles.subtitle}>
              This page is meant to answer one question clearly: how does the platform work from signup to booking?
            </p>

            <div className={styles.heroActions}>
              <Link href="/prices" className={styles.primaryAction}>
                View pricing
              </Link>
              <Link href={providerListingHref} className={styles.secondaryAction}>
                Create provider account
              </Link>
            </div>
          </div>

          <aside className={styles.heroAside}>
            <span className={styles.heroAsideLabel}>At a glance</span>
            <h2 className={styles.heroAsideTitle}>One plan. One approval step. Direct client contact.</h2>
            <p className={styles.heroAsideText}>
              Salon owners complete their profile, pay {SALON_LISTING_MONTHLY_PRICE},
              wait for admin approval, and then start receiving direct WhatsApp booking requests.
            </p>

            <ul className={styles.heroList}>
              <li>{SALON_LISTING_MONTHLY_PRICE} salon listing plan</li>
              <li>Admin approval after payment</li>
              <li>WhatsApp notification when approved</li>
            </ul>
          </aside>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>For Providers</span>
            <h2 className={styles.sectionTitle}>How salon owners get listed.</h2>
            <p className={styles.sectionText}>
              The process is short and direct so there is less confusion during onboarding.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {providerSteps.map((item) => (
              <article key={item.step} className={styles.stepCard}>
                <span className={styles.stepNumber}>{item.step}</span>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepText}>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>For Clients</span>
            <h2 className={styles.sectionTitle}>How clients book.</h2>
            <p className={styles.sectionText}>
              Clients discover salons, compare details, and move into a quick WhatsApp handoff without a heavy booking process.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {clientSteps.map((item) => (
              <article key={item.step} className={styles.stepCard}>
                <span className={styles.stepNumber}>{item.step}</span>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepText}>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Before You Start</span>
            <h2 className={styles.sectionTitle}>What a salon owner should have ready.</h2>
            <p className={styles.sectionText}>
              Preparing these items first makes the setup process much smoother.
            </p>
          </div>

          <div className={styles.checklistPanel}>
            <ul className={styles.checklist}>
              {checklistItems.map((item) => (
                <li key={item} className={styles.checklistItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <span className={styles.sectionEyebrow}>Next Step</span>
          <h2 className={styles.ctaTitle}>Ready to create your salon profile?</h2>
          <p className={styles.ctaText}>
            Start with the account setup, then follow the same simple process shown above.
          </p>
          <div className={styles.heroActions}>
            <Link href={providerListingHref} className={styles.primaryAction}>
              Start for {SALON_LISTING_PRICE}
            </Link>
            <Link href="/prices" className={styles.secondaryAction}>
              View the plan
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
