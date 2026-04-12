'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Alert, Button, LoadingButton } from '@/components/ui';
import LoadingSpinner from '@/components/LoadingSpinner';
import { notify } from '@/lib/notify';
import {
  buildOnboardingClientUrl,
  getPostAuthDestination,
  hasProviderIntent,
  isSafeAppRedirect,
} from '@/lib/authRedirect';
import { User } from '@/types';
import styles from '../onboarding.module.css';

type SelectableRole = 'CLIENT' | 'SALON_OWNER';

function RoleOnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus, user, login } = useAuth();
  const redirectTarget = searchParams.get('redirect');
  const providerIntent = hasProviderIntent(redirectTarget, searchParams.get('role'));
  const [selectedRole, setSelectedRole] = useState<SelectableRole>(
    providerIntent ? 'SALON_OWNER' : 'CLIENT',
  );
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
          preselectedRole: providerIntent ? 'SALON_OWNER' : null,
        }),
      );
    }
  }, [authStatus, providerIntent, redirectTarget, router, user]);

  const nextStepLabel = useMemo(
    () =>
      selectedRole === 'SALON_OWNER'
        ? 'Finish provider setup'
        : 'Complete client profile',
    [selectedRole],
  );

  const handleContinue = async () => {
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/users/me/onboarding/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || 'Failed to save your role.');
      }

      const updatedUser = await res.json() as User;
      login(updatedUser);
      notify.success('Your account type is saved.');

      if (selectedRole === 'SALON_OWNER') {
        router.replace('/create-salon');
        return;
      }

      router.replace(buildOnboardingClientUrl({ redirectTarget }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save your role.';
      setError(message);
      notify.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <span className={styles.eyebrow}>Account setup</span>
        <h1 className={styles.title}>Choose how you’ll use Stylr SA.</h1>
        <p className={styles.intro}>
          We’ll use this to send you to the right setup flow and keep the right tools on your account.
        </p>

        <section className={styles.card}>
          <div className={styles.stack}>
            <div className={styles.roleGrid}>
              <button
                type="button"
                className={`${styles.roleCard} ${selectedRole === 'CLIENT' ? styles.roleCardActive : ''}`}
                onClick={() => setSelectedRole('CLIENT')}
              >
                <span className={styles.roleTitle}>Client</span>
                <p className={styles.roleCopy}>
                  Book services, save favourites, and manage your appointments in one place.
                </p>
              </button>

              <button
                type="button"
                className={`${styles.roleCard} ${selectedRole === 'SALON_OWNER' ? styles.roleCardActive : ''}`}
                onClick={() => setSelectedRole('SALON_OWNER')}
              >
                <span className={styles.roleTitle}>Service Provider</span>
                <p className={styles.roleCopy}>
                  Create your salon profile, add services, and start receiving bookings.
                </p>
              </button>
            </div>

            <p className={styles.meta}>
              Next step: <strong>{nextStepLabel}</strong>
            </p>

            {error && <Alert variant="error">{error}</Alert>}

            <div className={styles.actions}>
              {isSafeAppRedirect(redirectTarget) && (
                <Button variant="outline" onClick={() => router.replace(redirectTarget)}>
                  Not now
                </Button>
              )}
              <LoadingButton loading={isSaving} loadingText="Saving..." onClick={handleContinue}>
                Continue
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
