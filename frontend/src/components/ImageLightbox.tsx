'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './ImageLightbox.module.css';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';

interface ImageLightboxProps {
  images: string[];
  initialImageIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialImageIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  }, [images.length]);

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
      } else if (images.length > 1) {
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
  }, [goToNext, goToPrevious, onClose, images.length]);


  // Update currentIndex when initialImageIndex changes
  useEffect(() => {
    if (initialImageIndex !== undefined && initialImageIndex >= 0 && initialImageIndex < images.length) {
      setCurrentIndex(initialImageIndex);
    }
  }, [initialImageIndex, images.length]);

  // Reset loading state when image changes
  useEffect(() => {
    setIsLoading(true);
    setImageError(false);
  }, [currentIndex]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  if (!images || images.length === 0 || !mounted) return null;

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
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            className={styles.image}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              width: 'auto', 
              height: 'auto',
              display: isLoading ? 'none' : 'block'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className={styles.counter}>
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
      
      <button className={styles.closeButton} onClick={(e) => { e.stopPropagation(); onClose(); }}><FaTimes /></button>

      {images.length > 1 && (
        <>
          <button className={`${styles.navButton} ${styles.prevButton}`} onClick={(e) => { e.stopPropagation(); handlePreviousClick(e); }} aria-label="Previous image"><FaChevronLeft /></button>
          <button className={`${styles.navButton} ${styles.nextButton}`} onClick={(e) => { e.stopPropagation(); handleNextClick(e); }} aria-label="Next image"><FaChevronRight /></button>
        </>
      )}
    </div>
  );

  return createPortal(lightboxContent, document.body);
}