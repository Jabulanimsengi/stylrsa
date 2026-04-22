'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaDownload } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import styles from './PWAInstallPrompt.module.css';
import {
  dismissPwaPromptForCurrentLogin,
  getPwaDismissedLoginMarker,
  getPwaInstallLoginMarker,
  setPwaNeverShowAgain,
  shouldNeverShowPwaPrompt,
} from '@/lib/pwaPrompt';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PROMPT_DELAY_MS = 1400;

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export default function PWAInstallPrompt() {
  const { authStatus } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (isStandaloneMode()) {
      setIsInstalled(true);
    }

    const handlePromptAvailable = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePromptAvailable);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePromptAvailable);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const loginMarker = useMemo(() => getPwaInstallLoginMarker(), [authStatus]);
  const dismissedMarker = useMemo(() => getPwaDismissedLoginMarker(), [authStatus, showPrompt]);

  useEffect(() => {
    if (
      authStatus !== 'authenticated' ||
      isInstalled ||
      !deferredPrompt ||
      shouldNeverShowPwaPrompt() ||
      !loginMarker ||
      dismissedMarker === loginMarker
    ) {
      setShowPrompt(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowPrompt(true);
    }, PROMPT_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [authStatus, deferredPrompt, dismissedMarker, isInstalled, loginMarker]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    } else {
      dismissPwaPromptForCurrentLogin(loginMarker);
    }

    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleNotNow = () => {
    dismissPwaPromptForCurrentLogin(loginMarker);
    setShowPrompt(false);
  };

  const handleNeverShowAgain = () => {
    setPwaNeverShowAgain();
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className={styles.promptContainer} role="dialog" aria-live="polite" aria-label="Install Stylr SA">
      <div className={styles.promptCard}>
        <div className={styles.brandRow}>
          <div className={styles.logoTile}>
            <Image
              src="/logo-transparent.png"
              alt="Stylr SA"
              width={114}
              height={65}
              className={styles.logo}
              priority={false}
            />
          </div>
          <div className={styles.copyBlock}>
            <span className={styles.eyebrow}>Install the app</span>
            <h3 className={styles.title}>Keep Stylr SA on your home screen.</h3>
            <p className={styles.description}>
              Open salons faster, jump back into bookings, and keep the experience feeling app-first on mobile.
            </p>
          </div>
        </div>

        <div className={styles.featureRow}>
          <span className={styles.featurePill}>
            <FaCheckCircle /> Faster return visits
          </span>
          <span className={styles.featurePill}>
            <FaCheckCircle /> Clean mobile access
          </span>
          <span className={styles.featurePill}>
            <FaCheckCircle /> Stylr SA branding
          </span>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.installButton} onClick={handleInstall}>
            <FaDownload /> Install Stylr SA
          </button>
          <button type="button" className={styles.dismissButton} onClick={handleNotNow}>
            Not now
          </button>
        </div>

        <button type="button" className={styles.neverButton} onClick={handleNeverShowAgain}>
          Don&apos;t show this again
        </button>
      </div>
    </div>
  );
}
