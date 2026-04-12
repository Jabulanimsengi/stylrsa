'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Service, Salon } from '@/types';
import styles from './FreshaServiceList.module.css';
import { FaPlus, FaCheck, FaImages, FaStar, FaTimes, FaArrowUp } from 'react-icons/fa';
import Image from 'next/image';
import { transformCloudinary } from '@/utils/cloudinary';
import { SERVICE_CATEGORIES } from '@/constants/categories';
import { EmptyState } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { buildSalonServicePath } from '@/lib/salonSeoHelpers';
import {
    formatServiceDiscountLabel,
    getServiceDiscountedPrice,
    hasServiceDiscount,
} from '@/lib/servicePricing';

interface FreshaServiceListProps {
    services: Service[];
    salon: Salon;
    onBook: (services: Service[]) => void;
    onImageClick: (images: string[], index: number) => void;
    isBookingJourneyActive?: boolean;
}

interface CategoryService {
    categoryName: string;
    categoryId: string;
    services: Service[];
}

type ServiceCategoryMeta = {
    name?: string;
    slug?: string;
};

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
    'bride': 'Bridal Services',

    'wigs': 'Wig Installations',
    'wig': 'Wig Installations',
    'frontal': 'Wig Installations',
    'closure': 'Wig Installations',

    'braids': 'Braiding & Weaving',
    'braid': 'Braiding & Weaving',
    'weaving': 'Braiding & Weaving',
    'cornrows': 'Braiding & Weaving',
    'plait': 'Braiding & Weaving',

    'lashes': 'Lashes & Brows',
    'lash': 'Lashes & Brows',
    'brows': 'Lashes & Brows',
    'brow': 'Lashes & Brows',
    'tint': 'Lashes & Brows',
    'threading': 'Lashes & Brows',

    'natural': 'Natural Hair Specialists',
    'afro': 'Natural Hair Specialists',
    'locs': 'Natural Hair Specialists',
    'dreads': 'Natural Hair Specialists',

    'color': 'Hair Color & Treatments',
    'colour': 'Hair Color & Treatments',
    'dye': 'Hair Color & Treatments',
    'bleach': 'Hair Color & Treatments',
    'highlights': 'Hair Color & Treatments',
    'treatment': 'Hair Color & Treatments',

    'wellness': 'Wellness & Holistic Spa',
    'holistic': 'Wellness & Holistic Spa',
    'spa': 'Wellness & Holistic Spa',
    'yoga': 'Wellness & Holistic Spa',
    'reiki': 'Wellness & Holistic Spa',

    'tattoo': 'Tattoos & Piercings',
    'ink': 'Tattoos & Piercings',
    'piercing': 'Tattoos & Piercings',

    'aesthetic': 'Aesthetics & Advanced Skin',
    'botox': 'Aesthetics & Advanced Skin',
    'filler': 'Aesthetics & Advanced Skin',
    'injection': 'Aesthetics & Advanced Skin',

    // Common specific service terms
    'manicure': 'Nail Care',
    'pedicure': 'Nail Care',
    'acrylic': 'Nail Care',
    'gel': 'Nail Care',

    'haircut': 'Haircuts & Styling',
    'cut': 'Haircuts & Styling',
    'trim': 'Haircuts & Styling',
    'style': 'Haircuts & Styling',
    'blow': 'Haircuts & Styling',
    'wash': 'Haircuts & Styling',

    'facial': 'Skin Care & Facials',
    'peel': 'Skin Care & Facials',
    'skin': 'Skin Care & Facials',
    'dermaplaning': 'Skin Care & Facials',

    'massage': 'Massage & Body Treatments',
    'body': 'Massage & Body Treatments',
    'rub': 'Massage & Body Treatments',

    'wax': 'Waxing & Hair Removal',
    'laser': 'Waxing & Hair Removal',
    'sugaring': 'Waxing & Hair Removal',
    'hair removal': 'Waxing & Hair Removal',

    'barber': "Men's Grooming",
    'men': "Men's Grooming",
    'shave': "Men's Grooming",
    'fade': "Men's Grooming",
    'beard': "Men's Grooming",

    'beauty': 'Makeup & Beauty'
};

export default function FreshaServiceList({
    services,
    salon,
    onBook,
    onImageClick,
    isBookingJourneyActive = false,
}: FreshaServiceListProps) {
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFooterVisible, setIsFooterVisible] = useState(false);

    // Detect when user scrolls near the footer to hide the cart
    useEffect(() => {
        // Find the footer element - look for common footer selectors
        const findFooter = () => {
            return document.querySelector('footer') ||
                document.querySelector('[class*="footer"]') ||
                document.querySelector('#footer');
        };

        const footer = findFooter();
        if (!footer) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsFooterVisible(entry.isIntersecting);
                });
            },
            {
                threshold: 0,
                rootMargin: '100px 0px 0px 0px' // Start hiding 100px before footer is visible
            }
        );

        observer.observe(footer);

        return () => observer.disconnect();
    }, []);

    // Group services by category - only using valid categories from SERVICE_CATEGORIES
    const groupedServices = useMemo<CategoryService[]>(() => {
        const groups: Record<string, Service[]> = {};

        services.forEach(service => {
            // Get category name from service
            const category = typeof service.category === 'string'
                ? undefined
                : (service.category as ServiceCategoryMeta | undefined);
            const categoryName = typeof service.category === 'string'
                ? service.category
                : category?.name || '';
            const categorySlug = category?.slug || service.categoryId || '';

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
            // 3. Alias match (case insensitive)
            else if (categoryName) {
                const lowerName = categoryName.toLowerCase();
                // Check exact alias match
                for (const [alias, target] of Object.entries(CATEGORY_ALIASES)) {
                    if (lowerName === alias || lowerName.includes(alias)) {
                        validCategoryName = target;
                        break;
                    }
                }
            }

            // Only include services with valid categories (skip "Other Services" or unknown categories)
            if (validCategoryName) {
                if (!groups[validCategoryName]) {
                    groups[validCategoryName] = [];
                }
                groups[validCategoryName].push(service);
            }
        });

        // Sort categories based on the order in SERVICE_CATEGORIES
        const categoryOrder = new Map(SERVICE_CATEGORIES.map((cat, index) => [cat.name, index]));

        const sorted = Object.entries(groups)
            .map(([categoryName, categoryServices]) => {
                const category = SERVICE_CATEGORIES.find(cat => cat.name === categoryName);
                return {
                    categoryName,
                    categoryId: category?.slug || categoryName.toLowerCase().replace(/\s+/g, '-'),
                    services: categoryServices
                };
            })
            .sort((a, b) => {
                const orderA = categoryOrder.get(a.categoryName) ?? 999;
                const orderB = categoryOrder.get(b.categoryName) ?? 999;
                return orderA - orderB;
            });

        return sorted;
    }, [services]);

    useEffect(() => {
        if (groupedServices.length === 0) {
            setActiveCategory('all');
            return;
        }

        if (activeCategory !== 'all' && !groupedServices.some((group) => group.categoryId === activeCategory)) {
            setActiveCategory('all');
        }
    }, [groupedServices, activeCategory]);

    // Toggle service selection
    const toggleService = (service: Service) => {
        setSelectedServices((prev) => (
            prev.some((item) => item.id === service.id)
                ? prev.filter((item) => item.id !== service.id)
                : [...prev, service]
        ));
    };

    // Check if service is selected
    const isServiceSelected = (serviceId: string) => {
        return selectedServices.some((service) => service.id === serviceId);
    };

    // Calculate totals
    const totalPrice = selectedServices.reduce((sum, service) => sum + getServiceDiscountedPrice(service), 0);
    const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

    // Format duration display - supports duration ranges
    const formatDuration = (service: Service) => {
        const minDuration = service.durationMin;
        const maxDuration = service.durationMax;
        const duration = service.duration;

        const formatMins = (mins: number) => {
            if (mins < 60) return `${mins} mins`;
            const hours = Math.floor(mins / 60);
            const m = mins % 60;
            if (m === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
            return `${hours} hr${hours > 1 ? 's' : ''} ${m} mins`;
        };

        // If we have a duration range
        if (minDuration && maxDuration && minDuration !== maxDuration) {
            return `${formatMins(minDuration)} - ${formatMins(maxDuration)}`;
        }

        return formatMins(duration);
    };

    // Simple duration format for totals
    const formatTotalDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} mins`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
        return `${hours} hr${hours > 1 ? 's' : ''}, ${mins} mins`;
    };

    const filteredGroups = useMemo(() => {
        if (activeCategory === 'all') {
            return groupedServices;
        }

        return groupedServices.filter((group) => group.categoryId === activeCategory);
    }, [groupedServices, activeCategory]);


    // Handle continue to booking
    const handleContinue = () => {
        if (selectedServices.length > 0) {
            onBook(selectedServices);
        }
    };

    // Scroll to selected services indicator
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (groupedServices.length === 0) {
        return (
            <div className={styles.emptyStateShell}>
                <EmptyState
                    icon="search"
                    title="No bookable services available"
                    description="This salon has not published categorized services yet. Please check back soon or explore another salon."
                />
            </div>
        );
    }

    return (
        <div className={styles.container} ref={containerRef}>

            {/* Selected Services Indicator */}
            {selectedServices.length > 0 && !isBookingJourneyActive && (
                <button className={styles.selectedIndicator} onClick={scrollToTop}>
                    <FaArrowUp />
                    Ready to book {selectedServices.length} service{selectedServices.length === 1 ? '' : 's'}
                </button>
            )}

            {/* Main Layout */}
            <div className={styles.mainLayout}>
                {/* Services Column */}
                <div className={styles.servicesColumn}>
                    <div className={styles.categorySelector}>
                        <span className={styles.categorySelectorLabel}>Categories</span>
                        <Select value={activeCategory} onValueChange={setActiveCategory}>
                            <SelectTrigger className={styles.categorySelectTrigger}>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {groupedServices.map((group) => (
                                    <SelectItem key={group.categoryId} value={group.categoryId}>
                                        {group.categoryName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {filteredGroups.map(group => (
                        <div
                            key={group.categoryId}
                            className={styles.categorySection}
                        >
                            <div className={styles.categoryTitle}>
                                <span>{group.categoryName}</span>
                            </div>

                            <div className={styles.categoryServices}>

                                {group.services.map(service => {
                                    const isSelected = isServiceSelected(service.id);
                                    const hasImages = service.images && service.images.length > 0;
                                    const serviceName = service.title || service.name || 'Service';
                                    const isPopular = service.isPopular;
                                    const isFeatured = service.isFeatured;
                                    const hasDiscount = hasServiceDiscount(service);
                                    const discountedPrice = getServiceDiscountedPrice(service);
                                    const discountLabel = formatServiceDiscountLabel(service);

                                    return (
                                        <div
                                            key={service.id}
                                            className={`${styles.serviceItem} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => toggleService(service)}
                                        >
                                            <div className={styles.serviceInfo}>
                                                <div className={styles.serviceNameRow}>
                                                    <h4 className={styles.serviceName}>{serviceName}</h4>
                                                    {isPopular && (
                                                        <span className={styles.popularBadge}>
                                                            <FaStar /> Popular
                                                        </span>
                                                    )}
                                                    {isFeatured && !isPopular && (
                                                        <span className={styles.featuredBadge}>
                                                            Featured
                                                        </span>
                                                    )}
                                                    {discountLabel && (
                                                        <span className={styles.discountBadge}>{discountLabel}</span>
                                                    )}
                                                </div>
                                                <Link
                                                    href={buildSalonServicePath(salon, service)}
                                                    className={styles.serviceDetailLink}
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    View service details
                                                </Link>
                                                <p className={styles.serviceDuration}>
                                                    {formatDuration(service)}
                                                </p>
                                                <p className={styles.servicePrice}>
                                                    <span className={styles.servicePriceFrom}>from</span>
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className={styles.servicePriceOriginal}>R {service.price.toFixed(0)}</span>
                                                            <span className={styles.servicePriceDiscounted}>R {discountedPrice.toFixed(0)}</span>
                                                        </>
                                                    ) : (
                                                        <>R {service.price.toFixed(0)}</>
                                                    )}
                                                </p>
                                            </div>

                                            <div className={styles.serviceActions}>
                                                {hasImages && (
                                                    <button
                                                        className={styles.viewImagesButton}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onImageClick(service.images, 0);
                                                        }}
                                                        aria-label="View images"
                                                    >
                                                        <FaImages /> View Images
                                                    </button>
                                                )}

                                                <button
                                                    className={`${styles.addButton} ${isSelected ? styles.added : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleService(service);
                                                    }}
                                                    aria-label={isSelected ? 'Remove service' : 'Add service'}
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
                </div>


                {/* Desktop booking panel should appear immediately after selection, even near the footer. */}
                {selectedServices.length > 0 && !isBookingJourneyActive && (
                    <div className={styles.cartColumn}>
                        <div className={styles.cartSidebar}>
                            <div className={styles.cartPanelTop}>
                                <div className={styles.cartPanelCopy}>
                                    <span className={styles.cartEyebrow}>Booking journey</span>
                                    <h3 className={styles.cartPanelTitle}>Review your service</h3>
                                    <p className={styles.cartPanelHint}>
                                        Confirm this treatment, then continue to choose your date and details.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className={styles.cartCloseButton}
                                    onClick={() => setSelectedServices([])}
                                    aria-label="Close booking panel"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className={styles.cartHeader}>
                                {salon.logo && (
                                    <Image
                                        src={transformCloudinary(salon.logo, { width: 96, quality: 'auto', format: 'auto' })}
                                        alt={salon.name}
                                        width={48}
                                        height={48}
                                        className={styles.cartSalonImage}
                                    />
                                )}
                                <div className={styles.cartSalonInfo}>
                                    <h4 className={styles.cartSalonName}>{salon.name}</h4>
                                    {salon.avgRating && salon.avgRating > 0 ? (
                                        <div className={styles.cartSalonRating}>
                                            <FaStar /> {salon.avgRating.toFixed(1)}
                                            {salon.reviewCount && salon.reviewCount > 0 && ` (${salon.reviewCount})`}
                                        </div>
                                    ) : null}
                                    <p className={styles.cartSalonLocation}>
                                        {[salon.town, salon.city].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.cartDivider} />

                            {/* Cart Items */}
                            <div className={styles.cartItems}>
                                {selectedServices.map((service) => (
                                    <div key={service.id} className={styles.cartItem}>
                                        <div className={styles.cartItemInfo}>
                                            <p className={styles.cartItemName}>
                                                {service.title || service.name}
                                            </p>
                                            <p className={styles.cartItemDetails}>
                                                {formatDuration(service)} - with any professional
                                            </p>
                                        </div>
                                        <span className={styles.cartItemPrice}>
                                            R {getServiceDiscountedPrice(service).toFixed(0)}
                                        </span>
                                        <button
                                            className={styles.cartItemRemove}
                                            onClick={() => toggleService(service)}
                                            aria-label="Remove service"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.cartFooter}>
                                <div className={styles.cartTotal}>
                                    <span className={styles.cartTotalLabel}>Total</span>
                                    <span className={styles.cartTotalPrice}>R {totalPrice.toFixed(0)}</span>
                                </div>

                                <button
                                    className={styles.continueButton}
                                    onClick={handleContinue}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Keep the mobile footer cart out of the way when users reach the page footer. */}
                {selectedServices.length > 0 && !isFooterVisible && !isBookingJourneyActive && (
                    <div className={styles.mobileCartFooter}>
                        <div className={styles.mobileCartContent}>
                            <div className={styles.mobileCartInfo}>
                                <p className={styles.mobileCartCount}>
                                    {selectedServices.length} service{selectedServices.length === 1 ? '' : 's'} - {formatTotalDuration(totalDuration)}
                                </p>
                                <p className={styles.mobileCartTotal}>R {totalPrice.toFixed(0)}</p>
                            </div>
                            <button
                                className={styles.mobileCartButton}
                                onClick={handleContinue}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
