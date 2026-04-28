import { Metadata } from 'next';
import Link from 'next/link';
import styles from '../info-page.module.css';

export const metadata: Metadata = {
  title: 'Safety & Security - Stylr SA',
  description: 'Learn about Stylr SA\'s commitment to your safety and security. Information about platform safety features, payment security, and best practices.',
  keywords: 'safety, security, payment security, user safety, Stylr SA trust',
  openGraph: {
    title: 'Safety & Security - Stylr SA',
    description: 'Your safety and security are our top priorities at Stylr SA.',
    type: 'website',
    url: 'https://stylrsa.co.za/safety-security',
  },
};

export default function SafetySecurityPage() {
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Safety & Security</h1>
        <p className={styles.paragraph}>
          <strong>Last Updated:</strong> November 4, 2025
        </p>

        <div className={styles.infoBlock} style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            At Stylr SA, your safety and security are our highest priorities. We're committed to providing a trusted platform where clients and service providers can connect with confidence.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>1. Platform Security</h2>
        
        <h3 className={styles.blockTitle}>1.1 Data Protection</h3>
        <p className={styles.paragraph}>
          We use industry-leading security measures to protect your personal information:
        </p>
        <ul className={styles.list}>
          <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using SSL/TLS technology</li>
          <li><strong>Secure servers:</strong> Your data is stored on secure, monitored servers with multiple layers of protection</li>
          <li><strong>Access controls:</strong> Strict access controls ensure only authorized personnel can access sensitive data</li>
          <li><strong>Regular audits:</strong> We conduct regular security audits and vulnerability assessments</li>
          <li><strong>Compliance:</strong> We comply with POPIA (Protection of Personal Information Act) and international data protection standards</li>
        </ul>

        <h3 className={styles.blockTitle}>1.2 Account Security</h3>
        <p className={styles.paragraph}>
          Protect your account with these security features:
        </p>
        <ul className={styles.list}>
          <li><strong>Strong passwords:</strong> Use unique, complex passwords (minimum 8 characters with letters, numbers, and symbols)</li>
          <li><strong>Two-factor authentication:</strong> Add an extra layer of security to your account (coming soon)</li>
          <li><strong>Login notifications:</strong> Receive alerts for new login attempts</li>
          <li><strong>Session management:</strong> View and manage active sessions across devices</li>
        </ul>

        <h2 className={styles.sectionTitle}>2. Payment Security</h2>
        
        <h3 className={styles.blockTitle}>2.1 Secure Payment Processing</h3>
        <p className={styles.paragraph}>
          All payments on Stylr SA are processed through trusted, PCI-DSS compliant payment partners:
        </p>
        <ul className={styles.list}>
          <li><strong>No stored card details:</strong> We never store your full credit card information on our servers</li>
          <li><strong>Tokenization:</strong> Payment information is tokenized for secure transactions</li>
          <li><strong>Fraud detection:</strong> Advanced fraud detection systems monitor all transactions</li>
          <li><strong>Secure checkout:</strong> All payment pages use end-to-end encryption</li>
          <li><strong>Payment partners:</strong> We work with trusted providers like Stripe and PayFast</li>
        </ul>

        <h3 className={styles.blockTitle}>2.2 Refund & Dispute Protection</h3>
        <ul className={styles.list}>
          <li>Secure refund process for cancelled bookings</li>
          <li>Dispute resolution system for transaction issues</li>
          <li>Protection against unauthorized charges</li>
          <li>Clear cancellation and refund policies</li>
        </ul>

        <h2 className={styles.sectionTitle}>3. User Safety</h2>
        
        <h3 className={styles.blockTitle}>3.1 Profile Verification</h3>
        <p className={styles.paragraph}>
          We verify service providers to ensure quality and trustworthiness:
        </p>
        <ul className={styles.list}>
          <li><strong>Identity verification:</strong> Service providers must verify their identity</li>
          <li><strong>Business credentials:</strong> We verify business registrations and licenses</li>
          <li><strong>Professional certifications:</strong> We verify relevant professional qualifications</li>
          <li><strong>Verified badges:</strong> Look for the verification badge on provider profiles</li>
        </ul>

        <h3 className={styles.blockTitle}>3.2 Review System</h3>
        <p className={styles.paragraph}>
          Our review system helps you make informed decisions:
        </p>
        <ul className={styles.list}>
          <li><strong>Verified reviews:</strong> Only users who have completed bookings can leave reviews</li>
          <li><strong>Review moderation:</strong> We monitor reviews for fake, abusive, or inappropriate content</li>
          <li><strong>Response system:</strong> Service providers can respond to reviews professionally</li>
          <li><strong>Rating transparency:</strong> Clear, honest ratings based on real experiences</li>
        </ul>

        <h3 className={styles.blockTitle}>3.3 Reporting & Moderation</h3>
        <p className={styles.paragraph}>
          If you encounter any issues, you can report them immediately:
        </p>
        <ul className={styles.list}>
          <li>Report inappropriate behavior or content</li>
          <li>Flag suspicious accounts or activities</li>
          <li>Contact our support team 24/7</li>
          <li>We investigate all reports promptly and take appropriate action</li>
        </ul>

        <h2 className={styles.sectionTitle}>4. Health & Hygiene</h2>
        
        <h3 className={styles.blockTitle}>4.1 Partner Standards</h3>
        <p className={styles.paragraph}>
          All service providers on our platform must:
        </p>
        <ul className={styles.list}>
          <li>Maintain clean, hygienic workspaces</li>
          <li>Sanitize tools and equipment between clients</li>
          <li>Follow COVID-19 and health department guidelines</li>
          <li>Use disposable items where appropriate</li>
          <li>Conduct patch tests when necessary</li>
          <li>Have proper ventilation and sanitation systems</li>
        </ul>

        <h3 className={styles.blockTitle}>4.2 Client Responsibilities</h3>
        <p className={styles.paragraph}>
          Help keep everyone safe by:
        </p>
        <ul className={styles.list}>
          <li>Disclosing allergies or sensitivities before treatments</li>
          <li>Informing providers of any skin conditions or health concerns</li>
          <li>Following pre-treatment instructions (e.g., arriving with clean hair)</li>
          <li>Cancelling if you're feeling unwell</li>
          <li>Respecting provider safety protocols</li>
        </ul>

        <h2 className={styles.sectionTitle}>5. Privacy & Confidentiality</h2>
        <p className={styles.paragraph}>
          Your privacy is protected throughout your experience:
        </p>
        <ul className={styles.list}>
          <li><strong>Personal information:</strong> Your contact details are only shared with providers you book with</li>
          <li><strong>Payment information:</strong> Never shared with service providers</li>
          <li><strong>Communication:</strong> Booking details are shared only as needed to complete your request</li>
          <li><strong>Data control:</strong> You control what information appears on your public profile</li>
          <li><strong>Data rights:</strong> You can request, edit, or delete your data at any time</li>
        </ul>
        <p className={styles.paragraph}>
          Read our full <Link href="/privacy">Privacy Policy</Link> for more details.
        </p>

        <h2 className={styles.sectionTitle}>6. Best Practices for Users</h2>
        
        <h3 className={styles.blockTitle}>6.1 For Clients</h3>
        <ul className={styles.list}>
          <li>✓ Read reviews and ratings before booking</li>
          <li>✓ Verify provider credentials and certifications</li>
          <li>✓ Communicate clearly about your expectations</li>
          <li>✓ Meet in professional settings (salons, studios)</li>
          <li>✓ Use the salon's listed WhatsApp or phone details for booking follow-up</li>
          <li>✓ Report any suspicious behavior immediately</li>
          <li>✗ Never share your password or payment details directly</li>
          <li>✗ Avoid making payments outside the platform</li>
        </ul>

        <h3 className={styles.blockTitle}>6.2 For Service Providers</h3>
        <ul className={styles.list}>
          <li>✓ Complete your profile with accurate information</li>
          <li>✓ Upload clear photos of your work and workspace</li>
          <li>✓ Respond promptly to booking requests</li>
          <li>✓ Maintain professional communication</li>
          <li>✓ Honor your posted policies (cancellation, pricing)</li>
          <li>✓ Report problematic clients through proper channels</li>
          <li>✗ Never request payment outside the platform</li>
          <li>✗ Avoid sharing personal contact information too early</li>
        </ul>

        <h2 className={styles.sectionTitle}>7. What We're Doing</h2>
        <p className={styles.paragraph}>
          Stylr SA is continuously working to improve safety and security:
        </p>
        <ul className={styles.list}>
          <li><strong>24/7 monitoring:</strong> Our team monitors the platform for suspicious activity</li>
          <li><strong>AI fraud detection:</strong> Advanced algorithms detect and prevent fraudulent behavior</li>
          <li><strong>Regular updates:</strong> We continuously update our security systems</li>
          <li><strong>User education:</strong> We provide resources and tips to help you stay safe</li>
          <li><strong>Partner with authorities:</strong> We cooperate with law enforcement when necessary</li>
          <li><strong>Community standards:</strong> We enforce strict community guidelines</li>
        </ul>

        <h2 className={styles.sectionTitle}>8. Reporting Issues</h2>
        <p className={styles.paragraph}>
          If you experience or witness any safety or security concerns:
        </p>
        
        <div className={styles.infoBlock} style={{ background: '#fff3e0', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>🚨 Report Immediately</h3>
          <ul className={styles.list}>
            <li><strong>Profile reporting:</strong> Use the "Report" option on salon or provider profiles where available</li>
            <li><strong>Email:</strong> safety@stylrsa.co.za</li>
            <li><strong>Emergency support:</strong> Available 24/7 through your account dashboard</li>
            <li><strong>What to include:</strong> Screenshots, dates, user IDs, detailed description of the issue</li>
          </ul>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            We take all reports seriously and investigate them promptly. Your report helps keep the community safe.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>9. Safety Tips</h2>
        
        <h3 className={styles.blockTitle}>General Safety Guidelines</h3>
        <ul className={styles.list}>
          <li>🔒 <strong>Trust your instincts:</strong> If something feels off, it probably is</li>
          <li>🔍 <strong>Do your research:</strong> Check reviews, ratings, and portfolios</li>
          <li>💬 <strong>Communicate clearly:</strong> Set expectations upfront</li>
          <li>📍 <strong>Choose public, professional locations:</strong> Meet at established salons or studios</li>
          <li>📱 <strong>Use trusted contact details:</strong> Follow up through the salon's listed WhatsApp or phone number</li>
          <li>🚫 <strong>Never share sensitive information:</strong> Don't share passwords, banking details, or personal addresses</li>
          <li>⚠️ <strong>Report issues:</strong> Help us maintain a safe community by reporting problems</li>
        </ul>

        <h2 className={styles.sectionTitle}>10. Contact Our Safety Team</h2>
        <p className={styles.paragraph}>
          Have questions or concerns about safety and security?
        </p>
        <ul className={styles.list}>
          <li><strong>Safety Email:</strong> safety@stylrsa.co.za</li>
          <li><strong>Security Issues:</strong> security@stylrsa.co.za</li>
          <li><strong>General Support:</strong> <Link href="/support">Support Center</Link></li>
          <li><strong>Emergency Contact:</strong> Available 24/7 in your dashboard</li>
        </ul>

        <div className={styles.infoBlock} style={{ marginTop: '2rem', background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Your Safety is Our Priority</h3>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            We're committed to providing a safe, secure platform for all users. If you ever feel unsafe or have security concerns, please contact us immediately. Together, we can build a trusted community.
          </p>
        </div>
      </section>
    </div>
  );
}
