'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Alert, Button, LoadingButton } from '@/components/ui';
import LoadingSpinner from '@/components/LoadingSpinner';
import { notify } from '@/lib/notify';
import {
  getPostAuthDestination,
  isSafeAppRedirect,
} from '@/lib/authRedirect';
import { User } from '@/types';
import styles from '../onboarding.module.css';

function RoleOnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus, user, login } = useAuth();
  const redirectTarget = searchParams.get('redirect');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    if (authStatus === 'unauthenticated') {
      const params = new URLSearchParams({
        auth: 'login',
        redirect: '/onboarding/role',
      });
      router.replace(`/?${params.toString()}`);
      return;
    }

    if (!user) {
      return;
    }

    const needsRoleSelection =
      user.role === 'PENDING' || user.onboardingStatus === 'ROLE_REQUIRED';

    if (!needsRoleSelection) {
      router.replace(
        getPostAuthDestination(user, {
          redirectTarget,
          preselectedRole: 'SALON_OWNER',
        }),
      );
    }
  }, [authStatus, redirectTarget, router, user]);

  const handleContinue = async () => {
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/users/me/onboarding/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: 'SALON_OWNER' }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || 'Failed to continue your setup.');
      }

      const updatedUser = await res.json() as User;
      login(updatedUser);
      notify.success('Your salon owner setup is ready to continue.');
      router.replace('/create-salon');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to continue your setup.';
      setError(message);
      notify.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <h1 className={styles.title}>Continue your salon owner setup.</h1>
        <p className={styles.intro}>
          Stylr SA now uses signup for salon owners only. We&apos;ll take you straight into creating your listing.
        </p>

        <section className={styles.card}>
          <div className={styles.stack}>
            <div className={styles.roleGrid}>
              <div className={`${styles.roleCard} ${styles.roleCardActive}`}>
                <span className={styles.roleTitle}>Salon owner</span>
                <p className={styles.roleCopy}>
                  Create your salon profile, add services, and start receiving booking requests while client details are collected during each booking.
                </p>
              </div>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <div className={styles.actions}>
              {isSafeAppRedirect(redirectTarget) && (
                <Button variant="outline" onClick={() => router.replace(redirectTarget)}>
                  Not now
                </Button>
              )}
              <LoadingButton loading={isSaving} loadingText="Saving..." onClick={handleContinue}>
                Continue to salon setup
              </LoadingButton>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function RoleOnboardingPage() {
  return (
    <Suspense
      fallback={(
        <main className={styles.page}>
          <div className={styles.shell}>
            <LoadingSpinner />
          </div>
        </main>
      )}
    >
      <RoleOnboardingPageContent />
    </Suspense>
  );
}
