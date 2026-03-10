/**
 * Performance Monitoring Utilities
 * Tracks Web Vitals and custom performance metrics
 */

import { analytics } from './analytics';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Web Vitals thresholds (in milliseconds)
 * Based on Google's recommendations
 */
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },    // First Contentful Paint
  LCP: { good: 2500, poor: 4000 },    // Largest Contentful Paint
  FID: { good: 100, poor: 300 },      // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },     // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 },    // Time to First Byte
  INP: { good: 200, poor: 500 },      // Interaction to Next Paint
};

/**
 * Get performance rating
 */
function getRating(
  name: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report Web Vital to analytics
 */
export function reportWebVital(metric: PerformanceMetric): void {
  // Send to Google Analytics
  analytics.timing('Web Vitals', metric.name, metric.value);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: `${Math.round(metric.value)}ms`,
      rating: metric.rating,
      id: metric.id,
    });
  }
}

/**
 * Measure custom performance metrics
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  /**
   * Start timing a custom metric
   */
  start(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * End timing and report metric
   */
  end(name: string): number | null {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`Performance mark "${name}" not found`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    // Report to analytics
    analytics.timing('Custom', name, duration);

    return duration;
  }

  /**
   * Measure async operation
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      return await fn();
    } finally {
      this.end(name);
    }
  }
}

/**
 * Global performance monitor instance
 */
export const perfMonitor = new PerformanceMonitor();

/**
 * Track page load performance
 */
export function trackPageLoad(): void {
  if (typeof window === 'undefined') return;

  // Wait for page load
  window.addEventListener('load', () => {
    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      const metrics = {
        'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
        'TCP Connection': navigation.connectEnd - navigation.connectStart,
        'Request Time': navigation.responseStart - navigation.requestStart,
        'Response Time': navigation.responseEnd - navigation.responseStart,
        'DOM Processing': navigation.domContentLoadedEventEnd - navigation.responseEnd,
        'Load Complete': navigation.loadEventEnd - navigation.loadEventStart,
      };

      // Report each metric
      Object.entries(metrics).forEach(([name, value]) => {
        if (value > 0) {
          analytics.timing('Page Load', name, value);
        }
      });
    }

    // Get resource timing
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const imageResources = resources.filter((r) => r.initiatorType === 'img');
    const scriptResources = resources.filter((r) => r.initiatorType === 'script');

    if (imageResources.length > 0) {
      const avgImageLoad =
        imageResources.reduce((sum, r) => sum + r.duration, 0) / imageResources.length;
      analytics.timing('Resources', 'Average Image Load', avgImageLoad);
    }

    if (scriptResources.length > 0) {
      const avgScriptLoad =
        scriptResources.reduce((sum, r) => sum + r.duration, 0) / scriptResources.length;
      analytics.timing('Resources', 'Average Script Load', avgScriptLoad);
    }
  });
}

/**
 * Track API call performance
 */
export async function trackAPICall<T>(
  endpoint: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fetchFn();
    const duration = performance.now() - startTime;

    // Report successful API call
    analytics.timing('API Calls', endpoint, duration);

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    // Report failed API call
    analytics.timing('API Errors', endpoint, duration);
    analytics.error(
      error instanceof Error ? error.message : 'API call failed',
      'API Error'
    );

    throw error;
  }
}

/**
 * Track component render time
 */
export function trackRender(componentName: string, renderTime: number): void {
  analytics.timing('Component Renders', componentName, renderTime);

  // Warn if render is slow
  if (renderTime > 100 && process.env.NODE_ENV === 'development') {
    console.warn(`[Performance] Slow render detected: ${componentName} took ${renderTime}ms`);
  }
}

/**
 * Memory monitoring
 */
export function trackMemoryUsage(): void {
  if (typeof window === 'undefined') return;

  const memory = (performance as any).memory;
  if (!memory) return;

  const usedMemory = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
  const totalMemory = Math.round(memory.totalJSHeapSize / 1048576);

  analytics.timing('Memory', 'Used JS Heap (MB)', usedMemory);
  analytics.timing('Memory', 'Total JS Heap (MB)', totalMemory);
}

/**
 * Track long tasks (tasks taking >50ms)
 */
export function trackLongTasks(): void {
  if (typeof window === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Report long tasks
        analytics.timing('Long Tasks', 'Duration', entry.duration);

        if (process.env.NODE_ENV === 'development') {
          console.warn('[Performance] Long task detected:', {
            duration: `${Math.round(entry.duration)}ms`,
            startTime: entry.startTime,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Track page load
  trackPageLoad();

  // Track long tasks
  trackLongTasks();

  // Track memory every 30 seconds
  setInterval(trackMemoryUsage, 30000);
}
