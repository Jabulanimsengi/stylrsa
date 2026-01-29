"use client";

import { useState } from 'react';
import Link from 'next/link';
import PageNav from '@/components/PageNav';
import styles from './prices.module.css';
import { COMMISSION_RATES } from '@/constants/plans';

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
        aria-expanded={isOpen}
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
        <h1 className={styles.title}>Simple, Fair Pricing</h1>
        <p className={styles.subtitle}>
          List your salon for free. Pay only when you get clients.
        </p>
      </div>

      {/* Main Value Proposition - Centered Card */}
      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>⭐</span>
            Our Promise
          </div>
          <h3 className={styles.planName}>Free Forever</h3>
          <div className={styles.priceContainer}>
            <div className={styles.price}>
              R0
              <span className={styles.perMonth}> to list</span>
            </div>
          </div>
          <p className={styles.description}>
            List your salon and all your services completely free. No monthly fees. No hidden charges.
            We only charge when you successfully receive a booking.
          </p>
          <Link href="/create-salon" className={styles.cta}>
            Create Your Profile — Free
          </Link>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className={styles.comparisonSection}>
        <h2 className={styles.comparisonTitle}>Our {Math.round(COMMISSION_RATES.TOTAL * 100)}% Commission Breakdown</h2>
        <p className={styles.sectionSubtitle}>
          Only charged on completed bookings — you pay nothing if you don&apos;t get clients
        </p>

        {/* Desktop Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th className={styles.featureHeader}>Component</th>
                <th className={styles.planHeader}>Percentage</th>
                <th className={styles.planHeader}>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.featureName}>Platform Fee</td>
                <td className={styles.featureValue}>{Math.round(COMMISSION_RATES.PLATFORM * 100)}%</td>
                <td className={styles.featureValue}>Marketing, advertising, technology & continuous improvements</td>
              </tr>
              <tr className={styles.evenRow}>
                <td className={styles.featureName}>Client Cashback</td>
                <td className={styles.featureValue}>{Math.round(COMMISSION_RATES.CASHBACK * 100)}%</td>
                <td className={styles.featureValue}>Returned to clients to encourage repeat bookings</td>
              </tr>
              <tr>
                <td className={styles.featureName}>Payment Processing</td>
                <td className={styles.featureValue}>{Math.round(COMMISSION_RATES.PAYMENT * 100)}%</td>
                <td className={styles.featureValue}>Secure transactions & weekly payouts every Friday</td>
              </tr>
              <tr className={styles.totalRow}>
                <td className={styles.featureName}>Total</td>
                <td className={styles.featureValue}>{Math.round(COMMISSION_RATES.TOTAL * 100)}%</td>
                <td className={styles.featureValue}>Only on completed bookings</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Accordion */}
        <div className={styles.mobileAccordion}>
          <AccordionItem title={`Platform Fee — ${Math.round(COMMISSION_RATES.PLATFORM * 100)}%`}>
            <p>Marketing, advertising, technology & continuous improvements</p>
          </AccordionItem>
          <AccordionItem title={`Client Cashback — ${Math.round(COMMISSION_RATES.CASHBACK * 100)}%`}>
            <p>Returned to clients to encourage repeat bookings</p>
          </AccordionItem>
          <AccordionItem title={`Payment Processing — ${Math.round(COMMISSION_RATES.PAYMENT * 100)}%`}>
            <p>Secure transactions & weekly payouts every Friday</p>
          </AccordionItem>
          <div className={styles.totalBanner}>
            <strong>Total: {Math.round(COMMISSION_RATES.TOTAL * 100)}%</strong> — Only on completed bookings
          </div>
        </div>
      </div>

      {/* Why We're Different */}
      <div className={styles.comparisonSection}>
        <h2 className={styles.comparisonTitle}>Why Choose StylrSA?</h2>

        {/* Desktop Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th className={styles.featureHeader}>Feature</th>
                <th className={`${styles.planHeader} ${styles.highlightHeader}`}>StylrSA</th>
                <th className={styles.planHeader}>Competitors</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.featureName}>Listing Fee</td>
                <td className={`${styles.featureValue} ${styles.highlightColumn}`}><span className={styles.checkIcon}>✓</span> FREE</td>
                <td className={styles.featureValue}>R399 - R1,500/month</td>
              </tr>
              <tr className={styles.evenRow}>
                <td className={styles.featureName}>Service Listings</td>
                <td className={`${styles.featureValue} ${styles.highlightColumn}`}><span className={styles.checkIcon}>✓</span> Unlimited</td>
                <td className={styles.featureValue}>Limited by plan</td>
              </tr>
              <tr>
                <td className={styles.featureName}>Pay Without Clients</td>
                <td className={`${styles.featureValue} ${styles.highlightColumn}`}><span className={styles.checkIcon}>✓</span> Never</td>
                <td className={styles.featureValue}>Yes, every month</td>
              </tr>
              <tr className={styles.evenRow}>
                <td className={styles.featureName}>Client Cashback</td>
                <td className={`${styles.featureValue} ${styles.highlightColumn}`}><span className={styles.checkIcon}>✓</span> 5% back</td>
                <td className={styles.featureValue}><span className={styles.crossIcon}>—</span></td>
              </tr>
              <tr>
                <td className={styles.featureName}>Weekly Payouts</td>
                <td className={`${styles.featureValue} ${styles.highlightColumn}`}><span className={styles.checkIcon}>✓</span> Every Friday</td>
                <td className={styles.featureValue}>Varies</td>
              </tr>
              <tr className={styles.evenRow}>
                <td className={styles.featureName}>Risk</td>
                <td className={`${styles.featureValue} ${styles.highlightColumn}`}><span className={styles.checkIcon}>✓</span> Zero</td>
                <td className={styles.featureValue}>Pay even with no clients</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Accordion */}
        <div className={styles.mobileAccordion}>
          <AccordionItem title="Listing Fee">
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonUs}>
                <span className={styles.checkIcon}>✓</span> StylrSA: <strong>FREE</strong>
              </div>
              <div className={styles.comparisonThem}>Others: R399 - R1,500/month</div>
            </div>
          </AccordionItem>
          <AccordionItem title="Service Listings">
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonUs}>
                <span className={styles.checkIcon}>✓</span> StylrSA: <strong>Unlimited</strong>
              </div>
              <div className={styles.comparisonThem}>Others: Limited by plan</div>
            </div>
          </AccordionItem>
          <AccordionItem title="Pay Without Clients">
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonUs}>
                <span className={styles.checkIcon}>✓</span> StylrSA: <strong>Never</strong>
              </div>
              <div className={styles.comparisonThem}>Others: Yes, every month</div>
            </div>
          </AccordionItem>
          <AccordionItem title="Client Cashback">
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonUs}>
                <span className={styles.checkIcon}>✓</span> StylrSA: <strong>5% back</strong>
              </div>
              <div className={styles.comparisonThem}>Others: None</div>
            </div>
          </AccordionItem>
          <AccordionItem title="Weekly Payouts">
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonUs}>
                <span className={styles.checkIcon}>✓</span> StylrSA: <strong>Every Friday</strong>
              </div>
              <div className={styles.comparisonThem}>Others: Varies</div>
            </div>
          </AccordionItem>
          <AccordionItem title="Risk">
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonUs}>
                <span className={styles.checkIcon}>✓</span> StylrSA: <strong>Zero</strong>
              </div>
              <div className={styles.comparisonThem}>Others: Pay even with no clients</div>
            </div>
          </AccordionItem>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h4>Is it really free to list?</h4>
            <p>Yes! Creating your salon profile and listing all your services is 100% free. No monthly fees, no setup costs, no hidden charges.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>When do I pay the commission?</h4>
            <p>Only when a client books and completes an appointment through our platform. If you don&apos;t get clients, you pay nothing.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Why {Math.round(COMMISSION_RATES.TOTAL * 100)}% commission?</h4>
            <p>
              {Math.round(COMMISSION_RATES.PLATFORM * 100)}% covers the platform, marketing & tech.
              {Math.round(COMMISSION_RATES.CASHBACK * 100)}% goes back to clients as cashback.
              {Math.round(COMMISSION_RATES.PAYMENT * 100)}% covers secure payment processing.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>When do I get paid?</h4>
            <p>Payouts are processed every Friday. Your earnings from completed bookings will be deposited directly to your account.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Why not monthly subscriptions?</h4>
            <p>Most service providers told us they&apos;re frustrated paying for platforms that don&apos;t deliver clients. We only succeed when you succeed.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>How many services can I list?</h4>
            <p>Unlimited! List as many services as you offer. There are no limits on services, images, or team members.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaSection}>
        <h2>Ready to Grow Your Business?</h2>
        <p>Join thousands of service providers who only pay when they earn.</p>
        <Link href="/create-salon" className={styles.cta}>
          Get Started — Free
        </Link>
      </div>
    </div>
  );
}
