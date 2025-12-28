'use client';

import { useState, useEffect } from 'react';
import styles from './SellerStats.module.css';
import { FaChartLine, FaShoppingBag, FaMoneyBillWave, FaPercent, FaBoxOpen, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface SellerStatsData {
    totalSales: number;
    totalOrders: number;
    totalCommission: number;
    netEarnings: number;
    pendingOrders: number;
    completedOrders: number;
    monthlySales: { month: string; amount: number }[];
}

interface SellerStatsProps {
    sellerId?: string;
}

// Commission rate for products (configurable)
const PRODUCT_COMMISSION_RATE = 0.10; // 10%

export default function SellerStats({ sellerId }: SellerStatsProps) {
    const [stats, setStats] = useState<SellerStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/sellers/stats?period=${period}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    // Mock data for development
                    setStats({
                        totalSales: 15750.00,
                        totalOrders: 42,
                        totalCommission: 1575.00,
                        netEarnings: 14175.00,
                        pendingOrders: 5,
                        completedOrders: 37,
                        monthlySales: [
                            { month: 'Oct', amount: 3200 },
                            { month: 'Nov', amount: 4850 },
                            { month: 'Dec', amount: 7700 },
                        ],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch seller stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [period]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.skeletonRow}>
                    <div className={styles.skeleton} />
                    <div className={styles.skeleton} />
                    <div className={styles.skeleton} />
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <FaChartLine className={styles.icon} />
                    <h3 className={styles.title}>Sales Overview</h3>
                </div>
                <div className={styles.periodSelector}>
                    {(['week', 'month', 'year'] as const).map((p) => (
                        <button
                            key={p}
                            className={`${styles.periodBtn} ${period === p ? styles.active : ''}`}
                            onClick={() => setPeriod(p)}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <FaMoneyBillWave />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Sales</span>
                        <span className={styles.statValue}>R{stats.totalSales.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <FaShoppingBag />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Orders</span>
                        <span className={styles.statValue}>{stats.totalOrders}</span>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.commission}`}>
                    <div className={styles.statIcon}>
                        <FaPercent />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Commission ({PRODUCT_COMMISSION_RATE * 100}%)</span>
                        <span className={styles.statValue}>-R{stats.totalCommission.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.earnings}`}>
                    <div className={styles.statIcon}>
                        <FaArrowUp />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Net Earnings</span>
                        <span className={styles.statValue}>R{stats.netEarnings.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Order Status */}
            <div className={styles.orderStatus}>
                <div className={styles.statusCard}>
                    <FaBoxOpen className={styles.statusIcon} />
                    <div className={styles.statusInfo}>
                        <span className={styles.statusValue}>{stats.pendingOrders}</span>
                        <span className={styles.statusLabel}>Pending</span>
                    </div>
                </div>
                <div className={styles.divider} />
                <div className={styles.statusCard}>
                    <FaArrowDown className={styles.statusIcon} />
                    <div className={styles.statusInfo}>
                        <span className={styles.statusValue}>{stats.completedOrders}</span>
                        <span className={styles.statusLabel}>Completed</span>
                    </div>
                </div>
            </div>

            {/* Mini Chart placeholder */}
            {stats.monthlySales.length > 0 && (
                <div className={styles.chartSection}>
                    <h4 className={styles.chartTitle}>Sales Trend</h4>
                    <div className={styles.miniChart}>
                        {stats.monthlySales.map((item, idx) => {
                            const maxAmount = Math.max(...stats.monthlySales.map(s => s.amount), 1);
                            const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                            return (
                                <div key={idx} className={styles.chartBar}>
                                    <div
                                        className={styles.barFill}
                                        style={{ height: `${Math.max(height, 2)}%` }}
                                    />
                                    <span className={styles.barLabel}>{item.month}</span>
                                    <span className={styles.barValue}>R{item.amount.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Commission Info */}
            <div className={styles.commissionInfo}>
                <FaPercent />
                <span>
                    Platform commission: {PRODUCT_COMMISSION_RATE * 100}% per sale. Payouts processed weekly.
                </span>
            </div>
        </div>
    );
}
