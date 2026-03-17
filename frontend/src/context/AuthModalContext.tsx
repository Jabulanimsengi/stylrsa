'use client';

import React, { Suspense, createContext, useContext, useState, ReactNode } from 'react';
import AuthModal from '@/components/AuthModal';

type AuthModalView = 'login' | 'register' | 'resend-verification' | 'verify-email';

interface AuthModalContextType {
  openModal: (view: AuthModalView) => void;
  closeModal: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
  switchToResendVerification: () => void;
  switchToVerifyEmail: (email: string) => void;
  pendingVerificationEmail: string | null;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthModalView>('login');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const openModal = (view: AuthModalView) => {
    setView(view);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);
  const switchToLogin = () => setView('login');
  const switchToRegister = () => setView('register');
  const switchToResendVerification = () => setView('resend-verification');
  const switchToVerifyEmail = (email: string) => {
    setPendingVerificationEmail(email);
    setView('verify-email');
  };

  return (
    <AuthModalContext.Provider value={{
      openModal,
      closeModal,
      switchToLogin,
      switchToRegister,
      switchToResendVerification,
      switchToVerifyEmail,
      pendingVerificationEmail
    }}>
      {children}
      {isOpen && (
        <Suspense fallback={null}>
          <AuthModal view={view} onClose={closeModal} />
        </Suspense>
      )}
    </AuthModalContext.Provider>
  );
};
