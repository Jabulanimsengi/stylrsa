// frontend/srcs/components/GalleryUploadModal.tsx

'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './GalleryUploadModal.module.css'; // FIX: Use the new dedicated stylesheet
import { toast } from 'react-toastify';
import { GalleryImage } from '@/types';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';

interface GalleryUploadModalProps {
  salonId: string;
  onClose: () => void;
  onImageAdded: (image: GalleryImage) => void;
}

interface FileItem {
  file: File;
  preview: string;
}

export default function GalleryUploadModal({ salonId, onClose, onImageAdded }: GalleryUploadModalProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const filesRef = useRef<FileItem[]>([]);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsProcessingFile(true);
    setError('');

    try {
      const fileArray = Array.from(e.target.files);
      
      // Validate each file
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      for (const file of fileArray) {
        if (file.size > MAX_SIZE) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 10MB. (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        }
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" is not a valid image.`);
        }
      }

      const newFiles = fileArray.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      toast.success(`${fileArray.length} image(s) selected`);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process files';
      setError(errorMessage);
      toast.error(errorMessage);
      e.target.value = '';
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleRemoveImage = (fileIndex: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fileIndex, 1);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  const cleanupPreviews = useCallback(() => {
    filesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    filesRef.current = [];
    setFiles([]);
  }, []);

  const handleClose = useCallback(() => {
    cleanupPreviews();
    onClose();
  }, [cleanupPreviews, onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one image to upload.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // Check salon plan to enforce FREE limit client-side and avoid partial batch failures
      let allowed = files.length;
      try {
        const salon = await apiJson<{ planCode?: string | null }>(`/api/salons/${salonId}`);
        if (salon?.planCode === 'FREE') {
          const existing = await apiJson<GalleryImage[]>(`/api/gallery/salon/${salonId}`);
          const remaining = Math.max(0, 5 - (existing?.length ?? 0));
          if (remaining <= 0) {
            toast.error('Free plan limit reached: you already have 5 gallery images.');
            setIsLoading(false);
            return;
          }
          allowed = Math.min(allowed, remaining);
        }
      } catch {
        // If plan check fails, proceed with best effort (server will enforce)
      }

      const toUpload = files.slice(0, allowed);
      let successCount = 0;
      
      if (toUpload.length > 0) {
        toast.info(`Uploading ${toUpload.length} image(s)...`);
      }
      
      for (const { file } of toUpload) {
        const uploaded = await uploadToCloudinary(file);
        const url = uploaded.secure_url;
        const newImage = await apiJson<GalleryImage>(`/api/gallery/salon/${salonId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url, caption: caption || null }),
        });
        onImageAdded(newImage);
        successCount += 1;
      }

      if (successCount > 0) {
        toast.success(`${successCount} image(s) uploaded successfully${successCount < files.length ? ' (limit reached)' : ''}.`);
      }
      if (successCount < files.length) {
        toast.info('Some images were not uploaded due to the free plan gallery limit (5).');
      }
      cleanupPreviews();
      onClose();

    } catch (err: any) {
      const msg = toFriendlyMessage(err, 'One or more images failed to save.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
            <h2 className={styles.title}>Upload to Gallery</h2>
            <button onClick={handleClose} className={styles.closeButton}><FaTimes /></button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.errorMessage}>{error}</p>}
          
          {isProcessingFile && (
            <div style={{ padding: '12px', background: 'var(--color-surface-elevated)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <span>Processing files...</span>
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Images</label>
            <label htmlFor="gallery-upload" className={styles.fileInputLabel}>
                <FaUpload style={{ marginRight: '8px' }} />
                Click or drag files to upload
            </label>
            <input
              id="gallery-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
              disabled={isProcessingFile || isLoading}
            />
          </div>

          {files.length > 0 && (
            <div className={styles.imagePreviewContainer}>
              {files.map((entry, index) => (
                <div key={index} className={styles.imageWrapper}>
                  <Image
                    src={entry.preview}
                    alt={`preview ${index + 1}`}
                    className={styles.imagePreview}
                    width={160}
                    height={120}
                    unoptimized
                  />
                  <button type="button" onClick={() => handleRemoveImage(index)} className={styles.removeImageButton}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="caption" className={styles.label}>Optional Caption</label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={styles.textarea}
              placeholder="A brief description for all uploaded images..."
            />
          </div>

          <div className={styles.buttonContainer}>
            <button type="button" onClick={handleClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading || files.length === 0} className={styles.saveButton}>
              {isLoading ? `Uploading ${files.length}...` : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
