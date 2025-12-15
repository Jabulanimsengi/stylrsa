'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import styles from './ProductsPage.module.css';
import ProductCard from '@/components/ProductCard';
import CompactProductCard from '@/components/CompactProductCard';
import ImageLightbox from '@/components/ImageLightbox';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import ProductFilter, { type ProductFilterValues } from '@/components/ProductFilter/ProductFilter';
import PageNav from '@/components/PageNav';
import EmptyState from '@/components/EmptyState/EmptyState';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getPlaceholder } from '@/lib/placeholders';

const DEFAULT_FILTERS: ProductFilterValues = {
  search: '',
  category: '',
  priceMin: '',
  priceMax: '',
  inStock: false,
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

// Enhanced Product card for marketplace with buy buttons
function MarketplaceProductCard({
  product,
  onOpenLightbox,
  onOrderSuccess,
}: {
  product: Product;
  onOpenLightbox?: (images: string[], index: number) => void;
  onOrderSuccess?: () => void;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = useMemo(() => {
    const unique = Array.isArray(product.images)
      ? product.images.filter((img, idx, arr) => img && arr.indexOf(img) === idx)
      : [];
    return unique.length > 0 ? unique : [getPlaceholder('wide')];
  }, [product.images]);

  const isOnSale = product.isOnSale && product.salePrice && product.salePrice < product.price;
  const displayPrice = isOnSale ? product.salePrice! : product.price;
  const discountPercent = isOnSale
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const isNew = useMemo(() => {
    const createdAt = new Date(product.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt > weekAgo;
  }, [product.createdAt]);

  const sellerInitials = useMemo(() => {
    if (!product.seller) return '?';
    const first = product.seller.firstName?.[0] || '';
    const last = product.seller.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  }, [product.seller]);

  const sellerFullName = useMemo(() => {
    if (!product.seller) return 'Unknown Seller';
    const parts = [product.seller.firstName, product.seller.lastName].filter(Boolean);
    return parts.join(' ') || 'Unknown Seller';
  }, [product.seller]);

  // Generate WhatsApp link with product info
  const getWhatsAppLink = useCallback(() => {
    const message = encodeURIComponent(
      `Hi! I'm interested in buying "${product.name}" (R${displayPrice.toFixed(2)}). Is it still available?`
    );
    // Use seller's WhatsApp number if available
    if (product.whatsappNumber) {
      const cleanNumber = product.whatsappNumber.replace(/\D/g, '');
      return `https://wa.me/${cleanNumber}?text=${message}`;
    }
    return `https://wa.me/?text=${message}`;
  }, [product.name, product.whatsappNumber, displayPrice]);

  const handleBuyClick = (e: React.MouseEvent, type: 'whatsapp' | 'website') => {
    e.stopPropagation();

    if (type === 'whatsapp') {
      window.open(getWhatsAppLink(), '_blank', 'noopener,noreferrer');
    } else if (type === 'website' && product.websiteUrl) {
      const url = product.websiteUrl.startsWith('http')
        ? product.websiteUrl
        : `https://${product.websiteUrl}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('No seller website available for this product.');
    }
  };

  const handleImageNav = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.stopPropagation();
    if (direction === 'prev') {
      setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const handleCardClick = () => {
    if (onOpenLightbox && images.length > 0) {
      onOpenLightbox(images, activeImageIndex);
    }
  };

  return (
    <div className={styles.productCard} onClick={handleCardClick}>
      {/* Image Container */}
      <div className={styles.imageContainer}>
        <Image
          src={images[activeImageIndex]}
          alt={product.name}
          fill
          className={styles.productImage}
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              className={`${styles.imageNav} ${styles.imageNavPrev}`}
              onClick={(e) => handleImageNav(e, 'prev')}
              aria-label="Previous image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              className={`${styles.imageNav} ${styles.imageNavNext}`}
              onClick={(e) => handleImageNav(e, 'next')}
              aria-label="Next image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <div className={styles.imageDots}>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`${styles.imageDot} ${idx === activeImageIndex ? styles.active : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className={styles.badges}>
          {isOnSale && (
            <span className={styles.saleBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
              </svg>
              {discountPercent}% OFF
            </span>
          )}
          {isNew && <span className={styles.newBadge}>NEW</span>}
          {product.stock === 0 && <span className={`${styles.stockBadge} ${styles.out}`}>Sold Out</span>}
          {product.stock > 0 && product.stock <= 5 && (
            <span className={`${styles.stockBadge} ${styles.low}`}>Only {product.stock} left</span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        {product.category && <span className={styles.categoryTag}>{product.category}</span>}
        <h3 className={styles.productName}>{product.name}</h3>
        {product.description && (
          <p className={styles.productDescription}>{product.description}</p>
        )}

        {/* Seller Info */}
        <div className={styles.sellerInfo}>
          <div className={styles.sellerAvatar}>{sellerInitials}</div>
          <Link
            href={`/sellers/${product.sellerId}`}
            className={styles.sellerName}
            onClick={(e) => e.stopPropagation()}
          >
            {sellerFullName}
          </Link>
        </div>

        {/* Price Section */}
        <div className={styles.priceSection}>
          <span className={styles.currentPrice}>R{displayPrice.toFixed(2)}</span>
          {isOnSale && (
            <>
              <span className={styles.originalPrice}>R{product.price.toFixed(2)}</span>
              <span className={styles.discountPercent}>-{discountPercent}%</span>
            </>
          )}
        </div>

        {/* Buy Buttons */}
        <button
          className={`${styles.buyButton} ${styles.whatsapp}`}
          onClick={(e) => handleBuyClick(e, 'whatsapp')}
          disabled={product.stock === 0}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Buy via WhatsApp
        </button>

        {product.websiteUrl && (
          <button
            className={`${styles.buyButton} ${styles.buyButtonSecondary}`}
            onClick={(e) => handleBuyClick(e, 'website')}
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
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [filters, setFilters] = useState<ProductFilterValues>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'compact' | 'marketplace' | 'classic'>('compact');
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const queryString = useMemo(() => {
    const query = new URLSearchParams();
    if (filters.search.trim()) query.append('q', filters.search.trim());
    if (filters.category) query.append('category', filters.category);
    if (filters.priceMin) query.append('priceMin', filters.priceMin);
    if (filters.priceMax) query.append('priceMax', filters.priceMax);
    if (filters.inStock) query.append('inStock', 'true');
    if (sortBy) query.append('sort', sortBy);
    const qs = query.toString();
    return qs.length > 0 ? `?${qs}` : '';
  }, [filters, sortBy]);

  const fetchProducts = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/products${queryString}`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const data: Product[] = await res.json();
        if (requestId === requestIdRef.current) {
          setProducts(data);
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        logger.error('Failed to fetch products:', error);
        toast.error(toFriendlyMessage(error, 'Failed to load products. Please try again.'));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        abortRef.current = null;
      }
    }
  }, [queryString]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleOpenLightbox = useCallback((images: string[], startIndex: number) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxImages(null);
    setLightboxIndex(0);
  }, []);

  const hasActiveFilters =
    filters.search || filters.category || filters.priceMin || filters.priceMax || filters.inStock;

  return (
    <div className={styles.container}>
      <PageNav />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Beauty & Hair Marketplace</h1>
          <p className={styles.heroSubtitle}>
            Shop quality products from trusted South African beauty sellers
          </p>
          <div className={styles.heroBadges}>
            <span className={styles.heroBadge}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Verified Sellers
            </span>
            <span className={styles.heroBadge}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Fast Response
            </span>
            <span className={styles.heroBadge}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Quality Products
            </span>
          </div>
        </div>
      </section>

      {/* Filter Section - Using existing ProductFilter component */}
      <div className={styles.filterShell}>
        <ProductFilter
          initialValues={filters}
          onChange={setFilters}
          isSubmitting={isLoading}
        />
      </div>

      {/* Results Header */}
      <div className={styles.resultsHeader}>
        <span className={styles.resultsCount}>
          {isLoading ? (
            'Loading products...'
          ) : (
            <>
              <strong>{products.length}</strong> products found
            </>
          )}
        </span>
        <div className={styles.viewControls}>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className={styles.viewToggle}>
            <button
              type="button"
              className={`${styles.viewButton} ${viewMode === 'compact' ? styles.viewButtonActive : ''}`}
              onClick={() => setViewMode('compact')}
              aria-label="Compact grid view"
              title="Compact Grid"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="5" height="5" />
                <rect x="10" y="3" width="5" height="5" />
                <rect x="17" y="3" width="5" height="5" />
                <rect x="3" y="10" width="5" height="5" />
                <rect x="10" y="10" width="5" height="5" />
                <rect x="17" y="10" width="5" height="5" />
                <rect x="3" y="17" width="5" height="5" />
                <rect x="10" y="17" width="5" height="5" />
                <rect x="17" y="17" width="5" height="5" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.viewButton} ${viewMode === 'marketplace' ? styles.viewButtonActive : ''}`}
              onClick={() => setViewMode('marketplace')}
              aria-label="Marketplace view"
              title="Marketplace View"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.viewButton} ${viewMode === 'classic' ? styles.viewButtonActive : ''}`}
              onClick={() => setViewMode('classic')}
              aria-label="Classic view"
              title="Classic View"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <SkeletonGroup count={8} className={styles.grid}>
          {() => <SkeletonCard hasImage lines={3} />}
        </SkeletonGroup>
      ) : products.length === 0 ? (
        <div className={styles.emptyStateWrapper}>
          <EmptyState
            variant="no-results"
            title="No Products Found"
            description="We couldn't find any products matching your filters. Try adjusting your search or check back later."
            action={
              hasActiveFilters
                ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    Clear Filters
                  </button>
                )
                : undefined
            }
          />
        </div>
      ) : viewMode === 'compact' ? (
        <div className={styles.compactGrid}>
          {products.map((product) => (
            <CompactProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : viewMode === 'marketplace' ? (
        <div className={styles.marketplaceGrid}>
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug || product.id}`} className={styles.marketplaceCardLink}>
              <MarketplaceProductCard
                product={product}
                onOpenLightbox={handleOpenLightbox}
                onOrderSuccess={fetchProducts}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOrderSuccess={fetchProducts}
              onOpenLightbox={handleOpenLightbox}
            />
          ))}
        </div>
      )}

      {/* Lightbox - Using existing ImageLightbox component */}
      {lightboxImages && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxIndex}
          onClose={handleCloseLightbox}
        />
      )}
    </div>
  );
}
