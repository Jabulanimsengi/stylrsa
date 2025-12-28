"use client";

import { useEffect, useMemo, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import FilterBar, { type FilterValues } from "@/components/FilterBar/FilterBar";
import ServicesPageSkeleton from "@/components/Skeleton/ServicesPageSkeleton";
import styles from "./ServicesPage.module.css";
import { Service, Salon, Booking } from "@/types";
import { toast } from "react-toastify";
import ImageLightbox from "@/components/ImageLightbox";
import { useSocket } from "@/context/SocketContext";
import PageNav from "@/components/PageNav";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileSearch from "@/components/MobileSearch/MobileSearch";
import BookingModal from "@/components/BookingModal";
import BookingConfirmationModal from "@/components/BookingConfirmationModal/BookingConfirmationModal";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/context/AuthModalContext";
import EmptyState from "@/components/EmptyState/EmptyState";
import { getCategoryNameFromSlug } from "@/utils/categorySlug";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


const filtersToKey = (filters: FilterValues) => JSON.stringify(filters);

interface ProvinceGroup {
  province: string;
  services: Service[];
}

// Province row component with horizontal scrolling
function ProvinceRow({
  province,
  services,
  onBook,
  onImageClick,
  isMobile
}: {
  province: string;
  services: Service[];
  onBook: (service: Service) => void;
  onImageClick: (images: string[], index: number) => void;
  isMobile: boolean;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [checkScrollButtons, services]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = isMobile ? 180 : 280;
    const scrollAmount = cardWidth * 2;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section className={styles.provinceSection}>
      <div className={styles.provinceHeader}>
        <h2 className={styles.provinceTitle}>
          {province}
          <span className={styles.serviceCount}>({services.length} {services.length === 1 ? 'service' : 'services'})</span>
        </h2>
        <Link href={`/services?province=${encodeURIComponent(province)}`} className={styles.viewAllLink}>
          View all →
        </Link>
      </div>

      <div className={styles.scrollWrapper}>
        {!isMobile && canScrollLeft && (
          <button
            className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <FaChevronLeft />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className={styles.horizontalScroll}
        >
          {services.map((service) => (
            <div key={service.id} className={styles.serviceCardWrapper}>
              <ServiceCard
                service={service}
                onBook={onBook}
                onImageClick={onImageClick}
              />
            </div>
          ))}
        </div>

        {!isMobile && canScrollRight && (
          <button
            className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </section>
  );
}

function ServicesPageContent() {
  const params = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [pendingBookingService, setPendingBookingService] = useState<Service | null>(null);
  const [pendingSalon, setPendingSalon] = useState<Salon | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();
  const requestControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);
  const isFetchingRef = useRef(false);

  const derivedFilters = useMemo<FilterValues>(() => {
    const categoryParam = params.get("category") ?? "";
    const categoryValue = categoryParam && categoryParam.includes('-')
      ? (getCategoryNameFromSlug(categoryParam) ?? categoryParam)
      : categoryParam;

    return {
      province: params.get("province") ?? "",
      city: params.get("city") ?? "",
      service: params.get("service") ?? params.get("q") ?? "",
      category: categoryValue,
      offersMobile: params.get("offersMobile") === "true",
      sortBy: params.get("sortBy") ?? "",
      openNow: params.get("openNow") === "true",
      priceMin: params.get("priceMin") ?? "",
      priceMax: params.get("priceMax") ?? "",
    };
  }, [params]);

  const [activeFilters, setActiveFilters] = useState<FilterValues>(derivedFilters);
  const activeFiltersKey = useMemo(() => filtersToKey(activeFilters), [activeFilters]);

  // Group services by province and sort by count
  const provinceGroups = useMemo((): ProvinceGroup[] => {
    const groups: Record<string, Service[]> = {};

    services.forEach(service => {
      const province = (service.salon as any)?.province || 'Other';
      if (!groups[province]) {
        groups[province] = [];
      }
      groups[province].push(service);
    });

    // Sort provinces by number of services (descending)
    return Object.entries(groups)
      .map(([province, serviceList]) => ({ province, services: serviceList }))
      .filter(group => group.services.length > 0)
      .sort((a, b) => b.services.length - a.services.length);
  }, [services]);

  // Check if filtering by specific province
  const isFilteredByProvince = Boolean(params.get('province'));

  const fetchServices = useCallback(async (filtersToUse: FilterValues) => {
    if (isFetchingRef.current) return;

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const requestId = ++latestRequestIdRef.current;

    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (filtersToUse.province) query.append("province", filtersToUse.province);
      if (filtersToUse.city) query.append("city", filtersToUse.city);
      if (filtersToUse.category) query.append("category", filtersToUse.category);
      if (filtersToUse.service) query.append("q", filtersToUse.service);
      if (filtersToUse.offersMobile) query.append("offersMobile", "true");
      if (filtersToUse.sortBy) query.append("sortBy", filtersToUse.sortBy);
      if (filtersToUse.openNow) query.append("openNow", "true");
      if (filtersToUse.priceMin) query.append("priceMin", filtersToUse.priceMin);
      if (filtersToUse.priceMax) query.append("priceMax", filtersToUse.priceMax);

      // Limit results for faster loading
      query.append("limit", "100");

      const url = `/api/services/search${query.toString() ? `?${query.toString()}` : ""}`;
      const res = await fetch(url, { credentials: "include", signal: controller.signal });
      if (!res.ok) throw new Error("Failed to search services");
      const data = await res.json();
      if (requestId !== latestRequestIdRef.current) return;
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : "Search failed";
      toast.error(message);
      setServices([]);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
        requestControllerRef.current = null;
        isFetchingRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    const newKey = filtersToKey(derivedFilters);
    const currentKey = filtersToKey(activeFilters);
    if (newKey !== currentKey) {
      setActiveFilters(derivedFilters);
    }
  }, [derivedFilters, activeFilters]);

  useEffect(() => {
    void fetchServices(activeFilters);
  }, [activeFiltersKey, fetchServices]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => { void fetchServices(activeFilters); };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket, activeFiltersKey, fetchServices, activeFilters]);

  const handleSearch = (nextFilters: FilterValues) => {
    const nextKey = filtersToKey(nextFilters);
    if (nextKey === activeFiltersKey) {
      void fetchServices(nextFilters);
      return;
    }
    setActiveFilters(nextFilters);
  };

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
    };
  }, []);

  const handleOpenLightbox = (images: string[], index: number) => {
    if (!images || images.length === 0) return;
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleBookService = async (service: Service) => {
    if (authStatus !== 'authenticated') {
      toast.info('Please log in to book a service.');
      openModal('login');
      return;
    }

    let salonData: Salon;
    if (!service.salon || !service.salon.name) {
      try {
        const res = await fetch(`/api/salons/${service.salonId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch salon details');
        salonData = await res.json();
        service.salon = {
          id: salonData.id,
          name: salonData.name,
          ownerId: salonData.ownerId,
          city: salonData.city,
          province: salonData.province,
        };
      } catch (error) {
        toast.error('Unable to load salon details. Please try again.');
        return;
      }
    } else {
      try {
        const res = await fetch(`/api/salons/${service.salonId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch salon details');
        salonData = await res.json();
      } catch (error) {
        toast.error('Unable to load salon details. Please try again.');
        return;
      }
    }

    if (salonData.bookingMessage) {
      setPendingBookingService(service);
      setPendingSalon(salonData);
      setShowBookingConfirmation(true);
    } else {
      setSelectedService(service);
      setBookingModalOpen(true);
    }
  };

  const handleBookingConfirmationAccept = () => {
    setShowBookingConfirmation(false);
    if (pendingBookingService) {
      setSelectedService(pendingBookingService);
      setBookingModalOpen(true);
      setPendingBookingService(null);
      setPendingSalon(null);
    }
  };

  const handleBookingConfirmationClose = () => {
    setShowBookingConfirmation(false);
    setPendingBookingService(null);
    setPendingSalon(null);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setBookingModalOpen(false);
    setSelectedService(null);
    toast.success('Booking confirmed!');
  };

  const pageTitle = useMemo(() => {
    if (activeFilters.category) return `${activeFilters.category} Services`;
    if (activeFilters.service) return `Search: ${activeFilters.service}`;
    if (activeFilters.city && activeFilters.province) return `Services in ${activeFilters.city}, ${activeFilters.province}`;
    if (activeFilters.province) return `Services in ${activeFilters.province}`;
    return 'Explore Services';
  }, [activeFilters]);

  return (
    <div className={styles.container}>
      <PageNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 className={styles.title}>{pageTitle}</h1>
      </div>

      {isMobile ? (
        <MobileSearch onSearch={handleSearch} />
      ) : (
        <FilterBar
          onSearch={handleSearch}
          initialFilters={activeFilters}
          showSearchButton
          autoSearch={false}
          isSearching={isLoading}
        />
      )}

      {isLoading && services.length === 0 ? (
        <ServicesPageSkeleton message="Loading services..." cardCount={6} />
      ) : services.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No Services Found"
          description="Try adjusting your filters or exploring other categories to find what you're looking for."
        />
      ) : isFilteredByProvince ? (
        // If filtered by province, show traditional grid
        <div className={styles.servicesGrid}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={handleBookService}
              onImageClick={handleOpenLightbox}
            />
          ))}
        </div>
      ) : (
        // Otherwise, show grouped by province with horizontal scrolling
        <div className={styles.provinceGroupsContainer}>
          {provinceGroups.map((group) => (
            <ProvinceRow
              key={group.province}
              province={group.province}
              services={group.services}
              onBook={handleBookService}
              onImageClick={handleOpenLightbox}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {bookingModalOpen && selectedService && selectedService.salon && (
        <BookingModal
          salon={{
            id: selectedService.salon.id,
            name: selectedService.salon.name,
            ownerId: selectedService.salon.ownerId,
            city: selectedService.salon.city || '',
            province: selectedService.salon.province || '',
          } as Salon}
          service={selectedService}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedService(null);
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {showBookingConfirmation && pendingSalon && (
        <BookingConfirmationModal
          isOpen={showBookingConfirmation}
          onClose={handleBookingConfirmationClose}
          onAccept={handleBookingConfirmationAccept}
          salonName={pendingSalon.name || ''}
          salonLogo={pendingSalon.backgroundImage || undefined}
          message={pendingSalon.bookingMessage || ''}
        />
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ServicesPageContent />
    </Suspense>
  );
}
