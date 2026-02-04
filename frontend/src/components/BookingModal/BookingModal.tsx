'use client';

import { useState, FormEvent, useTransition } from 'react';
import Image from 'next/image';
import { Salon, Service, Booking, TeamMember } from '@/types';
import styles from './BookingModal.module.css';
import {
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaMobile,
  FaMapMarkerAlt,
  FaUsers,
  FaExclamationTriangle,
  FaPalette,
  FaBox,
  FaShoppingCart,
  FaInfoCircle,
  FaTimes,
  FaWhatsapp,
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { useSocket } from '@/context/SocketContext';
import { useBookingFlow, STEP_LABELS, BookingStep, BookingPreferences } from '@/hooks/useBookingFlow';
import DateTimePicker from './DateTimePicker';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Progress,
} from '@/components/ui';

// ============================================================================
// Types
// ============================================================================

interface BookingModalProps {
  salon: Salon;
  service?: Service;
  services: Service[];
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

// ============================================================================
// Helper functions
// ============================================================================

// Check if service requires color selection
const requiresColorSelection = (category?: string, name?: string): boolean => {
  const colorKeywords = ['nail', 'manicure', 'pedicure', 'polish', 'gel'];
  const searchText = `${category || ''} ${name || ''}`.toLowerCase();
  return colorKeywords.some(keyword => searchText.includes(keyword));
};

// Check if service requires material selection
const requiresMaterialSelection = (category?: string, name?: string): boolean => {
  const materialKeywords = ['braid', 'weave', 'wig', 'extension', 'hairpiece', 'locs', 'twist'];
  const searchText = `${category || ''} ${name || ''}`.toLowerCase();
  return materialKeywords.some(keyword => searchText.includes(keyword));
};

// ============================================================================
// Component
// ============================================================================

export default function BookingModal({
  salon,
  service: initialService,
  services,
  onClose,
  onBookingSuccess,
}: BookingModalProps) {
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();
  const [isPending, startTransition] = useTransition();

  // Use the booking flow hook
  const booking = useBookingFlow({
    salon,
    services,
    initialService,
    onBookingSuccess: (newBooking) => {
      // Send socket notification
      if (socket && booking.state.selectedService) {
        socket.emit('newBooking', {
          bookingId: newBooking.id,
          salonOwnerId: salon.ownerId,
          message: `New booking for ${booking.state.selectedService.title} from ${user?.firstName}.`,
        });
      }
      startTransition(() => {
        onBookingSuccess(newBooking);
      });
    },
    onClose,
  });

  // Local state for preferences (since we combined steps)
  const [colorSelection, setColorSelection] = useState('');
  const [materialSelection, setMaterialSelection] = useState<BookingPreferences['materialSelection']>(null);

  // Computed values for preferences step integration
  const showColorInput = booking.state.selectedService && requiresColorSelection(
    (booking.state.selectedService as any).category?.name,
    booking.state.selectedService.title || booking.state.selectedService.name
  );
  const showMaterialOptions = booking.state.selectedService && requiresMaterialSelection(
    (booking.state.selectedService as any).category?.name,
    booking.state.selectedService.title || booking.state.selectedService.name
  );

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSubmit = () => {
    // Generate WhatsApp message with booking details
    const service = booking.state.selectedService;
    if (!service || !booking.state.selectedDate || !booking.state.selectedSlot) return;

    const depositAmount = booking.depositAmount;
    const bookingDate = booking.state.selectedDate.toLocaleDateString('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const bookingTime = booking.formatTime(booking.state.selectedSlot);

    // Build WhatsApp message
    let message = `*New Booking Request via StylrSA*\n`;
    message += `📍 *Booked from:* www.stylrsa.co.za\n\n`;
    message += `*Service:* ${service.title || service.name}\n`;
    message += `*Client Name:* ${booking.state.clientName}\n`;
    message += `*Phone:* ${booking.state.clientPhone}\n`;
    message += `*Date:* ${bookingDate}\n`;
    message += `*Time:* ${bookingTime}\n`;
    message += `*Total Cost:* R${booking.totalCost.toFixed(2)}\n`;
    message += `*Deposit Required:* R${depositAmount.toFixed(2)} (50%)\n\n`;

    if (booking.state.isMobile) {
      message += `*Service Type:* Mobile Service\n`;
    }

    if (booking.state.clientNotes) {
      message += `*Notes:* ${booking.state.clientNotes}\n`;
    }

    if (colorSelection) {
      message += `*Color Choice:* ${colorSelection}\n`;
    }

    if (materialSelection) {
      const materialText = materialSelection === 'HAVE_OWN' ? 'Bringing own' :
        materialSelection === 'BUY_SALON' ? 'From salon' : 'Shop on platform';
      message += `*Material:* ${materialText}\n`;
    }

    message += `\n*Reference Number:* ${booking.state.clientName}\n\n`;

    if (salon.bankName && salon.accountNumber) {
      message += `*Banking Details for Deposit:*\n`;
      message += `Bank: ${salon.bankName}\n`;
      message += `Account Holder: ${salon.accountHolder || salon.name}\n`;
      message += `Account Number: ${salon.accountNumber}\n`;
      if (salon.branchCode) {
        message += `Branch Code: ${salon.branchCode}\n`;
      }
      message += `Reference: ${booking.state.clientName}\n\n`;
    }

    if (salon.bookingMessage) {
      message += `\n${salon.bookingMessage}`;
    }

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = salon.whatsapp || salon.phoneNumber || '';
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // Close modal after sending
    setTimeout(() => {
      onClose();
    }, 500);
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const getStepIcon = (step: BookingStep, isCompleted: boolean) => {
    if (isCompleted) return <FaCheck />;

    switch (step) {
      case 'details':
        return <FaUser />;
      case 'date':
        return <FaCalendarAlt />;
      case 'time':
        return <FaClock />;
      case 'confirm':
        return <FaCheck />;
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
      // -----------------------------------------------------------------------
      // Step 1: Service Selection
      // -----------------------------------------------------------------------
      case 'service':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Select a Service</h3>
            <p className={styles.stepSubtitle}>Choose the service you'd like to book</p>
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

      // -----------------------------------------------------------------------
      // Step 2: Professional Selection
      // -----------------------------------------------------------------------
      case 'professional':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaUsers /> Choose a Professional
              <span className={styles.optionalBadge}>Optional</span>
            </h3>

            <div className={styles.professionalList}>
              {/* "Any Professional" option */}
              <button
                className={`${styles.anyProfessionalCard} ${booking.state.useAnyProfessional ? styles.selected : ''}`}
                onClick={() => booking.setUseAnyProfessional(true)}
              >
                <div className={styles.anyProfessionalIcon}>
                  <FaUsers />
                </div>
                <div className={styles.anyProfessionalInfo}>
                  <h4>Any Professional</h4>
                  <p>We'll assign the best available stylist</p>
                </div>
                {booking.state.useAnyProfessional && (
                  <span className={styles.checkmark}>
                    <FaCheck />
                  </span>
                )}
              </button>

              {/* Team Members */}
              {booking.loadingTeam ? (
                <div className={styles.loadingSlots}>
                  <LoadingSpinner size="md" inline text="Loading team..." />
                </div>
              ) : (
                booking.teamMembers.map((member) => (
                  <button
                    key={member.id}
                    className={`${styles.professionalCard} ${!booking.state.useAnyProfessional && booking.state.selectedProfessional?.id === member.id ? styles.selected : ''}`}
                    onClick={() => booking.selectProfessional(member)}
                  >
                    <div className={styles.professionalAvatar}>
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <div className={styles.professionalInfo}>
                      <h4 className={styles.professionalName}>{member.name}</h4>
                      <p className={styles.professionalRole}>{member.role}</p>
                      {member.specialties && member.specialties.length > 0 && (
                        <div className={styles.professionalSpecialties}>
                          {member.specialties.slice(0, 3).map((s, i) => (
                            <span key={i} className={styles.specialtyTag}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {!booking.state.useAnyProfessional && booking.state.selectedProfessional?.id === member.id && (
                      <span className={styles.checkmark}>
                        <FaCheck />
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        );

      // -----------------------------------------------------------------------
      // Step 2: Date Selection
      // -----------------------------------------------------------------------
      case 'date':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaCalendarAlt /> Select a Date
            </h3>
            <p className={styles.stepSubtitle}>Choose your preferred appointment date</p>

            <DateTimePicker
              selectedDate={booking.state.selectedDate}
              selectedSlot={booking.state.selectedSlot}
              onDateChange={booking.selectDate}
              onSlotChange={booking.selectSlot}
              availableSlots={booking.availableSlots}
              loadingSlots={booking.loadingSlots}
              monthAvailability={booking.monthAvailability}
              loadingMonthAvailability={booking.loadingMonthAvailability}
              onRefresh={booking.refreshSlots}
              formatTime={booking.formatTime}
              mode="date"
            />
          </div>
        );

      // -----------------------------------------------------------------------
      // Step 3: Time Selection
      // -----------------------------------------------------------------------
      case 'time':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaClock /> Select a Time
            </h3>
            <p className={styles.stepSubtitle}>
              {booking.state.selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>

            <DateTimePicker
              selectedDate={booking.state.selectedDate}
              selectedSlot={booking.state.selectedSlot}
              onDateChange={booking.selectDate}
              onSlotChange={booking.selectSlot}
              availableSlots={booking.availableSlots}
              loadingSlots={booking.loadingSlots}
              monthAvailability={booking.monthAvailability}
              loadingMonthAvailability={booking.loadingMonthAvailability}
              onRefresh={booking.refreshSlots}
              formatTime={booking.formatTime}
              mode="time"
              selectedTimePeriod={booking.state.selectedTimePeriod}
              onTimePeriodChange={booking.selectTimePeriod}
            />
          </div>
        );

      // -----------------------------------------------------------------------
      // Step 4: Details & Preferences (COMBINED STEP)
      // -----------------------------------------------------------------------
      case 'details':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaUser /> Your Details
            </h3>
            <p className={styles.stepSubtitle}>We'll use this to confirm your appointment</p>

            {/* Full Name */}
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={booking.state.clientName}
                onChange={(e) => booking.setClientName(e.target.value)}
                placeholder="Enter your full name"
                className={styles.input}
                required
              />
            </div>

            {/* Contact Details */}
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={booking.state.clientPhone}
                onChange={(e) => booking.setClientPhone(e.target.value)}
                placeholder="e.g., 082 123 4567"
                className={styles.input}
                required
              />
              <span className={styles.hint}>We'll send booking confirmation to this number</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes">Notes for your appointment (optional)</label>
              <textarea
                id="notes"
                value={booking.state.clientNotes}
                onChange={(e) => booking.setClientNotes(e.target.value)}
                placeholder="Any specific requests or preferences..."
                className={styles.textarea}
                rows={3}
              />
            </div>

            {/* Mobile Service Option */}
            {salon.bookingType !== 'ONSITE' && (
              <div className={styles.mobileOption}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={booking.state.isMobile}
                    onChange={(e) => booking.setIsMobile(e.target.checked)}
                    disabled={salon.bookingType === 'MOBILE'}
                  />
                  <FaMobile />
                  <span>Request mobile service</span>
                  {salon.mobileFee && (
                    <span className={styles.mobileFee}>+R{salon.mobileFee.toFixed(2)}</span>
                  )}
                </label>
              </div>
            )}

            {/* Color Selection (for nail services) */}
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
                  onChange={(e) => setColorSelection(e.target.value)}
                  placeholder="e.g., French tip, Red #42, Nude pink..."
                  className={styles.input}
                />
              </div>
            )}

            {/* Material Selection (for braiding/weaving services) */}
            {showMaterialOptions && (
              <div className={styles.preferencesSection}>
                <div className={styles.sectionHeader}>
                  <FaBox className={styles.sectionIcon} />
                  <span>Hair/Material</span>
                </div>
                <p className={styles.sectionDesc}>
                  Do you have your own hair/material for this service?
                </p>

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
                    <span>Use salon's</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.materialOption} ${materialSelection === 'BUY_PLATFORM' ? styles.selected : ''}`}
                    onClick={() => setMaterialSelection('BUY_PLATFORM')}
                  >
                    <FaShoppingCart className={styles.optionIcon} />
                    <span>Shop on platform</span>
                  </button>
                </div>

                {materialSelection === 'BUY_PLATFORM' && (
                  <div className={styles.platformNote}>
                    <FaInfoCircle />
                    <span>
                      After booking, we'll suggest products from our marketplace that match your service.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      // -----------------------------------------------------------------------
      // Step 5: Confirm & Pay (COMBINED STEP)
      // -----------------------------------------------------------------------
      case 'confirm':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaCheck /> Confirm Booking
            </h3>

            <div className={styles.summary}>
              {/* Service */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Service</span>
                <span className={styles.summaryValue}>
                  {booking.state.selectedService?.title || booking.state.selectedService?.name}
                </span>
              </div>

              {/* Professional */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Professional</span>
                <span className={styles.summaryValue}>
                  {booking.state.useAnyProfessional ? 'Any available' : booking.state.selectedProfessional?.name}
                </span>
              </div>

              {/* Date & Time */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Date & Time</span>
                <span className={styles.summaryValue}>
                  {booking.state.selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  at {booking.state.selectedSlot && booking.formatTime(booking.state.selectedSlot)}
                </span>
              </div>

              {/* Duration */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Duration</span>
                <span className={styles.summaryValue}>
                  {booking.state.selectedService && booking.formatDuration(
                    booking.state.selectedService.duration,
                    booking.state.selectedService.durationMin,
                    booking.state.selectedService.durationMax
                  )}
                </span>
              </div>

              {/* Location */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Location</span>
                <span className={styles.summaryValue}>
                  <FaMapMarkerAlt />{' '}
                  {booking.state.isMobile ? 'Mobile visit' : salon.address || `${salon.city}, ${salon.province}`}
                </span>
              </div>

              {/* Client Name */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Client Name</span>
                <span className={styles.summaryValue}>{booking.state.clientName}</span>
              </div>

              {/* Contact */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Phone Number</span>
                <span className={styles.summaryValue}>{booking.state.clientPhone}</span>
              </div>

              {/* Notes */}
              {booking.state.clientNotes && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Notes</span>
                  <span className={styles.summaryValue}>{booking.state.clientNotes}</span>
                </div>
              )}

              {/* Color Selection */}
              {colorSelection && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Color Choice</span>
                  <span className={styles.summaryValue}>{colorSelection}</span>
                </div>
              )}

              {/* Material Selection */}
              {materialSelection && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Material</span>
                  <span className={styles.summaryValue}>
                    {materialSelection === 'HAVE_OWN' ? 'Bringing own' :
                      materialSelection === 'BUY_SALON' ? 'From salon' : 'Shop on platform'}
                  </span>
                </div>
              )}

              <div className={styles.summaryDivider} />

              {/* Payment Summary */}
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
                  A 50% deposit (R{booking.depositAmount.toFixed(2)}) is required to confirm your booking.
                  The remaining R{(booking.totalCost - booking.depositAmount).toFixed(2)} is due at the appointment.
                </span>
              </div>
            </div>

            {/* Banking Details */}
            {(salon.bankName && salon.accountNumber) && (
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
                    <span className={styles.bankingValue}><strong>{booking.state.clientName}</strong></span>
                  </div>
                </div>
                <div className={styles.bankingNote}>
                  <FaInfoCircle />
                  <span>Use your name as reference when making the deposit</span>
                </div>
              </div>
            )}

            {/* Custom Booking Message */}
            {salon.bookingMessage && (
              <div className={styles.bookingMessage}>
                <p>{salon.bookingMessage}</p>
              </div>
            )}

            {/* Cancellation Policy */}
            {salon.cancellationPolicy && (
              <div className={styles.cancellationPolicy}>
                <div className={styles.cancellationPolicyHeader}>
                  <FaExclamationTriangle /> Cancellation Policy
                </div>
                <p className={styles.cancellationPolicyText}>
                  {salon.cancellationPolicy}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">Book Appointment at {salon.name}</DialogTitle>

        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={booking.goBack} aria-label="Go back">
            <FaChevronLeft />
          </button>
          <div className={styles.headerContent}>
            <h2>Book Appointment</h2>
            <span className={styles.salonName}>{salon.name}</span>
          </div>
        </div>

        {/* Booking Summary */}
        {booking.state.selectedService && (
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

        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Breadcrumbs already provide step indication */}

        {/* Error Display */}
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

        {/* Content */}
        <div className={styles.content} key={booking.state.step}>
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {/* Back button - show when not on first step */}
          {booking.state.step !== 'details' && (
            <button
              className={styles.secondaryButton}
              onClick={booking.goBack}
            >
              <FaChevronLeft /> Back
            </button>
          )}

          {/* Continue or WhatsApp button */}
          {booking.state.step === 'confirm' ? (
            <button
              className={`${styles.primaryButton} ${styles.whatsappButton}`}
              onClick={handleSubmit}
            >
              <FaWhatsapp /> Send Booking via WhatsApp
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
