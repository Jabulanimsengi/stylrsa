import { Metadata } from 'next';
import Link from 'next/link';
import styles from './blog.module.css';

export const metadata: Metadata = {
  title: 'Stylr SA Blog - Beauty & Wellness Tips for South Africans',
  description: 'Expert guides on protective hairstyles, nail trends, men\'s grooming, skincare, massage benefits, and wedding makeup. Discover local beauty tips tailored for South African climate and lifestyle.',
  keywords: 'protective hairstyles, knotless braids, box braids, Cape Town nail trends, men\'s grooming Johannesburg, highveld skincare, wedding makeup Gauteng, massage benefits, matric dance prep, Stylr SA blog',
  openGraph: {
    title: 'Stylr SA Blog - Beauty & Wellness Tips for South Africans',
    description: 'Expert guides on protective hairstyles, nail trends, men\'s grooming, skincare, massage benefits, and wedding makeup. Discover local beauty tips.',
    type: 'website',
    url: 'https://stylrsa.co.za/blog',
    images: [
      {
        url: 'https://stylrsa.co.za/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Stylr SA Blog - Beauty & Wellness Tips',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stylr SA Blog - Beauty & Wellness Tips for South Africans',
    description: 'Expert guides on protective hairstyles, nail trends, men\'s grooming, skincare, massage benefits, and wedding makeup.',
    images: ['https://stylrsa.co.za/opengraph-image.png'],
  },
  alternates: {
    canonical: 'https://stylrsa.co.za/blog',
  },
};

const blogPosts = [
  {
    id: 'protective-hairstyles-guide',
    title: 'The 2024/2025 Guide to Protective Hairstyles: Top Braids & Twists in South Africa',
    description: 'Complete guide to knotless braids, box braids, passion twists, and feed-in cornrows. Learn how to find the perfect braider in Johannesburg and Cape Town.',
    category: 'Hair & Braids',
    readTime: '8 min read',
    featured: true,
  },
  {
    id: 'cape-town-nail-trends',
    title: 'Cape Town\'s Hottest Nail Trends: 10 Looks to Ask For at Your Next Appointment',
    description: 'Discover the latest nail trends from glazed donuts to aura nails. Find out what\'s popular in Cape Town salons and how to get the look you want.',
    category: 'Nail Care & Trends',
    readTime: '6 min read',
    featured: true,
  },
  {
    id: 'mens-grooming-johannesburg',
    title: 'The Modern Man\'s Guide to Barbering: Fades, Beards, and More in Johannesburg',
    description: 'Learn about different fade styles, hot towel shaves, and beard sculpting. Find your go-to barber in Johannesburg for that fresh, sharp look.',
    category: 'Men\'s Grooming',
    readTime: '7 min read',
    featured: false,
  },
  {
    id: 'wedding-makeup-artist',
    title: 'How to Find the Perfect Makeup Artist (MUA) for Your Wedding or Matric Dance in Gauteng',
    description: 'Step-by-step guide to finding trusted makeup artists for special events. Learn how to use before & after photos and verified reviews effectively.',
    category: 'Makeup & Special Events',
    readTime: '9 min read',
    featured: false,
  },
  {
    id: 'highveld-skincare-guide',
    title: 'Beating the Highveld Skin-pocalypse: A Skincare Guide for Dry Gauteng Air',
    description: 'Fight dry Highveld air with expert skincare tips. Learn about hydration, barrier protection, and professional treatments for glowing skin at 1,700m altitude.',
    category: 'Skincare & Wellness',
    readTime: '10 min read',
    featured: true,
  },
  {
    id: 'monthly-massage-benefits',
    title: 'More Than a "Treat": Why You Deserve a Monthly Massage (And Which One to Get)',
    description: 'Discover the physical and mental benefits of regular massage. From Swedish to deep tissue, learn which massage type suits your needs.',
    category: 'Massage & Wellness',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 'stylr-promotions-guide',
    title: 'How to Get the Best Deal: A Guide to Using Promotions on Stylr SA',
    description: 'Learn how to find and use special deals and promotions. Save money on your favorite beauty treatments with our step-by-step guide.',
    category: 'Platform Feature Guide',
    readTime: '5 min read',
    featured: false,
  },
  {
    id: 'verified-reviews-importance',
    title: 'Why "Verified Reviews" Matter: How to Book with Confidence',
    description: 'Understand the importance of verified reviews and how they protect you from fake feedback. Learn to read reviews like a pro.',
    category: 'Platform Feature Guide',
    readTime: '7 min read',
    featured: false,
  },
  {
    id: 'matric-dance-prep',
    title: 'Your Ultimate Matric Dance Prep Checklist: Hair, Nails & Makeup',
    description: 'Complete 6-week countdown for the perfect Matric dance preparation. From trials to final touch-ups, we\'ve got your beauty timeline covered.',
    category: 'Seasonal & Events',
    readTime: '8 min read',
    featured: false,
  },
];

const categories = Array.from(new Set(blogPosts.map(post => post.category)));

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Stylr SA Blog</h1>
        <p className={styles.subtitle}>
          Expert beauty and wellness tips tailored for South Africans. From protective hairstyles to skincare in our unique climate, discover advice from local professionals.
        </p>
      </div>

      <section className={styles.featured}>
        <h2 className={styles.sectionTitle}>Featured Articles</h2>
        <div className={styles.featuredGrid}>
          {featuredPosts.map((post) => (
            <article key={post.id} className={styles.featuredCard}>
              <Link href={`/blog/${post.id}`} className={styles.cardLink}>
                <div className={styles.cardContent}>
                  <div className={styles.cardMeta}>
                    <span className={styles.category}>{post.category}</span>
                    <span className={styles.readTime}>{post.readTime}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.cardDescription}>{post.description}</p>
                  <span className={styles.readMore}>Read more →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.allArticles}>
        <h2 className={styles.sectionTitle}>All Articles</h2>
        <div className={styles.articleGrid}>
          {blogPosts.map((post) => (
            <article key={post.id} className={styles.articleCard}>
              <Link href={`/blog/${post.id}`} className={styles.cardLink}>
                <div className={styles.cardContent}>
                  <div className={styles.cardMeta}>
                    <span className={styles.category}>{post.category}</span>
                    <span className={styles.readTime}>{post.readTime}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.cardDescription}>{post.description}</p>
                  <span className={styles.readMore}>Read more →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.categories}>
        <h2 className={styles.sectionTitle}>Browse by Category</h2>
        <div className={styles.categoryGrid}>
          {categories.map((category) => {
            const categoryPosts = blogPosts.filter(post => post.category === category);
            return (
              <Link key={category} href={`/blog/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className={styles.categoryCard}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                <p className={styles.categoryCount}>{categoryPosts.length} articles</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Book Your Next Beauty Treatment?</h2>
          <p className={styles.ctaDescription}>
            Find verified salons, barbers, and beauty professionals near you. Read reviews, browse galleries, and book with confidence.
          </p>
          <Link href="/services" className={styles.ctaButton}>Browse Services</Link>
        </div>
      </section>
    </div>
  );
}
