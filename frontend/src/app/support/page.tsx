import { Metadata } from 'next';
import Link from 'next/link';
import styles from '../info-page.module.css';
import { buildAuthRoute } from '@/constants/routes';
import PageNav from '@/components/PageNav';

export const metadata: Metadata = {
  title: 'Customer Support - Stylr SA',
  description: 'Get help with Stylr SA. Access our support center, FAQs, contact information, and troubleshooting guides.',
  keywords: 'customer support, help center, contact support, Stylr SA support, FAQ',
  openGraph: {
    title: 'Customer Support - Stylr SA',
    description: 'Get the help you need with Stylr SA customer support.',
    type: 'website',
    url: 'https://stylrsa.co.za/support',
  },
};

export default function SupportPage() {
  const providerSignupHref = buildAuthRoute.providerRegister('/create-salon');

  return (
    <div className={styles.container}>
      <PageNav />
      
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Customer Support</h1>
        
        <div className={styles.infoBlock} style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            Welcome to Stylr SA Support! We're here to help you get the most out of our platform. Choose from the options below to find the help you need.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Quick Links</h2>
        <div className={styles.infoBlock}>
          <ul className={styles.list}>
            <li><Link href="/faq"><strong>📚 FAQs</strong> - Frequently Asked Questions</Link></li>
            <li><Link href="/how-it-works"><strong>🔍 How It Works</strong> - Learn how to use Stylr SA</Link></li>
            <li><Link href="/contact"><strong>💬 Contact Us</strong> - Get in touch with our team</Link></li>
            <li><Link href="/safety-security"><strong>🔒 Safety & Security</strong> - Platform safety information</Link></li>
          </ul>
        </div>

        <h2 className={styles.sectionTitle}>For Customers</h2>
        
        <h3 className={styles.blockTitle}>Account & Profile</h3>
        <ul className={styles.list}>
          <li><strong>Creating an account:</strong> Click "Register" in the top menu and follow the steps</li>
          <li><strong>Updating your profile:</strong> Go to "My Profile" to edit your information</li>
          <li><strong>Password reset:</strong> Click "Forgot Password" on the login page</li>
          <li><strong>Account security:</strong> Enable two-factor authentication in your settings</li>
        </ul>

        <h3 className={styles.blockTitle}>Bookings</h3>
        <ul className={styles.list}>
          <li><strong>How to book:</strong> Browse salons, select a service, choose date/time, and confirm</li>
          <li><strong>Cancelling a booking:</strong> Go to "My Bookings" and select "Cancel"</li>
          <li><strong>Rescheduling:</strong> Contact the service provider directly through messaging</li>
          <li><strong>Booking confirmation:</strong> You'll receive a confirmation email and notification</li>
        </ul>

        <h3 className={styles.blockTitle}>Payments & Refunds</h3>
        <ul className={styles.list}>
          <li><strong>Payment methods:</strong> We accept credit/debit cards and digital wallets</li>
          <li><strong>Payment security:</strong> All transactions are encrypted and secure</li>
          <li><strong>Refunds:</strong> Refunds depend on the provider's cancellation policy</li>
          <li><strong>Payment issues:</strong> Contact support@stylrsa.co.za for assistance</li>
        </ul>

        <h3 className={styles.blockTitle}>Reviews & Ratings</h3>
        <ul className={styles.list}>
          <li><strong>Leaving a review:</strong> After your appointment, you'll be prompted to leave a review</li>
          <li><strong>Editing reviews:</strong> You can edit your review within 30 days</li>
          <li><strong>Review guidelines:</strong> Be honest, respectful, and constructive</li>
          <li><strong>Reporting reviews:</strong> Use the "Report" button for inappropriate content</li>
        </ul>

        <h2 className={styles.sectionTitle}>For Service Providers</h2>
        
        <h3 className={styles.blockTitle}>Getting Started</h3>
        <ul className={styles.list}>
          <li><strong>Register as a partner:</strong> Visit the <Link href={providerSignupHref}>Create Salon</Link> page</li>
          <li><strong>Profile setup:</strong> Complete all sections for better visibility</li>
          <li><strong>Verification:</strong> Upload required documents for account verification</li>
          <li><strong>Partner guidelines:</strong> Read our <Link href="/partner-guidelines">Partner Guidelines</Link></li>
        </ul>

        <h3 className={styles.blockTitle}>Managing Bookings</h3>
        <ul className={styles.list}>
          <li><strong>Accepting bookings:</strong> Respond to requests within 24 hours</li>
          <li><strong>Calendar management:</strong> Keep your availability updated</li>
          <li><strong>Cancellations:</strong> Notify clients immediately and follow your policy</li>
          <li><strong>No-shows:</strong> Report no-shows through your dashboard</li>
        </ul>

        <h3 className={styles.blockTitle}>Payments & Fees</h3>
        <ul className={styles.list}>
          <li><strong>Commission:</strong> 15% platform fee on completed bookings</li>
          <li><strong>Payouts:</strong> Processed within 5-7 business days</li>
          <li><strong>Banking details:</strong> Update in your account settings</li>
          <li><strong>Payment support:</strong> Email partners@stylrsa.co.za</li>
        </ul>

        <h3 className={styles.blockTitle}>Profile Optimization</h3>
        <ul className={styles.list}>
          <li><strong>Photos:</strong> Upload high-quality images of your work</li>
          <li><strong>Services:</strong> List all services with clear pricing</li>
          <li><strong>Business hours:</strong> Keep your hours accurate</li>
          <li><strong>Promotions:</strong> Create special offers to attract clients</li>
        </ul>

        <h2 className={styles.sectionTitle}>Technical Support</h2>
        
        <h3 className={styles.blockTitle}>Common Issues</h3>
        <ul className={styles.list}>
          <li><strong>Can't log in:</strong> Try password reset or clear your browser cache</li>
          <li><strong>Page not loading:</strong> Check your internet connection and refresh</li>
          <li><strong>Payment failed:</strong> Verify card details and check with your bank</li>
          <li><strong>Upload errors:</strong> Ensure files are under 5MB and in supported formats (JPG, PNG)</li>
        </ul>

        <h3 className={styles.blockTitle}>Browser Compatibility</h3>
        <p className={styles.paragraph}>
          For the best experience, use the latest version of:
        </p>
        <ul className={styles.list}>
          <li>Google Chrome</li>
          <li>Mozilla Firefox</li>
          <li>Safari</li>
          <li>Microsoft Edge</li>
        </ul>

        <h2 className={styles.sectionTitle}>Contact Support</h2>
        
        <div className={styles.infoBlock} style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Get Help</h3>
          <ul className={styles.list}>
            <li><strong>General Support:</strong> support@stylrsa.co.za</li>
            <li><strong>Partner Support:</strong> partners@stylrsa.co.za</li>
            <li><strong>Technical Issues:</strong> tech@stylrsa.co.za</li>
            <li><strong>Safety Concerns:</strong> safety@stylrsa.co.za</li>
            <li><strong>Billing & Payments:</strong> billing@stylrsa.co.za</li>
          </ul>
          <p className={styles.paragraph}>
            <strong>Response Time:</strong> We typically respond within 24 hours on business days.
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <Link href="/contact"><strong>→ Contact Form</strong></Link>
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Report an Issue</h2>
        <p className={styles.paragraph}>
          If you encounter a problem, please provide:
        </p>
        <ul className={styles.list}>
          <li>A clear description of the issue</li>
          <li>Steps to reproduce the problem</li>
          <li>Screenshots (if applicable)</li>
          <li>Your device and browser information</li>
          <li>Date and time the issue occurred</li>
        </ul>

        <h2 className={styles.sectionTitle}>Feedback & Suggestions</h2>
        <p className={styles.paragraph}>
          We love hearing from you! Share your ideas for improving Stylr SA:
        </p>
        <ul className={styles.list}>
          <li><strong>Feature requests:</strong> feedback@stylrsa.co.za</li>
          <li><strong>Bug reports:</strong> bugs@stylrsa.co.za</li>
          <li><strong>General feedback:</strong> hello@stylrsa.co.za</li>
        </ul>

        <div className={styles.infoBlock} style={{ marginTop: '2rem', background: '#fff3e0', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Still Need Help?</h3>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            If you can't find the answer you're looking for, don't hesitate to reach out. Our support team is here to help you Monday-Friday, 9am-5pm SAST.
          </p>
        </div>
      </section>
    </div>
  );
}
