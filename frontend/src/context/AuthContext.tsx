'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { STORAGE_KEYS } from '@/constants/config';
import { User } from '@/types';

type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

interface AuthContextType {
  authStatus: AuthStatus;
  isLoading: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  setAuthStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const { data: session, status: sessionStatus } = useSession();
  const attachedRef = useRef<string | null>(null);
  const verifyingRef = useRef<boolean>(false);
  const justLoggedInRef = useRef<boolean>(false); // Track if user just logged in to prevent immediate re-verification

  const hydrateFromSession = useCallback(() => {
    if (sessionStatus !== 'authenticated') return false;

    const sessionUser = session?.user;
    if (!sessionUser?.id || !sessionUser.email) return false;
    const sessionUserId = sessionUser.id;
    const sessionUserEmail = sessionUser.email;

    setUser((currentUser) => currentUser ?? {
      id: sessionUserId,
      email: sessionUserEmail,
      firstName: sessionUser.firstName ?? '',
      lastName: sessionUser.lastName ?? '',
      role: (sessionUser.role as User['role']) ?? 'PENDING',
      onboardingStatus: sessionUser.onboardingStatus as User['onboardingStatus'],
      createdAt: '',
      updatedAt: '',
      emailVerified: sessionUser.emailVerified,
      phoneNumber: sessionUser.phoneNumber ?? null,
      salonId: sessionUser.salonId ?? null,
    });
    setAuthStatus('authenticated');
    return true;
  }, [session, sessionStatus]);

  const verifyUser = useCallback(async () => {
    if (verifyingRef.current) return;

    // Skip verification if user just logged in - trust the login response
    // Check BEFORE setting verifyingRef to avoid clearing the flag prematurely
    if (justLoggedInRef.current) {
      return;
    }

    if (sessionStatus === 'unauthenticated') {
      setAuthStatus('unauthenticated');
      setUser(null);
      attachedRef.current = null;
      return;
    }

    hydrateFromSession();

    verifyingRef.current = true;

    try {
      // If NextAuth session exists, attach backend JWT cookie first (idempotent)
      const backendJwt = (session as { backendJwt?: string } | null)?.backendJwt;
      if (sessionStatus === 'authenticated' && backendJwt && attachedRef.current !== backendJwt) {
        attachedRef.current = backendJwt;
        try {
          console.log('[AuthContext] Attaching backend JWT cookie...');
          const attachRes = await fetch('/api/auth/attach', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            },
            credentials: 'include',
            body: JSON.stringify({ token: backendJwt }),
          });
          if (attachRes.ok) {
            console.log('[AuthContext] JWT cookie attached successfully');
          } else {
            console.warn('[AuthContext] Failed to attach JWT cookie:', attachRes.status);
          }
        } catch (attachError) {
          console.warn('[AuthContext] Failed to attach JWT:', attachError);
        }
      } else if (sessionStatus === 'authenticated' && !backendJwt) {
        console.warn('[AuthContext] NextAuth session exists but no backendJwt - user may need to re-login');
      }

      // Primary: cookie-based status check with cache-busting
      let res = await fetch('/api/auth/status', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      // Fallback: if unauthorized but session has backend JWT, try Authorization header once
      if (!res.ok && sessionStatus === 'authenticated' && backendJwt) {
        res = await fetch('/api/auth/status', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${backendJwt}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
        });
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAuthStatus('authenticated');
      } else if (res.status === 401) {
        // Explicit 401: backend says session is invalid - log out
        console.log('[AuthContext] Session invalid (401), logging out');
        setAuthStatus('unauthenticated');
        setUser(null);
      } else {
        // Other HTTP errors (500, 503, etc.): keep current session, log warning
        console.warn('[AuthContext] Verification failed with status', res.status, '- keeping current session');
        // Don't change auth status - keep user logged in
      }
    } catch (error) {
      // Network errors, timeouts, parsing errors: keep current session
      console.warn('[AuthContext] verifyUser network error:', error, '- keeping current session');

      // Don't log out on network errors - this prevents logout during:
      // - Tab switching when browser pauses requests
      // - Temporary network disconnections
      // - Server restarts or maintenance
      // Users will only be logged out on explicit 401 responses
    } finally {
      verifyingRef.current = false;
    }
  }, [hydrateFromSession, sessionStatus, session]);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      hydrateFromSession();
    }
  }, [hydrateFromSession, sessionStatus]);

  useEffect(() => {
    // Wait until NextAuth finishes determining session to avoid race
    if (sessionStatus === 'loading') return;
    void verifyUser();
  }, [sessionStatus, session, verifyUser]);

  const login = useCallback((userData: User) => {
    // Set user and auth status immediately
    // The backend already validated credentials and set the cookie
    setUser(userData);
    setAuthStatus('authenticated');
    // Mark that we just logged in so verifyUser doesn't run
    // This flag persists until logout or page refresh
    justLoggedInRef.current = true;

    // Clear the flag after a short delay to allow normal verification on next page load
    // But keep it long enough to prevent immediate re-verification from sessionStatus changes
    setTimeout(() => {
      justLoggedInRef.current = false;
    }, 2000); // 2 seconds should be enough for the auth flow to stabilize
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthStatus('unauthenticated');
    attachedRef.current = null;
    justLoggedInRef.current = false;

    // Clear user-specific data from storage
    try {
      if (typeof window !== 'undefined') {
        // Clear all sessionStorage (user-specific)
        sessionStorage.clear();

        // Selectively clear localStorage - keep theme and cookie consent
        const keysToKeep = [STORAGE_KEYS.theme, STORAGE_KEYS.cookieConsent, STORAGE_KEYS.guestFavorites, 'pwa-install-dismissed'];
        const keepData: Record<string, string> = {};

        // Save data we want to keep
        keysToKeep.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) keepData[key] = value;
        });

        // Clear everything
        localStorage.clear();

        // Restore saved data
        Object.entries(keepData).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      }
    } catch (error) {
      console.error('Failed to clear storage on logout:', error);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await verifyUser();
  }, [verifyUser]);

  return (
    <AuthContext.Provider value={{ authStatus, isLoading: authStatus === 'loading', user, login, logout, setAuthStatus, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
