'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './MobileFilter.module.css';
import { getLocationsCached } from '@/lib/resourceCache';
import { FilterValues } from '@/components/FilterBar/FilterBar';
import { useGeolocation } from '@/hooks/useGeolocation';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Checkbox,
} from '@/components/ui';

interface MobileFilterProps {
  onSearch: (filters: FilterValues) => void;
  onClose: () => void;
}

type LocationsByProvince = Record<string, string[]>;

export default function MobileFilter({ onSearch, onClose }: MobileFilterProps) {
  const [locations, setLocations] = useState<LocationsByProvince>({});
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState('');
  const [offersMobile, setOffersMobile] = useState(false);
  const fetchedLocationsRef = useRef(false);

  // Use geolocation hook
  const { coordinates, locationName, isLoading: isGeoLoading, isReverseGeocoding, requestLocation } = useGeolocation();

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Store original values
    const originalOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    // Prevent scrolling
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      document.documentElement.style.overflow = originalOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (fetchedLocationsRef.current) return;
    fetchedLocationsRef.current = true;

    getLocationsCached()
      .then((data) => {
        if (data && typeof data === 'object') {
          setLocations(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load locations:', error);
      });
  }, []);

  const handleSearch = () => {
    console.log('[MobileFilter] handleSearch called');
    const filters: FilterValues = {
      province,
      city,
      service,
      category: '',
      offersMobile,
      sortBy: coordinates ? 'distance' : '',
      openNow: false,
      priceMin: '',
      priceMax: '',
      lat: coordinates?.latitude ?? null,
      lon: coordinates?.longitude ?? null,
    };
    console.log('[MobileFilter] Calling onSearch with filters:', filters);
    onSearch(filters);
    onClose();
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    // Track usage analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'geolocation_requested', {
        event_category: 'user_interaction',
        event_label: 'mobile_filter_near_me',
        page_location: window.location.pathname
      });
    }

    requestLocation();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Find Salons</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Province</label>
            <Select
              value={province}
              onValueChange={(value) => {
                setProvince(value === '__all__' ? '' : value);
                setCity('');
              }}
            >
              <SelectTrigger className={styles.select}>
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Provinces</SelectItem>
                {Object.keys(locations).map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>City</label>
            <Select
              value={city}
              onValueChange={(value) => setCity(value === '__all__' ? '' : value)}
              disabled={!province}
            >
              <SelectTrigger className={styles.select}>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Cities</SelectItem>
                {province &&
                  locations[province]?.map((c: string, index: number) => (
                    <SelectItem key={`${c}-${index}`} value={c}>
                      {c}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="mobile-service" className={styles.label}>Service</label>
            <input
              id="mobile-service"
              type="text"
              placeholder="e.g., Braids, Nails"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <Checkbox
              id="mobile-offers"
              checked={offersMobile}
              onCheckedChange={(checked) => setOffersMobile(checked === true)}
              label="Offers Mobile Services"
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={handleNearMe}
            disabled={isGeoLoading}
            className={styles.nearMeButton}
          >
            {isGeoLoading || isReverseGeocoding ? (
              isReverseGeocoding ? '📍 Getting location...' : '📍 Finding...'
            ) : locationName?.city ? (
              `📍 Near ${locationName.city}`
            ) : (
              '📍 Near Me'
            )}
          </button>
          <button type="button" onClick={handleSearch} className={styles.searchButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search Salons
          </button>
        </div>
      </div>
    </div>
  );
}
