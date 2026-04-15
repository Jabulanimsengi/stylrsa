'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './RequestTop10.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { FaCloudUploadAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { forwardGeocode, GeocodingResult } from '@/lib/mapbox';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { ModalShell } from '@/components/ui';

const SERVICE_CATEGORIES = [
  { id: 'hair-salon', name: 'Hair Salon', icon: '💇' },
  { id: 'makeup', name: 'Makeup', icon: '💄' },
  { id: 'nails', name: 'Nails', icon: '💅' },
  { id: 'spa', name: 'Spa', icon: '🧖' },
  { id: 'barber', name: 'Barber', icon: '✂️' },
  { id: 'massage', name: 'Massage', icon: '💆' },
  { id: 'beauty', name: 'Beauty Services', icon: '✨' },
];

// Use GeocodingResult from mapbox lib for type safety
type LocationSuggestion = GeocodingResult;

interface RequestTop10ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_IMAGES = 5;

export default function RequestTop10Modal({ isOpen, onClose }: RequestTop10ModalProps) {
  const { user, authStatus } = useAuth();
  const { openModal } = useAuthModal();

  const [step, setStep] = useState<'category' | 'form'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [styleOrLook, setStyleOrLook] = useState('');
  const [budget, setBudget] = useState('');
  const [serviceType, setServiceType] = useState<'onsite' | 'inhouse'>('inhouse');
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  // Image upload
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Auto-populate user fields when logged in
  useEffect(() => {
    if (user && isOpen) {
      const userName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      if (userName) setFullName(userName);
      if (user.email) setEmail(user.email);
    }
  }, [user, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('category');
      setSelectedCategory(null);
      setSubmitSuccess(false);
      setError(null);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    // Only reset non-user fields, keep user data
    setServiceNeeded('');
    setStyleOrLook('');
    setBudget('');
    setServiceType('inhouse');
    setLocation('');
    setLocationCoords(null);
    setPreferredDate('');
    setPreferredTime('');
    setImages([]);
  };

  // Location autocomplete using Mapbox Geocoding API (fast)
  const handleLocationChange = async (value: string) => {
    setLocation(value);
    setLocationCoords(null);

    if (value.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const results = await forwardGeocode(value, { country: 'za', limit: 5 });
      setLocationSuggestions(results as LocationSuggestion[]);
      setShowSuggestions(true);
    } catch {
      // Silently fail - user can still type manually
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    // Build a clean display name
    const addr = suggestion.address;
    const parts = [
      addr?.suburb || addr?.city || addr?.town,
      addr?.state,
    ].filter(Boolean);
    const displayName = parts.length > 0 ? parts.join(', ') : suggestion.display_name.split(',').slice(0, 2).join(',');

    setLocation(displayName);
    setShowSuggestions(false);

    // Set coordinates from Mapbox response
    if (suggestion.lat && suggestion.lon) {
      setLocationCoords({
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon),
      });
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Image upload handler
  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      toast.warning(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Upload to Cloudinary via our API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'urgent-requests');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            uploadedUrls.push(data.url);
          }
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setImages(prev => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded`);
      }
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCategorySelect = (categoryId: string) => {
    // Check if user is logged in
    if (authStatus !== 'authenticated') {
      toast.info('Please log in to submit an urgent request');
      openModal('login');
      return;
    }

    setSelectedCategory(categoryId);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const categoryName = SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory;

    const requestData = {
      userId: user?.id,
      fullName,
      phone,
      whatsapp: whatsapp || undefined,
      email: email || undefined,
      category: categoryName,
      serviceNeeded,
      styleOrLook: styleOrLook || undefined,
      budget,
      serviceType,
      location,
      locationCoords,
      preferredDate,
      preferredTime: preferredTime || undefined,
      images: images.length > 0 ? images : undefined,
    };

    try {
      const response = await fetch('/api/top10-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      setSubmitSuccess(true);
    } catch {
      setError('Failed to submit your request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getCategoryName = () => SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name || '';

  return (
    <ModalShell
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={step === 'category' ? 'Urgent Request' : `Urgent ${getCategoryName()} Request`}
      description={
        step === 'category'
          ? 'Get matched with top service providers in your area.'
          : 'Fill in your details and we will match you with top providers.'
      }
      size="lg"
      className={styles.modal}
      bodyClassName="px-0 py-0"
    >
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>

        {submitSuccess ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✅</div>
            <h2>Urgent Request Submitted!</h2>
            <p>
              Our admin team will match you with top {getCategoryName()} providers near you within minutes.
              You will be contacted shortly.
            </p>
            <div className={styles.contactInfo}>
              <p>Need faster assistance?</p>
              <p>📱 WhatsApp: <a href="https://wa.me/27738021196">073 802 1196</a></p>
              <p>📧 Email: <a href="mailto:support@stylrsa.co.za">support@stylrsa.co.za</a></p>
            </div>
            <button className={styles.primaryButton} onClick={onClose}>
              Done
            </button>
          </div>
        ) : step === 'category' ? (
          <>
            <div className={styles.header}>
              <h2>🚨 Urgent Request</h2>
              <p className={styles.tagline}>
                Get Matched With Top Service Providers in Your Area - Fast!
              </p>
              {authStatus !== 'authenticated' && (
                <p className={styles.loginNotice}>
                  <button onClick={() => openModal('login')} className={styles.loginLink}>
                    Log in
                  </button>
                  {' '}to submit an urgent request
                </p>
              )}
            </div>
            <div className={styles.categoryGrid}>
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={styles.categoryCard}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  <span className={styles.categoryIcon}>{cat.icon}</span>
                  <span className={styles.categoryName}>{cat.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={styles.header}>
              <button className={styles.backButton} onClick={() => setStep('category')}>
                ← Back
              </button>
              <h2>🚨 Urgent {getCategoryName()} Request</h2>
              <p className={styles.tagline}>
                Fill in your details and we&apos;ll match you with top providers
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.section}>
                <h3>Contact Details</h3>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Name Surname"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081 234 5678"
                      required
                    />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label htmlFor="whatsapp">WhatsApp (recommended)</label>
                    <input
                      id="whatsapp"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="081 234 5678"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Service Details</h3>
                <div className={styles.field}>
                  <label htmlFor="serviceNeeded">What service do you need? *</label>
                  <input
                    id="serviceNeeded"
                    type="text"
                    value={serviceNeeded}
                    onChange={(e) => setServiceNeeded(e.target.value)}
                    placeholder="e.g., Braids, Gel nails, Full makeup..."
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="styleOrLook">Style or look (optional)</label>
                  <input
                    id="styleOrLook"
                    type="text"
                    value={styleOrLook}
                    onChange={(e) => setStyleOrLook(e.target.value)}
                    placeholder="Describe the style you want..."
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label htmlFor="budget">Budget (R) *</label>
                    <input
                      id="budget"
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., 500 or 300-600"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Service Type *</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="serviceType"
                          value="inhouse"
                          checked={serviceType === 'inhouse'}
                          onChange={() => setServiceType('inhouse')}
                        />
                        <span>Visit Salon</span>
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="serviceType"
                          value="onsite"
                          checked={serviceType === 'onsite'}
                          onChange={() => setServiceType('onsite')}
                        />
                        <span>Mobile (come to me)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className={styles.section}>
                <h3>Reference Photos (Optional)</h3>
                <p className={styles.imageHint}>
                  Upload up to {MAX_IMAGES} photos of the style you want
                </p>

                <div className={styles.imageUploadArea}>
                  {images.length < MAX_IMAGES && (
                    <div
                      className={styles.uploadBox}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <LoadingSpinner size="sm" inline />
                      ) : (
                        <>
                          <FaCloudUploadAlt className={styles.uploadIcon} />
                          <span>Click to upload</span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files)}
                        hidden
                      />
                    </div>
                  )}

                  {images.map((img, idx) => (
                    <div key={idx} className={styles.imagePreview}>
                      <Image
                        src={img}
                        alt={`Reference ${idx + 1}`}
                        fill
                        className={styles.previewImg}
                      />
                      <button
                        type="button"
                        className={styles.removeImageBtn}
                        onClick={() => removeImage(idx)}
                        aria-label="Remove image"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
                <p className={styles.imageCount}>{images.length} / {MAX_IMAGES} images</p>
              </div>

              <div className={styles.section}>
                <h3>Location & Time</h3>
                <div className={styles.field}>
                  <label htmlFor="location">Your Location *</label>
                  <div className={styles.locationWrapper}>
                    <input
                      ref={locationInputRef}
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Start typing your area..."
                      required
                      autoComplete="off"
                    />
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <div ref={suggestionsRef} className={styles.suggestions}>
                        {locationSuggestions.map((s) => {
                          const addr = s.address;
                          const mainText = addr?.suburb || addr?.city || addr?.town || s.display_name.split(',')[0];
                          const secondaryText = [addr?.state, addr?.country].filter(Boolean).join(', ') || s.display_name.split(',').slice(1, 3).join(',');
                          return (
                            <button
                              key={s.place_id}
                              type="button"
                              className={styles.suggestionItem}
                              onClick={() => handleSelectLocation(s)}
                            >
                              <span className={styles.suggestionMain}>
                                {mainText}
                              </span>
                              <span className={styles.suggestionSecondary}>
                                {secondaryText}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label htmlFor="preferredDate">Preferred Date *</label>
                    <input
                      id="preferredDate"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="preferredTime">Preferred Time (optional)</label>
                    <input
                      id="preferredTime"
                      type="time"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.contactInfo}>
                <p>📱 WhatsApp: <a href="https://wa.me/27738021196">073 802 1196</a></p>
                <p>📧 Email: <a href="mailto:support@stylrsa.co.za">support@stylrsa.co.za</a></p>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : '🚨 Submit Urgent Request'}
              </button>

              <p className={styles.disclaimer}>
                Our admin team will match you with top providers within minutes.
              </p>
            </form>
          </>
        )}
      </div>
    </ModalShell>
  );
}
