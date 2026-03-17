'use client';

import type { ApprovalStatus, GalleryImage, Salon, Service } from '@/types';
import ReviewsTab from '@/components/ReviewsTab/ReviewsTab';
import ServicesTab from '@/components/ServicesTab/ServicesTab';
import GalleryTab from '@/components/GalleryTab/GalleryTab';
import DashboardBookingsSection from './DashboardBookingsSection';
import DashboardBookingSettingsSection from './DashboardBookingSettingsSection';
import type { OperatingHours } from '@/components/OperatingHoursInput';
import type { DashboardBooking, DashboardPromotionItem } from '../types';
import type { TabId } from '../dashboard-config';
import type { PlanCode, PlanPaymentStatus } from '@/types';
import type { AppPlan } from '@/constants/plans';

interface DashboardPromotionsState {
  active: DashboardPromotionItem[];
  expired: DashboardPromotionItem[];
}

interface DashboardBankingDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
}

interface DashboardSectionContentProps {
  activeMainTab: TabId;
  salon: Salon;
  services: Service[];
  bookings: DashboardBooking[];
  pendingBookings: DashboardBooking[];
  confirmedBookings: DashboardBooking[];
  pastBookings: DashboardBooking[];
  activeBookingTab: 'pending' | 'confirmed' | 'past';
  promotions: DashboardPromotionsState;
  galleryImages: GalleryImage[];
  bookingMessage: string;
  isEditingMessage: boolean;
  isSavingMessage: boolean;
  bankingDetails: DashboardBankingDetails;
  isEditingBankingDetails: boolean;
  isSavingBankingDetails: boolean;
  operatingHours: OperatingHours;
  isEditingHours: boolean;
  isSavingHours: boolean;
  planCode: PlanCode;
  planDetails: AppPlan;
  planStatus: PlanPaymentStatus;
  planReference: string;
  selectedPlanForUpgrade: PlanCode | null;
  paymentReference: string;
  isPlanUpdating: boolean;
  isSubmittingPlanChange: boolean;
  onBookingTabChange: (tab: 'pending' | 'confirmed' | 'past') => void;
  onConfirmBooking: (bookingId: string) => void;
  onDeclineBooking: (bookingId: string) => void;
  onCompleteBooking: (bookingId: string) => void;
  onAddService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (id: string) => void;
  onDeletePromotion: (id: string) => void;
  onAddPromotion: () => void;
  getStatusClass: (status: ApprovalStatus) => string;
  onAddImage: () => void;
  onDeleteImage: (id: string) => void;
  onBookingMessageChange: (value: string) => void;
  onEditMessage: () => void;
  onClearMessage: () => void;
  onSaveMessage: () => void;
  onBankingDetailsChange: (value: DashboardBankingDetails) => void;
  onEditBankingDetails: () => void;
  onClearBankingDetails: () => void;
  onSaveBankingDetails: () => void;
  onHoursChange: (hours: OperatingHours) => void;
  onEditHours: () => void;
  onSaveHours: () => void;
  onSelectPlan: (plan: PlanCode | null) => void;
  onPaymentReferenceChange: (value: string) => void;
  onCopyReference: () => void;
  onPlanProofUpdate: (hasProof: boolean) => void;
  onPlanChange: (planCode: PlanCode) => void;
}

export default function DashboardSectionContent({
  activeMainTab,
  services,
  bookings,
  pendingBookings,
  confirmedBookings,
  pastBookings,
  activeBookingTab,
  galleryImages,
  bookingMessage,
  isEditingMessage,
  isSavingMessage,
  bankingDetails,
  isEditingBankingDetails,
  isSavingBankingDetails,
  operatingHours,
  isEditingHours,
  isSavingHours,
  onBookingTabChange,
  onConfirmBooking,
  onDeclineBooking,
  onCompleteBooking,
  onAddService,
  onEditService,
  onDeleteService,
  onAddImage,
  onDeleteImage,
  onBookingMessageChange,
  onEditMessage,
  onClearMessage,
  onSaveMessage,
  onBankingDetailsChange,
  onEditBankingDetails,
  onClearBankingDetails,
  onSaveBankingDetails,
  onHoursChange,
  onEditHours,
  onSaveHours,
}: DashboardSectionContentProps) {
  switch (activeMainTab) {
    case 'bookings':
      return (
        <DashboardBookingsSection
          bookings={bookings}
          pendingBookings={pendingBookings}
          confirmedBookings={confirmedBookings}
          pastBookings={pastBookings}
          activeBookingTab={activeBookingTab}
          onBookingTabChange={onBookingTabChange}
          onConfirmBooking={onConfirmBooking}
          onDeclineBooking={onDeclineBooking}
          onCompleteBooking={onCompleteBooking}
        />
      );
    case 'services':
      return (
        <ServicesTab
          services={services}
          onAddService={onAddService}
          onEditService={onEditService}
          onDeleteService={onDeleteService}
        />
      );
    case 'reviews':
      return <ReviewsTab />;
    case 'gallery':
      return (
        <GalleryTab
          images={galleryImages}
          onAddImage={onAddImage}
          onDeleteImage={onDeleteImage}
        />
      );
    case 'booking-settings':
      return (
        <DashboardBookingSettingsSection
          bookingMessage={bookingMessage}
          isEditingMessage={isEditingMessage}
          isSavingMessage={isSavingMessage}
          bankingDetails={bankingDetails}
          isEditingBankingDetails={isEditingBankingDetails}
          isSavingBankingDetails={isSavingBankingDetails}
          operatingHours={operatingHours}
          isEditingHours={isEditingHours}
          isSavingHours={isSavingHours}
          onBookingMessageChange={onBookingMessageChange}
          onEditMessage={onEditMessage}
          onClearMessage={onClearMessage}
          onSaveMessage={onSaveMessage}
          onBankingDetailsChange={onBankingDetailsChange}
          onEditBankingDetails={onEditBankingDetails}
          onClearBankingDetails={onClearBankingDetails}
          onSaveBankingDetails={onSaveBankingDetails}
          onHoursChange={onHoursChange}
          onEditHours={onEditHours}
          onSaveHours={onSaveHours}
        />
      );
    default:
      return null;
  }
}
