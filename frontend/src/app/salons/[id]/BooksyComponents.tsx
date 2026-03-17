'use client';

import React, { useState, useMemo } from 'react';
import {
    FaMapMarkerAlt,
    FaStar,
    FaTruck,
    FaDirections,
    FaCheckCircle,
    FaAward,
    FaRegClock,
    FaImages,
} from 'react-icons/fa';
import { Salon, GalleryImage, Review } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import styles from './BooksyLayout.module.css';
import VerificationBadge from '@/components/VerificationBadge/VerificationBadge';
import MapboxMap from '@/components/MapboxMap';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import { getSalonOpenStatus } from './salonOpenStatus';

// Sticky Tab Navigation Component
export function StickyTabNavigation({
    activeSection,
    onTabClick,
    hasPhotos,
    hasTeam,
    reviewsCount,
}: {
    activeSection: string;
    onTabClick: (sectionId: string) => void;
    hasPhotos: boolean;
    hasTeam: boolean;
    reviewsCount: number;
}) {
    const tabs = [
        { id: 'services-section', label: 'Services', show: true },
        { id: 'photos-section', label: 'Photos', show: hasPhotos },
        { id: 'reviews-section', label: 'Reviews', count: reviewsCount, show: true },
        { id: 'about-section', label: 'About', show: true },
        { id: 'team-section', label: 'Team', show: hasTeam },
    ].filter(tab => tab.show);

    return (
        <nav className={styles.stickyTabNav}>
            <div className={styles.stickyTabNavInner}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.stickyTab} ${activeSection === tab.id ? styles.active : ''}`}
                        onClick={() => onTabClick(tab.id)}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={styles.stickyTabBadge}>{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
}

// Hero Gallery Component
export function HeroGallery({
    salon,
    galleryImages,
    onShowAllPhotos,
    onOpenLightbox,
}: {
    salon: Salon;
    galleryImages: GalleryImage[];
    onShowAllPhotos: () => void;
    onOpenLightbox: (images: string[], index: number) => void;
}) {
    // Get all available images
    const allImages: string[] = [];

    // Add hero images first
    if (salon.heroImages && salon.heroImages.length > 0) {
        allImages.push(...salon.heroImages);
    }

    // Add background image if available
    if (salon.backgroundImage && !allImages.includes(salon.backgroundImage)) {
        allImages.push(salon.backgroundImage);
    }

    // Add gallery images
    galleryImages.forEach(g => {
        if (!allImages.includes(g.imageUrl)) {
            allImages.push(g.imageUrl);
        }
    });

    // Fallback to logo if no images
    if (allImages.length === 0 && salon.logo) {
        allImages.push(salon.logo);
    }

    if (allImages.length === 0) {
        return null;
    }

    return (
        <div className={styles.heroGallery}>
            {/* Main Large Image - Left side */}
            <div
                className={styles.heroMainImage}
                onClick={() => onOpenLightbox(allImages, 0)}
            >
                <OptimizedImage
                    src={transformCloudinary(allImages[0], { width: 1200, quality: 'auto', format: 'auto', crop: 'fill' })}
                    alt={salon.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    eager
                    seoContext={{ salonName: salon.name, city: salon.city }}
                />

                {/* Image count badge */}
                <div className={styles.imageCountBadge}>
                    <FaImages /> {allImages.length}
                </div>
            </div>

            {/* Top-right thumbnail */}
            {allImages.length > 1 && (
                <div
                    className={styles.heroThumbnail}
                    onClick={() => onOpenLightbox(allImages, 1)}
                >
                    <OptimizedImage
                        src={transformCloudinary(allImages[1], { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
                        alt={`${salon.name} photo 2`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        seoContext={{ salonName: salon.name, city: salon.city }}
                    />
                </div>
            )}

            {/* Bottom-right thumbnail with "See all images" button */}
            {allImages.length > 2 && (
                <div
                    className={styles.heroThumbnail}
                    onClick={() => onOpenLightbox(allImages, 2)}
                >
                    <OptimizedImage
                        src={transformCloudinary(allImages[2], { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
                        alt={`${salon.name} photo 3`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        seoContext={{ salonName: salon.name, city: salon.city }}
                    />

                    {/* See all images button - only if more than 3 images */}
                    {allImages.length > 3 && (
                        <button
                            className={styles.showAllPhotosBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowAllPhotos();
                            }}
                        >
                            See all images
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Salon Info Header Component (below photos)
export function SalonInfoHeader({
    salon,
    reviewsCount,
    onReviewsClick,
    hoursRecord,
    todayLabel,
}: {
    salon: Salon;
    reviewsCount: number;
    onReviewsClick: () => void;
    hoursRecord?: Record<string, string> | null;
    todayLabel?: string;
}) {
    const { isOpen, statusText } = getSalonOpenStatus(hoursRecord || null, todayLabel || '');

    return (
        <div className={styles.salonInfoHeader}>
            {/* Badges Row */}
            <div className={styles.salonBadges}>
                {salon.isFeatured && (
                    <span className={styles.featuredBadgeLarge}>
                        <FaAward /> Featured
                    </span>
                )}
                {salon.bookingType === 'MOBILE' && (
                    <span className={styles.mobileBadge}>
                        <FaTruck /> Mobile service
                    </span>
                )}
                {salon.bookingType === 'BOTH' && (
                    <span className={styles.mobileBadge}>
                        <FaTruck /> Mobile available
                    </span>
                )}
            </div>

            {/* Salon Name */}
            <h1 className={styles.salonNameLarge}>
                {salon.name}
                {salon.isVerified && <VerificationBadge size="medium" />}
            </h1>

            {/* Rating & Reviews */}
            <div className={styles.salonRatingRow}>
                {salon.avgRating != null && salon.avgRating > 0 && (
                    <div className={styles.ratingDisplay}>
                        <span className={styles.ratingValue}>{salon.avgRating.toFixed(1)}</span>
                        <div className={styles.ratingStars}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <FaStar
                                    key={star}
                                    className={star <= Math.round(salon.avgRating || 0) ? styles.starFilled : styles.starEmpty}
                                />
                            ))}
                        </div>
                        {reviewsCount > 0 && (
                            <button className={styles.reviewsLink} onClick={onReviewsClick}>
                                ({reviewsCount} review{reviewsCount !== 1 ? 's' : ''})
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Open/Closed Status */}
            {hoursRecord && (
                <div className={`${styles.statusRow} ${isOpen ? styles.open : styles.closed}`}>
                    <FaRegClock />
                    <span className={styles.statusDot} />
                    <span>{isOpen ? 'Open' : 'Closed'} - {statusText}</span>
                </div>
            )}

            {/* Address */}
            <p className={styles.salonAddress}>
                <FaMapMarkerAlt />
                {salon.address || `${salon.town}, ${salon.city}, ${salon.province}`}
            </p>

            {/* Feature Indicators */}
            <div className={styles.featureIndicators}>
                <span className={styles.featureIndicator}>
                    <FaCheckCircle /> Instant confirmation
                </span>
            </div>
        </div>
    );
}

// About Section Component
export function AboutSection({
    salon,
    latitude,
    longitude,
    mapsHref,
    hoursRecord,
    todayLabel,
    orderedOperatingDays,
}: {
    salon: Salon;
    latitude?: number | null;
    longitude?: number | null;
    mapsHref: string;
    hoursRecord: Record<string, string> | null;
    todayLabel: string;
    orderedOperatingDays: string[];
}) {
    const addressText = salon.address || `${salon.town}, ${salon.city}, ${salon.province}`;

    return (
        <div className={styles.aboutContent}>
            {/* Description */}
            {salon.description && (
                <div className={styles.aboutSection}>
                    <h3 className={styles.subsectionTitle}>About {salon.name}</h3>
                    <p className={styles.aboutDescription}>{salon.description}</p>
                </div>
            )}

            {/* Opening Times */}
            {hoursRecord && (
                <div className={styles.aboutSection}>
                    <h3 className={styles.subsectionTitle}>Opening hours</h3>
                    <div className={styles.aboutHoursList}>
                        {orderedOperatingDays.map(day => {
                            const hours = hoursRecord[day];
                            const isToday = day === todayLabel;
                            const isClosed = hours?.toLowerCase() === 'closed';

                            return (
                                <div key={day} className={`${styles.aboutHoursRow} ${isToday ? styles.today : ''}`}>
                                    <span className={`${styles.dayDot} ${isClosed ? styles.closedDot : styles.openDot}`} />
                                    <span className={styles.dayName}>{day}</span>
                                    <span className={isClosed ? styles.closedText : ''}>
                                        {hours || 'Closed'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Additional Information */}
            <div className={styles.aboutSection}>
                <h3 className={styles.subsectionTitle}>Additional information</h3>
                <div className={styles.aboutInfoList}>
                    <div className={styles.aboutInfoRow}>
                        <FaCheckCircle className={styles.infoIconGreen} />
                        <span>Instant Confirmation</span>
                    </div>
                    {salon.isVerified && (
                        <div className={styles.aboutInfoRow}>
                            <FaCheckCircle className={styles.infoIconGreen} />
                            <span>Verified Business</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Location & Large Map at Bottom */}
            <div className={styles.aboutSection}>
                <h3 className={styles.subsectionTitle}>Location</h3>
                <div className={styles.fullLocationDisplay}>
                    <div className={styles.locationIcon}>
                        <FaMapMarkerAlt />
                    </div>
                    <div className={styles.locationDetails}>
                        {salon.address && (
                            <div className={styles.locationLine}>
                                <strong>{salon.address}</strong>
                            </div>
                        )}
                        {salon.town && (
                            <div className={styles.locationLine}>{salon.town}</div>
                        )}
                        {salon.city && (
                            <div className={styles.locationLine}>{salon.city}</div>
                        )}
                        {salon.province && (
                            <div className={styles.locationLine}>{salon.province}</div>
                        )}
                        {salon.postalCode && (
                            <div className={styles.locationLine}>{salon.postalCode}</div>
                        )}
                    </div>
                </div>
                {latitude && longitude && (
                    <div className={styles.aboutLargeMapWrapper}>
                        <MapboxMap
                            latitude={Number(latitude)}
                            longitude={Number(longitude)}
                            height={450}
                            zoom={15}
                            style="streets"
                            markerColor="#F51957"
                            interactive={true}
                            showPopup={true}
                            popupContent={`<strong>${salon.name}</strong><br/>${addressText}`}
                        />
                        <a
                            href={mapsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.mapGetDirectionsBtn}
                        >
                            <FaDirections /> Get directions
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

// Booksy-style Reviews Section
export function BooksyReviewsSection({
    reviews,
    avgRating,
    galleryImages,
    onOpenLightbox,
}: {
    reviews: Review[];
    avgRating: number;
    galleryImages: GalleryImage[];
    onOpenLightbox: (images: string[], index: number) => void;
}) {
    const [visibleCount, setVisibleCount] = useState(5);
    const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
    const totalReviews = reviews.length;

    // Calculate rating distribution
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[review.rating - 1]++;
        }
    });

    const maxCount = Math.max(...ratingCounts, 1);

    // Sort reviews
    const sortedReviews = useMemo(() => {
        const sorted = [...reviews];
        if (sortBy === 'recent') {
            sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return sorted;
    }, [reviews, sortBy]);

    const displayedReviews = sortedReviews.slice(0, visibleCount);

    // Get client photos from gallery
    const clientPhotoUrls = galleryImages.map(g => g.imageUrl).slice(0, 6);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (reviews.length === 0) {
        return (
            <div className={styles.emptyReviews}>
                <FaStar className={styles.emptyIcon} />
                <p>No reviews yet. Be the first to leave a review!</p>
            </div>
        );
    }

    return (
        <>
            {/* Rating Summary Card */}
            <div className={styles.ratingSummaryCard}>
                <div className={styles.ratingSummary}>
                    <div className={styles.ratingOverview}>
                        <div className={styles.ratingBig}>{avgRating.toFixed(1)}</div>
                        <div className={styles.overviewStars}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <FaStar
                                    key={star}
                                    className={star <= Math.round(avgRating) ? styles.starFilled : styles.starEmpty}
                                />
                            ))}
                        </div>
                        <div className={styles.reviewCount}>{totalReviews} reviews</div>
                    </div>
                    <div className={styles.ratingBars}>
                        {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} className={styles.ratingBarRow}>
                                <span className={styles.ratingBarLabel}>{star}</span>
                                <div className={styles.ratingBarTrack}>
                                    <div
                                        className={styles.ratingBarFill}
                                        style={{ width: `${(ratingCounts[star - 1] / maxCount) * 100}%` }}
                                    />
                                </div>
                                <span className={styles.ratingBarCount}>{ratingCounts[star - 1]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Client Photos */}
            {clientPhotoUrls.length > 0 && (
                <div className={styles.clientPhotos}>
                    <h3 className={styles.clientPhotosTitle}>Client photos</h3>
                    <div className={styles.clientPhotosGrid}>
                        {clientPhotoUrls.map((url, idx) => (
                            <div
                                key={idx}
                                className={styles.clientPhotoItem}
                                onClick={() => onOpenLightbox(clientPhotoUrls, idx)}
                            >
                                <OptimizedImage
                                    src={transformCloudinary(url, { width: 180, quality: 'auto', format: 'auto', crop: 'fill' })}
                                    alt={`Client photo ${idx + 1}`}
                                    fill
                                    sizes="72px"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sort Options */}
            <div className={styles.sortOptions}>
                <button
                    className={`${styles.sortBtn} ${sortBy === 'recent' ? styles.active : ''}`}
                    onClick={() => setSortBy('recent')}
                >
                    Most recent
                </button>
                <button
                    className={`${styles.sortBtn} ${sortBy === 'helpful' ? styles.active : ''}`}
                    onClick={() => setSortBy('helpful')}
                >
                    Most helpful
                </button>
            </div>

            {/* Individual Reviews */}
            <div className={styles.reviewsList}>
                {displayedReviews.map(review => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewCardHeader}>
                            {/* Reviewer Avatar & Info */}
                            <div className={styles.reviewerSection}>
                                <div className={styles.reviewerAvatar}>
                                    {(review.author?.firstName?.charAt(0) || 'A').toUpperCase()}
                                </div>
                                <div className={styles.reviewerDetails}>
                                    <span className={styles.reviewerName}>
                                        {review.author?.firstName || 'Anonymous'} {review.author?.lastName?.charAt(0) || ''}.
                                    </span>
                                    {review.booking?.service && (
                                        <span className={styles.reviewServiceInfo}>{review.booking.service.title}</span>
                                    )}
                                </div>
                            </div>

                            {/* Rating & Date */}
                            <div className={styles.reviewMeta}>
                                <div className={styles.reviewRatingStars}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <FaStar
                                            key={star}
                                            className={star <= review.rating ? styles.starFilled : styles.starEmpty}
                                        />
                                    ))}
                                </div>
                                <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                            </div>
                        </div>

                        {/* Review Comment */}
                        {review.comment && (
                            <p className={styles.reviewComment}>{review.comment}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {visibleCount < totalReviews && (
                <button
                    className={styles.loadMoreReviews}
                    onClick={() => setVisibleCount(prev => prev + 5)}
                >
                    Show more reviews ({totalReviews - visibleCount} remaining)
                </button>
            )}
        </>
    );
}


