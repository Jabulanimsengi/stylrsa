'use client';

import { useState, useEffect } from 'react';
import PageNav from '@/components/PageNav';
import PromotionCard, { Promotion, PromotionCardSkeleton } from '@/components/PromotionCard';
import ImageLightbox from '@/components/ImageLightbox';
import BookingModal from '@/components/BookingModal';
import { Service, Salon } from '@/types';
import styles from './promotions.module.css';
import EmptyState from '@/components/EmptyState/EmptyState';
import { notify } from '@/lib/notify';

type PromotionServiceSummary = NonNullable<Promotion['service']>;

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'services' | 'products'>('all');
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/promotions/public?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        // Only show error for actual failures, not for empty data
        if (response.status !== 404) {
          throw new Error('Failed to fetch promotions');
        }
      }

      const data = await response.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      // Only show error toast for network/server errors
      console.error('Error fetching promotions:', error);
      setPromotions([]); // Set empty array instead of showing error
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPromotions();
  };

  const handleImageClick = (images: string[], startIndex: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setIsLightboxOpen(true);
  };



  const handleBookNow = (salonData: Salon, service: PromotionServiceSummary) => {
    setSelectedSalon(salonData);
    setSelectedService({
      id: service.id,
      title: service.title,
      name: service.title,
      description: '',
      price: 0,
      duration: 60,
      salonId: service.salon.id,
      createdAt: '',
      updatedAt: '',
      images: service.images,
      salon: {
        id: service.salon.id,
        name: service.salon.name,
        ownerId: salonData.ownerId,
        city: service.salon.city,
        province: service.salon.province,
        slug: service.salon.slug,
      },
    } as Service);
  };

  const handleBookingClose = () => {
    setSelectedSalon(null);
    setSelectedService(null);
  };

  const handleBookingSuccess = () => {
    notify.success('Booking request sent. The salon will confirm shortly.');
    handleBookingClose();
  };

  const filteredPromotions = promotions.filter((promo) => {
    if (filter === 'services') return Boolean(promo.service);
    if (filter === 'products') return Boolean(promo.product);
    return true;
  });

  return (
    <div className={styles.container}>
      <PageNav />
      
      <div className={styles.header}>
        <h1 className={styles.title}>Special Promotions</h1>
        <p className={styles.subtitle}>
          Discover amazing deals on services and products
        </p>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Promotions
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'services' ? styles.active : ''}`}
            onClick={() => setFilter('services')}
          >
            Services
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'products' ? styles.active : ''}`}
            onClick={() => setFilter('products')}
          >
            Products
          </button>
        </div>
        <button
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh promotions"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isLoading ? styles.spinning : ''}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <PromotionCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredPromotions.length === 0 ? (
        <EmptyState
          variant="no-promotions"
          title="No Promotions Available"
          description="Salon owners haven't created any promotions at the moment. Check back soon for exciting deals and discounts!"
        />
      ) : (
        <>
          <div className={styles.resultCount}>
            {filteredPromotions.length} promotion{filteredPromotions.length !== 1 ? 's' : ''} available
          </div>
          <div className={styles.grid}>
            {filteredPromotions.map((promotion) => (
              <PromotionCard 
                key={promotion.id} 
                promotion={promotion}
                onImageClick={handleImageClick}
                onBookNow={handleBookNow}
              />
            ))}
          </div>
        </>
      )}

      {isLightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}

      {selectedSalon && selectedService && (
        <BookingModal
          salon={selectedSalon}
          service={selectedService}
          services={[selectedService]}
          onClose={handleBookingClose}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

