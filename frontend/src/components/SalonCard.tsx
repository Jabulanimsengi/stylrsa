'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import Link from 'next/link';
import { FaHeart, FaStar } from 'react-icons/fa';
import { transformCloudinary } from '@/utils/cloudinary';
import { getImageWithFallback } from '@/lib/placeholders';
import ImageLightbox from '@/components/ImageLightbox';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { Salon } from '@/types';
import { getSalonUrl } from '@/utils/salonUrl';
import styles from './SalonCard.module.css';
import VerificationBadge from './VerificationBadge/VerificationBadge';
import { useSalonImpression } from '@/hooks/useSalonImpression';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface SalonCardProps {
  salon: SalonWithFavorite;
  showFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, salonId: string) => void;
  showHours?: boolean;
  compact?: boolean;
  showPrice?: boolean;
  enableLightbox?: boolean;
  onViewCountUpdate?: (salonId: string, newCount: number) => void;
  showPromoted?: boolean;
}

function StarRow({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  return (
    <div
      className={styles.starRow}
      aria-label={`${rating.toFixed(1)} out of 5, ${count} reviews`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar
          key={i}
          className={i < full ? styles.starFilled : styles.starEmpty}
        />
      ))}
      <span className={styles.starCount}>({count})</span>
    </div>
  );
}

function SalonCard({
  salon,
  showFavorite = true,
  onToggleFavorite,
  compact = false,
  showPrice = true,
  enableLightbox = false,
  onViewCountUpdate,
  showPromoted = false,
}: SalonCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [isCardNavigating, setIsCardNavigating] = useState(false);
  const { showPageLoader } = useNavigationLoading();

  useEffect(() => () => setIsCardNavigating(false), []);

  const handleImpressionTracked = useCallback(() => {
    if (onViewCountUpdate && salon.id) {
      onViewCountUpdate(salon.id, (salon.viewCount || 0) + 1);
    }
  }, [salon.id, salon.viewCount, onViewCountUpdate]);

  const impressionRef = useSalonImpression(salon.id, compact, handleImpressionTracked);

  const handleImageClick = (e: React.MouseEvent) => {
    if (!enableLightbox) return;
    e.preventDefault();
    e.stopPropagation();
    const images: string[] = [];
    if (salon.backgroundImage) images.push(salon.backgroundImage);
    if (salon.gallery && Array.isArray(salon.gallery)) {
      images.push(...salon.gallery.map((img) => img.imageUrl));
    }
    setLightboxImages(images);
    setIsLightboxOpen(true);
  };

  // ── Trust-signal data ──────────────────────────────────────────────────────
  const startingPrice = (() => {
    const prices = (salon.services ?? []).map(s => s.price).filter((p): p is number => p != null);
    return prices.length ? Math.min(...prices) : null;
  })();

  const categoryTags = [...new Set(
    (salon.services ?? []).map(s => {
      if (typeof s.category === 'string') {
        return s.category;
      }
      return s.title;
    }).filter(Boolean) as string[]
  )].slice(0, 3);
  const primaryCategoryTags = compact ? categoryTags.slice(0, 1) : categoryTags.slice(0, 2);
  const hiddenCategoryCount = Math.max(categoryTags.length - primaryCategoryTags.length, 0);
  const displayCategoryTags = hiddenCategoryCount > 0
    ? [...primaryCategoryTags, `+${hiddenCategoryCount}`]
    : primaryCategoryTags;

  const hasRating =
    salon.reviewCount !== undefined &&
    salon.avgRating !== undefined &&
    salon.reviewCount > 0;

  const handleCardNavigation = () => {
    setIsCardNavigating(true);
    showPageLoader();
  };

  const shouldShowFooter = (showPrice && startingPrice !== null) || salon.distance != null;

  return (
    <>
      <article
        ref={compact ? impressionRef : undefined}
        className={`${styles.salonCard} ${compact ? styles.compact : ''} ${isCardNavigating ? styles.navigating : ''}`}
      >
        {isCardNavigating && <span className={styles.loadingBar} aria-hidden="true" />}

        {/* Image area */}
        <Link
          href={getSalonUrl(salon)}
          className={styles.salonLink}
          onClick={handleCardNavigation}
          aria-label={`View ${salon.name}`}
        >
          <div className={styles.imageWrapper} onClick={enableLightbox ? handleImageClick : undefined}>
          {hasRating && (
            <div className={styles.ratingBadge}>
              <div className={styles.ratingValue}>{salon.avgRating!.toFixed(1)}</div>
              <div className={styles.reviewCount}>
                {salon.reviewCount} {salon.reviewCount === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          )}

          {/* Open / Closed badge */}
          <div
            className={`${styles.availabilityBadge} ${salon.isAvailableNow ? styles.openBadge : styles.closedBadge}`}
            aria-label={salon.isAvailableNow ? 'Open now' : 'Closed'}
          >
            <span className={styles.availabilityDot} />
            {salon.isAvailableNow ? 'Open now' : 'Closed'}
          </div>

          <OptimizedImage
            src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), {
              width: 600,
              quality: 'auto',
              format: 'auto',
              crop: 'fill',
            })}
            alt={`${salon.name} salon`}
            className={styles.cardImage}
            fill
            sizes="(max-width: 479px) 45vw, (max-width: 767px) 40vw, (max-width: 1023px) 33vw, 25vw"
            seoContext={{ salonName: salon.name, city: salon.city }}
          />
          </div>
        </Link>

        {/* Text content */}
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <Link
              href={getSalonUrl(salon)}
              className={styles.cardSummaryLink}
              onClick={handleCardNavigation}
              aria-label={`View details for ${salon.name}`}
            >
              <div className={styles.titleGroup}>
                <h2 className={styles.cardTitle}>{salon.name}</h2>
                {salon.isVerified && <VerificationBadge size="small" />}
              </div>
            </Link>
            {showFavorite && onToggleFavorite && (
              <button
                type="button"
                onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(e, salon.id); }}
                className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
                aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={Boolean(salon.isFavorited)}
              >
                <FaHeart />
              </button>
            )}
          </div>

          <Link
            href={getSalonUrl(salon)}
            className={styles.cardSummaryLink}
            onClick={handleCardNavigation}
            aria-label={`Open ${salon.name}`}
          >
            <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>

            {hasRating && <StarRow rating={salon.avgRating!} count={salon.reviewCount!} />}

            {displayCategoryTags.length > 0 && (
              <div className={styles.categoryTags}>
                {displayCategoryTags.map(tag => (
                  <span key={tag} className={styles.categoryTag}>{tag}</span>
                ))}
              </div>
            )}

            {shouldShowFooter && (
              <div className={styles.cardFooter}>
                {showPrice && startingPrice !== null && (
                <span className={styles.startingPrice}>R{startingPrice}</span>
                )}
                {salon.distance != null && (
                  <div className={styles.distanceBadge}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>
                      {salon.distance < 1 ? `${Math.round(salon.distance * 1000)}m` : `${salon.distance.toFixed(1)}km`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {showPromoted && <div className={styles.promotedLabel}>Promoted</div>}
          </Link>
        </div>
      </article>

      {enableLightbox && isLightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={0}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}

export default memo(SalonCard, (prev, next) =>
  prev.salon.id === next.salon.id &&
  prev.salon.isFavorited === next.salon.isFavorited &&
  prev.salon.viewCount === next.salon.viewCount &&
  prev.compact === next.compact &&
  prev.showFavorite === next.showFavorite &&
  prev.showPromoted === next.showPromoted
);
