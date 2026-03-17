'use client';

import { useState, useRef, useCallback, useTransition, memo, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import SalonCard from '../SalonCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { Salon } from '@/types';
import styles from './SalonCarouselSection.module.css';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { CarouselRowSkeleton, Skeleton } from '@/components/Skeleton/Skeleton';
import { applyGuestFavoritesToSalons, toggleGuestFavoriteSalon } from '@/lib/guestFavorites';

import 'swiper/css';
import 'swiper/css/navigation';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface SalonCarouselSectionProps {
    title: string;
    eyebrow?: string;
    description?: string;
    salons?: SalonWithFavorite[] | null;
    viewAllLink?: string;
    emptyMessage?: string;
    showViewAll?: boolean;
    loading?: boolean;
    surface?: 'default' | 'muted';
    onSalonsChange?: (salons: SalonWithFavorite[]) => void;
}

function SalonCarouselSection({
    title,
    eyebrow,
    description,
    salons,
    viewAllLink = '/salons',
    emptyMessage: _emptyMessage = 'No salons to display',
    showViewAll = true,
    loading = false,
    surface = 'default',
    onSalonsChange,
}: SalonCarouselSectionProps) {
    const normalizedSalons = useMemo(() => (Array.isArray(salons) ? salons : []), [salons]);
    const [salonData, setSalonData] = useState<SalonWithFavorite[]>(normalizedSalons);
    const [showPrevArrow, setShowPrevArrow] = useState(false);
    const [, startTransition] = useTransition();
    const { authStatus } = useAuth();
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);
    const swiperRef = useRef<SwiperType | null>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const router = useRouter();
    const { showPageLoader } = useNavigationLoading();

    useEffect(() => {
        setSalonData(
            authStatus === 'authenticated'
                ? normalizedSalons
                : applyGuestFavoritesToSalons(normalizedSalons)
        );
    }, [authStatus, normalizedSalons]);

    const handleHeadingClick = (e: React.MouseEvent) => {
        e.preventDefault();
        showPageLoader();
        router.push(viewAllLink);
    };

    const handleViewAllClick = (e: React.MouseEvent) => {
        e.preventDefault();
        showPageLoader();
        router.push(viewAllLink);
    };

    const handleSlideChange = (swiper: SwiperType) => {
        // Show prev arrow only after scrolling past the first slide
        setShowPrevArrow(swiper.activeIndex > 0);
    };

    const handleToggleFavorite = useCallback(async (e: React.MouseEvent, salonId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (authStatus !== 'authenticated') {
            const salon = salonData.find((item) => item.id === salonId);
            if (!salon) {
                return;
            }

            const { favorited } = toggleGuestFavoriteSalon(salon);
            const updatedSalons = salonData.map((item) =>
                item.id === salonId ? { ...item, isFavorited: favorited } : item
            );
            startTransition(() => {
                setSalonData(updatedSalons);
            });
            toast.success(favorited ? 'Saved to favorites on this device.' : 'Removed from saved salons.');
            onSalonsChange?.(updatedSalons);
            return;
        }

        const originalSalons = salonData;
        startTransition(() => {
            setSalonData(prevSalons =>
                prevSalons.map(salon =>
                    salon.id === salonId ? { ...salon, isFavorited: !salon.isFavorited } : salon
                )
            );
        });

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

            // Notify parent if provided
            if (onSalonsChange) {
                onSalonsChange(salonData.map(salon =>
                    salon.id === salonId ? { ...salon, isFavorited: favorited } : salon
                ));
            }
        } catch {
            toast.error('Could not update favorites. Please try again.');
            startTransition(() => setSalonData(originalSalons));
        }
    }, [authStatus, salonData, onSalonsChange]);

    // Loading state
    if (loading) {
        return (
            <section className={`${styles.section} ${surface === 'muted' ? styles.sectionMuted : ''}`}>
                <div className={styles.header}>
                    <div className={styles.headerCopy}>
                        <Skeleton variant="text" width="8rem" height={12} />
                        <Skeleton variant="text" width="18rem" height={30} />
                        <Skeleton variant="text" width="28rem" height={16} />
                    </div>
                </div>
                <div className={styles.skeletonContainer}>
                    <CarouselRowSkeleton count={4} />
                </div>
            </section>
        );
    }

    // Empty state - don't render section
    if (salonData.length === 0) {
        return null;
    }

    return (
        <section className={`${styles.section} ${surface === 'muted' ? styles.sectionMuted : ''}`}>
            <div className={styles.header}>
                <div className={styles.headerCopy}>
                    {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
                    <Link href={viewAllLink} onClick={handleHeadingClick} className={styles.title}>
                        <h2>{title}</h2>
                    </Link>
                    {description && <p className={styles.description}>{description}</p>}
                </div>
                <div className={styles.headerAction}>
                    {showViewAll && (
                        <Link href={viewAllLink} onClick={handleViewAllClick} className={styles.viewAll}>
                            View All
                        </Link>
                    )}
                </div>
            </div>

            <div className={styles.container}>
                <Swiper
                    modules={isMobile ? [] : [Navigation]}
                    navigation={isMobile ? false : {
                        prevEl: prevRef.current,
                        nextEl: nextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                        swiperRef.current = swiper;
                        if (!isMobile && typeof swiper.params.navigation !== 'boolean') {
                            const navigation = swiper.params.navigation;
                            if (navigation) {
                                navigation.prevEl = prevRef.current;
                                navigation.nextEl = nextRef.current;
                            }
                        }
                    }}
                    spaceBetween={16}
                    slidesPerView={'auto'}
                    style={{
                        width: '100%',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        minHeight: isMobile ? '244px' : '284px',
                    }}
                    onSlideChange={handleSlideChange}
                    allowTouchMove={true}
                    simulateTouch={true}
                    touchRatio={1}
                    threshold={10}
                    longSwipesRatio={0.5}
                    breakpoints={{
                        320: {
                            slidesPerView: 1.35,
                            spaceBetween: 12,
                        },
                        480: {
                            slidesPerView: 1.4,
                            spaceBetween: 14,
                        },
                        769: {
                            slidesPerView: 4.1,
                            spaceBetween: 20,
                        },
                    }}
                >
                    {salonData.map((salon) => (
                        <SwiperSlide
                            key={salon.id}
                            className={styles.slide}
                            style={{
                                width: isMobile ? 'auto' : 'calc((100% - 60px) / 4.1)',
                                minHeight: isMobile ? '244px' : '284px',
                            }}
                        >
                            <SalonCard
                                salon={salon}
                                showFavorite
                                onToggleFavorite={handleToggleFavorite}
                                showHours={false}
                                compact
                                showPrice={false}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Navigation buttons - hidden on mobile */}
                {!isMobile && (
                    <>
                        {/* Left arrow - only visible after scrolling */}
                        <button
                            ref={prevRef}
                            className={`${styles.navButton} ${styles.prevButton} ${showPrevArrow ? styles.visible : ''}`}
                            aria-label="Previous"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        {/* Right arrow - always visible */}
                        <button
                            ref={nextRef}
                            className={`${styles.navButton} ${styles.nextButton} ${styles.visible}`}
                            aria-label="Next"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}

export default memo(SalonCarouselSection);
