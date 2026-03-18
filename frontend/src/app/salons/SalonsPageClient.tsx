// frontend/src/app/salons/SalonsPageClient.tsx
'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Salon } from '@/types';
import styles from './SalonsPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { FaChevronLeft, FaChevronRight, FaSlidersH } from 'react-icons/fa';
import { type FilterValues } from '@/components/FilterBar/FilterBar';
import { useAuth } from '@/hooks/useAuth';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useGeolocation } from '@/hooks/useGeolocation';
import EmptyState from '@/components/EmptyState/EmptyState';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import { notify } from '@/lib/notify';
import { SalonsPageSkeleton } from '@/components/Skeleton/ServicesPageSkeleton';
import { applyGuestFavoritesToSalons, toggleGuestFavoriteSalon } from '@/lib/guestFavorites';
import MobileFilter from '@/components/MobileSearch/MobileFilter';
import SalonCard from '@/components/SalonCard';

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
  isMobile,
  showViewAll = true,
}: {
  province: string;
  salons: SalonWithFavorite[];
  onToggleFavorite: (event: React.MouseEvent, salonId: string) => void;
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
          {salons.map((salon) => (
            <div key={salon.id} className={styles.scrollCard}>
              <SalonCard
                salon={salon}
                compact
                showFavorite
                showPrice={false}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
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

export default function SalonsPageClient() {
  usePagePerformance('salons_list');

  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
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

  const hasActiveFilters = Boolean(
    currentFilters.q ||
    currentFilters.service ||
    currentFilters.category ||
    currentFilters.city ||
    currentFilters.province ||
    currentFilters.openNow ||
    currentFilters.offersMobile ||
    currentFilters.priceMin ||
    currentFilters.priceMax ||
    currentFilters.sortBy,
  );
  const shouldShowProvinceBrowse = !hasActiveFilters && !isMobile && provinceGroups.length > 1;

  const renderSalonCard = (salon: SalonWithFavorite, variant: 'grid' | 'rail') => {
    return (
      <div key={salon.id} className={variant === 'grid' ? styles.gridCard : styles.railCard}>
        <SalonCard
          salon={salon}
          compact
          showFavorite
          showPrice={false}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <section className={styles.mobileToolbar}>
        <button
          type="button"
          className={styles.mobileFilterButton}
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <FaSlidersH aria-hidden="true" />
          <span>Filter salons</span>
        </button>
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
          {isMobile ? (
            <section className={styles.mobileResultsSection}>
              <div className={styles.mobileResultsRail}>
                {salons.map((salon) => renderSalonCard(salon, 'rail'))}
              </div>
            </section>
          ) : (
            <div className={styles.salonGrid}>
              {salons.map((salon) => renderSalonCard(salon, 'grid'))}
            </div>
          )}

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
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {isMobileFilterOpen && (
        <MobileFilter
          onSearch={handleSearch}
          initialFilters={currentFilters}
          onClose={() => setIsMobileFilterOpen(false)}
        />
      )}
    </div>
  );
}
