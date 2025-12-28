'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import LoadingSpinner from './LoadingSpinner';
import styles from './AdminMediaReview.module.css';
import Image from 'next/image';

interface BeforeAfterPhoto {
  id: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  caption?: string;
  createdAt: string;
  salon: {
    id: string;
    name: string;
    city: string;
    province: string;
  };
  service?: {
    id: string;
    title: string;
  };
}

interface ServiceVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  caption?: string;
  createdAt: string;
  salon: {
    id: string;
    name: string;
    city: string;
    province: string;
    planCode?: string;
  };
  service?: {
    id: string;
    title: string;
  };
}

type MediaType = 'photos' | 'videos';

export default function AdminMediaReview() {
  const { data: session } = useSession();
  const [mediaType, setMediaType] = useState<MediaType>('photos');
  const [photos, setPhotos] = useState<BeforeAfterPhoto[]>([]);
  const [videos, setVideos] = useState<ServiceVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterQuery, setFilterQuery] = useState('');

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchPendingMedia();
  }, [mediaType]);

  const fetchPendingMedia = async () => {
    setIsLoading(true);
    try {
      const endpoint = mediaType === 'photos'
        ? '/api/admin/before-after/pending'
        : '/api/admin/videos/pending';

      const authHeaders: Record<string, string> = session?.backendJwt
        ? { Authorization: `Bearer ${session.backendJwt}` }
        : {};

      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: authHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch pending media:', response.status, errorText);
        throw new Error(`Failed to fetch pending media (${response.status})`);
      }

      const data = await response.json();

      if (mediaType === 'photos') {
        setPhotos(data);
      } else {
        setVideos(data);
      }
    } catch (error) {
      toast.error('Failed to load pending media');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const endpoint = mediaType === 'photos'
        ? `/api/admin/before-after/${id}/approve`
        : `/api/admin/videos/${id}/approve`;

      const authHeaders: Record<string, string> = session?.backendJwt
        ? { Authorization: `Bearer ${session.backendJwt}` }
        : {};

      const response = await fetch(endpoint, {
        method: 'PATCH',
        credentials: 'include',
        headers: authHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to approve:', response.status, errorText);
        throw new Error(`Failed to approve (${response.status})`);
      }

      toast.success(`${mediaType === 'photos' ? 'Photos' : 'Video'} approved successfully!`);
      fetchPendingMedia();
    } catch (error) {
      toast.error('Failed to approve media');
      console.error(error);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const endpoint = mediaType === 'photos'
        ? `/api/admin/before-after/${id}/reject`
        : `/api/admin/videos/${id}/reject`;

      const authHeaders: Record<string, string> = session?.backendJwt
        ? { Authorization: `Bearer ${session.backendJwt}` }
        : {};

      const response = await fetch(endpoint, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to reject:', response.status, errorText);
        throw new Error(`Failed to reject (${response.status})`);
      }

      toast.success(`${mediaType === 'photos' ? 'Photos' : 'Video'} rejected`);
      setRejectingId(null);
      setRejectionReason('');
      fetchPendingMedia();
    } catch (error) {
      toast.error('Failed to reject media');
      console.error(error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const currentItems = mediaType === 'photos' ? photos : videos;
  const q = filterQuery.trim().toLowerCase();
  const filteredPhotos = q ? photos.filter(p =>
    p.salon.name.toLowerCase().includes(q) ||
    p.salon.city.toLowerCase().includes(q) ||
    (p.service?.title?.toLowerCase().includes(q) ?? false) ||
    (p.caption?.toLowerCase().includes(q) ?? false)
  ) : photos;
  const filteredVideos = q ? videos.filter(v =>
    v.salon.name.toLowerCase().includes(q) ||
    v.salon.city.toLowerCase().includes(q) ||
    (v.service?.title?.toLowerCase().includes(q) ?? false) ||
    (v.caption?.toLowerCase().includes(q) ?? false)
  ) : videos;
  const displayItems = mediaType === 'photos' ? filteredPhotos : filteredVideos;
  const isEmpty = displayItems.length === 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Media Review</h2>
        <div className={styles.tabs}>
          <button
            className={mediaType === 'photos' ? styles.activeTab : styles.tab}
            onClick={() => setMediaType('photos')}
          >
            Before/After Photos ({photos.length})
          </button>
          <button
            className={mediaType === 'videos' ? styles.activeTab : styles.tab}
            onClick={() => setMediaType('videos')}
          >
            Videos ({videos.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter by salon name, city, service..."
          className={styles.filterInput}
        />
        <span className={styles.filterCount}>
          Showing {displayItems.length} of {currentItems.length}
        </span>
      </div>

      {isEmpty ? (
        <div className={styles.empty}>
          <p>No pending {mediaType} to review</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {mediaType === 'photos' && filteredPhotos.map((photo) => (
            <div key={photo.id} className={styles.card}>
              <div className={styles.imageGrid}>
                <div className={styles.imageWrapper}>
                  <p className={styles.label}>Before</p>
                  <Image
                    src={photo.beforeImageUrl}
                    alt="Before"
                    width={300}
                    height={300}
                    className={styles.image}
                  />
                </div>
                <div className={styles.imageWrapper}>
                  <p className={styles.label}>After</p>
                  <Image
                    src={photo.afterImageUrl}
                    alt="After"
                    width={300}
                    height={300}
                    className={styles.image}
                  />
                </div>
              </div>
              <div className={styles.info}>
                <h3>{photo.salon.name}</h3>
                <p className={styles.location}>{photo.salon.city}, {photo.salon.province}</p>
                {photo.service && <p className={styles.service}>Service: {photo.service.title}</p>}
                {photo.caption && <p className={styles.caption}>{photo.caption}</p>}
                <p className={styles.date}>Uploaded: {new Date(photo.createdAt).toLocaleDateString()}</p>
              </div>
              <div className={styles.actions}>
                {rejectingId === photo.id ? (
                  <div className={styles.rejectForm}>
                    <textarea
                      placeholder="Rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className={styles.textarea}
                    />
                    <div className={styles.rejectActions}>
                      <button onClick={() => handleReject(photo.id)} className={styles.confirmReject}>
                        Confirm Reject
                      </button>
                      <button onClick={() => {
                        setRejectingId(null);
                        setRejectionReason('');
                      }} className={styles.cancel}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => handleApprove(photo.id)} className={styles.approve}>
                      Approve
                    </button>
                    <button onClick={() => setRejectingId(photo.id)} className={styles.reject}>
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {mediaType === 'videos' && filteredVideos.map((video) => {
            return (
              <div key={video.id} className={styles.card}>
                <div className={styles.videoWrapper}>
                  <video
                    src={video.videoUrl}
                    className={styles.video}
                    controls
                    playsInline
                  />
                </div>
                <div className={styles.info}>
                  <h3>{video.salon.name}</h3>
                  <p className={styles.location}>{video.salon.city}, {video.salon.province}</p>
                  {video.service && <p className={styles.service}>Service: {video.service.title}</p>}
                  {video.caption && <p className={styles.caption}>{video.caption}</p>}
                  <p className={styles.duration}>Duration: {video.duration}s</p>
                  <p className={styles.date}>Uploaded: {new Date(video.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.actions}>
                  {rejectingId === video.id ? (
                    <div className={styles.rejectForm}>
                      <textarea
                        placeholder="Rejection reason..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className={styles.textarea}
                      />
                      <div className={styles.rejectActions}>
                        <button onClick={() => handleReject(video.id)} className={styles.confirmReject}>
                          Confirm Reject
                        </button>
                        <button onClick={() => {
                          setRejectingId(null);
                          setRejectionReason('');
                        }} className={styles.cancel}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleApprove(video.id)} className={styles.approve}>
                        Approve
                      </button>
                      <button onClick={() => setRejectingId(video.id)} className={styles.reject}>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
