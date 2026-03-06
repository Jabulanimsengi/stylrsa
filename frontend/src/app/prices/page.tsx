"use client";

import Link from 'next/link';
import PageNav from '@/components/PageNav';
import styles from './prices.module.css';
import { APP_PLANS, PLAN_FEATURES } from '@/constants/plans';

export default function PricingPage() {
  const premiumPlan = APP_PLANS.find(p => p.code === 'PREMIUM')!;

  return (
    <div className={styles.container}>
      <PageNav />

      <div className={styles.header}>
        <h1 className={styles.title}>Simple, Transparent Pricing</h1>
        <p className={styles.subtitle}>
          Everything you need to grow your salon business. One plan, zero commission.
        </p>
      </div>

      {/* Single Premium Plan Card */}
      <div className={styles.singleCardWrapper}>
        <div className={`${styles.pricingCard} ${styles.premiumCard}`}>
          <div className={styles.popularBadge}>
            <span>⭐</span> All-Inclusive
          </div>

          <div className={styles.cardHeader}>
            <h3 className={styles.planName}>{premiumPlan.name}</h3>
            <div className={styles.priceSection}>
              <div className={styles.mainPrice}>
                {premiumPlan.price}
                <span className={styles.perMonth}>/month</span>
              </div>
            </div>
            <p className={styles.planDescription}>{premiumPlan.description}</p>
          </div>

          <div className={styles.featuresSection}>
            <ul className={styles.featuresList}>
              {premiumPlan.features.map((feature, index) => (
                <li key={index} className={styles.featureItem}>
                  <span className={styles.checkIcon}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/create-salon?plan=PREMIUM"
            className={`${styles.selectButton} ${styles.popularButton}`}
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h4>What&apos;s included in the Premium plan?</h4>
            <p>Everything! You get unlimited service listings, unlimited gallery images, priority search ranking (5x visibility boost), a featured salon badge, advanced analytics, and prioritised support. All for R399/month.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Do you charge commission on bookings?</h4>
            <p>No. Unlike other platforms, we charge <strong>0% commission</strong> on your bookings. You keep 100% of what you earn from your clients.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Can I cancel my plan anytime?</h4>
            <p>Yes, cancel anytime with no penalties. You&apos;ll keep access until the end of your billing period. No long-term contracts required.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>How does the visibility boost work?</h4>
            <p>Premium salons appear 5x higher in search results and get featured placement in the "Recommended" section, ensuring more potential clients see your listing first.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Are there any hidden fees?</h4>
            <p>No hidden fees at all. The plan is a flat R399/month. We don't charge for leads, bookings, or setup.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>How do I get started?</h4>
            <p>Click "Get Started Now" above to create your salon profile. It takes less than 5 minutes to set up, and your visibility boost starts immediately.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaSection}>
        <h2>Ready to Grow Your Business?</h2>
        <p>Join thousands of beauty professionals on Stylr SA</p>
        <Link href="/create-salon?plan=PREMIUM" className={styles.cta}>
          Start Your Free Trial
        </Link>
      </div>
    </div>
  );
}
