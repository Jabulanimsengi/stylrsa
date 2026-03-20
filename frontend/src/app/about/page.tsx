import { Metadata } from 'next';
import styles from './about.module.css';

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
    <div className={styles.pageShell}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>elevating South African beauty.</h1>
        <p className={styles.heroSubtitle}>
          We are the bridge between world-class beauty professionals and clients who demand exactly what they offer.
        </p>
      </header>

      <main className={styles.container}>
        
        <section className={styles.storyGrid}>
          <div className={styles.missionCard}>
            <h2>Our Mission</h2>
            <p className={styles.paragraph}>
              Stylr SA exists to make finding and booking beauty and wellness services in South Africa as simple as it should be. We connect great beauty professionals with clients who are looking for their exact expertise — delivering a premium experience for both sides.
            </p>
          </div>
          <div className={styles.visionCard}>
            <h2>Our Story</h2>
            <p className={styles.paragraph}>
              Finding a trusted braider, a last-minute nail tech, or a barber who actually knows your hair type used to be frustrating. It relied on WhatsApp groups, word-of-mouth, and guesswork.
            </p>
            <p className={styles.paragraph}>
              We built Stylr SA to fix that. One platform where professionals can publish their work with real pricing, and where clients can discover, compare, and connect with confidence.
            </p>
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle} style={{ textAlign: "center", marginBottom: "3rem" }}>What We Do</h2>
          <div className={styles.valueSplit}>
            <div className={styles.valueCard}>
              <h3 className={styles.valueTitle}>For Clients</h3>
              <p className={styles.paragraph}>
                Search South Africa's most complete directory of verified salons, spas, and independent specialists.
              </p>
              <ul className={styles.valueList}>
                <li><span className={styles.checkIcon}>✓</span> Real-work galleries and authentic reviews</li>
                <li><span className={styles.checkIcon}>✓</span> No hidden fees or surprise charges</li>
                <li><span className={styles.checkIcon}>✓</span> Direct connection to artists via WhatsApp</li>
              </ul>
            </div>
            
            <div className={styles.valueCard}>
              <h3 className={styles.valueTitle}>For Professionals</h3>
              <p className={styles.paragraph}>
                A professional online profile built specifically for the South African beauty industry to supercharge your business.
              </p>
              <ul className={styles.valueList}>
                <li><span className={styles.checkIcon}>✓</span> High-ranking digital storefront (SEO)</li>
                <li><span className={styles.checkIcon}>✓</span> Keep 100% of your earnings (0% commission)</li>
                <li><span className={styles.checkIcon}>✓</span> Seamless WhatsApp lead generation</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.visionCard} style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <h2>Our Vision</h2>
          <p className={styles.paragraph}>
            We're building the most trusted beauty and wellness platform in South Africa — one that helps independent professionals compete, helps clients make better decisions, and raises the standard for the entire industry. Every local salon deserves to be discoverable. Every client deserves to find the right one.
          </p>
        </section>

      </main>
    </div>
  );
}
