'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './ImageLightbox.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';
import MobileCloseButton from './MobileCloseButton';

interface ImageLightboxProps {
  images: string[];
  initialImageIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialImageIndex = 0, onClose }: ImageLightboxProps) {
  const sanitizedImages = useMemo(
    () =>
      images.filter((image): image is string => (
        typeof image === 'string' &&
        image.trim().length > 0 &&
        image !== 'null' &&
        image !== 'undefined'
      )),
    [images],
  );

  const getSafeIndex = useCallback(
    (index: number) => {
      if (sanitizedImages.length === 0) {
        return 0;
      }

      if (index < 0) {
        return 0;
      }

      if (index >= sanitizedImages.length) {
        return sanitizedImages.length - 1;
      }

      return index;
    },
    [sanitizedImages.length],
  );

  const [currentIndex, setCurrentIndex] = useState(() => getSafeIndex(initialImageIndex));
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? sanitizedImages.length - 1 : prevIndex - 1,
    );
  }, [sanitizedImages.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === sanitizedImages.length - 1 ? 0 : prevIndex + 1,
    );
  }, [sanitizedImages.length]);

  const handlePreviousClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToPrevious();
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToNext();
  };

  useEffect(() => {
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (sanitizedImages.length > 1) {
        // Only allow navigation if there are multiple images
        if (e.key === 'ArrowLeft') {
          goToPrevious();
        } else if (e.key === 'ArrowRight') {
          goToNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious, onClose, sanitizedImages.length]);


  // Update currentIndex when initialImageIndex changes
  useEffect(() => {
    setCurrentIndex(getSafeIndex(initialImageIndex));
  }, [getSafeIndex, initialImageIndex]);

  // Reset loading state when image changes
  useEffect(() => {
    setIsLoading(true);
    setImageError(false);
  }, [currentIndex, sanitizedImages]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  if (!sanitizedImages.length || !mounted) return null;

  const currentImage = sanitizedImages[currentIndex];

  const lightboxContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageWrapper}>
          {isLoading && !imageError && (
            <div className={styles.loadingSpinner}>
              <LoadingSpinner size="lg" color="white" inline />
            </div>
          )}
          {imageError && (
            <div className={styles.errorMessage}>
              Failed to load image
            </div>
          )}
          <img
            src={currentImage}
            alt={`Image ${currentIndex + 1} of ${sanitizedImages.length}`}
            className={styles.image}
            style={{
              opacity: isLoading ? 0 : 1,
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
        
        {/* Dot indicators */}
        {sanitizedImages.length > 1 && (
          <div className={styles.dotsContainer}>
            {sanitizedImages.map((_, idx) => (
              <span
                key={idx}
                className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <MobileCloseButton className={styles.closeButton} onClick={(e) => { e.stopPropagation(); onClose(); }} label="Close lightbox" />

      {sanitizedImages.length > 1 && (
        <>
          <button className={`${styles.navButton} ${styles.prevButton}`} onClick={(e) => { e.stopPropagation(); handlePreviousClick(e); }} aria-label="Previous image"><FaChevronLeft /></button>
          <button className={`${styles.navButton} ${styles.nextButton}`} onClick={(e) => { e.stopPropagation(); handleNextClick(e); }} aria-label="Next image"><FaChevronRight /></button>
        </>
      )}
    </div>
  );

  return createPortal(lightboxContent, document.body);
}
