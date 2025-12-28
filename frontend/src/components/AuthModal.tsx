'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from './Login';
import Register from './Register';
import ResendVerification from './ResendVerification';
import VerifyEmailCode from './VerifyEmailCode';
import { useAuthModal } from '@/context/AuthModalContext';
import { useAuth } from '@/hooks/useAuth';
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
  const { switchToLogin, switchToRegister, switchToResendVerification, switchToVerifyEmail, pendingVerificationEmail } = useAuthModal();
  const [view, setView] = useState(initialView);
  const router = useRouter();

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handleLoginSuccess = (user: User) => {
    login(user);
    onClose();

    // Intelligent redirection logic
    if (user.role === 'SALON_OWNER' && !user.salonId) {
      router.push('/create-salon');
    } else if (user.role === 'SALON_OWNER') {
      router.push('/dashboard');
    } else if (user.role === 'PRODUCT_SELLER') {
      router.push('/product-dashboard');
    } else if (user.role === 'ADMIN') {
      router.push('/admin');
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
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto p-0">
        {/* Verification flows */}
        {isVerificationView && (
          <div className="p-6">
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
            <div className="px-6 pt-6 pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            </div>

            <div className="px-6 pb-6">
              <TabsContent value="login" className="mt-0">
                <Login onLoginSuccess={handleLoginSuccess} />
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <Register onRegisterSuccess={handleRegisterSuccess} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
