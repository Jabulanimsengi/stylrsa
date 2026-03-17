'use client';

import { useState, useEffect, useCallback, useDeferredValue, useRef, useId } from 'react';
import {
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaBolt,
  FaStar,
  FaSlidersH,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import styles from './FilterBar.module.css';
import { toFriendlyMessage } from '@/lib/errors';
import { getCategoriesCached, getLocationsCached } from '@/lib/resourceCache';
import { apiJson } from '@/lib/api';
import { useGeolocation } from '@/hooks/useGeolocation';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';

export interface FilterValues {
  province: string;
  city: string;
  service: string;
  category: string;
  offersMobile: boolean;
  sortBy: string;
  openNow: boolean;
  priceMin: string;
  priceMax: string;
  lat?: number | string | null;
  lon?: number | string | null;
  radius?: number | null;
}

type LocationsByProvince = Record<string, string[]>;

interface ServiceSuggestion {
  id: string;
  title: string;
  salon?: string;
}

type AutocompletePayload = Array<{
  id?: string;
  title?: string | null;
  salon?: { name?: string | null } | null;
  salonName?: string | null;
}>;

interface FilterBarProps {
  onSearch: (filters: FilterValues) => void;
  initialFilters?: Partial<FilterValues>;
  isHomePage?: boolean;
  autoSearch?: boolean;
  showSearchButton?: boolean;
  isSearching?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export default function FilterBar({
  onSearch,
  initialFilters = {},
  isHomePage = false,
  autoSearch,
  showSearchButton = isHomePage,
  isSearching = false,
  orientation = 'horizontal',
}: FilterBarProps) {
  const serviceInputId = useId();
  const suggestionsId = useId();
  const categoryLabelId = useId();
  const categoryTriggerId = useId();
  const provinceLabelId = useId();
  const provinceTriggerId = useId();
  const cityLabelId = useId();
  const cityTriggerId = useId();
  const advancedFiltersId = useId();
  const sortLabelId = useId();
  const sortTriggerId = useId();
  const radiusLabelId = useId();
  const radiusTriggerId = useId();
  const priceMinId = useId();
  const priceMaxId = useId();
  const [locations, setLocations] = useState<LocationsByProvince>({});
  const [province, setProvince] = useState(initialFilters.province || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [serviceSearch, setServiceSearch] = useState(initialFilters.service || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [offersMobile, setOffersMobile] = useState(initialFilters.offersMobile ?? false);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || '');
  const [openNow, setOpenNow] = useState(initialFilters.openNow ?? false);
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin || '');
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax || '');
  const [radius, setRadius] = useState<number | null>(initialFilters.radius ?? null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [serviceSuggestions, setServiceSuggestions] = useState<ServiceSuggestion[]>([]);
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const deferredServiceSearch = useDeferredValue(serviceSearch);
  const enableAutoSearch = autoSearch ?? !isHomePage;
  const lastEmittedFiltersRef = useRef('');
  const fetchedStaticDataRef = useRef(false);
  const coordinatesProcessedRef = useRef<string | null>(null);

  const {
    coordinates,
    locationName,
    isLoading: isGeoLoading,
    isReverseGeocoding,
    error: geoError,
    requestLocation,
    source: locationSource,
  } = useGeolocation();

  const initialProvince = initialFilters.province ?? '';
  const initialCity = initialFilters.city ?? '';
  const initialService = initialFilters.service ?? '';
  const initialCategory = initialFilters.category ?? '';
  const initialOffersMobile = initialFilters.offersMobile ?? false;
  const initialSortBy = initialFilters.sortBy ?? '';
  const initialOpenNow = initialFilters.openNow ?? false;
  const initialPriceMin = initialFilters.priceMin ?? '';
  const initialPriceMax = initialFilters.priceMax ?? '';
  const initialRadius = initialFilters.radius ?? null;

  useEffect(() => {
    if (fetchedStaticDataRef.current) {
      return;
    }
    fetchedStaticDataRef.current = true;

    let cancelled = false;

    (async () => {
      const [locationsResult, categoriesResult] = await Promise.allSettled([
        getLocationsCached(),
        getCategoriesCached(),
      ]);

      if (cancelled) {
        return;
      }

      if (locationsResult.status === 'fulfilled' && locationsResult.value && typeof locationsResult.value === 'object') {
        setLocations(locationsResult.value);
      } else if (locationsResult.status === 'rejected') {
        console.debug('Locations load failed:', toFriendlyMessage(locationsResult.reason));
      }

      if (categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value)) {
        setCategories(
          categoriesResult.value
            .filter(
              (item): item is { id: string; name: string } =>
                Boolean(item && typeof item.id === 'string' && typeof item.name === 'string'),
            )
            .map((item) => ({ id: item.id, name: item.name })),
        );
      } else if (categoriesResult.status === 'rejected') {
        console.debug('Categories load failed:', toFriendlyMessage(categoriesResult.reason));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const buildFilters = useCallback(
    (): FilterValues => ({
      province,
      city,
      service: serviceSearch,
      category,
      offersMobile,
      sortBy,
      openNow,
      priceMin,
      priceMax,
      lat: coordinates?.latitude ?? null,
      lon: coordinates?.longitude ?? null,
      radius,
    }),
    [province, city, serviceSearch, category, offersMobile, sortBy, openNow, priceMin, priceMax, coordinates, radius],
  );

  const triggerSearch = useCallback(
    (filters: FilterValues, force = false) => {
      const serialized = JSON.stringify(filters);
      if (!force && serialized === lastEmittedFiltersRef.current) {
        return;
      }

      lastEmittedFiltersRef.current = serialized;
      setShowSuggestions(false);
      onSearch(filters);
    },
    [onSearch],
  );

  useEffect(() => {
    if (!enableAutoSearch) {
      return;
    }

    const handler = setTimeout(() => {
      triggerSearch(buildFilters());
    }, 300);

    return () => clearTimeout(handler);
  }, [buildFilters, enableAutoSearch, triggerSearch]);

  useEffect(() => {
    if (!coordinates || !enableAutoSearch) {
      return;
    }

    const coordKey = `${coordinates.latitude},${coordinates.longitude}`;
    if (coordinatesProcessedRef.current === coordKey) {
      return;
    }

    coordinatesProcessedRef.current = coordKey;
    const filters = buildFilters();

    if (!filters.sortBy) {
      filters.sortBy = 'distance';
      setSortBy('distance');
    }

    triggerSearch(filters, true);
  }, [coordinates, enableAutoSearch, buildFilters, triggerSearch]);

  const handleSearchClick = () => {
    triggerSearch(buildFilters(), true);
  };

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    if (typeof window !== 'undefined' && (window as Window & { gtag?: (...args: unknown[]) => void }).gtag) {
      window.gtag?.('event', 'geolocation_requested', {
        event_category: 'user_interaction',
        event_label: 'filter_bar_near_me',
        page_location: window.location.pathname,
      });
    }

    requestLocation();
  };

  useEffect(() => {
    const query = deferredServiceSearch.trim();
    if (query.length <= 1) {
      setServiceSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;
    setIsServiceLoading(true);
    const controller = new AbortController();

    apiJson<AutocompletePayload>(`/api/services/autocomplete?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((data) => {
        if (cancelled || !Array.isArray(data)) {
          return;
        }

        const suggestions = data.reduce<ServiceSuggestion[]>((acc, item, index) => {
          const title = (item?.title ?? '').trim();
          if (!title) {
            return acc;
          }

          const id = item?.id ?? `suggestion-${index}`;
          const salonName = item?.salon?.name ?? item?.salonName ?? undefined;
          acc.push({ id, title, salon: salonName ?? undefined });
          return acc;
        }, []);

        setServiceSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      })
      .catch(() => {
        if (!cancelled) {
          setServiceSuggestions([]);
          setShowSuggestions(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsServiceLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [deferredServiceSearch]);

  useEffect(() => {
    setProvince((prev) => (prev === initialProvince ? prev : initialProvince));
    setCity((prev) => (prev === initialCity ? prev : initialCity));
    setServiceSearch((prev) => (prev === initialService ? prev : initialService));
    setCategory((prev) => (prev === initialCategory ? prev : initialCategory));
    setOffersMobile((prev) => (prev === initialOffersMobile ? prev : initialOffersMobile));
    setSortBy((prev) => (prev === initialSortBy ? prev : initialSortBy));
    setOpenNow((prev) => (prev === initialOpenNow ? prev : initialOpenNow));
    setPriceMin((prev) => (prev === initialPriceMin ? prev : initialPriceMin));
    setPriceMax((prev) => (prev === initialPriceMax ? prev : initialPriceMax));
    setRadius((prev) => (prev === initialRadius ? prev : initialRadius));
  }, [
    initialProvince,
    initialCity,
    initialService,
    initialCategory,
    initialOffersMobile,
    initialSortBy,
    initialOpenNow,
    initialPriceMin,
    initialPriceMax,
    initialRadius,
  ]);

  useEffect(() => {
    if (!isSearching) {
      setShowSuggestions(false);
    }
  }, [isSearching]);

  const handleQuickFilter = (filterType: 'openNow' | 'nearMe' | 'topRated' | 'mobile') => {
    const filters = buildFilters();

    switch (filterType) {
      case 'openNow':
        filters.openNow = !openNow;
        setOpenNow(!openNow);
        break;
      case 'nearMe':
        handleFindNearby();
        return;
      case 'topRated':
        filters.sortBy = sortBy === 'top_rated' ? '' : 'top_rated';
        setSortBy(sortBy === 'top_rated' ? '' : 'top_rated');
        break;
      case 'mobile':
        filters.offersMobile = !offersMobile;
        setOffersMobile(!offersMobile);
        break;
    }

    triggerSearch(filters, true);
  };

  const locationStatusTone = isGeoLoading
    ? styles.locationStatusLoading
    : coordinates
      ? styles.locationStatusSuccess
      : styles.locationStatusWarning;
  const showLocationStatus = isGeoLoading || coordinates || geoError;

  return (
    <>
      <div className={styles.quickFilters}>
        <button
          type="button"
          onClick={() => handleQuickFilter('openNow')}
          className={`${styles.quickFilterBtn} ${openNow ? styles.active : ''}`}
          aria-pressed={openNow}
        >
          <FaBolt aria-hidden="true" /> Open Now
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter('nearMe')}
          className={styles.quickFilterBtn}
        >
          <FaMapMarkerAlt aria-hidden="true" /> Use My Location
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter('mobile')}
          className={`${styles.quickFilterBtn} ${offersMobile ? styles.active : ''}`}
          aria-pressed={offersMobile}
        >
          <FaBolt aria-hidden="true" /> Mobile
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter('topRated')}
          className={`${styles.quickFilterBtn} ${sortBy === 'top_rated' ? styles.active : ''}`}
          aria-pressed={sortBy === 'top_rated'}
        >
          <FaStar aria-hidden="true" /> Top Rated
        </button>
      </div>

      <div
        className={`${styles.filterBar} ${isHomePage ? styles.homeFilterBar : ''} ${
          orientation === 'vertical' ? styles.vertical : ''
        }`}
      >
        <div className={styles.filterFields}>
          <div className={styles.filterGroup}>
            <label htmlFor={serviceInputId}>Service</label>
            <input
              id={serviceInputId}
              type="text"
              placeholder="Braids, nails, locs..."
              value={serviceSearch}
              onChange={(event) => {
                const value = event.target.value;
                setServiceSearch(value);
                if (value.trim().length <= 1) {
                  setServiceSuggestions([]);
                  setShowSuggestions(false);
                }
              }}
              className={styles.filterInput}
              onFocus={() => {
                if (serviceSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 120);
              }}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls={showSuggestions ? suggestionsId : undefined}
              aria-describedby={showLocationStatus ? undefined : undefined}
            />
            {showSuggestions && (
              <ul id={suggestionsId} className={styles.suggestionsList} role="listbox" aria-label="Service suggestions">
                <li className={styles.suggestionsHeader}>
                  <button
                    type="button"
                    className={styles.dismissButton}
                    onClick={() => setShowSuggestions(false)}
                    aria-label="Dismiss suggestions"
                  >
                    x
                  </button>
                </li>
                {isServiceLoading && (
                  <li className={`${styles.suggestionItem} ${styles.suggestionLoading}`} role="status" aria-live="polite">Searching...</li>
                )}
                {!isServiceLoading && serviceSuggestions.length === 0 && (
                  <li className={`${styles.suggestionItem} ${styles.suggestionEmpty}`} role="status">No matches found</li>
                )}
                {!isServiceLoading &&
                  serviceSuggestions.map((suggestion) => (
                    <li key={suggestion.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        className={styles.suggestionItem}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          const next = { ...buildFilters(), service: suggestion.title };
                          setServiceSearch(suggestion.title);
                          setShowSuggestions(false);
                          triggerSearch(next, true);
                        }}
                        aria-selected={serviceSearch === suggestion.title}
                        aria-label={suggestion.salon ? `${suggestion.title}, ${suggestion.salon}` : suggestion.title}
                      >
                        <span className={styles.suggestionTitle}>{suggestion.title}</span>
                        {suggestion.salon && <span className={styles.suggestionMeta}>{suggestion.salon}</span>}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className={styles.filterGroup}>
            <label id={categoryLabelId}>Category</label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value === '__all__' ? '' : value)}
            >
              <SelectTrigger id={categoryTriggerId} aria-labelledby={categoryLabelId} className={styles.filterSelect}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Categories</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label id={provinceLabelId}>Province</label>
            <Select
              value={province}
              onValueChange={(value) => {
                setProvince(value === '__all__' ? '' : value);
                setCity('');
              }}
            >
              <SelectTrigger id={provinceTriggerId} aria-labelledby={provinceLabelId} className={styles.filterSelect}>
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Provinces</SelectItem>
                {Object.keys(locations).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label id={cityLabelId}>Town or City</label>
            <Select
              value={city}
              onValueChange={(value) => setCity(value === '__all__' ? '' : value)}
              disabled={!province}
            >
              <SelectTrigger id={cityTriggerId} aria-labelledby={cityLabelId} className={styles.filterSelect}>
                <SelectValue placeholder={province ? 'All Cities' : 'Select a province first'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Cities</SelectItem>
                {locations[province]?.map((item, index) => (
                  <SelectItem key={`${item}-${index}`} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className={styles.advancedFilters} id={advancedFiltersId}>
            <div className={styles.filterGroup}>
              <label id={sortLabelId}>Sort By</label>
              <Select
                value={sortBy || '__default__'}
                onValueChange={(value) => setSortBy(value === '__default__' ? '' : value)}
              >
                <SelectTrigger id={sortTriggerId} aria-labelledby={sortLabelId} className={styles.filterSelect}>
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__default__">Default</SelectItem>
                  <SelectItem value="top_rated">Top Rated</SelectItem>
                  <SelectItem value="distance">Nearest</SelectItem>
                  <SelectItem value="price">Lowest Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {coordinates && (
              <div className={styles.filterGroup}>
                <label id={radiusLabelId}>Within</label>
                <Select
                  value={radius?.toString() || '__any__'}
                  onValueChange={(value) => setRadius(value === '__any__' ? null : Number(value))}
                >
                  <SelectTrigger id={radiusTriggerId} aria-labelledby={radiusLabelId} className={styles.filterSelect}>
                    <SelectValue placeholder="Any distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">Any distance</SelectItem>
                    <SelectItem value="5">5 km</SelectItem>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="25">25 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                    <SelectItem value="100">100 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className={styles.filterGroup}>
              <label htmlFor={priceMinId}>Price Range (R)</label>
              <div className={styles.priceRange}>
                <input
                  id={priceMinId}
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(event) => setPriceMin(event.target.value)}
                  className={styles.filterInput}
                  min={0}
                />
                <input
                  id={priceMaxId}
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                  className={styles.filterInput}
                  min={0}
                />
              </div>
            </div>
          </div>
        )}

        <div className={styles.utilityRow}>
          {showLocationStatus ? (
            <div className={`${styles.locationStatus} ${locationStatusTone}`} role="status" aria-live="polite">
              {isGeoLoading && !coordinates && (
                <>
                  <LoadingSpinner size="sm" inline />
                  <span className={styles.locationStatusText}>Detecting location...</span>
                </>
              )}
              {coordinates && !isGeoLoading && (
                <>
                  <FaMapMarkerAlt className={styles.iconSuccess} aria-hidden="true" />
                  <span className={styles.locationStatusText}>
                    {isReverseGeocoding
                      ? 'Getting location name...'
                      : locationName?.city
                        ? `${locationSource === 'ip' ? '~' : ''}Near ${locationName.city}${
                            locationName.province ? `, ${locationName.province}` : ''
                          }${locationSource === 'ip' ? ' (estimated)' : ''}`
                        : 'Showing nearby results'}
                  </span>
                </>
              )}
              {geoError && !coordinates && (
                <>
                  <FaExclamationTriangle className={styles.iconWarning} aria-hidden="true" />
                  <span className={styles.locationStatusText}>Using a broader default location</span>
                </>
              )}
            </div>
          ) : (
            <div className={styles.utilitySpacer} />
          )}

          <div className={styles.filterActions}>
            <button
              type="button"
              className={styles.moreFiltersToggle}
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              aria-expanded={showAdvancedFilters}
              aria-controls={advancedFiltersId}
            >
              <FaSlidersH aria-hidden="true" />
              {showAdvancedFilters ? 'Fewer Filters' : 'All Filters'}
              {showAdvancedFilters ? <FaChevronUp aria-hidden="true" /> : <FaChevronDown aria-hidden="true" />}
            </button>

            <button type="button" onClick={handleFindNearby} disabled={isGeoLoading} className={styles.geoButton}>
              {isGeoLoading ? 'Locating...' : 'Use My Location'}
            </button>

            {showSearchButton && (
              <button type="button" onClick={handleSearchClick} className={styles.searchButton} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
