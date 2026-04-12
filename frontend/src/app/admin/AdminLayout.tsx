'use client';

import React, { useState } from 'react';
import styles from './AdminLayout.module.css';
import AdminSidebar from './components/AdminSidebar/AdminSidebar';
import type { AdminView } from './admin-config';
import { FaBars } from 'react-icons/fa';

interface AdminLayoutProps {
    children: React.ReactNode;
    currentView: AdminView;
    onViewChange: (view: AdminView) => void;
    pendingCounts: {
        applications: number;
        salons: number;
        services: number;
        payments: number;
    };
}

export default function AdminLayout({
    children,
    currentView,
    onViewChange,
    pendingCounts,
}: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <AdminSidebar
                currentView={currentView}
                onViewChange={onViewChange}
                pendingCounts={pendingCounts}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className={styles.main}>
                {/* Mobile header */}
                <div className={styles.mobileHeader}>
                    <button
                        className={styles.menuButton}
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <FaBars />
                    </button>
                    <h1 className={styles.mobileTitle}>Admin</h1>
                </div>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
