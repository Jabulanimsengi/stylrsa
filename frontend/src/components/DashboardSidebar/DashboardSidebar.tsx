'use client';

import React from 'react';
import styles from '../../app/dashboard/Dashboard.module.css';
import { FiX, FiMenu } from 'react-icons/fi';

interface NavItem {
    id: string;
    label: string;
    icon?: React.ElementType;
}

interface NavSection {
    label: string;
    items: NavItem[];
}

interface DashboardSidebarProps {
    sections: NavSection[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    mobileNavOpen: boolean;
    onMobileNavToggle: () => void;
    salonName?: string;
    pendingBookingsCount?: number;
}

export default function DashboardSidebar({
    sections,
    activeTab,
    onTabChange,
    mobileNavOpen,
    onMobileNavToggle,
    salonName,
    pendingBookingsCount = 0,
}: DashboardSidebarProps) {
    return (
        <>
            {/* Mobile Nav Header */}
            <div className={styles.mobileNavHeader}>
                <div className={styles.mobileNavHeaderContent}>
                    <button
                        className={`${styles.mobileNavToggle} ${mobileNavOpen ? styles.hamburgerOpen : ''}`}
                        onClick={onMobileNavToggle}
                        aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={mobileNavOpen}
                    >
                        <span className={styles.hamburgerLine} />
                        <span className={styles.hamburgerLine} />
                        <span className={styles.hamburgerLine} />
                    </button>
                    <span className={styles.mobileNavCurrentTab}>
                        {sections.flatMap(s => s.items).find(i => i.id === activeTab)?.label ?? 'Dashboard'}
                    </span>
                    {salonName && (
                        <span className={styles.mobileNavSalonName}>{salonName}</span>
                    )}
                </div>
            </div>

            {/* Backdrop */}
            {mobileNavOpen && (
                <div className={styles.sidebarBackdrop} onClick={onMobileNavToggle} aria-hidden="true" />
            )}

            {/* Sidebar */}
            <aside
                className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ''}`}
                role="navigation"
                aria-label="Dashboard navigation"
            >
                {/* Mobile close button */}
                <button
                    className={styles.sidebarCloseBtn}
                    onClick={onMobileNavToggle}
                    aria-label="Close navigation"
                >
                    <FiX size={20} />
                </button>

                {sections.map((section) => (
                    <div key={section.label} className={styles.navSection}>
                        <h3 className={styles.navSectionTitle}>{section.label}</h3>
                        <ul className={styles.navList}>
                            {section.items.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => { onTabChange(item.id); onMobileNavToggle(); }}
                                        className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
                                        aria-current={activeTab === item.id ? 'page' : undefined}
                                    >
                                        {item.icon && (
                                            <span className={styles.navItemIcon}>
                                                {React.createElement(item.icon as React.ElementType, { size: 16 })}
                                            </span>
                                        )}
                                        <span className={styles.navItemLabel}>{item.label}</span>
                                        {item.id === 'bookings' && pendingBookingsCount > 0 && (
                                            <span className={styles.navBadge}>{pendingBookingsCount}</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </aside>
        </>
    );
}
