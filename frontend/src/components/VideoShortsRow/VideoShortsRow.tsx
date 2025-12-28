'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import styles from './VideoShortsRow.module.css';
import VideoPlayerModal from '../VideoPlayerModal/VideoPlayerModal';

interface VideoShort {
    id: string;
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    views: number;
}

interface VideoShortsRowProps {
    salonId: string;
    onVideoClick?: (video: VideoShort) => void;
}

export default function VideoShortsRow({ salonId, onVideoClick }: VideoShortsRowProps) {
    const [videos, setVideos] = useState<VideoShort[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch(`/api/video-shorts/salon/${salonId}?limit=10`);
                if (res.ok) {
                    const data = await res.json();
                    setVideos(data);
                }
            } catch (error) {
                console.error('Failed to fetch video shorts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [salonId]);

    const handleVideoClick = (video: VideoShort, index: number) => {
        // Open the video player modal
        setSelectedVideoIndex(index);
        setIsPlayerOpen(true);

        // Call external handler if provided
        if (onVideoClick) {
            onVideoClick(video);
        }
    };

    const handleVideoView = useCallback(async (videoId: string) => {
        // Increment view count
        try {
            await fetch(`/api/video-shorts/${videoId}/view`, { method: 'POST' });
            // Update local view count
            setVideos((prev) =>
                prev.map((v) => (v.id === videoId ? { ...v, views: v.views + 1 } : v))
            );
        } catch (e) {
            // Silent fail
        }
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>Video Shorts</h3>
                <div className={styles.scrollContainer}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={styles.skeleton} />
                    ))}
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return null; // Don't show section if no videos
    }

    return (
        <>
            <section className={styles.container}>
                <h3 className={styles.title}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    Video Shorts
                </h3>
                <div className={styles.scrollContainer}>
                    {videos.map((video, index) => (
                        <button
                            key={video.id}
                            className={styles.videoCard}
                            onClick={() => handleVideoClick(video, index)}
                            aria-label={video.caption || 'Play video'}
                        >
                            <div className={styles.thumbnail}>
                                {video.thumbnailUrl ? (
                                    <Image
                                        src={video.thumbnailUrl}
                                        alt={video.caption || 'Video thumbnail'}
                                        fill
                                        sizes="120px"
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className={styles.placeholderThumb}>
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                )}
                                <div className={styles.playOverlay}>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                            {video.caption && (
                                <span className={styles.caption}>{video.caption}</span>
                            )}
                            <span className={styles.views}>
                                {video.views.toLocaleString()} views
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Video Player Modal */}
            <VideoPlayerModal
                isOpen={isPlayerOpen}
                onClose={() => setIsPlayerOpen(false)}
                videos={videos}
                initialIndex={selectedVideoIndex}
                onVideoView={handleVideoView}
            />
        </>
    );
}
