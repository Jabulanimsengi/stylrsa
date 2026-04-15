import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiMail, FiMapPin } from 'react-icons/fi';
import { FaEnvelope, FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import styles from './Footer.module.css';
import { EXTERNAL_LINKS } from '@/constants/routes';

const featuredAreas = [
  { href: '/salons/location/gauteng', label: 'Gauteng' },
  { href: '/salons/location/western-cape', label: 'Western Cape' },
  { href: '/salons/location/kwazulu-natal', label: 'KwaZulu-Natal' },
  { href: '/salons/location/eastern-cape', label: 'Eastern Cape' },
];

const socialLinks = [
  { href: EXTERNAL_LINKS.FACEBOOK, label: 'Facebook', icon: FaFacebookF },
  { href: EXTERNAL_LINKS.INSTAGRAM, label: 'Instagram', icon: FaInstagram },
  { href: EXTERNAL_LINKS.LINKEDIN, label: 'LinkedIn', icon: FaLinkedinIn },
  { href: 'mailto:support@stylrsa.co.za', label: 'Email', icon: FaEnvelope },
];

export default function Footer() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Stylr SA',
    description: 'Verified salon discovery and direct WhatsApp booking requests for beauty clients and salon owners across South Africa.',
    url: 'https://www.stylrsa.co.za',
    logo: 'https://www.stylrsa.co.za/logo-transparent.png',
    image: 'https://www.stylrsa.co.za/logo-transparent.png',
    telephone: '+27-73-802-1196',
    email: 'support@stylrsa.co.za',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '111 Commissioner Street',
      addressLocality: 'Johannesburg',
      addressRegion: 'Gauteng',
      postalCode: '2001',
      addressCountry: 'ZA',
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
    sameAs: [EXTERNAL_LINKS.FACEBOOK, EXTERNAL_LINKS.INSTAGRAM, EXTERNAL_LINKS.LINKEDIN],
  };

  return (
    <footer className={styles.footer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className={styles.inner}>
        <div className={styles.topGrid}>
          <div className={styles.brandColumn}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src="/logo-transparent.png"
                alt="Stylr SA"
                width={168}
                height={48}
                className={styles.logo}
              />
            </Link>
            <p className={styles.brandText}>
              A clearer South African salon directory for clients who want trusted discovery and salon owners who want direct booking conversations.
            </p>
          </div>

          <div className={styles.infoColumn}>
            <h3 className={styles.columnTitle}>Visit us</h3>
            <div className={styles.infoStack}>
              <p>111 Commissioner Street</p>
              <p>Johannesburg, Gauteng</p>
              <p>South Africa</p>
            </div>
            <a href="mailto:support@stylrsa.co.za" className={styles.contactLink}>
              <FiMail aria-hidden="true" />
              <span>support@stylrsa.co.za</span>
            </a>
            <a href="https://wa.me/27738021196" className={styles.contactLink} target="_blank" rel="noreferrer">
              <FaWhatsapp aria-hidden="true" />
              <span>0738021196</span>
            </a>
          </div>

          <div className={styles.infoColumn}>
            <h3 className={styles.columnTitle}>Working hours</h3>
            <div className={styles.infoStack}>
              <p>Mon - Fri: 08:00 - 17:00</p>
              <p>Saturday: 09:00 - 15:00</p>
              <p>Sunday: Online enquiries only</p>
            </div>
          </div>

          <div className={styles.infoColumn}>
            <h3 className={styles.columnTitle}>Areas we serve</h3>
            <ul className={styles.areaList}>
              {featuredAreas.map((area) => (
                <li key={area.href}>
                  <Link href={area.href}>{area.label}</Link>
                </li>
              ))}
            </ul>
            <Link href="/salons" className={styles.outlineAction}>
              View all salons
            </Link>
          </div>

          <div className={styles.infoColumn}>
            <h3 className={styles.columnTitle}>Follow us</h3>
            <div className={styles.socialGrid}>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className={styles.socialLink}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
                    aria-label={social.label}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.bottomMeta}>
            <span><FiMapPin aria-hidden="true" /> Johannesburg, South Africa</span>
            <span><FiClock aria-hidden="true" /> Support available daily</span>
          </div>
          <div className={styles.legalLinks}>
            <Link href="/about">About</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/prices">Pricing</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
