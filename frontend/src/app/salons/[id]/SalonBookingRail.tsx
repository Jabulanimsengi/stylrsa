'use client';

import { FaMapMarkerAlt, FaPhoneAlt, FaRegClock, FaStar } from 'react-icons/fa';
import type { Salon, Service } from '@/types';
import styles from './SalonProfile.module.css';

interface SalonBookingRailProps {
  salon: Salon;
  services: Service[];
  reviewsCount: number;
  mapsHref: string;
  onBookNow: () => void;
  onShowServices: () => void;
}

export default function SalonBookingRail({
  salon,
  services,
  reviewsCount,
  mapsHref,
  onBookNow,
  onShowServices,
}: SalonBookingRailProps) {
  const topServices = services.slice(0, 3);

  return (
    <aside className={styles.bookingRail}>
      <div className={styles.bookingRailCard}>
        <div className={styles.bookingRailHeader}>
          <p className={styles.bookingRailEyebrow}>Book this salon</p>
          <h3 className={styles.bookingRailTitle}>Quick booking actions</h3>
          <p className={styles.bookingRailDescription}>
            Start with services, then move straight into the booking flow.
          </p>
        </div>

        <div className={styles.bookingRailStats}>
          <div className={styles.bookingRailStat}>
            <span className={styles.bookingRailStatIcon}><FaStar /></span>
            <div>
              <p className={styles.bookingRailStatLabel}>Rating</p>
              <p className={styles.bookingRailStatValue}>
                {salon.avgRating ? `${salon.avgRating.toFixed(1)} / 5` : 'New listing'}
              </p>
            </div>
          </div>
          <div className={styles.bookingRailStat}>
            <span className={styles.bookingRailStatIcon}><FaRegClock /></span>
            <div>
              <p className={styles.bookingRailStatLabel}>Availability</p>
              <p className={styles.bookingRailStatValue}>{salon.isAvailableNow ? 'Booking open' : 'Check services'}</p>
            </div>
          </div>
          <div className={styles.bookingRailStat}>
            <span className={styles.bookingRailStatIcon}><FaMapMarkerAlt /></span>
            <div>
              <p className={styles.bookingRailStatLabel}>Location</p>
              <p className={styles.bookingRailStatValue}>{salon.city || salon.province || 'South Africa'}</p>
            </div>
          </div>
        </div>

        {topServices.length > 0 && (
          <div className={styles.bookingRailServices}>
            <p className={styles.bookingRailSectionLabel}>Top services</p>
            <div className={styles.bookingRailChips}>
              {topServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className={styles.bookingRailChip}
                  onClick={onShowServices}
                >
                  {service.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.bookingRailActions}>
          <button type="button" className={styles.bookingRailPrimaryButton} onClick={onBookNow}>
            Book now
          </button>
          <div className={styles.bookingRailSecondaryActions}>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={styles.bookingRailSecondaryButton}>
              Directions
            </a>
            {salon.phoneNumber && (
              <a href={`tel:${salon.phoneNumber}`} className={styles.bookingRailSecondaryButton}>
                <FaPhoneAlt /> Call
              </a>
            )}
          </div>
        </div>

        <div className={styles.bookingRailFooter}>
          <span>{services.length} services</span>
          <span>{reviewsCount} reviews</span>
        </div>
      </div>
    </aside>
  );
}
