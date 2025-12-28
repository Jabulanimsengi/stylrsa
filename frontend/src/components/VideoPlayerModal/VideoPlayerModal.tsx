'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './VideoPlayerModal.module.css';
import { FaTimes, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface VideoShort {
    id: string;
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    views: number;
}

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    videos: VideoShort[];
    initialIndex?: number;
    onVideoView?: (videoId: string) => void;
}

export default function VideoPlayerModal({
    isOpen,
    onClose,
    videos,
    initialIndex = 0,
    onVideoView,
}: VideoPlayerModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const currentVideo = videos[currentIndex];

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setIsPlaying(true);
            setProgress(0);
        }
    }, [isOpen, initialIndex]);

    // Track video views
    useEffect(() => {
        if (isOpen && currentVideo && onVideoView) {
            onVideoView(currentVideo.id);
        }
    }, [isOpen, currentVideo?.id, onVideoView]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'm':
                    setIsMuted(!isMuted);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, isMuted]);

    const goToNext = useCallback(() => {
        if (currentIndex < videos.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setProgress(0);
        }
    }, [currentIndex, videos.length]);

    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setProgress(0);
        }
    }, [currentIndex]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(pct);
        }
    };

    const handleVideoEnd = () => {
        // Auto-advance to next video
        if (currentIndex < videos.length - 1) {
            goToNext();
        } else {
            setIsPlaying(false);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = pct * videoRef.current.duration;
        }
    };

    if (!isOpen || !currentVideo) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className={styles.closeBtn} onClick={onClose}>
                    <FaTimes />
                </button>

                {/* Navigation arrows */}
                {currentIndex > 0 && (
                    <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={goToPrevious}>
                        <FaChevronLeft />
                    </button>
                )}
                {currentIndex < videos.length - 1 && (
                    <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={goToNext}>
                        <FaChevronRight />
                    </button>
                )}

                {/* Video container */}
                <div className={styles.videoContainer}>
                    <video
                        ref={videoRef}
                        src={currentVideo.videoUrl}
                        poster={currentVideo.thumbnailUrl}
                        autoPlay
                        muted={isMuted}
                        playsInline
                        loop={false}
                        className={styles.video}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnd}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />

                    {/* Play/Pause overlay */}
                    <button className={styles.playOverlay} onClick={togglePlay}>
                        {!isPlaying && <FaPlay />}
                    </button>

                    {/* Video info */}
                    <div className={styles.videoInfo}>
                        {currentVideo.caption && (
                            <p className={styles.caption}>{currentVideo.caption}</p>
                        )}
                        <span className={styles.views}>
                            {currentVideo.views.toLocaleString()} views
                        </span>
                    </div>

                    {/* Controls */}
                    <div className={styles.controls}>
                        {/* Progress bar */}
                        <div className={styles.progressBar} onClick={handleProgressClick}>
                            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                        </div>

                        <div className={styles.controlButtons}>
                            <button className={styles.controlBtn} onClick={togglePlay}>
                                {isPlaying ? <FaPause /> : <FaPlay />}
                            </button>
                            <button className={styles.controlBtn} onClick={() => setIsMuted(!isMuted)}>
                                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                            </button>
                            <span className={styles.videoCounter}>
                                {currentIndex + 1} / {videos.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Video indicators */}
                <div className={styles.indicators}>
                    {videos.map((_, idx) => (
                        <button
                            key={idx}
                            className={`${styles.indicator} ${idx === currentIndex ? styles.active : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
