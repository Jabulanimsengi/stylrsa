'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHeart, FaEye, FaMapMarkerAlt, FaShare, FaStar, FaPhone, FaWhatsapp } from 'react-icons/fa';
import { Trend, Salon } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import ImageLightbox from '@/components/ImageLightbox';
import styles from './TrendDetailPage.module.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getImageWithFallback } from '@/lib/placeholders';
import { getSalonUrl } from '@/utils/salonUrl';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';

type RecommendedSalon = Salon & {
  distance?: number;
  isPremium?: boolean;
  services?: Array<{ id: string; title?: string; price?: number }>;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TrendDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [trend, setTrend] = useState<Trend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [recommendedSalons, setRecommendedSalons] = useState<RecommendedSalon[]>([]);
  const [salonsLoading, setSalonsLoading] = useState(false);
  const [showSalons, setShowSalons] = useState(false);
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const { coordinates } = useGeolocation(false);

  const fetchTrend = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trends/${resolvedParams.id}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setTrend(data);
        setIsLiked(data.isLiked || false);
        setLikeCount(data.likeCount);
      } else {
        toast.error('Trend not found');
        router.push('/');
      }
    } catch {
      toast.error('Failed to load trend');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id, router]);

  const handleLike = async () => {
    if (authStatus !== 'authenticated') {
      toast.info('Please log in to like trends');
      openModal('login');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const previousState = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const endpoint = isLiked
        ? `/api/trends/${resolvedParams.id}/unlike`
        : `/api/trends/${resolvedParams.id}/like`;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to update like status');
      }
    } catch {
      // Revert on error
      setIsLiked(previousState);
      setLikeCount(previousCount);
      toast.error('Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const fetchRecommendedSalons = useCallback(async () => {
    if (!trend) return;
    
    setSalonsLoading(true);
    try {
      let url = `/api/trends/${resolvedParams.id}/salons`;
      
      // Add geolocation and radius parameters
      const params = new URLSearchParams();
      if (coordinates) {
        params.append('lat', coordinates.latitude.toString());
        params.append('lon', coordinates.longitude.toString());
        params.append('radius', '25'); // Start with 25km radius
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, { credentials: 'include' });

      if (res.ok) {
        const data = await res.json();
        setRecommendedSalons(data);
      } else {
        console.error('Failed to fetch salons:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch salons:', error);
    } finally {
      setSalonsLoading(false);
    }
  }, [trend, resolvedParams.id, coordinates]);

  useEffect(() => {
    void fetchTrend();
  }, [fetchTrend]);

  useEffect(() => {
    if (trend && showSalons) {
      void fetchRecommendedSalons();
    }
  }, [trend, showSalons, fetchRecommendedSalons]);

  const handleFindSalons = async () => {
    // Track click-through
    try {
      await fetch(`/api/trends/${resolvedParams.id}/click`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      console.error('Failed to track click');
    }

    // Show salons section and fetch salons
    setShowSalons(true);
    
    // Fetch salons if not already loaded
    if (recommendedSalons.length === 0) {
      await fetchRecommendedSalons();
    }
    
    // Scroll to salons section
    setTimeout(() => {
      const salonsSection = document.getElementById('recommended-salons');
      salonsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSalonClick = async (salonId: string) => {
    // Track salon click
    try {
      await fetch(`/api/trends/${resolvedParams.id}/salons/${salonId}/click`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      console.error('Failed to track salon click');
    }
  };

  const getLocationContext = () => {
    if (!coordinates || !recommendedSalons.length) return '';
    
    const nearestSalon = recommendedSalons[0];
    if (nearestSalon?.distance !== undefined) {
      if (nearestSalon.distance <= 25) {
        return '(Near You)';
      } else if (nearestSalon.distance <= 50) {
        return '(Within 50km)';
      } else {
        return `(In ${nearestSalon.province || 'Your Region'})`;
      }
    }
    return '(Recommended)';
  };

  const handleShareCopy = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (!trend) {
    return null;
  }

  const categoryLabel = trend.category.replace(/_/g, ' ');
  const ageGroupLabels = trend.ageGroups.map((ag) => ag.replace(/_/g, ' ')).join(', ');

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <OptimizedImage
              src={transformCloudinary(trend.images[0], {
                width: 1000,
                quality: 'auto',
                format: 'auto',
                crop: 'fill',
              })}
              alt={trend.title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 500px"
              priority
              onClick={() => openLightbox(0)}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {trend.images.length > 1 && (
            <div className={styles.thumbnailGrid}>
              {trend.images.slice(1, 5).map((img, index) => (
                <div
                  key={index}
                  className={styles.thumbnail}
                  onClick={() => openLightbox(index + 1)}
                >
                  <OptimizedImage
                    src={transformCloudinary(img, {
                      width: 300,
                      height: 300,
                      crop: 'fill',
                    })}
                    alt={`${trend.title} ${index + 2}`}
                    fill
                    className={styles.thumbnailImage}
                    sizes="(max-width: 768px) 100px, 150px"
                  />
                  {index === 3 && trend.images.length > 5 && (
                    <div className={styles.moreOverlay}>
                      +{trend.images.length - 5} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.header}>
            <div>
              <p className={styles.category}>{categoryLabel}</p>
              <h1 className={styles.title}>{trend.title}</h1>
              {trend.styleName && (
                <p className={styles.styleName}>{trend.styleName}</p>
              )}
            </div>

            <div className={styles.actions}>
              <button
                onClick={handleLike}
                className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                disabled={isLiking}
              >
                <FaHeart /> {likeCount.toLocaleString()}
              </button>
              <button onClick={handleShareCopy} className={styles.shareButton} title="Copy link">
                <FaShare />
              </button>
            </div>
          </div>

          <div className={styles.stats}>
            <span>
              <FaEye /> {trend.viewCount.toLocaleString()} views
            </span>
            <span>Age Groups: {ageGroupLabels}</span>
          </div>

          <div className={styles.description}>
            <h3>About This Style</h3>
            <p>{trend.description}</p>
          </div>

          {trend.tags.length > 0 && (
            <div className={styles.tags}>
              {trend.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <button onClick={handleFindSalons} className={styles.findSalonsButton}>
            <FaMapMarkerAlt /> Open Salon Map For This Style
          </button>
        </div>
      </div>

      {showSalons && (
        <div id="recommended-salons" className={styles.salonsSection}>
          <h2 className={styles.salonsTitle}>
            Salons Offering This Style {coordinates && getLocationContext()}
          </h2>

          {salonsLoading ? (
            <div className={styles.salonsLoading}>
              <LoadingSpinner size="md" color="primary" inline />
            </div>
          ) : recommendedSalons.length === 0 ? (
            <div className={styles.noSalons}>
              <p>No salons found offering this style yet.</p>
              <p>This could be because:</p>
              <ul>
                <li>No salons in your area offer this specific style</li>
                <li>Salons haven't updated their service categories</li>
                <li>This is a newer trend that hasn't been adopted locally yet</li>
              </ul>
              <p>Try browsing all salons in your area or contact your favorite salon to request this style!</p>
              <Link href="/salons" className={styles.browseSalonsLink}>
                Browse All Salons
              </Link>
            </div>
          ) : (
            <div className={styles.salonsGrid}>
              {recommendedSalons.map((salon) => (
                <Link
                  key={salon.id}
                  href={getSalonUrl(salon)}
                  className={styles.salonCard}
                  onClick={() => handleSalonClick(salon.id)}
                >
                  <div className={styles.salonImage}>
                    <OptimizedImage
                      src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), {
                        width: 400,
                        height: 300,
                        crop: 'fill',
                      })}
                      alt={salon.name}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {salon.isPremium && (
                      <div className={styles.premiumBadge}>Featured</div>
                    )}
                  </div>

                  <div className={styles.salonInfo}>
                    <h3>{salon.name}</h3>
                    <p className={styles.location}>
                      <FaMapMarkerAlt /> {salon.city}, {salon.province}
                      {salon.distance !== undefined && salon.distance < 999999 && (
                        <span className={styles.distance}>
                          • {salon.distance < 1 ? '<1km' : `${Math.round(salon.distance)}km`} away
                        </span>
                      )}
                    </p>

                    {(salon.avgRating ?? 0) > 0 && (
                      <div className={styles.rating}>
                        <FaStar /> {(() => {
                          const rating = salon.avgRating ?? 0;
                          return rating.toFixed(1);
                        })()} ({salon.reviewCount} reviews)
                      </div>
                    )}

                    {salon.services && salon.services.length > 0 && (
                      <div className={styles.services}>
                        <p className={styles.servicesLabel}>Related Services:</p>
                        {salon.services.slice(0, 2).map((service) => (
                          <span key={service.id} className={styles.serviceTag}>
                            {service.title || 'Service'} - R{service.price ?? 0}
                          </span>
                        ))}
                        {salon.services.length > 2 && (
                          <span className={styles.moreServices}>
                            +{salon.services.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className={styles.salonActions}>
                      {salon.phoneNumber && (
                        <span className={styles.contactIcon}>
                          <FaPhone />
                        </span>
                      )}
                      {salon.whatsapp && (
                        <span className={styles.contactIcon}>
                          <FaWhatsapp />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          images={trend.images}
          initialImageIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
