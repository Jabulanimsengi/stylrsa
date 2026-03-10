'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trend } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import TrendCard from '@/components/TrendCard/TrendCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageNav from '@/components/PageNav';
import { toast } from 'react-toastify';
import styles from './MyTrendsPage.module.css';

export default function MyTrendsPage() {
  const router = useRouter();
  const { authStatus, isLoading: authLoading } = useAuth();
  const [likedTrends, setLikedTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && authStatus !== 'authenticated') {
      toast.info('Please log in to view your liked trends');
      router.push('/');
      return;
    }

    if (authStatus === 'authenticated') {
      fetchLikedTrends();
    }
  }, [authStatus, authLoading, router]);

  const fetchLikedTrends = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/trends/my/likes', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setLikedTrends(data);
      } else {
        toast.error('Failed to load liked trends');
      }
    } catch {
      toast.error('Error loading liked trends');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlike = (trendId: string) => {
    // Optimistic update
    setLikedTrends((prev) => prev.filter((trend) => trend.id !== trendId));
  };

  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageNav />

      <div className={styles.header}>
        <h1 className={styles.title}>My Liked Trends</h1>
        <p className={styles.subtitle}>
          {likedTrends.length === 0
            ? 'You haven\'t liked any trends yet'
            : `${likedTrends.length} ${likedTrends.length === 1 ? 'trend' : 'trends'} saved`}
        </p>
      </div>

      {likedTrends.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>Love</div>
          <h2>No Liked Trends Yet</h2>
          <p>Start exploring trends and save your favorites!</p>
          <button onClick={() => router.push('/trends')} className={styles.browseButton}>
            Browse Trends
          </button>
        </div>
      ) : (
        <div className={styles.trendsGrid}>
          {likedTrends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} onLike={handleUnlike} />
          ))}
        </div>
      )}
    </div>
  );
}


