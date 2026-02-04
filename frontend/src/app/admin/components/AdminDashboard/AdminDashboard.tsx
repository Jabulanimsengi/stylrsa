'use client';

import React from 'react';
import styles from './AdminDashboard.module.css';
import {
    FaStore,
    FaUserTie,
    FaClock,
    FaCreditCard,
    FaArrowRight,
    FaCheckCircle,
    FaExclamationCircle
} from 'react-icons/fa';
import type { AdminView } from '../AdminSidebar/AdminSidebar';

interface DashboardMetrics {
    totalSalons: number;
    totalSellers: number;
    pendingApprovals: number;
    pendingPayments: number;
    approvedToday?: number;
    recentActivity?: Array<{
        type: 'salon' | 'service' | 'review' | 'product' | 'payment';
        action: 'approved' | 'rejected' | 'created' | 'verified';
        name: string;
        timestamp: string;
    }>;
}

interface AdminDashboardProps {
    metrics: DashboardMetrics;
    onNavigate: (view: AdminView) => void;
}

export default function AdminDashboard({ metrics, onNavigate }: AdminDashboardProps) {
    const quickActions = [
        {
            label: 'Review Pending Salons',
            view: 'salons' as AdminView,
            count: metrics.pendingApprovals,
            urgent: metrics.pendingApprovals > 5
        },
        {
            label: 'Verify Payments',
            view: 'pending-payments' as AdminView,
            count: metrics.pendingPayments,
            urgent: metrics.pendingPayments > 0
        },
        {
            label: 'Manage Featured',
            view: 'featured-salons' as AdminView,
            count: 0,
            urgent: false
        },
        {
            label: 'Review Media',
            view: 'media' as AdminView,
            count: 0,
            urgent: false
        },
    ];

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.subtitle}>Welcome back! Here's what's happening today.</p>
            </div>

            {/* Metrics Grid */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                        <FaStore />
                    </div>
                    <div className={styles.metricContent}>
                        <span className={styles.metricValue}>{metrics.totalSalons}</span>
                        <span className={styles.metricLabel}>Total Salons</span>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                        <FaUserTie />
                    </div>
                    <div className={styles.metricContent}>
                        <span className={styles.metricValue}>{metrics.totalSellers}</span>
                        <span className={styles.metricLabel}>Total Sellers</span>
                    </div>
                </div>

                <div className={`${styles.metricCard} ${metrics.pendingApprovals > 0 ? styles.urgent : ''}`}>
                    <div className={styles.metricIcon}>
                        <FaClock />
                    </div>
                    <div className={styles.metricContent}>
                        <span className={styles.metricValue}>{metrics.pendingApprovals}</span>
                        <span className={styles.metricLabel}>Pending Approvals</span>
                    </div>
                </div>

                <div className={`${styles.metricCard} ${metrics.pendingPayments > 0 ? styles.urgent : ''}`}>
                    <div className={styles.metricIcon}>
                        <FaCreditCard />
                    </div>
                    <div className={styles.metricContent}>
                        <span className={styles.metricValue}>{metrics.pendingPayments}</span>
                        <span className={styles.metricLabel}>Pending Payments</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className={styles.actionsGrid}>
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            className={`${styles.actionCard} ${action.urgent ? styles.actionUrgent : ''}`}
                            onClick={() => onNavigate(action.view)}
                        >
                            <div className={styles.actionContent}>
                                <span className={styles.actionLabel}>{action.label}</span>
                                {action.count > 0 && (
                                    <span className={styles.actionBadge}>{action.count}</span>
                                )}
                            </div>
                            <FaArrowRight className={styles.actionArrow} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            {metrics.recentActivity && metrics.recentActivity.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Activity</h2>
                    <div className={styles.activityList}>
                        {metrics.recentActivity.map((activity, index) => (
                            <div key={index} className={styles.activityItem}>
                                <div className={`${styles.activityIcon} ${styles[activity.action]}`}>
                                    {activity.action === 'approved' || activity.action === 'verified' ? (
                                        <FaCheckCircle />
                                    ) : (
                                        <FaExclamationCircle />
                                    )}
                                </div>
                                <div className={styles.activityContent}>
                                    <span className={styles.activityText}>
                                        <strong>{activity.name}</strong> was {activity.action}
                                    </span>
                                    <span className={styles.activityTime}>{activity.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Platform Overview</h2>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Approved Today</span>
                        </div>
                        <span className={styles.statValue}>{metrics.approvedToday || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
