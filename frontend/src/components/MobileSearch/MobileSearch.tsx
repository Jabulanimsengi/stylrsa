'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './MobileSearch.module.css';
import MobileFilter from './MobileFilter';
import { type FilterValues } from '@/components/FilterBar/FilterBar';
import { useGeolocation } from '@/hooks/useGeolocation';

interface MobileSearchProps {
  onSearch: (filters: FilterValues) => void;
  initialQuery?: string;
}

// Quick filter options for fast access
const QUICK_FILTERS = [
  { id: 'all', label: 'All', emoji: '✨', filter: {} },
  { id: 'near-me', label: 'Near Me', emoji: '📍', filter: { sortBy: 'distance' } },
  { id: 'open-now', label: 'Open Now', emoji: '🕐', filter: { openNow: true } },
  { id: 'mobile', label: 'Mobile', emoji: '🚗', filter: { offersMobile: true } },
  { id: 'braids', label: 'Braids', emoji: '💇', filter: { service: 'braids' } },
  { id: 'nails', label: 'Nails', emoji: '💅', filter: { service: 'nails' } },
  { id: 'makeup', label: 'Makeup', emoji: '💄', filter: { service: 'makeup' } },
  { id: 'barber', label: 'Barber', emoji: '✂️', filter: { service: 'barber' } },
];

export default function MobileSearch({ onSearch, initialQuery = '' }: MobileSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { coordinates, requestLocation, isLoading: isGeoLoading } = useGeolocation();

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      province: '',
      city: '',
      service: searchQuery,
      category: '',
      offersMobile: false,
      sortBy: '',
      openNow: false,
      priceMin: '',
      priceMax: '',
      lat: null,
      lon: null,
    });
    searchInputRef.current?.blur();
  }, [searchQuery, onSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const handleQuickFilter = useCallback((filterId: string, filter: Partial<FilterValues>) => {
    setActiveQuickFilter(filterId);

    // Handle "Near Me" specially
    if (filterId === 'near-me') {
      if (coordinates) {
        onSearch({
          province: '',
          city: '',
          service: '',
          category: '',
          offersMobile: false,
          sortBy: 'distance',
          openNow: false,
          priceMin: '',
          priceMax: '',
          lat: coordinates.latitude,
          lon: coordinates.longitude,
        });
      } else {
        requestLocation();
      }
      return;
    }

    // Apply quick filter
    onSearch({
      province: '',
      city: '',
      service: filter.service || '',
      category: filter.category || '',
      offersMobile: filter.offersMobile || false,
      sortBy: filter.sortBy || '',
      openNow: filter.openNow || false,
      priceMin: '',
      priceMax: '',
      lat: null,
      lon: null,
    });
  }, [coordinates, requestLocation, onSearch]);

  // When geolocation succeeds, trigger the near-me search
  useEffect(() => {
    if (activeQuickFilter === 'near-me' && coordinates) {
      onSearch({
        province: '',
        city: '',
        service: '',
        category: '',
        offersMobile: false,
        sortBy: 'distance',
        openNow: false,
        priceMin: '',
        priceMax: '',
        lat: coordinates.latitude,
        lon: coordinates.longitude,
      });
    }
  }, [coordinates, activeQuickFilter, onSearch]);

  return (
    <div className={styles.mobileSearchWrapper}>
      {/* Search Bar */}
      <form
        className={`${styles.searchContainer} ${isSearchFocused ? styles.focused : ''}`}
        onSubmit={handleSearchSubmit}
      >
        <div className={styles.searchInputWrapper}>
          <svg
            className={styles.searchIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search salons or services..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          type="button"
          className={styles.filterButton}
          onClick={handleOpenFilter}
          aria-label="Open filters"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
      </form>

      {/* Quick Filter Chips */}
      <div className={styles.quickFiltersContainer}>
        <div className={styles.quickFiltersScroll}>
          {QUICK_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.quickFilterChip} ${activeQuickFilter === item.id ? styles.active : ''}`}
              onClick={() => handleQuickFilter(item.id, item.filter)}
              disabled={item.id === 'near-me' && isGeoLoading}
            >
              <span className={styles.chipEmoji}>{item.emoji}</span>
              <span className={styles.chipLabel}>
                {item.id === 'near-me' && isGeoLoading ? 'Finding...' : item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <MobileFilter onSearch={onSearch} onClose={handleCloseFilter} />
      )}
    </div>
  );
}
