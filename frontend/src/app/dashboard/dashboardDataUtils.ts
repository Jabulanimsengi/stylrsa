import type { Promotion, Salon, Service, PlanCode, GalleryImage } from '@/types';
import { initializeOperatingHours, type OperatingHours } from '@/components/OperatingHoursInput';
import type { DashboardPromotionItem, DashboardPromotionsState } from './types';

export const EMPTY_DASHBOARD_PROMOTIONS: DashboardPromotionsState = {
  active: [],
  expired: [],
};

export function buildOperatingHoursState(
  rawOperatingHours: Salon['operatingHours'],
): { operatingHours: OperatingHours; isEditingHours: boolean } {
  const operatingHours = initializeOperatingHours();

  if (!rawOperatingHours || !Array.isArray(rawOperatingHours)) {
    return { operatingHours, isEditingHours: false };
  }

  rawOperatingHours.forEach((schedule) => {
    if (schedule.day && schedule.open && schedule.close) {
      operatingHours[schedule.day] = {
        open: schedule.open,
        close: schedule.close,
        isOpen: true,
      };
    }
  });

  return {
    operatingHours,
    isEditingHours: rawOperatingHours.length === 0,
  };
}

export function buildPlanChangePayload(
  newPlanCode: PlanCode,
  paymentReference: string,
  salonName?: string | null,
) {
  const payload: Record<string, unknown> = {
    planCode: newPlanCode,
    paymentReference: paymentReference || salonName || 'Payment reference',
    hasSentProof: false,
  };

  return payload;
}

export function normalizeDashboardPromotion(addedPromotion: Promotion): DashboardPromotionItem {
  return {
    id: addedPromotion.id,
    discountPercentage: addedPromotion.discountPercentage,
    endDate: addedPromotion.endDate,
    originalPrice: 0,
    promotionalPrice: 0,
    approvalStatus: 'PENDING',
  };
}

export function upsertDashboardService(
  services: Service[],
  savedService: Service,
  existingServiceId?: string | null,
) {
  return existingServiceId
    ? services.map((service) => (service.id === savedService.id ? savedService : service))
    : [...services, savedService];
}

export function removePromotionFromState(promotions: DashboardPromotionsState, id: string): DashboardPromotionsState {
  return {
    active: promotions.active.filter((promotion) => promotion.id !== id),
    expired: promotions.expired.filter((promotion) => promotion.id !== id),
  };
}

export function removeGalleryImage(images: GalleryImage[], id: string) {
  return images.filter((image) => image.id !== id);
}

export function buildOperatingHoursPayload(operatingHours: OperatingHours) {
  const hoursArray = Object.entries(operatingHours)
    .filter(([_, data]) => data.isOpen)
    .map(([day, data]) => ({ day, open: data.open, close: data.close }));

  return {
    operatingHours: hoursArray,
    operatingDays: hoursArray.map((hour) => hour.day),
  };
}
