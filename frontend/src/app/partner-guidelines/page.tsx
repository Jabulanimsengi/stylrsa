import { Metadata } from 'next';
import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export const metadata: Metadata = {
  title: 'Partner Guidelines - Stylr SA',
  description: 'Guidelines for salons, spas, and beauty professionals partnering with Stylr SA. Learn how to create a successful profile and grow your business.',
  keywords: 'partner guidelines, salon partners, service providers, Stylr SA business, beauty professionals',
  openGraph: {
    title: 'Partner Guidelines - Stylr SA',
    description: 'Guidelines and best practices for beauty and wellness professionals on Stylr SA.',
    type: 'website',
    url: 'https://stylrsa.co.za/partner-guidelines',
  },
};

export default function PartnerGuidelinesPage() {
  return (
    <div className={styles.container}>
      <PageNav />

      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Partner Guidelines</h1>
        <p className={styles.paragraph}>
          <strong>Last Updated:</strong> November 4, 2025
        </p>

        <div className={styles.infoBlock} style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            Welcome to the Stylr SA Partner Program! These guidelines will help you create an outstanding profile, attract more clients, and grow your business on our platform.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>1. Who Can Partner with Stylr SA?</h2>
        <p className={styles.paragraph}>
          We welcome a wide range of beauty and wellness professionals, including:
        </p>
        <ul className={styles.list}>
          <li><strong>Hair Salons:</strong> Full-service salons, barber shops, hair braiding specialists</li>
          <li><strong>Beauty Specialists:</strong> Nail technicians, makeup artists, lash & brow experts</li>
          <li><strong>Spa & Wellness:</strong> Massage therapists, spas, wellness centers</li>
          <li><strong>Independent Professionals:</strong> Freelance stylists, mobile beauty services</li>
          <li><strong>Specialized Services:</strong> Bridal stylists, hair restoration, trichology</li>
        </ul>
        <p className={styles.paragraph}>
          All partners must comply with South African regulations and hold appropriate licenses and certifications for their services.
        </p>

        <h2 className={styles.sectionTitle}>2. Getting Started</h2>

        <h3 className={styles.blockTitle}>2.1 Registration Requirements</h3>
        <p className={styles.paragraph}>
          To register as a partner, you'll need:
        </p>
        <ul className={styles.list}>
          <li>Valid business registration or proof of self-employment</li>
          <li>Professional licenses and certifications (where applicable)</li>
          <li>Proof of insurance (recommended)</li>
          <li>Banking details for payments</li>
          <li>Contact information (phone, email, physical address if applicable)</li>
          <li>High-quality photos of your work and space</li>
        </ul>

        <h3 className={styles.blockTitle}>2.2 Profile Creation</h3>
        <p className={styles.paragraph}>
          Your profile is your digital storefront. Make it shine by including:
        </p>
        <ul className={styles.list}>
          <li><strong>Professional photos:</strong> Clear, well-lit images of your salon/studio and services</li>
          <li><strong>Compelling bio:</strong> Tell your story, highlight your expertise and specialties</li>
          <li><strong>Service menu:</strong> List all services with accurate descriptions and pricing</li>
          <li><strong>Availability:</strong> Keep your calendar up-to-date</li>
          <li><strong>Contact details:</strong> Make it easy for clients to reach you</li>
        </ul>

        <h2 className={styles.sectionTitle}>3. Quality Standards</h2>

        <h3 className={styles.blockTitle}>3.1 Service Excellence</h3>
        <p className={styles.paragraph}>
          We expect all partners to:
        </p>
        <ul className={styles.list}>
          <li>Provide professional, high-quality services</li>
          <li>Maintain clean, hygienic workspaces</li>
          <li>Use safe, quality products</li>
          <li>Treat clients with respect and professionalism</li>
          <li>Honor bookings and arrive on time</li>
          <li>Follow industry best practices and safety protocols</li>
        </ul>

        <h3 className={styles.blockTitle}>3.2 Communication Standards</h3>
        <ul className={styles.list}>
          <li>Respond to booking requests within 24 hours</li>
          <li>Answer client messages promptly</li>
          <li>Provide clear instructions for appointments (address, parking, what to bring)</li>
          <li>Notify clients immediately of any schedule changes</li>
          <li>Be professional and courteous in all communications</li>
        </ul>

        <h3 className={styles.blockTitle}>3.3 Health & Safety</h3>
        <ul className={styles.list}>
          <li>Follow all COVID-19 and health department guidelines</li>
          <li>Sanitize tools and workspaces between clients</li>
          <li>Use disposable items where appropriate</li>
          <li>Maintain proper ventilation</li>
          <li>Conduct patch tests when required</li>
          <li>Refuse service if a client has contraindications</li>
        </ul>

        <h2 className={styles.sectionTitle}>4. Portfolio & Gallery Best Practices</h2>
        <p className={styles.paragraph}>
          Your portfolio is one of your most powerful marketing tools. Here's how to make it stand out:
        </p>

        <h3 className={styles.blockTitle}>4.1 Photo Guidelines</h3>
        <ul className={styles.list}>
          <li><strong>High quality:</strong> Use good lighting, clear focus, high resolution</li>
          <li><strong>Before & After:</strong> Show transformations where appropriate</li>
          <li><strong>Variety:</strong> Display a range of your work (styles, techniques, clients)</li>
          <li><strong>Current:</strong> Update regularly with recent work</li>
          <li><strong>Authentic:</strong> Only post work you've personally completed</li>
          <li><strong>Consent:</strong> Always get client permission before posting their photos</li>
        </ul>

        <h3 className={styles.blockTitle}>4.2 Video Content</h3>
        <ul className={styles.list}>
          <li>Short clips (15-60 seconds) of your work in progress</li>
          <li>Client testimonials and reactions</li>
          <li>Behind-the-scenes of your salon/studio</li>
          <li>Tutorial snippets showcasing your expertise</li>
        </ul>

        <h2 className={styles.sectionTitle}>5. Pricing & Payments</h2>

        <h3 className={styles.blockTitle}>5.1 Setting Your Prices</h3>
        <ul className={styles.list}>
          <li>Price competitively based on your market, experience, and location</li>
          <li>Be transparent about pricing (include all costs, no hidden fees)</li>
          <li>Offer package deals or promotions to attract new clients</li>
          <li>Update prices regularly to reflect market changes</li>
        </ul>

        <h3 className={styles.blockTitle}>5.2 Platform Fees</h3>
        <p className={styles.paragraph}>
          Stylr SA operates on a commission-based model. Your listing is 100% FREE — we only charge when you get paid. Fee details:
        </p>
        <ul className={styles.list}>
          <li><strong>Listing fee:</strong> FREE (no monthly subscriptions)</li>
          <li><strong>Commission:</strong> 32% of completed booking value, broken down as:
            <ul className={styles.list}>
              <li>25% — Platform fee (marketing, technology, support)</li>
              <li>5% — Client cashback (keeps customers coming back to you)</li>
              <li>2% — Payment processing (secure transactions)</li>
            </ul>
          </li>
          <li>Payouts are processed every Friday directly to your bank account</li>
          <li>All fees are clearly disclosed before you accept a booking</li>
        </ul>


        <h3 className={styles.blockTitle}>5.3 Cancellation & Refund Policy</h3>
        <ul className={styles.list}>
          <li>Set clear cancellation policies for your services</li>
          <li>We recommend at least 24 hours notice for cancellations</li>
          <li>Be reasonable and flexible with genuine emergencies</li>
          <li>Process refunds promptly when appropriate</li>
        </ul>

        <h2 className={styles.sectionTitle}>6. Reviews & Ratings</h2>
        <p className={styles.paragraph}>
          Reviews are crucial for building trust and attracting clients. Here's how to maintain a strong rating:
        </p>
        <ul className={styles.list}>
          <li><strong>Encourage reviews:</strong> Ask satisfied clients to leave feedback</li>
          <li><strong>Respond professionally:</strong> Thank positive reviewers and address concerns constructively</li>
          <li><strong>Learn from feedback:</strong> Use reviews to identify areas for improvement</li>
          <li><strong>Never retaliate:</strong> Don't punish clients for honest negative reviews</li>
          <li><strong>Don't manipulate:</strong> Never post fake reviews or offer incentives for positive ones</li>
        </ul>

        <h2 className={styles.sectionTitle}>7. Marketing & Promotions</h2>

        <h3 className={styles.blockTitle}>7.1 Running Promotions</h3>
        <p className={styles.paragraph}>
          Use our promotion tools to attract new clients:
        </p>
        <ul className={styles.list}>
          <li><strong>First-time client discounts:</strong> Offer special rates to new customers</li>
          <li><strong>Seasonal specials:</strong> Capitalize on holidays and events</li>
          <li><strong>Loyalty rewards:</strong> Encourage repeat bookings</li>
          <li><strong>Package deals:</strong> Bundle services for better value</li>
        </ul>

        <h3 className={styles.blockTitle}>7.2 Featured Listings</h3>
        <ul className={styles.list}>
          <li>Boost your visibility with featured placement</li>
          <li>Appear at the top of search results</li>
          <li>Get highlighted in promotional emails and notifications</li>
        </ul>

        <h2 className={styles.sectionTitle}>8. Prohibited Conduct</h2>
        <p className={styles.paragraph}>
          The following behaviors will result in account suspension or termination:
        </p>
        <ul className={styles.list}>
          <li>Discrimination based on race, gender, religion, sexual orientation, disability, etc.</li>
          <li>Harassment, threats, or abusive behavior toward clients or staff</li>
          <li>Providing services under the influence of drugs or alcohol</li>
          <li>Posting fake reviews or manipulating ratings</li>
          <li>Stealing or misappropriating client information</li>
          <li>Operating without proper licenses or insurance</li>
          <li>Engaging in illegal activities</li>
          <li>Attempting to circumvent platform payments</li>
        </ul>

        <h2 className={styles.sectionTitle}>9. Support & Resources</h2>
        <p className={styles.paragraph}>
          We're here to help you succeed! Take advantage of:
        </p>
        <ul className={styles.list}>
          <li><strong>Partner Dashboard:</strong> Track your bookings, earnings, and analytics</li>
          <li><strong>Educational Resources:</strong> Tips, tutorials, and best practices</li>
          <li><strong>Partner Support:</strong> Dedicated support team available via email and chat</li>
          <li><strong>Community Forum:</strong> Connect with other professionals, share advice</li>
        </ul>

        <h2 className={styles.sectionTitle}>10. Success Tips</h2>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>🌟 Top Tips from Successful Partners</h3>
          <ul className={styles.list}>
            <li><strong>Complete your profile 100%:</strong> Profiles with all fields filled get 3x more bookings</li>
            <li><strong>Respond quickly:</strong> Fast responders get more bookings</li>
            <li><strong>Update your gallery weekly:</strong> Fresh content attracts more attention</li>
            <li><strong>Offer first-timer discounts:</strong> Convert browsers into loyal clients</li>
            <li><strong>Be flexible:</strong> Accommodate different schedules when possible</li>
            <li><strong>Ask for reviews:</strong> Satisfied clients are happy to leave feedback</li>
            <li><strong>Stay active:</strong> Log in regularly and engage with your profile</li>
          </ul>
        </div>

        <h2 className={styles.sectionTitle}>11. Contact Us</h2>
        <p className={styles.paragraph}>
          Have questions about the Partner Program? We're here to help:
        </p>
        <ul className={styles.list}>
          <li><strong>Email:</strong> partners@stylrsa.co.za</li>
          <li><strong>Website:</strong> <a href="/contact">Contact Page</a></li>
          <li><strong>Phone:</strong> Available in your Partner Dashboard</li>
        </ul>

        <div className={styles.infoBlock} style={{ marginTop: '2rem', background: '#f3e5f5', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Ready to Join?</h3>
          <p className={styles.paragraph} style={{ marginBottom: '0.5rem' }}>
            Start growing your beauty business with Stylr SA today! Create your free partner profile and connect with thousands of clients across South Africa.
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <a href="/create-salon"><strong>→ Register as a Partner</strong></a>
          </p>
        </div>
      </section>
    </div>
  );
}
