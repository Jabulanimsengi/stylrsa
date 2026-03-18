"use client";

import Link from "next/link";
import styles from "./prices.module.css";
import { APP_PLANS, PLAN_FEATURES } from "@/constants/plans";
import { buildAuthRoute } from "@/constants/routes";

const proofPoints = [
  {
    value: "0%",
    label: "Commission on bookings",
    description: "You keep your booking revenue while Stylr SA sends clients to your WhatsApp.",
  },
  {
    value: "Unlimited",
    label: "Services and gallery uploads",
    description: "Show your full menu, portfolio, before-and-after work, and short videos.",
  },
  {
    value: "5x",
    label: "Search visibility boost",
    description: "Stand out more prominently when clients search for services in your area.",
  },
];

const onboardingSteps = [
  {
    title: "Create your salon profile",
    description: "Add your salon details, contact number, location, and business information.",
  },
  {
    title: "Show your best work",
    description: "Upload services, gallery images, short videos, and before-and-after transformations.",
  },
  {
    title: "Receive WhatsApp bookings",
    description: "Clients discover your page on Stylr SA and connect with you directly to confirm appointments.",
  },
];

const faqs = [
  {
    question: "What's included in the listing plan?",
    answer:
      "You get unlimited service listings, unlimited gallery images, short video uploads, before-and-after gallery support, a featured profile badge, boosted search visibility, WhatsApp booking handoff, and priority support.",
  },
  {
    question: "Do you charge commission on bookings?",
    answer: "No. Stylr SA charges 0% commission on bookings made through the service listing plan.",
  },
  {
    question: "Can I cancel my plan anytime?",
    answer: "Yes. You can cancel anytime and keep access until the end of your current billing period.",
  },
  {
    question: "How do bookings work?",
    answer:
      "Clients discover you on Stylr SA, then booking handoff happens through your salon WhatsApp number so you can manage deposits, confirmations, and client communication directly.",
  },
  {
    question: "Are there any hidden fees?",
    answer: "No hidden fees. The plan is a flat R399 per month with no setup fee and no booking commission.",
  },
  {
    question: "How do I get started?",
    answer: 'Click "Start your listing" to create your salon profile, submit proof of payment, and publish your services.',
  },
];

export default function PricingPage() {
  const listingPlan = APP_PLANS.find((plan) => plan.code === "PREMIUM")!;
  const providerListingHref = buildAuthRoute.providerRegister("/create-salon?plan=PREMIUM");

  return (
    <div className={styles.pageShell}>
      <main className={styles.container}>
        <section className={styles.heroSection}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Pricing</span>
            <h1 className={styles.title}>One straightforward listing plan. Built for South African beauty professionals.</h1>
            <p className={styles.subtitle}>
              Get discovered online, showcase your best work, and receive WhatsApp booking requests directly from clients — all for a flat R399/month with zero commission taken on your earnings.
            </p>

            <div className={styles.heroActions}>
              <Link href={providerListingHref} className={styles.primaryAction}>
                Start your listing
              </Link>
              <Link href="/how-it-works" className={styles.secondaryAction}>
                See how it works
              </Link>
            </div>

            <div className={styles.metricsGrid}>
              {proofPoints.map((point) => (
                <article key={point.label} className={styles.metricCard}>
                  <p className={styles.metricValue}>{point.value}</p>
                  <h2 className={styles.metricLabel}>{point.label}</h2>
                  <p className={styles.metricDescription}>{point.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className={styles.planSpotlight}>
            <div className={styles.planBadge}>Most popular for service providers</div>
            <div className={styles.planHeader}>
              <p className={styles.planKicker}>Salon listing plan</p>
              <h2 className={styles.planName}>{listingPlan.name}</h2>
              <p className={styles.planDescription}>{listingPlan.description}</p>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.mainPrice}>{listingPlan.price}</span>
              <span className={styles.perMonth}>per month</span>
            </div>

            <div className={styles.planMeta}>
              <span className={styles.metaPill}>Monthly billing</span>
              <span className={styles.metaPill}>Cancel anytime</span>
              <span className={styles.metaPill}>0% booking commission</span>
            </div>

            <ul className={styles.featureList}>
              {listingPlan.features.map((feature) => (
                <li key={feature} className={styles.featureItem}>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link href={providerListingHref} className={styles.planAction}>
              Get started for R399
            </Link>
          </aside>
        </section>

        <section className={styles.valueSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>Why salons choose this plan</span>
            <h2>Built for the way South African beauty businesses actually work.</h2>
            <p>
              Most booking platforms take a cut of every appointment. Stylr SA doesn&apos;t. You pay one flat rate, keep 100% of your earnings, and stay in control of your client relationships from first enquiry to final payment.
            </p>
          </div>

          <div className={styles.valueGrid}>
            <article className={styles.valueCard}>
              <h3>Show more of your work</h3>
              <p>
                Publish your complete service menu and support each listing with gallery photos,
                videos, and before-and-after examples.
              </p>
            </article>
            <article className={styles.valueCard}>
              <h3>Turn discovery into leads</h3>
              <p>
                Clients browse Stylr SA, find your profile faster with boosted visibility, and
                message you directly when they are ready to book.
              </p>
            </article>
            <article className={styles.valueCard}>
              <h3>Keep the customer relationship</h3>
              <p>
                Booking handoff goes straight to WhatsApp, so you stay in control of scheduling,
                deposits, and communication from the first enquiry.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.detailsSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>Plan details</span>
            <h2>A cleaner look at what is included.</h2>
            <p>One straightforward monthly subscription with premium placement and no hidden extras.</p>
          </div>

          <div className={styles.detailsGrid}>
            {PLAN_FEATURES.map((feature) => {
              const value =
                typeof feature.value === "boolean" ? (feature.value ? "Included" : "Not included") : feature.value;

              return (
                <article key={feature.name} className={styles.detailCard}>
                  <p className={styles.detailName}>{feature.name}</p>
                  <p className={styles.detailValue}>{value}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.stepsSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>Getting started</span>
            <h2>Launch your listing in three clear steps.</h2>
            <p>The setup stays simple so you can focus on presenting your brand well from day one.</p>
          </div>

          <div className={styles.stepsGrid}>
            {onboardingSteps.map((step, index) => (
              <article key={step.title} className={styles.stepCard}>
                <span className={styles.stepNumber}>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>FAQ</span>
            <h2>Answers before you commit.</h2>
            <p>Everything important is upfront, from booking flow to billing and cancellations.</p>
          </div>

          <div className={styles.faqGrid}>
            {faqs.map((faq) => (
              <article key={faq.question} className={styles.faqCard}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaPanel}>
            <span className={styles.sectionEyebrow}>Ready to be discovered?</span>
            <h2>Start listing your salon on Stylr SA.</h2>
            <p>
              Your profile goes live as soon as you&apos;re approved. Start attracting clients this week.
            </p>
            <div className={styles.ctaActions}>
              <Link href={providerListingHref} className={styles.primaryAction}>
                List your salon for R399
              </Link>
              <Link href="/how-it-works" className={styles.secondaryAction}>
                Learn more first
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
