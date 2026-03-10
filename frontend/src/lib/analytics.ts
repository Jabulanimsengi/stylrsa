/**
 * Google Analytics 4 Integration
 * Documentation: https://developers.google.com/analytics/devguides/collection/gtagjs
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Google Analytics Measurement ID
 * Get from: https://analytics.google.com/
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Check if Analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => {
  return Boolean(GA_MEASUREMENT_ID && typeof window !== 'undefined');
};

/**
 * Page view tracking
 * Called automatically on route changes
 */
export const pageview = (url: string): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

/**
 * Custom event tracking
 * @param action - Event action (e.g., 'click', 'submit', 'view')
 * @param category - Event category (e.g., 'booking', 'search', 'navigation')
 * @param label - Event label (optional descriptor)
 * @param value - Event value (optional numeric value)
 */
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Predefined event types for common actions
 */
export const analytics = {
  event,
  // User Authentication
  login: (method: string) => {
    event({
      action: 'login',
      category: 'engagement',
      label: method,
    });
  },

  signUp: (method: string) => {
    event({
      action: 'sign_up',
      category: 'engagement',
      label: method,
    });
  },

  logout: () => {
    event({
      action: 'logout',
      category: 'engagement',
    });
  },

  // Salon Actions
  viewSalon: (salonId: string, salonName: string) => {
    event({
      action: 'view_salon',
      category: 'salon',
      label: `${salonName} (${salonId})`,
    });
  },

  favoriteSalon: (salonId: string, action: 'add' | 'remove') => {
    event({
      action: `favorite_${action}`,
      category: 'salon',
      label: salonId,
    });
  },

  shareSalon: (salonId: string, method: string) => {
    event({
      action: 'share',
      category: 'salon',
      label: `${salonId} via ${method}`,
    });
  },

  // Booking Actions
  startBooking: (serviceId: string, serviceName: string) => {
    event({
      action: 'begin_checkout',
      category: 'booking',
      label: `${serviceName} (${serviceId})`,
    });
  },

  completeBooking: (serviceId: string, price: number) => {
    event({
      action: 'purchase',
      category: 'booking',
      label: serviceId,
      value: price,
    });
  },

  cancelBooking: (bookingId: string) => {
    event({
      action: 'cancel_booking',
      category: 'booking',
      label: bookingId,
    });
  },

  // Search Actions
  search: (query: string, resultsCount: number) => {
    event({
      action: 'search',
      category: 'engagement',
      label: query,
      value: resultsCount,
    });
  },

  filterSalons: (filters: Record<string, any>) => {
    event({
      action: 'filter',
      category: 'salon',
      label: JSON.stringify(filters),
    });
  },

  // Product Actions
  viewProduct: (productId: string, productName: string) => {
    event({
      action: 'view_item',
      category: 'product',
      label: `${productName} (${productId})`,
    });
  },

  addToCart: (productId: string, price: number) => {
    event({
      action: 'add_to_cart',
      category: 'product',
      label: productId,
      value: price,
    });
  },

  purchase: (orderId: string, value: number) => {
    event({
      action: 'purchase',
      category: 'product',
      label: orderId,
      value: value,
    });
  },

  // Review Actions
  submitReview: (salonId: string, rating: number) => {
    event({
      action: 'submit_review',
      category: 'engagement',
      label: salonId,
      value: rating,
    });
  },

  // Error Tracking
  error: (errorMessage: string, errorType: string) => {
    event({
      action: 'exception',
      category: 'error',
      label: `${errorType}: ${errorMessage}`,
    });
  },

  // Performance Tracking
  timing: (category: string, variable: string, value: number) => {
    event({
      action: 'timing_complete',
      category: category,
      label: variable,
      value: Math.round(value),
    });
  },
};

/**
 * User properties tracking
 */
export const setUserProperties = (properties: {
  userId?: string;
  userRole?: string;
  [key: string]: any;
}): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag?.('set', 'user_properties', properties);
};

/**
 * E-commerce tracking
 */
export const ecommerce = {
  viewItemList: (items: any[], listName: string) => {
    if (!isAnalyticsEnabled()) return;

    window.gtag?.('event', 'view_item_list', {
      item_list_name: listName,
      items: items,
    });
  },

  selectItem: (item: any, listName: string) => {
    if (!isAnalyticsEnabled()) return;

    window.gtag?.('event', 'select_item', {
      item_list_name: listName,
      items: [item],
    });
  },

  beginCheckout: (items: any[], value: number) => {
    if (!isAnalyticsEnabled()) return;

    window.gtag?.('event', 'begin_checkout', {
      currency: 'ZAR',
      value: value,
      items: items,
    });
  },

  purchase: (transactionId: string, items: any[], value: number) => {
    if (!isAnalyticsEnabled()) return;

    window.gtag?.('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'ZAR',
      value: value,
      items: items,
    });
  },
};
