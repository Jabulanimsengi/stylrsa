'use client';

import {
  ChangeEvent,
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import OperatingHoursInput, {
  initializeOperatingHours,
  serializeOperatingHours,
  type OperatingHours,
} from '@/components/OperatingHoursInput';
import MapboxMap from '@/components/MapboxMap';
import { useAuth } from '@/hooks/useAuth';
import { forwardGeocode, type GeocodingResult } from '@/lib/mapbox';
import { notify } from '@/lib/notify';
import { toFriendlyMessage } from '@/lib/errors';
import { uploadToCloudinary } from '@/utils/cloudinary';
import styles from './CreateSalon.module.css';

type BookingType = 'ONSITE' | 'MOBILE' | 'BOTH';

function CreateSalonPageContent() {
  const router = useRouter();
  const { authStatus, user } = useAuth();
  const [salonName, setSalonName] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [town, setTown] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState('');
  const [freshaReviewsUrl, setFreshaReviewsUrl] = useState('');
  const [booksyReviewsUrl, setBooksyReviewsUrl] = useState('');
  const [bookingType, setBookingType] = useState<BookingType>('ONSITE');
  const [mobileFee, setMobileFee] = useState('');
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState('50');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [specialConditions, setSpecialConditions] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(initializeOperatingHours());
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    if (authStatus === 'unauthenticated') {
      router.replace('/?auth=login&redirect=/create-salon&role=SALON_OWNER');
      return;
    }

    if (!user) {
      return;
    }

    if (user.salonId) {
      router.replace('/dashboard');
      return;
    }

    if (user.role === 'PENDING' || user.onboardingStatus === 'ROLE_REQUIRED') {
      router.replace('/onboarding/role?role=SALON_OWNER&redirect=/create-salon');
      return;
    }

    if (user.role !== 'SALON_OWNER' && user.role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }

    setEmail((current) => current || user.email || '');
    setPhoneNumber((current) => current || user.phoneNumber || '');
    setWhatsappNumber((current) => current || user.phoneNumber || '');
  }, [authStatus, router, user]);

  const canPreviewMap = latitude !== null && longitude !== null;
  const uploadedImageCount = heroImages.length;
  const depositPercentageNumber = Number.parseInt(depositPercentage, 10);
  const selectedLocationLabel = useMemo(
    () => [town, city, province].filter(Boolean).join(', '),
    [city, province, town],
  );

  const handleAddressSearch = async (value: string) => {
    setAddressQuery(value);

    if (value.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const results = await forwardGeocode(value, {
      country: 'za',
      limit: 5,
    });
    setAddressSuggestions(results);
    setShowSuggestions(results.length > 0);
  };

  const handleAddressSelect = (suggestion: GeocodingResult) => {
    setAddress(suggestion.display_name);
    setAddressQuery(suggestion.display_name);
    setLatitude(Number.parseFloat(suggestion.lat));
    setLongitude(Number.parseFloat(suggestion.lon));
    setProvince(suggestion.address?.state || '');
    setCity(suggestion.address?.city || suggestion.address?.town || '');
    setTown(
      suggestion.address?.suburb ||
      suggestion.address?.city ||
      suggestion.address?.town ||
      '',
    );
    setShowSuggestions(false);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setIsUploadingImages(true);
    setError('');

    try {
      const uploadedUrls = await Promise.all(
        files.map((file) =>
          uploadToCloudinary(file, { folder: 'salons/hero-images' }).then(
            (response) => response.secure_url,
          ),
        ),
      );
      setHeroImages((current) => [...current, ...uploadedUrls]);
      notify.success(
        `${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded.`,
      );
    } catch (uploadError) {
      const message = toFriendlyMessage(
        uploadError,
        'Image upload failed. Please try again.',
      );
      setError(message);
      notify.error(message);
    } finally {
      setIsUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!latitude || !longitude) {
      const message = 'Choose your salon location from the map suggestions before continuing.';
      setError(message);
      notify.error(message);
      return;
    }

    if (depositRequired && !paymentInstructions.trim()) {
      const message = 'Add payment instructions so clients know how to complete the deposit after the WhatsApp handoff.';
      setError(message);
      notify.error(message);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const operatingHoursPayload = serializeOperatingHours(operatingHours);

      const response = await fetch('/api/salons', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: salonName.trim(),
          description: description.trim(),
          address: address.trim(),
          town: town.trim(),
          city: city.trim(),
          province: province.trim(),
          phone: phoneNumber.trim(),
          whatsapp: whatsappNumber.trim(),
          email: email.trim().toLowerCase(),
          website: website.trim() || undefined,
          facebookUrl: facebookUrl.trim() || undefined,
          instagramUrl: instagramUrl.trim() || undefined,
          tiktokUrl: tiktokUrl.trim() || undefined,
          googleReviewsUrl: googleReviewsUrl.trim() || undefined,
          freshaReviewsUrl: freshaReviewsUrl.trim() || undefined,
          booksyReviewsUrl: booksyReviewsUrl.trim() || undefined,
          latitude,
          longitude,
          bookingType,
          offersMobile: bookingType !== 'ONSITE',
          mobileFee:
            bookingType === 'ONSITE' || mobileFee.trim() === ''
              ? undefined
              : Number.parseFloat(mobileFee),
          heroImages,
          depositRequired,
          depositPercentage: depositRequired
            ? Number.isFinite(depositPercentageNumber)
              ? depositPercentageNumber
              : 50
            : 0,
          paymentInstructions: depositRequired ? paymentInstructions.trim() : undefined,
          cancellationPolicy: cancellationPolicy.trim() || undefined,
          specialConditions: specialConditions.trim() || undefined,
          bankName: depositRequired ? bankName.trim() : undefined,
          accountHolder: depositRequired ? accountHolder.trim() || undefined : undefined,
          accountNumber: depositRequired ? accountNumber.trim() : undefined,
          branchCode: depositRequired ? branchCode.trim() || undefined : undefined,
          ...operatingHoursPayload,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Failed to create your salon profile.');
      }

      notify.success('Salon profile submitted for admin approval.');
      router.replace('/dashboard');
    } catch (submitError) {
      const message = toFriendlyMessage(
        submitError,
        'Failed to create your salon profile.',
      );
      setError(message);
      notify.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Your Salon Profile</h1>
      <p className={styles.subtitle}>
        Complete your salon profile, booking rules, and contact details. Your listing stays private until an admin approves it, and you can add services straight after this step.
      </p>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.stepContent}>
            <h2 className={styles.sectionTitle}>Business details</h2>
            <p className={styles.sectionHint}>
              Add the information clients need to find and trust your salon.
            </p>

            <div className={styles.formGrid}>
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="salonName">Salon name</label>
                <input
                  id="salonName"
                  className={styles.input}
                  value={salonName}
                  onChange={(event) => setSalonName(event.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">Business email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  required
                  readOnly
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phoneNumber">Contact number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  className={styles.input}
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="0821234567"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="whatsappNumber">WhatsApp number</label>
                <input
                  id="whatsappNumber"
                  type="tel"
                  className={styles.input}
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  placeholder="0821234567"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="bookingType">Service type</label>
                <select
                  id="bookingType"
                  className={styles.input}
                  value={bookingType}
                  onChange={(event) => setBookingType(event.target.value as BookingType)}
                >
                  <option value="ONSITE">In-salon only</option>
                  <option value="MOBILE">Mobile only</option>
                  <option value="BOTH">In-salon and mobile</option>
                </select>
              </div>

              {bookingType !== 'ONSITE' && (
                <div className={styles.inputGroup}>
                  <label htmlFor="mobileFee">Mobile call-out fee</label>
                  <input
                    id="mobileFee"
                    type="number"
                    min="0"
                    step="0.01"
                    className={styles.input}
                    value={mobileFee}
                    onChange={(event) => setMobileFee(event.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="description">Salon description</label>
                <textarea
                  id="description"
                  className={styles.textarea}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Tell clients what makes your salon special."
                  rows={4}
                  required
                />
              </div>
            </div>
          </section>

          <section className={styles.stepContent}>
            <h2 className={styles.sectionTitle}>Location</h2>
            <p className={styles.sectionHint}>
              Search your address to pin the salon correctly and improve local discovery.
            </p>

            <div className={styles.formGrid}>
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="addressSearch">Find your salon on the map</label>
                <div className={styles.searchWrapper}>
                  <input
                    id="addressSearch"
                    className={styles.input}
                    value={addressQuery}
                    onChange={(event) => {
                      void handleAddressSearch(event.target.value);
                    }}
                    placeholder="Search for your exact address"
                  />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <ul className={styles.suggestions}>
                      {addressSuggestions.map((suggestion) => (
                        <li
                          key={suggestion.place_id}
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          {suggestion.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {selectedLocationLabel && (
                  <div className={styles.locationConfirm}>
                    Selected location: {selectedLocationLabel}
                  </div>
                )}
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="address">Full address</label>
                <input
                  id="address"
                  className={styles.input}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="town">Suburb / town</label>
                <input
                  id="town"
                  className={styles.input}
                  value={town}
                  onChange={(event) => setTown(event.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  className={styles.input}
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="province">Province</label>
                <input
                  id="province"
                  className={styles.input}
                  value={province}
                  onChange={(event) => setProvince(event.target.value)}
                  required
                />
              </div>
            </div>

            {canPreviewMap && (
              <div className={styles.mapPreview}>
                <MapboxMap
                  latitude={latitude}
                  longitude={longitude}
                  height={250}
                  zoom={15}
                  interactive={false}
                  style="streets"
                />
              </div>
            )}
          </section>

          <section className={styles.stepContent}>
            <h2 className={styles.sectionTitle}>Operating hours</h2>
            <p className={styles.sectionHint}>
              These hours power the public profile and booking availability.
            </p>
            <OperatingHoursInput
              hours={operatingHours}
              onChange={setOperatingHours}
            />
          </section>

          <section className={styles.stepContent}>
            <h2 className={styles.sectionTitle}>Booking requirements</h2>
            <p className={styles.sectionHint}>
              Decide how deposits, payment instructions, and salon-specific terms should appear before clients continue to WhatsApp.
            </p>

            <div className={styles.formGrid}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={depositRequired}
                  onChange={(event) => setDepositRequired(event.target.checked)}
                />
                <span>Require a deposit before the booking is confirmed</span>
              </label>

              {depositRequired && (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="depositPercentage">Deposit percentage</label>
                    <input
                      id="depositPercentage"
                      type="number"
                      min="0"
                      max="100"
                      className={styles.input}
                      value={depositPercentage}
                      onChange={(event) => setDepositPercentage(event.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="bankName">Bank name</label>
                    <input
                      id="bankName"
                      className={styles.input}
                      value={bankName}
                      onChange={(event) => setBankName(event.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="accountHolder">Account holder</label>
                    <input
                      id="accountHolder"
                      className={styles.input}
                      value={accountHolder}
                      onChange={(event) => setAccountHolder(event.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="accountNumber">Account number</label>
                    <input
                      id="accountNumber"
                      className={styles.input}
                      value={accountNumber}
                      onChange={(event) => setAccountNumber(event.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="branchCode">Branch code</label>
                    <input
                      id="branchCode"
                      className={styles.input}
                      value={branchCode}
                      onChange={(event) => setBranchCode(event.target.value)}
                    />
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label htmlFor="paymentInstructions">Payment instructions</label>
                    <textarea
                      id="paymentInstructions"
                      className={styles.textarea}
                      value={paymentInstructions}
                      onChange={(event) => setPaymentInstructions(event.target.value)}
                      placeholder="Example: A 50% EFT deposit secures the slot. Use your booking reference, then complete the booking on WhatsApp."
                      rows={3}
                      required={depositRequired}
                    />
                  </div>
                </>
              )}

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="cancellationPolicy">Cancellation policy</label>
                <textarea
                  id="cancellationPolicy"
                  className={styles.textarea}
                  value={cancellationPolicy}
                  onChange={(event) => setCancellationPolicy(event.target.value)}
                  placeholder="Optional policy shown on the booking summary."
                  rows={3}
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="specialConditions">Special conditions</label>
                <textarea
                  id="specialConditions"
                  className={styles.textarea}
                  value={specialConditions}
                  onChange={(event) => setSpecialConditions(event.target.value)}
                  placeholder="Optional notes such as preparation rules, age limits, or health requirements."
                  rows={3}
                />
              </div>
            </div>
          </section>

          <section className={styles.stepContent}>
            <h2 className={styles.sectionTitle}>Visibility and trust</h2>
            <p className={styles.sectionHint}>
              Social links and gallery images are optional, but they help clients trust the profile once it is approved.
            </p>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="url"
                  className={styles.input}
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="facebookUrl">Facebook</label>
                <input
                  id="facebookUrl"
                  type="url"
                  className={styles.input}
                  value={facebookUrl}
                  onChange={(event) => setFacebookUrl(event.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="instagramUrl">Instagram</label>
                <input
                  id="instagramUrl"
                  type="url"
                  className={styles.input}
                  value={instagramUrl}
                  onChange={(event) => setInstagramUrl(event.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="tiktokUrl">TikTok</label>
                <input
                  id="tiktokUrl"
                  type="url"
                  className={styles.input}
                  value={tiktokUrl}
                  onChange={(event) => setTiktokUrl(event.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="googleReviewsUrl">Google Reviews link</label>
                <input
                  id="googleReviewsUrl"
                  type="url"
                  className={styles.input}
                  value={googleReviewsUrl}
                  onChange={(event) => setGoogleReviewsUrl(event.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="freshaReviewsUrl">Fresha reviews link</label>
                <input
                  id="freshaReviewsUrl"
                  type="url"
                  className={styles.input}
                  value={freshaReviewsUrl}
                  onChange={(event) => setFreshaReviewsUrl(event.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="booksyReviewsUrl">Booksy reviews link</label>
                <input
                  id="booksyReviewsUrl"
                  type="url"
                  className={styles.input}
                  value={booksyReviewsUrl}
                  onChange={(event) => setBooksyReviewsUrl(event.target.value)}
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="galleryImages">Gallery images</label>
                <input
                  id="galleryImages"
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.input}
                  onChange={(event) => {
                    void handleImageUpload(event);
                  }}
                  disabled={isUploadingImages}
                />
                <span className={styles.sectionHint}>
                  {isUploadingImages
                    ? 'Uploading images...'
                    : uploadedImageCount > 0
                      ? `${uploadedImageCount} image${uploadedImageCount > 1 ? 's' : ''} ready for your profile`
                      : 'Optional: upload work examples for your gallery'}
                </span>
              </div>
            </div>
          </section>

          {error && <div className={styles.locationConfirm}>{error}</div>}

          <div className={styles.stepNavigation}>
            <div className={styles.draftActions}>
              <span className={styles.lastSaved}>
                New profiles stay private until admin approval. Add at least two services after this step so your listing can go live.
              </span>
            </div>
            <div className={styles.navButtons}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || isUploadingImages}
              >
                {isSubmitting ? 'Creating salon...' : 'Create salon profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateSalonPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <LoadingSpinner />
        </div>
      }
    >
      <CreateSalonPageContent />
    </Suspense>
  );
}
