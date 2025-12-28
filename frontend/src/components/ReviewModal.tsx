'use client';

import { useState, FormEvent, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Review } from '@/types';
import { toast } from 'react-toastify';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { FaCamera, FaTimes } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Textarea,
  Label,
  StarRating,
  Progress,
} from '@/components/ui';

interface ReviewModalProps {
  bookingId: string;
  onClose: () => void;
  onReviewAdded: (newReview: Review) => void;
  existingReview?: Review | null;
}

interface SelectedImage {
  file: File;
  preview: string;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ReviewModal({ bookingId, onClose, onReviewAdded, existingReview }: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(existingReview?.images || []);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(existingReview);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = selectedImages.length + existingImages.length;
    const remainingSlots = MAX_IMAGES - totalImages;

    if (remainingSlots <= 0) {
      toast.warning(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const newImages: SelectedImage[] = [];
    const validFiles = Array.from(files).slice(0, remainingSlots);

    for (const file of validFiles) {
      if (!file.type.startsWith('image/')) {
        toast.warning(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.warning(`${file.name} is too large (max 5MB)`);
        continue;
      }
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setSelectedImages(prev => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedImages.length, existingImages.length]);

  const handleRemoveSelectedImage = useCallback((index: number) => {
    setSelectedImages(prev => {
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleRemoveExistingImage = useCallback((index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment for your review.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const uploadedUrls: string[] = [...existingImages];

      if (selectedImages.length > 0) {
        setUploadMessage(`Uploading images...`);

        for (let i = 0; i < selectedImages.length; i++) {
          setUploadProgress(((i + 1) / selectedImages.length) * 100);
          setUploadMessage(`Uploading image ${i + 1} of ${selectedImages.length}`);
          try {
            const url = await uploadToCloudinary(selectedImages[i].file);
            uploadedUrls.push(url);
          } catch (uploadError) {
            console.error('Failed to upload image:', uploadError);
            toast.warning(`Failed to upload image ${i + 1}`);
          }
        }
        setUploadMessage('');
        setUploadProgress(0);
      }

      const newReview = await apiJson<Review>(
        isEditing && existingReview ? `/api/reviews/${existingReview.id}` : '/api/reviews',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            rating,
            comment: comment.trim(),
            images: uploadedUrls,
          }),
        }
      );

      if (isEditing) {
        toast.success('Your review has been updated and is awaiting admin approval.');
      } else {
        toast.success('Review submitted successfully! Your review is awaiting admin approval.');
      }

      // Clean up previews
      selectedImages.forEach(img => URL.revokeObjectURL(img.preview));

      onReviewAdded(newReview);
      onClose();
    } catch (err: any) {
      const msg = toFriendlyMessage(err, 'Failed to submit review.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setUploadMessage('');
      setUploadProgress(0);
    }
  };

  const totalImages = selectedImages.length + existingImages.length;
  const canAddMore = totalImages < MAX_IMAGES;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Your Review' : 'Leave a Review'}
          </DialogTitle>
          <DialogDescription>
            Share your experience to help others find great services
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <StarRating
              value={rating}
              onChange={setRating}
              size="lg"
              interactive
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Comments</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              required
            />
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <Label>
              Add Photos <span className="text-muted-foreground">({totalImages}/{MAX_IMAGES})</span>
            </Label>

            {/* Image Previews */}
            {(existingImages.length > 0 || selectedImages.length > 0) && (
              <div className="grid grid-cols-5 gap-2">
                {existingImages.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative aspect-square rounded-md overflow-hidden">
                    <Image src={url} alt={`Review photo ${idx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
                      aria-label="Remove image"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {selectedImages.map((img, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-square rounded-md overflow-hidden">
                    <Image src={img.preview} alt={`New photo ${idx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
                      aria-label="Remove image"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Photo Button */}
            {canAddMore && (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <FaCamera className="mr-2" />
                Add Photos
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Upload Progress */}
          {uploadMessage && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{uploadMessage}</p>
              <Progress value={uploadProgress} />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? (uploadMessage || (isEditing ? 'Updating...' : 'Submitting...'))
                : (isEditing ? 'Update Review' : 'Submit Review')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}