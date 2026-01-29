'use client';

import { useState, useRef, useCallback, useTransition, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import SalonCard from '../SalonCard';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { Salon } from '@/types';
import styles from './SalonCarouselSection.module.css';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';

import 'swiper/css';
import 'swiper/css/navigation';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface SalonCarouselSectionProps {
    title: string;
    salons: SalonWithFavorite[];
    viewAllLink?: string;
    emptyMessage?: string;
    showViewAll?: boolean;
    loading?: boolean;
    onSalonsChange?: (salons: SalonWithFavorite[]) => void;
}

function SalonCarouselSection({
    title,
    salons,
    viewAllLink = '/salons',
    emptyMessage = 'No salons to display',
    showViewAll = true,
    loading = false,
    onSalonsChange,
}: SalonCarouselSectionProps) {
    const [salonData, setSalonData] = useState<SalonWithFavorite[]>(salons);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showPrevArrow, setShowPrevArrow] = useState(false);
    const [, startTransition] = useTransition();
    const { authStatus } = useAuth();
    const { openModal } = useAuthModal();
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);
    const swiperRef = useRef<SwiperType | null>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const router = useRouter();
    const { setIsNavigating } = useNavigationLoading();

    // Update internal state when props change
    if (salons !== salonData && salons.length !== salonData.length) {
        setSalonData(salons);
    }

    const handleHeadingClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsNavigating(true);
        router.push(viewAllLink);
    };

    const handleViewAllClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsNavigating(true);
        router.push(viewAllLink);
    };

    const handleSlideChange = (swiper: SwiperType) => {
        setActiveIndex(swiper.activeIndex);
        // Show prev arrow only after scrolling past the first slide
        setShowPrevArrow(swiper.activeIndex > 0);
    };

    const handleToggleFavorite = useCallback(async (e: React.MouseEvent, salonId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (authStatus !== 'authenticated') {
            toast.info('Please log in to add salons to your favorites.');
            openModal('login');
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
        } catch (error) {
            toast.error('Could not update favorites. Please try again.');
            startTransition(() => setSalonData(originalSalons));
        }
    }, [authStatus, openModal, salonData, onSalonsChange]);

    // Loading state
    if (loading) {
        return (
            <section className={styles.section}>
                <div className={styles.header}>
                    <div className={styles.titleSkeleton} />
                </div>
                <div className={styles.skeletonContainer}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={styles.skeletonCard} />
                    ))}
                </div>
            </section>
        );
    }

    // Empty state - don't render section
    if (salonData.length === 0) {
        return null;
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <a href={viewAllLink} onClick={handleHeadingClick} className={styles.title}>
                    <h2>{title}</h2>
                </a>
                {showViewAll && (
                    <a href={viewAllLink} onClick={handleViewAllClick} className={styles.viewAll}>
                        View All
                    </a>
                )}
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
                        minHeight: isMobile ? '240px' : '280px',
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
                            style={{
                                width: isMobile ? 'auto' : 'calc((100% - 60px) / 4.1)',
                                minHeight: isMobile ? '240px' : '280px',
                                height: isMobile ? '240px' : '280px',
                            }}
                        >
                            <SalonCard
                                salon={salon}
                                showFavorite
                                onToggleFavorite={handleToggleFavorite}
                                showHours={false}
                                compact
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
