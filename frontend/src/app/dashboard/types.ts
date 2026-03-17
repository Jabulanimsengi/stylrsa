import type { Booking } from '@/types';
import type { ApprovalStatus } from '@/types';

export type DashboardBooking = Booking & {
  user: { firstName: string; lastName: string };
  service: { title: string };
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  clientPhone?: string;
  [key: string]: unknown;
};

export interface DashboardPromotionItem {
  id: string;
  originalPrice: number;
  promotionalPrice: number;
  discountPercentage: number;
  endDate: string;
  approvalStatus: ApprovalStatus;
  service?: { title?: string };
  product?: { name?: string };
}

export interface DashboardPromotionsState {
  active: DashboardPromotionItem[];
  expired: DashboardPromotionItem[];
}
