/**
 * Application Configuration Constants
 */

// Site metadata
export const SITE_CONFIG = {
  name: 'Stylr SA',
  tagline: 'Find Your Perfect Salon in South Africa',
  description: "South Africa's premier destination for luxury beauty & wellness. Book appointments at top-rated premium salons, medical spas, beauty clinics & expert wellness professionals.",
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za',
  locale: 'en_ZA',
  currency: 'ZAR',
} as const;

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
} as const;

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 12,
  maxPageSize: 100,
  servicesPageSize: 24,
  salonsPageSize: 12,
  reviewsPageSize: 10,
  notificationsPageSize: 10,
} as const;

// Image configuration
export const IMAGE_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  thumbnailSize: { width: 150, height: 150 },
  mediumSize: { width: 600, height: 400 },
  largeSize: { width: 1200, height: 800 },
  heroSize: { width: 1920, height: 1080 },
} as const;

// Video configuration
export const VIDEO_CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'],
  maxDuration: 60, // seconds
} as const;

// Map configuration
export const MAP_CONFIG = {
  defaultCenter: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
  defaultZoom: 12,
  searchRadius: 50, // km
} as const;

// Cache durations (in seconds)
export const CACHE_DURATION = {
  static: 60 * 60 * 24, // 24 hours
  dynamic: 60 * 5, // 5 minutes
  user: 60, // 1 minute
  search: 60 * 15, // 15 minutes
} as const;

// Animation durations (in ms)
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Breakpoints (should match CSS)
export const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1440,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'theme',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  recentSearches: 'recentSearches',
  favoritesSynced: 'favoritesSynced',
  guestFavorites: 'guestFavoriteSalons',
  cookieConsent: 'cookieConsent',
  notificationsCache: 'nav-notifications-cache',
} as const;

// Session storage keys
export const SESSION_KEYS = {
  searchFilters: 'searchFilters',
  scrollPosition: 'scrollPosition',
} as const;
