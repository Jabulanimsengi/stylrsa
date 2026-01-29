'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaHeart, FaMapMarkerAlt, FaCar } from 'react-icons/fa';
import { transformCloudinary } from '@/utils/cloudinary';
import { getImageWithFallback } from '@/lib/placeholders';
import { Salon, Service } from '@/types';
import { getSalonUrl } from '@/utils/salonUrl';
import styles from './DetailedSalonCard.module.css';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface DetailedSalonCardProps {
  salon: SalonWithFavorite;
  onToggleFavorite?: (e: React.MouseEvent, salonId: string) => void;
  onBook?: (service: Service) => void;
}

export default function DetailedSalonCard({ salon, onToggleFavorite, onBook }: DetailedSalonCardProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const router = useRouter();
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  // Fetch salon services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const res = await fetch(`/api/services/salon/${salon.id}?limit=3`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, [salon.id]);

  const handleCardClick = () => {
    router.push(getSalonUrl(salon));
  };

  const handleBookService = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      toast.info('Please log in to book a service.');
      openModal('login');
      return;
    }

    if (onBook) {
      onBook(service);
    }
  };

  const mapsHref = salon.latitude && salon.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon.name} ${salon.city} ${salon.province}`)}`;

  return (
    <div className={styles.detailedCard}>
      {/* Salon Image */}
      <div className={styles.imageSection} onClick={handleCardClick}>
        {onToggleFavorite && (
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
        {salon.avgRating !== undefined && salon.reviewCount !== undefined && salon.reviewCount > 0 && (
          <div className={styles.ratingBadge}>
            <div className={styles.ratingValue}>{salon.avgRating.toFixed(1)}</div>
            <div className={styles.reviewCount}>{salon.reviewCount} {salon.reviewCount === 1 ? 'review' : 'reviews'}</div>
          </div>
        )}
        <Image
          src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), {
            width: 800,
            quality: 'auto',
            format: 'auto',
            crop: 'fill'
          })}
          alt={`A photo of ${salon.name}`}
          className={styles.salonImage}
          fill
          sizes="(max-width: 768px) 100vw, 558px"
        />
      </div>

      {/* Salon Details */}
      <div className={styles.detailsSection}>
        {/* Header */}
        <div className={styles.salonHeader}>
          {salon.offersMobile && (
            <div className={styles.mobileBadge}>
              <FaCar /> Mobile service
            </div>
          )}
          <h2 className={styles.salonName} onClick={handleCardClick}>
            {salon.name}
          </h2>
          <div className={styles.locationInfo}>
            <FaMapMarkerAlt />
            <span>{salon.distance !== null && salon.distance !== undefined
              ? `${salon.distance < 1 ? `${Math.round(salon.distance * 1000)}m` : `${salon.distance.toFixed(1)}km`} mi • ${salon.address || salon.town}, ${salon.city}`
              : `${salon.address || salon.town}, ${salon.city}`}
            </span>
          </div>
        </div>

        {/* Services List */}
        <div className={styles.servicesList}>
          {isLoadingServices ? (
            <div className={styles.loadingServices}>
              <div className={styles.skeletonService}></div>
              <div className={styles.skeletonService}></div>
              <div className={styles.skeletonService}></div>
            </div>
          ) : services.length > 0 ? (
            <>
              {services.map((service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <div className={styles.serviceInfo}>
                    <h3 className={styles.serviceName}>{service.name}</h3>
                    {service.offersMobile && (
                      <div className={styles.serviceMobileBadge}>
                        <FaCar /> Mobile service
                      </div>
                    )}
                  </div>
                  <div className={styles.serviceActions}>
                    <span className={styles.servicePrice}>
                      R{service.price?.toFixed(2) || '0.00'}
                    </span>
                    <span className={styles.serviceDuration}>{service.durationMinutes || 60}min</span>
                    <button
                      className={styles.bookButton}
                      onClick={(e) => handleBookService(e, service)}
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
              <button
                className={styles.viewAllServicesButton}
                onClick={handleCardClick}
              >
                View all services →
              </button>
            </>
          ) : (
            <p className={styles.noServices}>No services available</p>
          )}
        </div>
      </div>
    </div>
  );
}
