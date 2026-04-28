// IP-based Geolocation Fallback Hook
// Uses free IP geolocation API when browser geolocation fails

import { useState, useCallback } from 'react';

export interface IPGeolocationResult {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  source: 'ip';
}

interface IPGeolocationState {
  result: IPGeolocationResult | null;
  isLoading: boolean;
  error: string | null;
}

interface IpApiSuccessResponse {
  status: 'success';
  city?: string;
  regionName?: string;
  country?: string;
  lat: number;
  lon: number;
}

interface IpApiCoResponse {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country_name?: string;
}

function isIpApiSuccessResponse(value: unknown): value is IpApiSuccessResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<IpApiSuccessResponse>;
  return candidate.status === 'success'
    && typeof candidate.lat === 'number'
    && typeof candidate.lon === 'number';
}

function isIpApiCoResponse(value: unknown): value is IpApiCoResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<IpApiCoResponse>;
  return typeof candidate.latitude === 'number' && typeof candidate.longitude === 'number';
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'IP geolocation failed, using default';
}

// South African city coordinates fallback
// Gauteng & Western Cape city coordinates only
const SA_CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  // Gauteng
  'johannesburg': { lat: -26.2041, lon: 28.0473 },
  'pretoria': { lat: -25.7479, lon: 28.2293 },
  'sandton': { lat: -26.1076, lon: 28.0567 },
  'soweto': { lat: -26.2485, lon: 27.8540 },
  'centurion': { lat: -25.8603, lon: 28.1894 },
  'midrand': { lat: -25.9891, lon: 28.1270 },
  'randburg': { lat: -26.0936, lon: 28.0064 },
  // Western Cape
  'cape town': { lat: -33.9249, lon: 18.4241 },
  'stellenbosch': { lat: -33.9321, lon: 18.8602 },
  'paarl': { lat: -33.7342, lon: 18.9619 },
  'somerset west': { lat: -34.0830, lon: 18.8433 },
  'bellville': { lat: -33.8981, lon: 18.6298 },
};

// Default to Johannesburg (most populous city)
const DEFAULT_COORDS = SA_CITY_COORDS['johannesburg'];

export function useIPGeolocation() {
  const [state, setState] = useState<IPGeolocationState>({
    result: null,
    isLoading: false,
    error: null,
  });

  const fetchIPLocation = useCallback(async (): Promise<IPGeolocationResult | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try ip-api.com (free, no API key required, 45 requests/minute)
      const response = await fetch('http://ip-api.com/json/?fields=status,city,regionName,country,lat,lon', {
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data: unknown = await response.json();
        
        if (isIpApiSuccessResponse(data)) {
          const result: IPGeolocationResult = {
            latitude: data.lat,
            longitude: data.lon,
            city: data.city,
            region: data.regionName,
            country: data.country,
            source: 'ip',
          };
          
          setState({ result, isLoading: false, error: null });
          return result;
        }
      }

      // Fallback: Try ipapi.co (free tier)
      const fallbackResponse = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(5000),
      });

      if (fallbackResponse.ok) {
        const data: unknown = await fallbackResponse.json();
        
        if (isIpApiCoResponse(data)) {
          const result: IPGeolocationResult = {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            region: data.region,
            country: data.country_name,
            source: 'ip',
          };
          
          setState({ result, isLoading: false, error: null });
          return result;
        }
      }

      // Final fallback: Use default South African coordinates
      const defaultResult: IPGeolocationResult = {
        latitude: DEFAULT_COORDS.lat,
        longitude: DEFAULT_COORDS.lon,
        city: 'Johannesburg',
        region: 'Gauteng',
        country: 'South Africa',
        source: 'ip',
      };

      setState({ result: defaultResult, isLoading: false, error: 'Using default location' });
      return defaultResult;

    } catch (error: unknown) {
      // Use default coordinates on error
      const defaultResult: IPGeolocationResult = {
        latitude: DEFAULT_COORDS.lat,
        longitude: DEFAULT_COORDS.lon,
        city: 'Johannesburg',
        region: 'Gauteng',
        country: 'South Africa',
        source: 'ip',
      };

      setState({ 
        result: defaultResult, 
        isLoading: false, 
        error: toErrorMessage(error), 
      });
      return defaultResult;
    }
  }, []);

  // Get coordinates for a specific South African city
  const getCityCoords = useCallback((cityName: string): { lat: number; lon: number } | null => {
    const normalized = cityName.toLowerCase().trim();
    return SA_CITY_COORDS[normalized] || null;
  }, []);

  return {
    ...state,
    fetchIPLocation,
    getCityCoords,
    defaultCoords: DEFAULT_COORDS,
  };
}
