'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './ReviewsTab.module.css';
import { Review } from '@/types';
import { Button, EmptyState, StarRating, Alert } from '@/components/ui';
import StatusBadge from '@/components/StatusBadge';
import { ReviewsPanelSkeleton } from '@/components/Skeleton/Skeleton';

interface ReviewsData {
  pending: Review[];
  approved: Review[];
  needsResponse: Review[];
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [view, setView] = useState<'needsResponse' | 'approved' | 'pending'>('needsResponse');

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews/my-salon-reviews', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 404) {
          // No salon found - salon owner hasn't created salon yet
          setReviews({ pending: [], approved: [], needsResponse: [] });
          return;
        }
        throw new Error('Failed to fetch reviews');
      }

      const data = await res.json();
      // Ensure data has the correct structure
      setReviews({
        pending: data.pending || [],
        approved: data.approved || [],
        needsResponse: data.needsResponse || [],
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
      // Set empty reviews so UI doesn't crash
      setReviews({ pending: [], approved: [], needsResponse: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ response: responseText }),
      });

      if (!res.ok) throw new Error('Failed to submit response');

      toast.success('Response submitted successfully!');
      setRespondingTo(null);
      setResponseText('');
      fetchReviews();
    } catch {
      toast.error('Failed to submit response');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <ReviewsPanelSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Alert variant="error" title="Error Loading Reviews">
          <p className="mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchReviews}>
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (!reviews || (reviews.pending.length === 0 && reviews.approved.length === 0 && reviews.needsResponse.length === 0)) {
    return (
      <div className={styles.container}>
        <EmptyState
          icon="inbox"
          title="No Reviews Yet"
          description="Reviews will appear here once customers complete their bookings and leave feedback."
        />
      </div>
    );
  }

  const currentReviews = reviews[view];
  const emptyMessages = {
    needsResponse: {
      title: 'All caught up on replies',
      description: 'New customer feedback that needs a response will appear here.',
    },
    approved: {
      title: 'No approved reviews yet',
      description: 'Once approved reviews are published, you will be able to read and manage them here.',
    },
    pending: {
      title: 'Nothing waiting for approval',
      description: 'Reviews that still need moderation approval will appear in this tab.',
    },
  } satisfies Record<typeof view, { title: string; description: string }>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Reviews</h2>
        <div className={styles.stats}>
          <span className={styles.statItem}>
            Needs Response: <strong>{reviews.needsResponse.length}</strong>
          </span>
          <span className={styles.statItem}>
            Pending Approval: <strong>{reviews.pending.length}</strong>
          </span>
          <span className={styles.statItem}>
            Total Approved: <strong>{reviews.approved.length}</strong>
          </span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setView('needsResponse')}
          className={`${styles.tabButton} ${view === 'needsResponse' ? styles.activeTab : ''}`}
        >
          Needs Response ({reviews.needsResponse.length})
        </button>
        <button
          onClick={() => setView('approved')}
          className={`${styles.tabButton} ${view === 'approved' ? styles.activeTab : ''}`}
        >
          All Approved ({reviews.approved.length})
        </button>
        <button
          onClick={() => setView('pending')}
          className={`${styles.tabButton} ${view === 'pending' ? styles.activeTab : ''}`}
        >
          Pending Approval ({reviews.pending.length})
        </button>
      </div>

      <div className={styles.reviewsList}>
        {currentReviews.length === 0 ? (
          <div className={styles.emptyPanel}>
            <EmptyState
              icon="inbox"
              title={emptyMessages[view].title}
              description={emptyMessages[view].description}
            />
          </div>
        ) : (
          currentReviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.authorInfo}>
                  <strong>
                    {review.author.firstName} {review.author.lastName.charAt(0)}.
                  </strong>
                  {review.booking && (
                    <span className={styles.service}>
                      for {review.booking.service.title}
                    </span>
                  )}
                </div>
                <StarRating value={review.rating} size="sm" />
              </div>

              <p className={styles.comment}>{review.comment}</p>

              {review.salonOwnerResponse && (
                <div className={styles.response}>
                  <strong>Your Response:</strong>
                  <p>{review.salonOwnerResponse}</p>
                  <span className={styles.responseDate}>
                    Responded on{' '}
                    {new Date(review.salonOwnerRespondedAt!).toLocaleDateString()}
                  </span>
                </div>
              )}

              {!review.salonOwnerResponse && view === 'needsResponse' && (
                <>
                  {respondingTo === review.id ? (
                    <div className={styles.responseForm}>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your response to this review..."
                        className={styles.textarea}
                        rows={4}
                      />
                      <div className={styles.responseActions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRespondingTo(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRespond(review.id)}
                        >
                          Submit Response
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRespondingTo(review.id)}
                    >
                      Respond to this review
                    </Button>
                  )}
                </>
              )}

              <div className={styles.reviewFooter}>
                <span className={styles.date}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                {review.approvalStatus && (
                  <StatusBadge status={review.approvalStatus} size="sm" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
