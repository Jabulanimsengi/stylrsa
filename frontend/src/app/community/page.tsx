import { Metadata } from 'next';
import Link from 'next/link';
import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export const metadata: Metadata = {
  title: 'Community - Stylr SA',
  description: 'Join the Stylr SA community. Connect with other beauty professionals, share tips, and grow together.',
  keywords: 'community, beauty community, stylist network, Stylr SA community',
  openGraph: {
    title: 'Community - Stylr SA',
    description: 'Connect with the Stylr SA beauty and wellness community.',
    type: 'website',
    url: 'https://stylrsa.co.za/community',
  },
};

export default function CommunityPage() {
  return (
    <div className={styles.container}>
      <PageNav />
      
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Community</h1>
        
        <div className={styles.infoBlock} style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            Welcome to the Stylr SA community! Connect with beauty professionals, share knowledge, discover trends, and grow your skills together with thousands of talented individuals across South Africa.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Why Join Our Community?</h2>
        <ul className={styles.list}>
          <li><strong>Network:</strong> Connect with fellow beauty professionals and enthusiasts</li>
          <li><strong>Learn:</strong> Share tips, techniques, and industry insights</li>
          <li><strong>Grow:</strong> Get advice on building and scaling your business</li>
          <li><strong>Discover:</strong> Stay updated on the latest trends and products</li>
          <li><strong>Support:</strong> Get help and encouragement from peers</li>
        </ul>

        <h2 className={styles.sectionTitle}>Community Features</h2>
        
        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>📱 Social Media Groups</h3>
          <p className={styles.paragraph}>
            Join our active social media communities:
          </p>
          <ul className={styles.list}>
            <li><strong>Facebook Group:</strong> "Stylr SA Beauty Professionals" - Tips, Q&A, and networking</li>
            <li><strong>Instagram:</strong> @stylrsa - Daily inspiration and featured work</li>
            <li><strong>WhatsApp Community:</strong> Regional groups for local connections (coming soon)</li>
          </ul>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>💬 Discussion Forums</h3>
          <p className={styles.paragraph}>
            Participate in discussions on:
          </p>
          <ul className={styles.list}>
            <li>Technique tutorials and how-tos</li>
            <li>Product recommendations and reviews</li>
            <li>Business advice and marketing tips</li>
            <li>Client management and customer service</li>
            <li>Industry news and trends</li>
          </ul>
          <p className={styles.paragraph}>
            <em>Forum launching soon! Sign up for updates.</em>
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>🎓 Learning Resources</h3>
          <ul className={styles.list}>
            <li>Video tutorials from top professionals</li>
            <li>Webinars on business growth and marketing</li>
            <li>Industry best practices and guides</li>
            <li>Certification courses (coming soon)</li>
          </ul>
        </div>

        <h2 className={styles.sectionTitle}>Community Guidelines</h2>
        <p className={styles.paragraph}>
          To maintain a positive, supportive environment, please:
        </p>
        <ul className={styles.list}>
          <li>✓ Be respectful and supportive of others</li>
          <li>✓ Share knowledge and help fellow members</li>
          <li>✓ Give constructive feedback</li>
          <li>✓ Celebrate others' successes</li>
          <li>✓ Stay professional in all interactions</li>
          <li>✗ No spam or excessive self-promotion</li>
          <li>✗ No hate speech or discrimination</li>
          <li>✗ No sharing of copyrighted content without permission</li>
        </ul>

        <h2 className={styles.sectionTitle}>Featured Community Members</h2>
        
        <div className={styles.infoBlock} style={{ background: '#f3e5f5', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Member Spotlight</h3>
          <p className={styles.paragraph}>
            Each month, we feature outstanding community members who are making a difference in the beauty industry. Share your story, inspire others, and get recognized for your contributions!
          </p>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            <strong>Want to be featured?</strong> Email community@stylrsa.co.za with your story.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Events & Meetups</h2>
        <p className={styles.paragraph}>
          Stay tuned for upcoming community events:
        </p>
        <ul className={styles.list}>
          <li><strong>Virtual Meetups:</strong> Monthly video calls with industry experts</li>
          <li><strong>Workshops:</strong> Hands-on training sessions in major cities</li>
          <li><strong>Networking Events:</strong> Connect with local professionals</li>
          <li><strong>Annual Conference:</strong> Stylr SA Beauty Summit (coming soon)</li>
        </ul>

        <h2 className={styles.sectionTitle}>Get Involved</h2>
        <p className={styles.paragraph}>
          Ready to join the conversation? Here's how to get started:
        </p>
        
        <div className={styles.infoBlock} style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '8px' }}>
          <ol className={styles.list}>
            <li><strong>Create your profile:</strong> <Link href="/register">Sign up</Link> on Stylr SA</li>
            <li><strong>Join our social channels:</strong> Follow @stylrsa on Instagram and Facebook</li>
            <li><strong>Introduce yourself:</strong> Share your story and what you do</li>
            <li><strong>Engage:</strong> Comment, share, and support fellow members</li>
            <li><strong>Contribute:</strong> Share your knowledge and expertise</li>
          </ol>
        </div>

        <h2 className={styles.sectionTitle}>Community Support</h2>
        <p className={styles.paragraph}>
          Have questions or suggestions for the community?
        </p>
        <ul className={styles.list}>
          <li><strong>Email:</strong> community@stylrsa.co.za</li>
          <li><strong>Report issues:</strong> Use the "Report" button or email safety@stylrsa.co.za</li>
          <li><strong>Suggest features:</strong> Share your ideas for improving the community</li>
        </ul>

        <div className={styles.infoBlock} style={{ marginTop: '2rem', background: '#fff3e0', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 className={styles.blockTitle}>Together We Rise</h3>
          <p className={styles.paragraph} style={{ marginBottom: 0 }}>
            The Stylr SA community is built on collaboration, support, and shared success. Whether you're just starting out or you're a seasoned professional, there's a place for you here. Let's grow together! 🚀
          </p>
        </div>
      </section>
    </div>
  );
}
