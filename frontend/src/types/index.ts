// frontend/src/types/index.ts

export type PlanCode = 'FREE' | 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE' | 'PREMIUM';
export type PlanPaymentStatus =
  | 'PENDING_SELECTION'
  | 'AWAITING_PROOF'
  | 'PROOF_SUBMITTED'
  | 'VERIFIED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type SalonApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'
  | 'PUBLISHED';
export type UserRole = 'PENDING' | 'CLIENT' | 'SALON_OWNER' | 'ADMIN';
export type UserOnboardingStatus =
  | 'ROLE_REQUIRED'
  | 'PROVIDER_SETUP_REQUIRED'
  | 'COMPLETE';

export type OperatingHourEntry = {
  day: string;
  open: string;
  close: string;
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  onboardingStatus?: UserOnboardingStatus;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  emailVerified?: boolean;
  phoneNumber?: string | null;
  salonId?: string | null;
}

export interface Salon {
  id: string;
  name: string;
  slug?: string | null;
  description?: string;
  backgroundImage?: string | null;
  logo?: string | null;
  province: string;
  heroImages: string[];
  city: string;
  town: string;
  address?: string;
  postalCode?: string | null;
  latitude?: number;
  longitude?: number;
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
  bookingType?: 'ONSITE' | 'MOBILE' | 'BOTH';
  offersMobile?: boolean;
  mobileFee?: number | null;
  isAvailableNow?: boolean;
  operatingHours?: Record<string, string> | OperatingHourEntry[] | null;
  operatingDays?: string[];
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVerified?: boolean;
  avgRating?: number;
  reviewCount?: number;
  viewCount?: number;
  services?: Service[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  gallery?: GalleryImage[];
  isFavorited?: boolean;
  // Plan & visibility controls (populated from backend)
  planCode?: PlanCode | null;
  visibilityWeight?: number;
  maxListings?: number;
  featuredUntil?: string | null;
  planPriceCents?: number | null;
  planPaymentStatus?: PlanPaymentStatus | null;
  planPaymentReference?: string | null;
  planProofSubmittedAt?: string | null;
  planVerifiedAt?: string | null;
  distance?: number | null; // Distance in km from user (when sorted by proximity)
  bookingMessage?: string | null; // Optional booking message from salon owner
  depositRequired?: boolean | null;
  depositPercentage?: number | null;
  paymentInstructions?: string | null;
  cancellationPolicy?: string | null; // Salon's cancellation policy text
  specialConditions?: string | null;
  isFeatured?: boolean; // Whether salon is currently featured
  // Banking details for deposits
  bankName?: string | null;
  accountHolder?: string | null;
  accountNumber?: string | null;
  branchCode?: string | null;
}

export interface SalonApplication {
  id: string;
  applicationReference: string;
  salonName: string;
  contactPersonName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber?: string | null;
  description?: string | null;
  address: string;
  postalCode?: string | null;
  town: string;
  city: string;
  province: string;
  latitude?: number | null;
  longitude?: number | null;
  website?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  googleReviewsUrl?: string | null;
  freshaReviewsUrl?: string | null;
  booksyReviewsUrl?: string | null;
  bookingType?: 'ONSITE' | 'MOBILE' | 'BOTH';
  offersMobile?: boolean;
  mobileFee?: number | null;
  operatingHours?: OperatingHourEntry[] | null;
  operatingDays?: string[];
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode?: string | null;
  priceListFileUrl: string;
  bankingProofFileUrl: string;
  portfolioImageUrls: string[];
  status: SalonApplicationStatus;
  adminNotes?: string | null;
  reviewedAt?: string | null;
  publishedSalonId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  // Keep both for backward-compat across components; backend uses 'title'
  title?: string;
  name?: string;
  description: string;
  price: number;
  discountPercentage?: number | null;
  duration: number;
  durationMin?: number | null;  // Minimum duration for variable services
  durationMax?: number | null;  // Maximum duration for variable services
  pricingType?: 'PER_PERSON' | 'PER_COUPLE';
  category?: string;
  categoryId?: string;
  inclusions?: string[];
  salonId: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  averageRating?: number;
  reviewCount?: number;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  likeCount?: number;
  isLikedByCurrentUser?: boolean;
  isPopular?: boolean;     // Marked as popular service
  isFeatured?: boolean;    // Featured/highlighted service
  salon?: {
    id: string;
    name: string;
    ownerId: string;
    city?: string;
    province?: string;
    slug?: string | null;
  };
}

export interface Booking {
  id: string;
  userId: string;
  salonId: string;
  serviceId: string;
  teamMemberId?: string;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DECLINED';
  notes?: string;
  clientNotes?: string;
  clientPhone?: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  salon: Salon;
  service: Service;
  teamMember?: TeamMember;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  galleryImages?: string[];
  specialties?: string[];
  experience?: number;
  sortOrder?: number;
  isActive?: boolean;
  serviceIds?: string[];
  services?: Pick<Service, 'id' | 'title' | 'name' | 'salonId'>[];
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  bookingId?: string;
  type?: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'PROMOTION' | 'REVIEW_REMINDER';
}

export interface PaginatedNotifications {
  items: Notification[];
  nextCursor: string | null;
  unreadCount: number;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  salonId: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  salonId?: string;
  serviceId?: string;
  promoCode?: string;
  isActive: boolean;
}

// Trendz Feature Types
export type TrendCategory =
  | 'HAIRSTYLE'
  | 'NAILS'
  | 'SPA'
  | 'MAKEUP'
  | 'SKINCARE'
  | 'MASSAGE'
  | 'BARBERING'
  | 'BRAIDS'
  | 'LOCS'
  | 'EXTENSIONS';

export type AgeGroup =
  | 'KIDS'
  | 'TEENS'
  | 'YOUNG_ADULTS'
  | 'ADULTS'
  | 'MATURE_ADULTS'
  | 'ALL_AGES';

export interface Trend {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: TrendCategory;
  ageGroups: AgeGroup[];
  styleName?: string;
  tags: string[];
  isActive: boolean;
  priority: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  clickThroughCount: number;
  relatedServiceCategories: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isLiked?: boolean;
}

