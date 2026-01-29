'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface NavigationLoadingContextType {
  setIsNavigating: (value: boolean) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined);

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  // Reset loading state when pathname changes (navigation complete)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <NavigationLoadingContext.Provider value={{ setIsNavigating }}>
      {children}
      {isNavigating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99998,
          pointerEvents: 'auto'
        }}>
          <div
            style={{
              animation: 'navPulse 1.5s ease-in-out infinite',
            }}
          >
            <Image
              src="/logo-white.png"
              alt="Stylr SA"
              width={180}
              height={60}
              priority
              style={{
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}
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


