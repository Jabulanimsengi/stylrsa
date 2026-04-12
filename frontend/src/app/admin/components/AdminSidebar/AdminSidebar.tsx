'use client';

import React from 'react';
import styles from './AdminSidebar.module.css';
import type { AdminView } from '../../admin-config';
import {
    FaHome,
    FaStore,
    FaConciergeBell,
    FaCreditCard,
    FaTrash,
    FaHistory,
    FaCalendarAlt,
    FaChevronDown,
    FaChevronRight,
    FaTimes
} from 'react-icons/fa';

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
        applications: number;
        salons: number;
        services: number;
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
        pendingCounts.applications +
        pendingCounts.salons +
        pendingCounts.services;

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
                { id: 'salon-applications', label: 'Applications', icon: <FaStore />, badge: pendingCounts.applications },
                { id: 'salons', label: 'Salons', icon: <FaStore />, badge: pendingCounts.salons },
                { id: 'services', label: 'Services', icon: <FaConciergeBell />, badge: pendingCounts.services },
            ],
        },
        {
            title: 'Management',
            defaultExpanded: true,
            items: [
                { id: 'all-salons', label: 'All Salons', icon: <FaStore /> },
                { id: 'bookings', label: 'Bookings', icon: <FaCalendarAlt /> },
                { id: 'pending-payments', label: 'Pending Payments', icon: <FaCreditCard />, badge: pendingCounts.payments },
            ],
        },
        {
            title: 'Archive',
            items: [
                { id: 'deleted-salons', label: 'Deleted Salons', icon: <FaTrash /> },
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
