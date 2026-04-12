// Shared contract types for FE/BE alignment. Source of truth for public API shapes.

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BookingType = 'ONSITE' | 'MOBILE' | 'BOTH';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';

export interface ContractSalon {
  id: string;
  name: string;
  description?: string | null;
  backgroundImage?: string | null;
  heroImages: string[];
  province: string;
  city: string;
  town: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contactEmail?: string | null;
  phoneNumber?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  googleReviewsUrl?: string | null;
  freshaReviewsUrl?: string | null;
  booksyReviewsUrl?: string | null;
  bookingType: BookingType;
  offersMobile?: boolean;
  mobileFee?: number | null;
  isAvailableNow?: boolean;
  operatingHours?: Record<string, string> | null;
  operatingDays?: string[];
  approvalStatus: ApprovalStatus;
  avgRating?: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractService {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number; // minutes
  images: string[];
  salonId: string;
  approvalStatus: ApprovalStatus;
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractBooking {
  id: string;
  bookingTime: string; // ISO
  isMobile: boolean;
  totalCost: number;
  status: BookingStatus;
  userId: string;
  salonId: string;
  serviceId: string;
  clientPhone?: string | null;
  createdAt: string;
  updatedAt: string;
}
