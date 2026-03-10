'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getStoredPagePerformanceSamples,
  type PagePerformanceSample,
  PAGE_PERFORMANCE_STORAGE_KEY,
  subscribeToPagePerformanceUpdates,
} from '@/hooks/usePagePerformance';
import styles from './PerformanceLabClient.module.css';

type PageSummary = {
  pageName: string;
  sampleCount: number;
  latestPath: string;
  latestRecordedAt: string;
  avgClientRenderMs: number;
  avgLcpMs: number;
  avgImageKb: number;
};

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatMetric(value?: number, unit = 'ms') {
  if (value == null || Number.isNaN(value)) return 'n/a';
  return `${value}${unit}`;
}

function formatRecordedAt(recordedAt: string) {
  return new Date(recordedAt).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PerformanceLabClient() {
  const [samples, setSamples] = useState<PagePerformanceSample[]>([]);

  useEffect(() => {
    const syncSamples = () => {
      setSamples(getStoredPagePerformanceSamples());
    };

    syncSamples();
    return subscribeToPagePerformanceUpdates(syncSamples);
  }, []);

  const summaries = useMemo<PageSummary[]>(() => {
    const grouped = new Map<string, PagePerformanceSample[]>();

    samples.forEach((sample) => {
      const current = grouped.get(sample.pageName) ?? [];
      current.push(sample);
      grouped.set(sample.pageName, current);
    });

    return Array.from(grouped.entries())
      .map(([pageName, pageSamples]) => {
        const latest = pageSamples[0];
        return {
          pageName,
          sampleCount: pageSamples.length,
          latestPath: latest?.path ?? '',
          latestRecordedAt: latest?.recordedAt ?? '',
          avgClientRenderMs: average(pageSamples.map((sample) => sample.clientRenderMs).filter((value): value is number => value != null)),
          avgLcpMs: average(pageSamples.map((sample) => sample.lcpMs).filter((value): value is number => value != null)),
          avgImageKb: average(pageSamples.map((sample) => sample.imageKb).filter((value): value is number => value != null)),
        };
      })
      .sort((left, right) => left.pageName.localeCompare(right.pageName));
  }, [samples]);

  const clearSamples = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(PAGE_PERFORMANCE_STORAGE_KEY);
    setSamples([]);
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Performance Lab</p>
          <h1 className={styles.title}>Live page metrics from this browser session</h1>
          <p className={styles.subtitle}>
            Use this page after visiting the homepage, salon listings, and salon detail views. Metrics are stored locally in the browser and update as new samples are captured.
          </p>
        </div>
        <button type="button" onClick={clearSamples} className={styles.clearButton}>
          Clear samples
        </button>
      </div>

      {summaries.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No metrics captured yet</h2>
          <p>Open the homepage, salons list, or a salon profile first. Then return here to compare render time, LCP, and image weight.</p>
        </div>
      ) : (
        <div className={styles.summaryGrid}>
          {summaries.map((summary) => (
            <article key={summary.pageName} className={styles.summaryCard}>
              <p className={styles.cardEyebrow}>{summary.pageName}</p>
              <h2 className={styles.cardTitle}>{summary.latestPath}</h2>
              <p className={styles.cardMeta}>
                {summary.sampleCount} sample{summary.sampleCount === 1 ? '' : 's'} • last seen {formatRecordedAt(summary.latestRecordedAt)}
              </p>
              <dl className={styles.metrics}>
                <div>
                  <dt>Avg render</dt>
                  <dd>{formatMetric(summary.avgClientRenderMs)}</dd>
                </div>
                <div>
                  <dt>Avg LCP</dt>
                  <dd>{formatMetric(summary.avgLcpMs)}</dd>
                </div>
                <div>
                  <dt>Avg image weight</dt>
                  <dd>{formatMetric(summary.avgImageKb, ' KB')}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2>Recent samples</h2>
          <p>Most recent first</p>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Page</th>
                <th>Path</th>
                <th>Recorded</th>
                <th>Render</th>
                <th>LCP</th>
                <th>Requests</th>
                <th>Images</th>
                <th>Image KB</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((sample) => (
                <tr key={sample.id}>
                  <td>{sample.pageName}</td>
                  <td>{sample.path}</td>
                  <td>{formatRecordedAt(sample.recordedAt)}</td>
                  <td>{formatMetric(sample.clientRenderMs)}</td>
                  <td>{formatMetric(sample.lcpMs)}</td>
                  <td>{sample.resourceCount ?? 'n/a'}</td>
                  <td>{sample.imageCount ?? 'n/a'}</td>
                  <td>{formatMetric(sample.imageKb, ' KB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
