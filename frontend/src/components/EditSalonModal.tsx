// frontend/srcs/components/EditSalonModal.tsx

'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import Image from 'next/image';
import { Salon } from '@/types';
import styles from './EditSalonModal.module.css';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { uploadToCloudinary, transformCloudinary } from '@/utils/cloudinary';
import { SalonUpdateSchema } from '@/lib/validation/schemas';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui';
import MapboxMap from '@/components/MapboxMap';
import { forwardGeocode, GeocodingResult } from '@/lib/mapbox';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

type DayName = (typeof DAYS)[number];
type DayHours = { open: string; close: string; isOpen: boolean };
type HoursState = Record<DayName, DayHours>;
type EditSalonFormState = {
  name: string;
  description: string;
  province: string;
  city: string;
  town: string;
  address: string;
  bookingType: string;
  mobileFee: number;
  operatingHours: unknown;
  contactEmail: string;
  phoneNumber: string;
  whatsapp: string;
  website: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  googleReviewsUrl: string;
  freshaReviewsUrl: string;
  booksyReviewsUrl: string;
  latitude: number | '';
  longitude: number | '';
};

interface EditSalonModalProps {
  salon: Salon;
  onClose: () => void;
  onSalonUpdate: (updatedSalon: Salon) => void;
}

export default function EditSalonModal({ salon, onClose, onSalonUpdate }: EditSalonModalProps) {
  const [formData, setFormData] = useState<EditSalonFormState>({
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
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    googleReviewsUrl: '',
    freshaReviewsUrl: '',
    booksyReviewsUrl: '',
    latitude: '' as number | '',
    longitude: '' as number | '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [heroImagesPreview, setHeroImagesPreview] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [originalHeroImages, setOriginalHeroImages] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState('');
  const [addrQuery, setAddrQuery] = useState('');
  const [addrSuggestions, setAddrSuggestions] = useState<GeocodingResult[]>([]);
  const [showAddrSuggestions, setShowAddrSuggestions] = useState(false);
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const [hours, setHours] = useState<HoursState>(
    Object.fromEntries(DAYS.map((day) => [day, { open: '09:00', close: '17:00', isOpen: true }])) as HoursState,
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
        facebookUrl: salon.facebookUrl || '',
        instagramUrl: salon.instagramUrl || '',
        tiktokUrl: salon.tiktokUrl || '',
        googleReviewsUrl: salon.googleReviewsUrl || '',
        freshaReviewsUrl: salon.freshaReviewsUrl || '',
        booksyReviewsUrl: salon.booksyReviewsUrl || '',
        latitude: salon.latitude ?? '',
        longitude: salon.longitude ?? '',
      });
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
      setOriginalHeroImages(salon.heroImages || []);
      setHeroImagesPreview(
        salon.heroImages?.map(img =>
          transformCloudinary(img, { width: 400, quality: 'auto', format: 'auto' })
        ) || []
      );

      // Parse operating hours from salon data
      const rawHours = salon.operatingHours as unknown;
      const nextHours = {} as HoursState;

      // Initialize all days as closed first
      DAYS.forEach((day) => {
        nextHours[day] = { open: '09:00', close: '17:00', isOpen: false };
      });

      if (Array.isArray(rawHours)) {
        // Handle array format: [{ day: 'Monday', open: '09:00', close: '17:00' }, ...]
        rawHours.forEach((entry: { day?: string; open?: string; close?: string }) => {
          if (!entry?.day) return;
          const dayName = entry.day as DayName;
          if (DAYS.includes(dayName)) {
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
        DAYS.forEach((day) => {
          const val = hoursRecord[day];
          if (val && typeof val === 'string') {
            const match = val.match(/(\d{1,2}:\d{2}).*(\d{1,2}:\d{2})/);
            if (match) {
              nextHours[day] = { open: match[1], close: match[2], isOpen: true };
            }
          }
        });
      }

      setHours(nextHours);
    }
  }, [salon]);


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

  useEffect(() => () => {
    if (logoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
  }, [logoPreview]);

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
      if (name !== 'logo' || !files[0]) {
        return;
      }

      const file = files[0];
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error(`File too large. Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
      }

      await validateImageDimensions(file, 150, 150, { width: 512, height: 512 });

      setLogoFile(file);
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(URL.createObjectURL(file));
      toast.success('Logo image selected. Square logos preview best.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMessage);
      toast.error(errorMessage);
      // Reset the file input
      e.target.value = '';
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDeleteLogo = () => {
    if (logoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleDeleteImage = (_imageUrlToDelete: string, imageType: 'background' | 'logo' | 'hero') => {
    if (imageType === 'logo') {
      handleDeleteLogo();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');

    try {
      const finalBackgroundImageUrl: string | null = salon.backgroundImage || null;
      const finalHeroImageUrls = originalHeroImages;
      let finalLogoUrl: string | null = null;
      if (logoFile && logoPreview?.startsWith('blob:')) {
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
        finalLogoUrl = salon.logo || null;
      }

      const isValidUrl = (value: string) => {
        try { new URL(value); return true; } catch { return false; }
      };

      const cleanedWhatsapp = (formData.whatsapp || '').replace(/\D+/g, '');
      const websiteValue = formData.website?.trim();
      const facebookValue = formData.facebookUrl?.trim();
      const instagramValue = formData.instagramUrl?.trim();
      const tiktokValue = formData.tiktokUrl?.trim();
      const googleReviewsValue = formData.googleReviewsUrl?.trim();
      const freshaReviewsValue = formData.freshaReviewsUrl?.trim();
      const booksyReviewsValue = formData.booksyReviewsUrl?.trim();

      // Compose operatingHours as array entries compatible with backend DTO
      const hoursArray = DAYS
        .filter((d) => hours[d].isOpen)
        .map((d) => ({
          day: d,
          open: hours[d].open,
          close: hours[d].close,
        }));

      const normalizedMobileFee =
        formData.bookingType !== 'ONSITE'
          ? (() => {
            const feeNum = Number(formData.mobileFee);
            return Number.isFinite(feeNum) && feeNum >= 0 ? feeNum : 0;
          })()
          : 0;

      const payload = {
        ...formData,
        whatsapp: cleanedWhatsapp || null,
        website: websiteValue ? (isValidUrl(websiteValue) ? websiteValue : undefined) : null,
        facebookUrl: facebookValue ? (isValidUrl(facebookValue) ? facebookValue : undefined) : null,
        instagramUrl: instagramValue ? (isValidUrl(instagramValue) ? instagramValue : undefined) : null,
        tiktokUrl: tiktokValue ? (isValidUrl(tiktokValue) ? tiktokValue : undefined) : null,
        googleReviewsUrl: googleReviewsValue ? (isValidUrl(googleReviewsValue) ? googleReviewsValue : undefined) : null,
        freshaReviewsUrl: freshaReviewsValue ? (isValidUrl(freshaReviewsValue) ? freshaReviewsValue : undefined) : null,
        booksyReviewsUrl: booksyReviewsValue ? (isValidUrl(booksyReviewsValue) ? booksyReviewsValue : undefined) : null,
        logo: finalLogoUrl,
        latitude: formData.latitude !== '' ? Number(formData.latitude) : undefined,
        longitude: formData.longitude !== '' ? Number(formData.longitude) : undefined,
        operatingHours: hoursArray,
        operatingDays: hoursArray.map((entry) => entry.day),
        mobileFee: normalizedMobileFee,
        offersMobile: formData.bookingType !== 'ONSITE',
      };

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
        let errData: { message?: string; error?: string } | null = null;
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
        `✅ Salon profile updated successfully!\n⏳ Your changes have been submitted for admin review.\n${logoStatus}`,
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

    } catch (error: unknown) {
      console.error('Salon update error:', error);
      const msg = error instanceof Error ? error.message : toFriendlyMessage(error, 'Could not update salon profile.');
      setError(msg);
      toast.error(msg, { autoClose: 8000 });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[min(92vw,760px)] max-h-[90vh] overflow-hidden p-0 gap-0">
        <DialogTitle className="sr-only">Edit Salon Profile</DialogTitle>
        <div className={styles.modalContent} style={{ position: 'relative', backgroundColor: 'transparent', boxShadow: 'none' }}>
          <h2 className={styles.title}>Edit Salon Profile</h2>

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
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    placeholder="e.g., Gauteng, Western Cape"
                    className={styles.input}
                  />
                  {fieldsLocked && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-soft)', marginTop: '4px', display: 'block' }}>
                      Auto-filled from map (editable)
                    </span>
                  )}
                </div>
                <div>
                  <label className={styles.label}>City/Town</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, city: value, town: value }));
                    }}
                    placeholder="e.g., Johannesburg, Cape Town, Hartbeespoort"
                    className={styles.input}
                  />
                  {fieldsLocked && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-soft)', marginTop: '4px', display: 'block' }}>
                      Auto-filled from map (editable)
                    </span>
                  )}
                </div>
              </div>
              <h3 className={styles.subheading}>Location</h3>
              <div className={styles.grid}>
                <div className={styles.fullWidth}>
                  <label htmlFor="addrQuery" className={styles.label}>Find on Map</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="addrQuery"
                      type="text"
                      value={addrQuery}
                      onChange={async (e) => {
                        const v = e.target.value;
                        setAddrQuery(v);
                        if (v.trim().length > 2) {
                          try {
                            console.log('Searching for:', v);
                            const results = await forwardGeocode(v, { country: 'za', limit: 5 });
                            console.log('Mapbox results:', results);
                            setAddrSuggestions(results);
                            setShowAddrSuggestions(results.length > 0);
                          } catch (error) {
                            console.error('Mapbox search error:', error);
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
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 100,
                          background: 'var(--color-surface-elevated)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 6,
                          marginTop: 4,
                          listStyle: 'none',
                          padding: 0,
                          maxHeight: '300px',
                          overflowY: 'auto',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        {addrSuggestions.map((s) => (
                          <li
                            key={s.place_id}
                            style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light, rgba(245, 25, 87, 0.1))'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                address: s.display_name,
                                latitude: Number(s.lat),
                                longitude: Number(s.lon),
                              }));
                              setAddrQuery(s.display_name);
                              setShowAddrSuggestions(false);

                              // Extract and auto-populate location fields from address details
                              if (s.address) {
                                const addr = s.address;

                                // Extract province/state directly
                                const provinceValue = addr.state || '';
                                if (provinceValue) {
                                  setFormData((prev) => ({ ...prev, province: provinceValue }));
                                }

                                // Extract city
                                const cityValue = addr.city || addr.town || '';
                                // Extract town/suburb - fallback to city if not available
                                const townValue = addr.suburb || cityValue || '';
                                if (cityValue || townValue) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    city: cityValue || townValue,
                                    town: townValue || cityValue
                                  }));
                                }

                                // Fields are editable, just mark as auto-filled
                                setFieldsLocked(true);
                                toast.success('Location set successfully! 📍 Fields auto-populated and editable.');
                              }
                            }}
                          >
                            {s.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Latitude</label>
                  <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData((p) => ({ ...p, latitude: e.target.value === '' ? '' : Number(e.target.value) }))} className={styles.input} />
                </div>
                <div>
                  <label className={styles.label}>Longitude</label>
                  <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData((p) => ({ ...p, longitude: e.target.value === '' ? '' : Number(e.target.value) }))} className={styles.input} />
                </div>
                {formData.latitude !== '' && formData.longitude !== '' && (
                  <div className={styles.fullWidth}>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                      <MapboxMap
                        latitude={Number(formData.latitude)}
                        longitude={Number(formData.longitude)}
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
                <div>
                  <label htmlFor="facebookUrl" className={styles.label}>Facebook URL</label>
                  <input type="url" id="facebookUrl" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} placeholder="https://www.facebook.com/your-salon" className={styles.input} />
                </div>
                <div>
                  <label htmlFor="instagramUrl" className={styles.label}>Instagram URL</label>
                  <input type="url" id="instagramUrl" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} placeholder="https://www.instagram.com/your-salon" className={styles.input} />
                </div>
                <div>
                  <label htmlFor="tiktokUrl" className={styles.label}>TikTok URL</label>
                  <input type="url" id="tiktokUrl" name="tiktokUrl" value={formData.tiktokUrl} onChange={handleChange} placeholder="https://www.tiktok.com/@your-salon" className={styles.input} />
                </div>
                <div>
                  <label htmlFor="googleReviewsUrl" className={styles.label}>Google Reviews URL</label>
                  <input type="url" id="googleReviewsUrl" name="googleReviewsUrl" value={formData.googleReviewsUrl} onChange={handleChange} placeholder="https://g.page/r/..." className={styles.input} />
                </div>
                <div>
                  <label htmlFor="freshaReviewsUrl" className={styles.label}>Fresha Reviews URL</label>
                  <input type="url" id="freshaReviewsUrl" name="freshaReviewsUrl" value={formData.freshaReviewsUrl} onChange={handleChange} placeholder="https://www.fresha.com/..." className={styles.input} />
                </div>
                <div>
                  <label htmlFor="booksyReviewsUrl" className={styles.label}>Booksy Reviews URL</label>
                  <input type="url" id="booksyReviewsUrl" name="booksyReviewsUrl" value={formData.booksyReviewsUrl} onChange={handleChange} placeholder="https://booksy.com/..." className={styles.input} />
                </div>
              </div>

              <h3 className={styles.subheading}>Branding</h3>
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
                <div className={styles.imageUploadSection} hidden>
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoPreview} alt="Logo Preview" className={styles.imagePreview} />
                        <button type="button" className={styles.deleteButton} onClick={() => handleDeleteImage(logoPreview, 'logo')} disabled={isProcessingFile || isUploading}>×</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.imageUploadSection} hidden>
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
                      const v = e.target.value; setHours(prev => { const next = { ...prev }; DAYS.forEach((d) => { next[d] = { ...next[d], open: v }; }); return next; });
                    }} className={styles.input} style={{ maxWidth: 160 }} />
                    <span>to</span>
                    <input type="time" value={hours['Monday'].close} onChange={(e) => {
                      const v = e.target.value; setHours(prev => { const next = { ...prev }; DAYS.forEach((d) => { next[d] = { ...next[d], close: v }; }); return next; });
                    }} className={styles.input} style={{ maxWidth: 160 }} />
                    <input type="checkbox" checked={Object.values(hours).every(h => h.isOpen)} onChange={(e) => {
                      const isOpen = e.target.checked;
                      setHours(prev => {
                        const next = { ...prev };
                        DAYS.forEach((d) => { next[d] = { ...next[d], isOpen }; });
                        return next;
                      });
                    }} />
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {DAYS.map((d) => (
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
      </DialogContent>
    </Dialog>
  );
}
