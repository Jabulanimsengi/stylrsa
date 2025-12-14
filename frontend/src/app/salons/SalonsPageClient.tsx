// frontend/src/app/salons/SalonsPageClient.tsx
'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { transformCloudinary } from '@/utils/cloudinary';
import { useSearchParams } from 'next/navigation';
import { Salon } from '@/types';
import styles from './SalonsPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import FilterBar, { type FilterValues } from '@/components/FilterBar/FilterBar';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getImageWithFallback } from '@/lib/placeholders';
import PageNav from '@/components/PageNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import ReviewBadge from '@/components/ReviewBadge/ReviewBadge';
import { useGeolocation } from '@/hooks/useGeolocation';
import EmptyState from '@/components/EmptyState/EmptyState';


type SalonWithFavorite = Salon & { isFavorited?: boolean };
type SalonPageFilters = Partial<FilterValues> & { q?: string; lat?: string | null; lon?: string | null };

interface ProvinceGroup {
    province: string;
    salons: SalonWithFavorite[];
}

// Province row component with horizontal scrolling
function ProvinceRow({
    province,
    salons,
    onToggleFavorite,
    onNavigate,
    navigatingSalonId,
    isMobile
}: {
    province: string;
    salons: SalonWithFavorite[];
    onToggleFavorite: (e: React.MouseEvent, salonId: string) => void;
    onNavigate: (salon: SalonWithFavorite) => void;
    navigatingSalonId: string | null;
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
    }, [checkScrollButtons, salons]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = isMobile ? 160 : 280;
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
                    <span className={styles.salonCount}>({salons.length} {salons.length === 1 ? 'salon' : 'salons'})</span>
                </h2>
                <Link href={`/salons?province=${encodeURIComponent(province)}`} className={styles.viewAllLink}>
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
                    {salons.map((salon) => {
                        const isNavigating = navigatingSalonId === salon.id;

                        return (
                            <div
                                key={salon.id}
                                className={`${styles.salonCard} ${isNavigating ? styles.navigating : ''}`}
                                onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('button')) return;
                                    onNavigate(salon);
                                }}
                            >
                                {isNavigating && (
                                    <div className={styles.cardLoadingOverlay}>
                                        <LoadingSpinner size="medium" color="white" />
                                    </div>
                                )}
                                <button
                                    onClick={(e) => onToggleFavorite(e, salon.id)}
                                    className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
                                    aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <FaHeart />
                                </button>
                                <div className={styles.salonLink}>
                                    <div className={styles.imageWrapper}>
                                        <ReviewBadge
                                            reviewCount={salon.reviews?.length || 0}
                                            avgRating={salon.avgRating || 0}
                                        />
                                        <Image
                                            src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
                                            alt={`A photo of ${salon.name}`}
                                            className={styles.cardImage}
                                            fill
                                            sizes="(max-width: 768px) 160px, 280px"
                                        />
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>{salon.name}</h3>
                                        <p className={styles.cardLocation}>{salon.city}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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

export default function SalonsPageClient() {
    const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [navigatingSalonId, setNavigatingSalonId] = useState<string | null>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const router = useRouter();

    const searchParams = useSearchParams();
    const { authStatus } = useAuth();
    const { openModal } = useAuthModal();

    // Auto-request geolocation when page loads (with IP fallback)
    const geoState = useGeolocation(true);
    const { coordinates, error: geoError, source: locationSource } = geoState;

    const getInitialFilters = useCallback((): SalonPageFilters => {
        const params = new URLSearchParams(searchParams.toString());
        const urlLat = params.get('lat');
        const urlLon = params.get('lon');
        const urlSortBy = params.get('sortBy');

        // Use URL params if available, otherwise use geolocation
        const lat = urlLat || (coordinates?.latitude ? String(coordinates.latitude) : null);
        const lon = urlLon || (coordinates?.longitude ? String(coordinates.longitude) : null);

        // Auto-enable distance sorting if we have coordinates but no explicit sort
        let sortBy = urlSortBy || '';
        if (!sortBy && lat && lon) {
            sortBy = 'distance';
        }

        return {
            province: params.get('province') || '',
            city: params.get('city') || '',
            service: params.get('service') || '',
            category: params.get('category') || '',
            q: params.get('q') || '',
            offersMobile: params.get('offersMobile') === 'true',
            sortBy,
            openNow: params.get('openNow') === 'true',
            priceMin: params.get('priceMin') || '',
            priceMax: params.get('priceMax') || '',
            lat,
            lon,
        };
    }, [searchParams, coordinates]);

    const [initialFilters] = useState<SalonPageFilters>(getInitialFilters);

    // Group salons by province and sort by count
    const provinceGroups = useMemo((): ProvinceGroup[] => {
        const groups: Record<string, SalonWithFavorite[]> = {};

        salons.forEach(salon => {
            const province = salon.province || 'Other';
            if (!groups[province]) {
                groups[province] = [];
            }
            groups[province].push(salon);
        });

        // Sort provinces by number of salons (descending)
        return Object.entries(groups)
            .map(([province, salonList]) => ({ province, salons: salonList }))
            .filter(group => group.salons.length > 0)
            .sort((a, b) => b.salons.length - a.salons.length);
    }, [salons]);

    const fetchSalons = useCallback(async (
        filters: Partial<FilterValues> & { q?: string; lat?: number | string | null; lon?: number | string | null }
    ) => {
        setIsLoading(true);
        const query = new URLSearchParams();

        // Add cache-busting timestamp
        query.append('_t', String(Date.now()));

        let url = '/api/salons/approved';
        if (filters.province) query.append('province', filters.province);
        if (filters.city) query.append('city', filters.city);
        if (filters.service) query.append('service', filters.service);
        if (filters.category) query.append('category', filters.category);
        if (filters.q) query.append('q', filters.q);
        if (filters.offersMobile) query.append('offersMobile', 'true');
        if (filters.sortBy) query.append('sortBy', filters.sortBy);
        if (filters.openNow) query.append('openNow', 'true');
        if (filters.priceMin) query.append('priceMin', String(filters.priceMin));
        if (filters.priceMax) query.append('priceMax', String(filters.priceMax));
        if (filters.sortBy === 'distance' && filters.lat && filters.lon) {
            query.append('lat', String(filters.lat));
            query.append('lon', String(filters.lon));
            if (filters.radius) {
                query.append('radius', String(filters.radius));
            }
        }
        const queryString = query.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        try {
            const res = await fetch(url, { credentials: 'include', cache: 'no-store' as any });
            if (!res.ok) throw new Error('Failed to fetch salons');
            const data = await res.json();
            setSalons(data);
        } catch (error) {
            logger.error('Failed to fetch salons:', error);
            toast.error(toFriendlyMessage(error, 'Failed to load salons. Please try again.'));
            setSalons([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSalons(getInitialFilters());
    }, [getInitialFilters, fetchSalons, authStatus]);

    // Show notification when location is detected
    useEffect(() => {
        if (coordinates && !searchParams.get('lat')) {
            const message = locationSource === 'ip'
                ? '📍 Showing salons near your estimated location'
                : '📍 Showing salons near your location';
            toast.info(message, {
                position: 'bottom-center',
                autoClose: 3000,
            });
        }
    }, [coordinates, searchParams, locationSource]);

    // Show error if geolocation fails
    useEffect(() => {
        if (geoError) {
            logger.debug('Geolocation error:', geoError);
            if (!geoError.includes('denied')) {
                toast.warn('Unable to get your location. Showing all salons instead.');
            }
        }
    }, [geoError]);

    // Listen for salon updates from EditSalonModal
    useEffect(() => {
        const handleSalonUpdate = () => {
            setTimeout(() => {
                fetchSalons(getInitialFilters());
            }, 500);
        };

        window.addEventListener('salon-updated', handleSalonUpdate);
        return () => window.removeEventListener('salon-updated', handleSalonUpdate);
    }, [fetchSalons, getInitialFilters]);

    const handleToggleFavorite = async (e: React.MouseEvent, salonId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (authStatus !== 'authenticated') {
            toast.info('Please log in to add salons to your favorites.');
            openModal('login');
            return;
        }

        // Optimistic UI update
        const originalSalons = salons;
        setSalons(prevSalons =>
            prevSalons.map(salon =>
                salon.id === salonId ? { ...salon, isFavorited: !salon.isFavorited } : salon
            )
        );

        try {
            const res = await fetch(`/api/favorites/toggle/${salonId}`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Failed to update favorite status.');
            }

            const { favorited } = await res.json();
            const message = favorited ? 'Added to favorites!' : 'Removed from favorites.';
            toast.success(message);

        } catch (error) {
            toast.error('Could not update favorites. Please try again.');
            setSalons(originalSalons);
        }
    };

    const handleNavigate = (salon: SalonWithFavorite) => {
        const salonUrl = `/salons/${salon.slug || salon.id}`;
        setNavigatingSalonId(salon.id);
        router.push(salonUrl);
        setTimeout(() => setNavigatingSalonId(null), 5000);
    };

    // Check if filtering by specific province
    const isFilteredByProvince = Boolean(searchParams.get('province'));
    const pageTitle = searchParams.get('offersMobile') === 'true'
        ? 'Mobile Salons'
        : 'Explore Salons';

    return (
        <div className={styles.container}>
            <PageNav />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                <h1 className={styles.title}>{pageTitle}</h1>
                <p className={styles.subtitle}>
                    <Link href="/salons/near-me">
                        Find salons near you →
                    </Link>
                </p>
            </div>

            {isMobile ? (
                <MobileSearch onSearch={fetchSalons} />
            ) : (
                <FilterBar onSearch={fetchSalons} initialFilters={initialFilters} />
            )}

            {isLoading ? (
                salons.length === 0 ? (
                    <SkeletonGroup count={8} className={styles.salonGrid}>
                        {() => <SkeletonCard hasImage lines={3} />}
                    </SkeletonGroup>
                ) : (
                    <div className={styles.loadingState}>
                        <LoadingSpinner />
                    </div>
                )
            ) : salons.length === 0 ? (
                <EmptyState
                    variant="no-results"
                    title="No Salons Found"
                    description="Try adjusting your filters or search terms to find salons near you."
                />
            ) : isFilteredByProvince ? (
                // If filtered by province, show traditional grid
                <div className={styles.salonGrid}>
                    {salons.map((salon) => {
                        const isNavigating = navigatingSalonId === salon.id;

                        return (
                            <div
                                key={salon.id}
                                className={`${styles.salonCard} ${styles.gridCard} ${isNavigating ? styles.navigating : ''}`}
                                onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('button')) return;
                                    handleNavigate(salon);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {isNavigating && (
                                    <div className={styles.cardLoadingOverlay}>
                                        <LoadingSpinner size="medium" color="white" />
                                    </div>
                                )}
                                <button
                                    onClick={(e) => handleToggleFavorite(e, salon.id)}
                                    className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
                                    aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <FaHeart />
                                </button>
                                <div className={styles.salonLink}>
                                    <div className={styles.imageWrapper}>
                                        <ReviewBadge
                                            reviewCount={salon.reviews?.length || 0}
                                            avgRating={salon.avgRating || 0}
                                        />
                                        <Image
                                            src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
                                            alt={`A photo of ${salon.name}`}
                                            className={styles.cardImage}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h2 className={styles.cardTitle}>{salon.name}</h2>
                                        <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Otherwise, show grouped by province with horizontal scrolling
                <div className={styles.provinceGroupsContainer}>
                    {provinceGroups.map((group) => (
                        <ProvinceRow
                            key={group.province}
                            province={group.province}
                            salons={group.salons}
                            onToggleFavorite={handleToggleFavorite}
                            onNavigate={handleNavigate}
                            navigatingSalonId={navigatingSalonId}
                            isMobile={isMobile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
