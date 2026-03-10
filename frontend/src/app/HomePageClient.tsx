'use client';

import { useRouter } from 'next/navigation';
import Script from 'next/script';
import styles from './HomePage.module.css';
import { type FilterValues } from '@/components/FilterBar/FilterBar';
import { useEffect, useState, useRef } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import FeaturedSalons from '@/components/FeaturedSalons';
import ServiceCategoryCircles from '@/components/ServiceCategoryCircles/ServiceCategoryCircles';
import SalonCarouselSection from '@/components/SalonCarouselSection';
import dynamic from 'next/dynamic';
import { getSalonUrl } from '@/utils/salonUrl';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import type { Salon } from '@/types';

type SearchCategorySuggestion = { id: string; title: string; slug: string };
type SearchVenueSuggestion = { id: string; title: string; slug?: string | null; city: string | null };
type SearchServiceSuggestion = { id: string; title: string; salon?: { id?: string; name?: string } };
// Disable SSR for TypingAnimation to prevent hydration mismatches and ghost double-rendering
const TypingAnimation = dynamic(() => import('@/components/TypingAnimation/TypingAnimation'), {
  ssr: false,
  // Add an empty placeholder of similar size back so layout doesn't jump
  loading: () => <span style={{ display: 'inline-block', minWidth: '9em' }}></span>
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

interface HomePageClientProps {
  initialFeaturedSalons: Salon[];
  initialAllSalons: Salon[];
  initialAvailableNowSalons: Salon[];
  initialMobileSalons: Salon[];
}

export default function HomePageClient({
  initialFeaturedSalons,
  initialAllSalons,
  initialAvailableNowSalons,
  initialMobileSalons,
}: HomePageClientProps) {
  const router = useRouter();
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
    router.push(`${targetPath}${queryString ? `?${queryString}` : ''}`);
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
          <h1 className={styles.heroTitle} id="hero-title">
            The hub for&nbsp;
            <TypingAnimation
              words={['Hairdressers', 'Nail Techs', 'Barbers', 'Makeup Artists', 'Braiders', 'Estheticians']}
              typingSpeed={200}
              deletingSpeed={100}
              delayBetweenWords={2500}
            />
          </h1>

          <div className={styles.heroSearchContainer}>
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
                      router.push(`/salons?service=${encodeURIComponent(value)}`);
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
                    router.push(`/salons?service=${encodeURIComponent(value)}`);
                  } else {
                    router.push('/salons');
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
                              router.push(getSalonUrl(venue));
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
                              router.push(`/salons?service=${encodeURIComponent(service.title)}`);
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
                              router.push(`/salons?category=${category.slug}`);
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


      {/* Service Category Circles - Quick navigation */}
      <ServiceCategoryCircles />

      {/* 1. Recommended Section - Trust building (personalized) */}
      <FeaturedSalons initialSalons={initialFeaturedSalons} />

      {/* 2. Featured Salons Section - All salons */}
      <SalonCarouselSection
        title="Featured Salons"
        salons={initialAllSalons}
        viewAllLink="/salons"
        showViewAll={false}
      />

      {/* 3. Available Now Section - Salons currently open */}
      <SalonCarouselSection
        title="Available Now"
        salons={initialAvailableNowSalons}
        viewAllLink="/salons?openNow=true"
        showViewAll={false}
      />

      {/* 4. Mobile Salons Section - Salons offering mobile services */}
      <SalonCarouselSection
        title="Mobile Salons"
        salons={initialMobileSalons}
        viewAllLink="/salons?offersMobile=true"
        showViewAll={false}
      />

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
