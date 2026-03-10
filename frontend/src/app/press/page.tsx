import { Metadata } from 'next';
import Link from 'next/link';
import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export const metadata: Metadata = {
  title: 'Press & Media - Stylr SA',
  description: 'Media resources, press releases, and contact information for journalists covering Stylr SA.',
  keywords: 'press, media, news, press releases, Stylr SA media',
  openGraph: {
    title: 'Press & Media - Stylr SA',
    description: 'Media resources and press information for Stylr SA.',
    type: 'website',
    url: 'https://stylrsa.co.za/press',
  },
};

export default function PressPage() {
  return (
    <div className={styles.container}>
      <PageNav />
      
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Press & Media</h1>

        <div className={styles.infoBlock} style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            Welcome to the Stylr SA press center. Here you'll find media resources, company information, and contact details for press inquiries.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>About Stylr SA</h2>
        <p className={styles.paragraph}>
          Stylr SA is South Africa's leading digital marketplace for beauty and wellness services. We connect talented professionals with clients across the country, making it easy to discover, book, and pay for services all in one place.
        </p>
        <p className={styles.paragraph}>
          Founded in 2024, Stylr SA is revolutionizing the beauty industry by empowering local entrepreneurs and providing customers with trusted, verified service providers.
        </p>

        <h2 className={styles.sectionTitle}>Company Information</h2>
        <ul className={styles.list}>
          <li><strong>Company Name:</strong> Stylr SA</li>
          <li><strong>Website:</strong> <a href="https://stylrsa.co.za">stylrsa.co.za</a></li>
          <li><strong>Industry:</strong> Beauty & Wellness Technology</li>
          <li><strong>Founded:</strong> 2024</li>
          <li><strong>Headquarters:</strong> South Africa</li>
        </ul>

        <h2 className={styles.sectionTitle}>Media Kit</h2>
        <p className={styles.paragraph}>
          Download our media kit for logos, brand guidelines, and company information:
        </p>
        <div className={styles.infoBlock}>
          <ul className={styles.list}>
            <li><strong>Brand Logos:</strong> High-resolution PNG and SVG formats</li>
            <li><strong>Product Screenshots:</strong> Platform interface and features</li>
            <li><strong>Founder Photos:</strong> Professional headshots</li>
            <li><strong>Brand Guidelines:</strong> Logo usage and brand standards</li>
          </ul>
          <p className={styles.paragraph}>
            <em>Media kit available upon request. Contact press@stylrsa.co.za</em>
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Recent News & Announcements</h2>
        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>Platform Launch - 2024</h3>
          <p className={styles.paragraph}>
            Stylr SA officially launches, bringing together South Africa's beauty and wellness community on a single platform.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Key Statistics</h2>
        <ul className={styles.list}>
          <li><strong>Service Providers:</strong> Growing network of verified professionals</li>
          <li><strong>Services Listed:</strong> Thousands of beauty and wellness services</li>
          <li><strong>Coverage:</strong> Major cities and towns across South Africa</li>
          <li><strong>Categories:</strong> Hair, Beauty, Spa, Wellness, and more</li>
        </ul>

        <h2 className={styles.sectionTitle}>For Media Inquiries</h2>
        <div className={styles.infoBlock} style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px' }}>
          <p className={styles.paragraph}>
            For press releases, interviews, or media partnerships:
          </p>
          <ul className={styles.list}>
            <li><strong>Email:</strong> press@stylrsa.co.za</li>
            <li><strong>General Inquiries:</strong> hello@stylrsa.co.za</li>
            <li><strong>Website:</strong> <Link href="/contact">Contact Page</Link></li>
          </ul>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            We typically respond to media inquiries within 24-48 hours.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Follow Us</h2>
        <p className={styles.paragraph}>
          Stay updated with the latest news from Stylr SA:
        </p>
        <ul className={styles.list}>
          <li>Facebook: @StylrSA</li>
          <li>Instagram: @stylrsa</li>
          <li>Twitter/X: @StylrSA</li>
          <li>LinkedIn: Stylr SA</li>
        </ul>
      </section>
    </div>
  );
}
