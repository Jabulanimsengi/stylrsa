/**
 * Application Routes
 * 
 * Centralized route definitions for type-safe navigation.
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  SALONS: '/salons',
  SERVICES: '/services',
  PRODUCTS: '/products',
  PROMOTIONS: '/promotions',
  TRENDS: '/trends',
  BLOG: '/blog',

  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',

  // User routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  FAVORITES: '/favorites',
  BOOKINGS: '/bookings',
  MESSAGES: '/messages',

  // Salon owner routes
  MY_SALON: '/my-salon',
  SALON_SETTINGS: '/my-salon/settings',
  SALON_SERVICES: '/my-salon/services',
  SALON_BOOKINGS: '/my-salon/bookings',
  SALON_ANALYTICS: '/my-salon/analytics',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SALONS: '/admin/salons',
  ADMIN_MEDIA: '/admin/media',

  // Info pages
  ABOUT: '/about',
  CONTACT: '/contact',
  HELP: '/help',
  FAQ: '/faq',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  CAREERS: '/careers',
} as const;

/**
 * Dynamic route builders
 */
export const buildRoute = {
  salon: (id: string) => `/salons/${id}`,
  service: (id: string) => `/services/${id}`,
  serviceCategory: (slug: string) => `/services/${slug}`,
  product: (slugOrId: string) => `/products/${slugOrId}`,
  blog: (slug: string) => `/blog/${slug}`,
  trend: (category: string) => `/trends/${category}`,
  booking: (id: string) => `/bookings/${id}`,

  // SEO routes
  seoKeyword: (keyword: string) => `/${keyword}`,
  seoKeywordProvince: (keyword: string, province: string) =>
    `/${keyword}/${province}`,
  seoKeywordCity: (keyword: string, province: string, city: string) =>
    `/${keyword}/${province}/${city}`,
  seoKeywordSuburb: (keyword: string, province: string, city: string, suburb: string) =>
    `/${keyword}/${province}/${city}/${suburb}`,
};

/**
 * External links
 */
export const EXTERNAL_LINKS = {
  FACEBOOK: 'https://www.facebook.com/stylrsa',
  INSTAGRAM: 'https://www.instagram.com/stylrsa',
  TWITTER: 'https://twitter.com/stylrsa',
  LINKEDIN: 'https://www.linkedin.com/company/stylrsa',
} as const;
