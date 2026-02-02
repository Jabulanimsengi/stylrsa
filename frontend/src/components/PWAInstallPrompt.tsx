'use client';

import { useEffect, useState } from 'react';
import styles from './PWAInstallPrompt.module.css';
import { FaTimes, FaDownload } from 'react-icons/fa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user opted to never show again
    const neverShow = localStorage.getItem('pwa-install-never-show');
    if (neverShow === 'true') {
      return;
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

      // Show again after 30 days (changed from 7 days)
      if (daysSinceDismissed < 30) {
        return;
      }
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after user has been on site for 3 minutes (changed from 30 seconds)
      setTimeout(() => {
        setShowPrompt(true);
      }, 180000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const installedHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show install prompt
    await deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = (neverShowAgain: boolean = false) => {
    setShowPrompt(false);

    if (neverShowAgain) {
      // User wants to never see this again
      localStorage.setItem('pwa-install-never-show', 'true');
    } else {
      // User dismissed temporarily (will show again in 30 days)
      localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    }
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className={styles.promptContainer}>
      <div className={styles.promptCard}>
        <button
          className={styles.closeButton}
          onClick={() => handleDismiss(true)}
          aria-label="Close and don't show again"
          title="Don't show again"
        >
          <FaTimes />
        </button>

        <div className={styles.content}>
          <div className={styles.icon}>
            <FaDownload />
          </div>

          <div className={styles.text}>
            <h3 className={styles.title}>Install Stylr SA</h3>
            <p className={styles.description}>
              Get quick access to salons, bookings, and messages. Works offline!
            </p>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.installButton}
              onClick={handleInstall}
            >
              Install App
            </button>
            <button
              className={styles.dismissButton}
              onClick={() => handleDismiss(false)}
            >
              Not Now
            </button>
            <button
              className={styles.neverButton}
              onClick={() => handleDismiss(true)}
            >
              Don't Show Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
