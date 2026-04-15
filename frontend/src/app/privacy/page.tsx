import { Metadata } from 'next';
import Link from 'next/link';
import styles from '../info-page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy - Stylr SA',
  description: 'Read how Stylr SA collects, uses, and protects your personal information. Learn about your privacy rights and data security practices.',
  keywords: 'privacy policy, data protection, POPIA, GDPR, personal information, Stylr SA privacy',
  openGraph: {
    title: 'Privacy Policy - Stylr SA',
    description: 'Learn how Stylr SA protects your privacy and handles your personal data.',
    type: 'website',
    url: 'https://stylrsa.co.za/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Privacy Policy</h1>
        <p className={styles.paragraph}>
          <strong>Last Updated:</strong> November 4, 2025
        </p>

        <h2 className={styles.sectionTitle}>1. Introduction</h2>
        <p className={styles.paragraph}>
          Welcome to Stylr SA. We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at stylrsa.co.za ("Platform").
        </p>
        <p className={styles.paragraph}>
          This policy complies with the Protection of Personal Information Act (POPIA) of South Africa and other applicable data protection regulations.
        </p>

        <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
        
        <h3 className={styles.blockTitle}>2.1 Information You Provide to Us</h3>
        <p className={styles.paragraph}>
          We collect information that you voluntarily provide when you:
        </p>
        <ul className={styles.list}>
          <li><strong>Create a salon owner account:</strong> Name, email address, phone number, password, and profile picture</li>
          <li><strong>Complete a salon listing:</strong> Business location, service details, portfolio media, availability, and related profile information</li>
          <li><strong>Book services:</strong> Booking details, contact information, and special requests</li>
          <li><strong>Communicate with us:</strong> Messages, reviews, ratings, customer support inquiries</li>
          <li><strong>Submit business verification details:</strong> Verification information, portfolio images or videos, availability, and related profile information</li>
        </ul>

        <h3 className={styles.blockTitle}>2.2 Information Collected Automatically</h3>
        <p className={styles.paragraph}>
          When you access our Platform, we automatically collect certain information, including:
        </p>
        <ul className={styles.list}>
          <li><strong>Device information:</strong> IP address, browser type, device type, operating system</li>
          <li><strong>Usage data:</strong> Pages viewed, time spent on pages, clicks, search queries</li>
          <li><strong>Location data:</strong> Approximate location based on IP address (with your consent, precise location for location-based services)</li>
          <li><strong>Cookies and tracking technologies:</strong> See our Cookie Policy for details</li>
        </ul>

        <h3 className={styles.blockTitle}>2.3 Information from Third Parties</h3>
        <p className={styles.paragraph}>
          We may receive information from:
        </p>
        <ul className={styles.list}>
          <li><strong>Social media platforms:</strong> When you sign in using social media accounts</li>
          <li><strong>Payment processors:</strong> Transaction details, payment status</li>
          <li><strong>Analytics providers:</strong> Aggregated usage statistics</li>
          <li><strong>Other users:</strong> When they tag you in photos or mention you in reviews</li>
        </ul>

        <h2 className={styles.sectionTitle}>3. How We Use Your Information</h2>
        <p className={styles.paragraph}>
          We use your information to:
        </p>
        <ul className={styles.list}>
          <li><strong>Provide and improve our services:</strong> Process bookings, facilitate transactions, manage accounts</li>
          <li><strong>Personalize your experience:</strong> Recommend salons, services, and professionals based on your preferences</li>
          <li><strong>Communicate with you:</strong> Send booking confirmations, updates, promotional offers, newsletters</li>
          <li><strong>Process payments:</strong> Handle transactions securely through our payment partners</li>
          <li><strong>Ensure platform security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
          <li><strong>Comply with legal obligations:</strong> Respond to legal requests, enforce our Terms of Service</li>
          <li><strong>Analyze and improve:</strong> Understand how users interact with our Platform, improve features</li>
          <li><strong>Marketing and promotions:</strong> Send you relevant offers and updates (you can opt out anytime)</li>
        </ul>

        <h2 className={styles.sectionTitle}>4. Legal Basis for Processing (POPIA Compliance)</h2>
        <p className={styles.paragraph}>
          We process your personal information based on the following lawful grounds:
        </p>
        <ul className={styles.list}>
          <li><strong>Consent:</strong> You have given clear consent for us to process your information for specific purposes</li>
          <li><strong>Contract performance:</strong> Processing is necessary to fulfill our contract with you (e.g., booking services)</li>
          <li><strong>Legal obligations:</strong> We must process your information to comply with South African law</li>
          <li><strong>Legitimate interests:</strong> Processing is necessary for our legitimate business interests (e.g., fraud prevention, platform improvement)</li>
        </ul>

        <h2 className={styles.sectionTitle}>5. How We Share Your Information</h2>
        <p className={styles.paragraph}>
          We do not sell your personal information. We may share your information with:
        </p>
        
        <h3 className={styles.blockTitle}>5.1 Service Providers and Partners</h3>
        <p className={styles.paragraph}>
          When you book a service, we share relevant information such as your name, contact details, and booking details with the relevant service provider or platform partner to fulfill your request.
        </p>

        <h3 className={styles.blockTitle}>5.2 Service Partners</h3>
        <p className={styles.paragraph}>
          We work with third-party service providers who assist us with:
        </p>
        <ul className={styles.list}>
          <li>Payment processing (e.g., Stripe, PayFast)</li>
          <li>Email and SMS communications</li>
          <li>Hosting and cloud services</li>
          <li>Analytics and performance monitoring</li>
          <li>Customer support tools</li>
        </ul>
        <p className={styles.paragraph}>
          These partners are bound by confidentiality agreements and may only use your information to provide services to us.
        </p>

        <h3 className={styles.blockTitle}>5.3 Legal and Safety Reasons</h3>
        <p className={styles.paragraph}>
          We may disclose your information when required by law or to:
        </p>
        <ul className={styles.list}>
          <li>Comply with legal processes (court orders, subpoenas)</li>
          <li>Enforce our Terms of Service</li>
          <li>Protect the rights, property, or safety of Stylr SA, our users, or the public</li>
          <li>Detect, prevent, or address fraud, security, or technical issues</li>
        </ul>

        <h3 className={styles.blockTitle}>5.4 Business Transfers</h3>
        <p className={styles.paragraph}>
          In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
        </p>

        <h3 className={styles.blockTitle}>5.5 With Your Consent</h3>
        <p className={styles.paragraph}>
          We may share your information with other parties when you explicitly consent to such sharing.
        </p>

        <h2 className={styles.sectionTitle}>6. Your Privacy Rights (POPIA)</h2>
        <p className={styles.paragraph}>
          Under POPIA, you have the following rights regarding your personal information:
        </p>
        <ul className={styles.list}>
          <li><strong>Right to access:</strong> Request a copy of the personal information we hold about you</li>
          <li><strong>Right to correction:</strong> Request that we correct inaccurate or incomplete information</li>
          <li><strong>Right to deletion:</strong> Request that we delete your personal information (subject to legal obligations)</li>
          <li><strong>Right to object:</strong> Object to certain types of processing (e.g., direct marketing)</li>
          <li><strong>Right to restriction:</strong> Request that we limit how we use your information</li>
          <li><strong>Right to data portability:</strong> Request your data in a portable format</li>
          <li><strong>Right to withdraw consent:</strong> Withdraw consent for processing at any time</li>
        </ul>
        <p className={styles.paragraph}>
          To exercise any of these rights, please contact us at <strong>privacy@stylrsa.co.za</strong>.
        </p>

        <h2 className={styles.sectionTitle}>7. Data Security</h2>
        <p className={styles.paragraph}>
          We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
        </p>
        <ul className={styles.list}>
          <li>Encryption of data in transit and at rest</li>
          <li>Secure authentication and access controls</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Employee training on data protection</li>
          <li>Secure payment processing through PCI-DSS compliant partners</li>
        </ul>
        <p className={styles.paragraph}>
          However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
        </p>

        <h2 className={styles.sectionTitle}>8. Data Retention</h2>
        <p className={styles.paragraph}>
          We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Retention periods vary depending on the type of information:
        </p>
        <ul className={styles.list}>
          <li><strong>Account information:</strong> Retained while your account is active and for a reasonable period after closure</li>
          <li><strong>Transaction records:</strong> Retained for accounting and legal compliance (typically 5-7 years)</li>
          <li><strong>Marketing data:</strong> Retained until you opt out or request deletion</li>
          <li><strong>Anonymized analytics:</strong> May be retained indefinitely for research and improvement</li>
        </ul>

        <h2 className={styles.sectionTitle}>9. Cookies and Tracking Technologies</h2>
        <p className={styles.paragraph}>
          We use cookies and similar technologies to enhance your experience on our Platform. For detailed information about the cookies we use and your choices, please see our <Link href="/cookie-policy">Cookie Policy</Link>.
        </p>

        <h2 className={styles.sectionTitle}>10. Third-Party Links</h2>
        <p className={styles.paragraph}>
          Our Platform may contain links to third-party websites or services (e.g., social media platforms, payment processors). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
        </p>

        <h2 className={styles.sectionTitle}>11. Children's Privacy</h2>
        <p className={styles.paragraph}>
          Our Platform is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately at <strong>privacy@stylrsa.co.za</strong>, and we will delete it.
        </p>

        <h2 className={styles.sectionTitle}>12. International Data Transfers</h2>
        <p className={styles.paragraph}>
          Your information may be transferred to and processed in countries outside of South Africa where our service providers operate. We ensure that such transfers comply with POPIA and that appropriate safeguards are in place.
        </p>

        <h2 className={styles.sectionTitle}>13. Marketing Communications</h2>
        <p className={styles.paragraph}>
          We may send you promotional emails, newsletters, and SMS messages about new features, special offers, and events. You can opt out of marketing communications at any time by:
        </p>
        <ul className={styles.list}>
          <li>Clicking the "unsubscribe" link in our emails</li>
          <li>Replying "STOP" to SMS messages</li>
          <li>Updating your communication preferences in your account settings</li>
          <li>Contacting us at <strong>privacy@stylrsa.co.za</strong></li>
        </ul>
        <p className={styles.paragraph}>
          Note: Even if you opt out of marketing communications, we will still send you important service-related messages (e.g., booking confirmations, account notifications).
        </p>

        <h2 className={styles.sectionTitle}>14. Changes to This Privacy Policy</h2>
        <p className={styles.paragraph}>
          We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make significant changes, we will notify you by email or through a prominent notice on our Platform. The "Last Updated" date at the top of this policy indicates when it was last revised.
        </p>
        <p className={styles.paragraph}>
          Your continued use of the Platform after changes are posted constitutes your acceptance of the updated Privacy Policy.
        </p>

        <h2 className={styles.sectionTitle}>15. Contact Us</h2>
        <p className={styles.paragraph}>
          If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
        </p>
        <ul className={styles.list}>
          <li><strong>Email:</strong> privacy@stylrsa.co.za</li>
          <li><strong>Website:</strong> <Link href="/contact">Contact Page</Link></li>
          <li><strong>Address:</strong> Stylr SA, South Africa</li>
        </ul>

        <h2 className={styles.sectionTitle}>16. Information Officer (POPIA Requirement)</h2>
        <p className={styles.paragraph}>
          Under POPIA, we have designated an Information Officer responsible for ensuring compliance with data protection laws:
        </p>
        <ul className={styles.list}>
          <li><strong>Name:</strong> Information Officer, Stylr SA</li>
          <li><strong>Email:</strong> info.officer@stylrsa.co.za</li>
        </ul>
        <p className={styles.paragraph}>
          If you have concerns about how your personal information is being handled, you also have the right to lodge a complaint with the Information Regulator of South Africa.
        </p>

        <div className={styles.infoBlock} style={{ marginTop: '2rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Your Privacy Matters to Us</h3>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            At Stylr SA, we are committed to protecting your privacy and handling your personal information with care and transparency. If you have any questions or concerns, please don't hesitate to reach out to us.
          </p>
        </div>
      </section>
    </div>
  );
}
