'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './FeaturedServicesCategoryRow.module.css';
import FeaturedServiceCard from '@/components/FeaturedServiceCard';
import { Service } from '@/types';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { getCategorySlug } from '@/utils/categorySlug';
import { throttle } from '@/utils/throttle';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

type ServiceWithSalon = Service & { salon: { id: string; name: string; city: string; province: string } };

interface FeaturedServicesCategoryRowProps {
  categoryName: string;
  services: ServiceWithSalon[];
  categorySlug?: string;
}

export default function FeaturedServicesCategoryRow({ categoryName, services, categorySlug }: FeaturedServicesCategoryRowProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const { showPageLoader } = useNavigationLoading();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);

  // State for scroll position tracking
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Function to calculate arrow visibility
  const updateScrollState = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    // Check if we can scroll left (threshold: 10px)
    const newCanScrollLeft = scrollLeft > 10;
    const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - 10;

    // Only update state if values changed to prevent unnecessary re-renders
    setCanScrollLeft(prev => prev !== newCanScrollLeft ? newCanScrollLeft : prev);
    setCanScrollRight(prev => prev !== newCanScrollRight ? newCanScrollRight : prev);

    // Calculate active index for mobile slide counter
    if (isMobile) {
      const firstCard = scrollContainerRef.current.firstElementChild as HTMLElement;
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = 16; // 1rem gap in pixels
        const cardWithGap = cardWidth + gap;
        if (cardWithGap > 0) {
          const index = Math.round(scrollLeft / cardWithGap);
          const newIndex = Math.min(index, services.length - 1);
          setActiveIndex(prev => prev !== newIndex ? newIndex : prev);
        }
      }
    }
  }, [isMobile, services.length]);

  // Create throttled scroll handler using useRef to maintain same function reference
  const throttledScrollHandlerRef = useRef(
    throttle(() => {
      updateScrollState();
    }, 100)
  );

  // Update the throttled handler when updateScrollState changes
  useEffect(() => {
    throttledScrollHandlerRef.current = throttle(() => {
      updateScrollState();
    }, 100);
  }, [updateScrollState]);

  // Scroll event handler
  const handleScroll = useCallback(() => {
    throttledScrollHandlerRef.current();
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial state calculation
    updateScrollState();

    // Add scroll listener
    container.addEventListener('scroll', handleScroll);

    // Cleanup on unmount
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, updateScrollState]);

  // Recalculate on window resize with throttling
  const throttledResizeHandlerRef = useRef(
    throttle(() => {
      updateScrollState();
    }, 100)
  );

  useEffect(() => {
    throttledResizeHandlerRef.current = throttle(() => {
      updateScrollState();
    }, 100);
  }, [updateScrollState]);

  useEffect(() => {
    const handleResize = () => {
      throttledResizeHandlerRef.current();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Scroll navigation functions
  const scrollLeft = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, []);

  // Handle View All button click
  const handleViewAll = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const slug = categorySlug || getCategorySlug(categoryName);
    showPageLoader();
    router.push(`/services?category=${slug}`);
  }, [categorySlug, categoryName, router, showPageLoader]);

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className={styles.categorySection}>
      <div className={styles.categoryHeader}>
        <h3 className={styles.categoryTitle}>{categoryName}</h3>
        <button 
          className={styles.viewAllButton} 
          onClick={handleViewAll}
          aria-label={`View all ${categoryName} services`}
        >
          View All
        </button>
      </div>
      <div className={styles.carouselContainer}>
        {/* Desktop navigation arrows - show when not mobile and can scroll */}
        {!isMobile && canScrollLeft && (
          <button 
            ref={leftButtonRef}
            className={`${styles.scrollButton} ${styles.left} ${styles.desktop}`} 
            onClick={scrollLeft} 
            aria-label={`Scroll ${categoryName} services left`}
          >
            <FaChevronLeft />
          </button>
        )}
        <div className={styles.servicesGrid} ref={scrollContainerRef}>
          {services.map((service) => (
            <FeaturedServiceCard key={service.id} service={service} />
          ))}
        </div>
        {!isMobile && canScrollRight && (
          <button 
            ref={rightButtonRef}
            className={`${styles.scrollButton} ${styles.right} ${styles.desktop}`} 
            onClick={scrollRight} 
            aria-label={`Scroll ${categoryName} services right`}
          >
            <FaChevronRight />
          </button>
        )}
        
        {/* Mobile navigation arrows - show when mobile and can scroll */}
        {isMobile && services.length > 1 && canScrollLeft && (
          <button 
            className={`${styles.scrollButton} ${styles.left} ${styles.mobile}`} 
            onClick={scrollLeft} 
            aria-label={`Scroll ${categoryName} services left`}
          >
            <FaChevronLeft />
          </button>
        )}
        {isMobile && services.length > 1 && canScrollRight && (
          <button 
            className={`${styles.scrollButton} ${styles.right} ${styles.mobile}`} 
            onClick={scrollRight} 
            aria-label={`Scroll ${categoryName} services right`}
          >
            <FaChevronRight />
          </button>
        )}
        
        {/* Mobile slide counter - show only on mobile devices */}
        {isMobile && services.length > 1 && (
          <div 
            className={styles.slideCounter}
            aria-live="polite"
            aria-atomic="true"
          >
            {activeIndex + 1}/{services.length}
          </div>
        )}
      </div>
    </div>
  );
}

