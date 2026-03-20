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

const summaryItems = [
  {
    label: "Plan",
    value: "One simple plan",
  },
  {
    label: "Price",
    value: SALON_LISTING_MONTHLY_PRICE,
  },
  {
    label: "Commission",
    value: "0% on bookings",
  },
];

const includeGroups = [
  {
    title: "Profile and content",
    items: [
      "Professional salon profile",
      "Unlimited service listings",
      "Unlimited gallery images",
      "Short video uploads",
      "Before and after gallery",
    ],
  },
  {
    title: "Visibility",
    items: [
      "5x boosted search visibility",
      "Featured profile badge",
      "Designed to help clients discover your services",
    ],
  },
  {
    title: "Bookings and support",
    items: [
      "WhatsApp booking handoff",
      "0% commission on bookings",
      "Priority support",
    ],
  },
];

const nextSteps = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up as a service provider and verify your details.",
  },
  {
    step: "02",
    title: "Build your profile",
    description: "Add your services, pricing, gallery, and business information.",
  },
  {
    step: "03",
    title: "Go live",
    description: "Activate your listing and start receiving booking handoff through WhatsApp.",
  },
];

export const metadata: Metadata = {
  title: "Pricing | Stylr SA",
  description: `View the ${SALON_LISTING_MONTHLY_PRICE} service listing plan for salons and beauty professionals on Stylr SA.`,
  alternates: {
    canonical: `${siteUrl}/prices`,
  },
  openGraph: {
    title: "Pricing | Stylr SA",
    description: `One ${SALON_LISTING_MONTHLY_PRICE} plan for salons and beauty professionals.`,
    type: "website",
    url: `${siteUrl}/prices`,
  },
};

export default function PricingPage() {
  const listingPlan = APP_PLANS.find((plan) => plan.code === "PREMIUM")!;
  const providerListingHref = buildAuthRoute.providerRegister("/create-salon?plan=PREMIUM");

  return (
    <div className={styles.pageShell}>
      <main className={styles.container}>
        <section className={styles.heroSection}>
          <div className={styles.heroPanel}>
            <span className={styles.eyebrow}>Pricing</span>
            <h1 className={styles.title}>Simple pricing for salons and beauty professionals.</h1>
            <p className={styles.subtitle}>
              Stylr SA offers one clean monthly plan for service providers who want a professional
              profile, stronger visibility, and direct booking handoff without per-booking fees.
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
              <Link href={providerListingHref} className={styles.primaryAction}>
                Start your listing
              </Link>
              <Link href="/how-it-works" className={styles.secondaryAction}>
                How it works
              </Link>
            </div>
          </div>

          <aside className={styles.pricingCard}>
            <div className={styles.pricingCardHeader}>
              <span className={styles.planBadge}>Service provider plan</span>
              <h2 className={styles.planName}>{listingPlan.name}</h2>
              <p className={styles.planDescription}>{listingPlan.description}</p>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.mainPrice}>{listingPlan.price}</span>
              <span className={styles.priceSuffix}>per month</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaPill}>Monthly billing</span>
              <span className={styles.metaPill}>Cancel anytime</span>
            </div>

            <ul className={styles.featureList}>
              {PLAN_FEATURES.map((feature) => (
                <li key={feature.name} className={styles.featureItem}>
                  <span className={styles.featureName}>{feature.name}</span>
                  <span className={styles.featureValue}>
                    {typeof feature.value === "boolean" ? (feature.value ? "Included" : "No") : feature.value}
                  </span>
                </li>
              ))}
            </ul>

            <Link href={providerListingHref} className={styles.cardAction}>
              Get started for {SALON_LISTING_PRICE}
            </Link>
          </aside>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>What&apos;s Included</span>
            <h2>Everything relevant to run and present your listing properly.</h2>
            <p>
              The plan is built around the essentials: a strong profile, better visibility, and a
              direct path for clients to contact you.
            </p>
          </div>

          <div className={styles.includeGrid}>
            {includeGroups.map((group) => (
              <article key={group.title} className={styles.includeCard}>
                <h3>{group.title}</h3>
                <ul className={styles.includeList}>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.noteSection}>
          <div className={styles.noteCard}>
            <h2>Good to know</h2>
            <div className={styles.noteGrid}>
              <p>
                <strong>There are no booking commissions.</strong> You keep control of your pricing,
                deposits, and client communication.
              </p>
              <p>
                <strong>Billing is monthly.</strong> The plan is designed to be straightforward and
                easy to manage.
              </p>
              <p>
                <strong>Your listing supports direct contact.</strong> Booking handoff goes to your
                WhatsApp so you can confirm details directly with clients.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>Getting Started</span>
            <h2>Set up your listing in three steps.</h2>
          </div>

          <div className={styles.stepsGrid}>
            {nextSteps.map((item) => (
              <article key={item.step} className={styles.stepCard}>
                <span className={styles.stepNumber}>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaPanel}>
            <span className={styles.sectionEyebrow}>Ready to List?</span>
            <h2>Start with one plan and keep your setup simple.</h2>
            <p>
              Create your profile, publish your services, and start receiving booking handoff
              through Stylr SA.
            </p>
            <div className={styles.heroActions}>
              <Link href={providerListingHref} className={styles.primaryAction}>
                List your salon for {SALON_LISTING_PRICE}
              </Link>
              <Link href="/how-it-works" className={styles.secondaryAction}>
                Learn more
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
