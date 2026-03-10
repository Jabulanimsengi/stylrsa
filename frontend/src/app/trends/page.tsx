'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trend, TrendCategory, AgeGroup } from '@/types';
import TrendCard from '@/components/TrendCard/TrendCard';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import PageNav from '@/components/PageNav';
import { toast } from 'react-toastify';
import styles from './TrendsPage.module.css';

const CATEGORIES: { value: TrendCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'HAIRSTYLE', label: 'Hairstyles' },
  { value: 'BRAIDS', label: 'Braids' },
  { value: 'LOCS', label: 'Locs' },
  { value: 'EXTENSIONS', label: 'Extensions' },
  { value: 'NAILS', label: 'Nails' },
  { value: 'SPA', label: 'Spa' },
  { value: 'MAKEUP', label: 'Makeup' },
  { value: 'SKINCARE', label: 'Skincare' },
  { value: 'MASSAGE', label: 'Massage' },
  { value: 'BARBERING', label: 'Barbering' },
];

const AGE_GROUPS: { value: AgeGroup | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Ages' },
  { value: 'KIDS', label: 'Kids (0-12)' },
  { value: 'TEENS', label: 'Teens (13-17)' },
  { value: 'YOUNG_ADULTS', label: 'Young Adults (18-35)' },
  { value: 'ADULTS', label: 'Adults (36-55)' },
  { value: 'MATURE_ADULTS', label: 'Mature Adults (55+)' },
  { value: 'ALL_AGES', label: 'All Ages' },
];

function TrendsPageContent() {
  const searchParams = useSearchParams();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory | 'ALL'>('ALL');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | 'ALL'>('ALL');

  useEffect(() => {
    // Get category from URL if present
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== 'ALL') {
      setSelectedCategory(categoryParam as TrendCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTrends();
  }, [selectedCategory]);

  const fetchTrends = async () => {
    setIsLoading(true);
    try {
      const url = selectedCategory === 'ALL'
        ? '/api/trends'
        : `/api/trends/category/${selectedCategory}`;

      const res = await fetch(url, { credentials: 'include' });

      if (res.ok) {
        const data = await res.json();

        // If fetching all trends (grouped by category), flatten the data
        let trendsList: Trend[];
        if (selectedCategory === 'ALL') {
          trendsList = Object.values(data).flat() as Trend[];
        } else {
          trendsList = data;
        }
        
        // Sort by view count (descending - most views first)
        trendsList.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        setTrends(trendsList);
      } else {
        toast.error('Failed to load trends');
      }
    } catch (error) {
      toast.error('Error loading trends');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrends = React.useMemo(() => {
    let filtered = selectedAgeGroup === 'ALL'
      ? trends
      : trends.filter((trend) => trend.ageGroups.includes(selectedAgeGroup as AgeGroup));
    
    // Sort by view count (descending - most views first)
    return filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }, [trends, selectedAgeGroup]);

  return (
    <div className={styles.container}>
      <PageNav />

      <div className={styles.header}>
        <h1 className={styles.title}>Trending Styles</h1>
        <p className={styles.subtitle}>
          Discover the latest beauty trends and find salons near you
        </p>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Category</label>
          <div className={styles.filterButtons}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`${styles.filterButton} ${selectedCategory === cat.value ? styles.active : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label>Age Group</label>
          <div className={styles.filterButtons}>
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag.value}
                onClick={() => setSelectedAgeGroup(ag.value)}
                className={`${styles.filterButton} ${selectedAgeGroup === ag.value ? styles.active : ''}`}
              >
                {ag.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <LoadingSpinner size="md" color="primary" />
        </div>
      ) : filteredTrends.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No trends found</h3>
          <p>Try adjusting your filters or check back later for new trends!</p>
        </div>
      ) : (
        <div className={styles.trendsGrid}>
          {filteredTrends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrendsPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="md" color="primary" />}>
      <TrendsPageContent />
    </Suspense>
  );
}
