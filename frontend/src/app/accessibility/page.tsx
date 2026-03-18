import { Metadata } from 'next';
import Link from 'next/link';
import styles from '../info-page.module.css';

export const metadata: Metadata = {
  title: 'Accessibility Statement - Stylr SA',
  description: 'Stylr SA is committed to ensuring digital accessibility for people of all abilities. Learn about our accessibility features and ongoing improvements.',
  keywords: 'accessibility, WCAG, inclusive design, web accessibility, Stylr SA',
  openGraph: {
    title: 'Accessibility Statement - Stylr SA',
    description: 'Our commitment to digital accessibility and inclusivity.',
    type: 'website',
    url: 'https://stylrsa.co.za/accessibility',
  },
};

export default function AccessibilityPage() {
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Accessibility Statement</h1>
        <p className={styles.paragraph}>
          <strong>Last Updated:</strong> November 4, 2025
        </p>

        <h2 className={styles.sectionTitle}>Our Commitment to Accessibility</h2>
        <p className={styles.paragraph}>
          Stylr SA is committed to ensuring digital accessibility for people of all abilities. We are continuously working to improve the user experience for everyone and applying the relevant accessibility standards to ensure our platform is accessible to all.
        </p>
        <p className={styles.paragraph}>
          We believe that beauty and wellness services should be accessible to everyone, and that starts with an accessible platform.
        </p>

        <h2 className={styles.sectionTitle}>Conformance Status</h2>
        <p className={styles.paragraph}>
          We aim to conform with the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities and improve usability for all users.
        </p>
        <p className={styles.paragraph}>
          <strong>Current status:</strong> Partially conformant. We are working continuously to achieve full conformance.
        </p>

        <h2 className={styles.sectionTitle}>Accessibility Features</h2>
        <p className={styles.paragraph}>
          Our platform includes the following accessibility features:
        </p>
        
        <h3 className={styles.blockTitle}>Navigation & Structure</h3>
        <ul className={styles.list}>
          <li><strong>Keyboard navigation:</strong> All interactive elements can be accessed using keyboard only</li>
          <li><strong>Skip links:</strong> Quick navigation to main content</li>
          <li><strong>Semantic HTML:</strong> Proper heading structure for screen readers</li>
          <li><strong>Breadcrumb navigation:</strong> Clear paths through the site</li>
          <li><strong>Consistent layout:</strong> Predictable navigation across all pages</li>
        </ul>

        <h3 className={styles.blockTitle}>Visual Design</h3>
        <ul className={styles.list}>
          <li><strong>Color contrast:</strong> Text meets WCAG AA contrast requirements</li>
          <li><strong>Resizable text:</strong> Text can be resized up to 200% without loss of functionality</li>
          <li><strong>Clear typography:</strong> Legible fonts and appropriate sizing</li>
          <li><strong>Visual indicators:</strong> Links and buttons are clearly identifiable</li>
          <li><strong>Focus indicators:</strong> Visible focus states for keyboard navigation</li>
        </ul>

        <h3 className={styles.blockTitle}>Content & Media</h3>
        <ul className={styles.list}>
          <li><strong>Alternative text:</strong> Descriptive alt text for images</li>
          <li><strong>Captions:</strong> Video content includes captions (where available)</li>
          <li><strong>Transcripts:</strong> Audio content includes text transcripts (where available)</li>
          <li><strong>Clear language:</strong> Content written in plain, understandable language</li>
          <li><strong>Link context:</strong> Link text describes the destination</li>
        </ul>

        <h3 className={styles.blockTitle}>Forms & Interactions</h3>
        <ul className={styles.list}>
          <li><strong>Form labels:</strong> All form fields have clear, associated labels</li>
          <li><strong>Error messages:</strong> Clear, descriptive error messages with suggestions</li>
          <li><strong>Required fields:</strong> Clearly marked with both visual and text indicators</li>
          <li><strong>Autocomplete:</strong> Support for autocomplete on common fields</li>
          <li><strong>Time limits:</strong> Adjustable or no time limits on interactions</li>
        </ul>

        <h3 className={styles.blockTitle}>Assistive Technology Support</h3>
        <ul className={styles.list}>
          <li><strong>Screen readers:</strong> Compatible with JAWS, NVDA, VoiceOver, and TalkBack</li>
          <li><strong>Screen magnifiers:</strong> Works with ZoomText and other magnification tools</li>
          <li><strong>Voice control:</strong> Compatible with Dragon NaturallySpeaking and voice control</li>
          <li><strong>ARIA labels:</strong> Proper ARIA attributes for dynamic content</li>
        </ul>

        <h2 className={styles.sectionTitle}>Ongoing Improvements</h2>
        <p className={styles.paragraph}>
          We are committed to continuous improvement of our platform's accessibility. Current initiatives include:
        </p>
        <ul className={styles.list}>
          <li>Regular accessibility audits and testing with assistive technologies</li>
          <li>Training our development team on accessibility best practices</li>
          <li>Gathering feedback from users with disabilities</li>
          <li>Implementing automated accessibility testing in our development workflow</li>
          <li>Prioritizing accessibility in new feature development</li>
        </ul>

        <h2 className={styles.sectionTitle}>Known Limitations</h2>
        <p className={styles.paragraph}>
          Despite our best efforts, there may be some limitations. Known issues include:
        </p>
        <ul className={styles.list}>
          <li>Some third-party embedded content may not be fully accessible</li>
          <li>Some older uploaded images may lack descriptive alt text</li>
          <li>Some video content uploaded by users may lack captions</li>
          <li>Complex interactive features (e.g., calendars) may have limited screen reader support</li>
        </ul>
        <p className={styles.paragraph}>
          We are actively working to address these limitations.
        </p>

        <h2 className={styles.sectionTitle}>Technical Specifications</h2>
        <p className={styles.paragraph}>
          Our platform's accessibility relies on the following technologies:
        </p>
        <ul className={styles.list}>
          <li>HTML5</li>
          <li>CSS3</li>
          <li>JavaScript (React/Next.js)</li>
          <li>ARIA (Accessible Rich Internet Applications)</li>
        </ul>
        <p className={styles.paragraph}>
          These technologies are relied upon for conformance with the accessibility standards used.
        </p>

        <h2 className={styles.sectionTitle}>Compatibility with Browsers and Assistive Technology</h2>
        <p className={styles.paragraph}>
          Stylr SA is designed to be compatible with:
        </p>
        
        <h3 className={styles.blockTitle}>Browsers</h3>
        <ul className={styles.list}>
          <li>Chrome (latest version)</li>
          <li>Firefox (latest version)</li>
          <li>Safari (latest version)</li>
          <li>Edge (latest version)</li>
          <li>Mobile browsers (iOS Safari, Chrome Mobile)</li>
        </ul>

        <h3 className={styles.blockTitle}>Screen Readers</h3>
        <ul className={styles.list}>
          <li>JAWS (latest version)</li>
          <li>NVDA (latest version)</li>
          <li>VoiceOver (macOS and iOS)</li>
          <li>TalkBack (Android)</li>
        </ul>

        <h2 className={styles.sectionTitle}>Accessibility of Service Providers</h2>
        <p className={styles.paragraph}>
          We encourage our partner salons and service providers to:
        </p>
        <ul className={styles.list}>
          <li>Provide accessible physical locations where possible</li>
          <li>Indicate accessibility features in their profiles (wheelchair access, accessible restrooms, etc.)</li>
          <li>Be accommodating to clients with disabilities</li>
          <li>Provide clear information about accessibility features</li>
        </ul>
        <p className={styles.paragraph}>
          When searching for services, you can filter by accessibility features. If a provider's accessibility information is unclear, please contact them directly to inquire.
        </p>

        <h2 className={styles.sectionTitle}>Feedback and Contact Information</h2>
        <p className={styles.paragraph}>
          We welcome your feedback on the accessibility of Stylr SA. If you encounter accessibility barriers, please let us know:
        </p>
        
        <div className={styles.infoBlock} style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Report Accessibility Issues</h3>
          <ul className={styles.list}>
            <li><strong>Email:</strong> accessibility@stylrsa.co.za</li>
            <li><strong>Contact Form:</strong> <Link href="/contact">Contact Page</Link></li>
            <li><strong>Phone:</strong> Available through the contact page</li>
          </ul>
          <p className={styles.paragraph}>
            <strong>When reporting, please include:</strong>
          </p>
          <ul className={styles.list}>
            <li>The page or feature where you encountered the issue</li>
            <li>A description of the problem</li>
            <li>The assistive technology you're using (if applicable)</li>
            <li>Your operating system and browser</li>
          </ul>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            We aim to respond to accessibility feedback within 3 business days.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Assessment Approach</h2>
        <p className={styles.paragraph}>
          Stylr SA assessed the accessibility of our platform through the following methods:
        </p>
        <ul className={styles.list}>
          <li><strong>Self-evaluation:</strong> Internal testing by our development team</li>
          <li><strong>Automated testing:</strong> Using tools like Axe, Lighthouse, and WAVE</li>
          <li><strong>Manual testing:</strong> Keyboard-only navigation and screen reader testing</li>
          <li><strong>User testing:</strong> Feedback from users with disabilities</li>
        </ul>

        <h2 className={styles.sectionTitle}>Formal Complaints</h2>
        <p className={styles.paragraph}>
          If you are not satisfied with our response to your accessibility concern, you may escalate your complaint:
        </p>
        <ol className={styles.list}>
          <li>Contact our Customer Support team at <Link href="/support">Support Center</Link></li>
          <li>If unresolved, contact our Accessibility Coordinator at accessibility@stylrsa.co.za</li>
          <li>For unresolved issues, you may contact the South African Human Rights Commission</li>
        </ol>

        <h2 className={styles.sectionTitle}>Additional Resources</h2>
        <p className={styles.paragraph}>
          For more information about web accessibility, visit:
        </p>
        <ul className={styles.list}>
          <li><a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer">W3C Web Accessibility Initiative (WAI)</a></li>
          <li><a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">WCAG 2.1 Quick Reference</a></li>
          <li><a href="https://www.a11yproject.com/" target="_blank" rel="noopener noreferrer">The A11Y Project</a></li>
        </ul>

        <div className={styles.infoBlock} style={{ marginTop: '2rem', background: '#f3e5f5', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Our Ongoing Commitment</h3>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            Accessibility is an ongoing effort. We are committed to ensuring that Stylr SA is accessible to everyone, regardless of ability. Thank you for helping us improve our platform by reporting issues and providing feedback.
          </p>
        </div>
      </section>
    </div>
  );
}
