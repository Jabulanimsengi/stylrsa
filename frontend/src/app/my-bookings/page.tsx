'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Booking, Salon, Service } from '@/types';
import styles from './MyBookingsPage.module.css';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'react-toastify';
import { Skeleton, SkeletonGroup } from '@/components/Skeleton/Skeleton';
import { Button, EmptyState } from '@/components/ui';
import StatusBadge from '@/components/StatusBadge';
import { getSalonUrl } from '@/utils/salonUrl';

// FIX 1: Create a more detailed Booking type that matches the actual API response data
// This includes the full salon and service objects, and optional review/totalCost fields.
type PopulatedBooking = Booking & {
  salon: Salon;
  service: Service;
  review?: unknown | null;
  totalCost: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DECLINED'; // Add 'DECLINED'
};

export default function MyBookingsPage() {
  // Use the new, more accurate type for state
  const [bookings, setBookings] = useState<PopulatedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const router = useRouter();
  const socket = useSocket();
  const { authStatus } = useAuth();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/my-bookings`, { credentials: 'include' });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to fetch bookings');
      }

      // The data from the API matches our new PopulatedBooking type
      const data: PopulatedBooking[] = await res.json();
      setBookings(data);

    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Don't redirect if still loading auth status
    if (authStatus === 'loading') {
      return;
    }

    if (authStatus === 'unauthenticated') {
      // Redirect to home with auth modal instead of /login page
      router.push('/?auth=login&redirect=/my-bookings');
      return;
    }

    if (authStatus === 'authenticated') {
      fetchBookings();
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (socket) {
      const handleBookingUpdate = () => {
        fetchBookings();
      };
      socket.on('bookingUpdate', handleBookingUpdate);
      return () => {
        socket.off('bookingUpdate', handleBookingUpdate);
      };
    }
  }, [socket]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const upcomingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
  // FIX 3: Include 'DECLINED' as a past booking status
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'DECLINED');
  const bookingsToShow = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Bookings</h1>

        <div className={styles.tabs} aria-hidden>
          <Skeleton variant="button" style={{ width: '45%' }} />
          <Skeleton variant="button" style={{ width: '45%' }} />
        </div>

        <SkeletonGroup count={3} className={styles.list}>
          {() => (
            <div className={styles.card} aria-hidden>
              <Skeleton variant="text" style={{ width: '30%', height: 16 }} />
              <Skeleton variant="text" style={{ width: '60%', height: 20 }} />
              <Skeleton variant="text" style={{ width: '50%', height: 16 }} />
              <Skeleton variant="text" style={{ width: '40%', height: 16 }} />
              <Skeleton variant="button" style={{ width: '35%', marginTop: '1rem' }} />
            </div>
          )}
        </SkeletonGroup>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') return null;

  return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Bookings</h1>

        <div className={styles.tabs}>
          <button onClick={() => setActiveTab('upcoming')} className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}>
            Upcoming ({upcomingBookings.length})
          </button>
          <button onClick={() => setActiveTab('past')} className={`${styles.tabButton} ${activeTab === 'past' ? styles.activeTab : ''}`}>
            Past ({pastBookings.length})
          </button>
        </div>

        {bookingsToShow.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} bookings`}
            description={activeTab === 'upcoming' ? 'Book a service to see your upcoming appointments here.' : 'Your past bookings will appear here once completed.'}
            icon="inbox"
            action={activeTab === 'upcoming' ? { label: 'Browse Salons', onClick: () => router.push('/salons') } : undefined}
          />
        ) : (
          <div className={styles.list}>
            {bookingsToShow.map(booking => (
              <div key={booking.id} className={styles.card}>
                <StatusBadge status={booking.status} size="sm" />
                {/* FIX 5: Access properties from the full objects */}
                <h4>{booking.service.title}</h4>
                <p>at <strong>{booking.salon.name}</strong></p>
                <p>Date: {formatDate(booking.bookingTime)}</p>
                <p>Cost: <strong>R{booking.totalCost.toFixed(2)}</strong></p>

                {booking.status === 'COMPLETED' ? (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {booking.salon.googleReviewsUrl || booking.salon.freshaReviewsUrl || booking.salon.booksyReviewsUrl ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const reviewUrl = booking.salon.googleReviewsUrl
                            || booking.salon.freshaReviewsUrl
                            || booking.salon.booksyReviewsUrl;

                          if (reviewUrl) {
                            window.open(reviewUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        View Reviews
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => router.push(getSalonUrl(booking.salon))}
                      >
                        View Salon
                      </Button>
                    )}
                    <Button onClick={() => router.push(`${getSalonUrl(booking.salon)}?serviceId=${booking.serviceId}`)}>
                      Book Again
                    </Button>
                  </div>
                ) : booking.status === 'DECLINED' ? (
                  <div style={{ marginTop: '1rem' }}>
                    <Button
                      variant="secondary"
                      onClick={() => router.push(getSalonUrl(booking.salon))}
                    >
                      Try Another Time
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
