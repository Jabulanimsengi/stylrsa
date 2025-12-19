// Reverse Geolocation Hook - Get city/address from coordinates using Mapbox
import { useState, useCallback } from 'react';
import { reverseGeocode as mapboxReverseGeocode, ReverseGeocodingResult } from '@/lib/mapbox';

export interface ReverseGeolocationResult {
  city?: string;
  province?: string;
  country?: string;
  formattedAddress?: string;
  neighborhood?: string;
}

interface ReverseGeolocationState {
  result: ReverseGeolocationResult | null;
  isLoading: boolean;
  error: string | null;
}

const CACHE_KEY = 'reverse_geocoding_cache';
const CACHE_EXPIRY = 6 * 60 * 60 * 1000; // 6 hours

interface CachedResult {
  coordinates: string; // "lat,lon"
  result: ReverseGeolocationResult;
  timestamp: number;
}

export function useReverseGeolocation() {
  const [state, setState] = useState<ReverseGeolocationState>({
    result: null,
    isLoading: false,
    error: null
  });

  const getCachedResult = useCallback((lat: number, lon: number): ReverseGeolocationResult | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cachedResults: CachedResult[] = JSON.parse(cached);
      const coordKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

      const match = cachedResults.find(item => {
        const age = Date.now() - item.timestamp;
        return item.coordinates === coordKey && age < CACHE_EXPIRY;
      });

      return match?.result || null;
    } catch {
      return null;
    }
  }, []);

  const setCachedResult = useCallback((lat: number, lon: number, result: ReverseGeolocationResult) => {
    if (typeof window === 'undefined') return;

    try {
      const coordKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
      const cached = localStorage.getItem(CACHE_KEY);
      let cachedResults: CachedResult[] = cached ? JSON.parse(cached) : [];

      // Remove old entries and add new one
      cachedResults = cachedResults.filter(item => {
        const age = Date.now() - item.timestamp;
        return age < CACHE_EXPIRY && item.coordinates !== coordKey;
      });

      cachedResults.push({
        coordinates: coordKey,
        result,
        timestamp: Date.now()
      });

      // Keep only last 10 results
      if (cachedResults.length > 10) {
        cachedResults = cachedResults.slice(-10);
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedResults));
    } catch (error) {
      console.warn('Failed to cache reverse geocoding result:', error);
    }
  }, []);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    // Check cache first
    const cached = getCachedResult(latitude, longitude);
    if (cached) {
      setState({
        result: cached,
        isLoading: false,
        error: null
      });
      return cached;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Using Mapbox Geocoding API for fast reverse geocoding
      const mapboxResult = await mapboxReverseGeocode(longitude, latitude);

      if (!mapboxResult) {
        throw new Error('Location not found');
      }

      const result: ReverseGeolocationResult = {
        city: mapboxResult.city,
        province: mapboxResult.province,
        country: mapboxResult.country,
        formattedAddress: mapboxResult.formattedAddress,
        neighborhood: mapboxResult.neighborhood
      };

      // Cache the result
      setCachedResult(latitude, longitude, result);

      setState({
        result,
        isLoading: false,
        error: null
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location name';
      setState({
        result: null,
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  }, [getCachedResult, setCachedResult]);

  const clearCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
    setState({
      result: null,
      isLoading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    reverseGeocode,
    clearCache
  };
}