'use client';

import { Button } from '@/components/ui';
import styles from '../Dashboard.module.css';
import type { DashboardBooking } from '../types';

interface DashboardBookingCardProps {
  booking: DashboardBooking;
  onConfirmBooking: (bookingId: string) => void;
  onDeclineBooking: (bookingId: string) => void;
  onCompleteBooking: (bookingId: string) => void;
}

export default function DashboardBookingCard({
  booking,
  onConfirmBooking,
  onDeclineBooking,
  onCompleteBooking,
}: DashboardBookingCardProps) {
  const bookingDate = new Date(booking.bookingTime);
  const dateStr = bookingDate.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = bookingDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  const statusClass = styles[`status${booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}`];

  return (
    <div className={styles.bookingCard} data-status={booking.status}>
      <div className={styles.bookingInfo}>
        <div className={styles.bookingTopRow}>
          <span className={styles.bookingServiceTitle}>{booking.service.title}</span>
          <span className={`${styles.bookingStatusBadge} ${statusClass}`}>
            {booking.status}
          </span>
        </div>
        <div className={styles.bookingMeta}>
          <span className={styles.bookingMetaItem}>{booking.user.firstName} {booking.user.lastName}</span>
          <span className={styles.bookingMetaDot}>-</span>
          <span className={styles.bookingMetaItem}>{dateStr}</span>
          <span className={styles.bookingMetaDot}>-</span>
          <span className={styles.bookingMetaItem}>{timeStr}</span>
          {booking.clientPhone && (
            <>
              <span className={styles.bookingMetaDot}>-</span>
              <span className={styles.bookingMetaItem}>{booking.clientPhone}</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.bookingActions}>
        {booking.status === 'PENDING' && (
          <>
            <Button size="sm" variant="default" onClick={() => onConfirmBooking(booking.id)}>
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeclineBooking(booking.id)}
              style={{ color: 'var(--color-error-text)', borderColor: 'var(--color-error-text)' }}
            >
              Decline
            </Button>
          </>
        )}
        {booking.status === 'CONFIRMED' && (
          <Button size="sm" variant="secondary" onClick={() => onCompleteBooking(booking.id)}>
            Complete
          </Button>
        )}
        {['COMPLETED', 'DECLINED', 'CANCELLED'].includes(booking.status) && (
          <span className={styles.bookingStatusText}>
            {booking.status === 'COMPLETED' ? 'Completed' : booking.status === 'DECLINED' ? 'Declined' : 'Cancelled'}
          </span>
        )}
      </div>
    </div>
  );
}
