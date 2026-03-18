import { Metadata } from 'next';
import styles from '../info-page.module.css';

export const metadata: Metadata = {
  title: 'About Stylr SA - Our Mission, Story, and Vision',
  description: 'Learn about Stylr SA\'s mission to revolutionize South Africa\'s beauty industry. Discover our story, vision, and how we connect beauty professionals with clients.',
  keywords: 'about Stylr SA, beauty platform South Africa, salon booking, beauty careers, professional stylists',
  openGraph: {
    title: 'About Stylr SA - Our Mission and Vision',
    description: 'Discover how Stylr SA is revolutionizing the beauty and wellness industry in South Africa by connecting talented professionals with clients.',
    type: 'website',
    url: 'https://stylrsa.co.za/about',
  },
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>About Us</h1>
        
        <h2 className={styles.sectionTitle}>Our Mission</h2>
        <p className={styles.paragraph}>
          Stylr SA exists to make finding and booking beauty and wellness services in South Africa as simple as it should be. Our mission is to connect great beauty professionals with clients who are looking for exactly what they offer — and to give both sides a better experience than they've had before.
        </p>

        <h2 className={styles.sectionTitle}>Our Story</h2>
        <p className={styles.paragraph}>
          Stylr SA was built by people who've sat in the chair and been let down by the options available to find a reliable, skilled professional nearby.
        </p>
        <p className={styles.paragraph}>
          Finding a trusted braider, a last-minute nail tech before an event, or a barber who actually knows your hair type — it was fragmented, unreliable, and frustrating. You'd rely on WhatsApp groups, word-of-mouth referrals, and guesswork.
        </p>
        <p className={styles.paragraph}>
          We built Stylr SA to fix that. One platform where salons and independent beauty professionals can publish their work, list their services with real pricing, and receive bookings directly — and where clients can discover, compare, and connect with confidence.
        </p>

        <h2 className={styles.sectionTitle}>What We Do</h2>
        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>For clients</h3>
          <p className={styles.blockContent}>
            Search South Africa&apos;s most complete directory of hair salons, nail techs, barbers, braiders, spas, and skin-care specialists. Explore verified profiles, browse real-work galleries, and connect directly to the professionals who&apos;ll do your treatment — without middlemen, extra apps, or hidden fees.
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>For salons and beauty professionals</h3>
          <p className={styles.blockContent}>
            Stylr SA gives you a professional online profile built specifically for the South African beauty industry. Publish your services, showcase your gallery, run promotions, and let clients book directly through WhatsApp — all from one easy-to-manage dashboard. One flat monthly fee, zero commission, and zero complexity.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Our Vision</h2>
        <p className={styles.paragraph}>
          We're building the most trusted beauty and wellness platform in South Africa — one that helps independent professionals compete, helps clients make better decisions, and raises the standard for the entire industry. Every local salon deserves to be discoverable. Every client deserves to find the right one.
        </p>
      </section>
    </div>
  );
}


