// frontend/src/app/salons/SalonsPageClient.tsx
'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { transformCloudinary } from '@/utils/cloudinary';
import { Salon } from '@/types';
import styles from './SalonsPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import FilterBar, { type FilterValues } from '@/components/FilterBar/FilterBar';
import { useAuth } from '@/hooks/useAuth';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getImageWithFallback } from '@/lib/placeholders';
import PageNav from '@/components/PageNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ReviewBadge from '@/components/ReviewBadge/ReviewBadge';
import { useGeolocation } from '@/hooks/useGeolocation';
import EmptyState from '@/components/EmptyState/EmptyState';
import { getSalonUrl } from '@/utils/salonUrl';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import { notify } from '@/lib/notify';
import { SalonsPageSkeleton } from '@/components/Skeleton/ServicesPageSkeleton';
import { applyGuestFavoritesToSalons, toggleGuestFavoriteSalon } from '@/lib/guestFavorites';

type SalonWithFavorite = Salon & { isFavorited?: boolean };
type SalonPageFilters = Partial<FilterValues> & { q?: string; lat?: string | null; lon?: string | null };

interface ProvinceGroup {
  province: string;
  salons: SalonWithFavorite[];
}

function ProvinceRow({
  province,
  salons,
  onToggleFavorite,
  onNavigate,
  navigatingSalonId,
  isMobile,
  showViewAll = true,
}: {
  province: string;
  salons: SalonWithFavorite[];
  onToggleFavorite: (event: React.MouseEvent, salonId: string) => void;
  onNavigate: (salon: SalonWithFavorite) => void;
  navigatingSalonId: string | null;
  isMobile: boolean;
  showViewAll?: boolean;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [checkScrollButtons, salons]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const cardWidth = isMobile ? 160 : 280;
    container.scrollBy({
      left: direction === 'left' ? -(cardWidth * 2) : cardWidth * 2,
      behavior: 'smooth',
    });
  };

  return (
    <section className={styles.provinceSection}>
      <div className={styles.provinceHeader}>
        <h2 className={styles.provinceTitle}>
          {province}
          <span className={styles.salonCount}>
            ({salons.length} {salons.length === 1 ? 'salon' : 'salons'})
          </span>
        </h2>
        {showViewAll && province && (
          <Link href={`/salons?province=${encodeURIComponent(province)}`} className={styles.viewAllLink}>
            View all
          </Link>
        )}
      </div>

      <div className={styles.scrollWrapper}>
        {!isMobile && canScrollLeft && (
          <button
            className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <FaChevronLeft />
          </button>
        )}

        <div ref={scrollContainerRef} className={styles.horizontalScroll}>
          {salons.map((salon) => {
            const isNavigating = navigatingSalonId === salon.id;

            return (
              <div
                key={salon.id}
                className={`${styles.salonCard} ${isNavigating ? styles.navigating : ''}`}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest('button')) {
                    return;
                  }
                  onNavigate(salon);
                }}
              >
                {isNavigating && (
                  <div className={styles.cardLoadingOverlay}>
                    <LoadingSpinner size="md" color="white" />
                  </div>
                )}
                <button
                  onClick={(event) => onToggleFavorite(event, salon.id)}
                  className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
                  aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FaHeart />
                </button>
                <div className={styles.salonLink}>
                  <div className={styles.imageWrapper}>
                    <ReviewBadge
                      reviewCount={salon.reviews?.length || 0}
                      avgRating={salon.avgRating || 0}
                    />
                    <OptimizedImage
                      src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), {
                        width: 600,
                        quality: 'auto',
                        format: 'auto',
                        crop: 'fill',
                      })}
                      alt={`A photo of ${salon.name}`}
                      className={styles.cardImage}
                      fill
                      sizes="(max-width: 768px) 160px, 280px"
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{salon.name}</h3>
                    <p className={styles.cardLocation}>
                      {salon.city}, {salon.province}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!isMobile && canScrollRight && (
          <button
            className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </section>
  );
}

function buildFilterChips(filters: SalonPageFilters): string[] {
  const chips: string[] = [];

  if (filters.service) chips.push(filters.service);
  if (filters.category) chips.push(filters.category);
  if (filters.city) chips.push(filters.city);
  if (filters.province) chips.push(filters.province);
  if (filters.openNow) chips.push('Open now');
  if (filters.offersMobile) chips.push('Mobile service');
  if (filters.sortBy === 'top_rated') chips.push('Top rated');
  if (filters.sortBy === 'distance') {
    chips.push(filters.radius ? `Within ${filters.radius} km` : 'Nearest');
  }
  if (filters.priceMin || filters.priceMax) {
    chips.push(`Price: R${filters.priceMin || '0'} - R${filters.priceMax || 'Any'}`);
  }

  return chips;
}

export default function SalonsPageClient() {
  usePagePerformance('salons_list');

  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [navigatingSalonId, setNavigatingSalonId] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<SalonPageFilters>({
    province: '',
    city: '',
    service: '',
    category: '',
    q: '',
    offersMobile: false,
    sortBy: '',
    openNow: false,
    priceMin: '',
    priceMax: '',
    lat: null,
    lon: null,
    radius: null,
  });

  const lastAppliedFiltersRef = useRef('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus } = useAuth();

  const geoState = useGeolocation(true);
  const { coordinates, error: geoError, source: locationSource } = geoState;

  const getDefaultFilters = useCallback((): SalonPageFilters => {
    const lat = coordinates?.latitude ? String(coordinates.latitude) : null;
    const lon = coordinates?.longitude ? String(coordinates.longitude) : null;

    return {
      province: '',
      city: '',
      service: '',
      category: '',
      q: '',
      offersMobile: false,
      sortBy: lat && lon ? 'distance' : '',
      openNow: false,
      priceMin: '',
      priceMax: '',
      lat,
      lon,
      radius: null,
    };
  }, [coordinates]);

  const getInitialFilters = useCallback((): SalonPageFilters => {
    const params = new URLSearchParams(searchParams.toString());
    const defaults = getDefaultFilters();
    const urlLat = params.get('lat');
    const urlLon = params.get('lon');
    const lat = urlLat || defaults.lat || null;
    const lon = urlLon || defaults.lon || null;

    return {
      ...defaults,
      province: params.get('province') || '',
      city: params.get('city') || '',
      service: params.get('service') || '',
      category: params.get('category') || '',
      q: params.get('q') || '',
      offersMobile: params.get('offersMobile') === 'true',
      sortBy: params.get('sortBy') || ((lat && lon) ? 'distance' : ''),
      openNow: params.get('openNow') === 'true',
      priceMin: params.get('priceMin') || '',
      priceMax: params.get('priceMax') || '',
      lat,
      lon,
      radius: params.get('radius') ? Number(params.get('radius')) : null,
    };
  }, [getDefaultFilters, searchParams]);

  const provinceGroups = useMemo((): ProvinceGroup[] => {
    const groups: Record<string, SalonWithFavorite[]> = {};

    salons.forEach((salon) => {
      const province = salon.province || 'Other';
      if (!groups[province]) {
        groups[province] = [];
      }
      groups[province].push(salon);
    });

    return Object.entries(groups)
      .map(([province, salonList]) => ({ province, salons: salonList }))
      .filter((group) => group.salons.length > 0)
      .sort((a, b) => b.salons.length - a.salons.length);
  }, [salons]);

  const fetchSalons = useCallback(
    async (filters: Partial<FilterValues> & { q?: string; lat?: number | string | null; lon?: number | string | null }) => {
      setIsLoading(true);
      const query = new URLSearchParams();

      let url = '/api/salons/approved';
      if (filters.province) query.append('province', filters.province);
      if (filters.city) query.append('city', filters.city);
      if (filters.service) query.append('service', filters.service);
      if (filters.category) query.append('category', filters.category);
      if (filters.q) query.append('q', filters.q);
      if (filters.offersMobile) query.append('offersMobile', 'true');
      if (filters.sortBy) query.append('sortBy', filters.sortBy);
      if (filters.openNow) query.append('openNow', 'true');
      if (filters.priceMin) query.append('priceMin', String(filters.priceMin));
      if (filters.priceMax) query.append('priceMax', String(filters.priceMax));
      if (filters.sortBy === 'distance' && filters.lat && filters.lon) {
        query.append('lat', String(filters.lat));
        query.append('lon', String(filters.lon));
        if (filters.radius) {
          query.append('radius', String(filters.radius));
        }
      }

      const queryString = query.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      try {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Failed to fetch salons');
        }
        const data = await res.json();
        setSalons(authStatus === 'authenticated' ? data : applyGuestFavoritesToSalons(data));
      } catch (error) {
        logger.error('Failed to fetch salons:', error);
        notify.error(toFriendlyMessage(error, 'Failed to load salons. Please try again.'));
        setSalons([]);
      } finally {
        setIsLoading(false);
      }
    },
    [authStatus],
  );

  const syncFiltersToUrl = useCallback(
    (filters: SalonPageFilters) => {
      const params = new URLSearchParams();

      if (filters.province) params.set('province', filters.province);
      if (filters.city) params.set('city', filters.city);
      if (filters.service) params.set('service', filters.service);
      if (filters.category) params.set('category', filters.category);
      if (filters.q) params.set('q', filters.q);
      if (filters.offersMobile) params.set('offersMobile', 'true');
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.openNow) params.set('openNow', 'true');
      if (filters.priceMin) params.set('priceMin', filters.priceMin);
      if (filters.priceMax) params.set('priceMax', filters.priceMax);

      if (filters.sortBy === 'distance' && filters.lat && filters.lon) {
        params.set('lat', String(filters.lat));
        params.set('lon', String(filters.lon));
        if (filters.radius) {
          params.set('radius', String(filters.radius));
        }
      }

      const queryString = params.toString();
      router.replace(queryString ? `/salons?${queryString}` : '/salons', { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    const nextFilters = getInitialFilters();
    const serialized = JSON.stringify(nextFilters);

    if (serialized === lastAppliedFiltersRef.current) {
      return;
    }

    lastAppliedFiltersRef.current = serialized;
    setCurrentFilters(nextFilters);
    fetchSalons(nextFilters);
  }, [authStatus, fetchSalons, getInitialFilters]);

  useEffect(() => {
    if (coordinates && !searchParams.get('lat')) {
      notify.info(
        locationSource === 'ip'
          ? 'Showing salons near your estimated location'
          : 'Showing salons near your location',
        { autoClose: 3000 },
      );
    }
  }, [coordinates, searchParams, locationSource]);

  useEffect(() => {
    if (geoError) {
      logger.debug('Geolocation error:', geoError);
      if (!geoError.includes('denied')) {
        notify.warning('Unable to get your location. Showing all salons instead.');
      }
    }
  }, [geoError]);

  useEffect(() => {
    const handleSalonUpdate = () => {
      setTimeout(() => {
        const nextFilters = getInitialFilters();
        lastAppliedFiltersRef.current = JSON.stringify(nextFilters);
        setCurrentFilters(nextFilters);
        fetchSalons(nextFilters);
      }, 500);
    };

    window.addEventListener('salon-updated', handleSalonUpdate);
    return () => window.removeEventListener('salon-updated', handleSalonUpdate);
  }, [fetchSalons, getInitialFilters]);

  const handleSearch = useCallback(
    (filters: FilterValues) => {
      const nextFilters: SalonPageFilters = {
        ...filters,
        q: currentFilters.q || '',
        lat: filters.lat != null ? String(filters.lat) : null,
        lon: filters.lon != null ? String(filters.lon) : null,
      };

      const serialized = JSON.stringify(nextFilters);
      lastAppliedFiltersRef.current = serialized;
      setCurrentFilters(nextFilters);
      syncFiltersToUrl(nextFilters);
      fetchSalons(nextFilters);
    },
    [currentFilters.q, fetchSalons, syncFiltersToUrl],
  );

  const handleResetFilters = useCallback(() => {
    const nextFilters = getDefaultFilters();
    const serialized = JSON.stringify(nextFilters);
    lastAppliedFiltersRef.current = serialized;
    setCurrentFilters(nextFilters);
    syncFiltersToUrl(nextFilters);
    fetchSalons(nextFilters);
  }, [fetchSalons, getDefaultFilters, syncFiltersToUrl]);

  const handleToggleFavorite = async (event: React.MouseEvent, salonId: string) => {
    event.preventDefault();
    event.stopPropagation();

    if (authStatus !== 'authenticated') {
      const salon = salons.find((item) => item.id === salonId);
      if (!salon) {
        return;
      }

      const { favorited } = toggleGuestFavoriteSalon(salon);
      setSalons((prevSalons) =>
        prevSalons.map((item) =>
          item.id === salonId ? { ...item, isFavorited: favorited } : item,
        ),
      );
      notify.success(favorited ? 'Saved to favorites on this device.' : 'Removed from saved salons.');
      return;
    }

    const originalSalons = salons;
    setSalons((prevSalons) =>
      prevSalons.map((salon) =>
        salon.id === salonId ? { ...salon, isFavorited: !salon.isFavorited } : salon,
      ),
    );

    try {
      const res = await fetch(`/api/favorites/toggle/${salonId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to update favorite status.');
      }

      const { favorited } = await res.json();
      notify.success(favorited ? 'Added to favorites!' : 'Removed from favorites.');
    } catch {
      notify.error('Could not update favorites. Please try again.');
      setSalons(originalSalons);
    }
  };

  const handleNavigate = (salon: SalonWithFavorite) => {
    const salonUrl = getSalonUrl(salon);
    setNavigatingSalonId(salon.id);
    router.push(salonUrl);
    setTimeout(() => setNavigatingSalonId(null), 5000);
  };

  const activeFilterChips = useMemo(() => buildFilterChips(currentFilters), [currentFilters]);
  const hasActiveFilters = activeFilterChips.length > 0 || Boolean(currentFilters.q);
  const hasLocationFilter = Boolean(currentFilters.city || currentFilters.province);
  const shouldShowProvinceBrowse = !hasActiveFilters && !isMobile && provinceGroups.length > 1;

  const pageTitle = currentFilters.service
    ? `${currentFilters.service} salons`
    : currentFilters.offersMobile
      ? 'Mobile salons near you'
      : 'Find your next salon';

  const resultHeadline = currentFilters.city
    ? `${salons.length} salons in ${currentFilters.city}`
    : currentFilters.province
      ? `${salons.length} salons in ${currentFilters.province}`
      : `${salons.length} salons ready to book`;

  const resultCopy = currentFilters.sortBy === 'distance'
    ? 'Results are ranked to keep nearby options easy to compare.'
    : hasLocationFilter
      ? 'Use filters to narrow by service, location, and price without losing your place.'
      : 'Browse the strongest matches first, then dip into province browsing if you want to explore wider.'
  ;

  const discoverySignals = [
    {
      label: 'Search mode',
      value: currentFilters.sortBy === 'distance' ? 'Nearby first' : 'Best-match ranking',
      detail: currentFilters.sortBy === 'distance'
        ? 'Location-aware sorting keeps closer salons easier to compare.'
        : 'Browse the strongest overall matches before drilling down.',
    },
    {
      label: 'Coverage',
      value: currentFilters.province || currentFilters.city || 'Across South Africa',
      detail: hasLocationFilter
        ? 'Your current filter set is already narrowed by location.'
        : 'You can zoom into a province or city whenever you are ready.',
    },
    {
      label: 'Booking style',
      value: currentFilters.offersMobile ? 'Mobile salons included' : 'In-salon and mobile',
      detail: currentFilters.offersMobile
        ? 'Only salons that can travel to the client are being prioritised.'
        : 'Filter for mobile appointments if convenience is the priority.',
    },
  ];

  return (
    <div className={styles.container}>
      <PageNav />

      <section className={styles.discoveryIntro}>
        <div className={styles.discoveryShell}>
          <div className={styles.discoveryHero}>
            <div className={styles.discoveryCopyBlock}>
              <p className={styles.discoveryEyebrow}>Salon discovery</p>
              <h1 className={styles.title}>{pageTitle}</h1>
              <p className={styles.discoveryLead}>
                Search by service, narrow by location, and compare salons in one ranked view.
              </p>
            </div>

            <div className={styles.discoverySignalGrid}>
              {discoverySignals.map((signal) => (
                <article key={signal.label} className={styles.discoverySignalCard}>
                  <p className={styles.discoverySignalLabel}>{signal.label}</p>
                  <strong className={styles.discoverySignalValue}>{signal.value}</strong>
                  <p className={styles.discoverySignalDetail}>{signal.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <FilterBar
            onSearch={handleSearch}
            initialFilters={currentFilters}
            showSearchButton={!isMobile}
            isSearching={isLoading}
          />
        </div>
      </section>

      {isLoading ? (
        salons.length === 0 ? (
          <SalonsPageSkeleton />
        ) : (
          <div className={styles.loadingState}>
            <LoadingSpinner />
          </div>
        )
      ) : salons.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No salons matched this search"
          description="Try a broader service, remove a location filter, or reset back to nearby results."
        />
      ) : (
        <>
          <section className={styles.resultsHeader}>
            <div className={styles.resultsHeaderTop}>
              <div>
                <p className={styles.resultsEyebrow}>Results</p>
                <h2 className={styles.resultsSummary}>{resultHeadline}</h2>
                <p className={styles.resultsCopy}>{resultCopy}</p>
              </div>
              {hasActiveFilters && (
                <button type="button" className={styles.clearFiltersButton} onClick={handleResetFilters}>
                  Clear filters
                </button>
              )}
            </div>
            {activeFilterChips.length > 0 && (
              <div className={styles.filterChips}>
                {activeFilterChips.map((chip) => (
                  <span key={chip} className={styles.filterChip}>
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </section>

          <div className={styles.salonGrid}>
            {salons.map((salon) => {
              const isNavigating = navigatingSalonId === salon.id;
              const bookingLabel = salon.offersMobile || salon.bookingType === 'MOBILE' || salon.bookingType === 'BOTH'
                ? 'Mobile available'
                : 'In-salon bookings';
              const serviceCount = salon.services?.length;

              return (
                <div
                  key={salon.id}
                  className={`${styles.salonCard} ${styles.gridCard} ${isNavigating ? styles.navigating : ''}`}
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest('button')) {
                      return;
                    }
                    handleNavigate(salon);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {isNavigating && (
                    <div className={styles.cardLoadingOverlay}>
                      <LoadingSpinner size="md" color="white" />
                    </div>
                  )}

                  <button
                    onClick={(event) => handleToggleFavorite(event, salon.id)}
                    className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
                    aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <FaHeart />
                  </button>

                  <div className={styles.salonLink}>
                    <div className={styles.imageWrapper}>
                      <ReviewBadge
                        reviewCount={salon.reviews?.length || 0}
                        avgRating={salon.avgRating || 0}
                      />
                      <OptimizedImage
                        src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), {
                          width: 600,
                          quality: 'auto',
                          format: 'auto',
                          crop: 'fill',
                        })}
                        alt={`A photo of ${salon.name}`}
                        className={styles.cardImage}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>

                    <div className={styles.cardContent}>
                      <h2 className={styles.cardTitle}>{salon.name}</h2>
                      <p className={styles.cardLocation}>
                        {salon.city}, {salon.province}
                      </p>

                      <div className={styles.cardMetaRow}>
                        <span className={styles.cardMetaPill}>{bookingLabel}</span>
                        {typeof salon.distance === 'number' && (
                          <span className={styles.cardMetaPill}>{salon.distance.toFixed(1)} km away</span>
                        )}
                        {serviceCount ? (
                          <span className={styles.cardMetaPill}>{serviceCount} services</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {shouldShowProvinceBrowse && (
            <section className={styles.secondaryBrowse}>
              <div className={styles.secondaryBrowseHeader}>
                <div>
                  <p className={styles.resultsEyebrow}>Browse wider</p>
                  <h2 className={styles.resultsSummary}>Explore by province</h2>
                  <p className={styles.resultsCopy}>
                    If you want to window-shop beyond your current results, these regional collections are still here.
                  </p>
                </div>
              </div>
              <div className={styles.provinceGroupsContainer}>
                {provinceGroups.slice(0, 4).map((group) => (
                  <ProvinceRow
                    key={group.province}
                    province={group.province}
                    salons={group.salons}
                    onToggleFavorite={handleToggleFavorite}
                    onNavigate={handleNavigate}
                    navigatingSalonId={navigatingSalonId}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
