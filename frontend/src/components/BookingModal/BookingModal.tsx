'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Salon, Service } from '@/types';
import styles from './BookingModal.module.css';
import {
  FaBox,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaMobile,
  FaPalette,
  FaTimes,
  FaUser,
  FaWhatsapp,
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import useBookingFlow, {
  STEP_LABELS,
  type BookingPreferences,
  type BookingStep,
  type BookingTimePeriod,
} from '@/hooks/useBookingFlow';
import { apiJson } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui';

interface BookingModalProps {
  salon: Salon;
  service?: Service;
  services: Service[];
  onClose: () => void;
  onBookingSuccess: () => void;
}

interface BookingWhatsAppIntentResponse {
  id: string;
  referenceCode: string;
  sequenceNumber: number;
}

type StoredBookingContact = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

const BOOKING_CONTACT_STORAGE_KEY = 'stylrsa-booking-contact';

const TIME_PERIOD_LABELS: Record<BookingTimePeriod, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  late_afternoon: 'Late afternoon',
};

const TIME_PERIOD_HOURS: Record<BookingTimePeriod, number> = {
  morning: 9,
  afternoon: 13,
  late_afternoon: 16,
};

const requiresColorSelection = (category?: string, name?: string): boolean => {
  const colorKeywords = ['nail', 'manicure', 'pedicure', 'polish', 'gel'];
  const searchText = `${category || ''} ${name || ''}`.toLowerCase();
  return colorKeywords.some((keyword) => searchText.includes(keyword));
};

const requiresMaterialSelection = (category?: string, name?: string): boolean => {
  const materialKeywords = ['braid', 'weave', 'wig', 'extension', 'hairpiece', 'locs', 'twist'];
  const searchText = `${category || ''} ${name || ''}`.toLowerCase();
  return materialKeywords.some((keyword) => searchText.includes(keyword));
};

const resolveServiceCategoryName = (service: Service | null): string => {
  if (!service?.category) {
    return '';
  }

  if (typeof service.category === 'string') {
    return service.category;
  }

  const categoryRecord = service.category as Record<string, unknown>;
  return typeof categoryRecord.name === 'string' ? categoryRecord.name : '';
};

const getTodayDateValue = () => new Date().toISOString().split('T')[0];

const buildBookingDateTime = (selectedDate: Date, period: BookingTimePeriod) => {
  const bookingDateTime = new Date(selectedDate);
  bookingDateTime.setHours(TIME_PERIOD_HOURS[period], 0, 0, 0);
  return bookingDateTime;
};

export default function BookingModal({
  salon,
  service: initialService,
  services,
  onClose,
  onBookingSuccess,
}: BookingModalProps) {
  const { authStatus, user } = useAuth();
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [colorSelection, setColorSelection] = useState('');
  const [materialSelection, setMaterialSelection] = useState<BookingPreferences['materialSelection']>(null);
  const hasPrefilledContact = useRef(false);

  const booking = useBookingFlow({
    salon,
    services,
    initialService,
    onBookingSuccess: () => undefined,
    onClose,
  });
  const {
    setClientFirstName,
    setClientLastName,
    setClientPhone,
    setPreferences,
  } = booking;

  const clientFullName = useMemo(
    () => [booking.state.clientFirstName.trim(), booking.state.clientLastName.trim()].filter(Boolean).join(' '),
    [booking.state.clientFirstName, booking.state.clientLastName],
  );

  const referenceCodePreview = useMemo(
    () => `${clientFullName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'STYLRSA'}-PENDING`,
    [clientFullName],
  );

  const selectedService = booking.state.selectedService;
  const showColorInput = selectedService && requiresColorSelection(
    resolveServiceCategoryName(selectedService),
    selectedService.title || selectedService.name,
  );
  const showMaterialOptions = selectedService && requiresMaterialSelection(
    resolveServiceCategoryName(selectedService),
    selectedService.title || selectedService.name,
  );

  useEffect(() => {
    if (authStatus === 'loading' || hasPrefilledContact.current) {
      return;
    }

    let storedContact: StoredBookingContact | null = null;
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(BOOKING_CONTACT_STORAGE_KEY);
        storedContact = raw ? JSON.parse(raw) as StoredBookingContact : null;
      } catch {
        storedContact = null;
      }
    }

    setClientFirstName(user?.firstName || storedContact?.firstName || '');
    setClientLastName(user?.lastName || storedContact?.lastName || '');
    setClientPhone(storedContact?.phone || '');
    hasPrefilledContact.current = true;
  }, [authStatus, setClientFirstName, setClientLastName, setClientPhone, user?.firstName, user?.lastName]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const contact: StoredBookingContact = {
      firstName: booking.state.clientFirstName.trim(),
      lastName: booking.state.clientLastName.trim(),
      phone: booking.state.clientPhone.trim(),
    };

    if (!contact.firstName && !contact.lastName && !contact.phone) {
      return;
    }

    window.localStorage.setItem(BOOKING_CONTACT_STORAGE_KEY, JSON.stringify(contact));
  }, [
    booking.state.clientFirstName,
    booking.state.clientLastName,
    booking.state.clientPhone,
  ]);

  useEffect(() => {
    setPreferences({
      colorSelection: colorSelection.trim() || undefined,
      materialSelection,
    });
  }, [colorSelection, materialSelection, setPreferences]);

  const handleDateChange = (value: string) => {
    if (!value) {
      return;
    }

    const nextDate = new Date(`${value}T00:00:00`);
    booking.selectDate(nextDate);
  };

  const handleSubmit = async () => {
    if (isCreatingIntent) {
      return;
    }

    const service = booking.state.selectedService;
    const selectedDate = booking.state.selectedDate;
    const selectedTimePeriod = booking.state.selectedTimePeriod;

    if (!service || !selectedDate || !selectedTimePeriod) {
      return;
    }

    const bookingDateTime = buildBookingDateTime(selectedDate, selectedTimePeriod);
    const bookingDate = selectedDate.toLocaleDateString('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const preferredTimeLabel = TIME_PERIOD_LABELS[selectedTimePeriod];
    const fallbackReference = `${clientFullName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'STYLRSA'}-${Date.now().toString().slice(-6)}`;
    let referenceCode = fallbackReference;

    setIsCreatingIntent(true);
    try {
      const intent = await apiJson<BookingWhatsAppIntentResponse>('/api/bookings/whatsapp-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: salon.id,
          serviceId: service.id,
          bookingTime: bookingDateTime.toISOString(),
          isMobile: booking.state.isMobile,
          clientFirstName: booking.state.clientFirstName.trim(),
          clientLastName: booking.state.clientLastName.trim(),
          clientPhone: booking.state.clientPhone.replace(/\s/g, ''),
          clientNotes: booking.state.clientNotes.trim() || null,
          colorSelection: colorSelection.trim() || null,
          materialSelection: materialSelection || null,
          totalCost: booking.totalCost,
          depositAmount: booking.depositAmount,
        }),
      });

      if (intent.referenceCode) {
        referenceCode = intent.referenceCode;
      }
    } catch (error) {
      console.error('Failed to record WhatsApp booking intent:', error);
    } finally {
      setIsCreatingIntent(false);
    }

    let message = `*New Booking Request via Stylr SA*\n`;
    message += `*Source:* Stylr SA platform\n\n`;
    message += `*Service:* ${service.title || service.name}\n`;
    message += `*Client Name:* ${clientFullName}\n`;
    message += `*Phone:* ${booking.state.clientPhone}\n`;
    message += `*Preferred Date:* ${bookingDate}\n`;
    message += `*Preferred Time:* ${preferredTimeLabel}\n`;
    message += `*Total Cost:* R${booking.totalCost.toFixed(2)}\n`;
    message += `*Deposit Required:* R${booking.depositAmount.toFixed(2)} (50%)\n\n`;

    if (booking.state.isMobile) {
      message += `*Service Type:* Mobile Service\n`;
    }

    if (booking.state.clientNotes) {
      message += `*Client Notes:* ${booking.state.clientNotes}\n`;
    }

    if (colorSelection) {
      message += `*Color Choice:* ${colorSelection}\n`;
    }

    if (materialSelection) {
      message += `*Material:* ${materialSelection === 'HAVE_OWN' ? 'Client has own material' : 'Use salon material'}\n`;
    }

    message += `\n*Reference Number:* ${referenceCode}\n\n`;

    if (salon.bankName && salon.accountNumber) {
      message += `*Banking Details for Deposit:*\n`;
      message += `Bank: ${salon.bankName}\n`;
      message += `Account Holder: ${salon.accountHolder || salon.name}\n`;
      message += `Account Number: ${salon.accountNumber}\n`;
      if (salon.branchCode) {
        message += `Branch Code: ${salon.branchCode}\n`;
      }
      message += `Reference: ${referenceCode}\n\n`;
    }

    if (salon.bookingMessage) {
      message += `*Salon Note:*\n${salon.bookingMessage}\n\n`;
    }

    message += `*Important:* Refunds follow the salon's own policy, not Stylr SA.\n`;
    message += `A 20% booking cancellation fee applies.\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = salon.whatsapp || salon.phoneNumber || '';
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    onBookingSuccess();
  };

  const getStepIcon = (step: BookingStep, isCompleted: boolean) => {
    if (isCompleted) {
      return <FaCheck />;
    }

    switch (step) {
      case 'service':
        return <FaCheck />;
      case 'details':
        return <FaUser />;
      case 'confirm':
        return <FaWhatsapp />;
      default:
        return <FaCheck />;
    }
  };

  const renderBreadcrumbs = () => (
    <div className={styles.breadcrumbs}>
      {booking.visibleSteps.map((step, index) => {
        const isCompleted = index < booking.currentStepIndex;
        const isActive = index === booking.currentStepIndex;

        return (
          <div
            key={step}
            className={`${styles.breadcrumbItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
            onClick={() => booking.goToStep(step)}
          >
            {getStepIcon(step, isCompleted)}
            <span>{STEP_LABELS[step]}</span>
          </div>
        );
      })}
    </div>
  );

  const renderStepContent = () => {
    switch (booking.state.step) {
      case 'service':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Select a Service</h3>
            <p className={styles.stepSubtitle}>Choose the service you want to book through WhatsApp.</p>
            <div className={styles.serviceList}>
              {services.map((svc) => (
                <button
                  key={svc.id}
                  className={`${styles.serviceCard} ${booking.state.selectedService?.id === svc.id ? styles.selected : ''}`}
                  onClick={() => booking.selectService(svc)}
                >
                  <div className={styles.serviceInfo}>
                    <span className={styles.serviceName}>{svc.title || svc.name}</span>
                    <span className={styles.serviceDuration}>
                      <FaClock /> {booking.formatDuration(svc.duration, svc.durationMin, svc.durationMax)}
                    </span>
                  </div>
                  <span className={styles.servicePrice}>R{svc.price}</span>
                  {booking.state.selectedService?.id === svc.id && (
                    <span className={styles.checkmark}>
                      <FaCheck />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case 'details':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaUser /> Your Details
            </h3>
            <p className={styles.stepSubtitle}>
              Share your details and preferred appointment window. Final confirmation happens directly with the salon on WhatsApp.
            </p>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name *</label>
                <input
                  id="firstName"
                  type="text"
                  value={booking.state.clientFirstName}
                  onChange={(event) => booking.setClientFirstName(event.target.value)}
                  placeholder="Enter your first name"
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lastName">Surname *</label>
                <input
                  id="lastName"
                  type="text"
                  value={booking.state.clientLastName}
                  onChange={(event) => booking.setClientLastName(event.target.value)}
                  placeholder="Enter your surname"
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                type="tel"
                value={booking.state.clientPhone}
                onChange={(event) => booking.setClientPhone(event.target.value)}
                placeholder="e.g. 082 123 4567"
                className={styles.input}
                required
              />
              <span className={styles.hint}>This is the number the salon will use to confirm your booking.</span>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="preferredDate">Preferred Date *</label>
                <input
                  id="preferredDate"
                  type="date"
                  min={getTodayDateValue()}
                  value={booking.state.selectedDate ? booking.state.selectedDate.toISOString().split('T')[0] : ''}
                  onChange={(event) => handleDateChange(event.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="preferredTime">Preferred Time *</label>
                <select
                  id="preferredTime"
                  value={booking.state.selectedTimePeriod ?? ''}
                  onChange={(event) => booking.selectTimePeriod(event.target.value as BookingTimePeriod)}
                  className={styles.input}
                  required
                >
                  <option value="">Choose a time window</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="late_afternoon">Late afternoon</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes">Notes for the salon (optional)</label>
              <textarea
                id="notes"
                value={booking.state.clientNotes}
                onChange={(event) => booking.setClientNotes(event.target.value)}
                placeholder="Any prep notes, style ideas, or timing preferences..."
                className={styles.textarea}
                rows={3}
              />
            </div>

            {salon.bookingType !== 'ONSITE' && (
              <div className={styles.mobileOption}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={booking.state.isMobile}
                    onChange={(event) => booking.setIsMobile(event.target.checked)}
                    disabled={salon.bookingType === 'MOBILE'}
                  />
                  <FaMobile />
                  <span>Request mobile service</span>
                  {salon.mobileFee ? (
                    <span className={styles.mobileFee}>+R{salon.mobileFee.toFixed(2)}</span>
                  ) : null}
                </label>
              </div>
            )}

            {showColorInput && (
              <div className={styles.preferencesSection}>
                <div className={styles.sectionHeader}>
                  <FaPalette className={styles.sectionIcon} />
                  <span>Color Preference</span>
                  <span className={styles.optionalBadge}>Optional</span>
                </div>
                <input
                  type="text"
                  value={colorSelection}
                  onChange={(event) => setColorSelection(event.target.value)}
                  placeholder="e.g. French tip, nude pink, cherry red..."
                  className={styles.input}
                />
              </div>
            )}

            {showMaterialOptions && (
              <div className={styles.preferencesSection}>
                <div className={styles.sectionHeader}>
                  <FaBox className={styles.sectionIcon} />
                  <span>Hair / Material</span>
                </div>
                <p className={styles.sectionDesc}>Let the salon know whether you are bringing your own material.</p>
                <div className={styles.materialOptions}>
                  <button
                    type="button"
                    className={`${styles.materialOption} ${materialSelection === 'HAVE_OWN' ? styles.selected : ''}`}
                    onClick={() => setMaterialSelection('HAVE_OWN')}
                  >
                    <FaCheck className={styles.optionIcon} />
                    <span>I have my own</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.materialOption} ${materialSelection === 'BUY_SALON' ? styles.selected : ''}`}
                    onClick={() => setMaterialSelection('BUY_SALON')}
                  >
                    <FaBox className={styles.optionIcon} />
                    <span>Use salon material</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 'confirm':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaCheck /> Confirm Booking
            </h3>

            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Service</span>
                <span className={styles.summaryValue}>{selectedService?.title || selectedService?.name}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Preferred Appointment</span>
                <span className={styles.summaryValue}>
                  {booking.state.selectedDate?.toLocaleDateString('en-ZA', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  in the {booking.state.selectedTimePeriod ? TIME_PERIOD_LABELS[booking.state.selectedTimePeriod].toLowerCase() : ''}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Location</span>
                <span className={styles.summaryValue}>
                  <FaMapMarkerAlt /> {booking.state.isMobile ? 'Mobile visit' : salon.address || `${salon.city}, ${salon.province}`}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Client Name</span>
                <span className={styles.summaryValue}>{clientFullName}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Phone Number</span>
                <span className={styles.summaryValue}>{booking.state.clientPhone}</span>
              </div>
              {booking.state.clientNotes && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Notes</span>
                  <span className={styles.summaryValue}>{booking.state.clientNotes}</span>
                </div>
              )}
              {colorSelection && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Color Choice</span>
                  <span className={styles.summaryValue}>{colorSelection}</span>
                </div>
              )}
              {materialSelection && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Material</span>
                  <span className={styles.summaryValue}>
                    {materialSelection === 'HAVE_OWN' ? 'Client has own material' : 'Use salon material'}
                  </span>
                </div>
              )}

              <div className={styles.summaryDivider} />

              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Service Price</span>
                <span className={styles.summaryValue}>R{booking.totalCost.toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryItem} ${styles.highlight}`}>
                <span className={styles.summaryLabel}>Deposit Required (50%)</span>
                <span className={styles.summaryValue}>R{booking.depositAmount.toFixed(2)}</span>
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span className={styles.totalPrice}>R{booking.totalCost.toFixed(2)}</span>
              </div>

              <div className={styles.depositNote}>
                <FaInfoCircle />
                <span>
                  A 50% deposit (R{booking.depositAmount.toFixed(2)}) is required to secure this booking. The remaining
                  R{(booking.totalCost - booking.depositAmount).toFixed(2)} is due directly to the salon.
                </span>
              </div>
            </div>

            {salon.bankName && salon.accountNumber && (
              <div className={styles.bankingDetails}>
                <h4 className={styles.bankingDetailsTitle}>Banking Details for Deposit</h4>
                <div className={styles.bankingInfo}>
                  <div className={styles.bankingItem}>
                    <span className={styles.bankingLabel}>Bank:</span>
                    <span className={styles.bankingValue}>{salon.bankName}</span>
                  </div>
                  <div className={styles.bankingItem}>
                    <span className={styles.bankingLabel}>Account Holder:</span>
                    <span className={styles.bankingValue}>{salon.accountHolder || salon.name}</span>
                  </div>
                  <div className={styles.bankingItem}>
                    <span className={styles.bankingLabel}>Account Number:</span>
                    <span className={styles.bankingValue}>{salon.accountNumber}</span>
                  </div>
                  {salon.branchCode && (
                    <div className={styles.bankingItem}>
                      <span className={styles.bankingLabel}>Branch Code:</span>
                      <span className={styles.bankingValue}>{salon.branchCode}</span>
                    </div>
                  )}
                  <div className={`${styles.bankingItem} ${styles.reference}`}>
                    <span className={styles.bankingLabel}>Reference:</span>
                    <span className={styles.bankingValue}><strong>{referenceCodePreview}</strong></span>
                  </div>
                </div>
                <div className={styles.bankingNote}>
                  <FaInfoCircle />
                  <span>Use this booking reference when making the deposit.</span>
                </div>
              </div>
            )}

            {salon.bookingMessage && (
              <div className={styles.bookingMessage}>
                <p>{salon.bookingMessage}</p>
              </div>
            )}

            {salon.cancellationPolicy && (
              <div className={styles.cancellationPolicy}>
                <div className={styles.cancellationPolicyHeader}>
                  <FaExclamationTriangle /> Cancellation Policy
                </div>
                <p className={styles.cancellationPolicyText}>{salon.cancellationPolicy}</p>
              </div>
            )}

            <div className={styles.platformPolicyNote}>
              <FaInfoCircle />
              <p>Refunds are guided by the salon&apos;s own policy, not Stylr SA. A 20% booking cancellation fee applies.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">
        <DialogTitle className="sr-only">Book Appointment at {salon.name}</DialogTitle>

        <div className={styles.header}>
          <button className={styles.backButton} onClick={booking.goBack} aria-label="Go back">
            <FaChevronLeft />
          </button>
          <div className={styles.headerContent}>
            <h2>Book Appointment</h2>
            <span className={styles.salonName}>{salon.name}</span>
          </div>
        </div>

        {selectedService && (
          <div className={styles.bookingSummary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Treatments:</span>
              <span className={styles.summaryValue}>1 selected</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total:</span>
              <span className={styles.summaryValue}>R{booking.totalCost.toFixed(2)}</span>
            </div>
          </div>
        )}

        {renderBreadcrumbs()}

        {booking.error && (
          <div className={styles.errorBanner}>
            <FaExclamationTriangle className={styles.errorIcon} />
            <span className={styles.errorMessage}>{booking.error}</span>
            <button
              className={styles.errorClose}
              onClick={booking.clearError}
              aria-label="Dismiss error"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className={styles.content} key={booking.state.step}>
          {renderStepContent()}
        </div>

        <div className={styles.footer}>
          {booking.currentStepIndex > 0 && (
            <button
              className={styles.secondaryButton}
              onClick={booking.goBack}
            >
              <FaChevronLeft /> Back
            </button>
          )}

          {booking.state.step === 'confirm' ? (
            <button
              className={`${styles.primaryButton} ${styles.whatsappButton}`}
              onClick={handleSubmit}
              disabled={isCreatingIntent}
            >
              <FaWhatsapp /> {isCreatingIntent ? 'Preparing WhatsApp...' : 'Send Booking via WhatsApp'}
            </button>
          ) : (
            <button
              className={styles.primaryButton}
              onClick={booking.goNext}
              disabled={!booking.canProceed}
            >
              Continue <FaChevronRight />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
