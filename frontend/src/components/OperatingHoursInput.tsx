import React from 'react';
import styles from './OperatingHoursInput.module.css';

export type DayHours = {
  open: string;
  close: string;
  isOpen: boolean;
};

export type OperatingHours = Record<string, DayHours>;

interface OperatingHoursInputProps {
  hours: OperatingHours;
  onChange: (hours: OperatingHours) => void;
  className?: string;
  disabled?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function OperatingHoursInput({ hours, onChange, className, disabled = false }: OperatingHoursInputProps) {
  const handleApplyToAll = (field: 'open' | 'close', value: string) => {
    const updated = { ...hours };
    DAYS.forEach(day => {
      updated[day] = { ...updated[day], [field]: value };
    });
    onChange(updated);
  };

  const handleDayChange = (day: string, field: keyof DayHours, value: string | boolean) => {
    onChange({
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value,
      },
    });
  };

  const applyAllOpen = () => {
    const updated = { ...hours };
    DAYS.forEach(day => {
      updated[day] = { ...updated[day], isOpen: true };
    });
    onChange(updated);
  };

  const applyAllClosed = () => {
    const updated = { ...hours };
    DAYS.forEach(day => {
      updated[day] = { ...updated[day], isOpen: false };
    });
    onChange(updated);
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.applyAllSection}>
        <div className={styles.applyAllRow}>
          <span className={styles.label}>Apply hours to all open days:</span>
          <input
            type="time"
            value={hours['Monday']?.open || '09:00'}
            onChange={(e) => handleApplyToAll('open', e.target.value)}
            className={styles.timeInput}
            disabled={disabled}
          />
          <span className={styles.separator}>to</span>
          <input
            type="time"
            value={hours['Monday']?.close || '17:00'}
            onChange={(e) => handleApplyToAll('close', e.target.value)}
            className={styles.timeInput}
            disabled={disabled}
          />
        </div>
        <div className={styles.bulkActions}>
          <button type="button" onClick={applyAllOpen} className={styles.bulkButton} disabled={disabled}>
            Mark all as open
          </button>
          <button type="button" onClick={applyAllClosed} className={styles.bulkButton} disabled={disabled}>
            Mark all as closed
          </button>
        </div>
      </div>

      <div className={styles.daysGrid}>
        {DAYS.map((day) => {
          const dayData = hours[day] || { open: '09:00', close: '17:00', isOpen: true };
          return (
            <div
              key={day}
              className={`${styles.dayRow} ${!dayData.isOpen ? styles.dayRowClosed : ''}`}
            >
              <label className={styles.dayCheckbox}>
                <input
                  type="checkbox"
                  checked={dayData.isOpen}
                  onChange={(e) => handleDayChange(day, 'isOpen', e.target.checked)}
                  disabled={disabled}
                />
                <span className={styles.dayName}>{day}</span>
              </label>

              {dayData.isOpen ? (
                <div className={styles.timeInputs}>
                  <input
                    type="time"
                    value={dayData.open}
                    onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                    className={styles.timeInput}
                    disabled={disabled}
                  />
                  <span className={styles.separator}>to</span>
                  <input
                    type="time"
                    value={dayData.close}
                    onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                    className={styles.timeInput}
                    disabled={disabled}
                  />
                </div>
              ) : (
                <span className={styles.closedLabel}>Closed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to initialize operating hours
export function initializeOperatingHours(): OperatingHours {
  return Object.fromEntries(
    DAYS.map(day => [day, { open: '09:00', close: '17:00', isOpen: true }])
  ) as OperatingHours;
}

// Helper function to parse operating hours from API response
export function parseOperatingHours(rawHours: any): OperatingHours {
  const initialized = initializeOperatingHours();
  
  if (Array.isArray(rawHours)) {
    rawHours.forEach((entry: any) => {
      if (entry?.day && initialized[entry.day]) {
        const hasHours = entry.open && entry.close;
        initialized[entry.day] = {
          open: entry.open || '09:00',
          close: entry.close || '17:00',
          isOpen: hasHours,
        };
      }
    });
  } else if (rawHours && typeof rawHours === 'object') {
    Object.entries(rawHours).forEach(([day, hours]) => {
      if (initialized[day]) {
        const hoursStr = hours as string;
        const match = hoursStr.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
        if (match) {
          initialized[day] = {
            open: match[1],
            close: match[2],
            isOpen: true,
          };
        } else {
          initialized[day].isOpen = false;
        }
      }
    });
  }
  
  return initialized;
}

// Helper function to serialize operating hours for API submission
export function serializeOperatingHours(hours: OperatingHours) {
  return {
    operatingHours: Object.entries(hours)
      .filter(([_, data]) => data.isOpen)
      .map(([day, data]) => ({
        day,
        open: data.open,
        close: data.close,
      })),
    operatingDays: Object.entries(hours)
      .filter(([_, data]) => data.isOpen)
      .map(([day]) => day),
  };
}
