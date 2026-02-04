/**
 * Custom Hooks Index
 * 
 * Export all custom hooks from a single location.
 * 
 * Usage:
 * ```ts
 * import { useDebounce, useLocalStorage, useClickOutside } from '@/hooks';
 * ```
 */

// API & Data
export { useApi, usePaginatedApi } from './useApi';

// State Management
export { useLocalStorage, useSessionStorage } from './useLocalStorage';

// DOM & Events
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useClickOutside, useClickOutsideMultiple } from './useClickOutside';
export { useKeyPress, useEscapeKey, useKeyboardShortcuts } from './useKeyPress';
export { useIntersectionObserver, useInfiniteScroll } from './useIntersectionObserver';

// Re-export existing hooks (if they exist)
export { useAuth } from './useAuth';
export { useMediaQuery } from './useMediaQuery';

// Booking
export { useBookingFlow, STEP_LABELS } from './useBookingFlow';
export type { BookingStep, BookingPreferences, UseBookingFlowReturn } from './useBookingFlow';

