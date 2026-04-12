import type { Metadata } from "next";
import Link from "next/link";
import styles from "./prices.module.css";
import {
  APP_PLANS,
  PLAN_FEATURES,
  SALON_LISTING_MONTHLY_PRICE,
  SALON_LISTING_PRICE,
} from "@/constants/plans";
import { buildAuthRoute } from "@/constants/routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stylrsa.co.za";

const setupSteps = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up as a salon owner and verify your details.",
  },
  {
    step: "02",
    title: "Complete your profile",
    description: "Add your salon details, services, location, and contact information.",
  },
  {
    step: "03",
    title: "Pay and wait for approval",
    description: `Pay ${SALON_LISTING_MONTHLY_PRICE}, then the admin reviews your profile and confirms approval.`,
  },
];

export const metadata: Metadata = {
  title: "Pricing | Stylr SA",
  description: `View the ${SALON_LISTING_MONTHLY_PRICE} salon listing plan on Stylr SA.`,
  alternates: {
    canonical: `${siteUrl}/prices`,
  },
  openGraph: {
    title: "Pricing | Stylr SA",
    description: `One ${SALON_LISTING_MONTHLY_PRICE} salon listing plan on Stylr SA.`,
    type: "website",
    url: `${siteUrl}/prices`,
  },
};

export default function PricingPage() {
  const listingPlan = APP_PLANS.find((plan) => plan.code === "PREMIUM")!;
  const providerListingHref = buildAuthRoute.providerRegister("/create-salon");

  return (
    <div className={styles.pageShell}>
      <main className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>Pricing</span>
            <h1 className={styles.title}>One simple plan for salon listings.</h1>
            <p className={styles.subtitle}>
              No confusing tiers. Just one monthly plan that gives your salon a
              professional profile, stronger visibility, and direct WhatsApp booking handoff.
            </p>

            <div className={styles.heroMeta}>
              <div className={styles.heroMetaItem}>
                <span>Monthly fee</span>
                <strong>{SALON_LISTING_MONTHLY_PRICE}</strong>
              </div>
              <div className={styles.heroMetaItem}>
                <span>Commission</span>
                <strong>0% on bookings</strong>
              </div>
              <div className={styles.heroMetaItem}>
                <span>Setup</span>
                <strong>Admin approved</strong>
              </div>
            </div>

            <div className={styles.heroActions}>
              <Link href={providerListingHref} className={styles.primaryAction}>
                Start your listing
              </Link>
              <Link href="/how-it-works" className={styles.secondaryAction}>
                How it works
              </Link>
            </div>
          </div>

          <aside className={styles.planCard}>
            <span className={styles.planLabel}>Salon listing plan</span>
            <h2 className={styles.planName}>{listingPlan.name}</h2>
            <div className={styles.planPriceRow}>
              <span className={styles.planPrice}>{SALON_LISTING_PRICE}</span>
              <span className={styles.planSuffix}>per month</span>
            </div>
            <p className={styles.planDescription}>{listingPlan.description}</p>

            <ul className={styles.planHighlights}>
              <li>Unlimited service listings</li>
              <li>Unlimited gallery images</li>
              <li>5x boosted visibility</li>
              <li>WhatsApp booking handoff</li>
              <li>0% commission on bookings</li>
            </ul>

            <Link href={providerListingHref} className={styles.primaryAction}>
              Get started for {SALON_LISTING_PRICE}
            </Link>
          </aside>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>What&apos;s Included</span>
            <h2 className={styles.sectionTitle}>Everything important, clearly listed.</h2>
            <p className={styles.sectionText}>
              This page should answer the practical question quickly: what do I get for the monthly fee?
            </p>
          </div>

          <div className={styles.includeList}>
            {PLAN_FEATURES.map((feature) => (
              <div key={feature.name} className={styles.includeItem}>
                <span className={styles.includeName}>{feature.name}</span>
                <span className={styles.includeValue}>
                  {typeof feature.value === "boolean"
                    ? feature.value
                      ? "Included"
                      : "No"
                    : feature.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Getting Started</span>
            <h2 className={styles.sectionTitle}>Three straightforward steps.</h2>
            <p className={styles.sectionText}>
              The process is simple: sign up, complete your listing, pay, then wait for approval.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {setupSteps.map((item) => (
              <article key={item.step} className={styles.stepCard}>
                <span className={styles.stepNumber}>{item.step}</span>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepText}>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <span className={styles.sectionEyebrow}>Ready To Start?</span>
          <h2 className={styles.ctaTitle}>List your salon with one clear monthly fee.</h2>
          <p className={styles.ctaText}>
            Create your account, complete your profile, and start moving toward approval.
          </p>
          <div className={styles.heroActions}>
            <Link href={providerListingHref} className={styles.primaryAction}>
              Create provider account
            </Link>
            <Link href="/how-it-works" className={styles.secondaryAction}>
              View the process
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
