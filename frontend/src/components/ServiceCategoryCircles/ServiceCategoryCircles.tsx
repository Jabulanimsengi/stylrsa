'use client';

import { useRef, useState, useEffect, useCallback, type WheelEvent } from 'react';
import Link from 'next/link';
import styles from './ServiceCategoryCircles.module.css';

const HOMEPAGE_CATEGORIES = [
    { name: 'Hair', slug: 'haircuts-styling' },
    { name: 'Braids', slug: 'braiding-weaving' },
    { name: 'Nails', slug: 'nail-care' },
    { name: 'Spa', slug: 'massage-body-treatments' },
    { name: 'Makeup', slug: 'makeup-beauty' },
    { name: 'Facials', slug: 'skin-care-facials' },
    { name: 'Barber', slug: 'mens-grooming' },
    { name: 'Waxing', slug: 'waxing-hair-removal' },
    { name: 'Bridal', slug: 'bridal-services' },
    { name: 'Wigs', slug: 'wig-installations' },
    { name: 'Natural Hair', slug: 'natural-hair-specialists' },
    { name: 'Lashes', slug: 'lashes-brows' },
    { name: 'Aesthetics', slug: 'aesthetics-advanced-skin' },
    { name: 'Tattoos', slug: 'tattoos-piercings' },
    { name: 'Wellness', slug: 'wellness-holistic-spa' },
    { name: 'Color', slug: 'hair-color-treatments' },
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

    const scrollByViewport = useCallback((direction: -1 | 1) => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const distance = Math.max(container.clientWidth * 0.72, 220);
            container.scrollTo({
                left: container.scrollLeft + distance * direction,
                behavior: 'smooth'
            });
        }
    }, []);

    const handleScrollLeft = useCallback(() => {
        scrollByViewport(-1);
    }, [scrollByViewport]);

    const handleScrollRight = useCallback(() => {
        scrollByViewport(1);
    }, [scrollByViewport]);

    const handleWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
        if (!scrollRef.current) {
            return;
        }

        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
            return;
        }

        event.preventDefault();
        scrollRef.current.scrollBy({
            left: event.deltaY,
            behavior: 'auto',
        });
    }, []);

    return (
        <section className={styles.section}>
            <div className={styles.scrollWrapper}>
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
                    <div className={styles.categoriesRow} onWheel={handleWheel}>
                        {HOMEPAGE_CATEGORIES.map((category) => (
                            <Link
                                key={category.slug}
                                href={`/salons?category=${category.slug}`}
                                className={styles.categoryItem}
                                aria-label={`Browse ${category.name} salons`}
                            >
                                <span className={styles.categoryName}>{category.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

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
