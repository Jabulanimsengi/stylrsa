'use client';

import { useState, useEffect } from 'react';
import styles from './UpsellPopup.module.css';
import { FaTimes, FaTag, FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import Image from 'next/image';

interface UpsellProduct {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category?: string;
}

interface UpsellPopupProps {
    isOpen: boolean;
    onClose: () => void;
    serviceName: string;
    salonId: string;
    onProductSelect?: (product: UpsellProduct) => void;
}

export default function UpsellPopup({
    isOpen,
    onClose,
    serviceName,
    salonId,
    onProductSelect,
}: UpsellPopupProps) {
    const [products, setProducts] = useState<UpsellProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchRecommendedProducts = async () => {
            setLoading(true);
            try {
                // Fetch products related to the service (e.g., braiding materials, extensions)
                const response = await fetch(`/api/salon-materials/salon/${salonId}?isSold=true&limit=4`);
                if (response.ok) {
                    const data = await response.json();
                    // Transform to UpsellProduct format
                    const upsellProducts: UpsellProduct[] = data
                        .filter((m: any) => m.isSold && m.price)
                        .slice(0, 4)
                        .map((m: any) => ({
                            id: m.id,
                            name: m.name,
                            description: m.description,
                            price: m.price,
                            imageUrl: m.imageUrl,
                            category: 'Hair Materials',
                        }));
                    setProducts(upsellProducts);
                }
            } catch (error) {
                console.error('Failed to fetch upsell products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedProducts();
    }, [isOpen, salonId]);

    if (!isOpen) return null;

    const isBraidingService = serviceName.toLowerCase().includes('braid') ||
        serviceName.toLowerCase().includes('cornrow') ||
        serviceName.toLowerCase().includes('twist') ||
        serviceName.toLowerCase().includes('loc');

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <FaTag />
                    </div>
                    <h3 className={styles.title}>Complete Your Look!</h3>
                    <p className={styles.subtitle}>
                        {isBraidingService
                            ? 'Add premium hair materials to your booking'
                            : 'Recommended products for your service'}
                    </p>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loadingGrid}>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={styles.skeleton} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No recommended products available</p>
                            <button className={styles.skipBtn} onClick={onClose}>
                                Continue to Booking
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={styles.productGrid}>
                                {products.map((product) => (
                                    <button
                                        key={product.id}
                                        className={styles.productCard}
                                        onClick={() => onProductSelect?.(product)}
                                    >
                                        <div className={styles.productImage}>
                                            {product.imageUrl ? (
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    sizes="120px"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className={styles.placeholder}>
                                                    <FaShoppingCart />
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.productInfo}>
                                            <span className={styles.productName}>{product.name}</span>
                                            <span className={styles.productPrice}>
                                                R{product.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className={styles.actions}>
                                <button className={styles.skipBtn} onClick={onClose}>
                                    No thanks, continue
                                </button>
                                <button
                                    className={styles.browseBtn}
                                    onClick={() => window.open(`/marketplace?salon=${salonId}`, '_blank')}
                                >
                                    Browse All <FaArrowRight />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
