// frontend/src/app/dashboard/DashboardPageClient.tsx

'use client';


import React, { useEffect, useState, useCallback } from 'react';
import {
  Salon,
  Service,
  ApprovalStatus,
  GalleryImage,
  Product,
  Promotion,
  PlanPaymentStatus,
  PlanCode,
} from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Dashboard.module.css';
import ServiceFormModal from '@/components/ServiceFormModal';
import SimpleServiceFormModal from '@/components/SimpleServiceFormModal';
import EditSalonModal from '@/components/EditSalonModal';
import { useSocket } from '@/context/SocketContext';
import { notify } from '@/lib/notify';
import GalleryUploadModal from '@/components/GalleryUploadModal';
import ProductFormModal from '@/components/ProductFormModal';
import PromotionModal from '@/components/PromotionModal';
import CreatePromotionModal from '@/components/CreatePromotionModal';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import Link from 'next/link';
import PageNav from '@/components/PageNav';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch, apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { APP_PLANS, PLAN_BY_CODE } from '@/constants/plans';
import ReviewsTab from '@/components/ReviewsTab/ReviewsTab';
import { OperatingHours, initializeOperatingHours } from '@/components/OperatingHoursInput';
import AvailabilityManager from '@/components/AvailabilityManager/AvailabilityManager';
import { getSalonUrl } from '@/utils/salonUrl';
import {
  Button,
} from '@/components/ui';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import DashboardKPIRow from '@/components/DashboardKPIRow/DashboardKPIRow';
import DashboardSidebar from '@/components/DashboardSidebar/DashboardSidebar';
import ServicesTab from '@/components/ServicesTab/ServicesTab';
import PromotionsTab from '@/components/PromotionsTab/PromotionsTab';
import GalleryTab from '@/components/GalleryTab/GalleryTab';
import DashboardBookingsSection from './components/DashboardBookingsSection';
import DashboardBookingSettingsSection from './components/DashboardBookingSettingsSection';
import DashboardJobsSection from './components/DashboardJobsSection';
import DashboardPackageSection from './components/DashboardPackageSection';
import DashboardTeamSection from './components/DashboardTeamSection';
import {
  DEFAULT_DASHBOARD_TAB,
  getDashboardPath,
  isDashboardTab,
  NAV_SECTIONS,
  type TabId,
} from './dashboard-config';
import type { DashboardBooking } from './types';

const PLAN_PAYMENT_LABELS: Record<PlanPaymentStatus, string> = {
  PENDING_SELECTION: 'Package not selected',
  AWAITING_PROOF: 'Awaiting proof',
  PROOF_SUBMITTED: 'Proof submitted',
  VERIFIED: 'Verified',
};

interface DashboardPageClientProps {
  initialTab?: TabId;
}

function DashboardPageClient({ initialTab = DEFAULT_DASHBOARD_TAB }: DashboardPageClientProps) {
  const [salon, setSalon] = useState<Salon | null | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<{ active: any[]; expired: any[] }>({ active: [], expired: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlanUpdating, setIsPlanUpdating] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSimpleServiceModalOpen, setIsSimpleServiceModalOpen] = useState(false);
  const [isEditSalonModalOpen, setIsEditSalonModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'service' | 'product' | 'promotion' | 'gallery' } | null>(null);

  const [activeBookingTab, setActiveBookingTab] = useState<'pending' | 'confirmed' | 'past'>('pending');
  const [activeMainTab, setActiveMainTab] = useState<TabId>(initialTab);
  const [selectedServiceForPromo, setSelectedServiceForPromo] = useState<Service | null>(null);
  const [isCreatePromoModalOpen, setIsCreatePromoModalOpen] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [bookingToComplete, setBookingToComplete] = useState<string | null>(null);

  const [operatingHours, setOperatingHours] = useState<OperatingHours>(initializeOperatingHours());
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);

  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanCode | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [isSubmittingPlanChange, setIsSubmittingPlanChange] = useState(false);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const socket = useSocket();
  const { authStatus, user, logout } = useAuth();
  const ownerId = user?.role === 'ADMIN' ? searchParams.get('ownerId') : user?.id;

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const pastBookings = bookings.filter(b => ['COMPLETED', 'DECLINED', 'CANCELLED'].includes(b.status));

  const planCode = (salon?.planCode as PlanCode | null) ?? 'FREE';
  const planDetails = PLAN_BY_CODE[planCode] ?? APP_PLANS[0];
  const planStatus = (salon?.planPaymentStatus as PlanPaymentStatus | null) ?? 'PENDING_SELECTION';
  const planReference = salon?.planPaymentReference ?? salon?.name ?? 'your salon name';
  const todayIso = new Date().toISOString().slice(0, 10);
  const todaysBookings = bookings.filter((booking) => booking.bookingTime.slice(0, 10) === todayIso);
  const attentionItems = [
    pendingBookings.length > 0 ? `${pendingBookings.length} booking request${pendingBookings.length === 1 ? '' : 's'} waiting for confirmation` : null,
    planStatus !== 'VERIFIED' ? `Payment status: ${PLAN_PAYMENT_LABELS[planStatus]}` : null,
    services.length === 0 ? 'No services listed yet' : null,
  ].filter(Boolean) as string[];
  const overviewActions = [
    { id: 'bookings' as TabId, label: 'Review bookings', helper: `${pendingBookings.length} pending` },
    { id: 'services' as TabId, label: 'Update services', helper: `${services.length} listed` },
    { id: 'gallery' as TabId, label: 'Refresh gallery', helper: `${galleryImages.length} images live` },
    { id: 'package' as TabId, label: 'Check package', helper: PLAN_PAYMENT_LABELS[planStatus] },
  ];

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
    } catch (err) {
      notify.error('Could not update payment status.');
    } finally {
      setIsPlanUpdating(false);
    }
  }, [ownerId]);

  const handlePlanChange = useCallback(async (newPlanCode: PlanCode) => {
    if (!ownerId) return;
    setIsSubmittingPlanChange(true);
    try {
      const body: Record<string, unknown> = {
        planCode: newPlanCode,
        paymentReference: paymentReference || salon?.name || 'Payment reference'
      };

      // For FREE plan, no proof needed
      // For paid plans, set hasSentProof to false initially (awaiting proof)
      if (newPlanCode !== 'FREE') {
        body.hasSentProof = false;
      }

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

      if (newPlanCode === 'FREE') {
        notify.success('Switched to FREE plan');
      } else {
        notify.success(`Plan changed to ${PLAN_BY_CODE[newPlanCode].name}. Please submit payment proof.`);
      }
    } catch (err) {
      notify.error('Could not change plan. Please try again.');
    } finally {
      setIsSubmittingPlanChange(false);
    }
  }, [ownerId, paymentReference, salon?.name]);

  const fetchDashboardData = useCallback(async () => {
    if (!ownerId) {
      setIsLoading(false);
      setSalon(null);
      return;
    }
    setIsLoading(true);
    try {
      const salonRes = await fetch(`/api/salons/my-salon?ownerId=${ownerId}`, { credentials: 'include', cache: 'no-store' as any });
      if (salonRes.status === 401) { notify.error('Session expired.'); router.push('/'); return; }
      if (salonRes.status === 404) { setSalon(null); setIsLoading(false); return; }
      if (!salonRes.ok) throw new Error('Could not fetch salon data.');

      const text = await salonRes.text();
      if (!text || text.trim() === '') { setSalon(null); setIsLoading(false); return; }
      const salonData = JSON.parse(text);
      if (!salonData) { setSalon(null); setIsLoading(false); return; }

      setSalon(salonData);
      setBookingMessage(salonData.bookingMessage || '');
      setIsEditingMessage(!salonData.bookingMessage);

      if (salonData.operatingHours && Array.isArray(salonData.operatingHours)) {
        const hoursObj: OperatingHours = initializeOperatingHours();
        salonData.operatingHours.forEach((schedule: { day?: string; open?: string; close?: string }) => {
          if (schedule.day && schedule.open && schedule.close) {
            hoursObj[schedule.day] = { open: schedule.open, close: schedule.close, isOpen: true };
          }
        });
        setOperatingHours(hoursObj);
        setIsEditingHours(salonData.operatingHours.length === 0);
      }

      const results = await Promise.allSettled([
        apiJson(`/api/salons/mine/services?ownerId=${ownerId}`),
        apiJson(`/api/salons/mine/bookings?ownerId=${ownerId}`),
        apiJson(`/api/gallery/salon/${salonData.id}`),
        apiJson(`/api/products/seller/${ownerId}`),
        apiJson(`/api/promotions/my-salon`),
      ]);

      const [servicesRes, bookingsRes, galleryRes, productsRes, promotionsRes] = results;
      if (servicesRes.status === 'fulfilled') setServices(servicesRes.value as Service[]);
      if (bookingsRes.status === 'fulfilled') setBookings(Array.isArray(bookingsRes.value) ? bookingsRes.value as DashboardBooking[] : []);
      if (galleryRes.status === 'fulfilled') setGalleryImages(galleryRes.value as GalleryImage[]);
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value as Product[]);
      if (promotionsRes.status === 'fulfilled') setPromotions((promotionsRes.value as { active: any[]; expired: any[] }) || { active: [], expired: [] });
    } catch (err: unknown) {
      notify.error(toFriendlyMessage(err, 'Failed to load dashboard.'));
    } finally {
      setIsLoading(false);
    }
  }, [ownerId, router]);

  useEffect(() => {
    if (authStatus === 'loading') { setIsLoading(true); return; }
    if (authStatus === 'unauthenticated') { router.push('/'); return; }
    if (authStatus === 'authenticated' && ownerId) fetchDashboardData();
    else if (authStatus === 'authenticated' && !ownerId) setIsLoading(false);
  }, [authStatus, ownerId, fetchDashboardData, router]);

  useEffect(() => {
    const upgrade = searchParams.get('upgrade');

    setActiveMainTab(initialTab);

    if (upgrade && APP_PLANS.some((plan) => plan.code === upgrade)) {
      setSelectedPlanForUpgrade(upgrade as PlanCode);
      setActiveMainTab('package');

      if (initialTab !== 'package') {
        const params = new URLSearchParams(searchParams.toString());
        const queryString = params.toString();
        router.replace(queryString ? `/dashboard/package?${queryString}` : '/dashboard/package');
      }
    } else if (initialTab === 'package') {
      setSelectedPlanForUpgrade(null);
    }
  }, [initialTab, router, searchParams]);

  const navigateToTab = useCallback((tab: TabId) => {
    setActiveMainTab(tab);

    const params = new URLSearchParams();
    if (user?.role === 'ADMIN' && ownerId) {
      params.set('ownerId', ownerId);
    }

    const queryString = params.toString();
    const path = getDashboardPath(tab);
    router.push(queryString ? `${path}?${queryString}` : path);
  }, [ownerId, router, user?.role]);

  useEffect(() => {
    if (!socket || !salon?.id) return;
    const handler = (payload: { entity?: string; id?: string }) => {
      if (payload?.entity === 'salon' && payload.id === salon.id) {
        fetchDashboardData();
        notify.success('Your package has been updated');
      }
    };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket, salon?.id, fetchDashboardData]);

  // Mobile nav: Escape key to close & body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };

    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileNavOpen]);

  const handleServiceSaved = (savedService: Service) => {
    if (editingService) setServices(services.map(s => s.id === savedService.id ? savedService : s));
    else setServices([...services, savedService]);
    setIsServiceModalOpen(false);
    setIsSimpleServiceModalOpen(false);
    setEditingService(null);
  };

  const handleProductAdded = (addedProduct: Product) => {
    if (selectedProduct) setProducts(products.map(p => p.id === addedProduct.id ? addedProduct : p));
    else setProducts([...products, addedProduct]);
    setIsProductModalOpen(false);
  };

  const handlePromotionAdded = (addedPromotion: Promotion) => {
    setPromotions({ ...promotions, active: [...promotions.active, addedPromotion] });
    setIsPromotionModalOpen(false);
  };

  const handleDeleteClick = (id: string, type: 'service' | 'product' | 'promotion' | 'gallery') => {
    setItemToDelete({ id, type });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    try {
      const url = type === 'gallery' ? `/api/gallery/${id}` : `/api/${type}s/${id}`;
      await apiFetch(url, { method: 'DELETE' });
      if (type === 'service') setServices(services.filter(s => s.id !== id));
      else if (type === 'product') setProducts(products.filter(p => p.id !== id));
      else if (type === 'promotion') setPromotions({ active: promotions.active.filter(p => p.id !== id), expired: promotions.expired.filter(p => p.id !== id) });
      else if (type === 'gallery') setGalleryImages(galleryImages.filter(g => g.id !== id));
      notify.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`);
    } catch (err: unknown) {
      notify.error(toFriendlyMessage(err, 'Deletion failed'));
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSalonUpdate = (updatedSalon: Salon) => {
    setSalon(updatedSalon);
    setIsEditSalonModalOpen(false);
    notify.success('Profile updated successfully!');
    setTimeout(() => refetchSalon(), 500);
  };

  const refetchSalon = async () => {
    if (!ownerId) return;
    try {
      const salonRes = await fetch(`/api/salons/my-salon?ownerId=${ownerId}&_t=${Date.now()}`, { credentials: 'include', cache: 'no-store' as RequestCache });
      if (salonRes.ok) {
        const salonData = await salonRes.json();
        if (salonData) setSalon(salonData);
      }
    } catch { }
  };

  const toggleAvailability = async () => {
    if (!ownerId || isTogglingAvailability) return;
    setIsTogglingAvailability(true);
    try {
      const updated = await apiJson(`/api/salons/mine/availability?ownerId=${ownerId}`, { method: 'PATCH' }) as Salon;
      setSalon(updated);
      notify.success(updated.isAvailableNow ? 'Marked as available' : 'Marked as unavailable');
    } catch (e: unknown) {
      notify.error(toFriendlyMessage(e, 'Could not update availability'));
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const saveBookingMessage = async () => {
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
  };

  const saveOperatingHours = async () => {
    if (!ownerId) return;
    setIsSavingHours(true);
    try {
      const hoursArray = Object.entries(operatingHours).filter(([_, data]) => data.isOpen).map(([day, data]) => ({ day, open: data.open, close: data.close }));
      const updated = await apiJson(`/api/salons/mine?ownerId=${ownerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatingHours: hoursArray, operatingDays: hoursArray.map(h => h.day) }),
      }) as Salon;
      setSalon(updated);
      setIsEditingHours(false);
      notify.success('Operating hours saved');
    } catch (e: unknown) {
      notify.error(toFriendlyMessage(e, 'Failed to save'));
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleBookingStatusUpdate = async (bookingId: string, status: 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await apiFetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchDashboardData();
    } catch (e) {
      notify.error(toFriendlyMessage(e, 'Failed to update booking'));
    }
  };

  const openServiceModalToAdd = () => { setEditingService(null); setIsServiceModalOpen(true); };
  const openSimpleServiceModalToAdd = () => { setEditingService(null); setIsSimpleServiceModalOpen(true); };
  const openServiceModalToEdit = (service: Service) => {
    setEditingService(service);
    if (!service.images || service.images.length === 0) setIsSimpleServiceModalOpen(true);
    else setIsServiceModalOpen(true);
  };

  const getStatusClass = (status: ApprovalStatus) => {
    if (status === 'APPROVED') return styles.statusApproved;
    if (status === 'PENDING') return styles.statusPending;
    return styles.statusRejected;
  };

  const handleCopyReference = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(String(planReference));
      notify.success('Reference copied');
    } catch { notify.error('Unable to copy'); }
  }, [planReference]);

  // Loading state
  if (isLoading || authStatus === 'loading') {
    return (
      <div className={styles.container}>
        <PageNav />
        <h1 className={styles.title}>My Dashboard</h1>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="lg" inline text="Loading your dashboard..." />
        </div>
        <div className={styles.contentGrid}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.contentCard}>
              <Skeleton variant="text" style={{ width: '50%', height: 24 }} />
              <Skeleton variant="text" style={{ width: '100%', height: 18, marginTop: 16 }} />
              <Skeleton variant="text" style={{ width: '80%', height: 18, marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Admin without ownerId
  if (user?.role === 'ADMIN' && !ownerId) {
    return (
      <div className={styles.welcomeContainer}>
        <div className={styles.welcomeCard}>
          <h2>Admin: Select a service provider</h2>
          <p>Open the Admin page and click "View Dashboard" for a salon owner.</p>
          <Link href="/admin" className="btn btn-primary">Go to Admin</Link>
        </div>
      </div>
    );
  }

  // No salon
  if (!salon) {
    return (
      <div className={styles.welcomeContainer}>
        <div className={styles.welcomeCard}>
          <h2>Welcome, Service Provider</h2>
          <p>Create your salon profile to start adding services and accepting bookings.</p>
          <Link href="/create-salon" className="btn btn-primary">Create Your Salon Profile</Link>
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Already have a salon? Your session may have expired.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { logout(); router.push('/?auth=login&redirect=/dashboard'); }}
            >
              Re-authenticate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderBookingCard = (booking: DashboardBooking) => {
    const bookingDate = new Date(booking.bookingTime);
    const dateStr = bookingDate.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = bookingDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
    return (
      <div key={booking.id} className={styles.bookingCard} data-status={booking.status}>
        {/* Left: info */}
        <div className={styles.bookingInfo}>
          <div className={styles.bookingTopRow}>
            <span className={styles.bookingServiceTitle}>{booking.service.title}</span>
            <span className={`${styles.bookingStatusBadge} ${styles[`status${booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}`]}`}>
              {booking.status}
            </span>
          </div>
          <div className={styles.bookingMeta}>
            <span className={styles.bookingMetaItem}>{booking.user.firstName} {booking.user.lastName}</span>
            <span className={styles.bookingMetaDot}>-</span>
            <span className={styles.bookingMetaItem}>{dateStr}</span>
            <span className={styles.bookingMetaDot}>-</span>
            <span className={styles.bookingMetaItem}>{timeStr}</span>
            {booking.clientPhone && (
              <>
                <span className={styles.bookingMetaDot}>-</span>
                <span className={styles.bookingMetaItem}>{booking.clientPhone}</span>
              </>
            )}
          </div>
        </div>
        {/* Right: actions */}
        <div className={styles.bookingActions}>
          {booking.status === 'PENDING' && (
            <>
              <Button size="sm" variant="default" onClick={() => handleBookingStatusUpdate(booking.id, 'CONFIRMED')}>
                Accept
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleBookingStatusUpdate(booking.id, 'DECLINED')}
                style={{ color: 'var(--color-error-text)', borderColor: 'var(--color-error-text)' }}>
                Decline
              </Button>
            </>
          )}
          {booking.status === 'CONFIRMED' && (
            <Button size="sm" variant="secondary" onClick={() => setBookingToComplete(booking.id)}>
              Complete
            </Button>
          )}
          {['COMPLETED', 'DECLINED', 'CANCELLED'].includes(booking.status) && (
            <span className={styles.bookingStatusText}>
              {booking.status === 'COMPLETED' ? 'Completed' : booking.status === 'DECLINED' ? 'Declined' : 'Cancelled'}
            </span>
          )}
        </div>
      </div>
    );
  };


  return (
    <>
      {/* Modals */}
      {isServiceModalOpen && salon && <ServiceFormModal salonId={salon.id} onClose={() => { setIsServiceModalOpen(false); setEditingService(null); }} onServiceSaved={handleServiceSaved} service={editingService} />}
      {isSimpleServiceModalOpen && salon && <SimpleServiceFormModal salonId={salon.id} onClose={() => { setIsSimpleServiceModalOpen(false); setEditingService(null); }} onServiceAddedOrUpdated={handleServiceSaved} serviceToEdit={editingService} />}
      {isEditSalonModalOpen && salon && <EditSalonModal salon={salon} onClose={() => setIsEditSalonModalOpen(false)} onSalonUpdate={handleSalonUpdate} />}
      {isGalleryModalOpen && salon && <GalleryUploadModal salonId={salon.id} onClose={() => setIsGalleryModalOpen(false)} onImageAdded={(img) => setGalleryImages(prev => [img, ...prev])} />}
      {isPromotionModalOpen && salon && <PromotionModal salonId={salon.id} onClose={() => setIsPromotionModalOpen(false)} onPromotionAdded={handlePromotionAdded} />}
      {isProductModalOpen && salon && <ProductFormModal salonId={salon.id} onClose={() => setIsProductModalOpen(false)} onProductAdded={handleProductAdded} initialData={selectedProduct} />}
      {itemToDelete && <ConfirmationModal onConfirm={confirmDelete} onCancel={() => setItemToDelete(null)} message={`Delete this ${itemToDelete.type}?`} />}
      {bookingToComplete && <ConfirmationModal onConfirm={async () => { await handleBookingStatusUpdate(bookingToComplete, 'COMPLETED'); setBookingToComplete(null); }} onCancel={() => setBookingToComplete(null)} message="Mark this service as completed?" confirmText="Mark Completed" />}
      {isCreatePromoModalOpen && selectedServiceForPromo && <CreatePromotionModal service={selectedServiceForPromo as any} isOpen={isCreatePromoModalOpen} onClose={() => { setIsCreatePromoModalOpen(false); setSelectedServiceForPromo(null); }} onSuccess={() => { setIsCreatePromoModalOpen(false); setSelectedServiceForPromo(null); fetchDashboardData(); }} />}

      <div className={styles.container}>
        <PageNav />
        <h1 className={styles.title}>{user?.role === 'ADMIN' ? `${salon.name}'s Dashboard` : 'My Dashboard'}</h1>

        <section className={styles.overviewHero}>
          <div className={styles.overviewLead}>
            <span className={styles.overviewEyebrow}>Salon operator overview</span>
            <div className={styles.overviewTitleRow}>
              <h2 className={styles.overviewTitle}>{salon.name}</h2>
              <span className={`${styles.overviewStatus} ${salon.isAvailableNow ? styles.overviewStatusAvailable : styles.overviewStatusUnavailable}`}>
                {salon.isAvailableNow ? 'Available for bookings' : 'Currently unavailable'}
              </span>
            </div>
            <p className={styles.overviewDescription}>
              Prioritize today&apos;s bookings, keep your services current, and resolve package blockers before they slow down conversions.
            </p>
            <div className={styles.overviewMetaRow}>
              <span className={styles.overviewMetaPill}>{todaysBookings.length} booking{todaysBookings.length === 1 ? '' : 's'} today</span>
              <span className={styles.overviewMetaPill}>{services.length} services live</span>
              <span className={styles.overviewMetaPill}>{galleryImages.length} gallery items</span>
              <span className={styles.overviewMetaPill}>{planDetails.name} plan</span>
            </div>
            <div className={styles.overviewActions}>
              <Link href={getSalonUrl(salon)} target="_blank" className={styles.headerActionBtn}>
                View Public Profile
              </Link>
              <Button
                type="button"
                onClick={() => setIsEditSalonModalOpen(true)}
                className={`${styles.headerActionBtn} ${styles.headerActionBtnPrimary}`}
              >
                Edit Salon Profile
              </Button>
            </div>
          </div>
          <div className={styles.overviewBoard}>
            <div className={styles.overviewPanel}>
              <span className={styles.statusLabel}>Needs attention</span>
              {attentionItems.length > 0 ? (
                <ul className={styles.attentionList}>
                  {attentionItems.map((item) => (
                    <li key={item} className={styles.attentionItem}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.attentionEmpty}>No urgent blockers right now.</p>
              )}
            </div>
            <div className={styles.quickActionGrid}>
              {overviewActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={styles.quickActionButton}
                  onClick={() => navigateToTab(action.id)}
                >
                  <span className={styles.quickActionLabel}>{action.label}</span>
                  <span className={styles.quickActionHelper}>{action.helper}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.statusSummary}>
          <div className={styles.statusCard} onClick={() => navigateToTab('bookings')} style={{ cursor: 'pointer' }}>
            <span className={styles.statusLabel}>Bookings</span>
            <span className={styles.statusValue}>{pendingBookings.length}</span>
            <span className={styles.statusSubtext}>pending requests</span>
          </div>
          <div className={styles.statusCard} onClick={() => navigateToTab('package')} style={{ cursor: 'pointer' }}>
            <span className={styles.statusLabel}>Package</span>
            <span className={styles.statusValue}>{planDetails.name}</span>
            <span className={styles.statusSubtext}>{planDetails.visibilityWeight}x visibility boost</span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Payment</span>
            <span className={`${styles.statusValue} ${styles[`planStatus_${planStatus.toLowerCase()}`]}`}>{PLAN_PAYMENT_LABELS[planStatus]}</span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Availability</span>
            <span className={`${styles.statusValue} ${salon.isAvailableNow ? styles.statusAvailable : styles.statusUnavailable}`}>
              {salon.isAvailableNow ? 'Available' : 'Unavailable'}
            </span>
            <div className={styles.availabilitySwitchRow}>
              <span className={styles.availabilitySwitchOffLabel}>OFF</span>
              <label
                className={styles.switch}
                aria-label="Toggle availability"
                style={{ opacity: isTogglingAvailability ? 0.6 : 1, cursor: isTogglingAvailability ? 'not-allowed' : 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={!!salon.isAvailableNow}
                  onChange={toggleAvailability}
                  disabled={isTogglingAvailability}
                />
                <span className={styles.slider}></span>
              </label>
              <span className={styles.availabilitySwitchOnLabel}>ON</span>
            </div>
          </div>
        </div>


        {/* KPI Metrics Row */}
        <DashboardKPIRow
          data={{
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
            avgRating: salon.avgRating ?? null,
            reviewCount: salon.reviewCount ?? 0,
            servicesCount: services.length,
            profileComplete: [
              !!salon.name,
              !!salon.description,
              !!salon.address,
              !!salon.city,
              !!salon.phoneNumber,
              services.length > 0,
              !!salon.coverImage || (salon.gallery && salon.gallery.length > 0),
            ].filter(Boolean).length * Math.round(100 / 7),
          }}
          onCardClick={(tab) => {
            if (isDashboardTab(tab)) {
              navigateToTab(tab);
            }
          }}
        />

        {/* Main Layout with Sidebar */}
        <div className={styles.dashboardLayout}>
          {/* Sidebar Navigation */}
          <DashboardSidebar
            sections={NAV_SECTIONS}
            activeTab={activeMainTab}
            onTabChange={(id) => {
              if (isDashboardTab(id)) {
                navigateToTab(id);
              }
            }}
            mobileNavOpen={mobileNavOpen}
            onMobileNavToggle={() => setMobileNavOpen(prev => !prev)}
            salonName={salon?.name}
            pendingBookingsCount={pendingBookings.length}
          />

          {/* Main Content */}
          <main className={styles.mainContent}>

            {/* Bookings Tab */}
            {activeMainTab === 'bookings' && (
              <DashboardBookingsSection
                bookings={bookings}
                pendingBookings={pendingBookings}
                confirmedBookings={confirmedBookings}
                pastBookings={pastBookings}
                activeBookingTab={activeBookingTab}
                onBookingTabChange={setActiveBookingTab}
                renderBookingCard={renderBookingCard}
              />
            )}

            {/* Services Tab */}
            {activeMainTab === 'services' && (
              <ServicesTab
                services={services}
                onAddService={openServiceModalToAdd}
                onEditService={openServiceModalToEdit}
                onDeleteService={(id) => handleDeleteClick(id, 'service')}
              />
            )}



            {/* Promotions Tab */}
            {activeMainTab === 'promotions' && (
              <PromotionsTab
                activePromotions={promotions.active}
                expiredPromotions={promotions.expired}
                onDelete={(id) => handleDeleteClick(id, 'promotion')}
                getStatusClass={getStatusClass}
              />
            )}


            {/* Reviews Tab */}
            {activeMainTab === 'reviews' && <ReviewsTab />}

            {/* Gallery Tab */}
            {activeMainTab === 'gallery' && (
              <GalleryTab
                images={galleryImages}
                onAddImage={() => setIsGalleryModalOpen(true)}
                onDeleteImage={(id) => handleDeleteClick(id, 'gallery')}
              />
            )}




            {/* Availability Tab */}
            {activeMainTab === 'availability' && salon && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Availability</h3>
                </div>
                <AvailabilityManager salonId={salon.id} operatingHours={salon.operatingHours as any} />
              </div>
            )}

            {/* Booking Settings Tab */}
            {activeMainTab === 'booking-settings' && (
              <DashboardBookingSettingsSection
                bookingMessage={bookingMessage}
                isEditingMessage={isEditingMessage}
                isSavingMessage={isSavingMessage}
                operatingHours={operatingHours}
                isEditingHours={isEditingHours}
                isSavingHours={isSavingHours}
                onBookingMessageChange={setBookingMessage}
                onEditMessage={() => setIsEditingMessage(true)}
                onClearMessage={() => setBookingMessage('')}
                onSaveMessage={saveBookingMessage}
                onHoursChange={setOperatingHours}
                onEditHours={() => setIsEditingHours(true)}
                onSaveHours={saveOperatingHours}
              />
            )}

            {/* Team Tab */}
            {activeMainTab === 'team' && salon && (
              <DashboardTeamSection salonId={salon.id} />
            )}

            {/* Jobs Tab */}
            {activeMainTab === 'jobs' && salon && (
              <DashboardJobsSection
                salonId={salon.id}
                salonName={salon.name}
                salonLocation={salon.city || ''}
              />
            )}

            {/* Package Tab */}
            {activeMainTab === 'package' && (
              <DashboardPackageSection
                planCode={planCode}
                planDetails={planDetails}
                planStatus={planStatus}
                planReference={planReference}
                selectedPlanForUpgrade={selectedPlanForUpgrade}
                paymentReference={paymentReference}
                isPlanUpdating={isPlanUpdating}
                isSubmittingPlanChange={isSubmittingPlanChange}
                salonName={salon?.name}
                onSelectPlan={setSelectedPlanForUpgrade}
                onPaymentReferenceChange={setPaymentReference}
                onCopyReference={handleCopyReference}
                onPlanProofUpdate={handlePlanProofUpdate}
                onPlanChange={handlePlanChange}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default DashboardPageClient;

