'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import styles from './ProductDetail.module.css';
import PageNav from '@/components/PageNav';
import ImageLightbox from '@/components/ImageLightbox';
import { getPlaceholder } from '@/lib/placeholders';
import { sanitizeText } from '@/lib/sanitize';
import { toast } from 'react-toastify';

interface ProductDetailClientProps {
    initialProduct: Product;
}

export default function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
    const product = initialProduct;
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Process images
    const images = useMemo(() => {
        const unique = Array.isArray(product.images)
            ? product.images.filter((img, idx, arr) => img && arr.indexOf(img) === idx)
            : [];
        return unique.length > 0 ? unique : [getPlaceholder('wide')];
    }, [product.images]);

    // Price calculations
    const isOnSale = product.isOnSale && product.salePrice && product.salePrice < product.price;
    const displayPrice = isOnSale ? product.salePrice! : product.price;
    const discountPercent = isOnSale
        ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
        : 0;

    // Check if product is new (within 7 days)
    const isNew = useMemo(() => {
        const createdAt = new Date(product.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt > weekAgo;
    }, [product.createdAt]);

    // Seller info
    const sellerName = useMemo(() => {
        if (!product.seller) return 'Unknown Seller';
        const parts = [product.seller.firstName, product.seller.lastName].filter(Boolean);
        return parts.join(' ') || 'Unknown Seller';
    }, [product.seller]);

    const sellerInitials = useMemo(() => {
        if (!product.seller) return '?';
        const first = product.seller.firstName?.[0] || '';
        const last = product.seller.lastName?.[0] || '';
        return (first + last).toUpperCase() || '?';
    }, [product.seller]);

    // WhatsApp link
    const getWhatsAppLink = useCallback(() => {
        const message = encodeURIComponent(
            `Hi! I'm interested in buying "${product.name}" (R${displayPrice.toFixed(2)}). Is it still available?`
        );
        if (product.whatsappNumber) {
            const cleanNumber = product.whatsappNumber.replace(/\D/g, '');
            return `https://wa.me/${cleanNumber}?text=${message}`;
        }
        return `https://wa.me/?text=${message}`;
    }, [product.name, product.whatsappNumber, displayPrice]);

    const handleBuyClick = (type: 'whatsapp' | 'website' | 'takealot' | 'amazon') => {
        if (type === 'whatsapp') {
            window.open(getWhatsAppLink(), '_blank', 'noopener,noreferrer');
        } else if (type === 'website' && product.websiteUrl) {
            const url = product.websiteUrl.startsWith('http')
                ? product.websiteUrl
                : `https://${product.websiteUrl}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        } else if (type === 'takealot' && product.takealotUrl) {
            const url = product.takealotUrl.startsWith('http')
                ? product.takealotUrl
                : `https://${product.takealotUrl}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        } else if (type === 'amazon' && product.amazonUrl) {
            const url = product.amazonUrl.startsWith('http')
                ? product.amazonUrl
                : `https://${product.amazonUrl}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            toast.info('Link not available for this product.');
        }
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: product.name },
    ];

    return (
        <div className={styles.container}>
            <PageNav />

            <div className={styles.productLayout}>
                {/* Image Gallery Section */}
                <div className={styles.gallerySection}>
                    {/* Main Image */}
                    <div className={styles.mainImageContainer} onClick={() => setLightboxOpen(true)}>
                        <Image
                            src={images[activeImageIndex]}
                            alt={product.name}
                            fill
                            className={styles.mainImage}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                        {/* Zoom hint */}
                        <div className={styles.zoomHint}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                <line x1="11" y1="8" x2="11" y2="14" />
                                <line x1="8" y1="11" x2="14" y2="11" />
                            </svg>
                        </div>
                    </div>

                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                        <div className={styles.thumbnailGallery}>
                            {images.map((img, idx) => (
                                <button
                                    key={`thumb-${idx}`}
                                    className={`${styles.thumbnail} ${idx === activeImageIndex ? styles.activeThumbnail : ''}`}
                                    onClick={() => setActiveImageIndex(idx)}
                                    aria-label={`View image ${idx + 1}`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} - Image ${idx + 1}`}
                                        fill
                                        className={styles.thumbnailImage}
                                        sizes="80px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info Section */}
                <div className={styles.infoSection}>
                    {/* Badges */}
                    <div className={styles.badgesRow}>
                        {product.category && (
                            <span className={styles.categoryBadge}>{product.category}</span>
                        )}
                        {isOnSale && <span className={styles.saleBadge}>SALE -{discountPercent}%</span>}
                        {isNew && <span className={styles.newBadge}>NEW</span>}
                    </div>

                    {/* Product Title */}
                    <h1 className={styles.productTitle}>{product.name}</h1>

                    {/* Price Section */}
                    <div className={styles.priceSection}>
                        <span className={styles.currentPrice}>R{displayPrice.toFixed(2)}</span>
                        {isOnSale && (
                            <>
                                <span className={styles.originalPrice}>R{product.price.toFixed(2)}</span>
                                <span className={styles.discountTag}>Save R{(product.price - displayPrice).toFixed(2)}</span>
                            </>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className={styles.stockStatus}>
                        {product.stock === 0 ? (
                            <span className={styles.outOfStock}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                Out of Stock
                            </span>
                        ) : product.stock <= 5 ? (
                            <span className={styles.lowStock}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                Only {product.stock} left in stock!
                            </span>
                        ) : (
                            <span className={styles.inStock}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                In Stock
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className={styles.descriptionSection}>
                            <h2 className={styles.sectionTitle}>Description</h2>
                            <p className={styles.description}>{sanitizeText(product.description)}</p>
                        </div>
                    )}

                    {/* Purchase Note */}
                    {product.purchaseNote && (
                        <div className={styles.purchaseNote}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span>{product.purchaseNote}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                        <button
                            className={`${styles.buyButton} ${styles.whatsappButton}`}
                            onClick={() => handleBuyClick('whatsapp')}
                            disabled={product.stock === 0}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Buy via WhatsApp
                        </button>

                        {product.websiteUrl && (
                            <button
                                className={`${styles.buyButton} ${styles.websiteButton}`}
                                onClick={() => handleBuyClick('website')}
                                disabled={product.stock === 0}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                Visit Seller Website
                            </button>
                        )}

                        {product.takealotUrl && (
                            <button
                                className={`${styles.buyButton} ${styles.takealotButton}`}
                                onClick={() => handleBuyClick('takealot')}
                                disabled={product.stock === 0}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                Buy on Takealot
                            </button>
                        )}

                        {product.amazonUrl && (
                            <button
                                className={`${styles.buyButton} ${styles.amazonButton}`}
                                onClick={() => handleBuyClick('amazon')}
                                disabled={product.stock === 0}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                                Buy on Amazon
                            </button>
                        )}
                    </div>

                    {/* Banking Details */}
                    {product.seller && (
                        product.seller.sellerBankName ||
                        product.seller.sellerBankAccountNumber ||
                        product.seller.sellerPaymentNote
                    ) && (
                            <div className={styles.bankingCard}>
                                <h3 className={styles.bankingCardTitle}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" />
                                        <line x1="1" y1="10" x2="23" y2="10" />
                                    </svg>
                                    Payment Details
                                </h3>
                                {product.seller.sellerPaymentNote && (
                                    <p className={styles.paymentNote}>{product.seller.sellerPaymentNote}</p>
                                )}
                                {product.seller.sellerBankName && (
                                    <div className={styles.bankingDetails}>
                                        <div className={styles.bankingRow}>
                                            <span className={styles.bankingLabel}>Bank</span>
                                            <span className={styles.bankingValue}>{product.seller.sellerBankName}</span>
                                        </div>
                                        {product.seller.sellerBankAccountHolder && (
                                            <div className={styles.bankingRow}>
                                                <span className={styles.bankingLabel}>Account Holder</span>
                                                <span className={styles.bankingValue}>{product.seller.sellerBankAccountHolder}</span>
                                            </div>
                                        )}
                                        {product.seller.sellerBankAccountNumber && (
                                            <div className={styles.bankingRow}>
                                                <span className={styles.bankingLabel}>Account Number</span>
                                                <span className={styles.bankingValue}>{product.seller.sellerBankAccountNumber}</span>
                                            </div>
                                        )}
                                        {product.seller.sellerBankBranchCode && (
                                            <div className={styles.bankingRow}>
                                                <span className={styles.bankingLabel}>Branch Code</span>
                                                <span className={styles.bankingValue}>{product.seller.sellerBankBranchCode}</span>
                                            </div>
                                        )}
                                        {product.seller.sellerBankAccountType && (
                                            <div className={styles.bankingRow}>
                                                <span className={styles.bankingLabel}>Account Type</span>
                                                <span className={styles.bankingValue}>{product.seller.sellerBankAccountType}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                    {/* Seller Info */}
                    <div className={styles.sellerCard}>
                        <h3 className={styles.sellerCardTitle}>Sold by</h3>
                        <div className={styles.sellerInfo}>
                            <div className={styles.sellerAvatar}>
                                {product.seller?.profileImage ? (
                                    <Image
                                        src={product.seller.profileImage}
                                        alt={sellerName}
                                        fill
                                        className={styles.sellerAvatarImage}
                                    />
                                ) : (
                                    <span>{sellerInitials}</span>
                                )}
                            </div>
                            <div className={styles.sellerDetails}>
                                <Link href={`/sellers/${product.sellerId}`} className={styles.sellerName}>
                                    {sellerName}
                                </Link>
                                <span className={styles.sellerBadge}>Verified Seller</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <ImageLightbox
                    images={images}
                    initialImageIndex={activeImageIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </div>
    );
}
