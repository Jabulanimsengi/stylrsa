// frontend/srcs/components/EditSalonModal.tsx

'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import Image from 'next/image';
import { Salon } from '@/types';
import styles from './EditSalonModal.module.css';
import { toast } from 'react-toastify';
import { showError, toFriendlyMessage } from '@/lib/errors';
import { FaTimes } from 'react-icons/fa';
import { uploadToCloudinary, transformCloudinary } from '@/utils/cloudinary';
import { SalonUpdateSchema } from '@/lib/validation/schemas';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';
import MapboxMap from '@/components/MapboxMap';
import { forwardGeocode, GeocodingResult } from '@/lib/mapbox';

interface EditSalonModalProps {
  salon: Salon;
  onClose: () => void;
  onSalonUpdate: (updatedSalon: Salon) => void;
}

export default function EditSalonModal({ salon, onClose, onSalonUpdate }: EditSalonModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    province: '',
    city: '',
    town: '',
    address: '',
    bookingType: 'ONSITE',
    mobileFee: 0,
    operatingHours: {},
    contactEmail: '',
    phoneNumber: '',
    whatsapp: '',
    website: '',
    latitude: '' as any,
    longitude: '' as any,
  });

  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [heroImageFiles, setHeroImageFiles] = useState<File[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [heroImagesPreview, setHeroImagesPreview] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Track original URLs (non-transformed) for submission
  const [originalHeroImages, setOriginalHeroImages] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState('');
  const [addrQuery, setAddrQuery] = useState('');
  const [addrSuggestions, setAddrSuggestions] = useState<any[]>([]);
  const [showAddrSuggestions, setShowAddrSuggestions] = useState(false);
  const [locationsData, setLocationsData] = useState<Record<string, string[]>>({});
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [hours, setHours] = useState<Record<string, { open: string; close: string; isOpen: boolean }>>(
    Object.fromEntries(days.map(d => [d, { open: '09:00', close: '17:00', isOpen: true }])) as Record<string, { open: string; close: string; isOpen: boolean }>
  );

  useEffect(() => {
    if (salon) {
      setFormData({
        name: salon.name || '',
        description: salon.description || '',
        province: salon.province || '',
        city: salon.city || '',
        town: salon.town || '',
        address: salon.address || '',
        bookingType: salon.bookingType || 'ONSITE',
        mobileFee: salon.mobileFee || 0,
        operatingHours: salon.operatingHours || {},
        contactEmail: salon.contactEmail || '',
        phoneNumber: salon.phoneNumber || '',
        whatsapp: salon.whatsapp || '',
        website: salon.website || '',
        latitude: (salon.latitude as any) ?? '' as any,
        longitude: (salon.longitude as any) ?? '' as any,
      });
      // Optimize existing image previews with Cloudinary transformations
      setBackgroundImagePreview(
        salon.backgroundImage
          ? transformCloudinary(salon.backgroundImage, { width: 400, quality: 'auto', format: 'auto' })
          : null
      );
      setLogoPreview(
        salon.logo
          ? transformCloudinary(salon.logo, { width: 200, quality: 'auto', format: 'auto' })
          : null
      );
      // Store original hero images for submission
      setOriginalHeroImages(salon.heroImages || []);
      // Use transformed versions for preview only
      setHeroImagesPreview(
        salon.heroImages?.map(img =>
          transformCloudinary(img, { width: 400, quality: 'auto', format: 'auto' })
        ) || []
      );

      // Parse operating hours from salon data
      const rawHours = salon.operatingHours as unknown;
      const nextHours: Record<string, { open: string; close: string; isOpen: boolean }> = {} as any;

      // Initialize all days as closed first
      days.forEach((d) => {
        nextHours[d] = { open: '09:00', close: '17:00', isOpen: false };
      });

      if (Array.isArray(rawHours)) {
        // Handle array format: [{ day: 'Monday', open: '09:00', close: '17:00' }, ...]
        rawHours.forEach((entry: { day?: string; open?: string; close?: string }) => {
          if (!entry?.day) return;
          const dayName = entry.day;
          if (days.includes(dayName)) {
            nextHours[dayName] = {
              open: entry.open || '09:00',
              close: entry.close || '17:00',
              isOpen: true,
            };
          }
        });
      } else if (rawHours && typeof rawHours === 'object') {
        // Handle object format: { Monday: '09:00 - 17:00', ... }
        const hoursRecord = rawHours as Record<string, string>;
        days.forEach((d) => {
          const val = hoursRecord[d];
          if (val && typeof val === 'string') {
            const match = val.match(/(\d{1,2}:\d{2}).*(\d{1,2}:\d{2})/);
            if (match) {
              nextHours[d] = { open: match[1], close: match[2], isOpen: true };
            }
          }
        });
      }

      setHours(nextHours);
    }
  }, [salon]);

  // Fetch locations data from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocationsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch locations data:', error);
      }
    };
    fetchLocations();
  }, []);

  // Update available cities when province changes
  useEffect(() => {
    if (formData.province && locationsData[formData.province]) {
      setAvailableCities(locationsData[formData.province]);
    } else {
      setAvailableCities([]);
    }
  }, [formData.province, locationsData]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        // Small delay to allow click on suggestion to register
        setTimeout(() => setShowAddrSuggestions(false), 150);
      }
    };

    if (showAddrSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddrSuggestions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateImageDimensions = (file: File, minWidth: number, minHeight: number, recommended: { width: number, height: number } = { width: minWidth, height: minHeight }): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // Calculate if image is too small (less than 75% of minimum)
        const absoluteMinWidth = Math.floor(minWidth * 0.75);
        const absoluteMinHeight = Math.floor(minHeight * 0.75);

        if (img.width < absoluteMinWidth || img.height < absoluteMinHeight) {
          reject(new Error(
            `Image too small. Minimum: ${minWidth}x${minHeight}px recommended. Your image: ${img.width}x${img.height}px. Try using a larger image for better quality.`
          ));
        } else if (img.width < minWidth || img.height < minHeight) {
          // Image is below recommended but above absolute minimum - show warning but allow
          toast.warning(`Image is smaller than recommended (${recommended.width}x${recommended.height}px). Your image: ${img.width}x${img.height}px. Quality may be reduced.`, {
            autoClose: 5000,
          });
          resolve();
        } else {
          resolve();
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image. Please ensure the file is a valid image.'));
      };

      img.src = url;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    setIsProcessingFile(true);
    setError('');

    try {
      if (name === 'backgroundImage' && files[0]) {
        const file = files[0];

        // Validate file size early (10MB limit)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          throw new Error(`File too large. Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
        }

        // Validate it's an image
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select a valid image file.');
        }

        // Validate dimensions (recommended 1200x600 for background, minimum 600x300)
        await validateImageDimensions(file, 600, 300, { width: 1200, height: 600 });

        setBackgroundImageFile(file);
        if (backgroundImagePreview && backgroundImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(backgroundImagePreview);
        }
        setBackgroundImagePreview(URL.createObjectURL(file));
        toast.success('Background image selected');
      } else if (name === 'logo' && files[0]) {
        const file = files[0];

        // Validate file size early (10MB limit)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          throw new Error(`File too large. Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
        }

        // Validate it's an image
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select a valid image file.');
        }

        // Validate dimensions (recommended 512x512 for logo, minimum 150x150)
        await validateImageDimensions(file, 150, 150, { width: 512, height: 512 });

        setLogoFile(file);
        if (logoPreview && logoPreview.startsWith('blob:')) {
          URL.revokeObjectURL(logoPreview);
        }
        setLogoPreview(URL.createObjectURL(file));
        toast.success('Logo image selected (Recommended: 512x512px or larger for best quality)');
      } else if (name === 'heroImages') {
        const newFiles = Array.from(files);

        // Validate each file size and dimensions
        const MAX_SIZE = 10 * 1024 * 1024;
        for (const file of newFiles) {
          if (file.size > MAX_SIZE) {
            throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
          }
          if (!file.type.startsWith('image/')) {
            throw new Error(`File "${file.name}" is not a valid image.`);
          }
          // Validate dimensions (recommended 1200x800 for hero images, minimum 450x300)
          await validateImageDimensions(file, 450, 300, { width: 1200, height: 800 });
        }

        setHeroImageFiles(prevFiles => [...prevFiles, ...newFiles]);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setHeroImagesPreview(prevPreviews => [...prevPreviews, ...newPreviews]);
        toast.success(`${newFiles.length} hero image(s) selected`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process file';
      setError(errorMessage);
      toast.error(errorMessage);
      // Reset the file input
      e.target.value = '';
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDeleteImage = (imageUrlToDelete: string, imageType: 'background' | 'logo' | 'hero') => {
    if (imageType === 'background') {
      setBackgroundImageFile(null);
      setBackgroundImagePreview(null);
    } else if (imageType === 'logo') {
      setLogoFile(null);
      setLogoPreview(null);
    } else {
      const updatedPreviews = heroImagesPreview.filter(img => img !== imageUrlToDelete);
      setHeroImagesPreview(updatedPreviews);

      if (imageUrlToDelete.startsWith('blob:')) {
        // Remove from new files
        const indexToRemove = heroImagesPreview.findIndex(p => p === imageUrlToDelete);
        const existingImagesCount = heroImagesPreview.filter(p => !p.startsWith('blob:')).length;
        const fileIndexToRemove = indexToRemove - existingImagesCount;

        if (fileIndexToRemove >= 0 && fileIndexToRemove < heroImageFiles.length) {
          setHeroImageFiles(prevFiles => prevFiles.filter((_, i) => i !== fileIndexToRemove));
        }
      } else {
        // Remove from original hero images by finding the matching original URL
        const indexInPreview = heroImagesPreview.findIndex(p => p === imageUrlToDelete);
        if (indexInPreview >= 0 && indexInPreview < originalHeroImages.length) {
          setOriginalHeroImages(prevOriginals => prevOriginals.filter((_, i) => i !== indexInPreview));
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');

    try {
      // Determine final background image URL
      let finalBackgroundImageUrl: string | null = null;
      if (backgroundImageFile && backgroundImagePreview?.startsWith('blob:')) {
        // New background image uploaded
        toast.info('Uploading background image...');
        const uploaded = await uploadToCloudinary(backgroundImageFile, {
          onProgress: (progress) => {
            setUploadProgress(prev => ({ ...prev, background: progress }));
          }
        });
        finalBackgroundImageUrl = uploaded.secure_url;
        setUploadProgress(prev => ({ ...prev, background: 100 }));
        toast.success('Background image uploaded!');
      } else if (backgroundImagePreview && !backgroundImagePreview.startsWith('blob:')) {
        // Existing background image kept (use original URL from salon, not transformed preview)
        finalBackgroundImageUrl = salon.backgroundImage || null;
      }
      // else: background image was deleted (backgroundImagePreview is null), send null

      // Determine final logo URL
      let finalLogoUrl: string | null = null;
      if (logoFile && logoPreview?.startsWith('blob:')) {
        // New logo file uploaded
        toast.info('Uploading logo...');
        const uploaded = await uploadToCloudinary(logoFile, {
          publicId: `${salon.name.replace(/[^a-zA-Z0-9]/g, '_')}_logo`,
          onProgress: (progress) => {
            setUploadProgress(prev => ({ ...prev, logo: progress }));
          }
        });
        finalLogoUrl = uploaded.secure_url;
        setUploadProgress(prev => ({ ...prev, logo: 100 }));
        toast.success('Logo uploaded!');
      } else if (logoPreview && !logoPreview.startsWith('blob:')) {
        // Existing logo kept (use original URL from salon, not transformed preview)
        finalLogoUrl = salon.logo || null;
      }
      // else: logo was deleted (logoPreview is null), send null

      // Use original hero image URLs (not transformed previews)
      const existingHeroImageUrls = originalHeroImages;

      // Upload new hero images with progress tracking
      if (heroImageFiles.length > 0) {
        toast.info(`Uploading ${heroImageFiles.length} hero image(s)...`);
      }
      const newHeroImageUrls = (
        await Promise.all(heroImageFiles.map((file, index) =>
          uploadToCloudinary(file, {
            onProgress: (progress) => {
              setUploadProgress(prev => ({ ...prev, [`hero_${index}`]: progress }));
            }
          })
        ))
      ).map(r => r.secure_url);

      if (heroImageFiles.length > 0) {
        toast.success(`${heroImageFiles.length} hero image(s) uploaded!`);
      }

      const finalHeroImageUrls = [...existingHeroImageUrls, ...newHeroImageUrls];

      const isValidUrl = (value: string) => {
        try { new URL(value); return true; } catch { return false; }
      };

      const cleanedWhatsapp = (formData.whatsapp || '').replace(/\D+/g, '');
      const websiteValue = formData.website?.trim();

      // Validate payload (partial allowed)
      const payload = {
        ...formData,
        whatsapp: cleanedWhatsapp || undefined,
        website: websiteValue && isValidUrl(websiteValue) ? websiteValue : undefined,
        backgroundImage: finalBackgroundImageUrl,
        logo: finalLogoUrl,
        heroImages: finalHeroImageUrls,
        latitude: (formData as any).latitude !== '' ? Number((formData as any).latitude) : undefined,
        longitude: (formData as any).longitude !== '' ? Number((formData as any).longitude) : undefined,
      } as any;
      // Compose operatingHours as array entries compatible with backend DTO
      const hoursArray = days
        .filter(d => hours[d].isOpen)
        .map((d) => ({
          day: d,
          open: hours[d].open,
          close: hours[d].close,
        }));
      payload.operatingHours = hoursArray;
      payload.operatingDays = hoursArray.map((entry) => entry.day);

      // Normalize mobileFee number
      if (payload.bookingType !== 'ONSITE') {
        const feeNum = Number(payload.mobileFee);
        payload.mobileFee = Number.isFinite(feeNum) && feeNum >= 0 ? feeNum : 0;
        payload.offersMobile = true;
      } else {
        payload.offersMobile = false;
      }
      const parsed = SalonUpdateSchema.partial().safeParse(payload);
      if (!parsed.success) {
        console.error('❌ Validation failed:', parsed.error.issues);
        throw new Error(parsed.error.issues?.[0]?.message || 'Invalid form data');
      }

      // Debug: Log what's ACTUALLY being sent to backend (parsed.data)
      console.log('📤 Payload before validation:', {
        backgroundImage: finalBackgroundImageUrl,
        logo: finalLogoUrl,
        heroImages: finalHeroImageUrls.length + ' images'
      });

      console.log('📤 Payload after validation (parsed.data):', {
        backgroundImage: parsed.data.backgroundImage,
        logo: parsed.data.logo,
        heroImages: parsed.data.heroImages?.length + ' images'
      });

      console.log('🔍 Logo status:', {
        logoFileUploaded: !!logoFile,
        logoPreview: logoPreview?.substring(0, 50),
        finalLogoUrl: finalLogoUrl,
        inParsedData: parsed.data.logo !== undefined,
        parsedLogoValue: parsed.data.logo
      });

      // Add cache-busting timestamp to force fresh data
      const timestamp = Date.now();
      const res = await fetch(`/api/salons/mine?ownerId=${salon.ownerId}&_t=${timestamp}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        let errData: any = null;
        try {
          errData = await res.json();
          console.error('Backend error response:', errData);
        } catch { }

        // Show the actual error message from backend if available
        const errorMessage = errData?.message || errData?.error || `Failed to update salon (${res.status}: ${res.statusText})`;
        throw new Error(errorMessage);
      }

      const updatedSalon = await res.json();

      // Verify logo was actually saved
      console.log('✅ Salon updated successfully! Logo URL:', updatedSalon.logo);

      // Enhanced success notification with logo confirmation
      const logoStatus = finalLogoUrl
        ? (updatedSalon.logo ? '✅ Logo saved!' : '⚠️ Logo may not have saved')
        : '';

      toast.success(
        `✅ Salon profile updated successfully!\n💼 Your changes have been saved and are now live.\n${logoStatus}`,
        { autoClose: 5000 }
      );

      onSalonUpdate(updatedSalon);
      onClose();

      // Force a small delay then trigger refetch in parent component
      setTimeout(() => {
        // This will help ensure cache is cleared
        window.dispatchEvent(new CustomEvent('salon-updated', {
          detail: { salonId: salon.id, logo: updatedSalon.logo }
        }));
      }, 100);

    } catch (error: any) {
      console.error('Salon update error:', error);
      const msg = error?.message || toFriendlyMessage(error, 'Could not update salon profile.');
      setError(msg);
      toast.error(msg, { autoClose: 8000 });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Edit Salon Profile</h2>
        <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formScrollableContent}>
            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.fullWidth}>
              <label htmlFor="name" className={styles.label}>Salon Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={styles.input} />
            </div>
            <div className={styles.fullWidth}>
              <label htmlFor="description" className={styles.label}>Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={styles.textarea} />
            </div>
            <div className={styles.grid}>
              <div>
                <label htmlFor="address" className={styles.label}>Street Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>Province</label>
                <Select
                  value={formData.province || '__none__'}
                  onValueChange={(value) => {
                    const newProvince = value === '__none__' ? '' : value;
                    setFormData(prev => ({ ...prev, province: newProvince, city: '', town: '' }));
                  }}
                  disabled={fieldsLocked}
                >
                  <SelectTrigger className={styles.input} style={{ opacity: fieldsLocked ? 0.7 : 1 }}>
                    <SelectValue placeholder="Select a province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select a province</SelectItem>
                    {Object.keys(locationsData).sort().map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={styles.label}>City/Town</label>
                {fieldsLocked ? (
                  <input
                    type="text"
                    value={formData.city}
                    readOnly
                    disabled
                    className={styles.input}
                    style={{ opacity: 0.7 }}
                  />
                ) : (
                  <Select
                    value={formData.city || '__none__'}
                    onValueChange={(value) => {
                      const selectedCity = value === '__none__' ? '' : value;
                      setFormData(prev => ({ ...prev, city: selectedCity, town: selectedCity }));
                    }}
                    disabled={!formData.province}
                  >
                    <SelectTrigger className={styles.input}>
                      <SelectValue
                        placeholder={!formData.province ? 'Select a province first' : 'Select a city/town'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">
                        {!formData.province ? 'Select a province first' : 'Select a city/town'}
                      </SelectItem>
                      {availableCities.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {fieldsLocked && (
                <div className={styles.fullWidth} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    📍 Location fields auto-populated from map
                  </span>
                  <button
                    type="button"
                    onClick={() => setFieldsLocked(false)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit Location
                  </button>
                </div>
              )}
            </div>
            <h3 className={styles.subheading}>Location</h3>
            <div className={styles.grid}>
              <div className={styles.fullWidth}>
                <label htmlFor="addrQuery" className={styles.label}>Find on Map</label>
                <input
                  id="addrQuery"
                  type="text"
                  value={addrQuery}
                  onChange={async (e) => {
                    const v = e.target.value;
                    setAddrQuery(v);
                    if (v.trim().length > 2) {
                      try {
                        const results = await forwardGeocode(v, { country: 'za', limit: 5 });
                        setAddrSuggestions(results);
                        setShowAddrSuggestions(true);
                      } catch {
                        setAddrSuggestions([]);
                        setShowAddrSuggestions(false);
                      }
                    } else {
                      setAddrSuggestions([]);
                      setShowAddrSuggestions(false);
                    }
                  }}
                  placeholder="Type an address, suburb, or landmark"
                  className={styles.input}
                />
                {showAddrSuggestions && addrSuggestions.length > 0 && (
                  <ul
                    ref={suggestionsRef}
                    style={{ position: 'absolute', zIndex: 10, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: 6, marginTop: 4, width: 'min(520px, 95vw)', listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    {addrSuggestions.map((s: GeocodingResult) => (
                      <li key={s.place_id} style={{ padding: '8px 10px', cursor: 'pointer' }}
                        onClick={() => {
                          setFormData((prev: any) => ({ ...prev, address: s.display_name, latitude: s.lat, longitude: s.lon }));
                          setAddrQuery(s.display_name);
                          setShowAddrSuggestions(false);

                          // Extract and auto-populate location fields from address details
                          if (s.address) {
                            const addr = s.address;
                            const SA_PROVINCES = Object.keys(locationsData);

                            // Extract province/state
                            const provinceValue = addr.state || '';
                            if (provinceValue) {
                              // Try to match with SA provinces
                              const matchedProvince = SA_PROVINCES.find(p =>
                                provinceValue.toLowerCase().includes(p.toLowerCase()) ||
                                p.toLowerCase().includes(provinceValue.toLowerCase())
                              );
                              if (matchedProvince) {
                                setFormData((prev: any) => ({ ...prev, province: matchedProvince }));
                              }
                            }

                            // Extract city
                            const cityValue = addr.city || addr.town || '';
                            // Extract town/suburb - fallback to city if not available
                            const townValue = addr.suburb || cityValue || '';
                            if (cityValue || townValue) {
                              setFormData((prev: any) => ({
                                ...prev,
                                city: cityValue || townValue,
                                town: townValue || cityValue
                              }));
                            }

                            // Lock the fields after auto-population
                            setFieldsLocked(true);
                            toast.success('Location set successfully! 📍 Fields auto-populated.');
                          }
                        }}>
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className={styles.label}>Latitude</label>
                <input type="number" step="any" value={(formData as any).latitude} onChange={(e) => setFormData((p: any) => ({ ...p, latitude: e.target.value }))} className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>Longitude</label>
                <input type="number" step="any" value={(formData as any).longitude} onChange={(e) => setFormData((p: any) => ({ ...p, longitude: e.target.value }))} className={styles.input} />
              </div>
              {(formData as any).latitude && (formData as any).longitude && (
                <div className={styles.fullWidth}>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                    <MapboxMap
                      latitude={Number((formData as any).latitude)}
                      longitude={Number((formData as any).longitude)}
                      height={220}
                      zoom={15}
                      style="streets"
                      markerColor="#F51957"
                    />
                  </div>
                </div>
              )}
            </div>
            <h3 className={styles.subheading}>Contact Information</h3>
            <div className={styles.grid}>
              <div>
                <label htmlFor="phoneNumber" className={styles.label}>Phone Number</label>
                <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={styles.input} />
              </div>
              <div>
                <label htmlFor="contactEmail" className={styles.label}>Contact Email</label>
                <input type="email" id="contactEmail" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className={styles.input} />
              </div>
              <div>
                <label htmlFor="website" className={styles.label}>Website</label>
                <input type="text" id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" className={styles.input} />
              </div>
              <div>
                <label htmlFor="whatsapp" className={styles.label}>WhatsApp Number</label>
                <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={styles.input} />
              </div>
            </div>

            <h3 className={styles.subheading}>Images</h3>
            {isProcessingFile && (
              <div style={{ padding: '12px', background: 'var(--color-surface-elevated)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <span>Processing file...</span>
              </div>
            )}

            {/* Upload Progress Indicators */}
            {Object.keys(uploadProgress).length > 0 && (
              <div style={{ padding: '12px', background: 'var(--color-surface-elevated)', borderRadius: '8px', marginBottom: '16px' }}>
                {uploadProgress.background !== undefined && uploadProgress.background < 100 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Background Image</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>{uploadProgress.background}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress.background}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>
                )}

                {uploadProgress.logo !== undefined && uploadProgress.logo < 100 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Logo</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>{uploadProgress.logo}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress.logo}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>
                )}

                {Object.keys(uploadProgress).filter(k => k.startsWith('hero_')).map(key => {
                  const progress = uploadProgress[key];
                  if (progress >= 100) return null;
                  const index = key.replace('hero_', '');
                  return (
                    <div key={key} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Hero Image {parseInt(index) + 1}</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>{progress}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className={styles.grid}>
              <div className={styles.imageUploadSection}>
                <label className={styles.label}>
                  Background Image
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '4px' }}>
                    Recommended: 1200x600px or larger. Minimum: 600x300px (wide format)
                  </span>
                </label>
                <input
                  type="file"
                  name="backgroundImage"
                  className={styles.fileInput}
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isProcessingFile || isUploading}
                />
                <div className={styles.imagePreviewContainer}>
                  {backgroundImagePreview && (
                    <div className={styles.imageWrapper}>
                      <Image
                        src={backgroundImagePreview}
                        alt="Background Preview"
                        className={styles.imagePreview}
                        width={200}
                        height={160}
                      />
                      <button type="button" className={styles.deleteButton} onClick={() => handleDeleteImage(backgroundImagePreview, 'background')} disabled={isProcessingFile || isUploading}>×</button>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.imageUploadSection}>
                <label className={styles.label}>
                  Salon Logo
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '4px' }}>
                    Recommended: 512x512px or larger. Minimum: 150x150px (square format)
                  </span>
                </label>
                <input
                  type="file"
                  name="logo"
                  className={styles.fileInput}
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isProcessingFile || isUploading}
                />
                <div className={styles.imagePreviewContainer}>
                  {logoPreview && (
                    <div className={styles.imageWrapper}>
                      <Image
                        src={logoPreview}
                        alt="Logo Preview"
                        className={styles.imagePreview}
                        width={200}
                        height={160}
                      />
                      <button type="button" className={styles.deleteButton} onClick={() => handleDeleteImage(logoPreview, 'logo')} disabled={isProcessingFile || isUploading}>×</button>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.imageUploadSection}>
                <label className={styles.label}>
                  Hero Images
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '4px' }}>
                    Recommended: 1200x800px or larger. Minimum: 450x300px per image
                  </span>
                </label>
                <input
                  type="file"
                  name="heroImages"
                  multiple
                  className={styles.fileInput}
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isProcessingFile || isUploading}
                />
                <div className={styles.imagePreviewContainer}>
                  {heroImagesPreview.map((src, index) => (
                    <div key={src} className={styles.imageWrapper}>
                      <Image
                        src={src}
                        alt={`Hero Preview ${index + 1}`}
                        className={styles.imagePreview}
                        width={200}
                        height={160}
                      />
                      <button type="button" className={styles.deleteButton} onClick={() => handleDeleteImage(src, 'hero')} disabled={isProcessingFile || isUploading}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <h3 className={styles.subheading}>Service Type</h3>
            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Service Type</label>
                <Select
                  value={formData.bookingType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, bookingType: value }))}
                >
                  <SelectTrigger className={styles.input}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONSITE">On site</SelectItem>
                    <SelectItem value="MOBILE">Off site (mobile)</SelectItem>
                    <SelectItem value="BOTH">Both on site and off site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.bookingType === 'MOBILE' || formData.bookingType === 'BOTH') && (
                <div>
                  <label htmlFor="mobileFee" className={styles.label}>Mobile Fee (R)</label>
                  <input type="number" id="mobileFee" name="mobileFee" min={0} step="0.01" value={formData.mobileFee} onChange={handleChange} className={styles.input} />
                </div>
              )}
            </div>

            <h3 className={styles.subheading}>Operating Hours</h3>
            <div className={styles.grid}>
              <div className={styles.fullWidth}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ minWidth: 120, fontWeight: 600 }}>Apply to all</span>
                  <input type="time" value={hours['Monday'].open} onChange={(e) => {
                    const v = e.target.value; setHours(prev => { const next = { ...prev }; days.forEach(d => next[d] = { ...next[d], open: v }); return next; });
                  }} className={styles.input} style={{ maxWidth: 160 }} />
                  <span>to</span>
                  <input type="time" value={hours['Monday'].close} onChange={(e) => {
                    const v = e.target.value; setHours(prev => { const next = { ...prev }; days.forEach(d => next[d] = { ...next[d], close: v }); return next; });
                  }} className={styles.input} style={{ maxWidth: 160 }} />
                  <input type="checkbox" checked={Object.values(hours).every(h => h.isOpen)} onChange={(e) => {
                    const isOpen = e.target.checked;
                    setHours(prev => {
                      const next = { ...prev };
                      days.forEach(d => next[d] = { ...next[d], isOpen });
                      return next;
                    });
                  }} />
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {days.map((d) => (
                    <div key={d} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input type="checkbox" checked={hours[d].isOpen} onChange={(e) => setHours(prev => ({ ...prev, [d]: { ...prev[d], isOpen: e.target.checked } }))} />
                      <span style={{ minWidth: 120 }}>{d}</span>
                      <input type="time" value={hours[d].open} disabled={!hours[d].isOpen} onChange={(e) => setHours(prev => ({ ...prev, [d]: { ...prev[d], open: e.target.value } }))} className={styles.input} style={{ maxWidth: 160 }} />
                      <span>to</span>
                      <input type="time" value={hours[d].close} disabled={!hours[d].isOpen} onChange={(e) => setHours(prev => ({ ...prev, [d]: { ...prev[d], close: e.target.value } }))} className={styles.input} style={{ maxWidth: 160 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={isUploading}>
              {isUploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}