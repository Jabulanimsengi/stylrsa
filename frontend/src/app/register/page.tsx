'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus } = useAuth();

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const role = searchParams.get('role');
    const isSafeRedirect = callbackUrl.startsWith('/') && !callbackUrl.startsWith('//');

    if (authStatus === 'authenticated') {
      router.replace(isSafeRedirect ? callbackUrl : '/');
      return;
    }

    const modalUrl = new URLSearchParams();
    modalUrl.set('auth', 'register');
    modalUrl.set('redirect', isSafeRedirect ? callbackUrl : '/');

    if (role === 'SALON_OWNER') {
      modalUrl.set('role', role);
    }

    router.replace(`/?${modalUrl.toString()}`);
  }, [authStatus, router, searchParams]);

  // Don't render anything - just redirect
  return null;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Redirecting...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

