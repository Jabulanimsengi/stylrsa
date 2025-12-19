'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    FaStar,
    FaMapMarkerAlt,
    FaPhone,
    FaWhatsapp,
    FaDirections,
    FaBolt,
    FaChevronRight,
    FaChevronLeft,
    FaCheck,
    FaPlus,
    FaClock,
    FaImages,
    FaHeart,
    FaRegHeart,
    FaShare,
    FaCopy,
    FaCheckCircle,
    FaRegClock,
    FaAward,
    FaTimes,
} from 'react-icons/fa';
import { Salon, Service, GalleryImage, Review } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import VerificationBadge from '@/components/VerificationBadge/VerificationBadge';
import { SERVICE_CATEGORIES } from '@/constants/categories';
import MapboxMap from '@/components/MapboxMap';
import styles from './MobileSalonProfile.module.css';

type TabType = 'photos' | 'services' | 'details' | 'reviews';

interface MobileSalonProfileProps {
    salon: Salon;
    services: Service[];
    galleryImages: GalleryImage[];
    reviews: Review[];
    hoursRecord: Record<string, string> | null;
    todayLabel: string;
    orderedOperatingDays: string[];
    latitude?: number | null;
    longitude?: number | null;
    mapsHref: string;
    onOpenLightbox: (images: string[], index: number) => void;
    onBookService: (service: Service) => void;
    onBookNow: () => void;
}

// Map category slugs to names for lookup
const CATEGORY_NAME_BY_SLUG = new Map(
    SERVICE_CATEGORIES.map(cat => [cat.slug, cat.name])
);

// Valid category names set for quick lookup
const VALID_CATEGORY_NAMES = new Set(SERVICE_CATEGORIES.map(cat => cat.name));

// Manual aliases for category normalization
const CATEGORY_ALIASES: Record<string, string> = {
    'makeup': 'Makeup & Beauty',
    'make-up': 'Makeup & Beauty',
    'make up': 'Makeup & Beauty',
    'hair': 'Haircuts & Styling',
    'nails': 'Nail Care',
    'bridal': 'Bridal Services',
    'wedding': 'Bridal Services',
    'wigs': 'Wig Installations',
    'wig': 'Wig Installations',
    'braids': 'Braiding & Weaving',
    'braid': 'Braiding & Weaving',
    'weaving': 'Braiding & Weaving',
    'lashes': 'Lashes & Brows',
    'lash': 'Lashes & Brows',
    'brows': 'Lashes & Brows',
    'natural': 'Natural Hair Specialists',
    'color': 'Hair Color & Treatments',
    'colour': 'Hair Color & Treatments',
    'treatment': 'Hair Color & Treatments',
    'wellness': 'Wellness & Holistic Spa',
    'spa': 'Wellness & Holistic Spa',
    'tattoo': 'Tattoos & Piercings',
    'aesthetic': 'Aesthetics & Advanced Skin',
    'manicure': 'Nail Care',
    'pedicure': 'Nail Care',
    'haircut': 'Haircuts & Styling',
    'facial': 'Skin Care & Facials',
    'massage': 'Massage & Body Treatments',
    'wax': 'Waxing & Hair Removal',
    'barber': "Men's Grooming",
    'beauty': 'Makeup & Beauty'
};

// Helper to check if salon is currently open
function getOpenStatus(hoursRecord: Record<string, string> | null, todayLabel: string): { isOpen: boolean; statusText: string } {
    if (!hoursRecord) return { isOpen: false, statusText: 'Hours not available' };

    const todayHours = hoursRecord[todayLabel];
    if (!todayHours || todayHours.toLowerCase() === 'closed') {
        // Find next open day
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const todayIndex = days.indexOf(todayLabel);
        for (let i = 1; i <= 7; i++) {
            const nextDay = days[(todayIndex + i) % 7];
            const nextHours = hoursRecord[nextDay];
            if (nextHours && nextHours.toLowerCase() !== 'closed') {
                return { isOpen: false, statusText: `Opens ${nextDay} at ${nextHours.split('-')[0]?.trim() || '09:00'}` };
            }
        }
        return { isOpen: false, statusText: 'Closed' };
    }

    // Parse hours (e.g., "09:00 - 18:00")
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [openTime, closeTime] = todayHours.split('-').map(t => t.trim());
    if (openTime && closeTime) {
        const [openH, openM] = openTime.split(':').map(Number);
        const [closeH, closeM] = closeTime.split(':').map(Number);
        const openMinutes = (openH || 0) * 60 + (openM || 0);
        const closeMinutes = (closeH || 0) * 60 + (closeM || 0);

        if (currentTime >= openMinutes && currentTime < closeMinutes) {
            return { isOpen: true, statusText: `Open until ${closeTime}` };
        } else if (currentTime < openMinutes) {
            return { isOpen: false, statusText: `Opens at ${openTime}` };
        } else {
            return { isOpen: false, statusText: `Closed · Opens tomorrow` };
        }
    }

    return { isOpen: false, statusText: todayHours };
}

export default function MobileSalonProfile({
    salon,
    services,
    galleryImages,
    reviews,
    hoursRecord,
    todayLabel,
    orderedOperatingDays,
    latitude,
    longitude,
    mapsHref,
    onOpenLightbox,
    onBookService,
    onBookNow,
}: MobileSalonProfileProps) {
    const [activeTab, setActiveTab] = useState<TabType>('services');
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const tabsRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);

    // Get open status
    const { isOpen, statusText } = getOpenStatus(hoursRecord, todayLabel);

    // Get all gallery images
    const allImages = useMemo(() => {
        const images: string[] = [];
        if (salon.heroImages?.length) images.push(...salon.heroImages);
        if (salon.backgroundImage && !images.includes(salon.backgroundImage)) {
            images.push(salon.backgroundImage);
        }
        galleryImages.forEach(g => {
            if (!images.includes(g.imageUrl)) images.push(g.imageUrl);
        });
        if (images.length === 0 && salon.logo) images.push(salon.logo);
        return images;
    }, [salon, galleryImages]);

    // Group services by category (Fresha-style)
    const groupedServices = useMemo(() => {
        const groups: Record<string, Service[]> = {};

        services.forEach(service => {
            // Get category name from service
            const categoryName = (service as any).category?.name || '';
            const categorySlug = (service as any).category?.slug || (service as any).categoryId || '';

            // Determine the valid category name
            let validCategoryName = '';

            // 1. Direct match
            if (VALID_CATEGORY_NAMES.has(categoryName)) {
                validCategoryName = categoryName;
            }
            // 2. Slug match
            else if (categorySlug && CATEGORY_NAME_BY_SLUG.has(categorySlug)) {
                validCategoryName = CATEGORY_NAME_BY_SLUG.get(categorySlug)!;
            }
            // 3. Alias match
            else if (categoryName) {
                const lowerName = categoryName.toLowerCase();
                for (const [alias, target] of Object.entries(CATEGORY_ALIASES)) {
                    if (lowerName === alias || lowerName.includes(alias)) {
                        validCategoryName = target;
                        break;
                    }
                }
            }

            // Fallback to "Other Services" if no valid category found
            if (!validCategoryName) {
                validCategoryName = 'Other Services';
            }

            if (!groups[validCategoryName]) {
                groups[validCategoryName] = [];
            }
            groups[validCategoryName].push(service);
        });

        // Sort categories based on the order in SERVICE_CATEGORIES
        const categoryOrder = new Map(SERVICE_CATEGORIES.map((cat, index) => [cat.name, index]));

        return Object.entries(groups)
            .map(([categoryName, categoryServices]) => ({
                categoryName,
                services: categoryServices
            }))
            .sort((a, b) => {
                const orderA = categoryOrder.get(a.categoryName) ?? 999;
                const orderB = categoryOrder.get(b.categoryName) ?? 999;
                return orderA - orderB;
            });
    }, [services]);

    // Get unique categories for filter pills
    const categories = useMemo(() => {
        return [
            { id: 'all', name: 'All Services' },
            ...groupedServices.map(g => ({ id: g.categoryName, name: g.categoryName }))
        ];
    }, [groupedServices]);

    // Filter services based on active category
    const filteredGroups = useMemo(() => {
        if (activeCategory === 'all') {
            return groupedServices;
        }
        return groupedServices.filter(g => g.categoryName === activeCategory);
    }, [groupedServices, activeCategory]);

    // Toggle service selection
    const toggleService = (service: Service) => {
        setSelectedServices(prev => {
            const isSelected = prev.some(s => s.id === service.id);
            if (isSelected) {
                return prev.filter(s => s.id !== service.id);
            }
            return [...prev, service];
        });
    };

    // Check if service is selected
    const isServiceSelected = (serviceId: string) => {
        return selectedServices.some(s => s.id === serviceId);
    };

    // Calculate totals
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

    // Format duration
    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    // Handle continue booking
    const handleContinue = () => {
        if (selectedServices.length > 0) {
            selectedServices.forEach(service => onBookService(service));
        } else {
            onBookNow();
        }
    };

    // Handle carousel swipe
    const handleSwipe = useCallback((direction: 'left' | 'right') => {
        if (direction === 'left' && currentImageIndex < allImages.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        } else if (direction === 'right' && currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    }, [currentImageIndex, allImages.length]);

    // Touch handling for carousel
    const touchStartX = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;
        if (Math.abs(diff) > 50) {
            handleSwipe(diff > 0 ? 'left' : 'right');
        }
    };

    // Copy address to clipboard
    const handleCopyAddress = async () => {
        const addressText = salon.address || [salon.town, salon.city, salon.province].filter(Boolean).join(', ');
        await navigator.clipboard.writeText(addressText);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    // Share salon
    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (navigator.share) {
            try {
                await navigator.share({
                    title: salon.name,
                    text: `Check out ${salon.name} on Stylr SA!`,
                    url,
                });
            } catch (err) {
                // User cancelled or error
            }
        } else {
            await navigator.clipboard.writeText(url);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        }
    };

    const addressText = salon.address || [salon.town, salon.city, salon.province].filter(Boolean).join(', ');

    return (
        <>
            <div className={styles.mobileProfile}>
                {/* Hero Carousel Section */}
                <div
                    className={styles.heroCarousel}
                    ref={carouselRef}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {allImages.length > 0 ? (
                        <>
                            <div
                                className={styles.carouselTrack}
                                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                            >
                                {allImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={styles.carouselSlide}
                                        onClick={() => onOpenLightbox(allImages, idx)}
                                    >
                                        <Image
                                            src={transformCloudinary(img, { width: 800, quality: 'auto', format: 'auto', crop: 'fill' })}
                                            alt={`${salon.name} photo ${idx + 1}`}
                                            fill
                                            sizes="100vw"
                                            priority={idx === 0}
                                            className={styles.heroImage}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Carousel Indicators */}
                            {allImages.length > 1 && (
                                <div className={styles.carouselIndicators}>
                                    {allImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            className={`${styles.indicator} ${idx === currentImageIndex ? styles.active : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex(idx);
                                            }}
                                            aria-label={`Go to photo ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Photo count badge */}
                            <div className={styles.photoCountBadge}>
                                <FaImages /> {currentImageIndex + 1}/{allImages.length}
                            </div>
                        </>
                    ) : (
                        <div className={styles.noImage}>
                            <span>{salon.name.charAt(0)}</span>
                        </div>
                    )}

                    {/* Header Actions - Share & Favorite */}
                    <div className={styles.headerActions}>
                        <button className={styles.actionBtn} onClick={handleShare}>
                            <FaShare />
                        </button>
                        <button
                            className={`${styles.actionBtn} ${isFavorited ? styles.favorited : ''}`}
                            onClick={() => setIsFavorited(!isFavorited)}
                        >
                            {isFavorited ? <FaHeart /> : <FaRegHeart />}
                        </button>
                    </div>
                </div>

                {/* Salon Header */}
                <div className={styles.salonHeader}>
                    <h1 className={styles.salonName}>
                        {salon.name}
                        {salon.isVerified && <VerificationBadge size="small" />}
                    </h1>

                    {/* Rating Row */}
                    <div className={styles.ratingRow}>
                        {salon.avgRating && salon.avgRating > 0 && (
                            <button
                                className={styles.ratingPill}
                                onClick={() => setActiveTab('reviews')}
                            >
                                <FaStar />
                                <span className={styles.ratingValue}>{salon.avgRating.toFixed(1)}</span>
                                <span className={styles.reviewCount}>({reviews.length})</span>
                            </button>
                        )}
                        {salon.isFeatured && (
                            <span className={styles.featuredBadge}>
                                <FaAward /> Featured
                            </span>
                        )}
                        {(salon.bookingType === 'MOBILE' || salon.bookingType === 'BOTH') && (
                            <span className={styles.mobileBadge}>Mobile Service</span>
                        )}
                    </div>

                    {/* Open/Closed Status */}
                    <div className={`${styles.statusRow} ${isOpen ? styles.open : styles.closed}`}>
                        <FaRegClock />
                        <span className={styles.statusDot} />
                        <span className={styles.statusText}>
                            {isOpen ? 'Open' : 'Closed'} · {statusText}
                        </span>
                    </div>

                    {/* Location */}
                    <div className={styles.locationRow}>
                        <FaMapMarkerAlt />
                        <span>{addressText}</span>
                    </div>

                    {/* Feature badges */}
                    <div className={styles.featureBadges}>
                        <span className={styles.featureBadge}>
                            <FaCheckCircle /> Instant confirmation
                        </span>
                    </div>
                </div>

                {/* Tab Navigation - Fresha Style */}
                <div className={styles.tabNav} ref={tabsRef}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'photos' ? styles.active : ''}`}
                        onClick={() => setActiveTab('photos')}
                    >
                        Photos
                        {allImages.length > 0 && <span className={styles.tabBadge}>{allImages.length}</span>}
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'services' ? styles.active : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        Services
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'details' ? styles.active : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        About
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews {reviews.length > 0 && <span className={styles.tabBadge}>{reviews.length}</span>}
                    </button>
                </div>

                {/* Tab Content */}
                <div className={styles.tabContent}>
                    {/* Photos Tab */}
                    {activeTab === 'photos' && (
                        <div className={styles.photosTab}>
                            <div className={styles.photosGrid}>
                                {allImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={styles.photoItem}
                                        onClick={() => onOpenLightbox(allImages, idx)}
                                    >
                                        <Image
                                            src={transformCloudinary(img, { width: 400, quality: 'auto', format: 'auto', crop: 'fill' })}
                                            alt={`${salon.name} photo ${idx + 1}`}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                        />
                                    </div>
                                ))}
                            </div>
                            {allImages.length === 0 && (
                                <div className={styles.emptyState}>
                                    <FaImages className={styles.emptyIcon} />
                                    <p>No photos available yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Services Tab - Fresha Style */}
                    {activeTab === 'services' && (
                        <div className={styles.servicesTab}>
                            {/* Category Filter Pills */}
                            <div className={styles.categoryFilter} ref={categoryScrollRef}>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`${styles.categoryPill} ${activeCategory === cat.id ? styles.active : ''}`}
                                        onClick={() => setActiveCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {filteredGroups.map(group => (
                                <div key={group.categoryName} className={styles.categorySection}>
                                    <h3 className={styles.categoryTitle}>{group.categoryName}</h3>
                                    <div className={styles.servicesList}>
                                        {group.services.map((service, idx) => {
                                            const isSelected = isServiceSelected(service.id);
                                            const serviceName = service.title || service.name || 'Service';
                                            const hasImages = service.images && service.images.length > 0;
                                            const isPopular = idx === 0 && group.services.length > 3;

                                            return (
                                                <div
                                                    key={service.id}
                                                    className={`${styles.serviceCard} ${isSelected ? styles.selected : ''}`}
                                                    onClick={() => toggleService(service)}
                                                >
                                                    {/* Service Image Thumbnail */}
                                                    {hasImages && (
                                                        <div
                                                            className={styles.serviceThumb}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onOpenLightbox(service.images, 0);
                                                            }}
                                                        >
                                                            <Image
                                                                src={transformCloudinary(service.images[0], { width: 200, quality: 'auto', format: 'auto', crop: 'fill' })}
                                                                alt={serviceName}
                                                                fill
                                                                sizes="80px"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className={styles.serviceMain}>
                                                        <div className={styles.serviceNameRow}>
                                                            <h4 className={styles.serviceName}>{serviceName}</h4>
                                                            {isPopular && (
                                                                <span className={styles.popularBadge}>Popular</span>
                                                            )}
                                                        </div>
                                                        {service.description && (
                                                            <p className={styles.serviceDesc}>{service.description}</p>
                                                        )}
                                                        <div className={styles.serviceMeta}>
                                                            <span className={styles.serviceDuration}>
                                                                <FaClock /> {formatDuration(service.duration)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.serviceRight}>
                                                        <span className={styles.servicePrice}>
                                                            from R{service.price.toFixed(0)}
                                                        </span>
                                                        <button
                                                            className={`${styles.addBtn} ${isSelected ? styles.added : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleService(service);
                                                            }}
                                                            aria-label={isSelected ? 'Remove' : 'Add'}
                                                        >
                                                            {isSelected ? <FaCheck /> : <FaPlus />}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {filteredGroups.length === 0 && (
                                <div className={styles.emptyState}>
                                    <p>No services available yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className={styles.detailsTab}>
                            {/* About Section */}
                            {salon.description && (
                                <section className={styles.detailSection}>
                                    <h3 className={styles.sectionTitle}>About</h3>
                                    <div className={styles.sectionCard}>
                                        <p className={styles.aboutText}>{salon.description}</p>
                                    </div>
                                </section>
                            )}

                            {/* Location & Map */}
                            <section className={styles.detailSection}>
                                <h3 className={styles.sectionTitle}>Location</h3>
                                <div className={styles.sectionCard}>
                                    <div className={styles.addressRow}>
                                        <FaMapMarkerAlt />
                                        <span>{addressText}</span>
                                        <button
                                            className={styles.copyBtn}
                                            onClick={handleCopyAddress}
                                        >
                                            {showCopied ? <FaCheck /> : <FaCopy />}
                                        </button>
                                    </div>
                                    {latitude && longitude && (
                                        <div className={styles.mapWrapper}>
                                            <MapboxMap
                                                latitude={latitude}
                                                longitude={longitude}
                                                height={200}
                                                zoom={15}
                                                style="streets"
                                                markerColor="#F51957"
                                            />
                                            <a
                                                href={mapsHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.directionsLink}
                                            >
                                                <FaDirections />
                                                Get Directions
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Business Hours */}
                            {hoursRecord && (
                                <section className={styles.detailSection}>
                                    <h3 className={styles.sectionTitle}>Opening times</h3>
                                    <div className={styles.sectionCard}>
                                        <div className={styles.hoursList}>
                                            {orderedOperatingDays.map(day => {
                                                const hours = hoursRecord[day];
                                                const isToday = day === todayLabel;
                                                const isClosed = hours?.toLowerCase() === 'closed';

                                                return (
                                                    <div
                                                        key={day}
                                                        className={`${styles.hoursRow} ${isToday ? styles.today : ''}`}
                                                    >
                                                        <span className={`${styles.dayDot} ${isClosed ? styles.closedDot : styles.openDot}`} />
                                                        <span className={styles.dayName}>{day}</span>
                                                        <span className={`${styles.hoursValue} ${isClosed ? styles.closed : ''}`}>
                                                            {hours || 'Closed'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Additional Information */}
                            <section className={styles.detailSection}>
                                <h3 className={styles.sectionTitle}>Additional information</h3>
                                <div className={styles.sectionCard}>
                                    <div className={styles.infoRow}>
                                        <FaCheckCircle className={styles.infoIcon} />
                                        <span>Instant Confirmation</span>
                                    </div>
                                    {salon.isVerified && (
                                        <div className={styles.infoRow}>
                                            <FaCheckCircle className={styles.infoIcon} />
                                            <span>Verified Business</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Contact */}
                            <section className={styles.detailSection}>
                                <h3 className={styles.sectionTitle}>Contact</h3>
                                <div className={styles.sectionCard}>
                                    {salon.phoneNumber && (
                                        <a
                                            href={`tel:${salon.phoneNumber.replace(/[^0-9+]/g, '')}`}
                                            className={styles.contactRow}
                                        >
                                            <div className={styles.contactIcon}>
                                                <FaPhone />
                                            </div>
                                            <div className={styles.contactInfo}>
                                                <span className={styles.contactLabel}>Phone</span>
                                                <span className={styles.contactValue}>{salon.phoneNumber}</span>
                                            </div>
                                            <FaChevronRight className={styles.contactArrow} />
                                        </a>
                                    )}
                                    {salon.whatsapp && (
                                        <a
                                            href={`https://wa.me/${salon.whatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.contactRow}
                                        >
                                            <div className={`${styles.contactIcon} ${styles.whatsapp}`}>
                                                <FaWhatsapp />
                                            </div>
                                            <div className={styles.contactInfo}>
                                                <span className={styles.contactLabel}>WhatsApp</span>
                                                <span className={styles.contactValue}>Message on WhatsApp</span>
                                            </div>
                                            <FaChevronRight className={styles.contactArrow} />
                                        </a>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className={styles.reviewsTab}>
                            <MobileReviewsContent
                                reviews={reviews}
                                avgRating={salon.avgRating || 0}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Sticky Book Bar - Enhanced */}
            <div className={`${styles.mobileBookBar} ${selectedServices.length > 0 ? styles.expanded : ''}`}>
                {selectedServices.length > 0 ? (
                    <>
                        <div className={styles.bookBarSummary}>
                            <div className={styles.bookBarInfo}>
                                <span className={styles.bookBarCount}>
                                    {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}
                                </span>
                                <span className={styles.bookBarDuration}>
                                    <FaClock /> {formatDuration(totalDuration)}
                                </span>
                            </div>
                            <span className={styles.bookBarPrice}>R{totalPrice.toFixed(0)}</span>
                        </div>
                        <button className={styles.bookBarButton} onClick={handleContinue}>
                            Continue
                        </button>
                        <button
                            className={styles.clearBtn}
                            onClick={() => setSelectedServices([])}
                        >
                            <FaTimes />
                        </button>
                    </>
                ) : (
                    <>
                        <button className={styles.mobileBookBtn} onClick={onBookNow}>
                            <FaBolt /> Book now
                        </button>
                        {salon.whatsapp && (
                            <a
                                href={`https://wa.me/${salon.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi! I found your salon on Stylr SA and I'd like to make a booking.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.mobileWhatsappBtn}
                            >
                                <FaWhatsapp />
                            </a>
                        )}
                    </>
                )}
            </div>
        </>
    );
}


// Mobile Reviews Content Component
function MobileReviewsContent({
    reviews,
    avgRating,
}: {
    reviews: Review[];
    avgRating: number;
}) {
    const [visibleCount, setVisibleCount] = useState(5);
    const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

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
        // 'helpful' would sort by a helpfulCount field if available
        return sorted;
    }, [reviews, sortBy]);

    const displayedReviews = sortedReviews.slice(0, visibleCount);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-ZA', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (reviews.length === 0) {
        return (
            <div className={styles.emptyState}>
                <FaStar className={styles.emptyIcon} />
                <p>No reviews yet. Be the first to leave a review!</p>
            </div>
        );
    }

    return (
        <div className={styles.reviewsContent}>
            {/* Rating Summary */}
            <div className={styles.ratingSummary}>
                <div className={styles.ratingOverview}>
                    <div className={styles.ratingBig}>{avgRating.toFixed(1)}</div>
                    <div className={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <FaStar
                                key={star}
                                className={star <= Math.round(avgRating) ? styles.starFilled : styles.starEmpty}
                            />
                        ))}
                    </div>
                    <div className={styles.reviewTotal}>{reviews.length} reviews</div>
                </div>
                <div className={styles.ratingBars}>
                    {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className={styles.ratingBarRow}>
                            <span className={styles.barLabel}>{star}</span>
                            <div className={styles.barTrack}>
                                <div
                                    className={styles.barFill}
                                    style={{ width: `${(ratingCounts[star - 1] / maxCount) * 100}%` }}
                                />
                            </div>
                            <span className={styles.barCount}>{ratingCounts[star - 1]}</span>
                        </div>
                    ))}
                </div>
            </div>

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

            {/* Reviews List */}
            <div className={styles.reviewsList}>
                {displayedReviews.map(review => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <div className={styles.reviewerInfo}>
                                <div className={styles.reviewerAvatar}>
                                    {(review.author?.firstName?.charAt(0) || 'A').toUpperCase()}
                                </div>
                                <div>
                                    <div className={styles.reviewerName}>
                                        {review.author?.firstName || 'Anonymous'} {review.author?.lastName?.charAt(0) || ''}.
                                    </div>
                                    {review.booking?.service && (
                                        <div className={styles.reviewService}>{review.booking.service.title}</div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.reviewMeta}>
                                <div className={styles.reviewStars}>
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
                        {review.comment && (
                            <p className={styles.reviewText}>{review.comment}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Load More */}
            {visibleCount < reviews.length && (
                <button
                    className={styles.loadMoreBtn}
                    onClick={() => setVisibleCount(prev => prev + 5)}
                >
                    Show more reviews ({reviews.length - visibleCount} remaining)
                </button>
            )}
        </div>
    );
}
