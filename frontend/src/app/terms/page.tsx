import { Metadata } from 'next';
import Link from 'next/link';
import { SALON_LISTING_MONTHLY_PRICE } from '@/constants/plans';
import styles from '../info-page.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service - Stylr SA',
  description: 'Read Stylr SA\'s Terms of Service. Understand your rights and responsibilities when using our beauty and wellness booking and discovery platform.',
  keywords: 'terms of service, user agreement, Stylr SA legal, terms and conditions',
  openGraph: {
    title: 'Terms of Service - Stylr SA',
    description: 'Stylr SA Terms of Service and user agreement for our beauty and wellness platform.',
    type: 'website',
    url: 'https://stylrsa.co.za/terms',
  },
};

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Terms of Service</h1>
        <p className={styles.paragraph}>
          <strong>Last Updated:</strong> November 4, 2025
        </p>

        <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
        <p className={styles.paragraph}>
          Welcome to Stylr SA. By accessing or using our platform at stylrsa.co.za ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Platform.
        </p>
        <p className={styles.paragraph}>
          These Terms apply to all users of the Platform, including customers, salon owners, service providers, and visitors.
        </p>

        <h2 className={styles.sectionTitle}>2. Description of Service</h2>
        <p className={styles.paragraph}>
          Stylr SA is an online platform that connects beauty and wellness service providers with customers in South Africa. Our Platform allows:
        </p>
        <ul className={styles.list}>
          <li>Customers to discover, review, and book services with salons and independent professionals</li>
          <li>Service providers to create profiles, showcase their work, manage bookings, and promote their services</li>
          <li>Users to interact through reviews, ratings, and messaging</li>
        </ul>

        <h2 className={styles.sectionTitle}>3. User Accounts</h2>
        
        <h3 className={styles.blockTitle}>3.1 Account Registration</h3>
        <p className={styles.paragraph}>
          To access certain features, you must register for an account. You agree to:
        </p>
        <ul className={styles.list}>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and update your information to keep it accurate</li>
          <li>Keep your password secure and confidential</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
          <li>Be responsible for all activities that occur under your account</li>
        </ul>

        <h3 className={styles.blockTitle}>3.2 Account Types</h3>
        <ul className={styles.list}>
          <li><strong>Customer Accounts:</strong> For booking services and managing your activity on the Platform</li>
          <li><strong>Service Provider Accounts:</strong> For salons, spas, and independent professionals</li>
        </ul>

        <h3 className={styles.blockTitle}>3.3 Account Termination</h3>
        <p className={styles.paragraph}>
          We reserve the right to suspend or terminate your account at any time for violations of these Terms, fraudulent activity, or any other reason we deem appropriate.
        </p>

        <h2 className={styles.sectionTitle}>4. User Conduct</h2>
        <p className={styles.paragraph}>
          You agree NOT to:
        </p>
        <ul className={styles.list}>
          <li>Violate any local, provincial, national, or international law</li>
          <li>Post false, inaccurate, misleading, or defamatory content</li>
          <li>Impersonate any person or entity</li>
          <li>Harass, threaten, or intimidate other users</li>
          <li>Upload viruses, malware, or any harmful code</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Scrape, data mine, or extract data from the Platform without permission</li>
          <li>Use the Platform for any commercial purpose outside the intended booking, discovery, and career-networking functions</li>
          <li>Post spam, advertisements, or unsolicited messages</li>
        </ul>

        <h2 className={styles.sectionTitle}>5. Bookings and Transactions</h2>
        
        <h3 className={styles.blockTitle}>5.1 Service Bookings</h3>
        <p className={styles.paragraph}>
          When you book a service through our Platform:
        </p>
        <ul className={styles.list}>
          <li>You are entering into a direct agreement with the service provider</li>
          <li>Stylr SA acts as a platform facilitator only</li>
          <li>Payment terms, cancellation policies, and service delivery are subject to the provider's policies</li>
          <li>You must honor your booking commitments</li>
        </ul>

        <h3 className={styles.blockTitle}>5.2 Payments and Fees</h3>
        <p className={styles.paragraph}>
          Service-provider listings are offered on a flat {SALON_LISTING_MONTHLY_PRICE} subscription for salons and independent professionals listing services on Stylr SA. Any applicable fees will be clearly disclosed before completion.
        </p>

        <h2 className={styles.sectionTitle}>6. Service Provider Obligations</h2>
        <p className={styles.paragraph}>
          If you operate as a service provider on our Platform, you agree to:
        </p>
        <ul className={styles.list}>
          <li>Provide accurate information about your services, pricing, and availability</li>
          <li>Maintain appropriate licenses and certifications required for your services</li>
          <li>Honor bookings made through the Platform</li>
          <li>Provide quality services in a professional manner</li>
          <li>Comply with all applicable health, safety, and industry regulations</li>
          <li>Respond promptly to customer inquiries and booking requests</li>
          <li>Maintain accurate calendars and availability</li>
        </ul>

        <h2 className={styles.sectionTitle}>7. Profile Accuracy and Professional Conduct</h2>
        <p className={styles.paragraph}>
          If you create or manage a profile on our Platform, you agree to:
        </p>
        <ul className={styles.list}>
          <li>Provide accurate information about your business, services, qualifications, and availability</li>
          <li>Only upload portfolio content that you own or have permission to use</li>
          <li>Represent your certifications, experience, and service scope honestly</li>
          <li>Comply with all applicable employment, licensing, and professional standards</li>
          <li>Communicate professionally with customers, partners, and other users</li>
        </ul>

        <h2 className={styles.sectionTitle}>8. Content and Intellectual Property</h2>
        
        <h3 className={styles.blockTitle}>8.1 Your Content</h3>
        <p className={styles.paragraph}>
          You retain ownership of content you post on the Platform (photos, videos, reviews, etc.). By posting content, you grant Stylr SA a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content for the purpose of operating and promoting the Platform.
        </p>

        <h3 className={styles.blockTitle}>8.2 Our Content</h3>
        <p className={styles.paragraph}>
          The Platform, including its design, features, graphics, and software, is owned by Stylr SA and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
        </p>

        <h3 className={styles.blockTitle}>8.3 Content Moderation</h3>
        <p className={styles.paragraph}>
          We reserve the right to remove any content that violates these Terms, is illegal, offensive, or otherwise inappropriate. We are not responsible for user-generated content but will take action when violations are reported.
        </p>

        <h2 className={styles.sectionTitle}>9. Reviews and Ratings</h2>
        <p className={styles.paragraph}>
          Reviews must be honest, accurate, and based on genuine experiences. You may not:
        </p>
        <ul className={styles.list}>
          <li>Post fake or fraudulent reviews</li>
          <li>Review your own business or a competitor's business</li>
          <li>Offer incentives for positive reviews</li>
          <li>Include offensive, defamatory, or discriminatory content</li>
        </ul>

        <h2 className={styles.sectionTitle}>10. Disclaimers and Limitations of Liability</h2>
        
        <h3 className={styles.blockTitle}>10.1 Platform "As Is"</h3>
        <p className={styles.paragraph}>
          The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Platform will be uninterrupted, secure, or error-free.
        </p>

        <h3 className={styles.blockTitle}>10.2 Third-Party Services</h3>
        <p className={styles.paragraph}>
          Stylr SA is a platform connecting users with service providers and beauty businesses. We are not responsible for:
        </p>
        <ul className={styles.list}>
          <li>The quality, safety, or legality of services offered</li>
          <li>The accuracy of listings, profiles, or user content</li>
          <li>The conduct or performance of service providers or other users</li>
          <li>Disputes between users</li>
        </ul>

        <h3 className={styles.blockTitle}>10.3 Limitation of Liability</h3>
        <p className={styles.paragraph}>
          To the maximum extent permitted by South African law, Stylr SA shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of profits, data, or goodwill.
        </p>

        <h2 className={styles.sectionTitle}>11. Indemnification</h2>
        <p className={styles.paragraph}>
          You agree to indemnify, defend, and hold harmless Stylr SA, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
        </p>
        <ul className={styles.list}>
          <li>Your use of the Platform</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any rights of another party</li>
          <li>Content you post on the Platform</li>
        </ul>

        <h2 className={styles.sectionTitle}>12. Dispute Resolution</h2>
        <p className={styles.paragraph}>
          These Terms are governed by the laws of the Republic of South Africa. Any disputes arising from these Terms or your use of the Platform shall be resolved in the courts of South Africa.
        </p>
        <p className={styles.paragraph}>
          We encourage users to contact us first to resolve disputes informally before pursuing legal action.
        </p>

        <h2 className={styles.sectionTitle}>13. Privacy</h2>
        <p className={styles.paragraph}>
          Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. Please review our Privacy Policy at <Link href="/privacy">/privacy</Link>.
        </p>

        <h2 className={styles.sectionTitle}>14. Changes to Terms</h2>
        <p className={styles.paragraph}>
          We may update these Terms from time to time. When we make significant changes, we will notify you by email or through a notice on the Platform. Your continued use of the Platform after changes are posted constitutes your acceptance of the updated Terms.
        </p>

        <h2 className={styles.sectionTitle}>15. Termination</h2>
        <p className={styles.paragraph}>
          You may stop using the Platform and close your account at any time. We may terminate or suspend your access immediately, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
        </p>

        <h2 className={styles.sectionTitle}>16. Severability</h2>
        <p className={styles.paragraph}>
          If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
        </p>

        <h2 className={styles.sectionTitle}>17. Contact Us</h2>
        <p className={styles.paragraph}>
          If you have questions about these Terms of Service, please contact us:
        </p>
        <ul className={styles.list}>
          <li><strong>Email:</strong> legal@stylrsa.co.za</li>
          <li><strong>Website:</strong> <Link href="/contact">Contact Page</Link></li>
          <li><strong>Address:</strong> Stylr SA, South Africa</li>
        </ul>

        <div className={styles.infoBlock} style={{ marginTop: '2rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            By using Stylr SA, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </section>
    </div>
  );
}
