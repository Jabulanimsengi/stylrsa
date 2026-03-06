// frontend/src/types/index.ts

export type PlanCode = 'FREE' | 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE' | 'PREMIUM';
export type PlanPaymentStatus =
  | 'PENDING_SELECTION'
  | 'AWAITING_PROOF'
  | 'PROOF_SUBMITTED'
  | 'VERIFIED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  role: 'USER' | 'SALON_OWNER' | 'PRODUCT_SELLER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  emailVerified?: boolean;
  salonId?: string | null;
  // Seller plan fields
  sellerPlanCode?: PlanCode | null;
  sellerPlanPriceCents?: number | null;
  sellerPlanPaymentStatus?: PlanPaymentStatus | null;
  sellerPlanPaymentReference?: string | null;
  sellerPlanProofSubmittedAt?: string | null;
  sellerPlanVerifiedAt?: string | null;
  sellerVisibilityWeight?: number | null;
  sellerMaxListings?: number | null;
  // Seller profile fields (for product sellers)
  sellerWhatsapp?: string | null;
  sellerWebsite?: string | null;
  sellerBankName?: string | null;
  sellerBankAccountHolder?: string | null;
  sellerBankAccountNumber?: string | null;
  sellerBankBranchCode?: string | null;
  sellerBankAccountType?: string | null;
  sellerPaymentNote?: string | null;
  // Seller business profile fields
  sellerBusinessName?: string | null;
  sellerContactPerson?: string | null;
  sellerContactPhone?: string | null;
  sellerContactEmail?: string | null;
  sellerPhysicalAddress?: string | null;
  sellerProvincesServed?: string[];
  sellerApprovalStatus?: ApprovalStatus | null;
  sellerProfileSubmittedAt?: string | null;
  sellerApprovedAt?: string | null;
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
  latitude?: number;
  longitude?: number;
  contactEmail?: string | null;
  phoneNumber?: string | null;
  whatsapp?: string | null;
  website?: string | null;
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
  reviews?: Review[];
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
  cancellationPolicy?: string | null; // Salon's cancellation policy text
  isFeatured?: boolean; // Whether salon is currently featured
  // Banking details for deposits
  bankName?: string | null;
  accountHolder?: string | null;
  accountNumber?: string | null;
  branchCode?: string | null;
}

export interface Service {
  id: string;
  // Keep both for backward-compat across components; backend uses 'title'
  title?: string;
  name?: string;
  description: string;
  price: number;
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

export interface Review {
  id: string;
  rating: number;
  comment: string;
  images?: string[]; // Review photos uploaded by user
  salonOwnerResponse?: string | null;
  salonOwnerRespondedAt?: string | null;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  userId: string;
  salonId: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; firstName: string; lastName: string };
  booking?: {
    id: string;
    service: {
      title: string;
    };
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
  specialties?: string[];
  experience?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  bookingId?: string;
  type?: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'NEW_MESSAGE' | 'PROMOTION' | 'REVIEW_REMINDER';
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

export interface Product {
  id: string;
  name: string;
  slug?: string | null; // SEO-friendly URL slug
  description: string;
  price: number;
  images: string[];
  stock: number;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  isOnSale?: boolean;
  salePrice?: number;
  seller?: Partial<User>;
  category?: string;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  // External purchase links (no internal payment system)
  whatsappNumber?: string | null;
  websiteUrl?: string | null;
  takealotUrl?: string | null;
  amazonUrl?: string | null;
  purchaseNote?: string | null; // Optional note about how to purchase
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
  productId?: string;
  promoCode?: string;
  isActive: boolean;
}

export type ProductOrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface ProductOrder {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: ProductOrderStatus;
  deliveryMethod?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
  seller?: Partial<User>;
  buyer?: Partial<User>;
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

export interface SellerSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  sellerPlanCode?: PlanCode | null;
  sellerPlanPriceCents?: number | null;
  sellerPlanPaymentStatus?: PlanPaymentStatus | null;
  sellerPlanPaymentReference?: string | null;
  sellerPlanProofSubmittedAt?: string | null;
  sellerPlanVerifiedAt?: string | null;
  sellerVisibilityWeight?: number | null;
  sellerMaxListings?: number | null;
  sellerFeaturedUntil?: string | null;
  // Business profile fields
  sellerBusinessName?: string | null;
  sellerContactPerson?: string | null;
  sellerContactPhone?: string | null;
  sellerContactEmail?: string | null;
  sellerPhysicalAddress?: string | null;
  sellerProvincesServed?: string[];
  sellerApprovalStatus?: ApprovalStatus | null;
  sellerProfileSubmittedAt?: string | null;
  sellerApprovedAt?: string | null;
  productsCount: number;
  pendingProductsCount: number;
}