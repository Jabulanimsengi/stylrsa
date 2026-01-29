'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './ServiceCategoryCircles.module.css';

// Service categories with emoji icons - Clean text-only design
const HOMEPAGE_CATEGORIES = [
    { name: 'Hair', slug: 'haircuts-styling', icon: '✂️' },
    { name: 'Braids', slug: 'braiding-weaving', icon: '🪮' },
    { name: 'Nails', slug: 'nail-care', icon: '💅' },
    { name: 'Spa', slug: 'massage-body-treatments', icon: '💆' },
    { name: 'Makeup', slug: 'makeup-beauty', icon: '💄' },
    { name: 'Facials', slug: 'skin-care-facials', icon: '🧖' },
    { name: 'Barber', slug: 'mens-grooming', icon: '💈' },
    { name: 'Waxing', slug: 'waxing-hair-removal', icon: '✨' },
    { name: 'Bridal', slug: 'bridal-services', icon: '👰' },
    { name: 'Wigs', slug: 'wig-installations', icon: '💇' },
    { name: 'Natural Hair', slug: 'natural-hair-specialists', icon: '🌿' },
    { name: 'Lashes', slug: 'lashes-brows', icon: '👁️' },
    { name: 'Aesthetics', slug: 'aesthetics-advanced-skin', icon: '💉' },
    { name: 'Tattoos', slug: 'tattoos-piercings', icon: '🎨' },
    { name: 'Wellness', slug: 'wellness-holistic-spa', icon: '🧘' },
    { name: 'Color', slug: 'hair-color-treatments', icon: '🎨' },
];

export default function ServiceCategoryCircles() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            checkScroll();
            return () => el.removeEventListener('scroll', checkScroll);
        }
    }, [checkScroll]);

    const handleScrollLeft = useCallback(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            container.scrollTo({
                left: container.scrollLeft - 300,
                behavior: 'smooth'
            });
        }
    }, []);

    const handleScrollRight = useCallback(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            container.scrollTo({
                left: container.scrollLeft + 300,
                behavior: 'smooth'
            });
        }
    }, []);

    return (
        <section className={styles.section}>
            <div className={styles.scrollWrapper}>
                {/* Left Arrow */}
                <button
                    className={`${styles.scrollArrow} ${styles.scrollArrowLeft} ${!canScrollLeft ? styles.hidden : ''}`}
                    onClick={handleScrollLeft}
                    aria-label="Scroll left"
                    type="button"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                <div className={styles.categoriesContainer} ref={scrollRef}>
                    <div className={styles.categoriesRow}>
                        {HOMEPAGE_CATEGORIES.map((category) => (
                            <Link
                                key={category.slug}
                                href={`/salons?category=${category.slug}`}
                                className={styles.categoryItem}
                            >
                                <span className={styles.categoryName}>{category.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right Arrow */}
                <button
                    className={`${styles.scrollArrow} ${styles.scrollArrowRight} ${!canScrollRight ? styles.hidden : ''}`}
                    onClick={handleScrollRight}
                    aria-label="Scroll right"
                    type="button"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
        </section>
    );
}
