"use client";

import { ToastContainer } from 'react-toastify';
import ToastCloseButton from '@/components/ToastCloseButton';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';
import { cleanupToastContainers } from '@/lib/portalUtils';

export default function ToasterClient() {
  const { user } = useAuth();
  const mountedRef = useRef(true);
  const hasCleanedUp = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    // Clean up any orphaned toast containers on first mount
    if (!hasCleanedUp.current) {
      cleanupToastContainers();
      hasCleanedUp.current = true;
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Force re-mount when user changes to prevent DOM cleanup issues
  const containerKey = user?.id || 'anonymous';

  if (!mountedRef.current) {
    return null;
  }

  return (
    <ToastContainer
      key={containerKey}
      position="top-right"
      theme="light"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      draggable={false}
      rtl={false}
      pauseOnFocusLoss
      pauseOnHover
      closeButton={(props) => <ToastCloseButton {...props} />}
      style={{ zIndex: 1000010 }}
      limit={3}
      stacked
    />
  );
}
