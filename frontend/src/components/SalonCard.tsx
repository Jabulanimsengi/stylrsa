'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaHeart } from 'react-icons/fa';
import { transformCloudinary } from '@/utils/cloudinary';
import { getImageWithFallback } from '@/lib/placeholders';
import ImageLightbox from '@/components/ImageLightbox';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { Salon } from '@/types';
import { getSalonUrl } from '@/utils/salonUrl';
import styles from './SalonCard.module.css';
import VerificationBadge from './VerificationBadge/VerificationBadge';
import { useSalonImpression } from '@/hooks/useSalonImpression';

// Blur placeholder for CLS prevention - tiny base64 encoded image
const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMiMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEQA/AKOm6hqF1qMUV1cSSwq2WRmJBx+VYpSlKqxYAOxP/9k=';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface SalonCardProps {
  salon: SalonWithFavorite;
  showFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, salonId: string) => void;
  showHours?: boolean;
  compact?: boolean;
  enableLightbox?: boolean; // Enable image lightbox (default: false)
  onViewCountUpdate?: (salonId: string, newCount: number) => void; // Callback when view count should be updated
  showPromoted?: boolean; // Show promoted label at bottom
}

function SalonCard({ salon, showFavorite = true, onToggleFavorite, showHours = true, compact = false, enableLightbox = false, onViewCountUpdate, showPromoted = false }: SalonCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const [isCardNavigating, setIsCardNavigating] = useState(false);
  const router = useRouter();
  const { setIsNavigating } = useNavigationLoading();

  // Reset loading state on unmount or if navigation is cancelled
  useEffect(() => {
    return () => {
      setIsCardNavigating(false);
    };
  }, []);

  // Track impressions and update view count locally when tracked
  const handleImpressionTracked = useCallback(() => {
    if (onViewCountUpdate && salon.id) {
      const currentCount = salon.viewCount || 0;
      onViewCountUpdate(salon.id, currentCount + 1);
    }
  }, [salon.id, salon.viewCount, onViewCountUpdate]);

  const impressionRef = useSalonImpression(salon.id, compact, handleImpressionTracked); // Track impressions for compact cards

  const handleImageClick = (e: React.MouseEvent) => {
    if (!enableLightbox) {
      // If lightbox is disabled, navigate to salon page
      e.preventDefault();
      e.stopPropagation();

      // Show loading state
      setIsCardNavigating(true);
      setIsNavigating(true);

      // Navigate to salon profile using slug if available
      router.push(getSalonUrl(salon));

      // Reset loading state after timeout
      setTimeout(() => {
        setIsCardNavigating(false);
        setIsNavigating(false);
      }, 3000);
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Collect salon images for lightbox
    const images: string[] = [];
    if (salon.backgroundImage) {
      images.push(salon.backgroundImage);
    }
    // Add gallery images if available
    if (salon.gallery && Array.isArray(salon.gallery)) {
      images.push(...salon.gallery.map((img: any) => img.imageUrl || img));
    }

    setLightboxImages(images);
    setLightboxIndex(0);
    setIsLightboxOpen(true);
  };



  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on favorite button or other interactive elements
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }

    if (!enableLightbox) {
      // Immediate visual feedback
      setIsCardNavigating(true);
      // Then set global navigation state
      setIsNavigating(true);

      // Navigate to salon profile using slug if available
      router.push(getSalonUrl(salon));

      // Reset loading state after a reasonable timeout
      // This handles cases where navigation fails or user goes back
      setTimeout(() => {
        setIsCardNavigating(false);
        setIsNavigating(false);
      }, 3000);
    }
  };

  // If lightbox is disabled, wrap entire card in Link
  if (!enableLightbox) {
    return (
      <div
        ref={compact ? impressionRef as any : null}
        className={`${styles.salonCard} ${compact ? styles.compact : ''} ${isCardNavigating ? styles.navigating : ''}`}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        {isCardNavigating && (
          <div className={styles.loadingOverlay}>
            <LoadingSpinner size="medium" color="white" />
          </div>
        )}
        {showFavorite && onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e, salon.id);
            }}
            className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
            aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart />
          </button>
        )}
        <div className={styles.salonLink}>
          <div className={styles.imageWrapper} onClick={handleImageClick}>
            {salon.reviewCount !== undefined && salon.avgRating !== undefined && salon.reviewCount > 0 && (
              <div className={styles.ratingBadge}>
                <div className={styles.ratingValue}>{salon.avgRating.toFixed(1)}</div>
                <div className={styles.reviewCount}>{salon.reviewCount} {salon.reviewCount === 1 ? 'review' : 'reviews'}</div>
              </div>
            )}
            <Image
              src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), {
                width: 600,
                quality: 'auto',
                format: 'auto',
                crop: 'fill'
              })}
              alt={`A photo of ${salon.name}`}
              className={styles.cardImage}
              fill
              sizes="(max-width: 479px) 45vw, (max-width: 767px) 40vw, (max-width: 1023px) 33vw, (max-width: 1439px) 25vw, 20vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <h2
                className={styles.cardTitle}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNavigating(true);
                  router.push(getSalonUrl(salon));
                }}
                style={{ cursor: 'pointer' }}
              >
                {salon.name}
              </h2>
            </div>
            <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
            {salon.distance !== null && salon.distance !== undefined && (
              <>
                <div className={styles.distanceBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>
                    {salon.distance < 1
                      ? `${Math.round(salon.distance * 1000)}m away`
                      : `${salon.distance.toFixed(1)}km away`
                    }
                  </span>
                </div>
                {salon.latitude && salon.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.directionsLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Get Directions →
                  </a>
                )}
              </>
            )}
            {showPromoted && (
              <div className={styles.promotedLabel}>
                Promoted
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If lightbox enabled, use separate click handlers
  return (
    <>
      <div
        ref={compact ? impressionRef as any : null}
        className={`${styles.salonCard} ${compact ? styles.compact : ''}`}
      >
        {showFavorite && onToggleFavorite && (
          <button
            onClick={(e) => onToggleFavorite(e, salon.id)}
            className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
            aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart />
          </button>
        )}
        <div
          className={styles.imageWrapper}
          onClick={handleImageClick}
        >
          {salon.reviewCount !== undefined && salon.avgRating !== undefined && salon.reviewCount > 0 && (
            <div className={styles.ratingBadge}>
              <div className={styles.ratingValue}>{salon.avgRating.toFixed(1)}</div>
              <div className={styles.reviewCount}>{salon.reviewCount} {salon.reviewCount === 1 ? 'review' : 'reviews'}</div>
            </div>
          )}
          <Image
            src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), {
              width: 600,
              quality: 'auto',
              format: 'auto',
              crop: 'fill'
            })}
            alt={`A photo of ${salon.name}`}
            className={styles.cardImage}
            fill
            sizes="(max-width: 479px) 45vw, (max-width: 767px) 40vw, (max-width: 1023px) 33vw, (max-width: 1439px) 25vw, 20vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <h2
              className={styles.cardTitle}
              onClick={(e) => {
                e.stopPropagation();
                setIsNavigating(true);
                router.push(getSalonUrl(salon));
              }}
              style={{ cursor: 'pointer' }}
            >
              {salon.name}
            </h2>
          </div>
          <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
          {salon.distance !== null && salon.distance !== undefined && (
            <>
              <div className={styles.distanceBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>
                  {salon.distance < 1
                    ? `${Math.round(salon.distance * 1000)}m away`
                    : `${salon.distance.toFixed(1)}km away`
                  }
                </span>
              </div>
              {salon.latitude && salon.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.directionsLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  Get Directions →
                </a>
              )}
            </>
          )}
          {showPromoted && (
            <div className={styles.promotedLabel}>
              Promoted
            </div>
          )}
        </div>
      </div>

      {enableLightbox && isLightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}

// Memoize to prevent unnecessary re-renders and improve INP
export default memo(SalonCard, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.salon.id === nextProps.salon.id &&
    prevProps.salon.isFavorited === nextProps.salon.isFavorited &&
    prevProps.salon.viewCount === nextProps.salon.viewCount &&
    prevProps.compact === nextProps.compact &&
    prevProps.showFavorite === nextProps.showFavorite &&
    prevProps.showHours === nextProps.showHours &&
    prevProps.showPromoted === nextProps.showPromoted
  );
});
