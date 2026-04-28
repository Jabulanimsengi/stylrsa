'use client';

import type { ApprovalStatus, GalleryImage, Salon, Service } from '@/types';
import ServicesTab from '@/components/ServicesTab/ServicesTab';
import GalleryTab from '@/components/GalleryTab/GalleryTab';
import TeamMembers from '@/components/TeamMembers/TeamMembers';
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

interface DashboardBookingRequirements {
  depositRequired: boolean;
  depositPercentage: string;
  paymentInstructions: string;
  cancellationPolicy: string;
  specialConditions: string;
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
  updatingBookingAction?: {
    bookingId: string;
    action: 'confirm' | 'decline' | 'complete';
  } | null;
  promotions: DashboardPromotionsState;
  galleryImages: GalleryImage[];
  bookingMessage: string;
  isEditingMessage: boolean;
  isSavingMessage: boolean;
  bankingDetails: DashboardBankingDetails;
  isEditingBankingDetails: boolean;
  isSavingBankingDetails: boolean;
  bookingRequirements: DashboardBookingRequirements;
  isEditingBookingRequirements: boolean;
  isSavingBookingRequirements: boolean;
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
  onConfirmBooking: (bookingId: string) => void | Promise<void>;
  onDeclineBooking: (bookingId: string) => void | Promise<void>;
  onCompleteBooking: (bookingId: string) => void;
  onAddService: () => void;
  onEditService: (service: Service) => void;
  onManageDiscount: (service: Service) => void;
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
  onBookingRequirementsChange: (value: DashboardBookingRequirements) => void;
  onEditBookingRequirements: () => void;
  onSaveBookingRequirements: () => void;
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
  salon,
  services,
  bookings,
  pendingBookings,
  confirmedBookings,
  pastBookings,
  activeBookingTab,
  updatingBookingAction,
  galleryImages,
  bookingMessage,
  isEditingMessage,
  isSavingMessage,
  bankingDetails,
  isEditingBankingDetails,
  isSavingBankingDetails,
  bookingRequirements,
  isEditingBookingRequirements,
  isSavingBookingRequirements,
  operatingHours,
  isEditingHours,
  isSavingHours,
  onBookingTabChange,
  onConfirmBooking,
  onDeclineBooking,
  onCompleteBooking,
  onAddService,
  onEditService,
  onManageDiscount,
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
  onBookingRequirementsChange,
  onEditBookingRequirements,
  onSaveBookingRequirements,
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
          updatingBookingAction={updatingBookingAction}
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
          onManageDiscount={onManageDiscount}
          onDeleteService={onDeleteService}
        />
      );
    case 'team-members':
      return <TeamMembers salonId={salon.id} isEditable />;
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
          bookingRequirements={bookingRequirements}
          isEditingBookingRequirements={isEditingBookingRequirements}
          isSavingBookingRequirements={isSavingBookingRequirements}
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
          onBookingRequirementsChange={onBookingRequirementsChange}
          onEditBookingRequirements={onEditBookingRequirements}
          onSaveBookingRequirements={onSaveBookingRequirements}
          onHoursChange={onHoursChange}
          onEditHours={onEditHours}
          onSaveHours={onSaveHours}
        />
      );
    default:
      return null;
  }
}
