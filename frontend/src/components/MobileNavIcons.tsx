'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHeart, FaUser } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import styles from './MobileNavIcons.module.css';
import { getAccountNavConfig, isAccountRoute, PRIMARY_NAV_LINKS } from './navigationConfig';

function shouldHideMobileNav(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }

  return /^\/salons\/[^/]+(?:\/services\/[^/]+)?$/.test(pathname);
}

export default function MobileNavIcons() {
  const pathname = usePathname();
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const { showPageLoader } = useNavigationLoading();

  const accountNav = getAccountNavConfig(user);

  if (shouldHideMobileNav(pathname)) {
    return null;
  }

  const isActive = (href: string, match?: (path: string) => boolean) => {
    if (!pathname) {
      return false;
    }

    if (match) {
      return match(pathname);
    }

    if (href === '/') {
      return pathname === '/';
    }

      return pathname.startsWith(href);
  };

  return (
    <nav className={styles.mobileNav} aria-label="Mobile quick navigation">
      {PRIMARY_NAV_LINKS.slice(0, 3).map(({ href, label, icon: Icon, match }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.navItem} ${isActive(href, match) ? styles.active : ''}`}
          onClick={() => showPageLoader()}
        >
          <Icon />
          <span>{label}</span>
        </Link>
      ))}

      {authStatus === 'authenticated' ? (
        <Link
          href="/my-favorites"
          className={`${styles.navItem} ${isActive('/my-favorites') ? styles.active : ''}`}
          onClick={() => showPageLoader()}
        >
          <FaHeart />
          <span>Saved</span>
        </Link>
      ) : (
        <button
          type="button"
          className={styles.navItem}
          onClick={() => openModal('login')}
        >
          <FaHeart />
          <span>Saved</span>
        </button>
      )}

      {authStatus === 'authenticated' ? (
        <Link
          href={accountNav.entryHref}
          className={`${styles.navItem} ${isAccountRoute(pathname) ? styles.active : ''}`}
          onClick={() => showPageLoader()}
        >
          <FaUser />
          <span>{accountNav.entryLabel}</span>
        </Link>
      ) : (
        <button
          type="button"
          className={`${styles.navItem} ${
            isActive('/login') || isActive('/register') ? styles.active : ''
          }`}
          onClick={() => openModal('login')}
        >
          <FaUser />
          <span>Login</span>
        </button>
      )}
    </nav>
  );
}
