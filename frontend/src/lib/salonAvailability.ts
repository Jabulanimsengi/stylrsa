import type { OperatingHourEntry, Salon } from '@/types';

export const DEFAULT_SALON_TIME_ZONE = 'Africa/Johannesburg';

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

type RawOperatingHours =
  | Salon['operatingHours']
  | Record<string, unknown>
  | null
  | undefined;

type HoursRecord = Record<string, string>;

function normalizeDayLabel(day: string): string {
  const trimmed = day.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function buildRangeLabel(open: string, close: string): string {
  return `${open.trim()} - ${close.trim()}`;
}

function parseTimeLabel(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/i);
  if (!match) {
    return null;
  }

  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const meridiem = match[3]?.toLowerCase();

  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
    return null;
  }

  if (meridiem) {
    if (hours === 12) {
      hours = 0;
    }
    if (meridiem === 'pm') {
      hours += 12;
    }
  }

  if (hours < 0 || hours > 23) {
    return null;
  }

  return hours * 60 + minutes;
}

function parseRangeLabel(value: string): { openLabel: string; closeLabel: string; openMinutes: number; closeMinutes: number } | null {
  const normalized = value.replace(/[–—]/g, '-').trim();
  const [openLabel, closeLabel] = normalized.split('-').map((part) => part.trim());

  if (!openLabel || !closeLabel) {
    return null;
  }

  const openMinutes = parseTimeLabel(openLabel);
  const closeMinutes = parseTimeLabel(closeLabel);

  if (openMinutes == null || closeMinutes == null) {
    return null;
  }

  return {
    openLabel,
    closeLabel,
    openMinutes,
    closeMinutes,
  };
}

function getTimeZoneClock(date: Date, timeZone: string): { dayLabel: string; currentMinutes: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const dayLabel = parts.find((part) => part.type === 'weekday')?.value ?? 'Monday';
  const hour = Number.parseInt(parts.find((part) => part.type === 'hour')?.value ?? '0', 10);
  const minute = Number.parseInt(parts.find((part) => part.type === 'minute')?.value ?? '0', 10);

  return {
    dayLabel,
    currentMinutes: hour * 60 + minute,
  };
}

export function normalizeOperatingHours(operatingHours: RawOperatingHours): HoursRecord | null {
  if (!operatingHours) {
    return null;
  }

  const normalized: HoursRecord = {};

  if (Array.isArray(operatingHours)) {
    operatingHours.forEach((entry) => {
      const schedule = entry as OperatingHourEntry;
      if (schedule?.day && schedule.open && schedule.close) {
        normalized[normalizeDayLabel(schedule.day)] = buildRangeLabel(schedule.open, schedule.close);
      }
    });

    return Object.keys(normalized).length > 0 ? normalized : null;
  }

  Object.entries(operatingHours).forEach(([rawDay, rawValue]) => {
    const day = normalizeDayLabel(rawDay);

    if (typeof rawValue === 'string') {
      normalized[day] = rawValue;
      return;
    }

    if (rawValue && typeof rawValue === 'object') {
      const schedule = rawValue as {
        closed?: boolean;
        isOpen?: boolean;
        open?: string;
        close?: string;
        openTime?: string;
        closeTime?: string;
      };

      if (schedule.closed || schedule.isOpen === false) {
        normalized[day] = 'Closed';
        return;
      }

      const open = schedule.open ?? schedule.openTime;
      const close = schedule.close ?? schedule.closeTime;

      if (open && close) {
        normalized[day] = buildRangeLabel(open, close);
      }
    }
  });

  return Object.keys(normalized).length > 0 ? normalized : null;
}

export function getSalonAvailability(
  operatingHours: RawOperatingHours,
  options?: {
    date?: Date;
    timeZone?: string;
  },
): { isOpen: boolean; statusText: string; hoursRecord: HoursRecord | null } {
  const hoursRecord = normalizeOperatingHours(operatingHours);
  if (!hoursRecord) {
    return { isOpen: false, statusText: 'Hours not available', hoursRecord: null };
  }

  const timeZone = options?.timeZone ?? DEFAULT_SALON_TIME_ZONE;
  const { dayLabel, currentMinutes } = getTimeZoneClock(options?.date ?? new Date(), timeZone);
  const todayHours = hoursRecord[dayLabel];

  if (!todayHours || todayHours.toLowerCase() === 'closed') {
    const todayIndex = WEEKDAY_NAMES.indexOf(dayLabel as (typeof WEEKDAY_NAMES)[number]);

    for (let offset = 1; offset <= 7; offset += 1) {
      const nextDay = WEEKDAY_NAMES[(todayIndex + offset) % WEEKDAY_NAMES.length];
      const nextHours = hoursRecord[nextDay];
      const parsedNextRange = nextHours ? parseRangeLabel(nextHours) : null;

      if (parsedNextRange) {
        return {
          isOpen: false,
          statusText: `Opens ${nextDay} at ${parsedNextRange.openLabel}`,
          hoursRecord,
        };
      }
    }

    return { isOpen: false, statusText: 'Closed', hoursRecord };
  }

  const parsedTodayRange = parseRangeLabel(todayHours);
  if (!parsedTodayRange) {
    return {
      isOpen: false,
      statusText: todayHours,
      hoursRecord,
    };
  }

  const isOvernight = parsedTodayRange.closeMinutes <= parsedTodayRange.openMinutes;
  const adjustedCloseMinutes = isOvernight
    ? parsedTodayRange.closeMinutes + 24 * 60
    : parsedTodayRange.closeMinutes;
  const adjustedCurrentMinutes = isOvernight && currentMinutes < parsedTodayRange.openMinutes
    ? currentMinutes + 24 * 60
    : currentMinutes;

  if (
    adjustedCurrentMinutes >= parsedTodayRange.openMinutes &&
    adjustedCurrentMinutes < adjustedCloseMinutes
  ) {
    return {
      isOpen: true,
      statusText: `Open until ${parsedTodayRange.closeLabel}`,
      hoursRecord,
    };
  }

  if (currentMinutes < parsedTodayRange.openMinutes) {
    return {
      isOpen: false,
      statusText: `Opens at ${parsedTodayRange.openLabel}`,
      hoursRecord,
    };
  }

  const todayIndex = WEEKDAY_NAMES.indexOf(dayLabel as (typeof WEEKDAY_NAMES)[number]);
  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDay = WEEKDAY_NAMES[(todayIndex + offset) % WEEKDAY_NAMES.length];
    const nextHours = hoursRecord[nextDay];
    const parsedNextRange = nextHours ? parseRangeLabel(nextHours) : null;

    if (parsedNextRange) {
      return {
        isOpen: false,
        statusText: `Opens ${nextDay} at ${parsedNextRange.openLabel}`,
        hoursRecord,
      };
    }
  }

  return { isOpen: false, statusText: 'Closed', hoursRecord };
}

export function applyComputedAvailability<T extends { operatingHours?: RawOperatingHours; isAvailableNow?: boolean }>(
  salons: T[],
  options?: {
    date?: Date;
    timeZone?: string;
  },
): T[] {
  return salons.map((salon) => {
    const { isOpen, hoursRecord } = getSalonAvailability(salon.operatingHours, options);

    if (!hoursRecord) {
      return {
        ...salon,
        isAvailableNow: Boolean(salon.isAvailableNow),
      };
    }

    return {
      ...salon,
      isAvailableNow: isOpen,
    };
  });
}
