// frontend/src/app/dashboard/page.tsx

'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Image from 'next/image';
import {
  Salon,
  Service,
  ApprovalStatus,
  Booking,
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
import { toast } from 'react-toastify';
import { logger } from '@/lib/logger';
import GalleryUploadModal from '@/components/GalleryUploadModal';
import ProductFormModal from '@/components/ProductFormModal';
import PromotionModal from '@/components/PromotionModal';
import CreatePromotionModal from '@/components/CreatePromotionModal';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import { FaTrash, FaEdit, FaPlus, FaCamera } from 'react-icons/fa';
import Link from 'next/link';
import PageNav from '@/components/PageNav';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch, apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { APP_PLANS, PLAN_BY_CODE } from '@/constants/plans';
import ReviewsTab from '@/components/ReviewsTab/ReviewsTab';
import OperatingHoursInput, { OperatingHours, initializeOperatingHours } from '@/components/OperatingHoursInput';
import AvailabilityManager from '@/components/AvailabilityManager/AvailabilityManager';
import JobPostingForm from '@/components/JobPostingForm/JobPostingForm';
import TeamMembers from '@/components/TeamMembers/TeamMembers';
import { getSalonUrl } from '@/utils/salonUrl';
import {
  Card,
  Button,
  Alert,
  LoadingButton,
  Badge,
} from '@/components/ui';
import StatusBadge from '@/components/StatusBadge';

type DashboardBooking = Booking & {
  user: { firstName: string; lastName: string };
  service: { title: string };
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  clientPhone?: string;
};

const BANK_DETAILS = {
  bank: 'Capitec Bank',
  accountNumber: '1618097723',
  accountHolder: 'J Msengi',
  whatsapp: '0738021196',
};

const PLAN_PAYMENT_LABELS: Record<PlanPaymentStatus, string> = {
  PENDING_SELECTION: 'Package not selected',
  AWAITING_PROOF: 'Awaiting proof',
  PROOF_SUBMITTED: 'Proof submitted',
  VERIFIED: 'Verified',
};

// Navigation structure with grouped sections
const NAV_SECTIONS = [
  {
    label: 'Business',
    items: [
      { id: 'bookings', label: 'Bookings' },
      { id: 'services', label: 'Services' },
      { id: 'promotions', label: 'Promotions' },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'gallery', label: 'Gallery' },
      { id: 'reviews', label: 'Reviews' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'package', label: 'Package & Billing' },
      { id: 'availability', label: 'Availability' },
      { id: 'booking-settings', label: 'Booking Settings' },
    ],
  },
  {
    label: 'Team',
    items: [
      { id: 'team', label: 'Team Members' },
      { id: 'jobs', label: 'Job Postings' },
    ],
  },
];

type TabId = 'bookings' | 'services' | 'reviews' | 'gallery' | 'promotions' | 'package' | 'booking-settings' | 'availability' | 'team' | 'jobs';

function DashboardPageContent() {
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
  const [activeMainTab, setActiveMainTab] = useState<TabId>('bookings');
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
      toast.success(hasProof ? 'Proof submitted. We will review shortly.' : 'Status updated.');
    } catch (err) {
      toast.error('Could not update payment status.');
    } finally {
      setIsPlanUpdating(false);
    }
  }, [ownerId]);

  const handlePlanChange = useCallback(async (newPlanCode: PlanCode) => {
    if (!ownerId) return;
    setIsSubmittingPlanChange(true);
    try {
      const body: any = {
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
        toast.success('Switched to FREE plan');
      } else {
        toast.success(`Plan changed to ${PLAN_BY_CODE[newPlanCode].name}. Please submit payment proof.`);
      }
    } catch (err) {
      toast.error('Could not change plan. Please try again.');
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
      if (salonRes.status === 401) { toast.error('Session expired.'); router.push('/'); return; }
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
        salonData.operatingHours.forEach((schedule: any) => {
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
    } catch (err: any) {
      toast.error(toFriendlyMessage(err, 'Failed to load dashboard.'));
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
    const tab = searchParams.get('tab');
    const upgrade = searchParams.get('upgrade');

    if (tab && NAV_SECTIONS.flatMap(s => s.items).some(i => i.id === tab)) {
      setActiveMainTab(tab as TabId);
    }

    // If upgrade param exists, switch to package tab and select that plan
    if (upgrade && APP_PLANS.some(p => p.code === upgrade)) {
      setActiveMainTab('package');
      setSelectedPlanForUpgrade(upgrade as PlanCode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!socket || !salon?.id) return;
    const handler = (payload: any) => {
      if (payload?.entity === 'salon' && payload.id === salon.id) {
        fetchDashboardData();
        toast.success('Your package has been updated');
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
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`);
    } catch (err: any) {
      toast.error(toFriendlyMessage(err, 'Deletion failed'));
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSalonUpdate = (updatedSalon: Salon) => {
    setSalon(updatedSalon);
    setIsEditSalonModalOpen(false);
    toast.success('Profile updated successfully!');
    setTimeout(() => refetchSalon(), 500);
  };

  const refetchSalon = async () => {
    if (!ownerId) return;
    try {
      const salonRes = await fetch(`/api/salons/my-salon?ownerId=${ownerId}&_t=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any });
      if (salonRes.ok) {
        const salonData = await salonRes.json();
        if (salonData) setSalon(salonData);
      }
    } catch { }
  };

  const toggleAvailability = async () => {
    if (!ownerId) return;
    try {
      const updated = await apiJson(`/api/salons/mine/availability?ownerId=${ownerId}`, { method: 'PATCH' }) as Salon;
      setSalon(updated);
      toast.success(updated.isAvailableNow ? 'Marked as available' : 'Marked as unavailable');
    } catch (e: any) {
      toast.error(toFriendlyMessage(e, 'Could not update availability'));
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
      toast.success('Booking message saved');
    } catch (e: any) {
      toast.error(toFriendlyMessage(e, 'Failed to save'));
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
      toast.success('Operating hours saved');
    } catch (e: any) {
      toast.error(toFriendlyMessage(e, 'Failed to save'));
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
      toast.error(toFriendlyMessage(e, 'Failed to update booking'));
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
      toast.success('Reference copied');
    } catch { toast.error('Unable to copy'); }
  }, [planReference]);

  // Loading state
  if (isLoading || authStatus === 'loading') {
    return (
      <div className={styles.container}>
        <PageNav />
        <h1 className={styles.title}>My Dashboard</h1>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading your dashboard...</p>
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
            <button onClick={() => { logout(); router.push('/?auth=login&redirect=/dashboard'); }} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
              Re-authenticate
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderBookingCard = (booking: DashboardBooking) => {
    const bookingDate = new Date(booking.bookingTime);
    return (
      <div key={booking.id} className={styles.bookingCard}>
        <div className={styles.bookingHeader}>
          <div>
            <h4 className={styles.bookingServiceTitle}>{booking.service.title}</h4>
            <p className={styles.bookingCustomerName}>Customer: {booking.user.firstName} {booking.user.lastName}</p>
          </div>
          <span className={`${styles.bookingStatusBadge} ${styles[`status${booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}`]}`}>
            {booking.status}
          </span>
        </div>
        <div className={styles.bookingDetails}>
          <div className={styles.bookingDetailItem}>
            <span>{bookingDate.toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className={styles.bookingDetailItem}>
            <span>{bookingDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {booking.clientPhone && <div className={styles.bookingDetailItem}><span>{booking.clientPhone}</span></div>}
        </div>
        <div className={styles.bookingActions}>
          {booking.status === 'PENDING' && (
            <>
              <button onClick={() => handleBookingStatusUpdate(booking.id, 'CONFIRMED')} className={styles.confirmButton}>Accept</button>
              <button onClick={() => handleBookingStatusUpdate(booking.id, 'DECLINED')} className={styles.declineButton}>Decline</button>
            </>
          )}
          {booking.status === 'CONFIRMED' && (
            <button onClick={() => setBookingToComplete(booking.id)} className={styles.completeButton}>Mark Completed</button>
          )}
          {['COMPLETED', 'DECLINED', 'CANCELLED'].includes(booking.status) && (
            <p className={styles.bookingStatusText}>{booking.status === 'COMPLETED' ? 'Service completed' : booking.status === 'DECLINED' ? 'Declined' : 'Cancelled'}</p>
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

        {/* Status Summary */}
        <div className={styles.statusSummary}>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Package</span>
            <span className={styles.statusValue}>{planDetails.name}</span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Payment</span>
            <span className={`${styles.statusValue} ${styles[`planStatus_${planStatus.toLowerCase()}`]}`}>{PLAN_PAYMENT_LABELS[planStatus]}</span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Bookings</span>
            <span className={styles.statusValue}>{pendingBookings.length} pending</span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Availability</span>
            <span className={styles.statusValue}>{salon.isAvailableNow ? 'Available' : 'Unavailable'}</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className={styles.headerActions}>
          <Button variant="ghost" onClick={toggleAvailability}>
            {salon.isAvailableNow ? 'Set Unavailable' : 'Set Available'}
          </Button>
          <Button variant="ghost" asChild>
            <Link href={getSalonUrl(salon)} target="_blank">View Profile</Link>
          </Button>
          <Button variant="secondary" onClick={() => setIsEditSalonModalOpen(true)}>
            <FaEdit className="mr-1 h-4 w-4" /> Edit Profile
          </Button>
        </div>

        {/* Payment Notice */}
        {planStatus !== 'VERIFIED' && (
          <Alert variant="warning" title="Payment Required" className="mb-4">
            <p className="mb-3">
              Pay <strong>{planDetails.price}</strong> to <strong>{BANK_DETAILS.bank}</strong>, account <strong>{BANK_DETAILS.accountNumber}</strong>.
              Please make an instant payment to allow us to track the payment fast. Use <strong>{planReference}</strong> as reference. WhatsApp proof to <strong>{BANK_DETAILS.whatsapp}</strong>.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleCopyReference}>Copy Reference</Button>
              {planStatus !== 'PROOF_SUBMITTED' && (
                <LoadingButton
                  size="sm"
                  loading={isPlanUpdating}
                  loadingText="Saving..."
                  onClick={() => handlePlanProofUpdate(true)}
                >
                  I sent proof
                </LoadingButton>
              )}
            </div>
          </Alert>
        )}

        {/* Main Layout with Sidebar */}
        <div className={styles.dashboardLayout}>
          {/* Mobile Nav Header with Hamburger */}
          <div className={styles.mobileNavHeader}>
            <div className={styles.mobileNavHeaderContent}>
              <button
                className={`${styles.mobileNavToggle} ${mobileNavOpen ? styles.hamburgerOpen : ''}`}
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileNavOpen}
              >
                <span className={styles.hamburgerIcon}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <span>Menu</span>
              </button>
              <span className={styles.currentTabLabel}>
                {NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === activeMainTab)?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Backdrop for mobile sidebar */}
          <div
            className={`${styles.sidebarBackdrop} ${mobileNavOpen ? styles.sidebarBackdropVisible : ''}`}
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar Navigation - Slide-in Drawer */}
          <aside
            className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ''}`}
            role="navigation"
            aria-label="Dashboard navigation"
          >
            {/* Close button for mobile */}
            <button
              className={styles.sidebarCloseBtn}
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation menu"
            >
              ✕
            </button>

            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className={styles.navSection}>
                <h3 className={styles.navSectionTitle}>{section.label}</h3>
                <ul className={styles.navList}>
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => { setActiveMainTab(item.id as TabId); setMobileNavOpen(false); }}
                        className={`${styles.navItem} ${activeMainTab === item.id ? styles.navItemActive : ''}`}
                      >
                        {item.label}
                        {item.id === 'bookings' && pendingBookings.length > 0 && (
                          <span className={styles.navBadge}>{pendingBookings.length}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            {/* Bookings Tab */}
            {activeMainTab === 'bookings' && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Bookings</h3>
                </div>
                <div className={styles.tabs}>
                  <button onClick={() => setActiveBookingTab('pending')} className={`${styles.tabButton} ${activeBookingTab === 'pending' ? styles.activeTab : ''}`}>Pending ({pendingBookings.length})</button>
                  <button onClick={() => setActiveBookingTab('confirmed')} className={`${styles.tabButton} ${activeBookingTab === 'confirmed' ? styles.activeTab : ''}`}>Confirmed ({confirmedBookings.length})</button>
                  <button onClick={() => setActiveBookingTab('past')} className={`${styles.tabButton} ${activeBookingTab === 'past' ? styles.activeTab : ''}`}>Past ({pastBookings.length})</button>
                </div>
                <div className={styles.list}>
                  {activeBookingTab === 'pending' && (pendingBookings.length > 0 ? pendingBookings.map(renderBookingCard) : <p>No pending bookings</p>)}
                  {activeBookingTab === 'confirmed' && (confirmedBookings.length > 0 ? confirmedBookings.map(renderBookingCard) : <p>No confirmed bookings</p>)}
                  {activeBookingTab === 'past' && (pastBookings.length > 0 ? pastBookings.map(renderBookingCard) : <p>No past bookings</p>)}
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeMainTab === 'services' && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Services</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={openSimpleServiceModalToAdd} className="btn btn-secondary">Quick Add</button>
                    <button onClick={openServiceModalToAdd} className="btn btn-primary">Add Service</button>
                  </div>
                </div>
                <div className={styles.list}>
                  {services.length > 0 ? services.map((service) => (
                    <div key={service.id} className={styles.listItem}>
                      <p><strong>{service.title}</strong> - R{service.price.toFixed(2)}</p>
                      <div className={styles.actions}>
                        <span className={`${styles.statusBadge} ${getStatusClass(service.approvalStatus || 'PENDING')}`}>{service.approvalStatus}</span>
                        {service.approvalStatus === 'APPROVED' && !promotions.active.some((p: any) => p.serviceId === service.id) && (
                          <button onClick={() => { setSelectedServiceForPromo(service); setIsCreatePromoModalOpen(true); }} className={styles.promoButton}>Promo</button>
                        )}
                        <button onClick={() => openServiceModalToEdit(service)} className={styles.editButton}><FaEdit /></button>
                        <button onClick={() => handleDeleteClick(service.id, 'service')} className={styles.deleteButton}><FaTrash /></button>
                      </div>
                    </div>
                  )) : <p>No services yet. Add your first service.</p>}
                </div>
              </div>
            )}

            {/* Promotions Tab */}
            {activeMainTab === 'promotions' && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Promotions</h3>
                </div>
                <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-strong)' }}>Active Promotions</h4>
                <div className={styles.list}>
                  {promotions.active.length > 0 ? promotions.active.map((promo: any) => {
                    const item = promo.service || promo.product;
                    const itemName = promo.service ? item?.title : item?.name;
                    const daysLeft = Math.ceil((new Date(promo.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={promo.id} className={styles.listItem}>
                        <div>
                          <p><strong>{itemName}</strong></p>
                          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ textDecoration: 'line-through' }}>R{promo.originalPrice.toFixed(2)}</span> → <span style={{ color: '#10b981' }}>R{promo.promotionalPrice.toFixed(2)}</span> ({promo.discountPercentage}% off)
                          </p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</p>
                        </div>
                        <div className={styles.actions}>
                          <span className={`${styles.statusBadge} ${getStatusClass(promo.approvalStatus)}`}>{promo.approvalStatus}</span>
                          <button onClick={() => handleDeleteClick(promo.id, 'promotion')} className={styles.deleteButton}><FaTrash /></button>
                        </div>
                      </div>
                    );
                  }) : <p>No active promotions. Create one from Services.</p>}
                </div>
                {promotions.expired.length > 0 && (
                  <>
                    <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-strong)' }}>Expired Promotions</h4>
                    <div className={styles.list}>
                      {promotions.expired.map((promo: any) => (
                        <div key={promo.id} className={styles.listItem}>
                          <p><strong>{promo.service?.title || promo.product?.name}</strong> - Was {promo.discountPercentage}% off</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeMainTab === 'reviews' && <ReviewsTab />}

            {/* Gallery Tab */}
            {activeMainTab === 'gallery' && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Gallery</h3>
                  <button onClick={() => setIsGalleryModalOpen(true)} className="btn btn-primary">Add Image</button>
                </div>
                <div className={styles.galleryGrid}>
                  {galleryImages.length > 0 ? galleryImages.map((image) => (
                    <div key={image.id} className={styles.galleryItem}>
                      <Image src={image.imageUrl} alt={image.caption || 'Gallery'} className={styles.galleryItemImage} fill sizes="(max-width: 768px) 33vw, 160px" />
                      <button onClick={() => handleDeleteClick(image.id, 'gallery')} className={styles.deleteButton}><FaTrash /></button>
                    </div>
                  )) : <p>Your gallery is empty.</p>}
                </div>
              </div>
            )}



            {/* Availability Tab */}
            {activeMainTab === 'availability' && salon && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Availability</h3>
                </div>
                <AvailabilityManager salonId={salon.id} />
              </div>
            )}

            {/* Booking Settings Tab */}
            {activeMainTab === 'booking-settings' && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Booking Settings</h3>
                </div>
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Custom Booking Message</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    Set a message customers see before booking (e.g., booking fees, preparation requirements).
                  </p>
                  {!isEditingMessage && bookingMessage ? (
                    <div>
                      <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '1rem' }}>
                        {bookingMessage}
                      </div>
                      <button onClick={() => setIsEditingMessage(true)} className="btn btn-secondary">Edit Message</button>
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={bookingMessage}
                        onChange={(e) => e.target.value.length <= 200 && setBookingMessage(e.target.value)}
                        placeholder="e.g., Please arrive 10 minutes early. Booking fee: R50"
                        rows={4}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '0.5rem' }}
                      />
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{bookingMessage.length}/200</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={saveBookingMessage} disabled={isSavingMessage} className="btn btn-primary">{isSavingMessage ? 'Saving...' : 'Save'}</button>
                        {bookingMessage && <button onClick={() => setBookingMessage('')} className="btn btn-ghost">Clear</button>}
                      </div>
                    </div>
                  )}

                  <h4 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Operating Hours</h4>
                  <OperatingHoursInput hours={operatingHours} onChange={setOperatingHours} />
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {isEditingHours ? (
                      <button onClick={saveOperatingHours} disabled={isSavingHours} className="btn btn-primary">{isSavingHours ? 'Saving...' : 'Save Hours'}</button>
                    ) : (
                      <button onClick={() => setIsEditingHours(true)} className="btn btn-secondary">Edit Hours</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeMainTab === 'team' && salon && (
              <div className={styles.contentCard}>
                <TeamMembers salonId={salon.id} isEditable={true} />
              </div>
            )}

            {/* Jobs Tab */}
            {activeMainTab === 'jobs' && salon && (
              <div className={styles.contentCard}>
                <JobPostingForm salonId={salon.id} salonName={salon.name} salonLocation={salon.city || ''} />
              </div>
            )}

            {/* Package Tab */}
            {activeMainTab === 'package' && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Package & Billing</h3>
                </div>

                {/* Current Plan Section */}
                <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Current Plan: {planDetails.name}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        {planDetails.description}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {planDetails.price}{planCode !== 'FREE' && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/month</span>}
                      </div>
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'inline-block',
                        background: planStatus === 'VERIFIED' ? '#dcfce7' : planStatus === 'PROOF_SUBMITTED' ? '#fef3c7' : '#fee2e2',
                        color: planStatus === 'VERIFIED' ? '#16a34a' : planStatus === 'PROOF_SUBMITTED' ? '#ca8a04' : '#dc2626'
                      }}>
                        {PLAN_PAYMENT_LABELS[planStatus]}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'var(--color-surface-elevated)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Visibility Boost</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{planDetails.visibilityWeight}x</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--color-surface-elevated)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Service Listings</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{planDetails.maxListings}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--color-surface-elevated)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Commission Rate</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{planCode === 'FREE' ? '32%' : '0%'}</div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-surface-elevated)', borderRadius: '8px' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Plan Features</h5>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {planDetails.features.map((feature, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', fontSize: '0.85rem' }}>
                          <span style={{ color: '#22c55e' }}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Payment Instructions for Non-Verified Plans */}
                {planStatus !== 'VERIFIED' && planCode !== 'FREE' && (
                  <div style={{ padding: '1.5rem', background: '#fef3c7', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #fde047' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#92400e' }}>
                      Complete Your Payment
                    </h4>
                    <div style={{ marginBottom: '1rem', color: '#78350f' }}>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Bank:</strong> {BANK_DETAILS.bank}</p>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Account Number:</strong> {BANK_DETAILS.accountNumber}</p>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Account Holder:</strong> {BANK_DETAILS.accountHolder}</p>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Reference:</strong> {planReference}</p>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Amount:</strong> {planDetails.price}</p>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#78350f', marginBottom: '1rem' }}>
                      After payment, WhatsApp proof to <strong>{BANK_DETAILS.whatsapp}</strong>, then click "I sent proof" below.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="outline" size="sm" onClick={handleCopyReference}>
                        Copy Reference
                      </Button>
                      {planStatus !== 'PROOF_SUBMITTED' && (
                        <LoadingButton
                          size="sm"
                          loading={isPlanUpdating}
                          loadingText="Submitting..."
                          onClick={() => handlePlanProofUpdate(true)}
                        >
                          I sent proof
                        </LoadingButton>
                      )}
                      {planStatus === 'PROOF_SUBMITTED' && (
                        <div style={{ padding: '0.5rem 1rem', background: '#fde047', borderRadius: '6px', fontSize: '0.85rem', color: '#78350f' }}>
                          ⏳ Awaiting admin verification (usually within 24 hours)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Available Plans Section */}
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                    {planCode === 'FREE' ? 'Upgrade Your Plan' : 'Change Plan'}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    {APP_PLANS.filter(plan => plan.code !== planCode).map(plan => (
                      <div
                        key={plan.code}
                        style={{
                          border: selectedPlanForUpgrade === plan.code ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          background: 'var(--color-surface-elevated)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onClick={() => setSelectedPlanForUpgrade(plan.code)}
                      >
                        {plan.popular && (
                          <div style={{
                            position: 'absolute',
                            top: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, #000000 100%)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            ⭐ Popular
                          </div>
                        )}
                        <div style={{ textAlign: 'center', marginTop: plan.popular ? '0.5rem' : '0' }}>
                          <h5 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.name}</h5>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                            {plan.price}{plan.code !== 'FREE' && <span style={{ fontSize: '0.75rem' }}>/mo</span>}
                          </div>
                          {plan.originalPrice && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                              {plan.originalPrice}/mo
                            </div>
                          )}
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', minHeight: '2.5rem' }}>
                            {plan.description}
                          </p>
                          <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', textAlign: 'left' }}>
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} style={{ fontSize: '0.75rem', padding: '0.25rem 0', display: 'flex', gap: '0.25rem' }}>
                                <span style={{ color: '#22c55e' }}>✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          {selectedPlanForUpgrade === plan.code && (
                            <div style={{
                              marginTop: '0.75rem',
                              padding: '0.5rem',
                              background: 'var(--color-primary)',
                              color: 'white',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              Selected ✓
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Confirm Plan Change */}
                  {selectedPlanForUpgrade && (
                    <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '2px solid var(--color-primary)' }}>
                      <h5 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                        Confirm Plan Change to {PLAN_BY_CODE[selectedPlanForUpgrade].name}
                      </h5>

                      {selectedPlanForUpgrade !== 'FREE' && (
                        <>
                          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                            After confirming, you'll need to make a payment of <strong>{PLAN_BY_CODE[selectedPlanForUpgrade].price}</strong> to activate your new plan.
                          </p>
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                              Payment Reference (Optional)
                            </label>
                            <input
                              type="text"
                              value={paymentReference}
                              onChange={(e) => setPaymentReference(e.target.value)}
                              placeholder={salon?.name || 'Your salon name'}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                fontSize: '0.9rem'
                              }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                              This will be used to track your payment. Leave blank to use your salon name.
                            </p>
                          </div>
                        </>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <LoadingButton
                          loading={isSubmittingPlanChange}
                          loadingText="Changing..."
                          onClick={() => handlePlanChange(selectedPlanForUpgrade)}
                          style={{ flex: 1 }}
                        >
                          Confirm {selectedPlanForUpgrade === 'FREE' ? 'Downgrade' : 'Upgrade'}
                        </LoadingButton>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedPlanForUpgrade(null);
                            setPaymentReference('');
                          }}
                          style={{ flex: 1 }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className={styles.container}><PageNav /><h1 className={styles.title}>Loading...</h1></div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
