'use client';

import React from 'react';
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiStar } from 'react-icons/fi';
import styles from '../../app/dashboard/Dashboard.module.css';

interface KPIData {
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    avgRating: number | null;
    reviewCount: number;
    servicesCount: number;
    profileComplete: number;
}

interface DashboardKPIRowProps {
    data: KPIData;
    onCardClick?: (tab: string) => void;
}

export default function DashboardKPIRow({ data, onCardClick }: DashboardKPIRowProps) {
    const cards = [
        {
            label: 'Total Bookings',
            value: data.totalBookings,
            sub: data.pendingBookings > 0
                ? <span className={styles.kpiSubAlert}>{data.pendingBookings} need action</span>
                : 'No pending',
            icon: FiCalendar,
            iconBg: '#EEF2FF',
            iconColor: '#4F46E5',
            tab: 'bookings',
            highlight: data.pendingBookings > 0,
        },
        {
            label: 'Completed',
            value: data.completedBookings,
            sub: 'Services done',
            icon: FiCheckCircle,
            iconBg: '#ECFDF5',
            iconColor: '#059669',
            tab: 'bookings',
            highlight: false,
        },
        {
            label: 'Avg Rating',
            value: data.avgRating !== null ? data.avgRating.toFixed(1) : '--',
            sub: `${data.reviewCount} review${data.reviewCount !== 1 ? 's' : ''}`,
            icon: FiStar,
            iconBg: '#FFFBEB',
            iconColor: '#D97706',
            tab: null,
            highlight: false,
        },
        {
            label: 'Profile',
            value: `${data.profileComplete}%`,
            sub: data.profileComplete === 100 ? 'Complete' : 'Fill in more details',
            icon: FiAlertCircle,
            iconBg: data.profileComplete === 100 ? '#ECFDF5' : '#FEF3C7',
            iconColor: data.profileComplete === 100 ? '#059669' : '#D97706',
            tab: null,
            highlight: false,
        },
    ];

    return (
        <div className={styles.kpiGrid}>
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`${styles.kpiCard} ${card.highlight ? styles.kpiCardAlert : ''}`}
                    onClick={() => card.tab && onCardClick?.(card.tab)}
                    style={{ cursor: card.tab ? 'pointer' : 'default' }}
                    role={card.tab ? 'button' : undefined}
                    tabIndex={card.tab ? 0 : undefined}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && card.tab) {
                            onCardClick?.(card.tab);
                        }
                    }}
                    aria-label={card.tab ? `Go to ${card.label}` : card.label}
                >
                    <div
                        className={styles.kpiIconWrap}
                        style={{ background: card.iconBg, color: card.iconColor }}
                    >
                        <card.icon size={16} />
                    </div>
                    <div className={styles.kpiValue}>{card.value}</div>
                    <div className={styles.kpiLabel}>{card.label}</div>
                    {card.sub && <div className={styles.kpiSub}>{card.sub}</div>}
                    {card.tab && (
                        <span className={styles.kpiArrow} aria-hidden>{'>'}</span>
                    )}
                </div>
            ))}
        </div>
    );
}
