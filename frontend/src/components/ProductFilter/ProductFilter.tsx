'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './ProductFilter.module.css';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Checkbox,
} from '@/components/ui';

export interface ProductFilterValues {
  search: string;
  category: string;
  priceMin: string;
  priceMax: string;
  inStock: boolean;
}

interface ProductFilterProps {
  initialValues?: Partial<ProductFilterValues>;
  categories?: string[];
  onChange: (values: ProductFilterValues) => void;
  isSubmitting?: boolean;
}

const DEFAULT_VALUES: ProductFilterValues = {
  search: '',
  category: '',
  priceMin: '',
  priceMax: '',
  inStock: false,
};

// Quick category chips for easy access
const QUICK_CATEGORIES = [
  { value: '', label: 'All', icon: '✨' },
  { value: 'Hair Pieces', label: 'Hair Pieces', icon: '💇' },
  { value: 'Hair Extensions', label: 'Extensions', icon: '✂️' },
  { value: 'Wigs', label: 'Wigs', icon: '👩' },
  { value: 'Hair Oils', label: 'Hair Oils', icon: '💧' },
  { value: 'Braiding Hair', label: 'Braiding', icon: '🎀' },
  { value: 'Nail Care', label: 'Nails', icon: '💅' },
  { value: 'Skincare', label: 'Skincare', icon: '🧴' },
];

export default function ProductFilter({
  initialValues = {},
  categories = [],
  onChange,
  isSubmitting = false,
}: ProductFilterProps) {
  const [values, setValues] = useState<ProductFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) {
      return categories;
    }
    return [
      'Hair Pieces',
      'Hair Oils',
      'Hair Extensions',
      'Wigs',
      'Braiding Hair',
      'Nail Care',
      'Skincare',
      'Styling Tools',
    ];
  }, [categories]);

  const emitChange = useCallback((next: Partial<ProductFilterValues>) => {
    const updated = { ...values, ...next };
    setValues(updated);
    onChange(updated);
  }, [values, onChange]);

  const hasActiveFilters = useMemo(() => {
    return values.category || values.priceMin || values.priceMax || values.inStock;
  }, [values]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (values.category) count++;
    if (values.priceMin || values.priceMax) count++;
    if (values.inStock) count++;
    return count;
  }, [values]);

  const handleClearFilters = useCallback(() => {
    const cleared = { ...DEFAULT_VALUES, search: values.search };
    setValues(cleared);
    onChange(cleared);
  }, [values.search, onChange]);

  const handleClearSearch = useCallback(() => {
    emitChange({ search: '' });
    searchInputRef.current?.focus();
  }, [emitChange]);

  const handleQuickCategory = useCallback((category: string) => {
    emitChange({ category });
  }, [emitChange]);

  // Close filters when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setIsFiltersExpanded(false);
      }
    };

    if (isFiltersExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isFiltersExpanded]);

  // Close filters on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFiltersExpanded(false);
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <section className={styles.filterSection} aria-label="Product filters">
      {/* Main Search Bar */}
      <div className={`${styles.searchContainer} ${isSearchFocused ? styles.searchFocused : ''}`}>
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
            id="product-search"
            type="text"
            className={styles.searchInput}
            placeholder="Search products..."
            value={values.search}
            onChange={(event) => emitChange({ search: event.target.value })}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {values.search && (
            <button
              type="button"
              className={styles.clearSearchBtn}
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

        {/* Filter Toggle Button (visible on all screens) */}
        <button
          type="button"
          className={`${styles.filterToggleBtn} ${isFiltersExpanded ? styles.active : ''} ${hasActiveFilters ? styles.hasFilters : ''}`}
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          aria-expanded={isFiltersExpanded}
          aria-controls="advanced-filters"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className={styles.filterBtnText}>Filters</span>
          {activeFilterCount > 0 && (
            <span className={styles.filterBadge}>{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Quick Category Chips */}
      <div className={styles.quickFilters}>
        <div className={styles.chipScroller}>
          {QUICK_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`${styles.categoryChip} ${values.category === cat.value ? styles.active : ''}`}
              onClick={() => handleQuickCategory(cat.value)}
            >
              <span className={styles.chipIcon}>{cat.icon}</span>
              <span className={styles.chipLabel}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div
        ref={filtersRef}
        id="advanced-filters"
        className={`${styles.advancedFilters} ${isFiltersExpanded ? styles.expanded : ''}`}
      >
        <div className={styles.filtersHeader}>
          <h3 className={styles.filtersTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Advanced Filters
          </h3>
          <button
            type="button"
            className={styles.closeFiltersBtn}
            onClick={() => setIsFiltersExpanded(false)}
            aria-label="Close filters"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.filtersGrid}>
          {/* Category Select */}
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Category</label>
            <Select
              value={values.category}
              onValueChange={(value) => emitChange({ category: value === '__all__' ? '' : value })}
            >
              <SelectTrigger className={styles.selectTrigger}>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All categories</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Price Range (R)</label>
            <div className={styles.priceInputs}>
              <div className={styles.priceInputWrapper}>
                <span className={styles.pricePrefix}>R</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  className={styles.priceInput}
                  value={values.priceMin}
                  onChange={(event) => emitChange({ priceMin: event.target.value })}
                />
              </div>
              <span className={styles.priceSeparator}>—</span>
              <div className={styles.priceInputWrapper}>
                <span className={styles.pricePrefix}>R</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  className={styles.priceInput}
                  value={values.priceMax}
                  onChange={(event) => emitChange({ priceMax: event.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Availability</label>
            <div className={styles.checkboxWrapper}>
              <Checkbox
                id="product-instock"
                checked={values.inStock}
                onCheckedChange={(checked) => emitChange({ inStock: checked === true })}
                label="Only show in-stock items"
              />
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className={styles.filterActions}>
          {hasActiveFilters && (
            <button
              type="button"
              className={styles.clearFiltersBtn}
              onClick={handleClearFilters}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear Filters
            </button>
          )}
          <button
            type="button"
            className={styles.applyFiltersBtn}
            disabled={isSubmitting}
            onClick={() => {
              onChange(values);
              setIsFiltersExpanded(false);
            }}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner} />
                Filtering...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Apply Filters
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isFiltersExpanded && <div className={styles.overlay} onClick={() => setIsFiltersExpanded(false)} />}
    </section>
  );
}
