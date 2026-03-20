import { Metadata } from 'next';
import Link from 'next/link';
import { buildAuthRoute } from '@/constants/routes';
import { SALON_LISTING_MONTHLY_PRICE } from '@/constants/plans';
import styles from '../info-page.module.css';

export const metadata: Metadata = {
  title: 'Partner Guidelines - Stylr SA',
  description: 'Guidelines for service providers and beauty professionals partnering with Stylr SA.',
  keywords: 'partner guidelines, salon partners, service providers, Stylr SA business, beauty professionals',
  openGraph: {
    title: 'Partner Guidelines - Stylr SA',
    description: 'Guidelines and best practices for beauty and wellness professionals on Stylr SA.',
    type: 'website',
    url: 'https://stylrsa.co.za/partner-guidelines',
  },
};

export default function PartnerGuidelinesPage() {
  const providerSignupHref = buildAuthRoute.providerRegister('/create-salon');

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Partner Guidelines</h1>
        <p className={styles.paragraph}>
          <strong>Last Updated:</strong> March 15, 2026
        </p>

        <div className={styles.infoBlock} style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            These guidelines help service providers create strong profiles, communicate clearly with clients, and manage bookings professionally on Stylr SA.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>1. Who Can Partner with Stylr SA?</h2>
        <ul className={styles.list}>
          <li>Hair salons, barbers, and braiding specialists</li>
          <li>Beauty specialists such as nail technicians, makeup artists, and lash or brow experts</li>
          <li>Spa and wellness providers such as massage therapists and wellness studios</li>
          <li>Independent and mobile professionals offering beauty services</li>
        </ul>

        <h2 className={styles.sectionTitle}>2. Getting Started</h2>
        <h3 className={styles.blockTitle}>2.1 Registration Requirements</h3>
        <ul className={styles.list}>
          <li>A valid email address for account verification</li>
          <li>Contact information including phone and WhatsApp details</li>
          <li>Business or self-employment information where applicable</li>
          <li>High-quality portfolio images</li>
        </ul>

        <h3 className={styles.blockTitle}>2.2 Your Listing Plan</h3>
        <ul className={styles.list}>
          <li><strong>Price:</strong> {SALON_LISTING_MONTHLY_PRICE} for service providers</li>
          <li><strong>Includes:</strong> Unlimited service listings and gallery uploads</li>
          <li><strong>Bookings:</strong> Client handoff goes through your WhatsApp number</li>
          <li><strong>Commission:</strong> 0% charged by Stylr SA on bookings handled through this flow</li>
        </ul>
        <p className={styles.paragraph}>
          View full details on our <Link href="/prices" className={styles.link}>pricing page</Link>.
        </p>

        <h2 className={styles.sectionTitle}>3. Profile Standards</h2>
        <ul className={styles.list}>
          <li>Use a clear business name and accurate contact details</li>
          <li>List services with honest pricing and descriptions</li>
          <li>Keep your gallery current and relevant to the services you offer</li>
          <li>Make sure your location and availability are kept up to date</li>
        </ul>

        <h2 className={styles.sectionTitle}>4. Communication Standards</h2>
        <ul className={styles.list}>
          <li>Respond to booking handoff messages promptly</li>
          <li>Share deposit requirements and payment instructions clearly</li>
          <li>Provide accurate directions, timing, and preparation notes</li>
          <li>Communicate schedule changes immediately</li>
        </ul>

        <h2 className={styles.sectionTitle}>5. Portfolio Best Practices</h2>
        <ul className={styles.list}>
          <li>Use high-quality images with good lighting</li>
          <li>Show recent work and real client results</li>
          <li>Upload before-and-after content where relevant</li>
          <li>Only post work you completed yourself and with client consent</li>
        </ul>

        <h2 className={styles.sectionTitle}>6. Pricing, Deposits, and Refunds</h2>
        <ul className={styles.list}>
          <li>Keep pricing clear and current</li>
          <li>State deposit requirements before confirming a booking</li>
          <li>Share your cancellation and refund rules clearly with clients</li>
          <li>Handle refunds according to your own salon policy and applicable law</li>
        </ul>

        <h2 className={styles.sectionTitle}>7. Reviews and Trust</h2>
        <ul className={styles.list}>
          <li>Encourage honest reviews from clients</li>
          <li>Respond professionally to both praise and complaints</li>
          <li>Never manipulate ratings or submit fake reviews</li>
        </ul>

        <h2 className={styles.sectionTitle}>8. Prohibited Conduct</h2>
        <ul className={styles.list}>
          <li>Misleading prices, fake listings, or false credentials</li>
          <li>Harassment, abuse, discrimination, or unsafe conduct</li>
          <li>Using the platform for illegal or prohibited services</li>
          <li>Posting work without permission</li>
        </ul>

        <div className={styles.infoBlock} style={{ marginTop: '2rem', background: '#f3e5f5', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Ready to Join?</h3>
          <p className={styles.paragraph} style={{ marginBottom: '0.5rem' }}>
            Create your service-provider profile on the {SALON_LISTING_MONTHLY_PRICE} listing plan and start showcasing your services on Stylr SA.
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <Link href={providerSignupHref}><strong>Register as a Partner</strong></Link>
          </p>
        </div>
      </section>
    </div>
  );
}
