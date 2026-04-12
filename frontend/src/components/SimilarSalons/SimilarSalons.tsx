'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { Salon, Service } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import { getImageWithFallback } from '@/lib/placeholders';
import { getSalonUrl } from '@/utils/salonUrl';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import { logger } from '@/lib/logger';
import styles from './SimilarSalons.module.css';

const DISPLAY_LIMIT = 6;
const FETCH_LIMIT = 18;
const MIN_RESULTS = 6;
const DISTANCE_RADII_KM = [8, 20];

interface SimilarSalonsProps {
  currentSalonId: string;
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  currentServices?: Service[];
}

type RecommendationSource = 'distance' | 'city' | 'province';

type RecommendedSalon = Salon & {
  recommendationScore: number;
  resolvedDistanceKm: number | null;
  reviewTotal: number;
};

function normalizeValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nestedValue = record.name ?? record.title ?? record.label ?? record.slug ?? record.id;
    if (typeof nestedValue === 'string') {
      return nestedValue.trim().toLowerCase();
    }
  }

  return '';
}

function getServiceTags(services?: Service[]): Set<string> {
  const tags = new Set<string>();

  services?.forEach((service) => {
    const category = normalizeValue(service.category);
    const categoryId = normalizeValue(service.categoryId);

    if (category) {
      tags.add(category);
    }

    if (categoryId) {
      tags.add(categoryId);
    }
  });

  return tags;
}

function getReviewTotal(salon: Salon): number {
  if (typeof salon.reviewCount === 'number') {
    return salon.reviewCount;
  }

  return 0;
}

function toRadians(value: number) {
  return value * (Math.PI / 180);
}

function calculateDistanceKm(
  latitudeA?: number | null,
  longitudeA?: number | null,
  latitudeB?: number | null,
  longitudeB?: number | null,
): number | null {
  if (
    typeof latitudeA !== 'number' ||
    typeof longitudeA !== 'number' ||
    typeof latitudeB !== 'number' ||
    typeof longitudeB !== 'number'
  ) {
    return null;
  }

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(latitudeB - latitudeA);
  const deltaLon = toRadians(longitudeB - longitudeA);
  const lat1 = toRadians(latitudeA);
  const lat2 = toRadians(latitudeB);

  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function formatDistance(distanceKm: number | null): string | null {
  if (distanceKm === null || Number.isNaN(distanceKm)) {
    return null;
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km away`;
}

function buildApprovedUrl(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, String(value));
    }
  });

  return `/api/salons/approved?${query.toString()}`;
}

async function fetchSalons(url: string, signal: AbortSignal): Promise<Salon[]> {
  const response = await fetch(url, {
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch similar salons: ${response.status}`);
  }

  return response.json();
}

function rankSalons({
  salons,
  currentSalonId,
  currentCity,
  currentProvince,
  currentLatitude,
  currentLongitude,
  currentServiceTags,
}: {
  salons: Salon[];
  currentSalonId: string;
  currentCity?: string;
  currentProvince?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  currentServiceTags: Set<string>;
}): RecommendedSalon[] {
  const cityNormalized = currentCity?.trim().toLowerCase();
  const provinceNormalized = currentProvince?.trim().toLowerCase();

  return salons
    .filter((salon) => salon.id !== currentSalonId)
    .reduce<RecommendedSalon[]>((acc, salon) => {
      if (acc.some((existingSalon) => existingSalon.id === salon.id)) {
        return acc;
      }

      const reviewTotal = getReviewTotal(salon);
      const resolvedDistanceKm = typeof salon.distance === 'number' && !Number.isNaN(salon.distance)
        ? salon.distance
        : calculateDistanceKm(currentLatitude, currentLongitude, salon.latitude, salon.longitude);

      const salonTags = getServiceTags(salon.services);
      const sharedTagsCount = Array.from(currentServiceTags).filter((tag) => salonTags.has(tag)).length;
      const serviceSimilarity = currentServiceTags.size > 0
        ? sharedTagsCount / currentServiceTags.size
        : 0;

      let recommendationScore = 0;

      if (resolvedDistanceKm !== null) {
        recommendationScore += Math.max(0, 80 - (resolvedDistanceKm * 3));
      }

      if (cityNormalized && salon.city?.trim().toLowerCase() === cityNormalized) {
        recommendationScore += 20;
      }

      if (provinceNormalized && salon.province?.trim().toLowerCase() === provinceNormalized) {
        recommendationScore += 8;
      }

      recommendationScore += serviceSimilarity * 24;
      recommendationScore += (salon.avgRating ?? 0) * 5;
      recommendationScore += Math.min(reviewTotal, 25) * 0.5;

      if (salon.isVerified) {
        recommendationScore += 4;
      }

      if (salon.isFeatured) {
        recommendationScore += 3;
      }

      if (salon.isAvailableNow) {
        recommendationScore += 2;
      }

      acc.push({
        ...salon,
        reviewCount: reviewTotal,
        recommendationScore,
        resolvedDistanceKm,
        reviewTotal,
      });

      return acc;
    }, [])
    .sort((a, b) => {
      const distanceA = a.resolvedDistanceKm ?? Number.POSITIVE_INFINITY;
      const distanceB = b.resolvedDistanceKm ?? Number.POSITIVE_INFINITY;

      if (Math.abs(b.recommendationScore - a.recommendationScore) > 0.001) {
        return b.recommendationScore - a.recommendationScore;
      }

      if (distanceA !== distanceB) {
        return distanceA - distanceB;
      }

      return b.reviewTotal - a.reviewTotal;
    });
}

export default function SimilarSalons({
  currentSalonId,
  city,
  province,
  latitude,
  longitude,
  currentServices,
}: SimilarSalonsProps) {
  const [similarSalons, setSimilarSalons] = useState<RecommendedSalon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<RecommendationSource>('province');

  useEffect(() => {
    const controller = new AbortController();

    const fetchSimilarSalons = async () => {
      setIsLoading(true);

      try {
        const collectedSalons: Salon[] = [];
        let selectedSource: RecommendationSource = province ? 'province' : 'city';

        const appendUniqueSalons = (salons: Salon[]) => {
          salons.forEach((salon) => {
            if (salon.id !== currentSalonId && !collectedSalons.some((item) => item.id === salon.id)) {
              collectedSalons.push(salon);
            }
          });
        };

        if (typeof latitude === 'number' && typeof longitude === 'number') {
          selectedSource = 'distance';

          for (const radius of DISTANCE_RADII_KM) {
            const distanceSalons = await fetchSalons(buildApprovedUrl({
              sortBy: 'distance',
              lat: latitude,
              lon: longitude,
              radius,
              limit: FETCH_LIMIT,
            }), controller.signal);

            appendUniqueSalons(distanceSalons);

            if (collectedSalons.length >= MIN_RESULTS) {
              break;
            }
          }
        }

        if (collectedSalons.length < MIN_RESULTS && city) {
          if (selectedSource !== 'distance') {
            selectedSource = 'city';
          }

          const citySalons = await fetchSalons(buildApprovedUrl({
            city,
            province,
            limit: FETCH_LIMIT,
          }), controller.signal);

          appendUniqueSalons(citySalons);
        }

        if (collectedSalons.length < MIN_RESULTS && province) {
          if (selectedSource !== 'distance' && selectedSource !== 'city') {
            selectedSource = 'province';
          }

          const provinceSalons = await fetchSalons(buildApprovedUrl({
            province,
            limit: FETCH_LIMIT,
          }), controller.signal);

          appendUniqueSalons(provinceSalons);
        }

        const rankedSalons = rankSalons({
          salons: collectedSalons,
          currentSalonId,
          currentCity: city,
          currentProvince: province,
          currentLatitude: latitude,
          currentLongitude: longitude,
          currentServiceTags: getServiceTags(currentServices),
        }).slice(0, DISPLAY_LIMIT);

        setSource(selectedSource);
        setSimilarSalons(rankedSalons);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        logger.error('Failed to fetch similar salons', error);
        setSimilarSalons([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    if (currentSalonId) {
      void fetchSimilarSalons();
    } else {
      setIsLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [currentSalonId, city, province, latitude, longitude, currentServices]);

  const sectionTitle = source === 'distance' ? 'Nearby salons' : 'You may also like';
  const sectionSubtitle = source === 'distance'
    ? 'Chosen using distance, location, and profile quality'
    : `Other salons in ${city || province || 'your area'} you might be interested in`;

  if (isLoading) {
    return null;
  }

  if (similarSalons.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{sectionTitle}</h2>
      <p className={styles.subtitle}>{sectionSubtitle}</p>
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
              {formatDistance(salon.resolvedDistanceKm) && (
                <p className={styles.distanceLabel}>{formatDistance(salon.resolvedDistanceKm)}</p>
              )}
              {salon.reviewTotal > 0 && (
                <p className={styles.reviewCount}>
                  {salon.reviewTotal} {salon.reviewTotal === 1 ? 'review' : 'reviews'}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
