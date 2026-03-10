'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Service, TeamMember, Salon, Booking } from '@/types';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { notify } from '@/lib/notify';

// ============================================================================
// Types
// ============================================================================

export type BookingStep = 'service' | 'professional' | 'details' | 'date' | 'time' | 'confirm';

export interface TimeSlot {
    time: string;
    available: boolean;
    status: 'available' | 'limited' | 'unavailable';
}

export interface DayAvailability {
    date: string;
    status: 'available' | 'limited' | 'unavailable';
    slotsCount: number;
}

export interface BookingPreferences {
    colorSelection?: string;
    materialSelection: 'HAVE_OWN' | 'BUY_SALON' | 'BUY_PLATFORM' | null;
}

export interface BookingState {
    step: BookingStep;
    selectedService: Service | null;
    selectedProfessional: TeamMember | null;
    useAnyProfessional: boolean;
    selectedDate: Date | null;
    selectedTimePeriod: 'morning' | 'afternoon' | 'late_afternoon' | null;
    selectedSlot: string | null;
    clientName: string;
    clientPhone: string;
    clientNotes: string;
    isMobile: boolean;
    preferences: BookingPreferences | null;
}

export interface UseBookingFlowOptions {
    salon: Salon;
    services: Service[];
    initialService?: Service;
    onBookingSuccess: (booking: Booking) => void;
    onClose: () => void;
}

export interface UseBookingFlowReturn {
    // State
    state: BookingState;

    // Navigation
    currentStepIndex: number;
    totalSteps: number;
    visibleSteps: BookingStep[];
    canProceed: boolean;
    goNext: () => void;
    goBack: () => void;
    goToStep: (step: BookingStep) => void;

    // Service selection
    selectService: (service: Service) => void;

    // Professional selection
    selectProfessional: (professional: TeamMember | null) => void;
    setUseAnyProfessional: (value: boolean) => void;
    teamMembers: TeamMember[];
    loadingTeam: boolean;

    // Date/time selection
    selectDate: (date: Date) => void;
    selectTimePeriod: (period: 'morning' | 'afternoon' | 'late_afternoon') => void;
    selectSlot: (slot: string) => void;
    availableSlots: TimeSlot[];
    loadingSlots: boolean;
    monthAvailability: DayAvailability[];
    loadingMonthAvailability: boolean;
    refreshSlots: () => Promise<void>;

    // Details
    setClientName: (name: string) => void;
    setClientPhone: (phone: string) => void;
    setClientNotes: (notes: string) => void;
    setIsMobile: (value: boolean) => void;
    setPreferences: (preferences: BookingPreferences | null) => void;

    // Calculated values
    totalCost: number;
    depositAmount: number;

    // Submission
    submitBooking: () => Promise<void>;
    isSubmitting: boolean;

    // Error handling
    error: string | null;
    clearError: () => void;

    // Utility
    formatTime: (isoString: string) => string;
    formatDuration: (mins: number, minDuration?: number | null, maxDuration?: number | null) => string;
}

// ============================================================================
// Constants
// ============================================================================

const VISIBLE_STEPS: BookingStep[] = ['details', 'date', 'time', 'confirm'];
const STEP_LABELS: Record<BookingStep, string> = {
    service: 'Service',
    professional: 'Professional',
    details: 'Details',
    date: 'Date',
    time: 'Time',
    confirm: 'Confirm',
};

const DEPOSIT_RATE = 0.50; // 50% deposit required
const SLOT_REFRESH_INTERVAL = 30000; // 30 seconds

// ============================================================================
// Hook
// ============================================================================

export function useBookingFlow({
    salon,
    services: _services,
    initialService,
    onBookingSuccess,
    onClose,
}: UseBookingFlowOptions): UseBookingFlowReturn {
    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    const [state, setState] = useState<BookingState>({
        step: 'details',
        selectedService: initialService || null,
        selectedProfessional: null,
        useAnyProfessional: true,
        selectedDate: null,
        selectedTimePeriod: null,
        selectedSlot: null,
        clientName: '',
        clientPhone: '',
        clientNotes: '',
        isMobile: false,
        preferences: null,
    });

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(false);

    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [monthAvailability, setMonthAvailability] = useState<DayAvailability[]>([]);
    const [loadingMonthAvailability, setLoadingMonthAvailability] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ---------------------------------------------------------------------------
    // Computed values
    // ---------------------------------------------------------------------------

    const visibleSteps = useMemo(() => {
        // Always show only 3 steps: Details, Date & Time, Confirm
        return VISIBLE_STEPS;
    }, []);

    const currentStepIndex = visibleSteps.indexOf(state.step);
    const totalSteps = visibleSteps.length;

    const totalCost = useMemo(() => {
        if (!state.selectedService) return 0;
        const baseCost = state.selectedService.price;
        const mobileFee = state.isMobile && salon.mobileFee ? salon.mobileFee : 0;
        return baseCost + mobileFee;
    }, [state.selectedService, state.isMobile, salon.mobileFee]);

    const depositAmount = useMemo(() => {
        return totalCost * DEPOSIT_RATE;
    }, [totalCost]);

    const canProceed = useMemo(() => {
        switch (state.step) {
            case 'details':
                return state.clientName.trim().length >= 2 && state.clientPhone.length >= 10;
            case 'date':
                return !!state.selectedDate;
            case 'time':
                return !!state.selectedTimePeriod && !!state.selectedSlot;
            case 'confirm':
                return true;
            default:
                return true;
        }
    }, [state]);

    // ---------------------------------------------------------------------------
    // API Fetchers
    // ---------------------------------------------------------------------------

    // Fetch team members
    useEffect(() => {
        const fetchTeamMembers = async () => {
            setLoadingTeam(true);
            setError(null);
            try {
                const response = await fetch(`/api/team-members/salon/${salon.id}`);
                if (!response.ok) {
                    throw new Error('Failed to load team members');
                }
                const data = await response.json();
                setTeamMembers(data);
            } catch (error) {
                console.error('Failed to fetch team members:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to load team members';
                setError(errorMessage);
                notify.error(errorMessage);
            } finally {
                setLoadingTeam(false);
            }
        };
        fetchTeamMembers();
    }, [salon.id]);

    // Fetch time slots when date or service changes
    const fetchSlots = useCallback(async () => {
        if (!state.selectedDate || !state.selectedService) {
            setAvailableSlots([]);
            return;
        }

        setLoadingSlots(true);
        try {
            const dateString = state.selectedDate.toISOString().split('T')[0];
            const response = await fetch(
                `/api/bookings/availability/${state.selectedService.id}?date=${dateString}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch availability');
            }

            const data = await response.json();
            setAvailableSlots(data.slots || []);
        } catch (err) {
            console.error('Error fetching time slots:', err);
            setAvailableSlots([]);
            notify.error('Could not load available time slots. Please try another date.');
        } finally {
            setLoadingSlots(false);
        }
    }, [state.selectedDate, state.selectedService]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    // Auto-refresh slots every 30 seconds when on date or time step
    useEffect(() => {
        if ((state.step !== 'date' && state.step !== 'time') || !state.selectedDate || !state.selectedService) {
            return;
        }

        const interval = setInterval(() => {
            fetchSlots();
        }, SLOT_REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [state.step, state.selectedDate, state.selectedService, fetchSlots]);

    // Fetch month availability for calendar indicators
    const fetchMonthAvailability = useCallback(async (year: number, month: number) => {
        if (!state.selectedService) return;

        setLoadingMonthAvailability(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/availability/${salon.id}/month?year=${year}&month=${month}&serviceId=${state.selectedService.id}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                throw new Error('Failed to load calendar availability');
            }

            const data = await response.json();
            // Transform to DayAvailability format
            const availability: DayAvailability[] = Object.entries(
                data as Record<string, Array<{ isAvailable: boolean }> | undefined>
            ).map(([date, slots]) => {
                const availableCount = Array.isArray(slots)
                    ? slots.filter((s: { isAvailable: boolean }) => s.isAvailable).length
                    : 0;
                return {
                    date,
                    status: availableCount > 5 ? 'available' : availableCount > 0 ? 'limited' : 'unavailable',
                    slotsCount: availableCount,
                };
            });
            setMonthAvailability(availability);
        } catch (error) {
            console.error('Failed to fetch month availability:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load calendar availability';
            setError(errorMessage);
            notify.error(errorMessage);
            setMonthAvailability([]);
        } finally {
            setLoadingMonthAvailability(false);
        }
    }, [salon.id, state.selectedService]);

    useEffect(() => {
        if (!state.selectedService) {
            setMonthAvailability([]);
            return;
        }

        const referenceDate = state.selectedDate ?? new Date();
        void fetchMonthAvailability(referenceDate.getFullYear(), referenceDate.getMonth() + 1);
    }, [fetchMonthAvailability, state.selectedDate, state.selectedService]);

    // ---------------------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------------------

    const goToStep = useCallback((step: BookingStep) => {
        const targetIndex = visibleSteps.indexOf(step);
        if (targetIndex <= currentStepIndex) {
            setState(prev => ({ ...prev, step }));
        }
    }, [visibleSteps, currentStepIndex]);

    const goNext = useCallback(() => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < visibleSteps.length) {
            setState(prev => ({ ...prev, step: visibleSteps[nextIndex] }));
        }
    }, [currentStepIndex, visibleSteps]);

    const goBack = useCallback(() => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setState(prev => ({ ...prev, step: visibleSteps[prevIndex] }));
        } else {
            onClose();
        }
    }, [currentStepIndex, visibleSteps, onClose]);

    // ---------------------------------------------------------------------------
    // Selection handlers
    // ---------------------------------------------------------------------------

    const selectService = useCallback((service: Service) => {
        setState(prev => ({ ...prev, selectedService: service }));
    }, []);

    const selectProfessional = useCallback((professional: TeamMember | null) => {
        setState(prev => ({
            ...prev,
            selectedProfessional: professional,
            useAnyProfessional: professional === null,
        }));
    }, []);

    const setUseAnyProfessional = useCallback((value: boolean) => {
        setState(prev => ({
            ...prev,
            useAnyProfessional: value,
            selectedProfessional: value ? null : prev.selectedProfessional,
        }));
    }, []);

    const selectDate = useCallback((date: Date) => {
        setState(prev => ({
            ...prev,
            selectedDate: date,
            selectedTimePeriod: null, // Reset time period when date changes
            selectedSlot: null, // Reset slot when date changes
        }));
    }, []);

    const selectTimePeriod = useCallback((period: 'morning' | 'afternoon' | 'late_afternoon') => {
        setState(prev => ({ ...prev, selectedTimePeriod: period }));
    }, []);

    const selectSlot = useCallback((slot: string) => {
        setState(prev => ({ ...prev, selectedSlot: slot }));
    }, []);

    const setClientName = useCallback((name: string) => {
        setState(prev => ({ ...prev, clientName: name }));
    }, []);

    const setClientPhone = useCallback((phone: string) => {
        setState(prev => ({ ...prev, clientPhone: phone }));
    }, []);

    const setClientNotes = useCallback((notes: string) => {
        setState(prev => ({ ...prev, clientNotes: notes }));
    }, []);

    const setIsMobile = useCallback((isMobile: boolean) => {
        setState(prev => ({ ...prev, isMobile }));
    }, []);

    const setPreferences = useCallback((preferences: BookingPreferences | null) => {
        setState(prev => ({ ...prev, preferences }));
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ---------------------------------------------------------------------------
    // Submission
    // ---------------------------------------------------------------------------

    const submitBooking = useCallback(async () => {
        // Validate required fields
        if (!state.selectedDate || !state.selectedSlot || !state.selectedService) {
            const errorMsg = 'Please complete all booking details.';
            setError(errorMsg);
            notify.error(errorMsg);
            return;
        }

        // Validate phone number format (South African: 10 digits starting with 0)
        const phoneRegex = /^0[0-9]{9}$/;
        if (!phoneRegex.test(state.clientPhone.replace(/\s/g, ''))) {
            const errorMsg = 'Please enter a valid South African phone number (10 digits starting with 0)';
            setError(errorMsg);
            notify.error(errorMsg);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const newBooking = await apiJson(`/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: state.selectedService.id,
                    bookingTime: state.selectedSlot,
                    clientPhone: state.clientPhone.replace(/\s/g, ''),
                    isMobile: state.isMobile,
                    teamMemberId: state.useAnyProfessional ? null : state.selectedProfessional?.id,
                    clientNotes: state.clientNotes.trim() || null,
                    colorSelection: state.preferences?.colorSelection || null,
                    materialSelection: state.preferences?.materialSelection || null,
                }),
            }) as Booking;

            notify.success('Booking request sent successfully.');

            // Generate ICS file for calendar
            try {
                const start = new Date(newBooking.bookingTime);
                const dt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                const end = new Date(start.getTime() + (state.selectedService.duration || 60) * 60000);
                const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StylrSA//Booking//EN\nBEGIN:VEVENT\nUID:${newBooking.id}@stylrsa\nDTSTAMP:${dt(new Date())}\nDTSTART:${dt(start)}\nDTEND:${dt(end)}\nSUMMARY:${state.selectedService.title || 'Salon Service'} at ${salon.name}\nDESCRIPTION:Booking via Stylr SA\nLOCATION:${salon.address || salon.city + ', ' + salon.province}\nEND:VEVENT\nEND:VCALENDAR`;
                const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${state.selectedService.title || 'service'}-${start.toISOString().slice(0, 10)}.ics`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch { /* Ignore ICS generation errors */ }

            onBookingSuccess(newBooking);
        } catch (error: unknown) {
            let errorMessage = 'Could not send booking request. Please try again.';

            // Handle specific error types
            if (error instanceof Error && error.message) {
                if (error.message.includes('time slot is not available')) {
                    errorMessage = 'This time slot is no longer available. Please select another time.';
                } else if (error.message.includes('Phone number')) {
                    errorMessage = error.message;
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else {
                    errorMessage = toFriendlyMessage(error, errorMessage);
                }
            }

            setError(errorMessage);
            notify.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [state, salon, onBookingSuccess]);

    // ---------------------------------------------------------------------------
    // Utility functions
    // ---------------------------------------------------------------------------

    const formatTime = useCallback((isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }, []);

    const formatDuration = useCallback((
        mins: number,
        minDuration?: number | null,
        maxDuration?: number | null
    ) => {
        const formatMins = (m: number) => {
            if (m < 60) return `${m} mins`;
            const hours = Math.floor(m / 60);
            const mins = m % 60;
            if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
            return `${hours} hr${hours > 1 ? 's' : ''}, ${mins} mins`;
        };

        if (minDuration && maxDuration && minDuration !== maxDuration) {
            return `${formatMins(minDuration)} - ${formatMins(maxDuration)}`;
        }

        return formatMins(mins);
    }, []);

    // ---------------------------------------------------------------------------
    // Return
    // ---------------------------------------------------------------------------

    return {
        state,
        currentStepIndex,
        totalSteps,
        visibleSteps,
        canProceed,
        goNext,
        goBack,
        goToStep,
        selectService,
        selectProfessional,
        setUseAnyProfessional,
        teamMembers,
        loadingTeam,
        selectDate,
        selectTimePeriod,
        selectSlot,
        availableSlots,
        loadingSlots,
        monthAvailability,
        loadingMonthAvailability,
        refreshSlots: fetchSlots,
        setClientName,
        setClientPhone,
        setClientNotes,
        setIsMobile,
        setPreferences,
        totalCost,
        depositAmount,
        submitBooking,
        isSubmitting,
        error,
        clearError,
        formatTime,
        formatDuration,
    };
}

export { STEP_LABELS };
export default useBookingFlow;
