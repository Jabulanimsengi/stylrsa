/**
 * Custom hooks for analytics tracking
 */

import { useEffect, useCallback } from 'react';
import { analytics, setUserProperties } from '@/lib/analytics';
import { perfMonitor } from '@/lib/performance';

/**
 * Track page view on mount
 */
export function usePageView(pageName: string): void {
  useEffect(() => {
    if (pageName) {
      analytics.event({
        action: 'page_view',
        category: 'engagement',
        label: pageName,
      });
    }
  }, [pageName]);
}

/**
 * Track user properties
 */
export function useUserTracking(userId?: string, userRole?: string): void {
  useEffect(() => {
    if (userId || userRole) {
      setUserProperties({
        userId,
        userRole,
      });
    }
  }, [userId, userRole]);
}

/**
 * Track custom events with callback
 */
export function useTrackEvent() {
  return useCallback(
    (action: string, category: string, label?: string, value?: number) => {
      analytics.event({ action, category, label, value });
    },
    []
  );
}

/**
 * Track salon view with automatic cleanup
 */
export function useSalonView(salonId?: string, salonName?: string): void {
  useEffect(() => {
    if (salonId && salonName) {
      analytics.viewSalon(salonId, salonName);
    }
  }, [salonId, salonName]);
}

/**
 * Track product view
 */
export function useProductView(productId?: string, productName?: string): void {
  useEffect(() => {
    if (productId && productName) {
      analytics.viewProduct(productId, productName);
    }
  }, [productId, productName]);
}

/**
 * Track component render performance
 */
export function useRenderTracking(componentName: string): void {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;
      if (renderTime > 16) {
        // Only track if render took >1 frame (16ms)
        perfMonitor.start(componentName);
        perfMonitor.end(componentName);
      }
    };
  }, [componentName]);
}

/**
 * Track search queries
 */
export function useSearchTracking() {
  return useCallback((query: string, resultsCount: number) => {
    if (query.trim()) {
      analytics.search(query, resultsCount);
    }
  }, []);
}

/**
 * Track clicks with attribution
 */
export function useClickTracking() {
  return useCallback(
    (elementName: string, category: string = 'click', additionalData?: Record<string, unknown>) => {
      analytics.event({
        action: 'click',
        category,
        label: elementName,
      });

      if (additionalData) {
        console.log('[Analytics] Click tracked:', { elementName, ...additionalData });
      }
    },
    []
  );
}

/**
 * Track form submissions
 */
export function useFormTracking() {
  return useCallback(
    (formName: string, success: boolean, error?: string) => {
      analytics.event({
        action: success ? 'form_submit_success' : 'form_submit_error',
        category: 'engagement',
        label: formName,
      });

      if (!success && error) {
        analytics.error(error, 'Form Error');
      }
    },
    []
  );
}

/**
 * Track video playback
 */
export function useVideoTracking() {
  return {
    play: useCallback((videoId: string) => {
      analytics.event({
        action: 'video_play',
        category: 'engagement',
        label: videoId,
      });
    }, []),

    pause: useCallback((videoId: string, progress: number) => {
      analytics.event({
        action: 'video_pause',
        category: 'engagement',
        label: videoId,
        value: Math.round(progress),
      });
    }, []),

    complete: useCallback((videoId: string) => {
      analytics.event({
        action: 'video_complete',
        category: 'engagement',
        label: videoId,
      });
    }, []),
  };
}

/**
 * Track scroll depth
 */
export function useScrollTracking(threshold: number = 75): void {
  useEffect(() => {
    let maxScroll = 0;
    let tracked = false;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;

      maxScroll = Math.max(maxScroll, scrolled);

      if (maxScroll >= threshold && !tracked) {
        tracked = true;
        analytics.event({
          action: 'scroll_depth',
          category: 'engagement',
          label: `${threshold}%`,
          value: Math.round(maxScroll),
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);
}

/**
 * Track time on page
 */
export function useTimeOnPage(): void {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeOnPage = Date.now() - startTime;
      
      // Only track if user spent more than 10 seconds
      if (timeOnPage > 10000) {
        analytics.timing('Engagement', 'Time on Page', timeOnPage);
      }
    };
  }, []);
}

/**
 * Track outbound link clicks
 */
export function useOutboundLinkTracking() {
  return useCallback((url: string, linkText?: string) => {
    analytics.event({
      action: 'outbound_click',
      category: 'navigation',
      label: linkText || url,
    });
  }, []);
}

/**
 * Track downloads
 */
export function useDownloadTracking() {
  return useCallback((fileName: string, fileType: string) => {
    analytics.event({
      action: 'download',
      category: 'engagement',
      label: `${fileName} (${fileType})`,
    });
  }, []);
}

/**
 * Track share actions
 */
export function useShareTracking() {
  return useCallback((contentType: string, method: string, _contentId?: string) => {
    analytics.event({
      action: 'share',
      category: 'engagement',
      label: `${contentType} via ${method}`,
    });
  }, []);
}

/**
 * Track errors
 */
export function useErrorTracking() {
  return useCallback((errorMessage: string, errorType: string, context?: Record<string, unknown>) => {
    analytics.error(errorMessage, errorType);

    if (context && process.env.NODE_ENV === 'development') {
      console.error('[Error Tracked]:', { errorMessage, errorType, context });
    }
  }, []);
}
