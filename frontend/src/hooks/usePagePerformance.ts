'use client';

import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

export interface PagePerformanceSample {
  id: string;
  pageName: string;
  path: string;
  recordedAt: string;
  clientRenderMs?: number;
  lcpMs?: number;
  resourceCount?: number;
  imageCount?: number;
  imageKb?: number;
}

export const PAGE_PERFORMANCE_STORAGE_KEY = 'stylr:page-performance-samples';
const PAGE_PERFORMANCE_EVENT = 'stylr:page-performance-updated';
const MAX_STORED_SAMPLES = 30;

function readStoredSamples(): PagePerformanceSample[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(PAGE_PERFORMANCE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredSamples(samples: PagePerformanceSample[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(PAGE_PERFORMANCE_STORAGE_KEY, JSON.stringify(samples));
    window.dispatchEvent(new CustomEvent(PAGE_PERFORMANCE_EVENT));
  } catch {
    // Ignore storage failures in private mode or constrained environments.
  }
}

export function getStoredPagePerformanceSamples(): PagePerformanceSample[] {
  return readStoredSamples();
}

export function subscribeToPagePerformanceUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = () => callback();
  window.addEventListener(PAGE_PERFORMANCE_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(PAGE_PERFORMANCE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function persistPagePerformanceSample(sample: PagePerformanceSample) {
  const existing = readStoredSamples();
  const nextSamples = [sample, ...existing.filter((entry) => entry.id !== sample.id)].slice(0, MAX_STORED_SAMPLES);
  writeStoredSamples(nextSamples);
}

function reportResourceMetrics(pageName: string) {
  if (typeof window === 'undefined' || typeof performance === 'undefined') return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const imageResources = resources.filter((entry) => entry.initiatorType === 'img' || entry.initiatorType === 'image');
  const totalImageBytes = imageResources.reduce(
    (sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0),
    0
  );

  analytics.timing('Page Requests', `${pageName} resource_count`, resources.length);
  analytics.timing('Page Requests', `${pageName} image_count`, imageResources.length);
  analytics.timing('Page Requests', `${pageName} image_kb`, Math.round(totalImageBytes / 1024));

  return {
    resourceCount: resources.length,
    imageCount: imageResources.length,
    imageKb: Math.round(totalImageBytes / 1024),
  };
}

export function usePagePerformance(pageName: string) {
  const didReportRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof performance === 'undefined' || didReportRef.current) {
      return;
    }

    didReportRef.current = true;
    const mountStartedAt = performance.now();
    let lcpObserver: PerformanceObserver | null = null;
    const sample: PagePerformanceSample = {
      id: `${pageName}-${Date.now()}`,
      pageName,
      path: window.location.pathname,
      recordedAt: new Date().toISOString(),
    };

    const updateSample = (partial: Partial<PagePerformanceSample>) => {
      Object.assign(sample, partial);
      persistPagePerformanceSample(sample);
    };

    const renderReportId = window.requestAnimationFrame(() => {
      const clientRenderMs = performance.now() - mountStartedAt;
      analytics.timing('Page Render', `${pageName} client_render_ms`, clientRenderMs);
      updateSample({ clientRenderMs: Math.round(clientRenderMs) });
    });

    const handleResourceReport = () => {
      const resourceMetrics = reportResourceMetrics(pageName);
      if (resourceMetrics) {
        updateSample(resourceMetrics);
      }
    };

    if (document.readyState === 'complete') {
      handleResourceReport();
    } else {
      window.addEventListener('load', handleResourceReport, { once: true });
    }

    if ('PerformanceObserver' in window) {
      try {
        lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            analytics.timing('Web Vitals', `${pageName} lcp_ms`, lastEntry.startTime);
            updateSample({ lcpMs: Math.round(lastEntry.startTime) });
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        lcpObserver = null;
      }
    }

    return () => {
      window.cancelAnimationFrame(renderReportId);
      window.removeEventListener('load', handleResourceReport);
      lcpObserver?.disconnect();
    };
  }, [pageName]);
}
