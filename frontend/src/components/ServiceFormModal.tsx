// frontend/src/components/ServiceFormModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import styles from './ServiceFormModal.module.css';
import { toast } from 'react-toastify';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import Image from 'next/image';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { Service } from '@/types';
import { getCategoriesCached } from '@/lib/resourceCache';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';

interface ServiceFormInputs {
  name: string;
  description: string;
  price: number;
  duration: number;
  pricingType?: 'PER_PERSON' | 'PER_COUPLE';
  categoryId: string;
  images: string[];
}

// Backwards-compatible props to support existing usages across pages
interface ServiceFormModalProps {
  salonId: string;
  onClose: () => void;
  // Newer props
  onServiceAddedOrUpdated?: (service: Service) => void;
  serviceToEdit?: Service | null;
  isOpen?: boolean; // optional: component is conditionally mounted by parents
  // Older usages
  onServiceAdded?: (service: Service) => void;
  onServiceSaved?: (service: Service) => void;
  service?: Service | null;
}

interface Category {
  id: string;
  name: string;
}

interface ServicePayload {
  title: string;
  description: string;
  price: number;
  duration: number;
  images: string[];
  salonId: string;
  categoryId?: string;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen: _isOpen,
  onClose,
  salonId,
  onServiceAddedOrUpdated,
  serviceToEdit,
  service,
  onServiceAdded,
  onServiceSaved,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 30,
      categoryId: '',
      images: [],
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const existingImages = watch('images');

  useEffect(() => {
    let cancelled = false;
    setIsLoadingCategories(true);
    getCategoriesCached()
      .then((data) => {
        if (!cancelled) {
          console.log('[ServiceFormModal] Categories loaded:', data);
          if (!data || data.length === 0) {
            console.warn('[ServiceFormModal] No categories found in database');
            toast.warning('No service categories found. Please contact admin to set up categories.');
          }
          setCategories(data || []);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('[ServiceFormModal] Failed to load categories:', error);
          toast.error(toFriendlyMessage(error, 'Failed to load service categories.'));
          setCategories([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCategories(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Support either 'serviceToEdit' (new) or 'service' (older prop name)
  const initialService = serviceToEdit ?? service ?? null;

  useEffect(() => {
    if (initialService) {
      reset({
        name: initialService.name ?? initialService.title ?? '',
        description: initialService.description,
        price: initialService.price,
        duration: initialService.duration,
        categoryId: initialService.categoryId ?? '',
        images: initialService.images || [],
      });
      setImagePreviews(initialService.images || []);
      setImageFiles([]);
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        categoryId: '',
        images: [],
      });
      setImagePreviews([]);
      setImageFiles([]);
    }
  }, [initialService, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImageFiles = [...imageFiles, ...files];
      setImageFiles(newImageFiles);

      const newImagePreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newImagePreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (index < existingImages.length) {
      const updatedImages = existingImages.filter((_, i) => i !== index);
      setValue('images', updatedImages);
      setImagePreviews(updatedImages);
    } else {
      const fileIndex = index - existingImages.length;
      const updatedFiles = imageFiles.filter((_, i) => i !== fileIndex);
      setImageFiles(updatedFiles);

      const updatedPreviews = updatedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews([...existingImages, ...updatedPreviews]);
    }
  };

  const onSubmit: SubmitHandler<ServiceFormInputs> = async (data) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const uploadedImageUrls = [...(data.images || [])];

      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => uploadToCloudinary(file));
        const responses = await Promise.all(uploadPromises);
        const newUrls = responses.map(res => res.secure_url); // This now works correctly
        uploadedImageUrls.push(...newUrls);
      }

      const serviceData: ServicePayload = {
        // Backend expects 'title'
        title: data.name,
        description: data.description,
        price: Number(data.price),
        duration: Number(data.duration),
        images: uploadedImageUrls,
        salonId,
        // Only include categoryId if it's a valid non-empty value
        ...(data.categoryId && data.categoryId.trim() !== '' && { categoryId: data.categoryId }),
      };

      const url = initialService
        ? `/api/services/${initialService.id}`
        : `/api/services`;
      const method = initialService ? 'PATCH' : 'POST';

      const savedService = await apiJson<Service>(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });

      // Enhanced toast notification with clear messaging
      if (initialService) {
        toast.success(
          `✅ Service updated successfully!\n📋 Your changes will be reviewed by an admin before going live.`,
          { autoClose: 5000 }
        );
      } else {
        toast.success(
          `🎉 Service added successfully!\n⏳ Your service is pending admin approval and will be visible once approved.`,
          { autoClose: 5000 }
        );
      }

      // Fire any provided callback name for backwards compatibility
      onServiceAddedOrUpdated?.(savedService);
      onServiceSaved?.(savedService);
      onServiceAdded?.(savedService);
      onClose();
    } catch (error: unknown) {
      const msg = toFriendlyMessage(error, 'Failed to save service.');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (isSubmitting || isUploading) return;
    reset();
    setImageFiles([]);
    setImagePreviews([]);
    setErrorMessage(null);
    onClose();
  }, [isSubmitting, isUploading, reset, onClose]);

  // Component is conditionally mounted by parents; no need for internal isOpen guard

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} disabled={isSubmitting || isUploading}>&times;</button>
        <h2 className={styles.title}>{serviceToEdit ? 'Edit Service' : 'Add a New Service'}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.formScrollableContent}>
            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Service Name</label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Service name is required' })}
                  className={styles.input}
                  placeholder="e.g., Classic Manicure"
                />
                {errors.name && <p className={styles.errorMessage}>{errors.name.message}</p>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: 'Please select a category' }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingCategories}
                    >
                      <SelectTrigger className={styles.select}>
                        <SelectValue
                          placeholder={
                            isLoadingCategories
                              ? "Loading categories..."
                              : categories.length === 0
                                ? "No categories available"
                                : "Select a category..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className={styles.errorMessage}>{errors.categoryId.message}</p>}
                {!isLoadingCategories && categories.length === 0 && (
                  <p className={styles.errorMessage} style={{ marginTop: '0.5rem' }}>
                    No categories found. Please run database seeding or contact support.
                  </p>
                )}
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="description" className={styles.label}>Description</label>
              <textarea
                id="description"
                {...register('description', { required: 'Description is required' })}
                className={styles.textarea}
                placeholder="Describe the service in detail"
              />
              {errors.description && <p className={styles.errorMessage}>{errors.description.message}</p>}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>Price (R)</label>
                <input
                  id="price"
                  type="number"
                  {...register('price', {
                    required: 'Price is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Price cannot be negative' }
                  })}
                  className={styles.input}
                  placeholder="e.g., 250"
                />
                {errors.price && <p className={styles.errorMessage}>{errors.price.message}</p>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Pricing Type (Optional)</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="radio"
                      value="PER_PERSON"
                      {...register('pricingType')}
                      className={styles.radio}
                    />
                    <span>Per Person</span>
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="radio"
                      value="PER_COUPLE"
                      {...register('pricingType')}
                      className={styles.radio}
                    />
                    <span>Per Couple</span>
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="radio"
                      value=""
                      {...register('pricingType')}
                      className={styles.radio}
                    />
                    <span>Not specified</span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="duration" className={styles.label}>Duration (minutes)</label>
                <input
                  id="duration"
                  type="number"
                  {...register('duration', {
                    required: 'Duration is required',
                    valueAsNumber: true,
                    min: { value: 5, message: 'Duration must be at least 5 minutes' }
                  })}
                  className={styles.input}
                  step="5"
                  placeholder="e.g., 60"
                />
                {errors.duration && <p className={styles.errorMessage}>{errors.duration.message}</p>}
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="images" className={styles.label}>Service Images</label>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className={styles.input}
                disabled={isUploading}
              />
              <div className={styles.imagePreviewContainer}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className={styles.imageWrapper}>
                    <Image src={preview} alt="Service preview" layout="fill" className={styles.imagePreview} />
                    <button type="button" onClick={() => handleRemoveImage(index)} className={styles.deleteButton}>&times;</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button type="button" onClick={handleClose} className={styles.cancelButton} disabled={isSubmitting || isUploading}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading ? 'Saving...' : (serviceToEdit ? 'Save Changes' : 'Save Service')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
