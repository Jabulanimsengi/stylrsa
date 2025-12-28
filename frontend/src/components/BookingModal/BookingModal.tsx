'use client';

import { useState, useEffect, useMemo, FormEvent, useTransition } from 'react';
import Image from 'next/image';
import { Salon, Service, Booking, TeamMember } from '@/types';
import styles from './BookingModal.module.css';
import { toast } from 'react-toastify';
import {
  FaTimes,
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
  FaInfoCircle,
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { useSocket } from '@/context/SocketContext';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import BookingPreferencesStep, { BookingPreferences } from './BookingPreferencesStep';
import BookingPaymentStep, { PaymentDetails } from './BookingPaymentStep';
import UpsellPopup from '../UpsellPopup/UpsellPopup';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Progress,
} from '@/components/ui';

interface BookingModalProps {
  salon: Salon;
  service?: Service;
  services: Service[];
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  status: 'available' | 'busy' | 'unavailable';
}

type Step = 'service' | 'professional' | 'date' | 'time' | 'details' | 'preferences' | 'payment' | 'confirm';

const STEPS: Step[] = ['service', 'professional', 'date', 'time', 'details', 'preferences', 'payment', 'confirm'];
const STEP_LABELS: Record<Step, string> = {
  service: 'Services',
  professional: 'Professional',
  date: 'Date',
  time: 'Time',
  details: 'Details',
  preferences: 'Preferences',
  payment: 'Payment',
  confirm: 'Confirm',
};

export default function BookingModal({
  salon,
  service: initialService,
  services,
  onClose,
  onBookingSuccess,
}: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(initialService ? 'professional' : 'service');
  const [selectedService, setSelectedService] = useState<Service | null>(initialService || null);
  const [selectedProfessional, setSelectedProfessional] = useState<TeamMember | null>(null);
  const [useAnyProfessional, setUseAnyProfessional] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // New booking flow state
  const [bookingPreferences, setBookingPreferences] = useState<BookingPreferences | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);

  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();

  // Fetch team members when component mounts
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoadingTeam(true);
      try {
        const response = await fetch(`/api/team-members/salon/${salon.id}`);
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data);
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      } finally {
        setLoadingTeam(false);
      }
    };
    fetchTeamMembers();
  }, [salon.id]);

  // Get visible steps based on whether initial service provided
  const visibleSteps = useMemo(() => {
    if (initialService) {
      return STEPS.filter(s => s !== 'service');
    }
    return STEPS;
  }, [initialService]);

  // Get current step index
  const currentStepIndex = visibleSteps.indexOf(currentStep);
  const stepNumber = currentStepIndex + 1;
  const totalSteps = visibleSteps.length;

  // Days in month for calendar
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    const endDay = lastDay.getDay();
    for (let day = 1; day < 7 - endDay; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  }, [currentMonth]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedService) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const response = await fetch(
          `/api/bookings/availability/${selectedService.id}?date=${dateString}`,
          { credentials: 'include' }
        );

        if (!response.ok) throw new Error('Failed to fetch availability');
        const data = await response.json();
        setSlots(data.slots || []);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedService, selectedDate]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!selectedDate || !selectedSlot || !selectedService) {
      toast.error('Please complete all booking details.');
      return;
    }

    if (authStatus !== 'authenticated' || !user) {
      toast.error('You must be logged in to book.');
      openModal('login');
      return;
    }

    setIsLoading(true);

    try {
      const newBooking = await apiJson(`/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          bookingTime: selectedSlot,
          clientPhone,
          isMobile,
          teamMemberId: useAnyProfessional ? null : selectedProfessional?.id,
          clientNotes: clientNotes.trim() || null,
          // New booking fields
          colorSelection: bookingPreferences?.colorSelection || null,
          materialSelection: bookingPreferences?.materialSelection || null,
          depositPaid: paymentDetails?.amountToPay === 0 || (paymentDetails?.amountToPay && paymentDetails.amountToPay > 0),
          useCashback: paymentDetails?.useCashback || false,
          cashbackUsed: paymentDetails?.cashbackUsed || 0,
        }),
      }) as Booking;

      if (socket) {
        socket.emit('newBooking', {
          bookingId: newBooking.id,
          salonOwnerId: salon.ownerId,
          message: `New booking for ${selectedService.title} from ${user.firstName}.`,
        });
      }

      toast.success('Booking request sent successfully!');

      // Check if service is braiding-related for upsell popup
      const serviceName = (selectedService.title || selectedService.name || '').toLowerCase();
      const isBraidingService = ['braid', 'cornrow', 'twist', 'loc', 'extension', 'weave'].some(
        (term) => serviceName.includes(term)
      );
      setShowUpsell(isBraidingService);

      // Generate ICS file
      try {
        const start = new Date(newBooking.bookingTime);
        const dt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const end = new Date(start.getTime() + (selectedService.duration || 60) * 60000);
        const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StylrSA//Booking//EN\nBEGIN:VEVENT\nUID:${newBooking.id}@stylrsa\nDTSTAMP:${dt(new Date())}\nDTSTART:${dt(start)}\nDTEND:${dt(end)}\nSUMMARY:${selectedService.title || 'Salon Service'} at ${salon.name}\nDESCRIPTION:Booking via Stylr SA\nLOCATION:${salon.address || salon.city + ', ' + salon.province}\nEND:VEVENT\nEND:VCALENDAR`;
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedService.title || 'service'}-${start.toISOString().slice(0, 10)}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch { }

      startTransition(() => {
        onBookingSuccess(newBooking);
      });
    } catch (error: any) {
      toast.error(toFriendlyMessage(error, 'Could not send booking request. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const goToStep = (step: Step) => {
    // Only allow going to completed steps or current step
    const targetIndex = visibleSteps.indexOf(step);
    if (targetIndex <= currentStepIndex) {
      setCurrentStep(step);
    }
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < visibleSteps.length) {
      setCurrentStep(visibleSteps[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(visibleSteps[prevIndex]);
    } else {
      onClose();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'service':
        return !!selectedService;
      case 'professional':
        return true; // Always can proceed - "Any professional" is default
      case 'date':
        return !!selectedDate;
      case 'time':
        return !!selectedSlot;
      case 'details':
        return clientPhone.length >= 10;
      case 'preferences':
        return true; // Preferences are optional - user can skip
      case 'payment':
        return !!paymentDetails; // Ensure payment step is acknowledged
      case 'confirm':
        return true;
      default:
        return true;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (mins: number, minDuration?: number | null, maxDuration?: number | null) => {
    // If we have min/max duration range
    if (minDuration && maxDuration && minDuration !== maxDuration) {
      const formatMins = (m: number) => {
        if (m < 60) return `${m} mins`;
        const hours = Math.floor(m / 60);
        const mins = m % 60;
        if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
        return `${hours} hr${hours > 1 ? 's' : ''}, ${mins} mins`;
      };
      return `${formatMins(minDuration)} - ${formatMins(maxDuration)}`;
    }

    // Single duration
    if (mins < 60) return `${mins} mins`;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (minutes === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${hours} hr${hours > 1 ? 's' : ''}, ${minutes} mins`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const totalCost = selectedService
    ? selectedService.price + (isMobile && salon.mobileFee ? salon.mobileFee : 0)
    : 0;

  const availableSlots = slots.filter((s) => s.available);

  // Render breadcrumbs
  const renderBreadcrumbs = () => (
    <div className={styles.breadcrumbs}>
      {visibleSteps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isActive = index === currentStepIndex;
        return (
          <span key={step}>
            {index > 0 && <span className={styles.breadcrumbSeparator}>›</span>}
            <span
              className={`${styles.breadcrumbItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              onClick={() => goToStep(step)}
            >
              {isCompleted && <FaCheck />}
              {STEP_LABELS[step]}
            </span>
          </span>
        );
      })}
    </div>
  );

  // Use Shadcn Dialog instead of createPortal
  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-hidden p-0 gap-0">
          {/* Visually hidden title for accessibility */}
          <DialogTitle className="sr-only">Book Appointment at {salon.name}</DialogTitle>

          {/* Header */}
          <div className={styles.header}>
            <button className={styles.backButton} onClick={goBack} aria-label="Go back">
              <FaChevronLeft />
            </button>
            <div className={styles.headerContent}>
              <h2>Book Appointment</h2>
              <span className={styles.salonName}>{salon.name}</span>
            </div>
            {/* Close button handled by Dialog, but we keep for styling consistency */}
          </div>

          {/* Breadcrumbs */}
          {renderBreadcrumbs()}

          {/* Progress indicator */}
          <div className="px-4 py-2">
            <Progress value={(stepNumber / totalSteps) * 100} className="h-2" />
            <span className="text-xs text-muted-foreground mt-1 block text-center">
              Step {stepNumber} of {totalSteps}
            </span>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Step 1: Select Service */}
            {currentStep === 'service' && (
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Select a Service</h3>
                <div className={styles.serviceList}>
                  {services.map((svc) => (
                    <button
                      key={svc.id}
                      className={`${styles.serviceCard} ${selectedService?.id === svc.id ? styles.selected : ''}`}
                      onClick={() => setSelectedService(svc)}
                    >
                      <div className={styles.serviceInfo}>
                        <span className={styles.serviceName}>{svc.title || svc.name}</span>
                        <span className={styles.serviceDuration}>
                          <FaClock /> {formatDuration(svc.duration, (svc as any).durationMin, (svc as any).durationMax)}
                        </span>
                      </div>
                      <span className={styles.servicePrice}>R{svc.price}</span>
                      {selectedService?.id === svc.id && (
                        <span className={styles.checkmark}>
                          <FaCheck />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Professional */}
            {currentStep === 'professional' && (
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>
                  <FaUsers /> Choose a Professional
                  <span className={styles.optionalBadge}>Optional</span>
                </h3>

                <div className={styles.professionalList}>
                  {/* "Any Professional" option */}
                  <button
                    className={`${styles.anyProfessionalCard} ${useAnyProfessional ? styles.selected : ''}`}
                    onClick={() => {
                      setUseAnyProfessional(true);
                      setSelectedProfessional(null);
                    }}
                  >
                    <div className={styles.anyProfessionalIcon}>
                      <FaUsers />
                    </div>
                    <div className={styles.anyProfessionalInfo}>
                      <h4>Any Professional</h4>
                      <p>We'll assign the best available stylist</p>
                    </div>
                    {useAnyProfessional && (
                      <span className={styles.checkmark}>
                        <FaCheck />
                      </span>
                    )}
                  </button>

                  {/* Team Members */}
                  {loadingTeam ? (
                    <div className={styles.loadingSlots}>
                      <div className={styles.spinner} />
                      <span>Loading team...</span>
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <button
                        key={member.id}
                        className={`${styles.professionalCard} ${!useAnyProfessional && selectedProfessional?.id === member.id ? styles.selected : ''}`}
                        onClick={() => {
                          setUseAnyProfessional(false);
                          setSelectedProfessional(member);
                        }}
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
                        {!useAnyProfessional && selectedProfessional?.id === member.id && (
                          <span className={styles.checkmark}>
                            <FaCheck />
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Select Date */}
            {currentStep === 'date' && (
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>
                  <FaCalendarAlt /> Pick a Date
                </h3>
                <div className={styles.calendar}>
                  <div className={styles.calendarHeader}>
                    <button
                      onClick={() =>
                        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
                      }
                      className={styles.navButton}
                    >
                      <FaChevronLeft />
                    </button>
                    <span className={styles.monthYear}>
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))
                      }
                      className={styles.navButton}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                  <div className={styles.weekDays}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <span key={i} className={styles.weekDay}>
                        {day}
                      </span>
                    ))}
                  </div>
                  <div className={styles.daysGrid}>
                    {daysInMonth.map((date, index) => {
                      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlot(null);
                          }}
                          disabled={isPast(date)}
                          className={`
                            ${styles.day}
                            ${!isCurrentMonth ? styles.otherMonth : ''}
                            ${isPast(date) ? styles.past : ''}
                            ${isSelected(date) ? styles.selectedDay : ''}
                            ${isToday(date) ? styles.today : ''}
                          `}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Select Time */}
            {currentStep === 'time' && (
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>
                  <FaClock /> Choose a Time
                </h3>
                {selectedDate && (
                  <p className={styles.selectedDateLabel}>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                {loadingSlots ? (
                  <div className={styles.loadingSlots}>
                    <div className={styles.spinner} />
                    <span>Loading available times...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className={styles.timeGrid}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        className={`${styles.timeSlot} ${selectedSlot === slot.time ? styles.selectedSlot : ''}`}
                        onClick={() => setSelectedSlot(slot.time)}
                      >
                        {formatTime(slot.time)}
                        {selectedSlot === slot.time && <FaCheck className={styles.slotCheck} />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noSlots}>
                    <p>No available times for this date.</p>
                    <button className={styles.linkButton} onClick={() => goToStep('date')}>
                      Choose another date
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Your Details */}
            {currentStep === 'details' && (
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>
                  <FaUser /> Your Details
                </h3>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Contact Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
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
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Any specific requests or preferences..."
                    className={styles.textarea}
                    rows={3}
                  />
                </div>

                {salon.bookingType !== 'ONSITE' && (
                  <div className={styles.mobileOption}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={isMobile}
                        onChange={(e) => setIsMobile(e.target.checked)}
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
              </div>
            )}

            {/* Step 6: Preferences (Color/Material) */}
            {currentStep === 'preferences' && selectedService && (
              <BookingPreferencesStep
                serviceName={selectedService.title || selectedService.name || 'Service'}
                serviceCategory={(selectedService as any).category?.name || (selectedService as any).category?.slug}
                salonId={salon.id}
                onContinue={(preferences) => {
                  setBookingPreferences(preferences);
                  goNext();
                }}
                onBack={goBack}
              />
            )}

            {/* Step 7: Payment */}
            {currentStep === 'payment' && selectedService && (
              <BookingPaymentStep
                servicePrice={selectedService.price + (isMobile && salon.mobileFee ? salon.mobileFee : 0)}
                serviceName={selectedService.title || selectedService.name || 'Service'}
                salonName={salon.name}
                onConfirm={(details) => {
                  setPaymentDetails(details);
                  goNext();
                }}
                onBack={goBack}
                isLoading={isLoading}
              />
            )}

            {/* Step 8: Confirm */}
            {currentStep === 'confirm' && selectedService && (
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>
                  <FaCheck /> Confirm Booking
                </h3>
                <div className={styles.summary}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Service</span>
                    <span className={styles.summaryValue}>{selectedService.title || selectedService.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Professional</span>
                    <span className={styles.summaryValue}>
                      {useAnyProfessional ? 'Any available' : selectedProfessional?.name}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Date</span>
                    <span className={styles.summaryValue}>
                      {selectedDate?.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Time</span>
                    <span className={styles.summaryValue}>{selectedSlot && formatTime(selectedSlot)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Duration</span>
                    <span className={styles.summaryValue}>
                      {formatDuration(selectedService.duration, (selectedService as any).durationMin, (selectedService as any).durationMax)}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Location</span>
                    <span className={styles.summaryValue}>
                      <FaMapMarkerAlt /> {isMobile ? 'Mobile visit' : salon.address || `${salon.city}, ${salon.province}`}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Contact</span>
                    <span className={styles.summaryValue}>{clientPhone}</span>
                  </div>
                  {clientNotes && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Notes</span>
                      <span className={styles.summaryValue}>{clientNotes}</span>
                    </div>
                  )}
                  {bookingPreferences?.colorSelection && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Color Choice</span>
                      <span className={styles.summaryValue}>{bookingPreferences.colorSelection}</span>
                    </div>
                  )}
                  {bookingPreferences?.materialSelection && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Material</span>
                      <span className={styles.summaryValue}>{bookingPreferences.materialSelection}</span>
                    </div>
                  )}
                  <div className={styles.summaryDivider} />
                  {paymentDetails && (
                    <>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Deposit (60%)</span>
                        <span className={styles.summaryValue}>R{paymentDetails.depositAmount.toFixed(2)}</span>
                      </div>
                      {paymentDetails.useCashback && paymentDetails.cashbackUsed > 0 && (
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Cashback Applied</span>
                          <span className={styles.summaryValue} style={{ color: 'var(--success)' }}>
                            -R{paymentDetails.cashbackUsed.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Due Now</span>
                        <span className={styles.summaryValue} style={{ fontWeight: 600 }}>
                          R{paymentDetails.amountToPay.toFixed(2)}
                        </span>
                      </div>
                      <div className={styles.summaryDivider} />
                    </>
                  )}
                  <div className={styles.summaryTotal}>
                    <span>Total</span>
                    <span className={styles.totalPrice}>R{totalCost.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cancellation Policy */}
                {(salon as any).cancellationPolicy && (
                  <div className={styles.cancellationPolicy}>
                    <div className={styles.cancellationPolicyHeader}>
                      <FaExclamationTriangle /> Cancellation Policy
                    </div>
                    <p className={styles.cancellationPolicyText}>
                      {(salon as any).cancellationPolicy}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            {currentStep === 'confirm' ? (
              <button
                className={styles.primaryButton}
                onClick={() => handleSubmit()}
                disabled={isLoading || isPending}
              >
                {isLoading ? 'Sending...' : isPending ? 'Finalising...' : 'Confirm Booking'}
              </button>
            ) : (
              <button
                className={styles.primaryButton}
                onClick={goNext}
                disabled={!canProceed()}
              >
                Continue <FaChevronRight />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <UpsellPopup
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        serviceName={selectedService?.title || selectedService?.name || ''}
        salonId={salon.id}
        onProductSelect={(product) => {
          window.open(`/marketplace?product=${product.id}`, '_blank');
          setShowUpsell(false);
        }}
      />
    </>
  );
}
