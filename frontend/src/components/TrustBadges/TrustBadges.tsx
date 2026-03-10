'use client';

import { useMemo, type ReactNode } from 'react';
import { FaCheckCircle, FaStar, FaFire } from 'react-icons/fa';
import styles from './TrustBadges.module.css';
import { Salon } from '@/types';

interface TrustBadgesProps {
  salon: Salon;
  showAll?: boolean; // Show all badges or just compact view
}

export default function TrustBadges({ salon, showAll = false }: TrustBadgesProps) {
  const badges = useMemo(() => {
    const badgesList: Array<{ type: string; label: string; icon: ReactNode }> = [];

    // Verified Salon - Check if salon has been verified (you can add a verified field to Salon type)
    // For now, we'll use a combination of factors: has reviews, has services, approved status
    if (salon.approvalStatus === 'APPROVED' && salon.reviewCount && salon.reviewCount > 0) {
      badgesList.push({
        type: 'verified',
        label: 'Verified',
        icon: <FaCheckCircle />
      });
    }

    // Top Rated - 4.5+ stars with at least 5 reviews
    if (salon.avgRating && salon.avgRating >= 4.5 && salon.reviewCount && salon.reviewCount >= 5) {
      badgesList.push({
        type: 'topRated',
        label: 'Top Rated',
        icon: <FaStar />
      });
    }

    // Popular Choice - Based on review count or bookings (using review count as proxy)
    if (salon.reviewCount && salon.reviewCount >= 10) {
      badgesList.push({
        type: 'popular',
        label: 'Popular Choice',
        icon: <FaFire />
      });
    }

    return badgesList;
  }, [salon]);

  if (badges.length === 0) return null;

  return (
    <div className={styles.container}>
      {badges.map((badge) => (
        <div
          key={badge.type}
          className={`${styles.badge} ${styles[badge.type]}`}
          title={badge.label}
        >
          <span className={styles.icon}>{badge.icon}</span>
          {showAll && <span className={styles.label}>{badge.label}</span>}
        </div>
      ))}
    </div>
  );
}

