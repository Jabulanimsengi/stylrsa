import { useState, useEffect } from 'react';
import styles from './TimeSlotPicker.module.css';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface TimeSlot {
  time: string;
  available: boolean;
  status: 'available' | 'busy' | 'unavailable';
}

interface TimeSlotPickerProps {
  serviceId: string;
  selectedDate: Date | null;
  selectedSlot: string | null;
  onSlotSelect: (slot: string) => void;
}

export default function TimeSlotPicker({
  serviceId,
  selectedDate,
  selectedSlot,
  onSlotSelect,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate || !serviceId) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        console.log('Fetching availability for:', serviceId, dateString);
        
        // Use relative URL to go through Next.js rewrites
        const response = await fetch(
          `/api/bookings/availability/${serviceId}?date=${dateString}`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Availability fetch failed:', response.status, errorText);
          throw new Error(`Failed to fetch availability: ${response.status}`);
        }

        const data = await response.json();
        console.log('Availability data received:', data);
        setSlots(data.slots || []);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Unable to load available time slots. Please try again.');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [serviceId, selectedDate]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getSlotIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <FaCheckCircle />;
      case 'busy':
        return <FaTimesCircle />;
      case 'unavailable':
        return <FaTimesCircle />;
      default:
        return <FaClock />;
    }
  };

  const getSlotLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Booked';
      case 'unavailable':
        return 'Past';
      default:
        return '';
    }
  };

  if (!selectedDate) {
    return (
      <div className={styles.emptyState}>
        <FaClock className={styles.emptyIcon} />
        <p>Please select a date to view available time slots</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <LoadingSpinner size="md" inline text="Loading available slots..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FaClock className={styles.emptyIcon} />
        <p>No available time slots for this date</p>
        <span className={styles.hint}>The salon may be closed or fully booked</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Select a Time Slot</h3>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.available}`}></span>
            <span>Available</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.busy}`}></span>
            <span>Booked</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.unavailable}`}></span>
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      <div className={styles.slotsGrid}>
        {slots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            className={`${styles.slotButton} ${styles[slot.status]} ${
              selectedSlot === slot.time ? styles.selected : ''
            }`}
            onClick={() => slot.available && onSlotSelect(slot.time)}
            disabled={!slot.available}
          >
            <span className={styles.slotIcon}>{getSlotIcon(slot.status)}</span>
            <span className={styles.slotTime}>{formatTime(slot.time)}</span>
            <span className={styles.slotLabel}>{getSlotLabel(slot.status)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
