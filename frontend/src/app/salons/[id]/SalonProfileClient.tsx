"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { transformCloudinary } from '@/utils/cloudinary';
import {
  FaHeart,
  FaWhatsapp,
  FaGlobe,
  FaMapMarkerAlt,
  FaClock,
  FaBolt,
  FaRegCopy,
  FaExternalLinkAlt,
  FaPlay,
  FaPhone,
  FaChevronDown,
  FaCamera,
  FaStar,
  FaTruck,
  FaDirections,
} from 'react-icons/fa';
import { Salon, Service, GalleryImage, Review } from '@/types';
import BookingModal from '@/components/BookingModal/BookingModal';
import styles from './SalonProfile.module.css';
import booksyStyles from './BooksyLayout.module.css';
import Accordion from '@/components/Accordion';
import ServiceCard from '@/components/ServiceCard';
import SimpleServiceList from '@/components/SimpleServiceList/SimpleServiceList';
import FreshaServiceList from '@/components/FreshaServiceList';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';
import ImageLightbox from '@/components/ImageLightbox';
import VideoLightbox from '@/components/VideoLightbox/VideoLightbox';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';

import SalonProfileSkeleton from '@/components/Skeleton/SalonProfileSkeleton';
import { sanitizeText } from '@/lib/sanitize';
import PageNav from '@/components/PageNav';
import PromotionDetailsModal from '@/components/PromotionDetailsModal/PromotionDetailsModal';
import BookingConfirmationModal from '@/components/BookingConfirmationModal/BookingConfirmationModal';
import CalendarSchedule from '@/components/CalendarSchedule/CalendarSchedule';
import TrustBadges from '@/components/TrustBadges/TrustBadges';
import SocialShare from '@/components/SocialShare/SocialShare';
import VerificationBadge from '@/components/VerificationBadge/VerificationBadge';
import TeamMembers from '@/components/TeamMembers/TeamMembers';
import BooksySidebar, { HeroGallery, SalonInfoHeader, BooksyReviewsSection, StickyTabNavigation, AboutSection } from './BooksyComponents';
import MobileSalonProfile from './MobileSalonProfile';
import mobileStyles from './MobileSalonProfile.module.css';

type Props = {
  initialSalon: Salon | null;
  salonId: string;
};

const INITIAL_SERVICES_BATCH = 12;
const SERVICES_BATCH_SIZE = 8;
const INITIAL_REVIEWS_BATCH = 4;
const REVIEWS_BATCH_SIZE = 4;
const EMPTY_REVIEWS: Review[] = [];

export default function SalonProfileClient({ initialSalon, salonId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();

  const [salon, setSalon] = useState<Salon | null>(initialSalon);
  const [services, setServices] = useState<Service[]>(initialSalon?.services ?? []);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(initialSalon?.gallery ?? []);

  const [salonVideos, setSalonVideos] = useState<any[]>([]);
  const [isVideoLightboxOpen, setIsVideoLightboxOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!initialSalon);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [showWeek, setShowWeek] = useState(false);
  const [promotionsMap, setPromotionsMap] = useState<Map<string, any>>(new Map());
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [pendingBookingService, setPendingBookingService] = useState<Service | null>(null);
  const [visibleServicesCount, setVisibleServicesCount] = useState(() => {
    const initialCount = initialSalon?.services?.length ?? 0;
    return initialCount > 0 ? Math.min(INITIAL_SERVICES_BATCH, initialCount) : 0;
  });
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(() => {
    const initialCount = initialSalon?.reviews?.length ?? 0;
    return initialCount > 0 ? Math.min(INITIAL_REVIEWS_BATCH, initialCount) : 0;
  });
  const serviceLoadRef = useRef<HTMLDivElement | null>(null);
  const reviewLoadRef = useRef<HTMLDivElement | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [activeSection, setActiveSection] = useState('services-section');

  const reviews = salon?.reviews ?? EMPTY_REVIEWS;

  // Handle quick rebook via URL params (e.g., ?serviceId=xxx)
  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    if (serviceId && services.length > 0 && !showBookingModal) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
        setShowBookingModal(true);
        // Clean URL after opening modal
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [searchParams, services, showBookingModal]);

  useEffect(() => {
    let isActive = true;

    const applySalon = (data: Salon | null) => {
      if (!isActive) return;
      setSalon(data);
      setServices(data?.services ?? []);
      setGalleryImages(data?.gallery ?? []);
      setIsLoading(false);
    };

    if (initialSalon) {
      applySalon(initialSalon);
      return () => {
        isActive = false;
      };
    }

    const loadSalon = async (retryCount = 0) => {
      setIsLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const res = await fetch(`/api/salons/${salonId}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Failed to load salon: ${res.status}`);
        }
        const data: Salon = await res.json();
        applySalon(data);
        // Note: Salon media (before/after photos, videos) is fetched by a separate useEffect
        // that triggers when salon.id becomes available
      } catch (error: any) {
        clearTimeout(timeoutId);

        // Handle timeout specifically
        if (error.name === 'AbortError') {
          logger.error('Salon fetch timed out', { salonId, retryCount });
          if (retryCount < 2 && isActive) {
            // Retry with longer timeout on subsequent attempts
            setTimeout(() => loadSalon(retryCount + 1), 2000);
            return;
          }
          if (isActive) {
            toast.error('Loading is taking longer than expected. The server may be starting up - please try refreshing.');
            applySalon(null);
          }
          return;
        }

        logger.error('Failed to load salon', error);
        // Retry once after a short delay (backend might be waking up)
        if (retryCount < 2 && isActive) {
          setTimeout(() => loadSalon(retryCount + 1), 2000);
          return;
        }
        if (isActive) {
          toast.error(toFriendlyMessage(error, 'Unable to load salon details. Please refresh the page.'));
          applySalon(null);
        }
      }
    };

    void loadSalon();

    return () => {
      isActive = false;
    };
  }, [initialSalon, salonId]);

  useEffect(() => {
    setVisibleServicesCount((prev) => {
      if (services.length === 0) return 0;
      if (prev === 0) {
        return Math.min(INITIAL_SERVICES_BATCH, services.length);
      }
      return Math.min(prev, services.length);
    });
  }, [services.length]);

  useEffect(() => {
    setVisibleReviewsCount((prev) => {
      if (reviews.length === 0) return 0;
      if (prev === 0) {
        return Math.min(INITIAL_REVIEWS_BATCH, reviews.length);
      }
      return Math.min(prev, reviews.length);
    });
  }, [reviews.length]);

  // removed hero slider auto-advance

  useEffect(() => {
    if (!salon?.id || !socket) return;
    socket.emit('joinSalonRoom', salon.id);
    socket.on('availabilityUpdate', (data: { isAvailableNow: boolean }) => {
      setSalon(prev => prev ? { ...prev, isAvailableNow: data.isAvailableNow } : null);
    });
    return () => {
      socket.emit('leaveSalonRoom', salon.id);
      socket.off('availabilityUpdate');
    };
  }, [socket, salon?.id]);

  // Fetch active promotions for this salon
  useEffect(() => {
    if (!salonId) return;

    const fetchPromotions = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/promotions/public?salonId=${salonId}&t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (res.ok) {
          const data = await res.json();
          const promoMap = new Map();
          data.forEach((promo: any) => {
            if (promo.serviceId) {
              promoMap.set(promo.serviceId, promo);
            }
          });
          setPromotionsMap(promoMap);
        }
      } catch (error) {
        logger.error('Failed to fetch promotions', error);
        // Silently fail - promotions are not critical
      }
    };

    void fetchPromotions();
  }, [salonId]);

  // Fetch salon media (before/after photos, videos)
  // Use salon.id (UUID) instead of salonId (could be slug) for API queries
  useEffect(() => {
    if (!salon?.id) return;

    const fetchSalonMedia = async () => {
      try {
        // Fetch videos for this salon using the actual UUID
        const videosRes = await fetch(`/api/videos/approved?salonId=${salon.id}&limit=50`);
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          setSalonVideos(videosData);
        }
      } catch (error) {
        logger.error('Failed to fetch salon media', error);
        // Silently fail - media is not critical
      }
    };

    void fetchSalonMedia();
  }, [salon?.id]);

  // Refetch salon data when page becomes visible (fixes operating hours not updating)
  useEffect(() => {
    let isActive = true;

    const refetchSalon = async () => {
      try {
        const res = await fetch(`/api/salons/${salonId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data: Salon = await res.json();
        if (isActive) {
          setSalon(data);
          setServices(data?.services ?? []);
          setGalleryImages(data?.gallery ?? []);
        }
      } catch (error) {
        logger.error('Failed to refetch salon on visibility change', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && salon) {
        void refetchSalon();
      }
    };

    const handleFocus = () => {
      if (salon) {
        void refetchSalon();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [salonId, salon]);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxImages([]);
    setLightboxStartIndex(0);
  };

  const openVideoLightbox = (video: any) => {
    setSelectedVideo(video);
    setIsVideoLightboxOpen(true);
  };

  const closeVideoLightbox = () => {
    setIsVideoLightboxOpen(false);
    setSelectedVideo(null);
  };

  const handleBookClick = (service: Service) => {
    if (authStatus !== 'authenticated') {
      openModal('login');
    } else {
      // Check if salon has a booking message
      if (salon?.bookingMessage) {
        // Show confirmation modal first
        setPendingBookingService(service);
        setShowBookingConfirmation(true);
      } else {
        // Open booking modal directly
        setSelectedService(service);
        setShowBookingModal(true);
      }
    }
  };

  // Handler for multi-service booking from FreshaServiceList
  const handleMultiServiceBook = (selectedSvcs: Service[]) => {
    if (authStatus !== 'authenticated') {
      openModal('login');
      return;
    }

    if (selectedSvcs.length === 0) {
      toast.warning('Please select at least one service');
      return;
    }

    // Store selected services
    setSelectedServices(selectedSvcs);

    // For now, use the first service as the primary booking service
    // TODO: Update backend to support multi-service bookings
    const primaryService = selectedSvcs[0];

    if (salon?.bookingMessage) {
      setPendingBookingService(primaryService);
      setShowBookingConfirmation(true);
    } else {
      setSelectedService(primaryService);
      setShowBookingModal(true);
    }
  };

  const handlePromotionClick = (promotion: any) => {
    setSelectedPromotion(promotion);
    setIsPromotionModalOpen(true);
  };

  const handlePromotionBookNow = () => {
    // Called when user clicks "Book Now" in promotion details modal
    if (!selectedPromotion?.service) return;

    if (salon?.bookingMessage) {
      // Show confirmation modal
      setPendingBookingService(selectedPromotion.service);
      setShowBookingConfirmation(true);
    } else {
      // Open booking modal directly
      setSelectedService(selectedPromotion.service);
      setShowBookingModal(true);
    }
  };

  const handleBookingConfirmationAccept = () => {
    setShowBookingConfirmation(false);
    if (pendingBookingService) {
      setSelectedService(pendingBookingService);
      setShowBookingModal(true);
      setPendingBookingService(null);
    }
  };

  const handleBookingConfirmationClose = () => {
    setShowBookingConfirmation(false);
    setPendingBookingService(null);
  };

  const handleToggleFavorite = async () => {
    if (authStatus !== 'authenticated') {
      toast.info('Please log in to add to favorites.');
      openModal('login');
      return;
    }
    if (!salon) return;

    const originalFavoritedState = salon.isFavorited;
    setSalon(prev => (prev ? { ...prev, isFavorited: !prev.isFavorited } : null));

    try {
      const res = await fetch(`/api/favorites/toggle/${salon.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update favorite status.');
      const { favorited } = await res.json();
      toast.success(favorited ? 'Added to favorites!' : 'Removed from favorites.');
    } catch {
      toast.error('Could not update favorites.');
      setSalon(prev => (prev ? { ...prev, isFavorited: originalFavoritedState } : null));
    }
  };

  const formatBookingType = (type: string) => {
    if (type === 'ONSITE') return 'This salon offers on-site services.';
    if (type === 'MOBILE') return 'This salon offers mobile services.';
    if (type === 'BOTH') return 'This salon offers both on-site and mobile services.';
    return 'Not Specified';
  };

  const hoursRecord = useMemo(() => {
    const oh = salon?.operatingHours as unknown;
    if (!oh) return null;
    if (Array.isArray(oh)) {
      const rec: Record<string, string> = {};
      (oh as Array<{ day?: string; open?: string; close?: string }>).forEach((it) => {
        const day = it?.day;
        const open = it?.open;
        const close = it?.close;
        if (day && (open || close)) rec[day] = `${open ?? ''} - ${close ?? ''}`.trim();
      });
      return rec;
    }
    if (typeof oh === 'object') {
      const rec: Record<string, string> = {};
      const dayMap: Record<string, string> = {
        sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
        thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday',
      };
      Object.entries(oh as Record<string, string>).forEach(([k, v]) => {
        const norm = dayMap[k.trim().toLowerCase().replace(/\./g, '')];
        if (norm) rec[norm] = v;
      });
      return Object.keys(rec).length > 0 ? rec : (oh as Record<string, string>);
    }
    return null;
  }, [salon?.operatingHours]);

  const orderedOperatingDays = useMemo(() => {
    if (!hoursRecord) return [] as string[];
    const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return order.filter((d) => d in hoursRecord);
  }, [hoursRecord]);

  const visibleServices = useMemo(() => {
    return services.filter(s => s.images && s.images.length > 0).slice(0, visibleServicesCount);
  }, [services, visibleServicesCount]);
  const visibleReviews = useMemo(() => reviews.slice(0, visibleReviewsCount), [reviews, visibleReviewsCount]);

  useEffect(() => {
    const node = serviceLoadRef.current;
    if (!node) return;
    if (visibleServicesCount >= services.length) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        setVisibleServicesCount((prev) => Math.min(prev + SERVICES_BATCH_SIZE, services.length));
      }
    }, { rootMargin: '240px 0px' });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [visibleServicesCount, services.length]);

  useEffect(() => {
    const node = reviewLoadRef.current;
    if (!node) return;
    if (visibleReviewsCount >= reviews.length) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        setVisibleReviewsCount((prev) => Math.min(prev + REVIEWS_BATCH_SIZE, reviews.length));
      }
    }, { rootMargin: '200px 0px' });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [visibleReviewsCount, reviews.length]);

  if (isLoading) return <SalonProfileSkeleton />;
  if (!salon) return <div style={{ textAlign: 'center', padding: '2rem' }}>Salon not found.</div>;

  // hero section removed; using compact info board instead
  const availabilityLabel = salon.isAvailableNow ? 'Open now' : 'Currently closed';
  const bookingSummary = (() => {
    const type = salon.bookingType;
    if (type === 'MOBILE') return 'Mobile visits available';
    if (type === 'BOTH') return 'On-site & mobile visits';
    if (type === 'ONSITE') return 'On-site appointments';
    return 'Request-led appointments';
  })();


  const galleryImageUrls = galleryImages.map(img => img.imageUrl);
  const addressText = (() => {
    if (salon.address && salon.address.trim().length > 0) return salon.address;
    const parts = [salon.town, salon.city, salon.province].filter(Boolean);
    return parts.join(', ');
  })();
  const mapsHref = salon.latitude && salon.longitude
    ? `https://www.google.com/maps?q=${salon.latitude},${salon.longitude}`
    : `https://www.google.com/maps?q=${encodeURIComponent(addressText)}`;
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(addressText);
      toast.success('Address copied');
    } catch {
      toast.error('Could not copy address');
    }
  };
  const shareProfile = async () => {
    if (!salon) return;
    const url = `${window.location.origin}/salons/${salon.slug || salon.id}`;
    const text = `Check out ${salon.name} on Stylr SA`;
    try {
      if (navigator.share) {
        await navigator.share({ title: salon.name, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      } catch {
        toast.error('Unable to share link');
      }
    }
  };
  const daysNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayLabel = daysNames[new Date().getDay()];

  return (
    <>
      {showBookingModal && (
        <BookingModal
          salon={salon}
          service={selectedService || undefined}
          services={services}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          onBookingSuccess={() => {
            toast.success('Booking request sent! The salon will confirm shortly.');
            setShowBookingModal(false);
            setSelectedService(null);
          }}
        />
      )}
      {isLightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxStartIndex}
          onClose={closeLightbox}
        />
      )}

      {isVideoLightboxOpen && selectedVideo && (
        <VideoLightbox
          videoUrl={selectedVideo.videoUrl}
          isOpen={isVideoLightboxOpen}
          onClose={closeVideoLightbox}
        />
      )}

      <PromotionDetailsModal
        promotion={selectedPromotion}
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        salon={salon}
        onBookNow={handlePromotionBookNow}
      />

      <BookingConfirmationModal
        isOpen={showBookingConfirmation}
        onClose={handleBookingConfirmationClose}
        onAccept={handleBookingConfirmationAccept}
        salonName={salon?.name || ''}
        salonLogo={salon?.backgroundImage || undefined}
        message={salon?.bookingMessage || ''}
      />

      {/* Mobile Layout */}
      <MobileSalonProfile
        salon={salon}
        services={services}
        galleryImages={galleryImages}
        reviews={reviews}
        hoursRecord={hoursRecord}
        todayLabel={todayLabel}
        orderedOperatingDays={orderedOperatingDays}
        latitude={salon.latitude}
        longitude={salon.longitude}
        mapsHref={mapsHref}
        onOpenLightbox={openLightbox}
        onBookService={handleBookClick}
        onBookNow={() => {
          if (authStatus !== 'authenticated') {
            openModal('login');
          } else if (services.length > 0) {
            setSelectedService(null);
            setShowBookingModal(true);
          }
        }}
      />

      {/* Desktop Layout */}
      <div className={mobileStyles.desktopProfile}>
        <PageNav />
        <div className={styles.stickyHeaderContent}>
          <div className={styles.headerLeftSection}>
            {salon.logo && !logoError ? (
              <div
                className={styles.logoWrapper}
                onClick={() => openLightbox([salon.logo || ''], 0)}
                style={{ cursor: 'pointer' }}
                title="Click to view full logo"
              >
                <Image
                  src={transformCloudinary(salon.logo, { width: 176, quality: 'auto', format: 'auto' })}
                  alt={`${salon.name} logo`}
                  className={styles.salonLogo}
                  width={88}
                  height={88}
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className={styles.logoPlaceholder}>
                <span>{salon.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className={styles.headerSalonInfo}>
              <h1 className={styles.headerSalonName}>
                {salon.name}
                {salon.isVerified && <VerificationBadge size="small" />}
              </h1>
              {salon.city && (
                <span className={styles.headerSalonLocation}>
                  <FaMapMarkerAlt /> {salon.city}, {salon.province}
                </span>
              )}
            </div>
          </div>
          <div className={styles.headerSpacer}>
            <SocialShare
              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/salons/${salon.slug || salon.id}`}
              title={salon.name}
              description={salon.description || `Check out ${salon.name} on Stylr SA`}
              image={salon.backgroundImage || ''}
              variant="button"
            />
            {authStatus === 'authenticated' && (
              <button onClick={handleToggleFavorite} className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}>
                <FaHeart />
              </button>
            )}
          </div>
        </div>

        <div className={styles.container}>
          {/* Tab Navigation - Switches between different views */}
          <StickyTabNavigation
            activeSection={activeSection}
            onTabClick={(sectionId) => {
              setActiveSection(sectionId);
              // Scroll to top when switching tabs
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            hasPhotos={galleryImages.length > 0}
            hasTeam={true}
            reviewsCount={reviews.length}
          />

          {/* Tabbed Content - Only show active section */}
          <div className={booksyStyles.booksyLayout}>
            {/* Left Column - Main Content */}
            <div className={booksyStyles.booksyMain}>
              {/* Photos Tab */}
              {activeSection === 'photos-section' && (
                <section className={booksyStyles.sectionContainerNoPadding}>
                  <HeroGallery
                    salon={salon}
                    galleryImages={galleryImages}
                    onShowAllPhotos={() => openLightbox(galleryImageUrls, 0)}
                    onOpenLightbox={openLightbox}
                  />
                </section>
              )}

              {/* Services Tab */}
              {activeSection === 'services-section' && (
                <section className={booksyStyles.sectionContainer}>
                  <FreshaServiceList
                    services={services}
                    salon={salon}
                    onBook={handleMultiServiceBook}
                    onImageClick={openLightbox}
                  />

                  {/* Videos in Services tab - only if there are videos */}
                  {salonVideos.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                      <h3 className={booksyStyles.subsectionTitle}>Videos</h3>
                      <div className={styles.galleryGrid}>
                        {salonVideos.map((video) => (
                          <div
                            key={video.id}
                            className={styles.galleryItem}
                            onClick={() => openVideoLightbox(video)}
                            style={{ position: 'relative', cursor: 'pointer' }}
                          >
                            <Image
                              src={video.thumbnailUrl || '/placeholder-video.png'}
                              alt={video.caption || 'Service video'}
                              className={styles.galleryImage}
                              fill
                              sizes="(max-width: 768px) 50vw, 200px"
                            />
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '48px',
                              height: '48px',
                              background: 'rgba(245, 25, 87, 0.9)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '20px',
                            }}>
                              <FaPlay />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Team Tab */}
              {activeSection === 'team-section' && (
                <section className={booksyStyles.sectionContainer}>
                  <TeamMembers salonId={salon.id} isEditable={false} />
                </section>
              )}

              {/* Reviews Tab */}
              {activeSection === 'reviews-section' && (
                <section className={booksyStyles.sectionContainer}>
                  <BooksyReviewsSection
                    reviews={reviews}
                    avgRating={salon.avgRating || 0}
                    galleryImages={galleryImages}
                    onOpenLightbox={openLightbox}
                  />
                </section>
              )}

              {/* About Tab */}
              {activeSection === 'about-section' && (
                <section className={booksyStyles.sectionContainer}>
                  <AboutSection
                    salon={salon}
                    latitude={salon.latitude}
                    longitude={salon.longitude}
                    mapsHref={mapsHref}
                    hoursRecord={hoursRecord}
                    todayLabel={todayLabel}
                    orderedOperatingDays={orderedOperatingDays}
                  />
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
