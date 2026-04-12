'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { Salon, Service, TeamMember } from '@/types';
import styles from './BookingModal.module.css';
import {
  FaBox,
  FaCalendarAlt,
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
  type BookingPreferences,
  type BookingTimePeriod,
} from '@/hooks/useBookingFlow';
import { apiJson } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui';
import {
  formatServiceDiscountLabel,
  getServiceDiscountedPrice,
  hasServiceDiscount,
} from '@/lib/servicePricing';

interface BookingModalProps {
  salon: Salon;
  service?: Service;
  selectedServices?: Service[];
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
  email?: string;
};

const BOOKING_CONTACT_STORAGE_KEY = 'stylrsa-booking-contact';

const TIME_PERIOD_LABELS: Record<BookingTimePeriod, string> = {
  morning: '09:00 - 12:00',
  afternoon: '12:00 - 15:00',
  late_afternoon: '15:00 - 18:00',
};

const TIME_PERIOD_OPTIONS: Array<{ value: BookingTimePeriod; label: string }> = [
  { value: 'morning', label: '09:00 - 12:00' },
  { value: 'afternoon', label: '12:00 - 15:00' },
  { value: 'late_afternoon', label: '15:00 - 18:00' },
];

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

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDateValue = () => formatDateKey(new Date());
const INITIAL_VISIBLE_BOOKING_DAYS = 7;
const TOTAL_BOOKING_DAYS = 28;

const buildBookingDateTime = (selectedDate: Date, period: BookingTimePeriod) => {
  const bookingDateTime = new Date(selectedDate);
  bookingDateTime.setHours(TIME_PERIOD_HOURS[period], 0, 0, 0);
  return bookingDateTime;
};

const generateBookingReference = () => {
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `STYL-${timestampPart}${randomPart}`;
};

export default function BookingModal({
  salon,
  service: initialService,
  selectedServices = [],
  services,
  onClose,
  onBookingSuccess,
}: BookingModalProps) {
  const { authStatus, user } = useAuth();
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [colorSelection, setColorSelection] = useState('');
  const [materialSelection, setMaterialSelection] = useState<BookingPreferences['materialSelection']>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);
  const [showAllBookingDays, setShowAllBookingDays] = useState(false);
  const [bookingReference] = useState(() => generateBookingReference());
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
    setClientEmail,
    setPreferences,
  } = booking;
  const dateRailRef = useRef<HTMLDivElement | null>(null);

  const clientFullName = useMemo(
    () => [booking.state.clientFirstName.trim(), booking.state.clientLastName.trim()].filter(Boolean).join(' '),
    [booking.state.clientFirstName, booking.state.clientLastName],
  );

  const selectedService = booking.state.selectedService;
  const bookedServices = useMemo(() => {
    if (selectedServices.length > 0) {
      return selectedServices;
    }

    return selectedService ? [selectedService] : [];
  }, [selectedService, selectedServices]);
  const servicesSubtotal = useMemo(
    () => bookedServices.reduce((sum, service) => sum + getServiceDiscountedPrice(service), 0),
    [bookedServices],
  );
  const totalCost = useMemo(() => {
    const mobileFee = booking.state.isMobile && salon.mobileFee ? salon.mobileFee : 0;
    return servicesSubtotal + mobileFee;
  }, [booking.state.isMobile, salon.mobileFee, servicesSubtotal]);
  const depositPercentage = useMemo(
    () => (salon.depositRequired ? salon.depositPercentage ?? 50 : 0),
    [salon.depositPercentage, salon.depositRequired],
  );
  const depositAmount = useMemo(
    () => Number((totalCost * (depositPercentage / 100)).toFixed(2)),
    [depositPercentage, totalCost],
  );
  const hasDepositRequirement = depositAmount > 0;
  const showColorInput = selectedService && requiresColorSelection(
    resolveServiceCategoryName(selectedService),
    selectedService.title || selectedService.name,
  );
  const showMaterialOptions = selectedService && requiresMaterialSelection(
    resolveServiceCategoryName(selectedService),
    selectedService.title || selectedService.name,
  );
  const availableTeamMembers = useMemo(() => {
    if (!selectedService) {
      return teamMembers;
    }

    return teamMembers.filter((member) => {
      const assignedServiceIds =
        member.serviceIds ||
        member.services?.map((service) => service.id) ||
        [];

      return assignedServiceIds.length === 0 || assignedServiceIds.includes(selectedService.id);
    });
  }, [selectedService, teamMembers]);
  const selectedTeamMember = useMemo(
    () => availableTeamMembers.find((member) => member.id === selectedTeamMemberId) || null,
    [availableTeamMembers, selectedTeamMemberId],
  );
  const canSubmitBooking = useMemo(
    () => (
      booking.state.clientFirstName.trim().length >= 2 &&
      booking.state.clientLastName.trim().length >= 2 &&
      booking.state.clientPhone.replace(/\D/g, '').length >= 10 &&
      Boolean(booking.state.selectedService) &&
      Boolean(booking.state.selectedDate) &&
      Boolean(booking.state.selectedTimePeriod) &&
      hasAcceptedTerms
    ),
    [
      booking.state.clientFirstName,
      booking.state.clientLastName,
      booking.state.clientPhone,
      booking.state.selectedDate,
      booking.state.selectedService,
      booking.state.selectedTimePeriod,
      hasAcceptedTerms,
    ],
  );
  const availableBookingDays = useMemo(() => {
    const days: Date[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    for (let index = 0; index < TOTAL_BOOKING_DAYS; index += 1) {
      const nextDay = new Date(start);
      nextDay.setDate(start.getDate() + index);
      days.push(nextDay);
    }

    return days;
  }, []);
  const visibleBookingDays = useMemo(
    () => (showAllBookingDays ? availableBookingDays : availableBookingDays.slice(0, INITIAL_VISIBLE_BOOKING_DAYS)),
    [availableBookingDays, showAllBookingDays],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchTeamMembers = async () => {
      try {
        const data = await apiJson<TeamMember[]>(`/api/team-members/salon/${salon.id}`);
        if (!isMounted) {
          return;
        }

        setTeamMembers(
          data.map((member) => ({
            ...member,
            serviceIds:
              member.serviceIds ||
              member.services?.map((service) => service.id) ||
              [],
          })),
        );
      } catch (error) {
        console.error('Failed to fetch team members for booking:', error);
      }
    };

    void fetchTeamMembers();

    return () => {
      isMounted = false;
    };
  }, [salon.id]);

  useEffect(() => {
    if (
      selectedTeamMemberId &&
      !availableTeamMembers.some((member) => member.id === selectedTeamMemberId)
    ) {
      setSelectedTeamMemberId(null);
    }
  }, [availableTeamMembers, selectedTeamMemberId]);

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
    setClientEmail(user?.email || storedContact?.email || '');
    hasPrefilledContact.current = true;
  }, [
    authStatus,
    setClientEmail,
    setClientFirstName,
    setClientLastName,
    setClientPhone,
    user?.email,
    user?.firstName,
    user?.lastName,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const contact: StoredBookingContact = {
      firstName: booking.state.clientFirstName.trim(),
      lastName: booking.state.clientLastName.trim(),
      phone: booking.state.clientPhone.trim(),
      email: booking.state.clientEmail.trim(),
    };

    if (!contact.firstName && !contact.lastName && !contact.phone && !contact.email) {
      return;
    }

    window.localStorage.setItem(BOOKING_CONTACT_STORAGE_KEY, JSON.stringify(contact));
  }, [
    booking.state.clientFirstName,
    booking.state.clientEmail,
    booking.state.clientLastName,
    booking.state.clientPhone,
  ]);

  useEffect(() => {
    setPreferences({
      colorSelection: colorSelection.trim() || undefined,
      materialSelection,
    });
  }, [colorSelection, materialSelection, setPreferences]);

  useEffect(() => {
    if (booking.state.step !== 'schedule' || !booking.state.selectedDate || !dateRailRef.current) {
      return;
    }

    const selectedIso = formatDateKey(booking.state.selectedDate);
    const activeButton = dateRailRef.current.querySelector<HTMLButtonElement>(`[data-date="${selectedIso}"]`);
    activeButton?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [booking.state.selectedDate, booking.state.step]);

  const handleDateChange = (date: Date) => {
    booking.selectDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  };

  const handleSubmit = async () => {
    if (isCreatingIntent || !canSubmitBooking) {
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
          clientPhone: booking.state.clientPhone.replace(/\D/g, ''),
          clientEmail: booking.state.clientEmail.trim() || null,
          clientNotes: booking.state.clientNotes.trim() || null,
          teamMemberId: selectedTeamMemberId || null,
          colorSelection: colorSelection.trim() || null,
          materialSelection: materialSelection || null,
          referenceCode: bookingReference,
          totalCost,
          depositAmount,
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

    let message = `*StylRSA Booking Request*\n`;
    message += `This booking is from StylRSA.\n\n`;
    message += `*Service:* ${service.title || service.name}\n`;
    if (bookedServices.length > 1) {
      message += `*Services Selected:*\n${bookedServices
        .map((item) => `- ${item.title || item.name} (R${getServiceDiscountedPrice(item).toFixed(2)})`)
        .join('\n')}\n`;
    }
    message += `*Client Name:* ${clientFullName}\n`;
    message += `*Contact Number:* ${booking.state.clientPhone}\n`;
    if (booking.state.clientEmail.trim()) {
      message += `*Email:* ${booking.state.clientEmail.trim()}\n`;
    }
    message += `*Professional:* ${selectedTeamMember?.name || 'Any available professional'}\n`;
    message += `*Preferred Date:* ${bookingDate}\n`;
    message += `*Preferred Time:* ${preferredTimeLabel}\n`;
    message += `*Total Cost:* R${totalCost.toFixed(2)}\n`;
    if (hasDepositRequirement) {
      message += `*Deposit Required:* R${depositAmount.toFixed(2)} (${depositPercentage}%)\n\n`;
    }

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
    if (hasDepositRequirement && salon.paymentInstructions) {
      message += `*Deposit Instructions:*\n${salon.paymentInstructions}\n\n`;
    }

    if (hasDepositRequirement && salon.bankName && salon.accountNumber) {
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

    if (salon.specialConditions) {
      message += `*Special Conditions:*\n${salon.specialConditions}\n\n`;
    }

    if (salon.cancellationPolicy) {
      message += `*Cancellation Policy:*\n${salon.cancellationPolicy}\n\n`;
    }

    message += `*Important:* This booking request was submitted on Stylr SA and will be completed directly with the salon on WhatsApp.\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = salon.whatsapp || salon.phoneNumber || '';
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    onBookingSuccess();
  };

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
                  <div className={styles.servicePriceGroup}>
                    {hasServiceDiscount(svc) && (
                      <>
                        <span className={styles.serviceDiscountBadge}>{formatServiceDiscountLabel(svc)}</span>
                        <span className={styles.servicePriceOriginal}>R{svc.price.toFixed(2)}</span>
                      </>
                    )}
                    <span className={styles.servicePrice}>R{getServiceDiscountedPrice(svc).toFixed(2)}</span>
                  </div>
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
      case 'contact':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaUser /> Your Details
            </h3>
            <p className={styles.stepSubtitle}>
              Start the booking with your name, surname, best contact number, and optional email.
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
              <label htmlFor="phone">Contact Number *</label>
              <input
                id="phone"
                type="tel"
                value={booking.state.clientPhone}
                onChange={(event) => booking.setClientPhone(event.target.value)}
                placeholder="e.g. 082 123 4567"
                className={styles.input}
                required
              />
              <span className={styles.hint}>The salon will use this number to confirm your booking on WhatsApp.</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={booking.state.clientEmail}
                onChange={(event) => booking.setClientEmail(event.target.value)}
                placeholder="Optional"
                className={styles.input}
              />
              <span className={styles.hint}>Optional, but useful if the salon needs a backup contact.</span>
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaCalendarAlt /> Select Date & Time
            </h3>
            <p className={styles.stepSubtitle}>
              Start with the next 7 days, then open more dates if you need extra options.
            </p>

            <div className={styles.dateJourney}>
              <div className={styles.dateJourneyHeader}>
                <div>
                  <span className={styles.dateJourneyLabel}>Available dates</span>
                  <p className={styles.dateJourneyHint}>
                    {showAllBookingDays ? 'Showing the next 4 weeks of availability.' : 'Showing the next 7 days first for a simpler booking flow.'}
                  </p>
                </div>
                {booking.state.selectedDate && (
                  <span className={styles.selectedDateLabel}>
                    {booking.state.selectedDate.toLocaleDateString('en-ZA', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                )}
              </div>

              <div className={styles.dateRail} ref={dateRailRef}>
                {visibleBookingDays.map((day) => {
                  const dateKey = formatDateKey(day);
                  const isSelected = booking.state.selectedDate ? formatDateKey(booking.state.selectedDate) === dateKey : false;
                  const isToday = dateKey === getTodayDateValue();

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      data-date={dateKey}
                      className={`${styles.dateCard} ${isSelected ? styles.dateCardSelected : ''}`}
                      onClick={() => handleDateChange(day)}
                    >
                      <span className={styles.dateCardDay}>
                        {day.toLocaleDateString('en-ZA', { weekday: 'short' })}
                      </span>
                      <span className={styles.dateCardNumber}>{day.getDate()}</span>
                      <span className={styles.dateCardMonth}>
                        {day.toLocaleDateString('en-ZA', { month: 'short' })}
                      </span>
                      {isToday && <span className={styles.dateCardBadge}>Today</span>}
                    </button>
                  );
                })}
              </div>
              {availableBookingDays.length > INITIAL_VISIBLE_BOOKING_DAYS && (
                <button
                  type="button"
                  className={styles.dateRailToggle}
                  onClick={() => setShowAllBookingDays((current) => !current)}
                >
                  {showAllBookingDays ? 'Show fewer dates' : 'View more dates'}
                </button>
              )}
            </div>

            <div className={styles.preferencesSection}>
              <div className={styles.sectionHeader}>
                <FaClock className={styles.sectionIcon} />
                <span>Preferred Time Window</span>
              </div>
              <div className={styles.timeGrid}>
                {TIME_PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.timeSlot} ${booking.state.selectedTimePeriod === option.value ? styles.selectedSlot : ''}`}
                    onClick={() => booking.selectTimePeriod(option.value)}
                  >
                    {booking.state.selectedTimePeriod === option.value && <FaCheck className={styles.slotCheck} />}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
              <span className={styles.hint}>Time windows are grouped as 09:00-12:00, 12:00-15:00, and 15:00-18:00.</span>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaPalette /> Preferences
            </h3>
            <p className={styles.stepSubtitle}>
              Add any preference you have for this booking. Everything on this step is optional.
            </p>

            {availableTeamMembers.length > 0 && (
              <div className={styles.preferencesSection}>
                <div className={styles.sectionHeader}>
                  <FaUser className={styles.sectionIcon} />
                  <span>Choose Your Professional</span>
                  <span className={styles.optionalBadge}>Optional</span>
                </div>
                <div className={styles.professionalList}>
                  <button
                    type="button"
                    className={`${styles.anyProfessionalCard} ${selectedTeamMemberId === null ? styles.selected : ''}`}
                    onClick={() => setSelectedTeamMemberId(null)}
                  >
                    <div className={styles.anyProfessionalIcon}>
                      <FaUser />
                    </div>
                    <div className={styles.anyProfessionalInfo}>
                      <h4>Any available professional</h4>
                      <p>The salon can assign the best available team member for this service.</p>
                    </div>
                  </button>

                  {availableTeamMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      className={`${styles.professionalCard} ${selectedTeamMemberId === member.id ? styles.selected : ''}`}
                      onClick={() => setSelectedTeamMemberId(member.id)}
                    >
                      <div className={styles.professionalAvatar}>
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            sizes="56px"
                            className={styles.professionalAvatarImage}
                          />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div className={styles.professionalInfo}>
                        <p className={styles.professionalName}>{member.name}</p>
                        <p className={styles.professionalRole}>{member.role}</p>
                        {member.specialties && member.specialties.length > 0 && (
                          <div className={styles.professionalSpecialties}>
                            {member.specialties.slice(0, 3).map((specialty) => (
                              <span key={specialty} className={styles.specialtyTag}>
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedTeamMemberId === member.id && (
                        <span className={styles.checkmark}>
                          <FaCheck />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                  <span className={styles.optionalBadge}>Optional</span>
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

            <div className={styles.formGroup}>
              <label htmlFor="notes">Notes for the salon</label>
              <textarea
                id="notes"
                value={booking.state.clientNotes}
                onChange={(event) => booking.setClientNotes(event.target.value)}
                placeholder="Any prep notes, style ideas, or timing preferences..."
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>
        );
      case 'review':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              <FaCheck /> Review & Proceed
            </h3>
            <p className={styles.stepSubtitle}>
              Check your information, review the salon&apos;s booking rules, and then continue to WhatsApp.
            </p>

            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Services</span>
                <span className={styles.summaryValue}>{bookedServices.length} selected</span>
              </div>
              {bookedServices.map((serviceItem) => (
                <div key={serviceItem.id} className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>{serviceItem.title || serviceItem.name}</span>
                  <span className={styles.summaryValue}>
                    R{getServiceDiscountedPrice(serviceItem).toFixed(2)}
                    {hasServiceDiscount(serviceItem) ? ` (${formatServiceDiscountLabel(serviceItem)})` : ''}
                  </span>
                </div>
              ))}
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
                <span className={styles.summaryLabel}>Professional</span>
                <span className={styles.summaryValue}>
                  {selectedTeamMember?.name || 'Any available professional'}
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
                <span className={styles.summaryLabel}>Contact Number</span>
                <span className={styles.summaryValue}>{booking.state.clientPhone}</span>
              </div>
              {booking.state.clientEmail.trim() && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Email</span>
                  <span className={styles.summaryValue}>{booking.state.clientEmail.trim()}</span>
                </div>
              )}
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
                <span className={styles.summaryValue}>R{totalCost.toFixed(2)}</span>
              </div>
              {hasDepositRequirement && (
                <div className={`${styles.summaryItem} ${styles.highlight}`}>
                  <span className={styles.summaryLabel}>Deposit Required ({depositPercentage}%)</span>
                  <span className={styles.summaryValue}>R{depositAmount.toFixed(2)}</span>
                </div>
              )}

              <div className={styles.summaryDivider} />

              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span className={styles.totalPrice}>R{totalCost.toFixed(2)}</span>
              </div>

              {hasDepositRequirement && (
                <div className={styles.depositNote}>
                  <FaInfoCircle />
                  <span>
                    A {depositPercentage}% deposit (R{depositAmount.toFixed(2)}) is required to secure this booking.
                    The remaining R{(totalCost - depositAmount).toFixed(2)} is handled directly with the salon.
                  </span>
                </div>
              )}
            </div>

            {hasDepositRequirement && salon.paymentInstructions && (
              <div className={styles.bookingMessage}>
                <p><strong>Deposit instructions:</strong> {salon.paymentInstructions}</p>
              </div>
            )}

            {hasDepositRequirement && salon.bankName && salon.accountNumber && (
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
                    <span className={styles.bankingValue}><strong>{bookingReference}</strong></span>
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

            {salon.specialConditions && (
              <div className={styles.bookingMessage}>
                <p><strong>Special conditions:</strong> {salon.specialConditions}</p>
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
              <p>
                Stylr SA stores this request for booking purposes and hands the conversation to the salon on WhatsApp.
                Payments, refunds, and final confirmation are handled directly with the salon.
              </p>
            </div>

            <label className={styles.termsCard}>
              <input
                type="checkbox"
                checked={hasAcceptedTerms}
                onChange={(event) => setHasAcceptedTerms(event.target.checked)}
              />
              <span className={styles.termsText}>
                I have checked my booking information, understand my details will be used for booking purposes, and agree to the{' '}
                <a href="/terms" target="_blank" rel="noreferrer" className={styles.termsLink}>
                  terms and conditions
                </a>
                {salon.cancellationPolicy ? ' and the salon cancellation policy' : ''}.
              </span>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName="bg-black/70 lg:bg-transparent lg:pointer-events-none"
        className={`w-screen max-w-none h-[100dvh] overflow-hidden rounded-none p-0 gap-0 flex flex-col sm:w-full sm:max-w-[500px] sm:h-[90vh] sm:rounded-3xl lg:left-auto lg:right-0 lg:top-0 lg:h-[100dvh] lg:max-h-[100dvh] lg:w-[min(560px,40vw)] lg:max-w-none lg:translate-x-0 lg:translate-y-0 lg:rounded-none lg:rounded-l-[28px] lg:border-l lg:border-neutral-200 lg:shadow-[-24px_0_60px_rgba(15,23,42,0.18)] ${styles.desktopPanel}`}
      >
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

        {bookedServices.length > 0 && (
          <div className={styles.bookingSummary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Treatments:</span>
              <span className={styles.summaryValue}>{bookedServices.length} selected</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total:</span>
              <span className={styles.summaryValue}>R{totalCost.toFixed(2)}</span>
            </div>
          </div>
        )}

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

          <div className={styles.footerActions}>
            {booking.state.step !== 'review' && (
              <button
                className={styles.primaryButton}
                onClick={booking.goNext}
                disabled={!booking.canProceed}
              >
                Continue <FaChevronRight />
              </button>
            )}
            <button
              className={`${styles.primaryButton} ${styles.whatsappButton}`}
              onClick={handleSubmit}
              disabled={booking.state.step !== 'review' || isCreatingIntent || !canSubmitBooking}
              title={booking.state.step === 'review' ? undefined : 'Complete the booking details to continue on WhatsApp.'}
            >
              <FaWhatsapp />
              {booking.state.step === 'review'
                ? (isCreatingIntent ? 'Preparing WhatsApp...' : 'Continue to WhatsApp')
                : 'Complete steps for WhatsApp'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
