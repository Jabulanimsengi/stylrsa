'use client';

import { useState, type FormEvent, useEffect, useRef, useCallback, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './CreateSalon.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { SALON_LISTING_MONTHLY_PRICE, SALON_LISTING_PRICE, type PlanCode } from '@/constants/plans';
import { buildAuthRoute } from '@/constants/routes';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import MapboxMap from '@/components/MapboxMap';
import { forwardGeocode, GeocodingResult } from '@/lib/mapbox';
import { notify } from '@/lib/notify';
import { buildOnboardingClientUrl, buildOnboardingRoleUrl } from '@/lib/authRedirect';

const DRAFT_STORAGE_KEY = 'salon-draft';

interface SalonDraft {
  name: string;
  address: string;
  city: string;
  province: string;
  town: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  description: string;
  bookingType: 'ONSITE' | 'MOBILE' | 'BOTH';
  mobileFee: string;
  latitude: number | null;
  longitude: number | null;
  addrQuery: string;
  fieldsLocked: boolean;
  hours: Record<string, { open: string; close: string; isOpen: boolean }>;
  savedAt: string;
}

type BookingType = SalonDraft['bookingType'];

type CreateSalonPayload = {
  name: string;
  address: string;
  city: string;
  town: string;
  province: string;
  phone: string;
  email: string;
  description: string;
  offersMobile: boolean;
  latitude: number;
  longitude: number;
  planCode: PlanCode;
  hasSentProof: boolean;
  adminConfirmEmailVerified?: boolean;
  website?: string;
  whatsapp?: string;
  mobileFee?: number;
  operatingHours: Array<{ day: string; open: string; close: string }>;
  operatingDays: string[];
};

type CreateSalonError = Error & {
  statusCode?: number;
  userMessage?: string;
};

function CreateSalonPageContent() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [town, setTown] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [bookingType, setBookingType] = useState<'ONSITE' | 'MOBILE' | 'BOTH'>('ONSITE');
  const [mobileFee, setMobileFee] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [addrQuery, setAddrQuery] = useState('');
  const [addrSuggestions, setAddrSuggestions] = useState<GeocodingResult[]>([]);
  const [showAddrSuggestions, setShowAddrSuggestions] = useState(false);
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [hours, setHours] = useState<Record<string, { open: string, close: string, isOpen: boolean }>>(
    Object.fromEntries(days.map(d => [d, { open: '09:00', close: '17:00', isOpen: true }])) as Record<string, { open: string, close: string, isOpen: boolean }>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedPlan: PlanCode = 'PREMIUM';
  const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false);
  const [adminConfirmEmailVerified, setAdminConfirmEmailVerified] = useState(false);
  const { authStatus, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = user?.role === 'ADMIN';
  const canCreateSalon = user?.role === 'SALON_OWNER' || isAdmin;

  useEffect(() => {
    setAdminConfirmEmailVerified(Boolean(user?.emailVerified));
  }, [user?.emailVerified]);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    setIsSaving(true);
    try {
      const draft: SalonDraft = {
        name,
        address,
        city,
        province,
        town,
        postalCode,
        phone,
        email,
        website,
        whatsapp,
        description,
        bookingType,
        mobileFee,
        latitude,
        longitude,
        addrQuery,
        fieldsLocked,
        hours,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setLastSaved(new Date().toLocaleTimeString());
      setHasDraft(true);
      notify.success('Draft saved. You can continue later.', { autoClose: 2000 });
    } catch (error) {
      notify.error('Failed to save draft');
      logger.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [name, address, city, province, town, postalCode, phone, email, website, whatsapp, description, bookingType, mobileFee, latitude, longitude, addrQuery, fieldsLocked, hours]);

  // Load draft from localStorage
  const loadDraft = useCallback((draft: SalonDraft) => {
    setName(draft.name || '');
    setAddress(draft.address || '');
    setCity(draft.city || '');
    setProvince(draft.province || '');
    setTown(draft.town || '');
    setPostalCode(draft.postalCode || '');
    setPhone(draft.phone || '');
    // Don't override email if user is logged in
    if (!user?.email) {
      setEmail(draft.email || '');
    }
    setWebsite(draft.website || '');
    setWhatsapp(draft.whatsapp || '');
    setDescription(draft.description || '');
    setBookingType(draft.bookingType || 'ONSITE');
    setMobileFee(draft.mobileFee || '');
    setLatitude(draft.latitude);
    setLongitude(draft.longitude);
    setAddrQuery(draft.addrQuery || '');
    setFieldsLocked(draft.fieldsLocked || false);
    if (draft.hours) {
      setHours(draft.hours);
    }
    if (draft.savedAt) {
      setLastSaved(new Date(draft.savedAt).toLocaleString());
    }
  }, [user?.email]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setLastSaved(null);
    notify.info('Draft cleared');
  }, []);

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft: SalonDraft = JSON.parse(savedDraft);
        setHasDraft(true);
        // Show prompt to restore draft
        const savedDate = draft.savedAt ? new Date(draft.savedAt).toLocaleString() : 'unknown time';
        if (window.confirm(`You have a saved draft from ${savedDate}. Would you like to restore it?`)) {
          loadDraft(draft);
          notify.success('Draft restored.');
        }
      }
    } catch (error) {
      logger.error('Failed to load draft:', error);
    }
  }, [loadDraft]);




  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        // Small delay to allow click on suggestion to register
        setTimeout(() => setShowAddrSuggestions(false), 200);
      }
    };

    if (showAddrSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddrSuggestions]);

  useEffect(() => {
    // Don't redirect if still loading auth status
    if (authStatus === 'loading') {
      return;
    }

    if (authStatus === 'unauthenticated') {
      const query = searchParams.toString();
      const callbackUrl = `${pathname}${query ? `?${query}` : ''}`;
      router.push(buildAuthRoute.providerRegister(callbackUrl));
    } else if (authStatus === 'authenticated' && user?.email) {
      const query = searchParams.toString();
      const callbackUrl = `${pathname}${query ? `?${query}` : ''}`;

      if (user.role === 'PENDING' || user.onboardingStatus === 'ROLE_REQUIRED') {
        router.push(
          buildOnboardingRoleUrl({
            redirectTarget: callbackUrl,
            preselectedRole: 'SALON_OWNER',
          }),
        );
        return;
      }

      if (user.onboardingStatus === 'CLIENT_PROFILE_REQUIRED') {
        router.push(buildOnboardingClientUrl({ redirectTarget: callbackUrl }));
        return;
      }

      if (!canCreateSalon) {
        notify.error('Only salon owners and admins can create salon profiles.');
        router.push('/');
        return;
      }

      // Pre-fill email from user registration
      setEmail(user.email);

      // Check if user already has a salon - redirect to dashboard if so
      const checkExistingSalon = async () => {
        try {
          const res = await fetch('/api/salons/my-salon', { credentials: 'include' });
          if (res.ok) {
            const salon = await res.json();
            if (salon && salon.id) {
              // User already has a salon, redirect to dashboard
              notify.info('You already have a salon profile. Redirecting to dashboard.');
              router.push('/dashboard');
            }
          }
        } catch {
          // Ignore errors - user might not have a salon yet
          logger.debug('No existing salon found, allowing creation');
        }
      };

      checkExistingSalon();
    }
  }, [authStatus, canCreateSalon, pathname, router, searchParams, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    setIsSubmitting(true);
    try {
      console.log('Validating form...');
      // Client-side guardrails to match backend constraints
      if (town.length > 100) throw new Error('Town must be 100 characters or fewer.');
      if (city.length > 100) throw new Error('City must be 100 characters or fewer.');
      if (province.length === 0) throw new Error('Please select a province.');
      if (name.length > 100) throw new Error('Name must be 100 characters or fewer.');
      if (description.length > 500) throw new Error('Description must be 500 characters or fewer.');
      if (address.length > 255) throw new Error('Address must be 255 characters or fewer.');

      console.log('Checking location:', { latitude, longitude });
      // Require coordinates for proximity-based search
      if (!latitude || !longitude) {
        throw new Error('Please use "Find on Map" to set your salon location. This helps customers find you nearby.');
      }

      const isValidUrl = (value: string) => { try { new URL(value); return true; } catch { return false; } };

      // Validate package selection
      if (!selectedPlan) {
        notify.error('Please select a package to continue.');
        return;
      }

      // Validate payment confirmation
      if (!isAdmin && !hasConfirmedPayment) {
        notify.error('Please confirm that you have completed the bank transfer.');
        return;
      }

      const payload: CreateSalonPayload = {
        name,
        address,
        city,
        town,
        province,
        phone,
        email,
        description,
        offersMobile: bookingType !== 'ONSITE',
        latitude,
        longitude,
        planCode: selectedPlan,
        hasSentProof: isAdmin ? true : hasConfirmedPayment,
        operatingHours: [],
        operatingDays: [],
      };
      if (isAdmin) {
        payload.adminConfirmEmailVerified = adminConfirmEmailVerified;
      }
      if (website && website.trim().length > 0 && isValidUrl(website.trim())) {
        payload.website = website.trim();
      }
      const cleanedWhatsapp = (whatsapp || '').replace(/\D+/g, '');
      if (cleanedWhatsapp) {
        payload.whatsapp = cleanedWhatsapp;
      }
      if (bookingType !== 'ONSITE' && mobileFee !== '') {
        const feeNum = Number(mobileFee);
        if (!Number.isNaN(feeNum) && feeNum >= 0) payload.mobileFee = feeNum;
      }
      // Send operatingHours as a record Day -> "HH:MM - HH:MM" to match details view
      const hoursArray = days
        .filter(d => hours[d].isOpen)
        .map((d) => ({
          day: d,
          open: hours[d].open,
          close: hours[d].close,
        }));
      payload.operatingHours = hoursArray;
      payload.operatingDays = hoursArray.map((entry) => entry.day);

      console.log('Sending payload:', payload);
      const response = await fetch(`/api/salons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        // Try to parse the error response as JSON, but have a fallback.
        const errorData = await response.json().catch(() => ({ message: 'Failed to create salon due to a server error.' }));
        console.error('Error data:', errorData);
        const error: CreateSalonError = new Error(errorData.message || 'Failed to create salon');
        error.statusCode = response.status;
        error.userMessage = errorData.userMessage; // Pass through user-friendly message if available
        throw error;
      }

      // Clear draft on success
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Enhanced success message
      notify.success('Salon profile created successfully.', {
        autoClose: 5000
      });

      // Show next steps
      setTimeout(() => {
        notify.info('Next: add services and set your availability in the dashboard.', {
          autoClose: 7000
        });
      }, 1000);

      console.log('Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Failed to create salon:', error);
      logger.error('Failed to create salon:', error);
      const friendlyMsg = toFriendlyMessage(error, 'Failed to create salon. Please try again.');
      notify.error(friendlyMsg);
      // Fallback alert if toast is missed
      alert(`Error: ${friendlyMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authStatus === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Your Salon Profile</h1>

      <div className={styles.card}>
        {/* Package Selection Section */}
        {/* Selected Package Banner - Always Premium */}
        <div className={styles.selectedPackageBanner}>
          <div className={styles.bannerContent}>
            <h3>Selected Package: Service Listing Plan</h3>
            <p>
              <strong>{SALON_LISTING_MONTHLY_PRICE}</strong> • 5x visibility boost • 0% commission on bookings
            </p>
          </div>
        </div>

        {isAdmin ? (
          <div className={styles.paymentConfirmation}>
            <h3 className={styles.sectionTitle}>Admin Override</h3>
            <div className={styles.paymentInstructions}>
              <p><strong>Admin-created salon profiles skip the normal proof-of-payment gate.</strong></p>
              <p>You can create the profile immediately, and it will open with full owner-style management access on your dashboard.</p>
            </div>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={adminConfirmEmailVerified}
                onChange={(e) => setAdminConfirmEmailVerified(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Confirm that this admin account email has been authenticated</span>
            </label>
          </div>
        ) : (
          <div className={styles.paymentConfirmation}>
            <h3 className={styles.sectionTitle}>Payment Confirmation</h3>
            <div className={styles.paymentInstructions}>
              <p><strong>Bank Transfer Details:</strong></p>
              <p>Please transfer <strong>{SALON_LISTING_PRICE}</strong> to the account below before submitting your salon profile.</p>
              <div className={styles.bankDetailsCard}>
                <div className={styles.bankDetailRow}>
                  <span className={styles.bankDetailLabel}>Account name</span>
                  <strong className={styles.bankDetailValue}>SOFTKORE DEV</strong>
                </div>
                <div className={styles.bankDetailRow}>
                  <span className={styles.bankDetailLabel}>Account number</span>
                  <strong className={styles.bankDetailValue}>2486612161</strong>
                </div>
                <div className={styles.bankDetailRow}>
                  <span className={styles.bankDetailLabel}>Bank</span>
                  <strong className={styles.bankDetailValue}>Capitec Bank</strong>
                </div>
              </div>
              <p className={styles.paymentNote}>Use your salon name as the payment reference.</p>
            </div>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={hasConfirmedPayment}
                onChange={(e) => setHasConfirmedPayment(e.target.checked)}
                className={styles.checkbox}
              />
              <span>I confirm that I have paid {SALON_LISTING_PRICE} to the bank account above</span>
            </label>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label htmlFor="name">Salon Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label htmlFor="addrQuery">Find on Map (Required for location-based search)</label>
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
                placeholder="Search for your exact address (e.g., 123 Main St, Johannesburg)"
                className={styles.input}
              />
              {showAddrSuggestions && addrSuggestions.length > 0 && (
                <ul
                  ref={suggestionsRef}
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    backgroundColor: 'var(--color-surface-elevated, var(--color-bg))',
                    maxHeight: 250,
                    overflowY: 'auto',
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                  {addrSuggestions.map((s: GeocodingResult) => (
                    <li
                      key={s.place_id}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light, rgba(245, 25, 87, 0.1))'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => {
                        setAddress(s.display_name);
                        setLatitude(parseFloat(s.lat));
                        setLongitude(parseFloat(s.lon));
                        setAddrQuery(s.display_name);
                        setShowAddrSuggestions(false);

                        // Extract and auto-populate location fields from address details
                        if (s.address) {
                          const addr = s.address;

                          // Extract province/state directly
                          const provinceValue = addr.state || '';
                          if (provinceValue) {
                            setProvince(provinceValue);
                          }

                          // Extract city
                          const cityValue = addr.city || addr.town || '';
                          if (cityValue) {
                            setCity(cityValue);
                          }

                          // Extract town/suburb - fallback to city if not available
                          const townValue = addr.suburb || addr.city || addr.town || '';
                          if (townValue) {
                            setTown(townValue);
                          }

                          // Extract postal code
                          const postalValue = addr.postcode || '';
                          if (postalValue) {
                            setPostalCode(postalValue);
                          }

                          // Fields are editable, just mark as auto-filled
                          setFieldsLocked(true);
                        }

                        notify.success('Location set successfully. Fields were auto-populated and remain editable.');
                      }}
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {latitude && longitude && (
              <div style={{ marginTop: 8, padding: 8, backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)', borderRadius: 4, fontSize: '0.875rem' }}>
                ✓ Location set: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            )}
            {fieldsLocked && (
              <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: 'var(--color-info-bg, #e3f2fd)', border: '1px solid var(--color-info, #2196f3)', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-strong)' }}>
                  📍 Location fields have been auto-populated from the map. You can edit them if needed.
                </span>
              </div>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="province">Province</label>
            <input
              id="province"
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
              placeholder="e.g., Gauteng, Western Cape"
              className={styles.input}
            />
            {fieldsLocked && (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-soft)', marginTop: '4px' }}>
                Auto-filled from map (editable)
              </span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="city">City/Town</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => {
                const selectedCity = e.target.value;
                setCity(selectedCity);
                setTown(selectedCity);
              }}
              required
              placeholder="e.g., Johannesburg, Cape Town, Hartbeespoort"
              className={styles.input}
            />
            {fieldsLocked && (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-soft)', marginTop: '4px' }}>
                Auto-filled from map (editable)
              </span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="postalCode">Postal Code</label>
            <input
              id="postalCode"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
              placeholder="e.g., 2000, 8001"
              className={styles.input}
            />
            {fieldsLocked && (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-soft)', marginTop: '4px' }}>
                Auto-filled from map (editable)
              </span>
            )}
          </div>
          {latitude && longitude && (
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Map Preview</label>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                <MapboxMap
                  latitude={latitude}
                  longitude={longitude}
                  height={300}
                  zoom={15}
                  interactive={false}
                  style="streets"
                />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: 8 }}>
                This is where your salon will appear on the map. Customers can find you based on their location.
              </p>
            </div>
          )}
          <div className={styles.inputGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Contact Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="website">Website (Optional)</label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="whatsapp">WhatsApp Number (Optional)</label>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g., 0781234567"
              className={styles.input}
            />
          </div>
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className={styles.textarea}
            ></textarea>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="bookingType">Service Type</label>
            <select
              id="bookingType"
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value as BookingType)}
              className={styles.input}
            >
              <option value="ONSITE">On site</option>
              <option value="MOBILE">Off site (mobile)</option>
              <option value="BOTH">Both on site and off site</option>
            </select>
          </div>
          {bookingType !== 'ONSITE' && (
            <div className={styles.inputGroup}>
              <label htmlFor="mobileFee">Mobile Fee (R)</label>
              <input id="mobileFee" type="number" min="0" step="0.01" value={mobileFee} onChange={(e) => setMobileFee(e.target.value)} className={styles.input} />
            </div>
          )}
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label>Operating Hours</label>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ minWidth: 100, fontWeight: 600 }}>Apply to all</span>
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
              {days.map(d => (
                <div key={d} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="checkbox" checked={hours[d].isOpen} onChange={(e) => setHours(prev => ({ ...prev, [d]: { ...prev[d], isOpen: e.target.checked } }))} />
                  <span style={{ minWidth: 100 }}>{d}</span>
                  <input type="time" value={hours[d].open} disabled={!hours[d].isOpen} onChange={(e) => setHours(prev => ({ ...prev, [d]: { ...prev[d], open: e.target.value } }))} className={styles.input} style={{ maxWidth: 160 }} />
                  <span>to</span>
                  <input type="time" value={hours[d].close} disabled={!hours[d].isOpen} onChange={(e) => setHours(prev => ({ ...prev, [d]: { ...prev[d], close: e.target.value } }))} className={styles.input} style={{ maxWidth: 160 }} />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <div className={styles.draftActions}>
              <button
                type="button"
                onClick={saveDraft}
                disabled={isSaving}
                className={styles.saveDraftButton}
              >
                {isSaving ? 'Saving...' : '💾 Save Draft'}
              </button>
              {hasDraft && (
                <button
                  type="button"
                  onClick={clearDraft}
                  className={styles.clearDraftButton}
                >
                  🗑️ Clear Draft
                </button>
              )}
              {lastSaved && (
                <span className={styles.lastSaved}>
                  Last saved: {lastSaved}
                </span>
              )}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Creating...' : 'Create Salon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateSalonPage() {
  return (
    <Suspense fallback={<div className={styles.container}><LoadingSpinner /></div>}>
      <CreateSalonPageContent />
    </Suspense>
  );
}
