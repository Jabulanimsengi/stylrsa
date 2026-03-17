'use client';

import { useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaTag } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Promotion, Service } from '@/types';
import styles from './ServiceCard.module.css';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { apiFetch } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { getPlaceholder } from '@/lib/placeholders';
import { sanitizeText } from '@/lib/sanitize';
import { getSalonUrl } from '@/utils/salonUrl';

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
  onImageClick: (images: string[], index: number) => void;
  promotion?: Promotion | null;
  onPromotionClick?: (promotion: Promotion) => void;
  variant?: 'featured' | 'salonProfile' | 'listing';
}

function formatRand(value: number) {
  return Number.isInteger(value) ? `R${value}` : `R${value.toFixed(2)}`;
}

export default function ServiceCard({
  service,
  onBook,
  onImageClick,
  promotion,
  onPromotionClick,
  variant = 'listing',
}: ServiceCardProps) {
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const { showPageLoader } = useNavigationLoading();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(Boolean(service.isLikedByCurrentUser));
  const [likeCount, setLikeCount] = useState(service.likeCount ?? 0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const serviceTitle = service.title ?? service.name ?? 'Service';
  const realImages = useMemo(() => {
    if (!Array.isArray(service.images)) {
      return [];
    }

    return service.images.filter((img, idx, arr) => img && arr.indexOf(img) === idx);
  }, [service.images]);
  const images = realImages.length > 0 ? realImages : [getPlaceholder('wide')];

  const isSalonProfile = variant === 'salonProfile';
  const isFeatured = variant === 'featured';
  const showSalonInfo = !isSalonProfile;
  const promotionLabel = promotion
    ? promotion.discountPercentage > 0
      ? `${promotion.discountPercentage}% Off`
      : promotion.title?.trim() || 'Special offer'
    : null;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      toast.info('Please log in to like a service.');
      openModal('login');
      return;
    }

    const originalLikedState = isLiked;
    const originalLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      await apiFetch(`/api/likes/service/${service.id}/toggle`, { method: 'POST' });
    } catch (error) {
      setIsLiked(originalLikedState);
      setLikeCount(originalLikeCount);
      toast.error(toFriendlyMessage(error, 'Failed to update like status.'));
    }
  };

  const cardClassName = `${styles.card} ${isSalonProfile ? styles.salonProfile : ''} ${isFeatured ? styles.featured : ''}`;

  return (
    <div className={cardClassName}>
      <button
        type="button"
        onClick={handleLikeClick}
        className={`${styles.favoriteButton} ${isLiked ? styles.favorited : ''}`}
        aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={isLiked}
      >
        {isLiked ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
      </button>

      <button
        type="button"
        className={styles.imageContainer}
        onClick={() => onImageClick(images, activeImage)}
        aria-label={`Open image gallery for ${serviceTitle}`}
      >
        {!realImages.length && <span className={styles.placeholderMark}>Stylr SA</span>}
        <Image
          key={images[activeImage]}
          src={images[activeImage]}
          alt={serviceTitle}
          className={styles.image}
          fill
          sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.carouselButton} ${styles.prev}`}
              onClick={handlePrevImage}
              aria-label="Previous image"
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.carouselButton} ${styles.next}`}
              onClick={handleNextImage}
              aria-label="Next image"
            >
              <FaChevronRight aria-hidden="true" />
            </button>
            <div className={styles.imageCounter}>{activeImage + 1}/{images.length}</div>
          </>
        )}

        {promotion && promotionLabel && (
          <button
            type="button"
            className={styles.promotionBadge}
            onClick={(e) => {
              e.stopPropagation();
              onPromotionClick?.(promotion);
            }}
            aria-label={`View promotion details for ${serviceTitle}`}
          >
            <FaTag aria-hidden="true" />
            <span className={styles.badgeText}>{promotionLabel}</span>
          </button>
        )}
      </button>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{serviceTitle}</h3>
        </div>

        {showSalonInfo && service.salon && (
          <div className={styles.locationInfo}>
            <button
              type="button"
              className={styles.salonNameLink}
              onClick={(e) => {
                e.stopPropagation();
                showPageLoader();
                router.push(getSalonUrl(service.salon!));
              }}
              aria-label={`View salon ${service.salon.name}`}
            >
              {service.salon.name}
            </button>
            {(service.salon.city || service.salon.province) && (
              <p className={styles.salonLocation}>
                {[service.salon.city, service.salon.province].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        )}

        <div className={styles.priceWrapper}>
          <span className={styles.price}>{formatRand(service.price)}</span>
          {service.pricingType && (
            <span className={styles.pricingType}>
              {service.pricingType === 'PER_PERSON' ? 'per person' : 'per couple'}
            </span>
          )}
        </div>

        {isSalonProfile && (
          <>
            <p className={`${styles.description} ${isExpanded ? styles.expanded : ''}`}>
              {sanitizeText(service.description || '')}
            </p>
            {service.description && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={styles.expandButton}
              >
                {isExpanded ? 'View Less' : 'View More'}
              </button>
            )}
          </>
        )}

        {isSalonProfile && (
          <div className={styles.footer}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBook(service);
              }}
              className={`btn btn-primary ${styles.salonProfileBookButton}`}
            >
              Book Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
