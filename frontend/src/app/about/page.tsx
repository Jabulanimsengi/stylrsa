import { Metadata } from 'next';
import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

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
      <PageNav />
      
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>About Us</h1>
        
        <h2 className={styles.sectionTitle}>Our Mission</h2>
        <p className={styles.paragraph}>
          At Stylr SA, our mission is to digitally revolutionize the beauty and wellness industry in South Africa. We connect talented professionals and business owners with new clients, and help South Africans discover and book services with confidence, ease, and complete peace of mind.
        </p>

        <h2 className={styles.sectionTitle}>Our Story</h2>
        <p className={styles.paragraph}>
          Stylr SA was born from a simple, shared frustration: finding a trusted, local beauty professional was fragmented and difficult. We wanted to find the best braider in our neighborhood, a last-minute nail technician for an event, or a massage therapist with verified reviews, all in one place.
        </p>
        <p className={styles.paragraph}>
          We envisioned a single platform that makes discovery and booking seamless for customers while giving salon owners and independent professionals a focused place to list services, upload images, and manage WhatsApp-first bookings. We built Stylr SA to be that solution: an ecosystem that helps local businesses grow and helps clients look and feel their best.
        </p>

        <h2 className={styles.sectionTitle}>What We Do</h2>
        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>For Customers</h3>
          <p className={styles.blockContent}>
            We are your trusted partner for beauty and wellness. Discover top-rated salons, spas, barbers, and independent artists, explore real-work galleries, read reviews from real customers, and move into a simple WhatsApp booking flow with confidence.
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>For Salon & Service Partners</h3>
          <p className={styles.blockContent}>
            We are your new "business-in-a-box." We provide you with a beautiful, professional profile, a complete booking and calendar management system, and tools to market your work through promotions, galleries, and videos. We handle the discovery so you can focus on what you do best: providing exceptional service.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Our Vision</h2>
        <p className={styles.paragraph}>
          We are building the definitive digital destination for beauty and wellness in South Africa. We believe in empowering entrepreneurs, supporting local businesses, and setting a new standard for quality and trust in the industry.
        </p>
      </section>
    </div>
  );
}


