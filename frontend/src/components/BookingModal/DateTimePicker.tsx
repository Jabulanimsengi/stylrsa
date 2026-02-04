'use client';

import { useState, useMemo, useCallback } from 'react';
import { FaChevronRight, FaCheck } from 'react-icons/fa';
import { BsSunrise, BsSunset } from 'react-icons/bs';
import { IoSunny } from 'react-icons/io5';
import styles from './DateTimePicker.module.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

// ============================================================================
// Types
// ============================================================================

export interface TimeSlot {
    time: string;
    available: boolean;
    status: 'available' | 'limited' | 'unavailable';
}

export interface DayAvailability {
    date: string;
    status: 'available' | 'limited' | 'unavailable';
    slotsCount: number;
}

export type TimePeriod = 'morning' | 'afternoon' | 'late_afternoon';

interface DateTimePickerProps {
    selectedDate: Date | null;
    selectedSlot: string | null;
    onDateChange: (date: Date) => void;
    onSlotChange: (slot: string) => void;
    availableSlots: TimeSlot[];
    loadingSlots: boolean;
    monthAvailability?: DayAvailability[];
    loadingMonthAvailability?: boolean;
    onRefresh?: () => void;
    formatTime: (isoString: string) => string;
    mode?: 'date' | 'time' | 'both';
    selectedTimePeriod?: TimePeriod | null;
    onTimePeriodChange?: (period: TimePeriod) => void;
}

// Time period definitions
const TIME_PERIODS = {
    morning: {
        label: 'Morning',
        timeRange: '9:00 AM - 12:00 PM',
        icon: BsSunrise,
        startHour: 9,
        endHour: 12,
    },
    afternoon: {
        label: 'Afternoon',
        timeRange: '12:00 PM - 3:00 PM',
        icon: IoSunny,
        startHour: 12,
        endHour: 15,
    },
    late_afternoon: {
        label: 'Late Afternoon',
        timeRange: '3:00 PM - 6:00 PM',
        icon: BsSunset,
        startHour: 15,
        endHour: 18,
    },
} as const;

// ============================================================================
// Component
// ============================================================================

export default function DateTimePicker({
    selectedDate,
    selectedSlot,
    onDateChange,
    onSlotChange,
    availableSlots,
    loadingSlots,
    monthAvailability = [],
    loadingMonthAvailability = false,
    onRefresh,
    formatTime,
    mode = 'both',
    selectedTimePeriod,
    onTimePeriodChange,
}: DateTimePickerProps) {
    const [showMoreDays, setShowMoreDays] = useState(false);

    // ---------------------------------------------------------------------------
    // Generate dates for the next 7 or 21 days
    // ---------------------------------------------------------------------------

    const dates = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysToShow = showMoreDays ? 21 : 7;
        const result: Date[] = [];

        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            result.push(date);
        }

        return result;
    }, [showMoreDays]);

    // ---------------------------------------------------------------------------
    // Date helpers
    // ---------------------------------------------------------------------------

    const isSelected = useCallback((date: Date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    }, [selectedDate]);

    const isToday = useCallback((date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }, []);

    const formatDayName = useCallback((date: Date) => {
        if (isToday(date)) return 'Today';
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }, [isToday]);

    const formatDayNumber = useCallback((date: Date) => {
        return date.getDate();
    }, []);

    const formatMonthName = useCallback((date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short' });
    }, []);

    // ---------------------------------------------------------------------------
    // Handle date selection
    // ---------------------------------------------------------------------------

    const handleDateSelect = useCallback((date: Date) => {
        onDateChange(date);
    }, [onDateChange]);

    // ---------------------------------------------------------------------------
    // Handle time period selection
    // ---------------------------------------------------------------------------

    const handlePeriodSelect = useCallback((period: TimePeriod) => {
        if (onTimePeriodChange) {
            onTimePeriodChange(period);
        }

        // Find the first available slot in this time period
        const periodConfig = TIME_PERIODS[period];
        const slotsInPeriod = availableSlots.filter(slot => {
            if (!slot.available) return false;
            const hour = new Date(slot.time).getHours();
            return hour >= periodConfig.startHour && hour < periodConfig.endHour;
        });

        if (slotsInPeriod.length > 0) {
            onSlotChange(slotsInPeriod[0].time);
        }
    }, [availableSlots, onSlotChange, onTimePeriodChange]);

    // ---------------------------------------------------------------------------
    // Check if period has available slots
    // ---------------------------------------------------------------------------

    const isPeriodAvailable = useCallback((period: TimePeriod) => {
        const periodConfig = TIME_PERIODS[period];
        return availableSlots.some(slot => {
            if (!slot.available) return false;
            const hour = new Date(slot.time).getHours();
            return hour >= periodConfig.startHour && hour < periodConfig.endHour;
        });
    }, [availableSlots]);

    // ---------------------------------------------------------------------------
    // Render Date Selection
    // ---------------------------------------------------------------------------

    const renderDateSelection = () => (
        <div className={styles.dateSection}>
            <div className={styles.dateScrollContainer}>
                <div className={styles.dateRow}>
                    {dates.map((date, index) => {
                        const selected = isSelected(date);
                        const today = isToday(date);

                        return (
                            <button
                                key={index}
                                onClick={() => handleDateSelect(date)}
                                className={`${styles.dateItem} ${selected ? styles.dateItemSelected : ''} ${today && !selected ? styles.dateItemToday : ''}`}
                            >
                                <span className={styles.dateDayName}>{formatDayName(date)}</span>
                                <span className={styles.dateDayNumber}>{formatDayNumber(date)}</span>
                                <span className={styles.dateMonth}>{formatMonthName(date)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* View More Days Button */}
            <button
                onClick={() => setShowMoreDays(!showMoreDays)}
                className={styles.viewMoreButton}
            >
                {showMoreDays ? 'Show Less Days' : 'View More Days'}
                <FaChevronRight className={`${styles.viewMoreIcon} ${showMoreDays ? styles.viewMoreIconRotated : ''}`} />
            </button>
        </div>
    );

    // ---------------------------------------------------------------------------
    // Render Time Period Selection
    // ---------------------------------------------------------------------------

    const renderTimeSelection = () => (
        <div className={styles.timePeriodSection}>
            {loadingSlots ? (
                <div className={styles.loadingContainer}>
                    <LoadingSpinner size="md" inline />
                    <p>Loading available times...</p>
                </div>
            ) : (
                <div className={styles.timePeriodCards}>
                    {(Object.keys(TIME_PERIODS) as TimePeriod[]).map((period) => {
                        const config = TIME_PERIODS[period];
                        const isAvailable = isPeriodAvailable(period);
                        const isSelectedPeriod = selectedTimePeriod === period;

                        return (
                            <button
                                key={period}
                                onClick={() => isAvailable && handlePeriodSelect(period)}
                                disabled={!isAvailable}
                                className={`${styles.timePeriodCard} ${isSelectedPeriod ? styles.timePeriodCardSelected : ''} ${!isAvailable ? styles.timePeriodCardDisabled : ''}`}
                            >
                                <div className={styles.timePeriodContent}>
                                    <h4 className={styles.timePeriodLabel}>{config.label}</h4>
                                    <p className={styles.timePeriodRange}>{config.timeRange}</p>
                                </div>
                                {isSelectedPeriod && (
                                    <FaCheck className={styles.timePeriodCheck} />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <div className={styles.container}>
            {(mode === 'date' || mode === 'both') && renderDateSelection()}
            {(mode === 'time' || mode === 'both') && selectedDate && renderTimeSelection()}
        </div>
    );
}
