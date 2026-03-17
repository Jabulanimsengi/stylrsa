'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Salon, Service } from '@/types';

export type BookingStep = 'service' | 'details' | 'confirm';
export type BookingTimePeriod = 'morning' | 'afternoon' | 'late_afternoon';

export interface BookingPreferences {
  colorSelection?: string;
  materialSelection: 'HAVE_OWN' | 'BUY_SALON' | null;
}

export interface BookingState {
  step: BookingStep;
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTimePeriod: BookingTimePeriod | null;
  clientFirstName: string;
  clientLastName: string;
  clientPhone: string;
  clientNotes: string;
  isMobile: boolean;
  preferences: BookingPreferences | null;
}

export interface UseBookingFlowOptions {
  salon: Salon;
  services: Service[];
  initialService?: Service;
  onBookingSuccess: () => void;
  onClose: () => void;
}

export interface UseBookingFlowReturn {
  state: BookingState;
  currentStepIndex: number;
  totalSteps: number;
  visibleSteps: BookingStep[];
  canProceed: boolean;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: BookingStep) => void;
  selectService: (service: Service) => void;
  selectDate: (date: Date) => void;
  selectTimePeriod: (period: BookingTimePeriod) => void;
  setClientFirstName: (name: string) => void;
  setClientLastName: (name: string) => void;
  setClientPhone: (phone: string) => void;
  setClientNotes: (notes: string) => void;
  setIsMobile: (value: boolean) => void;
  setPreferences: (preferences: BookingPreferences | null) => void;
  totalCost: number;
  depositAmount: number;
  error: string | null;
  clearError: () => void;
  formatDuration: (mins: number, minDuration?: number | null, maxDuration?: number | null) => string;
}

const STEP_LABELS: Record<BookingStep, string> = {
  service: 'Service',
  details: 'Details',
  confirm: 'Confirm',
};

const DEPOSIT_RATE = 0.5;

export function useBookingFlow({
  salon,
  initialService,
  onClose,
}: UseBookingFlowOptions): UseBookingFlowReturn {
  const [state, setState] = useState<BookingState>({
    step: initialService ? 'details' : 'service',
    selectedService: initialService ?? null,
    selectedDate: null,
    selectedTimePeriod: null,
    clientFirstName: '',
    clientLastName: '',
    clientPhone: '',
    clientNotes: '',
    isMobile: false,
    preferences: null,
  });
  const [error, setError] = useState<string | null>(null);

  const visibleSteps = useMemo<BookingStep[]>(
    () => (state.selectedService ? ['details', 'confirm'] : ['service', 'details', 'confirm']),
    [state.selectedService],
  );

  const currentStepIndex = visibleSteps.indexOf(state.step);
  const totalSteps = visibleSteps.length;

  const totalCost = useMemo(() => {
    if (!state.selectedService) {
      return 0;
    }

    const baseCost = state.selectedService.price;
    const mobileFee = state.isMobile && salon.mobileFee ? salon.mobileFee : 0;
    return baseCost + mobileFee;
  }, [salon.mobileFee, state.isMobile, state.selectedService]);

  const depositAmount = useMemo(() => totalCost * DEPOSIT_RATE, [totalCost]);

  const canProceed = useMemo(() => {
    switch (state.step) {
      case 'service':
        return Boolean(state.selectedService);
      case 'details':
        return (
          state.clientFirstName.trim().length >= 2 &&
          state.clientLastName.trim().length >= 2 &&
          state.clientPhone.replace(/\s/g, '').length >= 10 &&
          Boolean(state.selectedDate) &&
          Boolean(state.selectedTimePeriod) &&
          Boolean(state.selectedService)
        );
      case 'confirm':
        return true;
      default:
        return false;
    }
  }, [state]);

  const goToStep = useCallback((step: BookingStep) => {
    const targetIndex = visibleSteps.indexOf(step);
    if (targetIndex <= currentStepIndex) {
      setState((prev) => ({ ...prev, step }));
    }
  }, [currentStepIndex, visibleSteps]);

  const goNext = useCallback(() => {
    if (!canProceed) {
      setError('Please complete the required booking details before continuing.');
      return;
    }

    setError(null);
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < visibleSteps.length) {
      setState((prev) => ({ ...prev, step: visibleSteps[nextIndex] }));
    }
  }, [canProceed, currentStepIndex, visibleSteps]);

  const goBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setError(null);
      setState((prev) => ({ ...prev, step: visibleSteps[prevIndex] }));
    } else {
      onClose();
    }
  }, [currentStepIndex, onClose, visibleSteps]);

  const selectService = useCallback((service: Service) => {
    setError(null);
    setState((prev) => ({ ...prev, selectedService: service }));
  }, []);

  const selectDate = useCallback((date: Date) => {
    setError(null);
    setState((prev) => ({ ...prev, selectedDate: date }));
  }, []);

  const selectTimePeriod = useCallback((period: BookingTimePeriod) => {
    setError(null);
    setState((prev) => ({ ...prev, selectedTimePeriod: period }));
  }, []);

  const setClientFirstName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, clientFirstName: name }));
  }, []);

  const setClientLastName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, clientLastName: name }));
  }, []);

  const setClientPhone = useCallback((phone: string) => {
    setState((prev) => ({ ...prev, clientPhone: phone }));
  }, []);

  const setClientNotes = useCallback((notes: string) => {
    setState((prev) => ({ ...prev, clientNotes: notes }));
  }, []);

  const setIsMobile = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, isMobile: value }));
  }, []);

  const setPreferences = useCallback((preferences: BookingPreferences | null) => {
    setState((prev) => {
      const prevPreferences = prev.preferences;
      const hasSamePreferences =
        prevPreferences?.colorSelection === preferences?.colorSelection &&
        prevPreferences?.materialSelection === preferences?.materialSelection;

      if (hasSamePreferences) {
        return prev;
      }

      return { ...prev, preferences };
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const formatDuration = useCallback((
    mins: number,
    minDuration?: number | null,
    maxDuration?: number | null,
  ) => {
    const formatMinutes = (value: number) => {
      if (value < 60) {
        return `${value} mins`;
      }

      const hours = Math.floor(value / 60);
      const remainingMinutes = value % 60;
      if (remainingMinutes === 0) {
        return `${hours} hr${hours > 1 ? 's' : ''}`;
      }

      return `${hours} hr${hours > 1 ? 's' : ''}, ${remainingMinutes} mins`;
    };

    if (minDuration && maxDuration && minDuration !== maxDuration) {
      return `${formatMinutes(minDuration)} - ${formatMinutes(maxDuration)}`;
    }

    return formatMinutes(mins);
  }, []);

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
    selectDate,
    selectTimePeriod,
    setClientFirstName,
    setClientLastName,
    setClientPhone,
    setClientNotes,
    setIsMobile,
    setPreferences,
    totalCost,
    depositAmount,
    error,
    clearError,
    formatDuration,
  };
}

export { STEP_LABELS };
export default useBookingFlow;
