'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './MobileFilter.module.css';
import { getLocationsCached } from '@/lib/resourceCache';
import { FilterValues } from '@/components/FilterBar/FilterBar';
import MobileCloseButton from '@/components/MobileCloseButton';
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
  initialFilters?: Partial<FilterValues>;
}

type LocationsByProvince = Record<string, string[]>;

export default function MobileFilter({ onSearch, onClose, initialFilters = {} }: MobileFilterProps) {
  const [locations, setLocations] = useState<LocationsByProvince>({});
  const [province, setProvince] = useState(initialFilters.province || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [service, setService] = useState(initialFilters.service || '');
  const [offersMobile, setOffersMobile] = useState(initialFilters.offersMobile ?? false);
  const fetchedLocationsRef = useRef(false);

  useEffect(() => {
    const originalOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

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

  useEffect(() => {
    setProvince(initialFilters.province || '');
    setCity(initialFilters.city || '');
    setService(initialFilters.service || '');
    setOffersMobile(initialFilters.offersMobile ?? false);
  }, [
    initialFilters.city,
    initialFilters.offersMobile,
    initialFilters.province,
    initialFilters.service,
  ]);

  const handleSearch = () => {
    const filters: FilterValues = {
      province,
      city,
      service,
      category: '',
      offersMobile,
      sortBy: initialFilters.sortBy || '',
      openNow: false,
      priceMin: '',
      priceMax: '',
      lat: initialFilters.lat ?? null,
      lon: initialFilters.lon ?? null,
    };

    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setProvince('');
    setCity('');
    setService('');
    setOffersMobile(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const hasActiveFilters = Boolean(province || city || service || offersMobile);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>Refine Results</p>
            <h2 className={styles.title}>Filter salons</h2>
          </div>
          <MobileCloseButton onClick={onClose} className={styles.closeButton} label="Close filters" />
        </div>

        <div className={styles.content}>
          <div className={styles.filterGroup}>
            <label htmlFor="mobile-service" className={styles.label}>Service</label>
            <input
              id="mobile-service"
              type="text"
              placeholder="Braids, nails, barber..."
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.filterGrid}>
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
                    locations[province]?.map((entry: string, index: number) => (
                      <SelectItem key={`${entry}-${index}`} value={entry}>
                        {entry}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={styles.optionCard}>
            <div className={styles.optionCopy}>
              <p className={styles.optionTitle}>Mobile service</p>
              <p className={styles.optionText}>Only show salons that can travel to the client.</p>
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
        </div>

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            {hasActiveFilters && (
              <button type="button" onClick={handleReset} className={styles.resetButton}>
                Reset
              </button>
            )}
          </div>

          <button type="button" onClick={handleSearch} className={styles.searchButton}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
