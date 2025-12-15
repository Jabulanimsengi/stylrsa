'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CompactProductCard.module.css';
import { Product } from '@/types';
import { getPlaceholder } from '@/lib/placeholders';

interface CompactProductCardProps {
    product: Product;
}

export default function CompactProductCard({ product }: CompactProductCardProps) {
    // Get the first image, or placeholder
    const mainImage = useMemo(() => {
        const images = Array.isArray(product.images)
            ? product.images.filter((img) => img)
            : [];
        return images.length > 0 ? images[0] : getPlaceholder('wide');
    }, [product.images]);

    // Check if product is on sale
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

    // Truncate description for compact view
    const truncatedDescription = useMemo(() => {
        if (!product.description) return '';
        const maxLength = 60;
        if (product.description.length <= maxLength) return product.description;
        return product.description.substring(0, maxLength).trim() + '...';
    }, [product.description]);

    return (
        <Link href={`/products/${product.slug || product.id}`} className={styles.cardLink}>
            <article className={styles.card}>
                {/* Image Section */}
                <div className={styles.imageContainer}>
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className={styles.image}
                        sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />

                    {/* Badges */}
                    <div className={styles.badges}>
                        {isOnSale && (
                            <span className={styles.saleBadge}>-{discountPercent}%</span>
                        )}
                        {isNew && <span className={styles.newBadge}>NEW</span>}
                    </div>

                    {/* Stock indicator */}
                    {product.stock === 0 && (
                        <div className={styles.soldOutOverlay}>
                            <span>Sold Out</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className={styles.content}>
                    {/* Product Name */}
                    <h3 className={styles.productName}>{product.name}</h3>

                    {/* Description */}
                    {truncatedDescription && (
                        <p className={styles.description}>{truncatedDescription}</p>
                    )}

                    {/* Price Section */}
                    <div className={styles.priceSection}>
                        <span className={styles.currentPrice}>R{displayPrice.toFixed(2)}</span>
                        {isOnSale && (
                            <span className={styles.originalPrice}>R{product.price.toFixed(2)}</span>
                        )}
                    </div>

                    {/* Stock Status */}
                    {product.stock > 0 && product.stock <= 5 && (
                        <span className={styles.lowStock}>Only {product.stock} left</span>
                    )}
                </div>
            </article>
        </Link>
    );
}
