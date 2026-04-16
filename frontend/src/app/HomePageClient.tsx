'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import styles from './HomePage.module.css';
import { type FilterValues } from '@/components/FilterBar/FilterBar';
import { useEffect, useState, useRef } from 'react';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import ServiceCategoryCircles from '@/components/ServiceCategoryCircles/ServiceCategoryCircles';
import SalonCarouselSection from '@/components/SalonCarouselSection';
import { getSalonUrl } from '@/utils/salonUrl';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import type { Salon } from '@/types';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { applyComputedAvailability } from '@/lib/salonAvailability';
import Accordion from '@/components/Accordion';
import { SALON_LISTING_PRICE } from '@/constants/plans';

type SearchCategorySuggestion = { id: string; title: string; slug: string };
type SearchVenueSuggestion = { id: string; title: string; slug?: string | null; city: string | null };
type SearchServiceSuggestion = { id: string; title: string; salon?: { id?: string; name?: string } };

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

const CLIENT_JOURNEY_STEPS = [
  {
    step: '01',
    title: 'Find the right salon',
    copy: 'Browse categories, featured salons, and providers available now in your area.',
  },
  {
    step: '02',
    title: 'Review the profile properly',
    copy: 'Check services, pricing, gallery images, location, opening times, and linked reviews.',
  },
  {
    step: '03',
    title: 'Send a structured booking request',
    copy: 'Choose a service, pick a time, and send your details in a quick request the salon can understand immediately.',
  },
  {
    step: '04',
    title: 'Confirm on WhatsApp',
    copy: 'The final conversation moves to WhatsApp, making it easy to confirm details and continue the booking fast.',
  },
];

interface HomePageClientProps {
  initialFeaturedSalons: Salon[];
  initialAvailableNowSalons: Salon[];
}

function normalizeSalonList(data: unknown): Salon[] {
  if (Array.isArray(data)) {
    return data as Salon[];
  }

  if (data && typeof data === 'object' && 'salons' in data) {
    const salons = (data as { salons?: unknown }).salons;
    return Array.isArray(salons) ? (salons as Salon[]) : [];
  }

  return [];
}

const LISTING_FEATURES = [
  'Unlimited service listings and gallery images',
  'WhatsApp booking requests sent directly to you',
  'Verified profile presence on Stylr SA',
  'External review links for trust and SEO',
  'Boosted visibility in search and category pages',
  '0% commission on bookings you receive through the platform',
];

const FAQ_ITEMS = [
  {
    title: 'Do clients need an account to book on Stylr SA?',
    content: 'No. Clients can browse salons, choose services, and send a booking request without creating an account. The request is then handed over to the salon on WhatsApp.',
  },
  {
    title: 'How does booking work for salons?',
    content: 'Stylr SA helps clients discover your profile, compare your services, and send a structured booking request. You confirm the booking directly with the client on WhatsApp.',
  },
  {
    title: `How much does it cost to list on Stylr SA?`,
    content: `The current salon listing plan is ${SALON_LISTING_PRICE} per month. It includes service listings, gallery uploads, review links, and direct WhatsApp booking requests.`,
  },
  {
    title: 'Can salons set deposit rules and booking requirements?',
    content: 'Yes. Salon owners can define deposit requirements, payment instructions, cancellation policies, and special booking conditions that are shown before the client continues to WhatsApp.',
  },
  {
    title: 'Does Stylr SA process payments?',
    content: 'Not in the current MVP flow. Stylr SA acts as a discovery and booking facilitation platform, while salons handle payment and final confirmation directly with the client.',
  },
  {
    title: 'Can I add my Google, Fresha, or Booksy reviews?',
    content: 'Yes. Salons can link their external review platforms so clients can verify trust using real third-party reviews instead of internal ratings.',
  },
];


export default function HomePageClient({
  initialFeaturedSalons,
  initialAvailableNowSalons,
}: HomePageClientProps) {
  const router = useRouter();
  const { showPageLoader } = useNavigationLoading();
  usePagePerformance('home');
  const [featuredSalons, setFeaturedSalons] = useState<Salon[]>(initialFeaturedSalons);
  const [availableNowSalons, setAvailableNowSalons] = useState<Salon[]>(initialAvailableNowSalons);
  const [homeSectionsLoading, setHomeSectionsLoading] = useState(false);

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

  useEffect(() => {
    setFeaturedSalons(initialFeaturedSalons);
    setAvailableNowSalons(initialAvailableNowSalons);
    setHomeSectionsLoading(false);
  }, [initialAvailableNowSalons, initialFeaturedSalons]);

  useEffect(() => {
    const needsFallbackHydration =
      initialFeaturedSalons.length === 0 || initialAvailableNowSalons.length === 0;

    if (!needsFallbackHydration) {
      return;
    }

    const controller = new AbortController();
    const shouldShowCoordinatedLoading =
      initialFeaturedSalons.length === 0 && initialAvailableNowSalons.length === 0;

    const hydrateHomeSections = async () => {
      if (shouldShowCoordinatedLoading) {
        setHomeSectionsLoading(true);
      }

      try {
        const [featuredResult, approvedResult] = await Promise.allSettled([
          fetch('/api/salons/featured?limit=12', {
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          }),
          fetch('/api/salons/approved?limit=48', {
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          }),
        ]);

        let nextFeaturedSalons = initialFeaturedSalons;
        let nextAvailableNowSalons = initialAvailableNowSalons;

        if (featuredResult.status === 'fulfilled' && featuredResult.value.ok) {
          const data = await featuredResult.value.json();
          nextFeaturedSalons = applyComputedAvailability(normalizeSalonList(data));
        } else if (featuredResult.status === 'fulfilled') {
          console.error('Featured salons fallback request failed:', featuredResult.value.status);
        } else if (!(featuredResult.reason instanceof Error && featuredResult.reason.name === 'AbortError')) {
          console.error('Failed to hydrate featured salons on homepage:', featuredResult.reason);
        }

        if (approvedResult.status === 'fulfilled' && approvedResult.value.ok) {
          const data = await approvedResult.value.json();
          const approvedSalons = applyComputedAvailability(normalizeSalonList(data));
          nextAvailableNowSalons = approvedSalons
            .filter((salon) => salon.isAvailableNow)
            .slice(0, 12);
        } else if (approvedResult.status === 'fulfilled') {
          console.error('Approved salons fallback request failed:', approvedResult.value.status);
        } else if (!(approvedResult.reason instanceof Error && approvedResult.reason.name === 'AbortError')) {
          console.error('Failed to hydrate approved salons on homepage:', approvedResult.reason);
        }

        setFeaturedSalons(nextFeaturedSalons);
        setAvailableNowSalons(nextAvailableNowSalons);
      } finally {
        setHomeSectionsLoading(false);
      }
    };

    void hydrateHomeSections();

    return () => controller.abort();
  }, [initialAvailableNowSalons, initialFeaturedSalons]);

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
          serviceSuggestions = (data.services || []).map((item: { id?: string; title?: string; salon?: { id?: string; name?: string } }, index: number) => ({
            id: item.id || `suggestion-${index}-${(item.title || 'service').toLowerCase().replace(/\s+/g, '-')}`,
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
              src="/hero_section_image.jpeg"
              alt="Stylr SA hero image"
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
            Find salons worth booking
          </h1>
          <p className={styles.heroDescription}>
            Search by treatment, salon, or area, then send a quick booking request on WhatsApp.
          </p>

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
                placeholder="Search by treatment, salon name, or city..."
                aria-label="Search the salons and spas directory"
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
            <p className={styles.heroAssistNote}>
              Quick booking flow: send your request here, then confirm the final details directly on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.editorialBand} ${styles.categoryBand}`}>
        <div className={styles.categoryIntro}>
          <div className={styles.categoryIntroRow}>
            <div>
              <h2 className={styles.categoryHeading}>Start with the service you want</h2>
              <p className={styles.categoryDescription}>
                Pick a category, then compare salons without wading through extra copy first.
              </p>
            </div>
            <Link href="/salons" className={styles.categoryBrowseLink} onClick={() => showPageLoader()}>
              Browse all salons
            </Link>
          </div>
        </div>
        <ServiceCategoryCircles />
      </section>

      <SalonCarouselSection
        title="Featured Salons"
        description="A rotating selection of standout salons and beauty professionals worth exploring first."
        salons={featuredSalons}
        viewAllLink="/salons"
        showViewAll
        surface="rose"
        loading={homeSectionsLoading}
      />

      <SalonCarouselSection
        title="Available Now"
        description="Profiles currently showing as open and ready for new booking conversations."
        salons={availableNowSalons}
        viewAllLink="/salons?openNow=true"
        showViewAll
        surface="cloud"
        loading={homeSectionsLoading}
      />

      <section className={styles.journeySection}>
        <div className={styles.sectionIntro}>
          <h2 className={styles.sectionHeading}>A lighter booking flow for clients and salons</h2>
          <p className={styles.sectionDescription}>
            Stylr SA keeps the request fast and structured, then hands the conversation to WhatsApp where salons can confirm details quickly.
          </p>
        </div>

        <div className={styles.journeyGrid}>
          {CLIENT_JOURNEY_STEPS.map((item) => (
            <article key={item.step} className={styles.journeyCard}>
              <span className={styles.journeyStep}>{item.step}</span>
              <h3 className={styles.journeyTitle}>{item.title}</h3>
              <p className={styles.journeyCopy}>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.pricingSection}>
        <div className={styles.pricingSectionInner}>
          <div className={styles.pricingHeader}>
            <h2 className={styles.sectionHeading}>Why list your services on Stylr SA</h2>
            <p className={styles.sectionDescription}>
              Build visibility, show your real services and pricing, and receive booking requests directly on WhatsApp without paying commission on each booking.
            </p>
          </div>

          <div className={styles.pricingCard}>
            <span className={styles.pricingBadge}>Stylr SA service listing</span>

            <div className={styles.pricingPriceBlock}>
              <span className={styles.pricingAmount}>{SALON_LISTING_PRICE}</span>
              <span className={styles.pricingPeriod}>/month</span>
            </div>

            <ul className={styles.pricingFeatures}>
              {LISTING_FEATURES.map((feature) => (
                <li key={feature}>
                  <span className={styles.checkIcon}>+</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/create-salon" className={styles.pricingButton} onClick={() => showPageLoader()}>
              List my services on Stylr SA
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqSectionInner}>
          <div className={styles.faqHeader}>
            <h2 className={styles.sectionHeading}>Questions clients and salon owners ask most</h2>
            <p className={styles.sectionDescription}>
              A quick guide to how discovery, bookings, pricing, and salon listings work on Stylr SA.
            </p>
          </div>

          <div className={styles.faqGrid}>
            {FAQ_ITEMS.map((item, index) => (
              <Accordion key={item.title} title={item.title} initialOpen={index === 0}>
                <p>{item.content}</p>
              </Accordion>
            ))}
          </div>
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


