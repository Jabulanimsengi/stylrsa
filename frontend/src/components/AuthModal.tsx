'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Login from './Login';
import Register from './Register';
import ResendVerification from './ResendVerification';
import VerifyEmailCode from './VerifyEmailCode';
import styles from '../app/auth.module.css';
import { useAuthModal } from '@/context/AuthModalContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';

// This component is rendered by AuthModalProvider and receives props
interface AuthModalProps {
  view: 'login' | 'register' | 'resend-verification' | 'verify-email';
  onClose: () => void;
}

export default function AuthModal({ view: initialView, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const { switchToLogin, switchToRegister, switchToVerifyEmail, pendingVerificationEmail } = useAuthModal();
  const [view, setView] = useState(initialView);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showPageLoader } = useNavigationLoading();

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handleLoginSuccess = (user: User) => {
    const redirectTarget = searchParams.get('redirect');
    const isSafeRedirect = redirectTarget?.startsWith('/') && !redirectTarget.startsWith('//');

    login(user);
    onClose();
    showPageLoader();

    if (isSafeRedirect && redirectTarget) {
      router.push(redirectTarget);
    } else if (user.role === 'SALON_OWNER' && !user.salonId) {
      router.push('/create-salon');
    } else if (user.role === 'SALON_OWNER') {
      router.push('/dashboard');
    } else if (user.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/salons');
    }
  };

  const handleRegisterSuccess = (email: string) => {
    switchToVerifyEmail(email);
  };

  const handleVerificationSuccess = () => {
    switchToLogin();
  };

  const handleTabChange = (value: string) => {
    if (value === 'login') {
      switchToLogin();
    } else if (value === 'register') {
      switchToRegister();
    }
  };

  const isAuthTab = view === 'login' || view === 'register';
  const isVerificationView = view === 'resend-verification' || view === 'verify-email';

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-[560px] p-0 border-0 max-h-[90vh] overflow-y-auto [&>button]:right-4 [&>button]:top-4 ${styles.authDialog}`}>
        {/* Verification flows */}
        {isVerificationView && (
          <div className={styles.authModalPane}>
            <DialogHeader className="mb-4">
              <DialogTitle>
                {view === 'verify-email' ? 'Verify Your Email' : 'Resend Verification'}
              </DialogTitle>
              <DialogDescription>
                {view === 'verify-email'
                  ? 'Enter the verification code sent to your email'
                  : 'Request a new verification email'}
              </DialogDescription>
            </DialogHeader>
            {view === 'resend-verification' && <ResendVerification onClose={onClose} />}
            {view === 'verify-email' && pendingVerificationEmail && (
              <VerifyEmailCode
                email={pendingVerificationEmail}
                onVerified={handleVerificationSuccess}
                onCancel={switchToLogin}
              />
            )}
          </div>
        )}

        {/* Login/Register tabs */}
        {isAuthTab && (
          <Tabs value={view} onValueChange={handleTabChange} className="w-full">
            <div className={styles.authModalIntro}>
              <span className={styles.authModalEyebrow}>Account access</span>
              <h2 className={styles.authModalTitle}>
                {view === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className={styles.authModalDescription}>
                {view === 'login'
                  ? 'Sign in to manage bookings, favorites, or your business workspace.'
                  : 'Start with your role and email, then finish your profile in one calmer flow.'}
              </p>
            </div>
            <div className={styles.authTabsWrap}>
              <TabsList className={styles.authTabsList}>
                <TabsTrigger value="login" className={styles.authTabsTrigger}>Login</TabsTrigger>
                <TabsTrigger value="register" className={styles.authTabsTrigger}>Register</TabsTrigger>
              </TabsList>
            </div>

            <div className={styles.authModalBody}>
              <TabsContent value="login" className={styles.authTabsContent}>
                <Login onLoginSuccess={handleLoginSuccess} />
              </TabsContent>

              <TabsContent value="register" className={styles.authTabsContent}>
                <Register onRegisterSuccess={handleRegisterSuccess} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
