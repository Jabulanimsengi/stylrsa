'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './MaterialsShowcase.module.css';

interface SalonMaterial {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    isUsed: boolean;
    isSold: boolean;
    price?: number;
}

interface MaterialsShowcaseProps {
    salonId: string;
    onMaterialClick?: (material: SalonMaterial) => void;
}

export default function MaterialsShowcase({ salonId, onMaterialClick }: MaterialsShowcaseProps) {
    const [materials, setMaterials] = useState<SalonMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'used' | 'sold'>('all');

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const res = await fetch(`/api/salon-materials/salon/${salonId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMaterials(data);
                }
            } catch (error) {
                console.error('Failed to fetch materials:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, [salonId]);

    const filteredMaterials = materials.filter((m) => {
        if (filter === 'used') return m.isUsed;
        if (filter === 'sold') return m.isSold;
        return true;
    });

    if (loading) {
        return (
            <section className={styles.container}>
                <h3 className={styles.title}>Materials & Products</h3>
                <div className={styles.grid}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={styles.skeleton} />
                    ))}
                </div>
            </section>
        );
    }

    if (materials.length === 0) {
        return null;
    }

    const hasUsed = materials.some((m) => m.isUsed);
    const hasSold = materials.some((m) => m.isSold);

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    Materials & Products
                </h3>

                {(hasUsed && hasSold) && (
                    <div className={styles.filterTabs}>
                        <button
                            className={`${styles.tab} ${filter === 'all' ? styles.active : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`${styles.tab} ${filter === 'used' ? styles.active : ''}`}
                            onClick={() => setFilter('used')}
                        >
                            We Use
                        </button>
                        <button
                            className={`${styles.tab} ${filter === 'sold' ? styles.active : ''}`}
                            onClick={() => setFilter('sold')}
                        >
                            Available
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.grid}>
                {filteredMaterials.map((material) => (
                    <button
                        key={material.id}
                        className={styles.card}
                        onClick={() => onMaterialClick?.(material)}
                    >
                        <div className={styles.imageWrapper}>
                            {material.imageUrl ? (
                                <Image
                                    src={material.imageUrl}
                                    alt={material.name}
                                    fill
                                    sizes="150px"
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <div className={styles.placeholder}>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                    </svg>
                                </div>
                            )}

                            {material.isSold && (
                                <span className={styles.badge}>Available</span>
                            )}
                        </div>

                        <div className={styles.info}>
                            <span className={styles.name}>{material.name}</span>
                            {material.description && (
                                <span className={styles.description}>{material.description}</span>
                            )}
                            {material.isSold && material.price && (
                                <span className={styles.price}>R{material.price.toFixed(2)}</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
