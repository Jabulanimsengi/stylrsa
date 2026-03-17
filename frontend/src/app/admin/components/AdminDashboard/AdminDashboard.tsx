'use client';

import React from 'react';
import styles from './AdminDashboard.module.css';
import {
    FaStore,
    FaClock,
    FaCreditCard,
    FaArrowRight,
    FaCheckCircle,
    FaExclamationCircle,
    FaChartLine,
    FaShieldAlt,
} from 'react-icons/fa';
import type { AdminView } from '../../admin-config';

interface DashboardMetrics {
    totalSalons: number;
    pendingApprovals: number;
    pendingPayments: number;
    approvedToday?: number;
    recentActivity?: Array<{
        type: 'salon' | 'service' | 'review' | 'payment';
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
    const queueCards = [
        {
            label: 'Salon approvals',
            helper: 'New salons waiting for moderation',
            view: 'salons' as AdminView,
            count: metrics.pendingApprovals,
            urgent: metrics.pendingApprovals > 5
        },
        {
            label: 'Payment proofs',
            helper: 'Manual verifications requiring attention',
            view: 'pending-payments' as AdminView,
            count: metrics.pendingPayments,
            urgent: metrics.pendingPayments > 0
        },
    ];

    const quickActions = [
        { label: 'Audit log', view: 'audit' as AdminView, icon: <FaShieldAlt /> },
        { label: 'All salons', view: 'all-salons' as AdminView, icon: <FaChartLine /> },
        { label: 'Service approvals', view: 'services' as AdminView, icon: <FaClock /> },
    ];

    return (
        <div className={styles.dashboard}>
            <div className={styles.hero}>
                <div className={styles.heroCopy}>
                    <span className={styles.kicker}>Admin Control Room</span>
                    <h1 className={styles.title}>Review what needs action first.</h1>
                    <p className={styles.subtitle}>
                        Prioritize salon approvals, service approvals, and payment proofs before moving into deeper moderation work.
                    </p>
                </div>
                <div className={styles.heroSnapshot}>
                    <div className={styles.snapshotCard}>
                        <span className={styles.snapshotLabel}>Needs attention</span>
                        <span className={styles.snapshotValue}>{metrics.pendingApprovals + metrics.pendingPayments}</span>
                        <span className={styles.snapshotHint}>moderation and payment items</span>
                    </div>
                    <div className={styles.snapshotCard}>
                        <span className={styles.snapshotLabel}>Approved today</span>
                        <span className={styles.snapshotValue}>{metrics.approvedToday || 0}</span>
                        <span className={styles.snapshotHint}>items processed successfully</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Attention Queue</h2>
                    <p className={styles.sectionHint}>Start here when you log in.</p>
                </div>
                <div className={styles.queueGrid}>
                    {queueCards.map((action) => (
                        <button
                            key={action.label}
                            className={`${styles.queueCard} ${action.urgent ? styles.queueCardUrgent : ''}`}
                            onClick={() => onNavigate(action.view)}
                        >
                            <div className={styles.queueTop}>
                                <span className={styles.queueLabel}>{action.label}</span>
                                <FaArrowRight className={styles.queueArrow} />
                            </div>
                            <span className={styles.queueCount}>{action.count}</span>
                            <span className={styles.queueHelper}>{action.helper}</span>
                        </button>
                    ))}
                </div>
            </div>

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

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Operational Shortcuts</h2>
                    <p className={styles.sectionHint}>Jump into the core admin workflows.</p>
                </div>
                <div className={styles.actionsGrid}>
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            className={styles.actionCard}
                            onClick={() => onNavigate(action.view)}
                        >
                            <div className={styles.actionContent}>
                                <span className={styles.actionIcon}>{action.icon}</span>
                                <span className={styles.actionLabel}>{action.label}</span>
                            </div>
                            <FaArrowRight className={styles.actionArrow} />
                        </button>
                    ))}
                </div>
            </div>

            {metrics.recentActivity && metrics.recentActivity.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent Activity</h2>
                        <p className={styles.sectionHint}>Latest changes across moderation and verification flows.</p>
                    </div>
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

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Platform Overview</h2>
                    <p className={styles.sectionHint}>Core marketplace footprint at a glance.</p>
                </div>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Approved Today</span>
                        </div>
                        <span className={styles.statValue}>{metrics.approvedToday || 0}</span>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Total salons</span>
                        </div>
                        <span className={styles.statValue}>{metrics.totalSalons}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
