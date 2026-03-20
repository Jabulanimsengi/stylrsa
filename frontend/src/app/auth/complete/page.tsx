'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getPostAuthDestination, hasProviderIntent, isSafeAppRedirect } from '@/lib/authRedirect';

function AuthCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus, user } = useAuth();
  const redirectTarget = searchParams.get('redirect');
  const providerIntent = hasProviderIntent(redirectTarget, searchParams.get('role'));

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    if (authStatus === 'unauthenticated') {
      const params = new URLSearchParams();
      params.set('auth', 'login');

      if (isSafeAppRedirect(redirectTarget)) {
        params.set('redirect', redirectTarget);
      }

      router.replace(`/?${params.toString()}`);
      return;
    }

    if (!user) {
      return;
    }

    router.replace(
      getPostAuthDestination(user, {
        redirectTarget,
        preselectedRole: providerIntent ? 'SALON_OWNER' : null,
      }),
    );
  }, [authStatus, providerIntent, redirectTarget, router, user]);

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Finishing sign-in</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          We&apos;re preparing your account and sending you to the right next step.
        </p>
      </div>
    </main>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense fallback={null}>
      <AuthCompleteContent />
    </Suspense>
  );
}
