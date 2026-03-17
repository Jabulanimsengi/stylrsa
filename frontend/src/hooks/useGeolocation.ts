import { useState, useEffect, useCallback } from 'react';
import { useReverseGeolocation, type ReverseGeolocationResult } from './useReverseGeolocation';
import { useIPGeolocation } from './useIPGeolocation';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  locationName: ReverseGeolocationResult | null;
  error: string | null;
  isLoading: boolean;
  isReverseGeocoding: boolean;
  source: 'browser' | 'ip' | 'cache' | null;
}

const STORAGE_KEY = 'user_location';
const LOCATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface StoredLocation {
  coordinates: GeolocationCoordinates;
  locationName?: ReverseGeolocationResult | null;
  timestamp: number;
}

export function useGeolocation(autoRequest: boolean = false) {
  const { reverseGeocode } = useReverseGeolocation();
  const { fetchIPLocation } = useIPGeolocation();
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    locationName: null,
    error: null,
    isLoading: false,
    isReverseGeocoding: false,
    source: null,
  });

  // IP-based fallback when browser geolocation fails
  const fallbackToIPLocation = useCallback(async (originalError: string) => {
    console.log('[Geolocation] Browser geolocation failed, trying IP fallback...');
    
    try {
      const ipResult = await fetchIPLocation();
      
      if (ipResult) {
        const coordinates = {
          latitude: ipResult.latitude,
          longitude: ipResult.longitude,
        };

        const locationName: ReverseGeolocationResult = {
          city: ipResult.city,
          province: ipResult.region,
          country: ipResult.country,
        };

        // Store in localStorage
        try {
          const storedData: StoredLocation = {
            coordinates,
            locationName,
            timestamp: Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
        } catch {
          // localStorage not available
        }

        setState({
          coordinates,
          locationName,
          error: null,
          isLoading: false,
          isReverseGeocoding: false,
          source: 'ip',
        });

        console.log('[Geolocation] IP fallback successful:', ipResult.city);
        return;
      }
    } catch (ipError) {
      console.warn('[Geolocation] IP fallback also failed:', ipError);
    }

    // Both methods failed
    setState({
      coordinates: null,
      locationName: null,
      error: originalError,
      isLoading: false,
      isReverseGeocoding: false,
      source: null,
    });
  }, [fetchIPLocation]);

  const requestLocation = useCallback(() => {
    // Skip on server-side rendering
    if (typeof window === 'undefined') {
      return;
    }

    // If browser doesn't support geolocation, go straight to IP fallback
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, isLoading: true }));
      fallbackToIPLocation('Geolocation is not supported by your browser');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Set coordinates first, then do reverse geocoding
        setState(prev => ({ 
          ...prev, 
          coordinates,
          isLoading: false,
          isReverseGeocoding: true,
          source: 'browser',
        }));

        // Perform reverse geocoding asynchronously
        let locationName: ReverseGeolocationResult | null = null;
        try {
          locationName = await reverseGeocode(coordinates.latitude, coordinates.longitude);
        } catch (reverseError) {
          console.warn('Reverse geocoding failed:', reverseError);
          // Continue without location name - not critical
        }

        // Store in localStorage with timestamp
        try {
          const storedData: StoredLocation = {
            coordinates,
            locationName,
            timestamp: Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
        } catch {
          // localStorage not available, continue without caching
        }

        setState({
          coordinates,
          locationName,
          error: null,
          isLoading: false,
          isReverseGeocoding: false,
          source: 'browser',
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out';
        }

        // Try IP-based fallback
        fallbackToIPLocation(errorMessage);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: LOCATION_EXPIRY,
      }
    );
  }, [reverseGeocode, fallbackToIPLocation]);

  useEffect(() => {
    // Skip on server-side rendering
    if (typeof window === 'undefined') {
      return;
    }

    // Try to load from localStorage first
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredLocation = JSON.parse(stored);
        const age = Date.now() - data.timestamp;

        // Use cached location if less than 24 hours old
        if (age < LOCATION_EXPIRY) {
          setState({
            coordinates: data.coordinates,
            locationName: data.locationName || null,
            error: null,
            isLoading: false,
            isReverseGeocoding: false,
            source: 'cache',
          });
          return;
        }
      }
    } catch {
      // Invalid stored data, continue to request
    }

    // Auto-request if enabled and no valid cached location
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  const clearLocation = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // localStorage not available
      }
    }
    setState({
      coordinates: null,
      locationName: null,
      error: null,
      isLoading: false,
      isReverseGeocoding: false,
      source: null,
    });
  }, []);

  return {
    ...state,
    requestLocation,
    clearLocation,
  };
}
