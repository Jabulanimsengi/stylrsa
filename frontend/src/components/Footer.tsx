import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Stylr SA",
    "description": "Your go-to platform for verified salons, barbers, and beauty experts across South Africa",
    "url": "https://www.stylrsa.co.za",
    "logo": "https://www.stylrsa.co.za/logo-white.png",
    "image": "https://www.stylrsa.co.za/logo-white.png",
    "telephone": "+27-11-123-4567",
    "email": "info@stylrsa.co.za",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "111 Commissioner Street",
      "addressLocality": "Johannesburg",
      "addressRegion": "Gauteng",
      "postalCode": "2001",
      "addressCountry": "ZA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -26.2041,
      "longitude": 28.0473
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "08:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "R",
    "areaServed": {
      "@type": "Country",
      "name": "South Africa"
    },
    "sameAs": []
  };

  return (
    <footer className={styles.footer}>
      {/* Schema.org Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Main Footer Content */}
      <div className={styles.footerContent}>
        {/* Brand Section */}
        <div className={styles.brandSection}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/logo-white.png"
              alt="Stylr SA Logo"
              width={160}
              height={40}
              className={styles.logo}
            />
          </Link>
          <p className={styles.tagline}>
            South Africa's premier beauty & wellness platform
          </p>
          <div className={styles.trustBadges}>
            <span className={styles.trustBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              Verified Salons
            </span>
            <span className={styles.trustBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Free to Use
            </span>
            <span className={styles.trustBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              Trusted Reviews
            </span>
          </div>
        </div>

        {/* Links Grid */}
        <div className={styles.linksGrid}>
          {/* Services */}
          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>Services</h3>
            <ul className={styles.linkList}>
              <li><Link href="/services?category=braiding-weaving">Hair Braiding</Link></li>
              <li><Link href="/services?category=haircuts-styling">Haircuts & Styling</Link></li>
              <li><Link href="/services?category=nail-care">Nail Services</Link></li>
              <li><Link href="/services?category=makeup-beauty">Makeup</Link></li>
              <li><Link href="/services?category=massage-body-treatments">Massage</Link></li>
              <li><Link href="/services?category=mens-grooming">Men's Grooming</Link></li>
            </ul>
          </div>

          {/* Locations */}
          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>Locations</h3>
            <ul className={styles.linkList}>
              <li><Link href="/salons/location/gauteng">Gauteng</Link></li>
              <li><Link href="/salons/location/western-cape">Western Cape</Link></li>
              <li><Link href="/salons/location/kwazulu-natal">KwaZulu-Natal</Link></li>
              <li><Link href="/salons/location/eastern-cape">Eastern Cape</Link></li>
              <li><Link href="/salons/location/free-state">Free State</Link></li>
              <li><Link href="/salons/location/mpumalanga">Mpumalanga</Link></li>
            </ul>
          </div>

          {/* Explore */}
          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>Explore</h3>
            <ul className={styles.linkList}>
              <li><Link href="/salons">Find Salons</Link></li>
              <li><Link href="/products">Shop Products</Link></li>
              <li><Link href="/promotions">View Deals</Link></li>
              <li><Link href="/talent">Find Jobs</Link></li>
              <li><Link href="/blog">Beauty Blog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>Company</h3>
            <ul className={styles.linkList}>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/prices">Pricing</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/advice">Help & Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className={styles.contactSection}>
          <h3 className={styles.columnTitle}>Get in Touch</h3>
          <div className={styles.contactItems}>
            <a href="mailto:info@stylrsa.co.za" className={styles.contactItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              info@stylrsa.co.za
            </a>
            <div className={styles.contactItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Johannesburg, South Africa
            </div>
            <div className={styles.contactItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Mon - Sun: 08:00 - 17:00
            </div>
          </div>
        </div>
      </div>

      {/* App Announcement */}
      <div className={styles.appBanner}>
        <div className={styles.appBannerContent}>
          <span className={styles.appIcon}>📱</span>
          <div className={styles.appText}>
            <strong>Mobile Apps Coming Soon!</strong>
            <span>Android and iOS apps are in development.</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Stylr SA. All rights reserved.
        </p>
        <div className={styles.legalLinks}>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookie-policy">Cookies</Link>
          <Link href="/accessibility">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
