'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { transformCloudinary } from '@/utils/cloudinary';
import { Salon } from '@/types';
import styles from '../../../SalonsPage.module.css';
import { FaHeart } from 'react-icons/fa';
import { type FilterValues } from '@/components/FilterBar/FilterBar';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getImageWithFallback } from '@/lib/placeholders';
import PageNav from '@/components/PageNav';
import ReviewBadge from '@/components/ReviewBadge/ReviewBadge';
import EmptyState from '@/components/EmptyState/EmptyState';
import { getSalonUrl } from '@/utils/salonUrl';
import { notify } from '@/lib/notify';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface CityInfo {
  name: string;
  province: string;
  slug: string;
  description: string;
  keywords: string[];
}

interface CityPageClientProps {
  initialSalons?: SalonWithFavorite[];
  cityInfo?: CityInfo;
}

function SalonsCityContent({ initialSalons = [], cityInfo }: CityPageClientProps) {
  const params = useParams();
  const citySlug = params.city as string;
  const [salons, setSalons] = useState<SalonWithFavorite[]>(initialSalons);
  const [isLoading, setIsLoading] = useState(initialSalons.length === 0);
  const [hasFiltered, setHasFiltered] = useState(false);
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  const cityName = cityInfo?.name || citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  const fetchSalons = useCallback(async (additionalFilters: FilterValues) => {
    setIsLoading(true);
    setHasFiltered(true);
    const query = new URLSearchParams();
    query.append('city', cityName);

    if (additionalFilters.service) query.append('service', additionalFilters.service);
    if (additionalFilters.category) query.append('category', additionalFilters.category);
    if (additionalFilters.offersMobile) query.append('offersMobile', 'true');
    if (additionalFilters.sortBy) query.append('sortBy', additionalFilters.sortBy);
    if (additionalFilters.openNow) query.append('openNow', 'true');
    if (additionalFilters.priceMin) query.append('priceMin', String(additionalFilters.priceMin));
    if (additionalFilters.priceMax) query.append('priceMax', String(additionalFilters.priceMax));

    try {
      const res = await fetch(`/api/salons/approved?${query.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch salons');
      setSalons(await res.json());
    } catch (error) {
      logger.error('Failed to fetch salons:', error);
      notify.error(toFriendlyMessage(error, 'Failed to load salons. Please try again.'));
      setSalons([]);
    } finally {
      setIsLoading(false);
    }
  }, [cityName]);

  // Only fetch on mount if no initial data
  useEffect(() => {
    if (initialSalons.length === 0 && !hasFiltered) {
      fetchSalons({
        city: cityName, province: '', service: '', category: '',
        offersMobile: false, sortBy: '', openNow: false, priceMin: '', priceMax: '',
      });
    }
  }, [fetchSalons, cityName, initialSalons.length, hasFiltered]);

  const handleToggleFavorite = async (e: React.MouseEvent, salonId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (authStatus !== 'authenticated') {
      notify.info('Please sign in to save salons to favorites.');
      openModal('login');
      return;
    }
    const originalSalons = salons;
    setSalons(prev => prev.map(s => s.id === salonId ? { ...s, isFavorited: !s.isFavorited } : s));
    try {
      const res = await fetch(`/api/favorites/toggle/${salonId}`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const { favorited } = await res.json();
      notify.success(favorited ? 'Added to favorites.' : 'Removed from favorites.');
    } catch {
      notify.error('Could not update favorites. Please try again.');
      setSalons(originalSalons);
    }
  };

  return (
    <div className={styles.container}>
      <PageNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 className={styles.title}>Salons Near Me in {cityName}</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666', lineHeight: '1.6' }}>
          {cityInfo?.description || `Find the best hair salons, nail salons, spas, and beauty services near you in ${cityName}.`}
        </p>
      </div>

      {isLoading && salons.length === 0 ? (
        <SkeletonGroup count={8} className={styles.salonGrid}>
          {() => <SkeletonCard hasImage lines={3} />}
        </SkeletonGroup>
      ) : salons.length === 0 ? (
        <EmptyState
          variant="no-location"
          title={`No Salons Found in ${cityName}`}
          description="Try searching in the broader region or check back soon as we add more salons!"
        />
      ) : (
        <div className={styles.salonGrid}>
          {salons.map((salon, index) => (
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
                  <ReviewBadge reviewCount={salon.reviews?.length || 0} avgRating={salon.avgRating || 0} />
                  <Image
                    src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
                    alt={`${salon.name} - Salon in ${cityName}`}
                    className={styles.cardImage}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={index < 4}
                    loading={index < 4 ? 'eager' : 'lazy'}
                  />
                </div>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{salon.name}</h2>
                  <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CityPageClient(props: CityPageClientProps) {
  return <SalonsCityContent {...props} />;
}
