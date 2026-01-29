"use client";

import { useState } from 'react';
import Link from 'next/link';
import PageNav from '@/components/PageNav';
import styles from './prices.module.css';
import { APP_PLANS, COMMISSION_RATES } from '@/constants/plans';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.accordionItem}>
      <button
        className={styles.accordionHeader}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
      >
        <span>{title}</span>
        <span className={`${styles.accordionIcon} ${isOpen ? styles.accordionIconOpen : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && <div className={styles.accordionContent}>{children}</div>}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className={styles.container}>
      <PageNav />

      <div className={styles.header}>
        <h1 className={styles.title}>Choose Your Growth Plan</h1>
        <p className={styles.subtitle}>
          Flexible monthly plans. No commission fees. No long-term contracts.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className={styles.pricingGrid}>
        {APP_PLANS.filter(plan => plan.code !== 'FREE').map((plan) => (
          <div
            key={plan.code}
            className={`${styles.pricingCard} ${plan.popular ? styles.popularCard : ''}`}
          >
            {plan.popular && (
              <div className={styles.popularBadge}>
                <span>⭐</span> Most Popular
              </div>
            )}

            <div className={styles.cardHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.priceSection}>
                <div className={styles.mainPrice}>
                  {plan.price}
                  {plan.code !== 'FREE' && <span className={styles.perMonth}>/month</span>}
                </div>
                {plan.originalPrice && (
                  <div className={styles.originalPrice}>{plan.originalPrice}/month</div>
                )}
              </div>
              <p className={styles.planDescription}>{plan.description}</p>
            </div>

            <div className={styles.featuresSection}>
              <ul className={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/create-salon?plan=${plan.code}`}
              className={`${styles.selectButton} ${plan.popular ? styles.popularButton : ''}`}
            >
              Select {plan.name}
            </Link>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className={styles.comparisonSection}>
        <h2 className={styles.comparisonTitle}>Compare All Features</h2>

        <div className={styles.tableWrapper}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th className={styles.featureHeader}>Feature</th>
                {APP_PLANS.filter(plan => plan.code !== 'FREE').map(plan => (
                  <th key={plan.code} className={styles.planHeader}>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.featureName}>Monthly Price</td>
                {APP_PLANS.filter(plan => plan.code !== 'FREE').map(plan => (
                  <td key={plan.code} className={styles.featureValue}>{plan.price}</td>
                ))}
              </tr>
              <tr className={styles.evenRow}>
                <td className={styles.featureName}>Service Listings</td>
                {APP_PLANS.filter(plan => plan.code !== 'FREE').map(plan => (
                  <td key={plan.code} className={styles.featureValue}>Unlimited</td>
                ))}
              </tr>
              <tr>
                <td className={styles.featureName}>Visibility Boost</td>
                {APP_PLANS.filter(plan => plan.code !== 'FREE').map(plan => (
                  <td key={plan.code} className={styles.featureValue}>
                    {plan.visibilityWeight}x
                  </td>
                ))}
              </tr>
              <tr className={styles.evenRow}>
                <td className={styles.featureName}>Booking Commission</td>
                {APP_PLANS.filter(plan => plan.code !== 'FREE').map(plan => (
                  <td key={plan.code} className={styles.featureValue}>
                    None (0%)
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.featureName}>Support Level</td>
                <td className={styles.featureValue}>Priority</td>
                <td className={styles.featureValue}>Dedicated</td>
                <td className={styles.featureValue}>Premium</td>
                <td className={styles.featureValue}>White-glove</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h4>What's included in all plans?</h4>
            <p>All plans include unlimited service listings, unlimited gallery images, full analytics dashboard, and zero commission on bookings.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>What happens when I upgrade?</h4>
            <p>Your visibility increases immediately, search ranking improves, and you get access to premium features like dedicated support.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Can I cancel my plan anytime?</h4>
            <p>Yes, cancel anytime with no penalties. You'll keep access until the end of your billing period. No long-term contracts required.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>How does the visibility boost work?</h4>
            <p>Higher plans appear first in search results, get featured placement, and receive priority in recommendations. ESSENTIAL gets 3x boost, up to ELITE's 10x boost.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Do you charge booking commissions?</h4>
            <p>No! All plans have ZERO commission on bookings. You keep 100% of your earnings.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>How do I change my plan?</h4>
            <p>Click "Choose Plan" above, or upgrade/downgrade from your salon dashboard anytime. Changes take effect immediately.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaSection}>
        <h2>Ready to Grow Your Business?</h2>
        <p>Select a plan above to get started with StylrSA</p>
      </div>
    </div>
  );
}
