import type { ReactNode } from 'react';
import BookingCalendar from '@/components/BookingCalendar/BookingCalendar';
import styles from '../Dashboard.module.css';
import type { DashboardBooking } from '../types';

interface DashboardBookingsSectionProps {
  bookings: DashboardBooking[];
  pendingBookings: DashboardBooking[];
  confirmedBookings: DashboardBooking[];
  pastBookings: DashboardBooking[];
  activeBookingTab: 'pending' | 'confirmed' | 'past';
  onBookingTabChange: (tab: 'pending' | 'confirmed' | 'past') => void;
  renderBookingCard: (booking: DashboardBooking) => ReactNode;
}

export default function DashboardBookingsSection({
  bookings,
  pendingBookings,
  confirmedBookings,
  pastBookings,
  activeBookingTab,
  onBookingTabChange,
  renderBookingCard,
}: DashboardBookingsSectionProps) {
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Bookings</h3>
      </div>
      <BookingCalendar
        bookings={bookings}
        onBookingClick={() => {
          // Booking detail interactions remain in the list cards for now.
        }}
        renderListView={() => (
          <>
            <div className={styles.tabs}>
              <button
                onClick={() => onBookingTabChange('pending')}
                className={`${styles.tabButton} ${activeBookingTab === 'pending' ? styles.activeTab : ''}`}
              >
                Pending ({pendingBookings.length})
              </button>
              <button
                onClick={() => onBookingTabChange('confirmed')}
                className={`${styles.tabButton} ${activeBookingTab === 'confirmed' ? styles.activeTab : ''}`}
              >
                Confirmed ({confirmedBookings.length})
              </button>
              <button
                onClick={() => onBookingTabChange('past')}
                className={`${styles.tabButton} ${activeBookingTab === 'past' ? styles.activeTab : ''}`}
              >
                Past ({pastBookings.length})
              </button>
            </div>
            <div className={styles.list}>
              {activeBookingTab === 'pending' && (
                pendingBookings.length > 0 ? pendingBookings.map(renderBookingCard) : (
                  <div className={styles.emptyState}>
                    <h3 className={styles.emptyStateTitle}>No Pending Bookings</h3>
                    <p className={styles.emptyStateMessage}>
                      You&apos;re all caught up. New booking requests will appear here when customers book your services.
                    </p>
                  </div>
                )
              )}
              {activeBookingTab === 'confirmed' && (
                confirmedBookings.length > 0 ? confirmedBookings.map(renderBookingCard) : (
                  <div className={styles.emptyState}>
                    <h3 className={styles.emptyStateTitle}>No Confirmed Bookings</h3>
                    <p className={styles.emptyStateMessage}>
                      Once you accept booking requests, they will appear here.
                    </p>
                  </div>
                )
              )}
              {activeBookingTab === 'past' && (
                pastBookings.length > 0 ? pastBookings.map(renderBookingCard) : (
                  <div className={styles.emptyState}>
                    <h3 className={styles.emptyStateTitle}>No Past Bookings</h3>
                    <p className={styles.emptyStateMessage}>
                      Completed, declined, and cancelled bookings will appear here for your records.
                    </p>
                  </div>
                )
              )}
            </div>
          </>
        )}
      />
    </div>
  );
}
