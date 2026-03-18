'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import styles from './SalonMapView.module.css';
import SalonMapModal from './SalonMapModal';

interface SalonMapButtonProps {
    variant?: 'floating' | 'desktop';
}

const MINIMIZED_STORAGE_KEY = 'salon-map-button-minimized';

export default function SalonMapButton({ variant = 'floating' }: SalonMapButtonProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (searchParams.get('map') === '1') {
            setIsModalOpen(true);
        }
    }, [searchParams]);

    // Load minimized state from localStorage
    useEffect(() => {
        if (variant === 'floating') {
            const stored = localStorage.getItem(MINIMIZED_STORAGE_KEY);
            if (stored === 'true') {
                setIsMinimized(true);
            }
        }
    }, [variant]);

    const handleMinimize = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMinimized(true);
        localStorage.setItem(MINIMIZED_STORAGE_KEY, 'true');
    };

    const handleExpand = () => {
        setIsMinimized(false);
        localStorage.removeItem(MINIMIZED_STORAGE_KEY);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);

        if (searchParams.get('map') !== '1') {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.delete('map');
        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(nextUrl, { scroll: false });
    };

    // Desktop variant - simple button for navbar
    if (variant === 'desktop') {
        return (
            <>
                <button
                    className={styles.desktopButton}
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Open salon map"
                >
                    <FaMapMarkerAlt />
                    <span>Salon Map</span>
                </button>
                <SalonMapModal isOpen={isModalOpen} onClose={handleCloseModal} />
            </>
        );
    }

    // Floating variant - for mobile
    if (isMinimized) {
        return (
            <button
                className={styles.minimizedButton}
                onClick={handleExpand}
                aria-label="Expand map button"
            >
                <FaMapMarkerAlt />
            </button>
        );
    }

    return (
        <>
            <div className={styles.floatingContainer}>
                <button
                    className={styles.floatingButton}
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Open salon map"
                >
                    <FaMapMarkerAlt />
                    <span>Salon Map</span>
                </button>
                <button
                    className={styles.closeFloating}
                    onClick={handleMinimize}
                    aria-label="Minimize"
                >
                    <FaTimes />
                </button>
            </div>
            <SalonMapModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </>
    );
}
