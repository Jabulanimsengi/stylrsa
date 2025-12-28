'use client';

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import styles from './SalonMapView.module.css';
import SalonMapModal from './SalonMapModal';

interface SalonMapButtonProps {
    variant?: 'floating' | 'desktop';
}

const MINIMIZED_STORAGE_KEY = 'salon-map-button-minimized';

export default function SalonMapButton({ variant = 'floating' }: SalonMapButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

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

    // Desktop variant - simple button for navbar
    if (variant === 'desktop') {
        return (
            <>
                <button
                    className={styles.desktopButton}
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Find Salons on Map"
                >
                    <FaMapMarkerAlt />
                    <span>Find Salons</span>
                </button>
                <SalonMapModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
                    aria-label="Find Salons on Map"
                >
                    <FaMapMarkerAlt />
                    <span>Find Salons</span>
                </button>
                <button
                    className={styles.closeFloating}
                    onClick={handleMinimize}
                    aria-label="Minimize"
                >
                    <FaTimes />
                </button>
            </div>
            <SalonMapModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
