'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { Salon } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import { getImageWithFallback } from '@/lib/placeholders';
import { getSalonUrl } from '@/utils/salonUrl';
import EmptyState from '@/components/EmptyState/EmptyState';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import styles from './SimilarSalons.module.css';

interface SimilarSalonsProps {
  currentSalonId: string;
  city?: string;
  province?: string;
}

export default function SimilarSalons({ currentSalonId, city, province }: SimilarSalonsProps) {
  const [similarSalons, setSimilarSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarSalons = async () => {
      setIsLoading(true);
      try {
        // Build query parameters for similar salons
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (province) params.append('province', province);
        params.append('limit', '6');

        const response = await fetch(`/api/salons/approved?${params.toString()}`, {
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch similar salons');

        const salons: Salon[] = await response.json();

        // Filter out current salon and limit to 6
        const filtered = salons
          .filter(s => s.id !== currentSalonId)
          .slice(0, 6);

        setSimilarSalons(filtered);
      } catch (error) {
        console.error('Failed to fetch similar salons:', error);
        setSimilarSalons([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSalonId) {
      fetchSimilarSalons();
    }
  }, [currentSalonId, city, province]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Similar Salons Nearby</h2>
        <div className={styles.scrollContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`${styles.salonCard} ${styles.skeleton}`}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonLocation} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state when no similar salons found
  if (similarSalons.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Similar Salons Nearby</h2>
        <EmptyState
          variant="no-nearby"
          locationName={city || province}
          showSuggestions={true}
          className={styles.emptyState}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>You May Also Like</h2>
      <p className={styles.subtitle}>
        Other salons in {city || province} you might be interested in
      </p>
      <div className={styles.scrollContainer}>
        {similarSalons.map((salon) => (
          <Link
            key={salon.id}
            href={getSalonUrl(salon)}
            className={styles.salonCard}
          >
            <div className={styles.imageWrapper}>
              {salon.avgRating && salon.avgRating > 0 && (
                <div className={styles.ratingBadge}>
                  <FaStar />
                  <span>{salon.avgRating.toFixed(1)}</span>
                </div>
              )}
              <OptimizedImage
                src={transformCloudinary(
                  getImageWithFallback(salon.backgroundImage, 'wide'),
                  { width: 400, quality: 'auto', format: 'auto', crop: 'fill' }
                )}
                alt={salon.name}
                fill
                className={styles.cardImage}
                sizes="(max-width: 768px) 280px, 320px"
              />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{salon.name}</h3>
              <p className={styles.cardLocation}>
                {salon.city}, {salon.province}
              </p>
              {salon.reviews && salon.reviews.length > 0 && (
                <p className={styles.reviewCount}>
                  {salon.reviews.length} {salon.reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
