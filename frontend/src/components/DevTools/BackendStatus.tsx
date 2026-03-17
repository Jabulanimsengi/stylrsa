'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './BackendStatus.module.css';

export default function BackendStatus() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkConnection = useCallback(async () => {
    if (!isDevelopment) return;
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch('/api/health', { 
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[DevTools] Health check:', res.ok ? 'OK' : `Failed (${res.status})`);
      }
      
      setIsConnected(res.ok);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (process.env.NODE_ENV === 'development') {
        console.log('[DevTools] Health check error:', message);
      }
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  }, [isDevelopment]);

  useEffect(() => {
    if (!isDevelopment) return;
    // Delay initial check to let the app settle
    const initialCheck = setTimeout(checkConnection, 1500);
    const interval = setInterval(checkConnection, 10000);
    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [checkConnection, isDevelopment]);

  if (!isDevelopment) {
    return null;
  }

  // Don't show if connected, still checking initial, or dismissed
  if (isConnected === null || isConnected || dismissed) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.icon}>⚠️</span>
        <div className={styles.text}>
          <strong>Backend not connected</strong>
          <span>Some features may not work. Start the backend server to enable full functionality.</span>
        </div>
        <div className={styles.actions}>
          <button 
            onClick={checkConnection} 
            disabled={isChecking}
            className={styles.retryBtn}
          >
            {isChecking ? 'Checking...' : 'Retry'}
          </button>
          <button 
            onClick={() => setDismissed(true)}
            className={styles.dismissBtn}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
