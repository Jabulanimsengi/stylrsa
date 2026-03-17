'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
    FaStar,
    FaMapMarkerAlt,
    FaPhone,
    FaWhatsapp,
    FaGlobe,
    FaDirections,
    FaBolt,
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
    FaChevronRight,
} from 'react-icons/fa';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel"
import { Salon, Service, GalleryImage, Review } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import VerificationBadge from '@/components/VerificationBadge/VerificationBadge';
import { SERVICE_CATEGORIES } from '@/constants/categories';
import MapboxMap from '@/components/MapboxMap';
import styles from './MobileSalonProfile.module.css';
import MaterialsShowcase from '@/components/MaterialsShowcase/MaterialsShowcase';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import { notify } from '@/lib/notify';
import { getSalonOpenStatus } from './salonOpenStatus';

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
    onToggleFavorite: () => void | Promise<void>;
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

function normalizeCategoryValue(value: unknown): string {
    if (typeof value === 'string') {
        return value.trim();
    }

    if (value == null) {
        return '';
    }

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        const nestedName = record.name ?? record.title ?? record.label ?? record.slug;
        if (typeof nestedName === 'string') {
            return nestedName.trim();
        }
    }

    return String(value).trim();
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
    onToggleFavorite,
    onBookService,
    onBookNow,
}: MobileSalonProfileProps) {
    const [activeTab, setActiveTab] = useState<TabType>('services');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isFavorited, setIsFavorited] = useState(Boolean(salon.isFavorited));
    const [showCopied, setShowCopied] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const tabsRef = useRef<HTMLDivElement>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);

    // Carousel API state for tracking current slide
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    // Carousel API effect to sync current slide
    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on('select', () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    useEffect(() => {
        setIsFavorited(Boolean(salon.isFavorited));
    }, [salon.isFavorited]);

    // Get open status
    const { isOpen, statusText } = getSalonOpenStatus(hoursRecord, todayLabel);

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
            const categoryName = normalizeCategoryValue(service.category);
            const categorySlug = normalizeCategoryValue(service.categoryId);

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
        setSelectedService(prev => (prev?.id === service.id ? null : service));
    };

    // Check if service is selected
    const isServiceSelected = (serviceId: string) => {
        return selectedService?.id === serviceId;
    };

    // Calculate totals
    const totalPrice = selectedService?.price ?? 0;
    const totalDuration = selectedService?.duration ?? 0;

    // Format duration
    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    // Handle continue booking
    const handleContinue = () => {
        if (selectedService) {
            onBookService(selectedService);
            return;
        }

        onBookNow();
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
            } catch {
                // User cancelled or error
            }
        } else {
            await navigator.clipboard.writeText(url);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        }
    };

    const addressText = salon.address || [salon.town, salon.city, salon.province].filter(Boolean).join(', ');
    const primaryPhoneHref = salon.phoneNumber ? `tel:${salon.phoneNumber.replace(/[^0-9+]/g, '')}` : null;
    const primaryWhatsappHref = salon.whatsapp
        ? `https://wa.me/${salon.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi! I found your salon on Stylr SA and I'd like to make a booking.`)}`
        : null;
    const bookingModeLabel = salon.bookingType === 'BOTH'
        ? 'Mobile and in-salon bookings'
        : salon.bookingType === 'MOBILE'
            ? 'Mobile bookings available'
            : 'In-salon bookings';

    return (
        <>
            <div className={styles.mobileProfile}>
                {/* Hero Carousel Section - Shadcn UI */}
                <div className={styles.heroCarousel}>
                    {allImages.length > 0 ? (
                        <Carousel
                            setApi={setApi}
                            opts={{
                                align: 'start',
                                loop: true,
                            }}
                            orientation="horizontal"
                            style={{ width: '100%', height: '100%' }}
                        >
                            <CarouselContent style={{ marginLeft: 0, height: '300px' }}>
                                {allImages.map((img, idx) => (
                                    <CarouselItem
                                        key={idx}
                                        style={{
                                            paddingLeft: 0,
                                            minWidth: '100%',
                                            height: '300px',
                                            position: 'relative'
                                        }}
                                        onClick={() => onOpenLightbox(allImages, idx)}
                                    >
                                        <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                                            <OptimizedImage
                                                src={transformCloudinary(img, { width: 800, quality: 'auto', format: 'auto', crop: 'fill' })}
                                                alt={`${salon.name} photo ${idx + 1}`}
                                                fill
                                                sizes="100vw"
                                                priority={idx === 0}
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>

                            {/* Progress indicators - Max 4 segments with merge animation */}
                            {count > 1 && (
                                <div className={styles.carouselIndicators}>
                                    {(() => {
                                        const maxSegments = 4;
                                        const progress = (current - 1) / (count - 1); // 0 to 1
                                        const activeSegment = Math.floor(progress * maxSegments);

                                        return Array.from({ length: Math.min(maxSegments, count) }).map((_, idx) => {
                                            const isActive = idx === activeSegment;
                                            const isPassed = idx < activeSegment;
                                            const segmentProgress = idx === activeSegment
                                                ? ((current - 1) % Math.ceil(count / maxSegments)) / Math.ceil(count / maxSegments)
                                                : 0;

                                            return (
                                                <button
                                                    key={idx}
                                                    className={`${styles.indicatorSegment} ${isActive ? styles.active : ''} ${isPassed ? styles.passed : ''}`}
                                                    style={{
                                                        width: isPassed ? '32px' : isActive ? `${24 + segmentProgress * 16}px` : '24px'
                                                    }}
                                                    onClick={() => {
                                                        const targetSlide = Math.floor((idx / maxSegments) * count);
                                                        api?.scrollTo(targetSlide);
                                                    }}
                                                    aria-label={`Go to section ${idx + 1}`}
                                                />
                                            );
                                        });
                                    })()}
                                </div>
                            )}

                            {/* Photo count badge */}
                            <div className={styles.photoCountBadge}>
                                <FaImages /> {current}/{count}
                            </div>
                        </Carousel>
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
                            onClick={() => {
                                setIsFavorited((prev) => !prev);
                                void onToggleFavorite();
                            }}
                        >
                            {isFavorited ? <FaHeart /> : <FaRegHeart />}
                        </button>
                    </div>
                </div>

                {/* Salon Header */}
                <div className={styles.salonHeader}>
                    <span className={styles.salonEyebrow}>Salon profile</span>
                    <h1 className={styles.salonName}>
                        {salon.name}
                        {salon.isVerified && <VerificationBadge size="small" />}
                    </h1>

                    {/* Rating Row */}
                    <div className={styles.ratingRow}>
                        {salon.avgRating != null && salon.avgRating > 0 && (
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

                    <div className={styles.trustRow}>
                        <div className={`${styles.statusPill} ${isOpen ? styles.statusPillOpen : styles.statusPillClosed}`}>
                            <FaRegClock />
                            <span>{isOpen ? 'Open' : 'Closed'} - {statusText}</span>
                        </div>
                        <div className={styles.trustPill}>
                            <FaMapMarkerAlt />
                            <span>{addressText}</span>
                        </div>
                        <div className={styles.trustPill}>
                            <FaCheckCircle />
                            <span>{bookingModeLabel}</span>
                        </div>
                    </div>

                    {/* Feature badges */}
                    <div className={styles.featureBadges}>
                        <span className={styles.featureBadge}>
                            <FaCheckCircle /> Instant confirmation
                        </span>
                    </div>

                    <div className={styles.quickActionRow}>
                        <button className={styles.primaryBookAction} onClick={onBookNow}>
                            <FaBolt /> Book now
                        </button>
                        <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={styles.secondaryAction}>
                            <FaDirections /> Directions
                        </a>
                        {primaryPhoneHref ? (
                            <a href={primaryPhoneHref} className={styles.secondaryAction}>
                                <FaPhone /> Call
                            </a>
                        ) : primaryWhatsappHref ? (
                            <a href={primaryWhatsappHref} target="_blank" rel="noopener noreferrer" className={styles.secondaryAction}>
                                <FaWhatsapp /> WhatsApp
                            </a>
                        ) : null}
                    </div>

                    <div className={styles.quickFactsRow}>
                        <span className={styles.quickFactPill}>{services.length} services</span>
                        <span className={styles.quickFactPill}>{allImages.length} photos</span>
                        <span className={styles.quickFactPill}>{reviews.length} reviews</span>
                        {salon.isVerified && <span className={styles.quickFactPill}>Verified</span>}
                    </div>
                </div>

                {/* Tab Navigation - Fresha Style */}
                <div className={styles.tabNav} ref={tabsRef}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'services' ? styles.active : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        Services
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'photos' ? styles.active : ''}`}
                        onClick={() => setActiveTab('photos')}
                    >
                        Photos
                        {allImages.length > 0 && <span className={styles.tabBadge}>{allImages.length}</span>}
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews {reviews.length > 0 && <span className={styles.tabBadge}>{reviews.length}</span>}
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'details' ? styles.active : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        About
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
                                        <OptimizedImage
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
                                                            <OptimizedImage
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

                            {/* Materials Showcase */}
                            <MaterialsShowcase
                                salonId={salon.id}
                                onMaterialClick={(material) => {
                                    notify.info(`${material.name} - ${material.isSold ? `R${material.price?.toFixed(2)}` : 'Used by this salon'}`);
                                }}
                            />
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
                                    {salon.website && (
                                        <a
                                            href={salon.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.contactRow}
                                        >
                                            <div className={styles.contactIcon}>
                                                <FaGlobe />
                                            </div>
                                            <div className={styles.contactInfo}>
                                                <span className={styles.contactLabel}>Website</span>
                                                <span className={styles.contactValue}>Visit our website</span>
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
            <div className={`${styles.mobileBookBar} ${selectedService ? styles.expanded : ''}`}>
                {selectedService ? (
                    <>
                        <div className={styles.bookBarSummary}>
                            <div className={styles.bookBarInfo}>
                                <span className={styles.bookBarCount}>
                                    {selectedService.title || selectedService.name}
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
                            onClick={() => setSelectedService(null)}
                        >
                            <FaTimes />
                        </button>
                    </>
                ) : (
                    <>
                        <button className={styles.mobileBookBtn} onClick={onBookNow}>
                            <FaBolt /> Book now
                        </button>
                        {primaryWhatsappHref && (
                            <a
                                href={primaryWhatsappHref}
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

