'use client';

import { useState, useRef } from 'react';
import styles from './VideoUpload.module.css';
import { toast } from 'react-toastify';
import { PlanCode } from '@/types';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';

interface VideoUploadProps {
  salonId: string;
  services: Array<{ id: string; title: string }>;
  planCode: PlanCode | null;
  onUploadComplete: () => void;
}

const ALLOWED_PLANS: PlanCode[] = ['FREE', 'GROWTH', 'PRO', 'ELITE'];

export default function VideoUpload({ salonId, services, planCode, onUploadComplete }: VideoUploadProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoInputRef = useRef<HTMLInputElement>(null);

  const isEligible = planCode && ALLOWED_PLANS.includes(planCode);

  const handleVideoSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('Video size must be less than 50MB');
      return;
    }

    // Check video duration
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;

      if (duration > 60) {
        toast.error('Video must be 60 seconds or less');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoFile(file);
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    video.src = URL.createObjectURL(file);
  };

  const handleUpload = async () => {
    if (!videoFile) {
      toast.error('Please select a video');
      return;
    }

    if (!isEligible) {
      toast.error('Video uploads require Growth, Pro, or Elite plan');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('salonId', salonId);
      if (serviceId) formData.append('serviceId', serviceId);
      if (caption) formData.append('caption', caption);

      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await res.json();
      toast.success(data.message || 'Video uploaded successfully! Awaiting admin approval.');

      // Reset form
      setVideoFile(null);
      setVideoPreview(null);
      setCaption('');
      setServiceId('');
      setUploadProgress(0);

      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isEligible) {
    return (
      <div className={styles.container}>
        <div className={styles.upgradePrompt}>
          <div className={styles.lockIcon}>🔒</div>
          <h3 className={styles.upgradeTitle}>Video Uploads Require an Upgrade</h3>
          <p className={styles.upgradeText}>
            Upload short service videos (up to 60 seconds) to showcase your work in action.
            This feature is available on Growth, Pro, and Elite plans.
          </p>
          <div className={styles.currentPlan}>
            <strong>Your Current Plan:</strong> {planCode || 'FREE'}
          </div>
          <button className={styles.upgradeButton} onClick={() => {
            // Scroll to plan section or show upgrade modal
            toast.info('Contact admin to upgrade your plan');
          }}>
            Upgrade Your Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Upload Service Video</h3>
        <p className={styles.subtitle}>
          Upload short videos (max 60 seconds) in portrait mode to showcase your services.
          Videos require admin approval before appearing publicly.
        </p>
      </div>

      <div className={styles.uploadArea}>
        {videoPreview ? (
          <div className={styles.videoPreview}>
            <video src={videoPreview} controls className={styles.previewVideo} />
            <button
              onClick={() => {
                setVideoFile(null);
                setVideoPreview(null);
              }}
              className={styles.removeButton}
              type="button"
            >
              Remove Video
            </button>
          </div>
        ) : (
          <button
            onClick={() => videoInputRef.current?.click()}
            className={styles.uploadButton}
            type="button"
          >
            <span className={styles.uploadIcon}>🎬</span>
            <span className={styles.uploadText}>Select Video</span>
            <span className={styles.uploadSubtext}>Max 60 seconds • Max 50MB • Portrait mode recommended</span>
          </button>
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
          className={styles.fileInput}
        />
      </div>

      {videoFile && (
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Link to Service (Optional)
            </label>
            <Select
              value={serviceId}
              onValueChange={(value) => setServiceId(value === '__none__' ? '' : value)}
            >
              <SelectTrigger className={styles.select}>
                <SelectValue placeholder="No service selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No service selected</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="caption" className={styles.label}>
              Caption (Optional)
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe your service..."
              className={styles.textarea}
              rows={3}
              maxLength={200}
            />
            <span className={styles.charCount}>{caption.length}/200</span>
          </div>

          {isUploading && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!videoFile || isUploading}
            className={styles.submitButton}
          >
            {isUploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </div>
      )}

      <div className={styles.tips}>
        <h4 className={styles.tipsTitle}>Tips for Best Results:</h4>
        <ul className={styles.tipsList}>
          <li>Use portrait orientation (9:16 ratio) for best display</li>
          <li>Keep videos between 15-60 seconds</li>
          <li>Ensure good lighting and stable camera</li>
          <li>Show clear before/after or service process</li>
          <li>Add captions to increase engagement</li>
        </ul>
      </div>
    </div>
  );
}
