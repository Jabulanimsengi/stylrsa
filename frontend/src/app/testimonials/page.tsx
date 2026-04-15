import { Metadata } from 'next';
import Link from 'next/link';
import styles from '../info-page.module.css';
import { buildAuthRoute } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'Testimonials - Stylr SA',
  description: 'Read what our clients and salon partners are saying about Stylr SA. Real feedback from real users.',
  keywords: 'testimonials, reviews, client stories, success stories, Stylr SA reviews',
  openGraph: {
    title: 'Testimonials - Stylr SA',
    description: 'See what people are saying about Stylr SA.',
    type: 'website',
    url: 'https://stylrsa.co.za/testimonials',
  },
};

export default function TestimonialsPage() {
  const providerSignupHref = buildAuthRoute.providerRegister('/create-salon');

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Testimonials</h1>
        
        <div className={styles.infoBlock} style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            Don't just take our word for it - hear from our amazing community of clients and service providers who are transforming the beauty industry together.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>From Our Clients</h2>
        
        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>⭐⭐⭐⭐⭐ "Best booking platform ever!"</h3>
          <p className={styles.paragraph}>
            "I used to spend hours searching for a good hairstylist. Now I can browse portfolios, read reviews, and book appointments all in one place. Stylr SA has made my life so much easier!"
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <em>— Thandiwe M., Johannesburg</em>
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>⭐⭐⭐⭐⭐ "Found my perfect nail tech"</h3>
          <p className={styles.paragraph}>
            "The before-and-after photos helped me find a nail technician who specializes in exactly what I wanted. Her work is incredible, and booking was seamless!"
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <em>— Lerato P., Cape Town</em>
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>⭐⭐⭐⭐⭐ "Reliable and convenient"</h3>
          <p className={styles.paragraph}>
            "As someone with a busy schedule, being able to compare salons quickly and continue the booking on WhatsApp is a game-changer. Plus, the reviews are always accurate."
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <em>— Sipho N., Midrand</em>
          </p>
        </div>

        <h2 className={styles.sectionTitle}>From Our Partners</h2>
        
        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>⭐⭐⭐⭐⭐ "Grew my client base by 300%"</h3>
          <p className={styles.paragraph}>
            "Since joining Stylr SA, I've tripled my bookings! The platform makes it easy to showcase my work, and clients reach out with clearer booking details. Best decision for my business."
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <em>— Nomusa K., Hair Braiding Specialist, Pretoria</em>
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>⭐⭐⭐⭐⭐ "Perfect for independent professionals"</h3>
          <p className={styles.paragraph}>
            "As a freelance makeup artist, I needed an affordable way to reach clients. Stylr SA gave me a professional online presence without the cost of building my own website. The booking system is fantastic!"
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <em>— Amanda R., Makeup Artist, Sandton</em>
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>⭐⭐⭐⭐⭐ "Finally, no more no-shows!"</h3>
          <p className={styles.paragraph}>
            "The clearer booking flow and direct client handoff have helped reduce confusion and fewer clients disappear before confirming. My schedule stays much more organized."
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <em>— Grace T., Salon Owner, Stellenbosch</em>
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Success Stories</h2>
        
        <div className={styles.infoBlock} style={{ background: '#f3e5f5', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>From Side Hustle to Full-Time Business</h3>
          <p className={styles.paragraph}>
            "I started doing nails from home as a side business. Within six months of joining Stylr SA, I had so many bookings that I opened my own studio. The platform gave me the visibility I needed to grow."
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <em>— Zinhle M., Nail Technician, Centurion</em>
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Join Our Growing Community</h2>
        <p className={styles.paragraph}>
          Ready to experience Stylr SA for yourself? Whether you're looking for beauty services or want to grow your business, we're here for you.
        </p>
        
        <div className={styles.infoBlock} style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '8px' }}>
          <p className={styles.paragraph}>
            <strong>For Clients:</strong> <Link href="/salons">Browse salons</Link> and book without creating an account
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <strong>For Professionals:</strong> <Link href={providerSignupHref}>List your salon</Link> and grow your business
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Share Your Story</h2>
        <p className={styles.paragraph}>
          Have an experience with Stylr SA that you'd like to share? We'd love to hear from you!
        </p>
        <ul className={styles.list}>
          <li><strong>Email:</strong> feedback@stylrsa.co.za</li>
          <li><strong>Social Media:</strong> Tag us @stylrsa on Instagram or Facebook</li>
          <li><strong>Leave a Review:</strong> After your appointment, share your experience</li>
        </ul>

        <div className={styles.infoBlock} style={{ marginTop: '2rem', background: '#fff3e0', padding: '1.5rem', borderRadius: '8px' }}>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <strong>Thank you</strong> to our incredible community! Your support and feedback help us build a better platform for everyone. ❤️
          </p>
        </div>
      </section>
    </div>
  );
}
