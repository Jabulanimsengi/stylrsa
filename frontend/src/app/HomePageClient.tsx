'use client';

import Image from 'next/image';
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
import TypingAnimation from '@/components/TypingAnimation/TypingAnimation';

const HERO_IMAGE = {
  src: '/art_one.webp',
  alt: 'Professional hair styling and beauty services at South African salons',
  // Preload hint for LCP optimization
  blurDataURL: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
};

interface HomePageClientProps {
  initialFeaturedSalons: any[];
  initialAllSalons: any[];
  initialAvailableNowSalons: any[];
  initialMobileSalons: any[];
}

// Value proposition phrases for typewriter animation
const VALUE_PROP_PHRASES = [
  "Your style destination",
  "Your confidence boost",
  "Your transformation hub",
  "Your beauty sanctuary",
  "Your wellness escape",
  "Your self-care moment"
];

export default function HomePageClient({
  initialFeaturedSalons,
  initialAllSalons,
  initialAvailableNowSalons,
  initialMobileSalons,
}: HomePageClientProps) {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Hero search autocomplete state
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [heroSuggestions, setHeroSuggestions] = useState<{ id: string; title: string; salon?: string; type: 'service' | 'category'; slug?: string }[]>([]);
  const [showHeroSuggestions, setShowHeroSuggestions] = useState(false);
  const [isHeroSearching, setIsHeroSearching] = useState(false);
  const heroSearchRef = useRef<HTMLDivElement>(null);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

  // Categories for search autocomplete
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
  ];

  // Hero search autocomplete effect
  useEffect(() => {
    const query = heroSearchQuery.trim().toLowerCase();
    if (query.length < 2) {
      setHeroSuggestions([]);
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
            type: 'category' as const,
            slug: cat.slug
          }));

        // Fetch matching services
        const res = await fetch(`/api/services/autocomplete?q=${encodeURIComponent(query)}`, {
          signal: controller.signal
        });

        let serviceSuggestions: typeof heroSuggestions = [];
        if (res.ok) {
          const data = await res.json();
          serviceSuggestions = (data || []).slice(0, 5).map((item: any) => ({
            id: item.id || `suggestion-${Math.random()}`,
            title: item.title || '',
            salon: item.salon?.name || item.salonName || undefined,
            type: 'service' as const
          })).filter((s: any) => s.title);
        }

        // Combine categories first, then services
        const allSuggestions = [...matchingCategories, ...serviceSuggestions];
        setHeroSuggestions(allSuggestions);
        setShowHeroSuggestions(allSuggestions.length > 0);
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
            <Image
              src="/art_one.webp"
              alt="Hero background art"
              fill
              priority
              quality={85}
              className={styles.heroBackgroundImage}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA="
            />
          </div>
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle} id="hero-title">
            <TypingAnimation
              words={VALUE_PROP_PHRASES}
              typingSpeed={80}
              deletingSpeed={50}
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
                  if (heroSuggestions.length > 0) setShowHeroSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowHeroSuggestions(false), 150);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = heroSearchQuery.trim();
                    if (value) {
                      setShowHeroSuggestions(false);
                      router.push(`/services?service=${encodeURIComponent(value)}`);
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
                    router.push(`/services?service=${encodeURIComponent(value)}`);
                  } else {
                    router.push('/services');
                  }
                }}
              >
                Search
              </button>

              {/* Autocomplete Dropdown */}
              {showHeroSuggestions && heroSuggestions.length > 0 && (
                <ul className={styles.heroSuggestionsList}>
                  {heroSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      className={`${styles.heroSuggestionItem} ${suggestion.type === 'category' ? styles.categorySuggestion : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setHeroSearchQuery(suggestion.title);
                        setShowHeroSuggestions(false);
                        if (suggestion.type === 'category' && suggestion.slug) {
                          router.push(`/services?category=${suggestion.slug}`);
                        } else {
                          router.push(`/services?service=${encodeURIComponent(suggestion.title)}`);
                        }
                      }}
                    >
                      <span className={styles.heroSuggestionTitle}>{suggestion.title}</span>
                      {suggestion.type === 'category' && (
                        <span className={styles.categoryBadge}>Category</span>
                      )}
                    </li>
                  ))}
                </ul>
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
