"use client";

import { useEffect } from 'react';
import { setupPortalErrorHandling } from '@/lib/portalUtils';

/**
 * Client-side initialization component
 * Sets up error handling and cleanup for portals and other client-side features
 */
export default function ClientInit() {
  useEffect(() => {
    let cleanupPortalHandling: () => void = () => {};

    try {
      // Set up portal error handling to prevent crashes
      cleanupPortalHandling = setupPortalErrorHandling();
      
      // Clean up old zoom settings that were causing CLS issues
      // This removes any stored zoom preferences from previous versions
      cleanupZoomSettings();

      // Dev localhost should never be controlled by a stale production service worker.
      void cleanupServiceWorkersForDev();
    } catch (error) {
      // Silently fail if initialization fails (e.g., chunk loading error)
      console.warn('ClientInit failed to initialize:', error);
    }

    return () => {
      cleanupPortalHandling();
    };
  }, []);

  return null;
}

/**
 * Remove old zoom settings from localStorage and any injected zoom styles
 * This fixes CLS (Cumulative Layout Shift) issues caused by the old zoom feature
 */
function cleanupZoomSettings() {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove old zoom localStorage items
    localStorage.removeItem('desktop-zoom-level');
    localStorage.removeItem('desktop-zoom-applied');
    localStorage.removeItem('desktop-zoom-browser');
    
    // Remove any injected zoom style element
    const zoomStyle = document.getElementById('desktop-zoom-style');
    if (zoomStyle) {
      zoomStyle.remove();
    }
    
    // Reset any inline zoom on html element
    const html = document.documentElement;
    if (html.style.zoom) {
      html.style.zoom = '';
    }
  } catch {
    // Silently fail if cleanup fails
  }
}

async function cleanupServiceWorkersForDev() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('caches' in window)) {
    return;
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (!isDevelopment && !isLocalHost) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length > 0) {
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    const cacheNames = await caches.keys();
    const nextOrWorkboxCaches = cacheNames.filter((cacheName) => {
      return (
        cacheName.includes('workbox') ||
        cacheName.includes('_next') ||
        cacheName.includes('precache') ||
        cacheName === 'start-url' ||
        cacheName === 'api-cache'
      );
    });

    await Promise.all(nextOrWorkboxCaches.map((cacheName) => caches.delete(cacheName)));
  } catch (error) {
    console.warn('Service worker cleanup skipped:', error);
  }
}
