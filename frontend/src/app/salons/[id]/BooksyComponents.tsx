'use client';

import React from 'react';
import type { IconType } from 'react-icons';
import {
    FaChevronRight,
    FaGoogle,
    FaMapMarkerAlt,
    FaStar,
    FaTruck,
    FaDirections,
    FaCheckCircle,
    FaAward,
    FaRegClock,
    FaImages,
} from 'react-icons/fa';
import { Salon, GalleryImage } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import styles from './BooksyLayout.module.css';
import VerificationBadge from '@/components/VerificationBadge/VerificationBadge';
import MapboxMap from '@/components/MapboxMap';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import { getSalonOpenStatus } from './salonOpenStatus';
import { getSalonGalleryImages } from '@/lib/salonGalleryImages';

// Sticky Tab Navigation Component
export function StickyTabNavigation({
    activeSection,
    onTabClick,
    hasPhotos,
    hasTeam,
    reviewLinksCount,
}: {
    activeSection: string;
    onTabClick: (sectionId: string) => void;
    hasPhotos: boolean;
    hasTeam: boolean;
    reviewLinksCount: number;
}) {
    const tabs = [
        { id: 'services-section', label: 'Services', show: true },
        { id: 'photos-section', label: 'Photos', show: hasPhotos },
        { id: 'reviews-section', label: 'Reviews', count: reviewLinksCount, show: reviewLinksCount > 0 },
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

export function ExternalReviewsSection({
    salon,
}: {
    salon: Salon;
}) {
    const reviewLinks = [
        salon.googleReviewsUrl ? {
            href: salon.googleReviewsUrl,
            label: 'Google reviews',
            description: 'Read customer feedback on Google',
            icon: FaGoogle,
        } : null,
        salon.freshaReviewsUrl ? {
            href: salon.freshaReviewsUrl,
            label: 'Fresha reviews',
            description: 'Open the salon profile on Fresha',
            icon: FaStar,
        } : null,
        salon.booksyReviewsUrl ? {
            href: salon.booksyReviewsUrl,
            label: 'Booksy reviews',
            description: 'See ratings and reviews on Booksy',
            icon: FaStar,
        } : null,
    ].filter(Boolean) as Array<{
        href: string;
        label: string;
        description: string;
        icon: IconType;
    }>;

    if (reviewLinks.length === 0) {
        return (
            <div className={styles.emptyReviews}>
                <FaStar className={styles.emptyIcon} />
                <p>This salon has not linked external reviews yet.</p>
            </div>
        );
    }

    return (
        <div className={styles.aboutContent}>
            <section className={styles.aboutSection}>
                <h3 className={styles.subsectionTitle}>External review platforms</h3>
                <p className={styles.aboutDescription}>
                    Stylr SA no longer stores reviews directly on the platform. Use the links below to read this salon&apos;s reviews on Google, Fresha, or Booksy.
                </p>
            </section>

            <section className={styles.aboutSection}>
                <div className={styles.externalReviewLinks}>
                    {reviewLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.externalReviewLink}
                            >
                                <div className={styles.externalReviewIcon}>
                                    <Icon />
                                </div>
                                <div className={styles.externalReviewCopy}>
                                    <span className={styles.externalReviewLabel}>{link.label}</span>
                                    <span className={styles.externalReviewDescription}>{link.description}</span>
                                </div>
                                <FaChevronRight className={styles.externalReviewArrow} />
                            </a>
                        );
                    })}
                </div>
            </section>
        </div>
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
    const allImages = getSalonGalleryImages(salon, galleryImages);

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

