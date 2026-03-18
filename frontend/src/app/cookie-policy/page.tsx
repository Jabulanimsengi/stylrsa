import { Metadata } from 'next';
import Link from 'next/link';
import styles from '../info-page.module.css';

export const metadata: Metadata = {
  title: 'Cookie Policy - Stylr SA',
  description: 'Learn about how Stylr SA uses cookies and similar tracking technologies to enhance your browsing experience.',
  keywords: 'cookie policy, cookies, tracking, web analytics, Stylr SA',
  openGraph: {
    title: 'Cookie Policy - Stylr SA',
    description: 'Understand how Stylr SA uses cookies and your choices regarding cookie preferences.',
    type: 'website',
    url: 'https://stylrsa.co.za/cookie-policy',
  },
};

export default function CookiePolicyPage() {
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Cookie Policy</h1>
        <p className={styles.paragraph}>
          <strong>Last Updated:</strong> November 4, 2025
        </p>

        <h2 className={styles.sectionTitle}>1. Introduction</h2>
        <p className={styles.paragraph}>
          This Cookie Policy explains how Stylr SA ("we", "us", or "our") uses cookies and similar tracking technologies on our website at stylrsa.co.za ("Platform"). This policy should be read together with our <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p className={styles.paragraph}>
          By using our Platform, you consent to the use of cookies as described in this policy. You can manage your cookie preferences at any time.
        </p>

        <h2 className={styles.sectionTitle}>2. What Are Cookies?</h2>
        <p className={styles.paragraph}>
          Cookies are small text files that are placed on your device (computer, smartphone, tablet) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and provide information to website owners.
        </p>
        <p className={styles.paragraph}>
          Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies" (remain on your device for a set period or until you delete them).
        </p>

        <h2 className={styles.sectionTitle}>3. Why We Use Cookies</h2>
        <p className={styles.paragraph}>
          We use cookies for several purposes:
        </p>
        <ul className={styles.list}>
          <li><strong>Essential functionality:</strong> To enable core features like user authentication and security</li>
          <li><strong>Performance and analytics:</strong> To understand how visitors use our Platform and improve its performance</li>
          <li><strong>Personalization:</strong> To remember your preferences and provide a customized experience</li>
          <li><strong>Marketing and advertising:</strong> To deliver relevant advertisements and measure campaign effectiveness</li>
          <li><strong>Social media integration:</strong> To enable social sharing and interactions</li>
        </ul>

        <h2 className={styles.sectionTitle}>4. Types of Cookies We Use</h2>

        <h3 className={styles.blockTitle}>4.1 Strictly Necessary Cookies</h3>
        <p className={styles.paragraph}>
          These cookies are essential for the Platform to function properly. Without these cookies, certain services cannot be provided.
        </p>
        <ul className={styles.list}>
          <li><strong>Authentication cookies:</strong> Keep you logged in as you navigate the Platform</li>
          <li><strong>Security cookies:</strong> Detect and prevent security threats, fraud, and abuse</li>
          <li><strong>Session management:</strong> Maintain your session state and shopping cart</li>
        </ul>
        <p className={styles.paragraph}>
          <em>You cannot opt out of these cookies as they are necessary for the Platform to work.</em>
        </p>

        <h3 className={styles.blockTitle}>4.2 Performance and Analytics Cookies</h3>
        <p className={styles.paragraph}>
          These cookies collect information about how you use our Platform, helping us improve its performance and user experience.
        </p>
        <ul className={styles.list}>
          <li><strong>Google Analytics:</strong> Tracks page views, user behavior, and traffic sources</li>
          <li><strong>Performance monitoring:</strong> Identifies technical errors and load times</li>
          <li><strong>A/B testing:</strong> Helps us test new features and improvements</li>
        </ul>
        <p className={styles.paragraph}>
          <strong>Data collected:</strong> Pages visited, time spent on pages, clicks, device type, browser, location (approximate).
        </p>

        <h3 className={styles.blockTitle}>4.3 Functional Cookies</h3>
        <p className={styles.paragraph}>
          These cookies enable enhanced functionality and personalization.
        </p>
        <ul className={styles.list}>
          <li><strong>Preference cookies:</strong> Remember your language, region, and display settings</li>
          <li><strong>User interface:</strong> Remember your chosen layout, font size, and accessibility settings</li>
          <li><strong>Chat widgets:</strong> Enable customer support chat functionality</li>
        </ul>

        <h3 className={styles.blockTitle}>4.4 Marketing and Advertising Cookies</h3>
        <p className={styles.paragraph}>
          These cookies are used to deliver relevant advertisements and measure the effectiveness of marketing campaigns.
        </p>
        <ul className={styles.list}>
          <li><strong>Retargeting cookies:</strong> Show you relevant ads on other websites after visiting Stylr SA</li>
          <li><strong>Conversion tracking:</strong> Measure the success of ad campaigns</li>
          <li><strong>Social media advertising:</strong> Deliver ads on platforms like Facebook and Instagram</li>
        </ul>
        <p className={styles.paragraph}>
          <strong>Third-party providers may include:</strong> Google Ads, Facebook Pixel, Instagram Ads, LinkedIn Ads.
        </p>

        <h3 className={styles.blockTitle}>4.5 Social Media Cookies</h3>
        <p className={styles.paragraph}>
          These cookies enable social media features and track your interactions with social content.
        </p>
        <ul className={styles.list}>
          <li><strong>Social sharing:</strong> Allow you to share content on Facebook, Twitter, Instagram, etc.</li>
          <li><strong>Social login:</strong> Enable you to sign in using your social media accounts</li>
          <li><strong>Embedded content:</strong> Display social media posts, videos, and widgets</li>
        </ul>

        <h2 className={styles.sectionTitle}>5. Third-Party Cookies</h2>
        <p className={styles.paragraph}>
          In addition to our own cookies, we may use third-party services that set cookies on your device. These include:
        </p>
        <ul className={styles.list}>
          <li><strong>Google Analytics:</strong> Web analytics and reporting</li>
          <li><strong>Google Ads:</strong> Advertising and remarketing</li>
          <li><strong>Facebook/Meta:</strong> Social media integration and advertising</li>
          <li><strong>Payment processors:</strong> Secure payment processing (e.g., Stripe, PayFast)</li>
          <li><strong>Customer support tools:</strong> Live chat and support widgets</li>
        </ul>
        <p className={styles.paragraph}>
          These third parties have their own privacy policies and cookie policies. We do not control their cookies and recommend reviewing their policies.
        </p>

        <h2 className={styles.sectionTitle}>6. How to Manage Cookies</h2>
        
        <h3 className={styles.blockTitle}>6.1 Browser Settings</h3>
        <p className={styles.paragraph}>
          Most browsers allow you to manage cookies through their settings. You can:
        </p>
        <ul className={styles.list}>
          <li>View cookies stored on your device</li>
          <li>Delete all or specific cookies</li>
          <li>Block cookies from specific websites</li>
          <li>Block all third-party cookies</li>
          <li>Clear cookies when you close your browser</li>
        </ul>
        <p className={styles.paragraph}>
          For instructions on managing cookies, visit your browser's help section:
        </p>
        <ul className={styles.list}>
          <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
          <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
          <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
          <li><strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
        </ul>

        <h3 className={styles.blockTitle}>6.2 Opt-Out Tools</h3>
        <p className={styles.paragraph}>
          You can opt out of specific types of cookies using these tools:
        </p>
        <ul className={styles.list}>
          <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-Out Browser Add-on</a></li>
          <li><strong>Advertising opt-out:</strong> <a href="http://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer">Your Online Choices</a></li>
          <li><strong>Network Advertising Initiative:</strong> <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer">NAI Opt-Out</a></li>
        </ul>

        <h3 className={styles.blockTitle}>6.3 Mobile Devices</h3>
        <p className={styles.paragraph}>
          For mobile devices, you can manage tracking through device settings:
        </p>
        <ul className={styles.list}>
          <li><strong>iOS:</strong> Settings → Privacy → Tracking → Disable "Allow Apps to Request to Track"</li>
          <li><strong>Android:</strong> Settings → Google → Ads → Opt out of Ads Personalization</li>
        </ul>

        <h2 className={styles.sectionTitle}>7. Impact of Disabling Cookies</h2>
        <p className={styles.paragraph}>
          If you disable cookies, some features of our Platform may not work properly:
        </p>
        <ul className={styles.list}>
          <li>You may not be able to stay logged in</li>
          <li>Your preferences and settings may not be saved</li>
          <li>Some pages may not load correctly</li>
          <li>You may see less relevant content and advertisements</li>
          <li>Interactive features like chat may not function</li>
        </ul>
        <p className={styles.paragraph}>
          Essential cookies are necessary for core functionality and cannot be disabled without affecting the Platform's operation.
        </p>

        <h2 className={styles.sectionTitle}>8. Do Not Track (DNT)</h2>
        <p className={styles.paragraph}>
          Some browsers have a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activity tracked. At this time, our Platform does not respond to DNT signals, as there is no industry standard for how to interpret them. However, you can still control cookies through your browser settings and opt-out tools.
        </p>

        <h2 className={styles.sectionTitle}>9. Updates to This Cookie Policy</h2>
        <p className={styles.paragraph}>
          We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our practices. When we make significant changes, we will notify you by updating the "Last Updated" date at the top of this policy and, where appropriate, through a notice on our Platform.
        </p>

        <h2 className={styles.sectionTitle}>10. Contact Us</h2>
        <p className={styles.paragraph}>
          If you have questions about this Cookie Policy or how we use cookies, please contact us:
        </p>
        <ul className={styles.list}>
          <li><strong>Email:</strong> privacy@stylrsa.co.za</li>
          <li><strong>Website:</strong> <Link href="/contact">Contact Page</Link></li>
          <li><strong>Address:</strong> Stylr SA, South Africa</li>
        </ul>

        <div className={styles.infoBlock} style={{ marginTop: '2rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Cookie Consent</h3>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            By continuing to use our Platform, you consent to our use of cookies as described in this Cookie Policy. You can change your cookie preferences at any time through your browser settings.
          </p>
        </div>
      </section>
    </div>
  );
}
