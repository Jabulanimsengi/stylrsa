'use client';

import React from 'react';
import styles from './AdminSidebar.module.css';
import {
    FaHome,
    FaStore,
    FaConciergeBell,
    FaStar,
    FaBox,
    FaGift,
    FaUsers,
    FaUserTie,
    FaCrown,
    FaCreditCard,
    FaImage,
    FaChartLine,
    FaNewspaper,
    FaTrash,
    FaHistory,
    FaChevronDown,
    FaChevronRight,
    FaTimes
} from 'react-icons/fa';

export type AdminView =
    | 'dashboard'
    | 'salons'
    | 'services'
    | 'reviews'
    | 'products'
    | 'promotions'
    | 'all-salons'
    | 'all-sellers'
    | 'featured-salons'
    | 'pending-payments'
    | 'media'
    | 'trends'
    | 'salon-trendz'
    | 'blogs'
    | 'top10-requests'
    | 'deleted-salons'
    | 'deleted-sellers'
    | 'audit';

interface NavItem {
    id: AdminView;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}

interface NavSection {
    title: string;
    items: NavItem[];
    defaultExpanded?: boolean;
}

interface AdminSidebarProps {
    currentView: AdminView;
    onViewChange: (view: AdminView) => void;
    pendingCounts: {
        salons: number;
        services: number;
        reviews: number;
        products: number;
        promotions: number;
        payments: number;
    };
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({
    currentView,
    onViewChange,
    pendingCounts,
    isOpen,
    onClose,
}: AdminSidebarProps) {
    const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
        new Set(['pending', 'management'])
    );

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    const totalPending =
        pendingCounts.salons +
        pendingCounts.services +
        pendingCounts.reviews +
        pendingCounts.products +
        pendingCounts.promotions;

    const sections: NavSection[] = [
        {
            title: 'Overview',
            defaultExpanded: true,
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
            ],
        },
        {
            title: `Pending Approvals${totalPending > 0 ? ` (${totalPending})` : ''}`,
            defaultExpanded: true,
            items: [
                { id: 'salons', label: 'Salons', icon: <FaStore />, badge: pendingCounts.salons },
                { id: 'services', label: 'Services', icon: <FaConciergeBell />, badge: pendingCounts.services },
                { id: 'reviews', label: 'Reviews', icon: <FaStar />, badge: pendingCounts.reviews },
                { id: 'products', label: 'Products', icon: <FaBox />, badge: pendingCounts.products },
                { id: 'promotions', label: 'Promotions', icon: <FaGift />, badge: pendingCounts.promotions },
            ],
        },
        {
            title: 'Management',
            defaultExpanded: true,
            items: [
                { id: 'all-salons', label: 'All Salons', icon: <FaStore /> },
                { id: 'all-sellers', label: 'All Sellers', icon: <FaUserTie /> },
                { id: 'featured-salons', label: 'Featured Salons', icon: <FaCrown /> },
                { id: 'pending-payments', label: 'Pending Payments', icon: <FaCreditCard />, badge: pendingCounts.payments },
            ],
        },
        {
            title: 'Content',
            items: [
                { id: 'media', label: 'Media Review', icon: <FaImage /> },
                { id: 'trends', label: 'Trends', icon: <FaChartLine /> },
                { id: 'salon-trendz', label: 'Salon Trendz', icon: <FaChartLine /> },
                { id: 'blogs', label: 'Blogs', icon: <FaNewspaper /> },
                { id: 'top10-requests', label: 'Top 10 Requests', icon: <FaUsers /> },
            ],
        },
        {
            title: 'Archive',
            items: [
                { id: 'deleted-salons', label: 'Deleted Salons', icon: <FaTrash /> },
                { id: 'deleted-sellers', label: 'Deleted Sellers', icon: <FaTrash /> },
                { id: 'audit', label: 'Audit Logs', icon: <FaHistory /> },
            ],
        },
    ];

    const handleItemClick = (view: AdminView) => {
        onViewChange(view);
        // Close mobile sidebar on selection
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className={styles.overlay} onClick={onClose} />
            )}

            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                {/* Mobile close button */}
                <button className={styles.closeButton} onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={styles.logo}>
                    <h2>Admin Panel</h2>
                </div>

                <nav className={styles.nav}>
                    {sections.map((section, sectionIndex) => {
                        const sectionKey = section.title.toLowerCase().split(' ')[0];
                        const isExpanded = expandedSections.has(sectionKey) || section.defaultExpanded;

                        return (
                            <div key={sectionIndex} className={styles.section}>
                                <button
                                    className={styles.sectionHeader}
                                    onClick={() => toggleSection(sectionKey)}
                                >
                                    <span className={styles.sectionTitle}>{section.title}</span>
                                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                </button>

                                {isExpanded && (
                                    <ul className={styles.sectionItems}>
                                        {section.items.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    className={`${styles.navItem} ${currentView === item.id ? styles.navItemActive : ''}`}
                                                    onClick={() => handleItemClick(item.id)}
                                                >
                                                    <span className={styles.navIcon}>{item.icon}</span>
                                                    <span className={styles.navLabel}>{item.label}</span>
                                                    {item.badge !== undefined && item.badge > 0 && (
                                                        <span className={styles.navBadge}>{item.badge}</span>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
