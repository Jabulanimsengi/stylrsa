'use client';

import styles from './TrustStrip.module.css';

const STATS = [
    { value: '4.8★', label: 'Average rating', accent: '#f59e0b' },
    { value: '12,000+', label: 'Bookings made', accent: '#10b981' },
    { value: '500+', label: 'Verified salons', accent: '#6366f1' },
    { value: 'Free', label: 'No booking fees', accent: '#ec4899' },
];

export default function TrustStrip() {
    return (
        <div className={styles.strip} aria-label="Platform statistics">
            {STATS.map((stat, i) => (
                <div key={i} className={styles.item}>
                    <span className={styles.value} style={{ color: stat.accent }}>
                        {stat.value}
                    </span>
                    <span className={styles.label}>{stat.label}</span>
                </div>
            ))}
        </div>
    );
}
