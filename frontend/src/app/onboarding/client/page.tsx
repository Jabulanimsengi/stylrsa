'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Alert, LoadingButton } from '@/components/ui';
import LoadingSpinner from '@/components/LoadingSpinner';
import { notify } from '@/lib/notify';
import {
  buildOnboardingRoleUrl,
  getPostAuthDestination,
  isSafeAppRedirect,
} from '@/lib/authRedirect';
import { User } from '@/types';
import styles from '../onboarding.module.css';

function ClientOnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus, user, login } = useAuth();
  const redirectTarget = searchParams.get('redirect');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    if (authStatus === 'unauthenticated') {
      const params = new URLSearchParams({
        auth: 'login',
        redirect: '/onboarding/client',
      });
      router.replace(`/?${params.toString()}`);
      return;
    }

    if (!user) {
      return;
    }

    if (user.role === 'PENDING' || user.onboardingStatus === 'ROLE_REQUIRED') {
      router.replace(buildOnboardingRoleUrl({ redirectTarget }));
      return;
    }

    if (user.onboardingStatus !== 'CLIENT_PROFILE_REQUIRED') {
      router.replace(getPostAuthDestination(user, { redirectTarget }));
      return;
    }

    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setPhoneNumber(user.phoneNumber || '');
  }, [authStatus, redirectTarget, router, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/users/me/onboarding/client', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || 'Failed to save your profile.');
      }

      const updatedUser = await res.json() as User;
      login(updatedUser);
      notify.success('Your client profile is ready.');

      router.replace(isSafeAppRedirect(redirectTarget) ? redirectTarget : '/my-profile');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save your profile.';
      setError(message);
      notify.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <span className={styles.eyebrow}>Client onboarding</span>
        <h1 className={styles.title}>Confirm your details before you start booking.</h1>
        <p className={styles.intro}>
          We’ll use this information for your account profile and to make it easier to manage appointments.
        </p>

        <section className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="phoneNumber">Phone number</label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="e.g. 082 123 4567"
                required
              />
            </div>

            <p className={styles.meta}>
              You can update these details again later from your profile page.
            </p>

            {error && <Alert variant="error">{error}</Alert>}

            <div className={styles.actions}>
              <LoadingButton type="submit" loading={isSaving} loadingText="Saving...">
                Save and continue
              </LoadingButton>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function ClientOnboardingPage() {
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
      <ClientOnboardingPageContent />
    </Suspense>
  );
}
