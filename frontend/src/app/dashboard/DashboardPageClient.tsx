// frontend/src/app/dashboard/DashboardPageClient.tsx

'use client';


import React, { useEffect, useCallback } from 'react';
import {
  Salon,
  Service,
  ApprovalStatus,
  PlanPaymentStatus,
  PlanCode,
  Promotion,
} from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Dashboard.module.css';
import { useSocket } from '@/context/SocketContext';
import { notify } from '@/lib/notify';
import { useAuth } from '@/hooks/useAuth';
import { DashboardPageSkeleton } from '@/components/Skeleton/Skeleton';
import { APP_PLANS, PLAN_BY_CODE } from '@/constants/plans';
import { getSalonUrl } from '@/utils/salonUrl';
import {
  Button,
} from '@/components/ui';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import DashboardSidebar from '@/components/DashboardSidebar/DashboardSidebar';
import DashboardEmptyState from './components/DashboardEmptyState';
import DashboardModalLayer from './components/DashboardModalLayer';
import DashboardOverviewHero from './components/DashboardOverviewHero';
import DashboardSectionContent from './components/DashboardSectionContent';
import {
  DEFAULT_DASHBOARD_TAB,
  isDashboardTab,
  NAV_SECTIONS,
  type TabId,
} from './dashboard-config';
import { useDashboardData } from './hooks/useDashboardData';
import { useDashboardUiState } from './hooks/useDashboardUiState';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';

const PLAN_PAYMENT_LABELS: Record<PlanPaymentStatus, string> = {
  PENDING_SELECTION: 'Awaiting activation',
  AWAITING_PROOF: 'Awaiting proof',
  PROOF_SUBMITTED: 'Proof submitted',
  VERIFIED: 'Verified',
};

interface DashboardPageClientProps {
  initialTab?: TabId;
}

function DashboardPageClient({ initialTab = DEFAULT_DASHBOARD_TAB }: DashboardPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const socket = useSocket();
  const { authStatus, user, logout } = useAuth();
  const { showPageLoader } = useNavigationLoading();
  const handleSessionExpired = useCallback(() => {
    showPageLoader();
    router.push('/');
  }, [router, showPageLoader]);
  const ownerId = user?.role === 'ADMIN' ? searchParams.get('ownerId') ?? user?.id : user?.id;
  const {
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
  } = useDashboardData({
    ownerId,
    authStatus,
    onSessionExpired: handleSessionExpired,
  });
  const {
    mobileNavOpen,
    isSectionNavigating,
    isServiceModalOpen,
    isSimpleServiceModalOpen,
    isEditSalonModalOpen,
    isGalleryModalOpen,
    isPromotionModalOpen,
    editingService,
    itemToDelete,
    activeBookingTab,
    activeMainTab,
    selectedServiceForPromo,
    isCreatePromoModalOpen,
    bookingToComplete,
    setMobileNavOpen,
    setIsEditSalonModalOpen,
    setIsGalleryModalOpen,
    setIsPromotionModalOpen,
    setItemToDelete,
    setActiveBookingTab,
    setBookingToComplete,
    navigateToTab,
    openServiceModalToAdd,
    openServiceModalToEdit,
    handleDeleteClick,
    handleCloseServiceModal,
    handleCloseSimpleServiceModal,
    handleCreatePromotionModalClose,
  } = useDashboardUiState({
    initialTab,
    router,
    searchParams,
    ownerId,
    userRole: user?.role,
    setSelectedPlanForUpgrade,
  });

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const pastBookings = bookings.filter(b => ['COMPLETED', 'DECLINED', 'CANCELLED'].includes(b.status));

  const planCode = (salon?.planCode as PlanCode | null) ?? 'PREMIUM';
  const planDetails = PLAN_BY_CODE[planCode] ?? APP_PLANS[0];
  const planStatus = (salon?.planPaymentStatus as PlanPaymentStatus | null) ?? 'PENDING_SELECTION';
  const planReference = salon?.planPaymentReference ?? salon?.name ?? 'your salon name';
  const todayIso = new Date().toISOString().slice(0, 10);
  const todaysBookings = bookings.filter((booking) => booking.bookingTime.slice(0, 10) === todayIso);
  const locationSummary = [salon?.city, salon?.province].filter(Boolean).join(', ');
  const selectedPromotionService = selectedServiceForPromo ? {
    id: selectedServiceForPromo.id,
    title: selectedServiceForPromo.title ?? 'Service',
    price: selectedServiceForPromo.price ?? 0,
  } : null;

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

  const handleServiceSaved = (savedService: Service) => {
    upsertService(savedService, editingService?.id);
    handleCloseServiceModal();
    handleCloseSimpleServiceModal();
  };

  const handlePromotionAdded = (addedPromotion: Promotion) => {
    addPromotion(addedPromotion);
    setIsPromotionModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDashboardItem(itemToDelete.id, itemToDelete.type);
    } catch {
      // deleteDashboardItem already handles user-facing errors
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSalonUpdate = (updatedSalon: Salon) => {
    updateSalonLocally(updatedSalon);
    setIsEditSalonModalOpen(false);
    notify.success('Profile updated successfully!');
    setTimeout(() => refetchSalon(), 500);
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

  const handleReauthenticate = useCallback(() => {
    logout();
    showPageLoader();
    router.push('/?auth=login&redirect=/dashboard');
  }, [logout, router, showPageLoader]);

  const handleCreatePromotionSuccess = useCallback(() => {
    handleCreatePromotionModalClose();
    fetchDashboardData();
  }, [fetchDashboardData, handleCreatePromotionModalClose]);

  const handleConfirmBookingComplete = useCallback(async () => {
    if (!bookingToComplete) return;
    await handleBookingStatusUpdate(bookingToComplete, 'COMPLETED');
    setBookingToComplete(null);
  }, [bookingToComplete, handleBookingStatusUpdate, setBookingToComplete]);

  // Loading state
  if (isLoading || authStatus === 'loading') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Dashboard</h1>
        <DashboardPageSkeleton />
      </div>
    );
  }

  // No salon
  if (!salon) {
    return (
      <DashboardEmptyState
        title="Welcome, Service Provider"
        description="Create your salon profile to start adding services and accepting bookings."
        primaryHref="/create-salon"
        primaryLabel="Create Your Salon Profile"
        footer={(
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Already have a salon? Your session may have expired.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReauthenticate}
            >
              Re-authenticate
            </Button>
          </div>
        )}
      />
    );
  }

  return (
    <>
      <DashboardModalLayer
        salon={salon}
        editingService={editingService}
        isServiceModalOpen={isServiceModalOpen}
        isSimpleServiceModalOpen={isSimpleServiceModalOpen}
        isEditSalonModalOpen={isEditSalonModalOpen}
        isGalleryModalOpen={isGalleryModalOpen}
        isPromotionModalOpen={isPromotionModalOpen}
        isCreatePromoModalOpen={isCreatePromoModalOpen}
        itemToDelete={itemToDelete}
        bookingToComplete={bookingToComplete}
        selectedPromotionService={selectedPromotionService}
        onCloseServiceModal={handleCloseServiceModal}
        onCloseSimpleServiceModal={handleCloseSimpleServiceModal}
        onCloseEditSalonModal={() => setIsEditSalonModalOpen(false)}
        onCloseGalleryModal={() => setIsGalleryModalOpen(false)}
        onClosePromotionModal={() => setIsPromotionModalOpen(false)}
        onCloseCreatePromoModal={handleCreatePromotionModalClose}
        onServiceSaved={handleServiceSaved}
        onSalonUpdated={handleSalonUpdate}
        onImageAdded={(img) => setGalleryImages(prev => [img, ...prev])}
        onPromotionAdded={handlePromotionAdded}
        onConfirmDelete={confirmDelete}
        onCancelDelete={() => setItemToDelete(null)}
        onConfirmBookingComplete={handleConfirmBookingComplete}
        onCancelBookingComplete={() => setBookingToComplete(null)}
        onCreatePromotionSuccess={handleCreatePromotionSuccess}
      />

      <div className={styles.container}>
        <h1 className={styles.title}>{user?.role === 'ADMIN' ? `${salon.name}'s Dashboard` : 'My Dashboard'}</h1>

        <DashboardOverviewHero
          salonName={salon.name}
          locationSummary={locationSummary}
          isVerified={Boolean(salon.isVerified)}
          isAvailableNow={Boolean(salon.isAvailableNow)}
          todaysBookingsCount={todaysBookings.length}
          servicesCount={services.length}
          galleryCount={galleryImages.length}
          planName={planDetails.name}
          planStatusLabel={PLAN_PAYMENT_LABELS[planStatus]}
          publicProfileHref={getSalonUrl(salon)}
          onEditProfile={() => setIsEditSalonModalOpen(true)}
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
            {isSectionNavigating ? (
              <div className={`${styles.contentCard} ${styles.sectionLoadingCard}`}>
                <LoadingSpinner size="lg" inline text="Loading section..." />
              </div>
            ) : (
              <DashboardSectionContent
                activeMainTab={activeMainTab}
                salon={salon}
                services={services}
                bookings={bookings}
                pendingBookings={pendingBookings}
                confirmedBookings={confirmedBookings}
                pastBookings={pastBookings}
                activeBookingTab={activeBookingTab}
                promotions={promotions}
                galleryImages={galleryImages}
                bookingMessage={bookingMessage}
                isEditingMessage={isEditingMessage}
                isSavingMessage={isSavingMessage}
                bankingDetails={bankingDetails}
                isEditingBankingDetails={isEditingBankingDetails}
                isSavingBankingDetails={isSavingBankingDetails}
                operatingHours={operatingHours}
                isEditingHours={isEditingHours}
                isSavingHours={isSavingHours}
                planCode={planCode}
                planDetails={planDetails}
                planStatus={planStatus}
                planReference={planReference}
                selectedPlanForUpgrade={selectedPlanForUpgrade}
                paymentReference={paymentReference}
                isPlanUpdating={isPlanUpdating}
                isSubmittingPlanChange={isSubmittingPlanChange}
                onBookingTabChange={setActiveBookingTab}
                onConfirmBooking={(bookingId) => handleBookingStatusUpdate(bookingId, 'CONFIRMED')}
                onDeclineBooking={(bookingId) => handleBookingStatusUpdate(bookingId, 'DECLINED')}
                onCompleteBooking={setBookingToComplete}
                onAddService={openServiceModalToAdd}
                onEditService={openServiceModalToEdit}
                onDeleteService={(id) => handleDeleteClick(id, 'service')}
                onDeletePromotion={(id) => handleDeleteClick(id, 'promotion')}
                onAddPromotion={() => setIsPromotionModalOpen(true)}
                getStatusClass={getStatusClass}
                onAddImage={() => setIsGalleryModalOpen(true)}
                onDeleteImage={(id) => handleDeleteClick(id, 'gallery')}
                onBookingMessageChange={setBookingMessage}
                onEditMessage={() => setIsEditingMessage(true)}
                onClearMessage={() => setBookingMessage('')}
                onSaveMessage={saveBookingMessage}
                onBankingDetailsChange={setBankingDetails}
                onEditBankingDetails={() => setIsEditingBankingDetails(true)}
                onClearBankingDetails={clearBankingDetails}
                onSaveBankingDetails={saveBankingDetails}
                onHoursChange={setOperatingHours}
                onEditHours={() => setIsEditingHours(true)}
                onSaveHours={saveOperatingHours}
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

