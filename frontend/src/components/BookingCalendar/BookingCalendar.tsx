'use client';

import React, { useState, useMemo } from 'react';
import { FiList, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './BookingCalendar.module.css';

interface Booking {
    id: string;
    status: string;
    startTime?: string;
    date?: string;
    user?: { firstName: string; lastName: string };
    service?: { title?: string; name?: string } | null;
    [key: string]: unknown;
}

interface BookingCalendarProps {
    bookings: Booking[];
    onBookingClick?: (booking: Booking) => void;
    renderListView: () => React.ReactNode;
}

type ViewMode = 'list' | 'calendar';

const CHIP_CLASS: Record<string, string> = {
    PENDING: styles.chipPending,
    CONFIRMED: styles.chipConfirmed,
    COMPLETED: styles.chipCompleted,
    CANCELLED: styles.chipCancelled,
    REJECTED: styles.chipCancelled,
};

const LEGEND = [
    { label: 'Pending', cls: styles.chipPending, dotBg: '#FDE68A' },
    { label: 'Confirmed', cls: styles.chipConfirmed, dotBg: '#A7F3D0' },
    { label: 'Completed', cls: styles.chipCompleted, dotBg: '#C7D2FE' },
    { label: 'Cancelled', cls: styles.chipCancelled, dotBg: '#E5E7EB' },
];

function getBookingDate(b: Booking): Date | null {
    const raw = b.startTime || b.date;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
}

function getBookingLabel(b: Booking): string {
    const firstName = b.user?.firstName ?? '';
    const svcName = b.service?.title ?? b.service?.name ?? '';
    return firstName ? `${firstName}${svcName ? ` · ${svcName}` : ''}` : svcName || 'Booking';
}

export default function BookingCalendar({
    bookings,
    onBookingClick,
    renderListView,
}: BookingCalendarProps) {
    const [view, setView] = useState<ViewMode>('list');
    const [currentMonth, setCurrentMonth] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d;
    });

    // Build a map from YYYY-MM-DD → Booking[]
    const bookingsByDate = useMemo(() => {
        const map: Record<string, Booking[]> = {};
        for (const b of bookings) {
            const d = getBookingDate(b);
            if (!d) continue;
            const key = d.toISOString().split('T')[0];
            if (!map[key]) map[key] = [];
            map[key].push(b);
        }
        return map;
    }, [bookings]);

    // Build the grid — 6 rows × 7 cols
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: Date[] = [];

        // Pad start
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(new Date(year, month, -(firstDay.getDay() - 1 - i)));
        }
        // Current month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }
        // Pad end to fill 6 weeks
        while (days.length < 42) {
            days.push(new Date(year, month + 1, days.length - lastDay.getDate() - firstDay.getDay() + 1));
        }
        return days;
    }, [currentMonth]);

    const isToday = (d: Date) => {
        const t = new Date();
        return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    };
    const isCurrentMonth = (d: Date) => d.getMonth() === currentMonth.getMonth();

    const navigateMonth = (dir: -1 | 1) => {
        setCurrentMonth(prev => {
            const n = new Date(prev);
            n.setMonth(n.getMonth() + dir);
            return n;
        });
    };

    return (
        <div className={styles.wrapper}>
            {/* Toggle */}
            <div className={styles.viewToggle}>
                <button
                    className={`${styles.toggleBtn} ${view === 'list' ? styles.toggleBtnActive : ''}`}
                    onClick={() => setView('list')}
                    aria-pressed={view === 'list'}
                >
                    <FiList size={14} /> List
                </button>
                <button
                    className={`${styles.toggleBtn} ${view === 'calendar' ? styles.toggleBtnActive : ''}`}
                    onClick={() => setView('calendar')}
                    aria-pressed={view === 'calendar'}
                >
                    <FiCalendar size={14} /> Calendar
                </button>
            </div>

            {/* List View */}
            {view === 'list' && renderListView()}

            {/* Calendar View */}
            {view === 'calendar' && (
                <div className={styles.calendarContainer}>
                    {/* Header */}
                    <div className={styles.calendarHeader}>
                        <button className={styles.navBtn} onClick={() => navigateMonth(-1)} aria-label="Previous month">
                            <FiChevronLeft size={14} />
                        </button>
                        <span className={styles.monthTitle}>
                            {currentMonth.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
                        </span>
                        <button className={styles.navBtn} onClick={() => navigateMonth(1)} aria-label="Next month">
                            <FiChevronRight size={14} />
                        </button>
                    </div>

                    {/* Week day labels */}
                    <div className={styles.weekDaysRow}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className={styles.weekDayLabel}>{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className={styles.daysGrid}>
                        {calendarDays.map((day, i) => {
                            const key = day.toISOString().split('T')[0];
                            const dayBookings = bookingsByDate[key] ?? [];
                            const outside = !isCurrentMonth(day);
                            const today = isToday(day);
                            const MAX_CHIPS = 2;

                            return (
                                <div
                                    key={i}
                                    className={`${styles.dayCell} ${outside ? styles.dayCellOutside : ''} ${today ? styles.dayCellToday : ''}`}
                                >
                                    <span className={`${styles.dayNumber} ${today ? styles.dayNumberToday : ''} ${outside ? styles.dayNumberOutside : ''}`}>
                                        {day.getDate()}
                                    </span>
                                    {dayBookings.slice(0, MAX_CHIPS).map(b => (
                                        <div
                                            key={b.id}
                                            className={`${styles.bookingChip} ${CHIP_CLASS[b.status] ?? styles.chipConfirmed}`}
                                            onClick={() => onBookingClick?.(b)}
                                            title={`${getBookingLabel(b)} — ${b.status}`}
                                        >
                                            {getBookingLabel(b)}
                                        </div>
                                    ))}
                                    {dayBookings.length > MAX_CHIPS && (
                                        <span className={styles.moreChip}>+{dayBookings.length - MAX_CHIPS} more</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className={styles.legend}>
                        {LEGEND.map(l => (
                            <div key={l.label} className={styles.legendItem}>
                                <span className={styles.legendDot} style={{ background: l.dotBg }} />
                                {l.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
