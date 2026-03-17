'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import styles from './HomePage.module.css';
import { type FilterValues } from '@/components/FilterBar/FilterBar';
import { useEffect, useState, useRef } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import ServiceCategoryCircles from '@/components/ServiceCategoryCircles/ServiceCategoryCircles';
import SalonCarouselSection from '@/components/SalonCarouselSection';
import dynamic from 'next/dynamic';
import { getSalonUrl } from '@/utils/salonUrl';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import type { Salon } from '@/types';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';

type SearchCategorySuggestion = { id: string; title: string; slug: string };
type SearchVenueSuggestion = { id: string; title: string; slug?: string | null; city: string | null };
type SearchServiceSuggestion = { id: string; title: string; salon?: { id?: string; name?: string } };
// Disable SSR for TypingAnimation to prevent hydration mismatches and ghost double-rendering
const TypingAnimation = dynamic(() => import('@/components/TypingAnimation/TypingAnimation'), {
  ssr: false,
  // Add an empty placeholder of similar size back so layout doesn't jump
  loading: () => <span style={{ display: 'inline-block', width: '14ch', minHeight: '1.1em' }} />
});
const SEARCHABLE_CATEGORIES = [
  { name: 'Hair', slug: 'haircuts-styling' },
  { name: 'Braids', slug: 'braiding-weaving' },
  { name: 'Nails', slug: 'nail-care' },
  { name: 'Spa', slug: 'massage-body-treatments' },
  { name: 'Makeup', slug: 'makeup-beauty' },
  { name: 'Facials', slug: 'skin-care-facials' },
  { name: 'Barber', slug: 'mens-grooming' },
  { name: 'Waxing', slug: 'waxing-hair-removal' },
  { name: 'Bridal', slug: 'bridal-services' },
  { name: 'Wigs', slug: 'wig-installations' },
  { name: 'Natural Hair', slug: 'natural-hair-specialists' },
  { name: 'Lashes', slug: 'lashes-brows' },
  { name: 'Aesthetics', slug: 'aesthetics-advanced-skin' },
  { name: 'Tattoos', slug: 'tattoos-piercings' },
  { name: 'Wellness', slug: 'wellness-holistic-spa' },
  { name: 'Color', slug: 'hair-color-treatments' },
] as const;

const HERO_TRUST_POINTS = [
  'Verified salons and professionals',
  'Live availability across major cities',
  'Direct booking without extra clutter',
];

const WHY_BOOK_WITH_STYLR = [
  {
    title: 'Verified profiles',
    copy: 'Book with more confidence by browsing salons that show stronger trust signals, clearer service menus, and fuller profiles.',
  },
  {
    title: 'Better discovery',
    copy: 'Filter by treatment, city, availability, and mobile service options without losing your place or starting over.',
  },
  {
    title: 'Cleaner booking flow',
    copy: 'Move from discovery to booking with a clearer next step, less friction, and a smoother salon profile journey.',
  },
];

interface HomePageClientProps {
  initialFeaturedSalons: Salon[];
  initialAvailableNowSalons: Salon[];
}

export default function HomePageClient({
  initialFeaturedSalons,
  initialAvailableNowSalons,
}: HomePageClientProps) {
  const router = useRouter();
  const { showPageLoader } = useNavigationLoading();
  useMediaQuery('(max-width: 768px)');
  usePagePerformance('home');

  // Hero search autocomplete state
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [heroSuggestions, setHeroSuggestions] = useState<{
    categories: SearchCategorySuggestion[];
    venues: SearchVenueSuggestion[];
    services: SearchServiceSuggestion[];
  }>({ categories: [], venues: [], services: [] });
  const [showHeroSuggestions, setShowHeroSuggestions] = useState(false);
  const [isHeroSearching, setIsHeroSearching] = useState(false);
  const heroSearchRef = useRef<HTMLDivElement>(null);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  const navigateWithPageLoader = (href: string) => {
    showPageLoader();
    router.push(href);
  };

  // Hero search autocomplete effect
  useEffect(() => {
    const query = heroSearchQuery.trim().toLowerCase();
    if (query.length < 2) {
      setHeroSuggestions({ categories: [], venues: [], services: [] });
      setShowHeroSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsHeroSearching(true);
      try {
        // Filter matching categories
        const matchingCategories = SEARCHABLE_CATEGORIES
          .filter(cat => cat.name.toLowerCase().includes(query))
          .slice(0, 3)
          .map(cat => ({
            id: `cat-${cat.slug}`,
            title: cat.name,
            slug: cat.slug
          }));

        // Fetch matching venues and services
        const res = await fetch(`/api/services/autocomplete?q=${encodeURIComponent(query)}`, {
          signal: controller.signal
        });

        let venueSuggestions: SearchVenueSuggestion[] = [];
        let serviceSuggestions: SearchServiceSuggestion[] = [];
        if (res.ok) {
          const data = await res.json();
          // Map backend venues to UI venues
          venueSuggestions = (data.venues || []).map((v: Partial<Salon>) => ({
            id: v.id,
            title: v.name || '',
            slug: v.slug,
            city: v.city || null,
          }));

          // Map backend services to UI services
          serviceSuggestions = (data.services || []).map((item: { id?: string; title?: string; salon?: { id?: string; name?: string } }) => ({
            id: item.id || `suggestion-${Math.random()}`,
            title: item.title || '',
            salon: item.salon || undefined,
          })).filter((s: SearchServiceSuggestion) => Boolean(s.title));
        }

        // Combine into the state
        const allSuggestions = {
          categories: matchingCategories,
          venues: venueSuggestions,
          services: serviceSuggestions,
        };

        setHeroSuggestions(allSuggestions);
        setShowHeroSuggestions(
          matchingCategories.length > 0 ||
          venueSuggestions.length > 0 ||
          serviceSuggestions.length > 0
        );
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Autocomplete error:', error);
        }
      } finally {
        setIsHeroSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [heroSearchQuery]);

  const handleSearch = (filters: FilterValues) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        if (value) {
          query.append(key, 'true');
        }
        return;
      }
      if (typeof value === 'number' || (typeof value === 'string' && value.trim().length > 0)) {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();

    const hasServiceQuery = filters.service && filters.service.trim().length > 0;
    const hasCategoryQuery = filters.category && filters.category.trim().length > 0;
    const shouldSearchServices = hasServiceQuery || hasCategoryQuery;

    const targetPath = shouldSearchServices ? '/services' : '/salons';
    navigateWithPageLoader(`${targetPath}${queryString ? `?${queryString}` : ''}`);
  };

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const _unused = isHeroSearching; // Suppress unused variable warning
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return (
    <div className={styles.container}>
      <div className={styles.fixedSearchBar}>
        <MobileSearch onSearch={handleSearch} />
      </div>

      <section className={styles.hero} aria-label="Hero section">
        {/* Background Image */}
        <div className={styles.heroImageWrapper}>
          <div className={styles.heroImageContainer}>
            <OptimizedImage
              src="/art_one.webp"
              alt="Hero background art"
              fill
              eager
              className={styles.heroBackgroundImage}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            />
          </div>
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>Book premium beauty and wellness experiences</span>
          <h1 className={styles.heroTitle} id="hero-title">
            <span className={styles.heroTitleLead}>The hub for</span>
            <span className={styles.heroTitleAnimated}>
              <TypingAnimation
                words={['Hairdressers', 'Nail Techs', 'Barbers', 'Braiders']}
                typingSpeed={175}
                deletingSpeed={80}
                delayBetweenWords={2800}
              />
            </span>
          </h1>
          <p className={styles.heroDescription}>
            Discover verified salons, trusted specialists, and mobile beauty professionals across South Africa in a calmer, more focused booking experience.
          </p>

          <div className={styles.heroSearchContainer}>
            <span className={styles.heroSearchLabel}>Search salons, treatments, and categories</span>
            <div className={styles.heroSearchBox} ref={heroSearchRef}>
              <div className={styles.searchIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="All treatments and venues"
                className={styles.heroSearchInput}
                value={heroSearchQuery}
                onChange={(e) => setHeroSearchQuery(e.target.value)}
                onFocus={() => {
                  const hasSuggestions =
                    heroSuggestions.categories.length > 0 ||
                    heroSuggestions.venues.length > 0 ||
                    heroSuggestions.services.length > 0;
                  if (hasSuggestions) setShowHeroSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowHeroSuggestions(false), 150);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = heroSearchQuery.trim();
                    if (value) {
                      setShowHeroSuggestions(false);
                      navigateWithPageLoader(`/salons?service=${encodeURIComponent(value)}`);
                    }
                  }
                }}
              />
              <button
                className={styles.heroSearchButton}
                onClick={() => {
                  const value = heroSearchQuery.trim();
                  setShowHeroSuggestions(false);
                  if (value) {
                    navigateWithPageLoader(`/salons?service=${encodeURIComponent(value)}`);
                  } else {
                    navigateWithPageLoader('/salons');
                  }
                }}
              >
                Search
              </button>

              {/* Autocomplete Dropdown */}
              {showHeroSuggestions && (
                <div className={styles.heroSuggestionsList}>

                  {/* Venues Section */}
                  {heroSuggestions.venues.length > 0 && (
                    <div className={styles.suggestionGroup}>
                      <div className={styles.suggestionGroupTitle}>Venues</div>
                      <ul className={styles.suggestionGroupList}>
                        {heroSuggestions.venues.map((venue) => (
                          <li
                            key={venue.id}
                            className={styles.heroSuggestionItem}
                            data-testid={`hero-venue-${venue.id}`}
                            data-url={getSalonUrl(venue)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setShowHeroSuggestions(false);
                              navigateWithPageLoader(getSalonUrl(venue));
                            }}
                          >
                            <span className={styles.suggestionIcon}>🏠</span>
                            <div className={styles.suggestionTextWrapper}>
                              <span className={styles.heroSuggestionTitle}>{venue.title}</span>
                              {venue.city && <span className={styles.suggestionSubtitle}> • {venue.city}</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Treatments Section */}
                  {heroSuggestions.services.length > 0 && (
                    <div className={styles.suggestionGroup}>
                      <div className={styles.suggestionGroupTitle}>Treatments</div>
                      <ul className={styles.suggestionGroupList}>
                        {heroSuggestions.services.map((service) => (
                          <li
                            key={service.id}
                            className={styles.heroSuggestionItem}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setHeroSearchQuery(service.title);
                              setShowHeroSuggestions(false);
                              navigateWithPageLoader(`/salons?service=${encodeURIComponent(service.title)}`);
                            }}
                          >
                            <span className={styles.suggestionIcon}>✨</span>
                            <span className={styles.heroSuggestionTitle}>{service.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Categories Section */}
                  {heroSuggestions.categories.length > 0 && (
                    <div className={styles.suggestionGroup}>
                      <div className={styles.suggestionGroupTitle}>Categories</div>
                      <ul className={styles.suggestionGroupList}>
                        {heroSuggestions.categories.map((category) => (
                          <li
                            key={category.id}
                            className={`${styles.heroSuggestionItem} ${styles.categorySuggestion}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setHeroSearchQuery(category.title);
                              setShowHeroSuggestions(false);
                              navigateWithPageLoader(`/salons?category=${category.slug}`);
                            }}
                          >
                            <span className={styles.suggestionIcon}>🔍</span>
                            <span className={styles.heroSuggestionTitle}>{category.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.heroTrustStrip} aria-label="Why users choose Stylr SA">
        <div className={styles.heroTrustStripInner}>
          {HERO_TRUST_POINTS.map((point) => (
            <span key={point} className={styles.heroTrustPill}>{point}</span>
          ))}
        </div>
      </section>

      <section className={styles.editorialBand}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Browse by category</span>
          <h2 className={styles.sectionHeading}>Start with the treatment you already know you want.</h2>
          <p className={styles.sectionDescription}>
            Choose a treatment first and jump straight into salons that match what you already have in mind.
          </p>
        </div>
        <ServiceCategoryCircles />
      </section>

      <SalonCarouselSection
        title="Featured Salons"
        eyebrow="Admin ranked"
        description="All approved salons, ordered by the featured ranking weight managed by admin so the strongest placements appear first."
        salons={initialFeaturedSalons}
        viewAllLink="/salons"
        showViewAll
      />

      <SalonCarouselSection
        title="Available Now"
        eyebrow="Open right now"
        description="For users who want speed, these salons are currently available and ready to be explored without extra steps."
        salons={initialAvailableNowSalons}
        viewAllLink="/salons?openNow=true"
        showViewAll
        surface="muted"
      />

      <section className={`${styles.editorialBand} ${styles.mutedBand}`}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Why book with Stylr SA</span>
          <h2 className={styles.sectionHeading}>A cleaner, calmer way to discover and book beauty services.</h2>
          <p className={styles.sectionDescription}>
            Discover trusted salons faster, compare them more clearly, and book with more confidence from the start.
          </p>
        </div>

        <div className={styles.valueGrid}>
          {WHY_BOOK_WITH_STYLR.map((item) => (
            <article key={item.title} className={styles.valueCard}>
              <h3 className={styles.valueTitle}>{item.title}</h3>
              <p className={styles.valueCopy}>{item.copy}</p>
            </article>
          ))}
        </div>

        <div className={styles.whyBookCta}>
          <Link href="/salons" className={styles.whyBookLink} onClick={() => showPageLoader()}>
            Explore all salons
          </Link>
        </div>
      </section>

      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Stylr SA',
            alternateName: 'StylrSA',
            url: siteUrl,
            logo: `${siteUrl}/logo-transparent.png`,
            description: 'South Africa\'s premier destination for luxury beauty & wellness. Book appointments at top-rated premium salons, medical spas, beauty clinics & expert wellness professionals.',
            sameAs: [
              'https://www.facebook.com/stylrsa',
              'https://www.instagram.com/stylrsa',
              'https://twitter.com/stylrsa',
              'https://www.linkedin.com/company/stylrsa',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Service',
              availableLanguage: ['English', 'Afrikaans'],
              areaServed: 'ZA',
            },
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'ZA',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '1250',
              bestRating: '5',
              worstRating: '1',
            },
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'ZAR',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />
    </div>
  );
}
