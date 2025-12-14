'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import styles from './MobileBottomNav.module.css';

// Navigation item type
interface NavItem {
  id: string;
  href: string;
  label: string;
  requiresAuth?: boolean;
}

// Context-aware FAB configurations
const FAB_CONFIGS: Record<string, { label: string; icon: 'book' | 'search' | 'cart' | 'apply' }> = {
  '/': { label: 'Book Now', icon: 'book' },
  '/salons': { label: 'Find Salon', icon: 'search' },
  '/services': { label: 'Book Service', icon: 'book' },
  '/products': { label: 'Shop', icon: 'cart' },
  '/talent': { label: 'Find Jobs', icon: 'apply' },
  '/jobs': { label: 'Apply Now', icon: 'apply' },
};

// Get dynamic FAB config based on current path
function getFabConfig(pathname: string): { label: string; icon: 'book' | 'search' | 'cart' | 'apply' } {
  // Check for exact match first
  if (FAB_CONFIGS[pathname]) {
    return FAB_CONFIGS[pathname];
  }

  // Check for prefix matches
  if (pathname.startsWith('/salons/')) {
    return { label: 'Book Here', icon: 'book' };
  }
  if (pathname.startsWith('/services/')) {
    return { label: 'Book Service', icon: 'book' };
  }
  if (pathname.startsWith('/products')) {
    return { label: 'Shop', icon: 'cart' };
  }
  if (pathname.startsWith('/talent') || pathname.startsWith('/jobs')) {
    return { label: 'Find Jobs', icon: 'apply' };
  }

  // Default
  return { label: 'Book Now', icon: 'book' };
}

// Icon components
function HomeIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6z" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SearchIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BriefcaseIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function ShopBagIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UserIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// FAB Icons
function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function ApplyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function SearchFabIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      // Only hide/show after scrolling a meaningful amount
      if (Math.abs(scrollDelta) < 10) return;

      if (currentScrollY > 100 && scrollDelta > 0) {
        // Scrolling down and past threshold
        setIsHidden(true);
      } else if (scrollDelta < 0) {
        // Scrolling up
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Determine account link based on user role
  const accountHref = useMemo(() => {
    if (authStatus !== 'authenticated') return '/my-profile';
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'SALON_OWNER') return '/dashboard';
    if (user?.role === 'PRODUCT_SELLER') return '/product-dashboard';
    return '/my-profile';
  }, [authStatus, user?.role]);

  // Navigation items (without the center FAB)
  const leftNavItems: NavItem[] = [
    { id: 'home', href: '/', label: 'Home' },
    { id: 'search', href: '/salons', label: 'Search' },
  ];

  const rightNavItems: NavItem[] = [
    { id: 'shop', href: '/products', label: 'Shop' },
    { id: 'profile', href: accountHref, label: 'Me' },
  ];

  // Get FAB configuration
  const fabConfig = useMemo(() => getFabConfig(pathname), [pathname]);

  // Check if a nav item is active
  const isActive = useCallback((item: NavItem) => {
    if (item.href === '/') {
      return pathname === '/';
    }
    if (item.id === 'profile') {
      return pathname?.startsWith('/my-profile') ||
        pathname?.startsWith('/dashboard') ||
        pathname?.startsWith('/product-dashboard') ||
        pathname?.startsWith('/admin');
    }
    return pathname?.startsWith(item.href);
  }, [pathname]);

  // Handle navigation click for auth-gated items
  const handleNavClick = useCallback((e: React.MouseEvent, item: NavItem) => {
    if (item.requiresAuth && authStatus !== 'authenticated') {
      e.preventDefault();
      openModal('login');
    }
  }, [authStatus, openModal]);

  // Handle FAB click
  const handleFabClick = useCallback(() => {
    // Navigate to services page for booking
    if (fabConfig.icon === 'book') {
      window.location.href = '/services';
    } else if (fabConfig.icon === 'search') {
      window.location.href = '/salons';
    } else if (fabConfig.icon === 'cart') {
      window.location.href = '/products';
    } else if (fabConfig.icon === 'apply') {
      window.location.href = '/talent';
    }
  }, [fabConfig.icon]);

  // Get the FAB icon based on context
  const FabIcon = useMemo(() => {
    switch (fabConfig.icon) {
      case 'cart':
        return CartIcon;
      case 'apply':
        return ApplyIcon;
      case 'search':
        return SearchFabIcon;
      case 'book':
      default:
        return CalendarIcon;
    }
  }, [fabConfig.icon]);

  // Get icon component for a nav item
  const getNavIcon = (item: NavItem, active: boolean) => {
    switch (item.id) {
      case 'home':
        return <HomeIcon filled={active} />;
      case 'search':
        return <SearchIcon filled={active} />;
      case 'shop':
        return <ShopBagIcon filled={active} />;
      case 'profile':
        return <UserIcon filled={active} />;
      default:
        return <HomeIcon filled={active} />;
    }
  };

  return (
    <nav
      className={`${styles.bottomNav} ${isHidden ? styles.hidden : ''}`}
      aria-label="Mobile navigation"
    >
      {/* Left nav items */}
      <div className={styles.navGroup}>
        {leftNavItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
              onClick={(e) => handleNavClick(e, item)}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.navIcon}>
                {getNavIcon(item, active)}
              </span>
              <span className={styles.navLabel}>{item.label}</span>
              {active && <span className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </div>

      {/* Center FAB */}
      <div className={styles.fabContainer}>
        <button
          type="button"
          className={styles.fab}
          onClick={handleFabClick}
          aria-label={fabConfig.label}
        >
          <span className={styles.fabIconWrapper}>
            <FabIcon />
          </span>
          <span className={styles.fabLabel}>{fabConfig.label}</span>
          <span className={styles.fabGlow} />
        </button>
      </div>

      {/* Right nav items */}
      <div className={styles.navGroup}>
        {rightNavItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
              onClick={(e) => handleNavClick(e, item)}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.navIcon}>
                {getNavIcon(item, active)}
              </span>
              <span className={styles.navLabel}>{item.label}</span>
              {active && <span className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
