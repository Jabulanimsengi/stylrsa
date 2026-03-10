/**
 * Push Notifications Utility
 * Handles Web Push API for browser notifications
 */

// VAPID public key - generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Convert VAPID public key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Subscribe user to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key not configured');
    return null;
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return subscription;
    }

    // Subscribe to push notifications
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Send push subscription to backend
 */
export async function sendSubscriptionToBackend(
  subscription: PushSubscription
): Promise<void> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
  } catch (error) {
    console.error('Error sending subscription to backend:', error);
    throw error;
  }
}

/**
 * Remove push subscription from backend
 */
export async function removeSubscriptionFromBackend(
  subscription: PushSubscription
): Promise<void> {
  try {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });
  } catch (error) {
    console.error('Error removing subscription from backend:', error);
  }
}

/**
 * Show local notification (without push)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isPushSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      badge: '/icon-96x96.svg',
      icon: '/icon-192x192.svg',
      ...options,
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

/**
 * Notification types for your app
 */
export const NotificationTypes = {
  NEW_BOOKING: 'new_booking',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  NEW_REVIEW: 'new_review',
  PROMOTION: 'promotion',
  REMINDER: 'reminder',
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

/**
 * Show notification based on type
 */
export async function showNotificationByType(
  type: NotificationType,
  data: any
): Promise<void> {
  const notificationConfigs: Record<
    NotificationType,
    (data: any) => { title: string; options: NotificationOptions }
  > = {
    [NotificationTypes.NEW_BOOKING]: (data) => ({
      title: 'New Booking',
      options: {
        body: `New booking from ${data.customerName} for ${data.serviceName}`,
        icon: '/icon-192x192.svg',
        badge: '/icon-96x96.svg',
        tag: 'booking',
        data: { url: '/dashboard', bookingId: data.bookingId },
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      },
    }),
    [NotificationTypes.BOOKING_CONFIRMED]: (data) => ({
      title: 'Booking Confirmed',
      options: {
        body: `Your booking at ${data.salonName} has been confirmed!`,
        icon: '/icon-192x192.svg',
        badge: '/icon-96x96.svg',
        tag: 'booking',
        data: { url: '/my-bookings', bookingId: data.bookingId },
      },
    }),
    [NotificationTypes.BOOKING_CANCELLED]: (data) => ({
      title: 'Booking Cancelled',
      options: {
        body: `Your booking at ${data.salonName} has been cancelled.`,
        icon: '/icon-192x192.svg',
        badge: '/icon-96x96.svg',
        tag: 'booking',
        data: { url: '/my-bookings' },
      },
    }),
    [NotificationTypes.NEW_REVIEW]: (data) => ({
      title: 'New Review',
      options: {
        body: `${data.reviewerName} left a ${data.rating}-star review`,
        icon: '/icon-192x192.svg',
        badge: '/icon-96x96.svg',
        tag: 'review',
        data: { url: `/salons/${data.salonId}` },
      },
    }),
    [NotificationTypes.PROMOTION]: (data) => ({
      title: data.title || 'Special Offer',
      options: {
        body: data.body,
        icon: '/icon-192x192.svg',
        badge: '/icon-96x96.svg',
        tag: 'promotion',
        data: { url: data.url || '/promotions' },
      },
    }),
    [NotificationTypes.REMINDER]: (data) => ({
      title: 'Booking Reminder',
      options: {
        body: `Your appointment at ${data.salonName} is tomorrow at ${data.time}`,
        icon: '/icon-192x192.svg',
        badge: '/icon-96x96.svg',
        tag: 'reminder',
        requireInteraction: true,
        data: { url: '/my-bookings', bookingId: data.bookingId },
      },
    }),
  };

  const config = notificationConfigs[type]?.(data);
  if (config) {
    await showLocalNotification(config.title, config.options);
  }
}

/**
 * Initialize push notifications
 */
export async function initializePushNotifications(): Promise<{
  permission: NotificationPermission;
  subscription: PushSubscription | null;
}> {
  if (!isPushSupported()) {
    return { permission: 'denied', subscription: null };
  }

  const permission = getNotificationPermission();

  if (permission === 'granted') {
    try {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        await sendSubscriptionToBackend(subscription);
      }
      return { permission, subscription };
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return { permission, subscription: null };
    }
  }

  return { permission, subscription: null };
}
