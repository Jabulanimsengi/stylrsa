'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationLoadingContextType {
  isPageLoading: boolean;
  showPageLoader: () => void;
  hidePageLoader: () => void;
  setIsNavigating: (value: boolean) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined);

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleSinceRef = useRef<number | null>(null);

  const clearShowTimeout = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  }, []);

  const showPageLoader = useCallback(() => {
    clearShowTimeout();
    showTimeoutRef.current = setTimeout(() => {
      visibleSinceRef.current = Date.now();
      setIsNavigating(true);
      showTimeoutRef.current = null;
    }, 140);
  }, [clearShowTimeout]);

  const hidePageLoader = useCallback(() => {
    clearShowTimeout();

    if (!isNavigating) {
      setIsNavigating(false);
      visibleSinceRef.current = null;
      return;
    }

    const visibleFor = visibleSinceRef.current ? Date.now() - visibleSinceRef.current : 0;
    const remaining = Math.max(0, 180 - visibleFor);

    setTimeout(() => {
      setIsNavigating(false);
      visibleSinceRef.current = null;
    }, remaining);
  }, [clearShowTimeout, isNavigating]);

  // Reset loading state when route changes (navigation complete)
  useEffect(() => {
    hidePageLoader();
  }, [hidePageLoader, pathname]);

  useEffect(() => {
    return () => {
      clearShowTimeout();
    };
  }, [clearShowTimeout]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;

      if (!anchor) return;
      if (anchor.dataset.noNavSpinner === 'true') return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) return;

      const nextRoute = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const currentRoute = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

      if (nextRoute === currentRoute) return;

      showPageLoader();
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [showPageLoader]);

  return (
    <NavigationLoadingContext.Provider
      value={{
        isPageLoading: isNavigating,
        showPageLoader,
        hidePageLoader,
        // Backward-compatible alias while older callers are cleaned up.
        setIsNavigating: (value) => (value ? showPageLoader() : hidePageLoader()),
      }}
    >
      {children}
      <div
        className={`route-loading-shell ${isNavigating ? 'route-loading-shell-visible' : ''}`}
        aria-hidden={!isNavigating}
      >
        <div className="route-loading-bar" />
      </div>
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);
  if (context === undefined) {
    throw new Error('useNavigationLoading must be used within a NavigationLoadingProvider');
  }
  return context;
}


