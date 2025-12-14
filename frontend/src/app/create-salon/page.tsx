'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import styles from './CreateSalon.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import PageNav from '@/components/PageNav';
import { APP_PLANS, PLAN_BY_CODE, PlanCode } from '@/constants/plans';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';

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
  description: string;
  bookingType: 'ONSITE' | 'MOBILE' | 'BOTH';
  mobileFee: string;
  selectedPlan: PlanCode;
  hasSentProof: boolean;
  paymentReference: string;
  latitude: number | null;
  longitude: number | null;
  addrQuery: string;
  fieldsLocked: boolean;
  hours: Record<string, { open: string; close: string; isOpen: boolean }>;
  savedAt: string;
}

export default function CreateSalonPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [town, setTown] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [bookingType, setBookingType] = useState<'ONSITE' | 'MOBILE' | 'BOTH'>('ONSITE');
  const [mobileFee, setMobileFee] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>('STARTER');
  const [hasSentProof, setHasSentProof] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [locationsData, setLocationsData] = useState<Record<string, string[]>>({});
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [addrQuery, setAddrQuery] = useState('');
  const [addrSuggestions, setAddrSuggestions] = useState<any[]>([]);
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
  const { authStatus, user } = useAuth();
  const router = useRouter();

  const selectedPlanDetails = PLAN_BY_CODE[selectedPlan];
  const BANK_DETAILS = {
    bank: 'Capitec Bank',
    accountNumber: '1618097723',
    accountHolder: 'J Msengi',
    whatsapp: '0738021196',
  };

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
        description,
        bookingType,
        mobileFee,
        selectedPlan,
        hasSentProof,
        paymentReference,
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
      toast.success('Draft saved! You can continue later.', { autoClose: 2000 });
    } catch (error) {
      toast.error('Failed to save draft');
      logger.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [name, address, city, province, town, postalCode, phone, email, website, description, bookingType, mobileFee, selectedPlan, hasSentProof, paymentReference, latitude, longitude, addrQuery, fieldsLocked, hours]);

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
    setDescription(draft.description || '');
    setBookingType(draft.bookingType || 'ONSITE');
    setMobileFee(draft.mobileFee || '');
    setSelectedPlan(draft.selectedPlan || 'STARTER');
    setHasSentProof(draft.hasSentProof || false);
    setPaymentReference(draft.paymentReference || '');
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
    toast.info('Draft cleared');
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
          toast.success('Draft restored!');
        }
      }
    } catch (error) {
      logger.error('Failed to load draft:', error);
    }
  }, [loadDraft]);

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
        logger.error('Failed to fetch locations data:', error);
      }
    };
    fetchLocations();
  }, []);

  // Update available cities when province changes
  useEffect(() => {
    if (province && locationsData[province]) {
      setAvailableCities(locationsData[province]);
      // Reset city if it's not in the new province's cities
      if (city && !locationsData[province].includes(city)) {
        setCity('');
      }
    } else {
      setAvailableCities([]);
    }
  }, [province, locationsData, city]);

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
      // Redirect to home with auth modal instead of /login page
      router.push('/?auth=login&redirect=/create-salon');
    } else if (authStatus === 'authenticated' && user?.email) {
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
              toast.info('You already have a salon profile. Redirecting to dashboard...');
              router.push('/dashboard');
            }
          }
        } catch (error) {
          // Ignore errors - user might not have a salon yet
          logger.debug('No existing salon found, allowing creation');
        }
      };

      checkExistingSalon();
    }
  }, [authStatus, router, user]);

  const SA_PROVINCES = Object.keys(locationsData).sort();

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

      const payload: any = {
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
      };
      if (website && website.trim().length > 0 && isValidUrl(website.trim())) {
        payload.website = website.trim();
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
      payload.planCode = selectedPlan;
      payload.hasSentProof = hasSentProof;
      const effectiveReference = paymentReference.trim().length > 0 ? paymentReference.trim() : name.trim();
      if (effectiveReference.length > 0) {
        payload.paymentReference = effectiveReference;
      }

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
        const error: any = new Error(errorData.message || 'Failed to create salon');
        error.statusCode = response.status;
        error.userMessage = errorData.userMessage; // Pass through user-friendly message if available
        throw error;
      }

      // Enhanced success message
      toast.success('🎉 Salon profile created successfully!', {
        autoClose: 5000
      });

      // Show next steps
      setTimeout(() => {
        toast.info('💡 Next: Add services and set your availability in the dashboard', {
          autoClose: 7000
        });
      }, 1000);

      console.log('Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Failed to create salon:', error);
      logger.error('Failed to create salon:', error);
      const friendlyMsg = toFriendlyMessage(error, 'Failed to create salon. Please try again.');
      toast.error(friendlyMsg);
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
      <PageNav />
      <h1 className={styles.title}>Create Your Salon</h1>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.planSection}>
            <div>
              <h2 className={styles.sectionTitle}>Select your package</h2>
              <p className={styles.sectionHint}>
                Choose the plan that matches your growth goals. These packages apply to both salon owners and product sellers.
              </p>
            </div>
            <div className={styles.planGrid}>
              {APP_PLANS.map((plan) => {
                const isSelected = plan.code === selectedPlan;
                return (
                  <button
                    type="button"
                    key={plan.code}
                    onClick={() => setSelectedPlan(plan.code as PlanCode)}
                    className={`${styles.planCard} ${isSelected ? styles.planCardSelected : ''}`}
                    aria-pressed={isSelected}
                  >
                    <div className={styles.planCardHeader}>
                      <span className={styles.planName}>{plan.name}</span>
                      <span className={styles.planPrice}>{plan.price}<span className={styles.planPerMonth}>/mo</span></span>
                    </div>
                    <div className={styles.planDetails}>
                      <span>Max listings: <strong>{plan.maxListings}</strong></span>
                      <span>Visibility weight: <strong>{plan.visibilityWeight}</strong></span>
                    </div>
                    <ul className={styles.planFeatures}>
                      {plan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <div className={styles.paymentNotice}>
              <p>
                Send the package amount of <strong>{selectedPlanDetails.price}</strong> to <strong>{BANK_DETAILS.bank}</strong>, account <strong>{BANK_DETAILS.accountNumber}</strong> (Account holder: <strong>{BANK_DETAILS.accountHolder}</strong>). Please make an instant payment to allow us to track the payment fast. Use <strong>{(paymentReference.trim() || name || 'your salon name')}</strong> as the payment reference and WhatsApp the proof to <strong>{BANK_DETAILS.whatsapp}</strong> immediately after payment.
              </p>
            </div>
            <div className={styles.planControls}>
              <div className={styles.inputGroup}>
                <label htmlFor="paymentReference">Payment reference</label>
                <input
                  id="paymentReference"
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={name || 'Salon name'}
                  className={styles.input}
                />
              </div>
              <label className={styles.proofCheckbox}>
                <input
                  type="checkbox"
                  checked={hasSentProof}
                  onChange={(e) => setHasSentProof(e.target.checked)}
                />
                <span>I have sent the proof of payment via WhatsApp</span>
              </label>
            </div>
          </div>
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
            <input
              id="addrQuery"
              type="text"
              value={addrQuery}
              onChange={(e) => {
                const v = e.target.value;
                setAddrQuery(v);
                if (v.trim().length > 2) {
                  const q = encodeURIComponent(v);
                  fetch(`https://nominatim.openstreetmap.org/search?q=${q}, South Africa&format=json&limit=5&addressdetails=1`, {
                    headers: { 'User-Agent': 'HairProsDirectory' }
                  })
                    .then(r => r.json())
                    .then(data => {
                      setAddrSuggestions(data || []);
                      setShowAddrSuggestions(true);
                    })
                    .catch(() => {
                      setAddrSuggestions([]);
                      setShowAddrSuggestions(false);
                    });
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
                  margin: '4px 0 0 0',
                  padding: 0,
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  backgroundColor: 'var(--color-surface-elevated, var(--color-bg))',
                  maxHeight: 250,
                  overflowY: 'auto',
                  position: 'absolute',
                  zIndex: 100,
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                {addrSuggestions.map((s) => (
                  <li
                    key={s.place_id}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'}
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

                        // Extract province/state
                        const provinceValue = addr.state || addr.province || '';
                        if (provinceValue) {
                          // Try to match with SA provinces
                          const matchedProvince = SA_PROVINCES.find(p =>
                            provinceValue.toLowerCase().includes(p.toLowerCase()) ||
                            p.toLowerCase().includes(provinceValue.toLowerCase())
                          );
                          if (matchedProvince) {
                            setProvince(matchedProvince);
                          }
                        }

                        // Extract city
                        const cityValue = addr.city || addr.town || addr.municipality || addr.county || '';
                        if (cityValue) {
                          setCity(cityValue);
                        }

                        // Extract town/suburb - fallback to city if not available
                        const townValue = addr.suburb || addr.neighbourhood || addr.village || addr.city || addr.town || addr.municipality || '';
                        if (townValue) {
                          setTown(townValue);
                        }

                        // Extract postal code
                        const postalValue = addr.postcode || '';
                        if (postalValue) {
                          setPostalCode(postalValue);
                        }

                        // Lock the fields after auto-population
                        setFieldsLocked(true);
                      }

                      toast.success('Location set successfully! 📍 Fields auto-populated.');
                    }}
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )}
            {latitude && longitude && (
              <div style={{ marginTop: 8, padding: 8, backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)', borderRadius: 4, fontSize: '0.875rem' }}>
                ✓ Location set: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            )}
            {fieldsLocked && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <div className={styles.inputGroup}>
            <label htmlFor="province">Province</label>
            <select
              id="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
              disabled={fieldsLocked}
              className={styles.input}
              style={{ opacity: fieldsLocked ? 0.7 : 1 }}
            >
              <option value="" disabled>Select a province</option>
              {SA_PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="city">City/Town</label>
            {fieldsLocked ? (
              <input
                id="city"
                type="text"
                value={city}
                readOnly
                disabled
                className={styles.input}
                style={{ opacity: 0.7 }}
              />
            ) : (
              <select
                id="city"
                value={city}
                onChange={(e) => {
                  const selectedCity = e.target.value;
                  setCity(selectedCity);
                  setTown(selectedCity);
                }}
                required
                disabled={!province}
                className={styles.input}
              >
                <option value="" disabled>
                  {!province ? 'Select a province first' : 'Select a city/town'}
                </option>
                {availableCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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
              readOnly={fieldsLocked}
              disabled={fieldsLocked}
              className={styles.input}
              style={{ opacity: fieldsLocked ? 0.7 : 1 }}
            />
          </div>
          {latitude && longitude && (
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Map Preview</label>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', height: 300 }}>
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`}
                  title="Salon Location Map"
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
            <select id="bookingType" value={bookingType} onChange={(e) => setBookingType(e.target.value as any)} className={styles.input}>
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
