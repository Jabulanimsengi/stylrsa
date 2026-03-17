'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';

interface UseLogoutActionOptions {
  onAfterLogout?: () => void;
}

export function useLogoutAction(options: UseLogoutActionOptions = {}) {
  const { onAfterLogout } = options;
  const { logout } = useAuth();
  const router = useRouter();
  const { showPageLoader } = useNavigationLoading();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const openLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      try {
        await signOut({ redirect: false });
      } catch {
        // Ignore NextAuth signout issues and continue with app logout.
      }

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      logout();
      onAfterLogout?.();
      toast.success('You have been logged out successfully.');
      showPageLoader();
      router.push('/');
    } catch (error) {
      logger.error('Logout failed:', error);
      toast.error(toFriendlyMessage(error, 'Logout failed. Please try again.'));
    } finally {
      setIsLogoutModalOpen(false);
    }
  }, [logout, onAfterLogout, router, showPageLoader]);

  return {
    isLogoutModalOpen,
    openLogoutModal,
    closeLogoutModal,
    handleLogout,
  };
}
