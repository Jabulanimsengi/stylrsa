import Link from 'next/link';
import Image from 'next/image';
import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiMail,
  FiMapPin,
  FiScissors,
  FiShield,
  FiStar,
} from 'react-icons/fi';
import styles from './Footer.module.css';

const featuredLocations = [
  { href: '/salons/location/gauteng', label: 'Gauteng' },
  { href: '/salons/location/western-cape', label: 'Western Cape' },
  { href: '/salons/location/kwazulu-natal', label: 'KwaZulu-Natal' },
  { href: '/salons/location/eastern-cape', label: 'Eastern Cape' },
];

export default function Footer() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Stylr SA',
    description: 'Your go-to platform for verified salons, barbers, and beauty experts across South Africa',
    url: 'https://www.stylrsa.co.za',
    logo: 'https://www.stylrsa.co.za/logo-white.png',
    image: 'https://www.stylrsa.co.za/logo-white.png',
    telephone: '+27-11-123-4567',
    email: 'info@stylrsa.co.za',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '111 Commissioner Street',
      addressLocality: 'Johannesburg',
      addressRegion: 'Gauteng',
      postalCode: '2001',
      addressCountry: 'ZA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -26.2041,
      longitude: 28.0473,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '17:00',
      },
    ],
    priceRange: 'R',
    areaServed: [
      { '@type': 'State', name: 'Gauteng', containedInPlace: { '@type': 'Country', name: 'South Africa' } },
      { '@type': 'State', name: 'Western Cape', containedInPlace: { '@type': 'Country', name: 'South Africa' } },
      { '@type': 'State', name: 'KwaZulu-Natal', containedInPlace: { '@type': 'Country', name: 'South Africa' } },
      { '@type': 'State', name: 'Eastern Cape', containedInPlace: { '@type': 'Country', name: 'South Africa' } },
      { '@type': 'State', name: 'Free State', containedInPlace: { '@type': 'Country', name: 'South Africa' } },
      { '@type': 'State', name: 'Mpumalanga', containedInPlace: { '@type': 'Country', name: 'South Africa' } },
      { '@type': 'State', name: 'Limpopo', containedInPlace: { '@type': 'Country', name: 'South Africa' } },
      { '@type': 'State', name: 'North West', containedInPlace: { '@type': 'Country', name: 'South Africa' } },
      { '@type': 'State', name: 'Northern Cape', containedInPlace: { '@type': 'Country', name: 'South Africa' } },
    ],
    sameAs: [],
  };

  return (
    <footer className={styles.footer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className={styles.footerContent}>
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
            South Africa&apos;s premier beauty and wellness platform for verified salons, direct booking, and trusted discovery.
          </p>
          <div className={styles.trustBadges}>
            <span className={styles.trustBadge}>
              <FiShield aria-hidden="true" />
              Verified Salons
            </span>
            <span className={styles.trustBadge}>
              <FiCheckCircle aria-hidden="true" />
              Free to Use
            </span>
            <span className={styles.trustBadge}>
              <FiStar aria-hidden="true" />
              Trusted Reviews
            </span>
          </div>
        </div>

        <div className={styles.linksGrid}>
          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>
              <span className={styles.columnIcon}><FiScissors aria-hidden="true" /></span>
              <span>Services</span>
            </h3>
            <ul className={styles.linkList}>
              <li><Link href="/services?category=braiding-weaving">Hair Braiding</Link></li>
              <li><Link href="/services?category=haircuts-styling">Haircuts and Styling</Link></li>
              <li><Link href="/services?category=nail-care">Nail Services</Link></li>
              <li><Link href="/services?category=makeup-beauty">Makeup</Link></li>
              <li><Link href="/services?category=massage-body-treatments">Massage</Link></li>
              <li><Link href="/services?category=mens-grooming">Men&apos;s Grooming</Link></li>
            </ul>
          </div>

          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>
              <span className={styles.columnIcon}><FiMapPin aria-hidden="true" /></span>
              <span>Locations</span>
            </h3>
            <ul className={styles.linkList}>
              {featuredLocations.map((location) => (
                <li key={location.href}><Link href={location.href}>{location.label}</Link></li>
              ))}
              <li><Link href="/salons">See all locations</Link></li>
            </ul>
            <p className={styles.columnNote}>Start with the busiest beauty regions, then expand your search from there.</p>
          </div>

          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>
              <span className={styles.columnIcon}><FiCompass aria-hidden="true" /></span>
              <span>Explore</span>
            </h3>
            <ul className={styles.linkList}>
              <li><Link href="/salons?map=1">Salon Map</Link></li>
              <li><Link href="/promotions">View Deals</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/blog">Beauty Blog</Link></li>
            </ul>
          </div>

          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>
              <span className={styles.columnIcon}><FiBriefcase aria-hidden="true" /></span>
              <span>Company</span>
            </h3>
            <ul className={styles.linkList}>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/prices">Pricing</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/faq">Help and Support</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.contactSection}>
          <h3 className={styles.columnTitle}>Get in Touch</h3>
          <div className={styles.contactItems}>
            <a href="mailto:info@stylrsa.co.za" className={styles.contactItem}>
              <FiMail aria-hidden="true" />
              info@stylrsa.co.za
            </a>
            <div className={styles.contactItem}>
              <FiMapPin aria-hidden="true" />
              Johannesburg, South Africa
            </div>
            <div className={styles.contactItem}>
              <FiClock aria-hidden="true" />
              Mon - Sun: 08:00 - 17:00
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p className={styles.copyright}>
          (c) {new Date().getFullYear()} Stylr SA. All rights reserved.
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
