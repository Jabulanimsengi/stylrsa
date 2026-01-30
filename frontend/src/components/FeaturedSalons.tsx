'use client';

import { useEffect, useState, useCallback, useRef, useTransition, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import SalonCard from './SalonCard';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { Salon } from '@/types';
import styles from './FeaturedSalons.module.css';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';

import 'swiper/css';
import 'swiper/css/navigation';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface FeaturedSalonsProps {
  initialSalons?: SalonWithFavorite[];
}

function FeaturedSalons({ initialSalons = [] }: FeaturedSalonsProps) {
  // If we have server-side data, use it immediately and mark as 'done'
  const hasServerData = initialSalons.length > 0;
  const [salons, setSalons] = useState<SalonWithFavorite[]>(initialSalons);
  // Start as 'done' if we have server data, otherwise 'pending'
  const [loadingState, setLoadingState] = useState<'pending' | 'loading' | 'done'>(
    hasServerData ? 'done' : 'pending'
  );

  // Debug logging to help identify auth issues
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('FeaturedSalons - initialSalons count:', initialSalons.length);
    console.log('FeaturedSalons - hasServerData:', hasServerData);
    console.log('FeaturedSalons - loadingState:', loadingState);
  }
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPrevArrow, setShowPrevArrow] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const [, startTransition] = useTransition();
  // Auth is optional - non-logged-in users can still view featured salons
  const { authStatus } = useAuth() || { authStatus: 'unauthenticated' };
  const { openModal } = useAuthModal() || { openModal: () => {} };
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const { setIsNavigating } = useNavigationLoading();

  const handleHeadingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push('/salons');
  };

  const handleViewAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push('/salons');
  };

  const fetchFeaturedSalons = useCallback(async (showLoading = true) => {
    // Only show loading skeleton on first fetch when we don't have data
    if (showLoading && loadingState === 'pending') {
      setLoadingState('loading');
    }
    try {
      // Add cache-busting timestamp to force fresh data
      const timestamp = Date.now();
      // Add timeout to prevent infinite loading (5 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`/api/salons/featured?_t=${timestamp}`, {
        credentials: 'include',
        cache: 'no-store' as any,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Failed to fetch featured salons (${res.status})`);
      }
      const data = await res.json();
      setSalons(Array.isArray(data) ? data : []);
    } catch (error) {
      // Silently fail - don't show error toast, just hide the section
      // Keep existing data if we have it
    } finally {
      setLoadingState('done');
    }
  }, [loadingState]);

  useEffect(() => {
    // Only fetch client-side if we don't have server-provided data
    if (!hasServerData) {
      fetchFeaturedSalons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasServerData]);

  // Listen for salon updates from EditSalonModal
  useEffect(() => {
    const handleSalonUpdate = () => {
      // Refetch without showing loading skeleton to prevent flickering
      setTimeout(() => {
        fetchFeaturedSalons(false);
      }, 500);
    };

    window.addEventListener('salon-updated', handleSalonUpdate);
    return () => window.removeEventListener('salon-updated', handleSalonUpdate);
  }, [fetchFeaturedSalons]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent, salonId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      toast.info('Please log in to add salons to your favorites.');
      openModal('login');
      return;
    }

    const originalSalons = salons;
    // Use startTransition for non-urgent UI updates to improve INP
    startTransition(() => {
      setSalons(prevSalons =>
        prevSalons.map(salon =>
          salon.id === salonId ? { ...salon, isFavorited: !salon.isFavorited } : salon
        )
      );
    });

    try {
      const res = await fetch(`/api/favorites/toggle/${salonId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to update favorite status.');
      }

      const { favorited } = await res.json();
      const message = favorited ? 'Added to favorites!' : 'Removed from favorites.';
      toast.success(message);

    } catch (error) {
      toast.error('Could not update favorites. Please try again.');
      startTransition(() => setSalons(originalSalons));
    }
  }, [authStatus, openModal, salons]);

  const handleViewCountUpdate = useCallback((salonId: string, newCount: number) => {
    setSalons(prevSalons =>
      prevSalons.map(salon =>
        salon.id === salonId ? { ...salon, viewCount: newCount } : salon
      )
    );
  }, []);

  // Don't render if we have no salons (after loading completes)
  if (loadingState === 'done' && salons.length === 0) {
    // In development, show why section is hidden to help debug
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('FeaturedSalons: No salons to display - section hidden');
    }
    return null;
  }

  // Show loading state during fetch - prevents invisible section
  if (loadingState === 'loading' || loadingState === 'pending') {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div style={{ width: '150px', height: '32px', background: '#f0f0f0', borderRadius: '8px' }} />
        </div>
        <div style={{ display: 'flex', gap: '16px', maxWidth: '1200px', margin: '0 auto' }}>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                width: isMobile ? 'calc(100% / 1.35 - 10px)' : 'calc((100% - 48px) / 4.1)',
                height: isMobile ? '240px' : '280px',
                background: '#f0f0f0',
                borderRadius: '12px',
                flexShrink: 0
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <a href="/salons" onClick={handleHeadingClick} className={styles.title}>
          <h2>Recommended</h2>
        </a>
      </div>

      <div className={styles.container}>
        <Swiper
          modules={isMobile ? [] : [Navigation]}
          navigation={isMobile ? false : {
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            if (!isMobile && typeof swiper.params.navigation !== 'boolean') {
              const navigation = swiper.params.navigation;
              if (navigation) {
                navigation.prevEl = prevRef.current;
                navigation.nextEl = nextRef.current;
              }
            }
          }}
          spaceBetween={20}
          slidesPerView={'auto'}
          style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: isMobile ? '240px' : '280px',
          }}
          onSlideChange={(swiper: SwiperType) => {
            setActiveIndex(swiper.activeIndex);
            // Show prev arrow only after scrolling past the first slide
            setShowPrevArrow(swiper.activeIndex > 0);
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          allowTouchMove={true}
          simulateTouch={true}
          touchRatio={1}
          threshold={10}
          longSwipesRatio={0.5}
          breakpoints={{
            320: {
              slidesPerView: 1.35,
              spaceBetween: 16,
            },
            480: {
              slidesPerView: 1.4,
              spaceBetween: 18,
            },
            769: {
              slidesPerView: 4.1,
            },
          }}
        >
          {salons.map((salon) => (
            <SwiperSlide
              key={salon.id}
              style={{
                width: isMobile ? 'calc(100% / 1.35 - 10px)' : 'calc((100% - 48px) / 4.1)',
                minHeight: isMobile ? '240px' : '280px',
                flexShrink: 0,
              }}
            >
              <SalonCard
                salon={salon}
                showFavorite
                onToggleFavorite={handleToggleFavorite}
                showHours={false}
                compact
                onViewCountUpdate={handleViewCountUpdate}
                showPromoted
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation buttons - hidden on mobile */}
        {!isMobile && (
          <>
            {/* Left arrow - only visible after scrolling */}
            <button
              ref={prevRef}
              className={`${styles.navButton} ${styles.prevButton} ${showPrevArrow ? styles.visible : ''}`}
              aria-label="Previous"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            {/* Right arrow - always visible */}
            <button
              ref={nextRef}
              className={`${styles.navButton} ${styles.nextButton} ${styles.visible}`}
              aria-label="Next"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Slide counter for mobile */}
        <div className={styles.slideCounter}>
          {activeIndex + 1}/{salons.length}
        </div>
      </div>
    </section>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(FeaturedSalons);
