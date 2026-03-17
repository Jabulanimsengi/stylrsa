import { Metadata } from 'next';
import Link from 'next/link';
import styles from './article.module.css';
import { notFound } from 'next/navigation';

// Article data with full content
const articles = {
  'protective-hairstyles-guide': {
    title: 'The 2024/2025 Guide to Protective Hairstyles: Top Braids & Twists in South Africa',
    description: 'Welcome to the ultimate guide for protective styling! In South Africa, a protective style is more than just a beautiful look—it\'s an essential part of hair care, protecting our natural hair from the elements, promoting growth, and giving us a break from daily styling. But with so many options, how do you choose? We\'re breaking down the most popular styles, from classic box braids to the trendy knotless twists, and helping you find the perfect specialist for the job.',
    category: 'Hair & Braids',
    readTime: '8 min read',
    content: [
      {
        heading: 'Knotless Braids: The "No-Pain" Sensation',
        content: 'Unlike traditional box braids that start with a knot at the scalp, knotless braids begin with your natural hair and gradually feed in the braiding hair. This method puts significantly less tension on your scalp, reducing the risk of traction alopecia and breakage. They are more flexible from day one (you can pull them into a high bun immediately!) and have a more natural-looking, flatter lay. Best for: Anyone with a sensitive scalp or those looking to give their edges a rest. Where to find them: This is a specialist skill. Look for stylists in Johannesburg or Cape Town who specifically list "Knotless Braids" in their services.'
      },
      {
        heading: 'Box Braids: The Timeless Classic',
        content: 'The iconic style that has been a staple for decades. Hair is sectioned into squares (or "boxes") and braided from the root with extension hair. They are incredibly versatile, long-lasting (4-8 weeks), and can be customized in any size or length, from a chic bob to waist-length. Best for: Anyone looking for a reliable, long-lasting, and stylish look. Pro-Tip: Check a stylist\'s gallery for clean parts and consistent braid size.'
      },
      {
        heading: 'Passion Twists: The Boho-Chic Look',
        content: 'A stunning cross between Senegalese twists and goddess locs. They use Freetress Water Wave hair to create a silky, curly, and slightly "undone" twist. They offer a beautiful, bohemian vibe that\'s lightweight and full of volume. They are generally faster to install than braids. Best for: Holidays, special events, or anyone wanting a soft, romantic look.'
      },
      {
        heading: 'Cornrows & Feed-In Styles',
        content: 'Braids done flat against the scalp. "Feed-in" styles are the modern approach, where braiding hair is added gradually to create a natural-looking cornrow that starts thin and gets thicker. They are the foundation for many other styles (like wigs or crochet) but are a stunning style on their own. Intricate patterns, from simple straight-backs to complex artistic designs, are a true art form. Best for: A stylish, low-maintenance look for 1-2 weeks.'
      },
      {
        heading: 'How to Find Your Perfect Stylist on Stylr SA',
        content: 'Don\'t risk your edges! Finding the right braider is about proof. Go to the "Services" page and select the "Hair" or "Braids" category. Filter by your location (e.g., "Gauteng"). Click on a salon and browse their "Before & After" and "Gallery" sections. This is where you can see the quality of their partings and tension. Finally, read their "Verified Reviews" to see what other clients say about their experience. Ready for your new look?'
      }
    ]
  },
  'cape-town-nail-trends': {
    title: 'Cape Town\'s Hottest Nail Trends: 10 Looks to Ask For at Your Next Appointment',
    description: 'From the art galleries of Woodstock to the beaches of Camps Bay, Cape Town is a city of style. That flair extends all the way to our fingertips. Gone are the days of a simple French tip. Today, nail art is a full-blown accessory. We\'ve scrolled the feeds and scouted the top salons to bring you the 10 hottest nail trends taking over the Mother City.',
    category: 'Nail Care & Trends',
    readTime: '6 min read',
    content: [
      {
        heading: 'Glazed Donut / Chrome',
        content: 'Still going strong! This pearlescent, shimmery finish (popularized by Hailey Bieber) looks incredible on all nail shapes and colours.'
      },
      {
        heading: '"Lip Gloss" Nails',
        content: 'Think sheer, ultra-glossy, and healthy-looking. It\'s a "your-nails-but-better" look using soft pinks or milky whites.'
      },
      {
        heading: 'Micro French',
        content: 'A delicate update on the classic. A razor-thin line of white (or any colour!) at the very tip of the nail.'
      },
      {
        heading: 'Abstract Swirls',
        content: 'Groovy, 70s-inspired swirls in complementary colours (like chocolate and cream, or orange and pink) are a local favourite.'
      },
      {
        heading: '3D "Jelly" Art',
        content: 'Gummy, raised 3D designs, water droplets, or bubbles are for the bold and playful.'
      },
      {
        heading: 'Aura Nails',
        content: 'A soft-focus, airbrushed-style design where one colour blends out from the centre of the nail.'
      },
      {
        heading: 'Viva Magenta',
        content: 'The 2024 Colour of the Year is a powerful statement. It\'s not quite red, not quite pink, and it\'s everywhere.'
      },
      {
        heading: 'Cat-Eye / Velvet',
        content: 'Using a magnetic polish, your nail tech can create a shimmery, velvet-like line that moves in the light.'
      },
      {
        heading: 'Builder Gel (BIAB) Overlay',
        content: 'Less of a trend, more of a movement. This is a strengthening gel applied over your natural nails to help them grow long and strong without acrylics.'
      },
      {
        heading: 'Mismatched "Skittles"',
        content: 'Can\'t decide? Paint each nail a different, complementary shade from the same colour family.'
      },
      {
        heading: 'How to Get the Look You Want',
        content: 'The worst feeling is walking out with nails you didn\'t ask for. Use the Gallery: The "Gallery" feature on Stylr SA is your best friend. Find a salon, and browse their gallery to see if their "style" matches your own. Do they specialize in minimalist art or over-the-top glam? Check Reviews: Look for reviews that mention "nail art" or "attention to detail." Book It: Find a nail artist who inspires you.'
      }
    ]
  },
  'mens-grooming-johannesburg': {
    title: 'The Modern Man\'s Guide to Barbering: Fades, Beards, and More in Johannesburg',
    description: 'Gents, it\'s time to level up your grooming game. A visit to the barber is no longer just a quick trim; it\'s an experience. In a city like Johannesburg, where the lifestyle is all about looking sharp, a fresh cut is non-negotiable. From a precision fade to a perfectly sculpted beard, we\'re breaking down the services you should be booking to look your best.',
    category: 'Men\'s Grooming',
    readTime: '7 min read',
    content: [
      {
        heading: 'The Fade: This is the cornerstone of modern barbering',
        content: 'It\'s a smooth transition from short hair at the sides to longer hair on top. Taper Fade: A subtle fade, usually just at the temples and neckline. Professional and clean. Skin Fade: Bold and sharp. The hair fades all the way down to the skin. Burst Fade: A popular style in Johannesburg, the fade "bursts" around the ear, leaving length at the back.'
      },
      {
        heading: 'The Hot Towel Shave',
        content: 'Pure luxury. This isn\'t just a shave; it\'s a facial. A hot, steaming towel opens up your pores, softens the hair, and a straight-razor shave gives you the closest, smoothest finish possible. It\'s the perfect treat before a big event.'
      },
      {
        heading: 'Beard Sculpting & Line-Up',
        content: 'A great beard doesn\'t just happen. A professional barber will shape your beard to suit your face, create sharp lines on the cheeks and neckline, and finish with a trim to get rid of any stray hairs.'
      },
      {
        heading: 'The "Two-in-One"',
        content: 'Most modern barbershops offer combo deals, like a "Cut & Shave" or "Cut & Beard Trim." This is the best way to ensure your entire look is cohesive and sharp.'
      },
      {
        heading: 'Find Your Go-To Barber on Stylr SA',
        content: 'The relationship with your barber is built on trust. We help you find the one. Search for "Barber" in the main search bar or select the "Barbering" category. Filter by your area, from Sandton to Soweto. Look at their Video Gallery. Many barbers post videos of their fade transitions and cuts. Check their services list for combos and hot towel shaves. Read the reviews to see what other guys are saying about their skills. Ready for a fresh cut?'
      }
    ]
  },
  'wedding-makeup-artist': {
    title: 'How to Find the Perfect Makeup Artist (MUA) for Your Wedding or Matric Dance in Gauteng',
    description: 'Gauteng hosts some of the country\'s most spectacular events, from glamorous Sandton weddings to unforgettable Matric dances. On a day when all eyes are on you (and the photos last a lifetime), your makeup needs to be flawless. But how do you find an MUA you can trust? Here\'s a step-by-step guide.',
    category: 'Makeup & Special Events',
    readTime: '9 min read',
    content: [
      {
        heading: 'Step 1: Know Your Style Before you even search, have a vision',
        content: 'Are you looking for: Natural & Glowing: Soft, romantic, and enhancing your natural features. Full Glam: Bold eyes, perfect contour, and a dramatic lash. Boho & Ethereal: Warm tones, faux freckles, and a "less-is-more" feel.'
      },
      {
        heading: 'Step 2: The "Before & After" is Your Best Friend',
        content: 'This is the single most important tool for hiring an MUA. A "Before" photo shows you what the artist is working with, and the "After" shows you their skill in action. Look for artists who showcase transformations on a variety of skin tones and face shapes, not just one.'
      },
      {
        heading: 'Step 3: Read Reviews for Key Details',
        content: 'Don\'t just look at the star rating. Read the reviews and look for specific keywords: "Punctual" / "On-time": Critical for a wedding day! "Hygienic" / "Clean brushes": A non-negotiable. "Listened": Did the MUA listen to what the client wanted, or did they just do their "one look"? "Long-lasting": How did the makeup hold up after hours of dancing?'
      },
      {
        heading: 'Step 4: Book a Trial (Seriously)',
        content: 'For a big event like a wedding, always book a trial. This is your chance to test your look, build a rapport with the artist, and make any adjustments. You can book a "Makeup Trial" service directly through many MUAs on the platform.'
      },
      {
        heading: 'Step 5: Use Stylr SA to Find Your Match',
        content: 'We\'ve made this stressful search easy. Select the "Makeup Artist" category and filter by your city (Johannesburg, Pretoria, etc.). Dive deep into the "Before & After" and "Gallery" sections. This is your interview. Filter by artists who have Verified Reviews. Found one you love? Book your trial instantly. Don\'t leave the most important day of your life to chance.'
      }
    ]
  },
  'highveld-skincare-guide': {
    title: 'Beating the Highveld Skin-pocalypse: A Skincare Guide for Dry Gauteng Air',
    description: 'If you live in Gauteng, you know the struggle. The air is dry, the altitude is high, and our skin pays the price. That tight, flaky, and dehydrated feeling is what we call the "Highveld Skin-pocalypse." While the coast worries about humidity, our challenge is keeping moisture in. Here\'s your guide to glowing skin, 1,700 meters above sea level.',
    category: 'Skincare & Wellness',
    readTime: '10 min read',
    content: [
      {
        heading: '1. Hydration is Non-Negotiable (Inside & Out)',
        content: 'Internal: You need to drink more water than you think. The dry air causes faster transepidermal water loss. External: Your skin needs topical hydration. Look for products with Hyaluronic Acid, a molecule that holds 1000x its weight in water, and Glycerin.'
      },
      {
        heading: '2. Swap Foaming Cleansers for Cream or Oil',
        content: 'Those sudsy, foaming cleansers can feel "squeaky clean," but they are often stripping your skin of its natural oils (its "barrier"). In the Highveld, your skin barrier is your first line of defence. Switch to a gentle cream, milk, or oil-based cleanser that cleans without stripping.'
      },
      {
        heading: '3. It\'s All About the Barrier: Moisturise & Seal',
        content: 'Moisturise: After hydrating with serums, you need a moisturiser with Ceramides. Ceramides are lipids (fats) that are naturally found in your skin and help form its protective barrier. Seal: This is the most-missed step. At night, seal all that moisture in with a "facial oil" or a thicker "occlusive" balm. This creates a physical barrier to prevent moisture from evaporating while you sleep.'
      },
      {
        heading: '4. Book a Professional Hydrating Facial',
        content: 'You can do a lot at home, but a professional esthetician can supercharge your results. Book a treatment specifically for hydration. Look for services like: Hydrating Facials: These often use professional-grade hyaluronic masks and steam to infuse moisture. Chemical Peels (light): Don\'t be scared! A light peel (like a Lactic Acid peel) can slough off the top layer of dead, dry skin, allowing your hydrating products to penetrate deeper. Dermaplaning: This treatment removes "peach fuzz" and the top layer of dead skin, leaving you with a baby-smooth, glowing canvas.'
      },
      {
        heading: 'Find Your Skin Saviour on Stylr SA',
        content: 'Don\'t trust just anyone with your face. Search for "Facials" or "Skincare" in the "Services" tab. Filter by your area (e.g., "Pretoria," "Sandton"). Read the service descriptions carefully to see what they offer. Check their Verified Reviews to see if other clients with dry skin had good results. Ready to fight the dry air?'
      }
    ]
  },
  'monthly-massage-benefits': {
    title: 'More Than a "Treat": Why You Deserve a Monthly Massage (And Which One to Get)',
    description: 'In our fast-paced lives, we often think of massage as a luxury, a "treat" we save for a special occasion. But what if we told you it\'s one of the best things you can do for your mind and body, and should be part of your monthly routine? From releasing 9-to-5 desk tension to easing post-gym soreness, let\'s explore the real benefits.',
    category: 'Massage & Wellness',
    readTime: '6 min read',
    content: [
      {
        heading: 'The Physical Benefits',
        content: 'Reduces Muscle Tension: The most obvious one! A good massage releases knots (adhesions) and eases tight, sore muscles. Improves Circulation: The pressure of massage moves blood through congested areas, improving circulation and helping with recovery. Reduces Stress Hormones: Massage has been proven to decrease cortisol (the body\'s stress hormone).'
      },
      {
        heading: 'The Mental Benefits',
        content: 'Boosts Serotonin & Dopamine: Massage increases the levels of "feel-good" neurotransmitters, which can help reduce anxiety and improve your mood. Improves Sleep Quality: By reducing pain and anxiety, regular massage can lead to deeper, more restorative sleep. Increases Focus: A relaxed mind is a focused mind. Easing that "background noise" of tension can help you feel clearer.'
      },
      {
        heading: 'Which Massage Should You Book?',
        content: 'Swedish Massage: The classic. Best for relaxation and general stress relief. Uses long, flowing strokes. Deep Tissue Massage: Best for chronic pain and knots. The therapist uses more intense, focused pressure to release deep layers of muscle. Hot Stone Massage: Best for deep relaxation and easing tension. The heat from the stones warms and relaxes muscles, allowing the therapist to work deeper, more gently. Sports Massage: Best for athletes or active people. Focuses on specific muscle groups used in your sport to prevent injury and improve recovery.'
      },
      {
        heading: 'How to Find Your Peace and Quiet on Stylr SA',
        content: 'We make it easy to find your moment of "me-time." Select the "Massage" category on the "Services" page. Browse therapists and salons near you. Read the service descriptions to find the style you need (Swedish, Deep Tissue, etc.). Read the Verified Reviews. Look for comments on "pressure" and "relaxing atmosphere." You\'ve earned this.'
      }
    ]
  },
  'stylr-promotions-guide': {
    title: 'How to Get the Best Deal: A Guide to Using Promotions on Stylr SA',
    description: 'We all love a good deal, especially on our favourite beauty treatments! On Stylr SA, our partners (salons and professionals) can create special promotions and discounts, but do you know how to find them? Here\'s a quick guide to becoming a savvy booker and saving on your next appointment.',
    category: 'Platform Feature Guide',
    readTime: '5 min read',
    content: [
      {
        heading: 'What Kinds of Promotions Can I Find?',
        content: 'Our salon partners have full control, so you can find all sorts of deals: Percentage Discounts (e.g., "15% Off all Gel Manicures"): The most common and popular deal. Fixed Amount Off (e.g., "R50 Off any service over R300"): A great saving on bigger treatments. Package Deals (e.g., "Mani/Pedi Combo for R400"): Bundled services for a special price. First-Time Client Offers: Many salons offer a special discount to win your business.'
      },
      {
        heading: 'How to Find These Deals',
        content: 'Method 1: The "Promotions" Page: The easiest way! We\'ve gathered all active promotions from all our partners onto one single page. Click the "Promotions" tab in the main navigation. Browse all the deals available in your area. See a deal you like? Click it to go directly to the salon\'s profile and book the service.'
      },
      {
        heading: 'Method 2: On the Salon\'s Profile',
        content: 'When you\'re browsing a specific salon, look for a "Promotions" tab on their profile page. This will show you all the deals that specific salon is currently running. You might even find a loyalty deal!'
      },
      {
        heading: 'Method 3: On the Service Itself',
        content: 'When you\'re looking at a salon\'s service list, you\'ll see a bright tag or badge next to any service that is part of a promotion.'
      },
      {
        heading: 'Book Your Deal Today',
        content: 'Looking good doesn\'t have to break the bank. New deals are added every day by salons looking to fill their chairs. Ready to get pampered for less?'
      }
    ]
  },
  'verified-reviews-importance': {
    title: 'Why "Verified Reviews" Matter: How to Book with Confidence',
    description: 'We\'ve all been there. You see a beautiful picture on social media, you book the appointment, and you show up to find... it\'s not what you expected. The internet is full of fake reviews and filters. So how can you really trust a salon or stylist? This is why we built the Stylr SA Verified Review System.',
    category: 'Platform Feature Guide',
    readTime: '7 min read',
    content: [
      {
        heading: 'What is a "Verified Review"?',
        content: 'It\'s simple: On Stylr SA, only customers who have booked and completed an appointment through the platform are allowed to leave a review. No fake accounts from friends or family. No fake negative reviews from competitors. Every single review you read is from a real person who really sat in that chair.'
      },
      {
        heading: 'How to Use Reviews to Your Advantage',
        content: 'Don\'t just look at the 5-star rating. The real information is inside the reviews. Look for specifics: Bad: "It was good." Good: "Zandi was amazing! She was so gentle with my knotless braids and her partings are incredibly clean. The salon was also spotless. I\'ll be back!" Check for consistency: Do multiple reviews mention the same thing? (e.g., "always runs on time," or "the best at nail art"). This shows a consistent pattern.'
      },
      {
        heading: 'Read the Salon\'s Response',
        content: 'We also allow salon owners to reply to reviews. How a salon handles a 3-star review tells you everything about their customer service. Do they get defensive, or do they apologize and offer to make it right?'
      },
      {
        heading: 'Your Trust is Our Priority',
        content: 'We also have an admin team that verifies all new partners and reviews to ensure the platform remains a safe and trusted space. We do the hard work so you can book with total peace of mind. Ready to find a professional you can trust?'
      }
    ]
  },
  'matric-dance-prep': {
    title: 'Your Ultimate Matric Dance Prep Checklist: Hair, Nails & Makeup',
    description: 'Your Matric dance is one of the most memorable nights of your life. The dress, the date, the after-party... it\'s a huge deal! But the perfect night starts with the perfect prep. To avoid any last-minute panic, here is your ultimate beauty booking checklist.',
    category: 'Seasonal & Events',
    readTime: '8 min read',
    content: [
      {
        heading: '6 Weeks Before: The Vision Board',
        content: 'Start saving inspiration! What is your vibe? Is it classic elegance, boho-chic, or full-on glam? Start your search for your MUA (Makeup Artist) and Hairstylist. The best ones get booked out months in advance. Action: Use Stylr SA to find artists. Check their Galleries and "Before & After" sections to see if their work matches your vision.'
      },
      {
        heading: '4 Weeks Before: Book Your Trials',
        content: 'Book a "Hair Trial" and "Makeup Trial" with your chosen artists. Bring photos of your dress and your inspiration. This is when you\'ll finalise your look. Action: Book your actual Matric dance appointment now. Don\'t wait until after the trial, or you might lose your spot!'
      },
      {
        heading: '2 Weeks Before: The "Foundation"',
        content: 'Get your "big" hair appointment done. If you\'re getting braids, a weave, or a new colour, do it now. This gives it time to "settle" and look more natural. Get a hydrating facial. This will ensure your skin is a smooth, glowing canvas for your MUA. Action: Book your hairstylist and esthetician on Stylr SA.'
      },
      {
        heading: 'The Week Of: The Finishing Touches',
        content: '2-3 Days Before: Get Your Nails Done. This is the sweet spot. They\'ll be fresh, but you\'re not rushing on the same day. Book a gel manicure so you don\'t have to worry about chipping. 1-2 Days Before: Get Your Eyebrows Shaped. A professional brow wax and tint will frame your face and make your makeup look 10x better.'
      },
      {
        heading: 'The Day Of: Glam Time!',
        content: 'Relax! All your appointments are booked. Your only job is to show up, get pampered, and have the most amazing night of your life. Pro-Tip: Check your "My Bookings" page on Stylr SA to see all your appointments and times in one place. Ready to plan the perfect day?'
      }
    ]
  }
};

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const article = articles[slug as keyof typeof articles];

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.category.toLowerCase(),
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      url: `https://stylrsa.co.za/blog/${slug}`,
      images: [
        {
          url: 'https://stylrsa.co.za/opengraph-image.png',
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: ['https://stylrsa.co.za/opengraph-image.png'],
    },
    alternates: {
      canonical: `https://stylrsa.co.za/blog/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const slug = (await params).slug;
  const article = articles[slug as keyof typeof articles];

  if (!article) {
    notFound();
  }

  const allArticles = Object.entries(articles).map(([slug, data]) => ({ slug, ...data }));
  const relatedArticles = allArticles
    .filter(a => a.category === article.category && a.title !== article.title)
    .slice(0, 3);

  return (
    <div className={styles.articlePage}>
      <div className={styles.articleHeader}>
        <div className={styles.breadcrumb}>
          <Link href="/blog">← Back to Blog</Link>
        </div>

        <div className={styles.articleMeta}>
          <span className={`${styles.category} ${styles[article.category.replace(/[^a-z]+/g, '-')]}`}>
            {article.category}
          </span>
          <span className={styles.readTime}>{article.readTime}</span>
        </div>

        <h1 className={styles.articleTitle}>{article.title}</h1>
        <p className={styles.articleDescription}>{article.description}</p>
      </div>

      <div className={styles.articleContent}>
        {article.content.map((section, index) => (
          <section key={index} className={styles.contentSection}>
            <h2 className={styles.sectionHeading}>{section.heading}</h2>
            <div className={styles.sectionContent}>
              <p>{section.content}</p>
            </div>
          </section>
        ))}
      </div>

      {relatedArticles.length > 0 && (
        <section className={styles.relatedArticles}>
          <h2 className={styles.relatedTitle}>Related Articles</h2>
          <div className={styles.relatedGrid}>
            {relatedArticles.map((related) => (
              <article key={related.title} className={styles.relatedCard}>
                <Link href={`/blog/${related.slug}`} className={styles.cardLink}>
                  <div className={styles.ribbonContent}>
                    <h3 className={styles.ribbonTitle}>{related.title}</h3>
                    <p className={styles.ribbonDescription}>{related.description}</p>
                    <div className={styles.ribbonMeta}>
                      <span className={styles.ribbonCategory}>{related.category}</span>
                      <span className={styles.ribbonReadTime}>{related.readTime}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Book Your Beauty Treatment?</h2>
          <p className={styles.ctaDescription}>
            Find verified salons, barbers, and beauty professionals near you. Read reviews, browse galleries, and book with confidence on Stylr SA.
          </p>
          <Link href="/services" className={styles.ctaButton}>
            Browse Services →
          </Link>
        </div>
      </section>
    </div>
  );
}

