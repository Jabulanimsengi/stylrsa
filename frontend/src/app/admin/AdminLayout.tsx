'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminLayout.module.css';
import AdminSidebar from './components/AdminSidebar/AdminSidebar';
import type { AdminView } from './admin-config';
import { FaBars, FaTimes } from 'react-icons/fa';

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
    const router = useRouter();
    const closeAdminPanel = () => router.push('/');

    return (
        <div className={styles.layout}>
            <AdminSidebar
                currentView={currentView}
                onViewChange={onViewChange}
                pendingCounts={pendingCounts}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onExitAdmin={closeAdminPanel}
            />

            <main className={styles.main}>
                <button
                    type="button"
                    className={styles.exitButton}
                    onClick={closeAdminPanel}
                    aria-label="Close admin panel"
                    title="Close admin panel"
                >
                    <FaTimes />
                    <span>Close Admin</span>
                </button>

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
                    <button
                        type="button"
                        className={styles.mobileExitButton}
                        onClick={closeAdminPanel}
                        aria-label="Close admin panel"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
