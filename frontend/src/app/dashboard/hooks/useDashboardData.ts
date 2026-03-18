'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  GalleryImage,
  PlanCode,
  Promotion,
  Salon,
  Service,
} from '@/types';
import { apiFetch, apiJson } from '@/lib/api';
import { notify } from '@/lib/notify';
import { toFriendlyMessage } from '@/lib/errors';
import { initializeOperatingHours, type OperatingHours } from '@/components/OperatingHoursInput';
import type {
  DashboardBooking,
  DashboardPromotionsState,
} from '../types';
import {
  buildOperatingHoursPayload,
  buildOperatingHoursState,
  buildPlanChangePayload,
  EMPTY_DASHBOARD_PROMOTIONS,
  normalizeDashboardPromotion,
  removeGalleryImage,
  removePromotionFromState,
  upsertDashboardService,
} from '../dashboardDataUtils';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type DashboardDeleteTarget = 'service' | 'promotion' | 'gallery';

interface UseDashboardDataOptions {
  ownerId?: string | null;
  authStatus: AuthStatus;
  onSessionExpired: () => void;
}

interface BankingDetailsState {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
}

export function useDashboardData({
  ownerId,
  authStatus,
  onSessionExpired,
}: UseDashboardDataOptions) {
  const [salon, setSalon] = useState<Salon | null | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [promotions, setPromotions] = useState<DashboardPromotionsState>(EMPTY_DASHBOARD_PROMOTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlanUpdating, setIsPlanUpdating] = useState(false);

  const [bookingMessage, setBookingMessage] = useState('');
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [bankingDetails, setBankingDetails] = useState<BankingDetailsState>({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    branchCode: '',
  });
  const [isSavingBankingDetails, setIsSavingBankingDetails] = useState(false);
  const [isEditingBankingDetails, setIsEditingBankingDetails] = useState(false);

  const [operatingHours, setOperatingHours] = useState<OperatingHours>(initializeOperatingHours());
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);

  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanCode | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [isSubmittingPlanChange, setIsSubmittingPlanChange] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!ownerId) {
      setIsLoading(false);
      setSalon(null);
      return;
    }

    setIsLoading(true);

    try {
      const salonRes = await fetch(`/api/salons/my-salon?ownerId=${ownerId}`, {
        credentials: 'include',
        cache: 'no-store' as RequestCache,
      });

      if (salonRes.status === 401) {
        notify.error('Session expired.');
        onSessionExpired();
        return;
      }

      if (salonRes.status === 404) {
        setSalon(null);
        setIsLoading(false);
        return;
      }

      if (!salonRes.ok) {
        throw new Error('Could not fetch salon data.');
      }

      const text = await salonRes.text();
      if (!text || text.trim() === '') {
        setSalon(null);
        setIsLoading(false);
        return;
      }

      const salonData = JSON.parse(text) as Salon;
      if (!salonData) {
        setSalon(null);
        setIsLoading(false);
        return;
      }

      setSalon(salonData);
      setBookingMessage(salonData.bookingMessage || '');
      setIsEditingMessage(!salonData.bookingMessage);
      setBankingDetails({
        bankName: salonData.bankName || '',
        accountHolder: salonData.accountHolder || '',
        accountNumber: salonData.accountNumber || '',
        branchCode: salonData.branchCode || '',
      });
      setIsEditingBankingDetails(!(salonData.bankName && salonData.accountNumber));

      const nextHoursState = buildOperatingHoursState(salonData.operatingHours);
      setOperatingHours(nextHoursState.operatingHours);
      setIsEditingHours(nextHoursState.isEditingHours);

      const results = await Promise.allSettled([
        apiJson(`/api/salons/mine/services?ownerId=${ownerId}`),
        apiJson(`/api/salons/mine/bookings?ownerId=${ownerId}`),
        apiJson(`/api/gallery/salon/${salonData.id}`),
        apiJson(`/api/promotions/my-salon`),
      ]);

      const [servicesRes, bookingsRes, galleryRes, promotionsRes] = results;
      if (servicesRes.status === 'fulfilled') setServices(servicesRes.value as Service[]);
      if (bookingsRes.status === 'fulfilled') {
        setBookings(Array.isArray(bookingsRes.value) ? (bookingsRes.value as DashboardBooking[]) : []);
      }
      if (galleryRes.status === 'fulfilled') setGalleryImages(galleryRes.value as GalleryImage[]);
      if (promotionsRes.status === 'fulfilled') {
        setPromotions((promotionsRes.value as DashboardPromotionsState) || EMPTY_DASHBOARD_PROMOTIONS);
      }
    } catch (err: unknown) {
      notify.error(toFriendlyMessage(err, 'Failed to load dashboard.'));
    } finally {
      setIsLoading(false);
    }
  }, [onSessionExpired, ownerId]);

  useEffect(() => {
    if (authStatus === 'loading') {
      setIsLoading(true);
      return;
    }

    if (authStatus === 'unauthenticated') {
      onSessionExpired();
      return;
    }

    if (authStatus === 'authenticated' && ownerId) {
      void fetchDashboardData();
    } else if (authStatus === 'authenticated' && !ownerId) {
      setIsLoading(false);
      setSalon(null);
    }
  }, [authStatus, fetchDashboardData, onSessionExpired, ownerId]);

  const handlePlanProofUpdate = useCallback(async (hasProof: boolean) => {
    if (!ownerId) return;

    setIsPlanUpdating(true);
    try {
      const res = await fetch(`/api/salons/mine/plan?ownerId=${ownerId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasSentProof: hasProof }),
      });
      if (!res.ok) throw new Error('Failed to update plan status');
      const updatedSalon = await res.json();
      setSalon(updatedSalon);
      notify.success(hasProof ? 'Proof submitted. We will review shortly.' : 'Status updated.');
    } catch {
      notify.error('Could not update payment status.');
    } finally {
      setIsPlanUpdating(false);
    }
  }, [ownerId]);

  const handlePlanChange = useCallback(async (newPlanCode: PlanCode) => {
    if (!ownerId) return;

    setIsSubmittingPlanChange(true);
    try {
      const body = buildPlanChangePayload(newPlanCode, paymentReference, salon?.name);

      const res = await fetch(`/api/salons/mine/plan?ownerId=${ownerId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to change plan');
      const updatedSalon = await res.json();
      setSalon(updatedSalon);
        setSelectedPlanForUpgrade(null);
        setPaymentReference('');

        notify.success(
          'Plan updated. Please submit payment proof.',
        );
    } catch {
      notify.error('Could not change plan. Please try again.');
    } finally {
      setIsSubmittingPlanChange(false);
    }
  }, [ownerId, paymentReference, salon?.name]);

  const upsertService = useCallback((savedService: Service, existingServiceId?: string | null) => {
    setServices((current) => upsertDashboardService(current, savedService, existingServiceId));
  }, []);

  const addPromotion = useCallback((addedPromotion: Promotion) => {
    const normalizedPromotion = normalizeDashboardPromotion(addedPromotion);
    setPromotions((current) => ({ ...current, active: [...current.active, normalizedPromotion] }));
  }, []);

  const deleteDashboardItem = useCallback(async (id: string, type: DashboardDeleteTarget) => {
    try {
      const url = type === 'gallery' ? `/api/gallery/${id}` : `/api/${type}s/${id}`;
      await apiFetch(url, { method: 'DELETE' });

      if (type === 'service') {
        setServices((current) => current.filter((service) => service.id !== id));
      } else if (type === 'promotion') {
        setPromotions((current) => removePromotionFromState(current, id));
      } else {
        setGalleryImages((current) => removeGalleryImage(current, id));
      }

      notify.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`);
    } catch (err: unknown) {
      notify.error(toFriendlyMessage(err, 'Deletion failed'));
      throw err;
    }
  }, []);

  const updateSalonLocally = useCallback((updatedSalon: Salon) => {
    setSalon(updatedSalon);
  }, []);

  const refetchSalon = useCallback(async () => {
    if (!ownerId) return;

    try {
      const salonRes = await fetch(`/api/salons/my-salon?ownerId=${ownerId}&_t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store' as RequestCache,
      });
      if (salonRes.ok) {
        const salonData = await salonRes.json();
        if (salonData) setSalon(salonData);
      }
    } catch {
      // Ignore soft refetch failures; the page already has current local state.
    }
  }, [ownerId]);

  const saveBookingMessage = useCallback(async () => {
    if (!ownerId) return;

    setIsSavingMessage(true);
    try {
      const updated = await apiJson(`/api/salons/mine/booking-message?ownerId=${ownerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingMessage }),
      }) as Salon;
      setSalon(updated);
      setIsEditingMessage(false);
      notify.success('Booking message saved');
    } catch (e: unknown) {
      notify.error(toFriendlyMessage(e, 'Failed to save'));
    } finally {
      setIsSavingMessage(false);
    }
  }, [bookingMessage, ownerId]);

  const saveOperatingHours = useCallback(async () => {
    if (!ownerId) return;

    setIsSavingHours(true);
    try {
      const updated = await apiJson(`/api/salons/mine?ownerId=${ownerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildOperatingHoursPayload(operatingHours)),
      }) as Salon;

      setSalon(updated);
      setIsEditingHours(false);
      notify.success('Operating hours submitted for admin review');
    } catch (e: unknown) {
      notify.error(toFriendlyMessage(e, 'Failed to save'));
    } finally {
      setIsSavingHours(false);
    }
  }, [operatingHours, ownerId]);

  const saveBankingDetails = useCallback(async () => {
    if (!ownerId) return;

    const normalizedDetails = {
      bankName: bankingDetails.bankName.trim(),
      accountHolder: bankingDetails.accountHolder.trim(),
      accountNumber: bankingDetails.accountNumber.trim(),
      branchCode: bankingDetails.branchCode.trim(),
    };

    const hasAnyValue = Object.values(normalizedDetails).some(Boolean);
    const hasRequiredPair = normalizedDetails.bankName && normalizedDetails.accountNumber;

    if (hasAnyValue && !hasRequiredPair) {
      notify.error('Bank name and account number are required to show deposit instructions to clients.');
      return;
    }

    setIsSavingBankingDetails(true);
    try {
      const updated = await apiJson(`/api/salons/mine?ownerId=${ownerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: normalizedDetails.bankName || null,
          accountHolder: normalizedDetails.accountHolder || null,
          accountNumber: normalizedDetails.accountNumber || null,
          branchCode: normalizedDetails.branchCode || null,
        }),
      }) as Salon;

      setSalon(updated);
      setBankingDetails({
        bankName: updated.bankName || '',
        accountHolder: updated.accountHolder || '',
        accountNumber: updated.accountNumber || '',
        branchCode: updated.branchCode || '',
      });
      setIsEditingBankingDetails(false);
      notify.success(
        hasAnyValue
          ? 'Deposit banking details submitted for admin review'
          : 'Deposit banking details cleared',
      );
    } catch (e: unknown) {
      notify.error(toFriendlyMessage(e, 'Failed to save deposit banking details'));
    } finally {
      setIsSavingBankingDetails(false);
    }
  }, [bankingDetails, ownerId]);

  const clearBankingDetails = useCallback(async () => {
    if (!ownerId) return;

    setIsSavingBankingDetails(true);
    try {
      const updated = await apiJson(`/api/salons/mine?ownerId=${ownerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: null,
          accountHolder: null,
          accountNumber: null,
          branchCode: null,
        }),
      }) as Salon;

      setSalon(updated);
      setBankingDetails({
        bankName: '',
        accountHolder: '',
        accountNumber: '',
        branchCode: '',
      });
      setIsEditingBankingDetails(true);
      notify.success('Deposit banking details cleared');
    } catch (e: unknown) {
      notify.error(toFriendlyMessage(e, 'Failed to clear deposit banking details'));
    } finally {
      setIsSavingBankingDetails(false);
    }
  }, [ownerId]);

  const handleBookingStatusUpdate = useCallback(async (
    bookingId: string,
    status: 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED',
  ) => {
    try {
      await apiFetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchDashboardData();
    } catch (e) {
      notify.error(toFriendlyMessage(e, 'Failed to update booking'));
    }
  }, [fetchDashboardData]);

  return {
    salon,
    services,
    bookings,
    galleryImages,
    promotions,
    isLoading,
    isPlanUpdating,
    bookingMessage,
    isSavingMessage,
    isEditingMessage,
    bankingDetails,
    isSavingBankingDetails,
    isEditingBankingDetails,
    operatingHours,
    isEditingHours,
    isSavingHours,
    selectedPlanForUpgrade,
    paymentReference,
    isSubmittingPlanChange,
    setBookingMessage,
    setIsEditingMessage,
    setBankingDetails,
    setIsEditingBankingDetails,
    setOperatingHours,
    setIsEditingHours,
    setSelectedPlanForUpgrade,
    setPaymentReference,
    setGalleryImages,
    fetchDashboardData,
    handlePlanProofUpdate,
    handlePlanChange,
    upsertService,
    addPromotion,
    deleteDashboardItem,
    updateSalonLocally,
    refetchSalon,
    saveBookingMessage,
    saveBankingDetails,
    clearBankingDetails,
    saveOperatingHours,
    handleBookingStatusUpdate,
  };
}
