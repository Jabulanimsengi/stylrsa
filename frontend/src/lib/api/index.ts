/**
 * Centralized API Service Layer
 * 
 * This module provides a unified interface for all API calls.
 * Benefits:
 * - Consistent error handling
 * - Automatic retry logic
 * - Request/response interceptors
 * - Type safety
 * 
 * Usage:
 * ```ts
 * import { salonsApi, bookingsApi } from '@/lib/api';
 * 
 * const salons = await salonsApi.getFeatured();
 * const booking = await bookingsApi.create({ ... });
 * ```
 */

export * from './client';
export * from './salons';
export * from './services';
export * from './bookings';
export * from './auth';
