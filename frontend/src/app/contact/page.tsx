import { Metadata } from 'next';
import Link from 'next/link';
import styles from '../info-page.module.css';

export const metadata: Metadata = {
  title: 'Contact Stylr SA - Customer Support, Partner Support & General Inquiries',
  description: 'Get in touch with Stylr SA. Find contact information for customer support, partner support, and general business inquiries. We\'re here to help!',
  keywords: 'contact Stylr SA, customer support, partner support, help center, contact us, beauty platform support',
  openGraph: {
    title: 'Contact Stylr SA - Get in Touch with Our Team',
    description: 'Whether you need customer support, partner assistance, or have general questions, the Stylr SA team is here to help.',
    type: 'website',
    url: 'https://stylrsa.co.za/contact',
  },
};

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Contact</h1>
        <p className={styles.paragraph}>
          We&apos;re here to help! Whether you&apos;re a customer, a partner, or just want to know more, here&apos;s how to reach us.
        </p>

        <div className={styles.infoBlock}>
          <h2 className={styles.sectionTitle}>Customer Support</h2>
          <p className={styles.paragraph}>
            For questions about your account, help with a booking, or payment inquiries.
          </p>
          <p className={styles.paragraph}>
            <strong>Email:</strong> <a href="mailto:info@stylrsa.co.za" className={styles.link}>info@stylrsa.co.za</a>
          </p>
          <p className={styles.paragraph}>
            <strong>Help Center:</strong> Check our <Link href="/faq" className={styles.link}>FAQ</Link> for instant answers.
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h2 className={styles.sectionTitle}>Partner Support</h2>
          <p className={styles.paragraph}>
            For help with your salon profile, managing services, or using the booking dashboard.
          </p>
          <p className={styles.paragraph}>
            <strong>Email:</strong> <a href="mailto:info@stylrsa.co.za" className={styles.link}>info@stylrsa.co.za</a>
          </p>
          <p className={styles.paragraph}>
            <strong>Resources:</strong> Visit our <Link href="/faq" className={styles.link}>FAQ</Link> for guides and tips.
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h2 className={styles.sectionTitle}>General & Press Inquiries</h2>
          <p className={styles.paragraph}>
            For media requests or other business inquiries.
          </p>
          <p className={styles.paragraph}>
            <strong>Email:</strong> <a href="mailto:info@stylrsa.co.za" className={styles.link}>info@stylrsa.co.za</a>
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>Response Times</h3>
          <p className={styles.blockContent}>
            Our team is available from 9 AM to 5 PM, Monday to Friday. We typically respond to all inquiries within 24 business hours.
          </p>
        </div>
      </section>
    </div>
  );
}

