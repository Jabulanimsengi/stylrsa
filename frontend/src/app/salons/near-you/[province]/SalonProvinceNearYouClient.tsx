'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { transformCloudinary } from '@/utils/cloudinary';
import { Salon } from '@/types';
import styles from '@/app/salons/SalonsPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaHeart } from 'react-icons/fa';
import FilterBar, { type FilterValues } from '@/components/FilterBar/FilterBar';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getImageWithFallback } from '@/lib/placeholders';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import ReviewBadge from '@/components/ReviewBadge/ReviewBadge';
import EmptyState from '@/components/EmptyState/EmptyState';
import { generateNearYouH1, generateNearYouContent } from '@/lib/nearYouContent';
import { getProvinceInfo, getCitiesByProvince } from '@/lib/locationData';
import RelatedLocations from '@/components/RelatedLocations/RelatedLocations';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { pageview } from '@/lib/analytics';
import { getSalonUrl } from '@/utils/salonUrl';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface Props {
  provinceSlug: string;
}

export default function SalonProvinceNearYouClient({ provinceSlug }: Props) {
  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  const province = getProvinceInfo(provinceSlug);
  const provinceName = province?.name || provinceSlug;
  const h1 = generateNearYouH1(null, provinceSlug, null);
  const content = generateNearYouContent(null, provinceSlug, null);

  // Analytics tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `/salons/near-you/${provinceSlug}`;
      pageview(url);
    }
  }, [provinceSlug]);

  // No-index for empty pages
  useEffect(() => {
    if (salons.length === 0 && !isLoading) {
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) {
        metaRobots.setAttribute('content', 'noindex, follow');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, follow';
        document.head.appendChild(meta);
      }
    }
  }, [salons.length, isLoading]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Salons', href: '/salons' },
    { label: 'Near You', href: '/salons/near-me' },
    ...(province ? [{ label: province.name, href: `/salons/near-you/${provinceSlug}` }] : []),
  ];

  const fetchSalons = useCallback(async (additionalFilters: FilterValues) => {
    setIsLoading(true);
    const query = new URLSearchParams();
    
    // Set province from slug
    query.append('province', provinceName);
    
    if (additionalFilters.city) query.append('city', additionalFilters.city);
    if (additionalFilters.service) query.append('service', additionalFilters.service);
    if (additionalFilters.category) query.append('category', additionalFilters.category);
    if (additionalFilters.offersMobile) query.append('offersMobile', 'true');
    if (additionalFilters.sortBy) query.append('sortBy', additionalFilters.sortBy);
    if (additionalFilters.openNow) query.append('openNow', 'true');
    if (additionalFilters.priceMin) query.append('priceMin', String(additionalFilters.priceMin));
    if (additionalFilters.priceMax) query.append('priceMax', String(additionalFilters.priceMax));

    const url = `/api/salons/approved?${query.toString()}`;

    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch salons');
      const data = await res.json();
      setSalons(data);
    } catch (error) {
      logger.error('Failed to fetch salons:', error);
      toast.error(toFriendlyMessage(error, 'Failed to load salons. Please try again.'));
      setSalons([]);
    } finally {
      setIsLoading(false);
    }
  }, [provinceName]);

  useEffect(() => {
    fetchSalons({
      city: '',
      province: provinceName,
      service: '',
      category: '',
      offersMobile: false,
      sortBy: '',
      openNow: false,
      priceMin: '',
      priceMax: '',
    });
  }, [fetchSalons, provinceName]);

  const handleToggleFavorite = async (e: React.MouseEvent, salonId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      toast.info('Please log in to add salons to your favorites.');
      openModal('login');
      return;
    }

    const originalSalons = salons;
    setSalons(prevSalons =>
      prevSalons.map(salon =>
        salon.id === salonId ? { ...salon, isFavorited: !salon.isFavorited } : salon
      )
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
      const message = favorited ? 'Added to favorites!' : 'Removed from favorites.';
      toast.success(message);

    } catch {
      toast.error('Could not update favorites. Please try again.');
      setSalons(originalSalons);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.title}>{h1}</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666', lineHeight: '1.6' }}>
          {content}
        </p>
        {province && (
          <RelatedLocations
            title={`Popular Cities in ${province.name}`}
            locations={getCitiesByProvince(provinceSlug)
              .slice(0, 8)
              .map(city => ({
                name: city.name,
                url: `/salons/near-you/${provinceSlug}/${city.slug}`
              }))}
            type="cities"
          />
        )}
      </div>

      {isMobile ? (
        <MobileSearch onSearch={fetchSalons} />
      ) : (
        <FilterBar 
          onSearch={fetchSalons} 
          initialFilters={{ 
            province: provinceName,
            city: '',
            service: '',
            category: '',
            offersMobile: false,
            sortBy: '',
            openNow: false,
            priceMin: '',
            priceMax: '',
          }} 
        />
      )}

      {isLoading ? (
        salons.length === 0 ? (
          <SkeletonGroup count={8} className={styles.salonGrid}>
            {() => <SkeletonCard hasImage lines={3} />}
          </SkeletonGroup>
        ) : (
          <div className={styles.loadingState}>
            <LoadingSpinner />
          </div>
        )
      ) : salons.length === 0 ? (
        <EmptyState
          variant="no-location"
          title={`No Salons Found in ${provinceName}`}
          description="Try searching in the broader region or check back soon as we add more salons!"
        />
      ) : (
        <div className={styles.salonGrid}>
          {salons.map((salon) => (
            <div key={salon.id} className={styles.salonCard}>
              <button
                onClick={(e) => handleToggleFavorite(e, salon.id)}
                className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
                aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <FaHeart />
              </button>
              <Link href={getSalonUrl(salon)} className={styles.salonLink}>
                <div className={styles.imageWrapper}>
                  <ReviewBadge 
                    reviewCount={salon.reviews?.length || 0}
                    avgRating={salon.avgRating || 0}
                  />
                  <Image
                    src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
                    alt={`${salon.name} - Salon in ${provinceName}`}
                    className={styles.cardImage}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{salon.name}</h2>
                  <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
                  {(() => {
                    const oh = salon.operatingHours as unknown;
                    let hoursRecord: Record<string, string> | null = null;
                    if (Array.isArray(oh)) {
                      const derived: Record<string, string> = {};
                      oh.forEach((entry: { day?: string; open?: string; close?: string }) => {
                        const day = entry?.day;
                        if (!day) return;
                        const open = entry.open;
                        const close = entry.close;
                        if (!open && !close) return;
                        derived[day] = `${open ?? ''} - ${close ?? ''}`.trim();
                      });
                      hoursRecord = Object.keys(derived).length > 0 ? derived : null;
                    } else if (oh && typeof oh === 'object') {
                      hoursRecord = oh as Record<string, string>;
                    }
                    if (!hoursRecord) return null;
                    const entries = Object.entries(hoursRecord);
                    if (entries.length === 0) return null;
                    const samples = entries.slice(0, 2).map(([day, hrs]) => `${day.substring(0,3)} ${hrs}`);
                    const extra = entries.length > 2 ? ` +${entries.length - 2} more` : '';
                    return <p className={styles.cardMeta}>Hours: {samples.join(' • ')}{extra}</p>;
                  })()}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

