'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { transformCloudinary } from '@/utils/cloudinary';
import { Salon } from '@/types';
import styles from '../../SalonsPage.module.css';
import { FaHeart } from 'react-icons/fa';
import FilterBar, { type FilterValues } from '@/components/FilterBar/FilterBar';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getImageWithFallback } from '@/lib/placeholders';
import PageNav from '@/components/PageNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import ReviewBadge from '@/components/ReviewBadge/ReviewBadge';
import { PROVINCES } from '@/lib/locationData';
import { getSalonUrl } from '@/utils/salonUrl';
import EmptyState from '@/components/EmptyState/EmptyState';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface ProvinceInfo {
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  cities: Array<{ slug: string; name: string }>;
}

interface LocationPageClientProps {
  initialSalons?: SalonWithFavorite[];
  provinceInfo?: ProvinceInfo;
}

function SalonsLocationContent({ initialSalons = [], provinceInfo }: LocationPageClientProps) {
  const params = useParams();
  const locationSlug = params.location as string;
  const [salons, setSalons] = useState<SalonWithFavorite[]>(initialSalons);
  const [isLoading, setIsLoading] = useState(initialSalons.length === 0);
  const [hasFiltered, setHasFiltered] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  const locationInfo = provinceInfo || PROVINCES[locationSlug] || {
    slug: 'south-africa', name: 'South Africa',
    description: 'Find the best salons and beauty professionals in South Africa',
    keywords: ['South Africa salons'], cities: []
  };

  const fetchSalons = useCallback(async (additionalFilters: FilterValues) => {
    setIsLoading(true);
    setHasFiltered(true);
    const query = new URLSearchParams();
    query.append('province', locationInfo.name);

    if (additionalFilters.city) query.append('city', additionalFilters.city);
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
      toast.error(toFriendlyMessage(error, 'Failed to load salons. Please try again.'));
      setSalons([]);
    } finally {
      setIsLoading(false);
    }
  }, [locationInfo.name]);

  useEffect(() => {
    if (initialSalons.length === 0 && !hasFiltered) {
      fetchSalons({
        province: locationInfo.name, city: '', service: '', category: '',
        offersMobile: false, sortBy: '', openNow: false, priceMin: '', priceMax: '',
      });
    }
  }, [fetchSalons, locationInfo.name, initialSalons.length, hasFiltered]);

  const handleToggleFavorite = async (e: React.MouseEvent, salonId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (authStatus !== 'authenticated') {
      toast.info('Please log in to add salons to your favorites.');
      openModal('login');
      return;
    }
    const originalSalons = salons;
    setSalons(prev => prev.map(s => s.id === salonId ? { ...s, isFavorited: !s.isFavorited } : s));
    try {
      const res = await fetch(`/api/favorites/toggle/${salonId}`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const { favorited } = await res.json();
      toast.success(favorited ? 'Added to favorites!' : 'Removed from favorites.');
    } catch {
      toast.error('Could not update favorites. Please try again.');
      setSalons(originalSalons);
    }
  };

  return (
    <div className={styles.container}>
      <PageNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 className={styles.title}>Salons in {locationInfo.name}</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666', lineHeight: '1.6' }}>
          {locationInfo.description}
        </p>
      </div>

      {isLoading && salons.length === 0 ? (
        <SkeletonGroup count={8} className={styles.salonGrid}>
          {() => <SkeletonCard hasImage lines={3} />}
        </SkeletonGroup>
      ) : salons.length === 0 ? (
        <EmptyState
          variant="no-salons"
          locationName={locationInfo.name}
          showSuggestions={true}
          action={
            <Link href="/salons" className="btn btn-primary">
              Browse All Salons
            </Link>
          }
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
                    alt={`${salon.name} - Salon in ${locationInfo.name}`}
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

      {/* Internal Links for SEO */}
      <div style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid #eee' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Popular Searches in {locationInfo.name}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link href={`/hair-salon/${locationInfo.slug}`} className={styles.seoLink}>Hair Salons in {locationInfo.name}</Link>
          <Link href={`/nail-salon/${locationInfo.slug}`} className={styles.seoLink}>Nail Salons in {locationInfo.name}</Link>
          <Link href={`/barbershop/${locationInfo.slug}`} className={styles.seoLink}>Barbershops in {locationInfo.name}</Link>
          <Link href={`/spas/${locationInfo.slug}`} className={styles.seoLink}>Spas in {locationInfo.name}</Link>
          <Link href={`/braids/${locationInfo.slug}`} className={styles.seoLink}>Braiding Salons in {locationInfo.name}</Link>
        </div>
      </div>
    </div>
  );
}

export default function LocationPageClient(props: LocationPageClientProps) {
  return (
    <Suspense fallback={<SkeletonGroup count={8} className={styles.salonGrid}>{() => <SkeletonCard hasImage lines={3} />}</SkeletonGroup>}>
      <SalonsLocationContent {...props} />
    </Suspense>
  );
}
