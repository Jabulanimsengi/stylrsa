"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Salon, Service, GalleryImage, Review } from '@/types';
import BookingModal from '@/components/BookingModal/BookingModal';
import ImageLightbox from '@/components/ImageLightbox';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import SimilarSalons from '@/components/SimilarSalons/SimilarSalons';
import MobileSalonProfile from './MobileSalonProfile';
import DesktopSalonProfile from './DesktopSalonProfile';
import { getGuestFavoriteSalonIds, toggleGuestFavoriteSalon } from '@/lib/guestFavorites';

type Props = {
  initialSalon: Salon | null;
  salonId: string;
};

const EMPTY_REVIEWS: Review[] = [];

export default function SalonProfileClient({ initialSalon, salonId }: Props) {
  const searchParams = useSearchParams();
  const { authStatus } = useAuth();
  const socket = useSocket();
  usePagePerformance('salon_detail');

  const [salon, setSalon] = useState<Salon | null>(initialSalon);
  const [services, setServices] = useState<Service[]>(initialSalon?.services ?? []);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(initialSalon?.gallery ?? []);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const [activeSection, setActiveSection] = useState('services-section');

  const reviews = salon?.reviews ?? EMPTY_REVIEWS;

  useEffect(() => {
    if (!salon || authStatus === 'authenticated') {
      return;
    }

    const guestFavoriteIds = getGuestFavoriteSalonIds();
    const isGuestFavorited = guestFavoriteIds.has(salon.id);
    if (salon.isFavorited === isGuestFavorited) {
      return;
    }

    setSalon((prev) => (
      prev ? { ...prev, isFavorited: isGuestFavorited } : null
    ));
  }, [authStatus, salon]);

  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    if (!serviceId || services.length === 0 || showBookingModal) return;

    const service = services.find((item) => item.id === serviceId);
    if (!service) return;

    setSelectedService(service);
    setShowBookingModal(true);
    window.history.replaceState({}, '', window.location.pathname);
  }, [searchParams, services, showBookingModal]);

  useEffect(() => {
    let isActive = true;

    const applySalon = (data: Salon | null) => {
      if (!isActive) return;
      setSalon(data);
      setServices(data?.services ?? []);
      setGalleryImages(data?.gallery ?? []);
    };

    if (initialSalon) {
      applySalon(initialSalon);
      return () => {
        isActive = false;
      };
    }

    const loadSalon = async (retryCount = 0) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch(`/api/salons/${salonId}`, { signal: controller.signal });
        window.clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Failed to load salon: ${res.status}`);
        }

        const data: Salon = await res.json();
        applySalon(data);
      } catch (error: unknown) {
        window.clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          logger.error('Salon fetch timed out', { salonId, retryCount });
          if (retryCount < 2 && isActive) {
            window.setTimeout(() => loadSalon(retryCount + 1), 2000);
            return;
          }
          if (isActive) {
            toast.error('Loading is taking longer than expected. The server may be starting up - please try refreshing.');
            applySalon(null);
          }
          return;
        }

        logger.error('Failed to load salon', error);
        if (retryCount < 2 && isActive) {
          window.setTimeout(() => loadSalon(retryCount + 1), 2000);
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
    if (!salon?.id || !socket) return;

    socket.emit('joinSalonRoom', salon.id);
    socket.on('availabilityUpdate', (data: { isAvailableNow: boolean }) => {
      setSalon((prev) => (prev ? { ...prev, isAvailableNow: data.isAvailableNow } : null));
    });

    return () => {
      socket.emit('leaveSalonRoom', salon.id);
      socket.off('availabilityUpdate');
    };
  }, [socket, salon?.id]);

  useEffect(() => {
    let isActive = true;

    const refetchSalon = async () => {
      try {
        const res = await fetch(`/api/salons/${salonId}`);
        if (!res.ok) return;
        const data: Salon = await res.json();
        if (!isActive) return;
        setSalon(data);
        setServices(data.services ?? []);
        setGalleryImages(data.gallery ?? []);
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

  const hoursRecord = useMemo(() => {
    const operatingHours = salon?.operatingHours as unknown;
    if (!operatingHours) return null;

    if (Array.isArray(operatingHours)) {
      const record: Record<string, string> = {};
      operatingHours.forEach((item) => {
        const day = item?.day;
        const open = item?.open;
        const close = item?.close;
        if (day && (open || close)) {
          record[day] = `${open ?? ''} - ${close ?? ''}`.trim();
        }
      });
      return record;
    }

    if (typeof operatingHours === 'object') {
      const normalized: Record<string, string> = {};
      const dayMap: Record<string, string> = {
        sunday: 'Sunday',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
      };

      Object.entries(operatingHours as Record<string, string>).forEach(([key, value]) => {
        const normalizedKey = dayMap[key.trim().toLowerCase().replace(/\./g, '')];
        if (normalizedKey) {
          normalized[normalizedKey] = value;
        }
      });

      return Object.keys(normalized).length > 0 ? normalized : (operatingHours as Record<string, string>);
    }

    return null;
  }, [salon?.operatingHours]);

  const orderedOperatingDays = useMemo(() => {
    if (!hoursRecord) return [] as string[];
    const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return order.filter((day) => day in hoursRecord);
  }, [hoursRecord]);

  if (!salon) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Salon not found.</div>;
  }

  const addressText = salon.address?.trim().length
    ? salon.address
    : [salon.town, salon.city, salon.province].filter(Boolean).join(', ');
  const mapsHref = salon.latitude && salon.longitude
    ? `https://www.google.com/maps?q=${salon.latitude},${salon.longitude}`
    : `https://www.google.com/maps?q=${encodeURIComponent(addressText)}`;
  const todayLabel = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

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

  const handleBookClick = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleMultiServiceBook = (selectedSvcs: Service[]) => {
    if (selectedSvcs.length === 0) {
      toast.warning('Please select at least one service');
      return;
    }

    if (selectedSvcs.length > 1) {
      toast.info('Bookings currently start with one service at a time. We selected the first service for checkout.');
    }

    const primaryService = selectedSvcs[0];
    handleBookClick(primaryService);
  };

  const handleToggleFavorite = async () => {
    if (!salon) {
      return;
    }

    if (authStatus !== 'authenticated') {
      const { favorited } = toggleGuestFavoriteSalon(salon);
      setSalon((prev) => (prev ? { ...prev, isFavorited: favorited } : null));
      toast.success(favorited ? 'Saved to favorites on this device.' : 'Removed from saved salons.');
      return;
    }

    const originalFavoritedState = salon.isFavorited;
    setSalon((prev) => (prev ? { ...prev, isFavorited: !prev.isFavorited } : null));

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
      setSalon((prev) => (prev ? { ...prev, isFavorited: originalFavoritedState } : null));
    }
  };

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
        onToggleFavorite={handleToggleFavorite}
        onBookService={handleBookClick}
        onBookNow={() => {
          if (services.length > 0) {
            handleBookClick(services[0]);
          }
        }}
      />

      <DesktopSalonProfile
        salon={salon}
        services={services}
        galleryImages={galleryImages}
        reviews={reviews}
        hoursRecord={hoursRecord}
        todayLabel={todayLabel}
        orderedOperatingDays={orderedOperatingDays}
        mapsHref={mapsHref}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        authStatus={authStatus}
        logoError={logoError}
        setLogoError={setLogoError}
        openLightbox={openLightbox}
        onToggleFavorite={handleToggleFavorite}
        onBookServices={handleMultiServiceBook}
      />

      <SimilarSalons
        currentSalonId={salon.id}
        city={salon.city}
        province={salon.province}
        latitude={salon.latitude}
        longitude={salon.longitude}
        currentServices={services}
      />
    </>
  );
}
