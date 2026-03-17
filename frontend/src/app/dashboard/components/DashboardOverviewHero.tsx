'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import styles from '../Dashboard.module.css';

interface DashboardOverviewHeroProps {
  salonName: string;
  locationSummary: string;
  isVerified: boolean;
  isAvailableNow: boolean;
  todaysBookingsCount: number;
  servicesCount: number;
  galleryCount: number;
  planName: string;
  planStatusLabel: string;
  publicProfileHref: string;
  onEditProfile: () => void;
}

export default function DashboardOverviewHero({
  salonName,
  locationSummary,
  isVerified,
  isAvailableNow,
  todaysBookingsCount,
  servicesCount,
  galleryCount,
  planName,
  planStatusLabel,
  publicProfileHref,
  onEditProfile,
}: DashboardOverviewHeroProps) {
  return (
    <section className={styles.overviewHero}>
      <div className={styles.overviewLead}>
        <span className={styles.overviewEyebrow}>Salon operator overview</span>
        <div className={styles.overviewTitleRow}>
          <div className={styles.overviewTitleBlock}>
            <h2 className={styles.overviewTitle}>{salonName}</h2>
            {(locationSummary || isVerified) && (
              <div className={styles.overviewSupportRow}>
                {locationSummary && <span>{locationSummary}</span>}
                {isVerified && <span className={styles.overviewSupportAccent}>Verified listing</span>}
              </div>
            )}
          </div>
          <span className={`${styles.overviewStatus} ${isAvailableNow ? styles.overviewStatusAvailable : styles.overviewStatusUnavailable}`}>
            {isAvailableNow ? 'Available for bookings' : 'Currently unavailable'}
          </span>
        </div>
        <p className={styles.overviewDescription}>
          Manage service listings, gallery images, reviews, and your WhatsApp booking handoff from one calmer workspace.
        </p>
        <div className={styles.overviewMetaRow}>
          <span className={styles.overviewMetaPill}>{todaysBookingsCount} booking{todaysBookingsCount === 1 ? '' : 's'} today</span>
          <span className={styles.overviewMetaPill}>{servicesCount} services live</span>
          <span className={styles.overviewMetaPill}>{galleryCount} gallery items</span>
        </div>
        <div className={styles.overviewDetailRow}>
          <span className={styles.overviewDetailItem}>Package: {planName}</span>
          <span className={styles.overviewDetailItem}>Payment: {planStatusLabel}</span>
        </div>
        <div className={styles.overviewActions}>
          <Link href={publicProfileHref} target="_blank" className={styles.headerActionBtn}>
            View Public Profile
          </Link>
          <Button
            type="button"
            onClick={onEditProfile}
            className={`${styles.headerActionBtn} ${styles.headerActionBtnPrimary}`}
          >
            Edit Salon Profile
          </Button>
        </div>
      </div>
    </section>
  );
}
