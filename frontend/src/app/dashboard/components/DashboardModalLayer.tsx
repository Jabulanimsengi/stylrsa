'use client';

import type { GalleryImage, Promotion, Salon, Service } from '@/types';
import ServiceFormModal from '@/components/ServiceFormModal';
import SimpleServiceFormModal from '@/components/SimpleServiceFormModal';
import EditSalonModal from '@/components/EditSalonModal';
import GalleryUploadModal from '@/components/GalleryUploadModal';
import PromotionModal from '@/components/PromotionModal';
import CreatePromotionModal from '@/components/CreatePromotionModal';
import ServiceDiscountModal from '@/components/ServiceDiscountModal';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';

interface PromotionServicePreview {
  id: string;
  title: string;
  price: number;
}

interface DashboardModalLayerProps {
  salon: Salon;
  editingService: Service | null;
  isServiceModalOpen: boolean;
  isSimpleServiceModalOpen: boolean;
  isEditSalonModalOpen: boolean;
  isGalleryModalOpen: boolean;
  isPromotionModalOpen: boolean;
  isCreatePromoModalOpen: boolean;
  isServiceDiscountModalOpen: boolean;
  itemToDelete: { id: string; type: 'service' | 'promotion' | 'gallery' } | null;
  bookingToComplete: string | null;
  selectedPromotionService: PromotionServicePreview | null;
  discountService: Service | null;
  onCloseServiceModal: () => void;
  onCloseSimpleServiceModal: () => void;
  onCloseEditSalonModal: () => void;
  onCloseGalleryModal: () => void;
  onClosePromotionModal: () => void;
  onCloseCreatePromoModal: () => void;
  onCloseServiceDiscountModal: () => void;
  onServiceSaved: (service: Service) => void;
  onSalonUpdated: (salon: Salon) => void;
  onImageAdded: (image: GalleryImage) => void;
  onPromotionAdded: (promotion: Promotion) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onConfirmBookingComplete: () => Promise<void>;
  onCancelBookingComplete: () => void;
  onCreatePromotionSuccess: () => void;
}

export default function DashboardModalLayer({
  salon,
  editingService,
  isServiceModalOpen,
  isSimpleServiceModalOpen,
  isEditSalonModalOpen,
  isGalleryModalOpen,
  isPromotionModalOpen,
  isCreatePromoModalOpen,
  isServiceDiscountModalOpen,
  itemToDelete,
  bookingToComplete,
  selectedPromotionService,
  discountService,
  onCloseServiceModal,
  onCloseSimpleServiceModal,
  onCloseEditSalonModal,
  onCloseGalleryModal,
  onClosePromotionModal,
  onCloseCreatePromoModal,
  onCloseServiceDiscountModal,
  onServiceSaved,
  onSalonUpdated,
  onImageAdded,
  onPromotionAdded,
  onConfirmDelete,
  onCancelDelete,
  onConfirmBookingComplete,
  onCancelBookingComplete,
  onCreatePromotionSuccess,
}: DashboardModalLayerProps) {
  return (
    <>
      {isServiceModalOpen && (
        <ServiceFormModal
          salonId={salon.id}
          onClose={onCloseServiceModal}
          onServiceSaved={onServiceSaved}
          service={editingService}
        />
      )}
      {isSimpleServiceModalOpen && (
        <SimpleServiceFormModal
          salonId={salon.id}
          onClose={onCloseSimpleServiceModal}
          onServiceAddedOrUpdated={onServiceSaved}
          serviceToEdit={editingService}
        />
      )}
      {isEditSalonModalOpen && (
        <EditSalonModal salon={salon} onClose={onCloseEditSalonModal} onSalonUpdate={onSalonUpdated} />
      )}
      {isGalleryModalOpen && (
        <GalleryUploadModal salonId={salon.id} onClose={onCloseGalleryModal} onImageAdded={onImageAdded} />
      )}
      {isPromotionModalOpen && (
        <PromotionModal salonId={salon.id} onClose={onClosePromotionModal} onPromotionAdded={onPromotionAdded} />
      )}
      {isServiceDiscountModalOpen && discountService && (
        <ServiceDiscountModal
          service={discountService}
          onClose={onCloseServiceDiscountModal}
          onSaved={onServiceSaved}
        />
      )}
      {itemToDelete && (
        <ConfirmationModal
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
          message={`Delete this ${itemToDelete.type}?`}
        />
      )}
      {bookingToComplete && (
        <ConfirmationModal
          onConfirm={onConfirmBookingComplete}
          onCancel={onCancelBookingComplete}
          message="Mark this service as completed?"
          confirmText="Mark Completed"
        />
      )}
      {isCreatePromoModalOpen && selectedPromotionService && (
        <CreatePromotionModal
          service={selectedPromotionService}
          isOpen={isCreatePromoModalOpen}
          onClose={onCloseCreatePromoModal}
          onSuccess={onCreatePromotionSuccess}
        />
      )}
    </>
  );
}
