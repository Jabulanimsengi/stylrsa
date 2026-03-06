'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import styles from './AvailabilityManager.module.css';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSave, FaTimes, FaBan } from 'react-icons/fa';
import { OperatingHourEntry } from '@/types';

interface AvailabilityManagerProps {
  salonId: string;
  operatingHours?: OperatingHourEntry[] | Record<string, string> | null;
}

interface HourSlot {
  hour: number;
  isAvailable: boolean;
}

// Day name → JS Date.getDay() index
const DAY_INDEX: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

/** Parse "HH:MM" → hour number (integer) */
function parseHour(time: string): number {
  return parseInt(time.split(':')[0], 10);
}

/** Normalise the two possible shapes of operatingHours into a lookup map:
 *  dayIndex (0–6) → { open: number; close: number } | null (null = closed) */
function buildScheduleMap(
  raw?: OperatingHourEntry[] | Record<string, string> | null
): Map<number, { open: number; close: number }> {
  const map = new Map<number, { open: number; close: number }>();
  if (!raw) return map;

  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      const idx = DAY_INDEX[entry.day?.toLowerCase()];
      if (idx !== undefined && entry.open && entry.close) {
        map.set(idx, { open: parseHour(entry.open), close: parseHour(entry.close) });
      }
    });
  } else {
    // Record<string, string> format: key = day name, value = "HH:MM - HH:MM"
    Object.entries(raw).forEach(([day, range]) => {
      const idx = DAY_INDEX[day.toLowerCase()];
      if (idx !== undefined && typeof range === 'string') {
        const parts = range.split('-').map((s) => s.trim());
        if (parts.length === 2) {
          map.set(idx, { open: parseHour(parts[0]), close: parseHour(parts[1]) });
        }
      }
    });
  }

  return map;
}

export default function AvailabilityManager({ salonId, operatingHours }: AvailabilityManagerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hourlyAvailability, setHourlyAvailability] = useState<HourSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [closedDayMessage, setClosedDayMessage] = useState<string | null>(null);

  const hoursPanelRef = useRef<HTMLDivElement>(null);

  // Build schedule map once from operatingHours prop
  const scheduleMap = buildScheduleMap(operatingHours);
  const hasOperatingHours = scheduleMap.size > 0;

  /** Generate hours for a given date based on operating hours.
   *  Returns all 24 if no operating hours are configured. */
  const getHoursForDate = useCallback((date: Date): HourSlot[] => {
    const dayIdx = date.getDay();
    const schedule = scheduleMap.get(dayIdx);

    if (!hasOperatingHours) {
      // No config → show all 24 hours
      return Array.from({ length: 24 }, (_, hour) => ({ hour, isAvailable: true }));
    }

    if (!schedule) {
      // Day not in schedule → closed
      return [];
    }

    const slots: HourSlot[] = [];
    for (let h = schedule.open; h < schedule.close; h++) {
      slots.push({ hour: h, isAvailable: true });
    }
    return slots;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingHours]);

  /** Whether a day is a closed day (not in schedule at all) */
  const isDayClosed = useCallback((date: Date): boolean => {
    if (!hasOperatingHours) return false;
    return !scheduleMap.has(date.getDay());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingHours]);

  // Generate calendar days for the current month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const startDay = firstDay.getDay();
    for (let i = startDay; i > 0; i--) days.push(new Date(year, month, 1 - i));
    for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
    const endDay = lastDay.getDay();
    for (let day = 1; day < 7 - endDay; day++) days.push(new Date(year, month + 1, day));

    return days;
  };

  // Fetch saved availability for the selected date then merge with operating hour slots
  const fetchAvailability = useCallback(async () => {
    if (!selectedDate) return;
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const defaultSlots = getHoursForDate(selectedDate);
      const response = await fetch(`/api/availability/${salonId}?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        const saved: HourSlot[] = data.slots || [];
        // Overlay saved state onto operating-hours-filtered slots
        const merged = defaultSlots.map((slot) => {
          const saved_slot = saved.find((s) => s.hour === slot.hour);
          return saved_slot ? { ...slot, isAvailable: saved_slot.isAvailable } : slot;
        });
        setHourlyAvailability(merged);
      } else {
        setHourlyAvailability(defaultSlots);
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, salonId, getHoursForDate]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Auto-scroll + animate panel when a date is chosen
  useEffect(() => {
    if (selectedDate) {
      setPanelVisible(false);
      const t = setTimeout(() => {
        setPanelVisible(true);
        hoursPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return () => clearTimeout(t);
    } else {
      setPanelVisible(false);
    }
  }, [selectedDate]);

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clicked = new Date(date);
    clicked.setHours(0, 0, 0, 0);

    if (clicked < today) {
      toast.info('Cannot modify availability for past dates');
      return;
    }

    if (isDayClosed(date)) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      setClosedDayMessage(`${dayName}s are not in your operating schedule. Update your operating hours in Booking Settings if you'd like to accept bookings on this day.`);
      // Briefly flash the message then clear after a few seconds
      setTimeout(() => setClosedDayMessage(null), 6000);
      return;
    }

    setClosedDayMessage(null);
    setSelectedDate(date);
  };

  const handleClosePanel = () => {
    setPanelVisible(false);
    setTimeout(() => setSelectedDate(null), 300);
  };

  const toggleHourAvailability = (hour: number) => {
    setHourlyAvailability((prev) =>
      prev.map((slot) => (slot.hour === hour ? { ...slot, isAvailable: !slot.isAvailable } : slot))
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedDate || !hasChanges) return;
    setIsSaving(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/availability/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ date: dateStr, hours: hourlyAvailability }),
      });

      if (response.ok) {
        const data = await response.json();
        const savedCount = data.updated || hourlyAvailability.length;
        toast.success(
          `✅ Availability updated! ${savedCount} hours saved for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
          { autoClose: 5000 }
        );
        setHasChanges(false);
        setLastSaved(new Date());
        await fetchAvailability();
        window.dispatchEvent(new CustomEvent('availability-updated', { detail: { salonId, date: selectedDate } }));
      } else if (response.status === 401) {
        toast.error('🔒 Please log in to update availability');
      } else if (response.status === 403) {
        toast.error('⛔ You do not have permission to update this salon');
      } else {
        const errorText = await response.text();
        toast.error(`❌ Failed to save: ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save availability:', error);
      toast.error('Failed to save availability. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return d;
    });
  };

  const isToday = (date: Date) => {
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  };
  const isSelected = (date: Date) =>
    !!selectedDate &&
    date.getDate() === selectedDate.getDate() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getFullYear() === selectedDate.getFullYear();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h}:00 ${period}`;
  };

  const setAllHours = (available: boolean) => {
    setHourlyAvailability((prev) => prev.map((slot) => ({ ...slot, isAvailable: available })));
    setHasChanges(true);
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Build a legend of operating hours for display
  const operatingLegend = (() => {
    if (!hasOperatingHours) return null;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from(scheduleMap.entries()).map(([idx, { open, close }]) => ({
      day: dayNames[idx],
      open: formatTime(open),
      close: formatTime(close),
    }));
  })();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <FaCalendarAlt className={styles.icon} />
          <h2 className={styles.title}>Manage Your Availability</h2>
        </div>
        <p className={styles.subtitle}>
          Click an operating day to set your hourly availability.{' '}
          {hasOperatingHours ? 'Greyed-out dates fall outside your operating schedule.' : ''}
        </p>
        {/* Operating hours legend */}
        {operatingLegend && (
          <div className={styles.legend}>
            {operatingLegend.map(({ day, open, close }) => (
              <span key={day} className={styles.legendItem}>
                <strong>{day}</strong> {open} – {close}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Closed-day notification banner */}
      {closedDayMessage && (
        <div className={styles.closedBanner}>
          <FaBan className={styles.closedBannerIcon} />
          <span>{closedDayMessage}</span>
          <button className={styles.closedBannerClose} onClick={() => setClosedDayMessage(null)} aria-label="Dismiss">
            <FaTimes />
          </button>
        </div>
      )}

      <div className={styles.content}>
        {/* Calendar */}
        <div className={styles.calendarSection}>
          <div className={styles.calendarHeader}>
            <button onClick={() => navigateMonth('prev')} className={styles.navButton} type="button">
              <FaChevronLeft />
            </button>
            <h3 className={styles.monthTitle}>{monthName}</h3>
            <button onClick={() => navigateMonth('next')} className={styles.navButton} type="button">
              <FaChevronRight />
            </button>
          </div>

          <div className={styles.calendar}>
            <div className={styles.weekDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className={styles.weekDay}>{day}</div>
              ))}
            </div>
            <div className={styles.daysGrid}>
              {days.map((date, index) => {
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                const closed = isDayClosed(date);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    disabled={isPast}
                    title={closed ? `Salon is closed on ${date.toLocaleDateString('en-US', { weekday: 'long' })}s` : undefined}
                    className={[
                      styles.day,
                      isToday(date) ? styles.today : '',
                      isSelected(date) ? styles.selected : '',
                      !isCurrentMonth(date) ? styles.otherMonth : '',
                      isPast ? styles.past : '',
                      closed && !isPast ? styles.closed : '',
                    ].join(' ')}
                  >
                    {date.getDate()}
                    {closed && !isPast && <span className={styles.closedDot} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hours Panel */}
        {selectedDate && (
          <div
            ref={hoursPanelRef}
            className={`${styles.hoursSection} ${panelVisible ? styles.hoursSectionVisible : ''}`}
          >
            <div className={styles.hoursHeader}>
              <div className={styles.hoursTitleGroup}>
                <h3 className={styles.hoursTitle}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                {hasOperatingHours && scheduleMap.has(selectedDate.getDay()) && (
                  <p className={styles.hoursHint}>
                    Operating hours: {formatTime(scheduleMap.get(selectedDate.getDay())!.open)} –{' '}
                    {formatTime(scheduleMap.get(selectedDate.getDay())!.close)} · Tap a slot to toggle
                  </p>
                )}
                {!hasOperatingHours && (
                  <p className={styles.hoursHint}>Tap a time slot to toggle availability</p>
                )}
              </div>
              <div className={styles.headerControls}>
                <div className={styles.bulkActions}>
                  <button type="button" onClick={() => setAllHours(true)} className={styles.bulkButton}>All Available</button>
                  <button type="button" onClick={() => setAllHours(false)} className={styles.bulkButton}>All Unavailable</button>
                </div>
                <button type="button" onClick={handleClosePanel} className={styles.closeButton} aria-label="Close">
                  <FaTimes />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className={styles.loading}>Loading availability...</div>
            ) : hourlyAvailability.length === 0 ? (
              <div className={styles.noSlots}>
                <FaBan />
                <p>No operating hours configured for this day.</p>
              </div>
            ) : (
              <>
                <div className={styles.hoursGrid}>
                  {hourlyAvailability.map((slot) => (
                    <button
                      key={slot.hour}
                      type="button"
                      onClick={() => toggleHourAvailability(slot.hour)}
                      className={`${styles.hourSlot} ${slot.isAvailable ? styles.available : styles.unavailable}`}
                    >
                      <span className={styles.hourTime}>{formatTime(slot.hour)}</span>
                      <span className={styles.hourStatus}>{slot.isAvailable ? 'Available' : 'Unavailable'}</span>
                    </button>
                  ))}
                </div>

                {hasChanges && (
                  <div className={styles.saveSection}>
                    <button type="button" onClick={handleSave} disabled={isSaving} className={styles.saveButton}>
                      <FaSave />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
                {lastSaved && !hasChanges && (
                  <div className={styles.lastSaved}>
                    ✅ Last saved: {lastSaved.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!selectedDate && (
          <div className={styles.placeholder}>
            <FaCalendarAlt className={styles.placeholderIcon} />
            <p>Select an operating day to set your hourly availability</p>
          </div>
        )}
      </div>
    </div>
  );
}
