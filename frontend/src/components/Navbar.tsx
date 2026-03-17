'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import {
  FaBars,
  FaTimes,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaBuilding,
  FaChevronUp,
  FaChevronDown,
} from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import styles from './Navbar.module.css';
import { Sheet, SheetContent, SheetHeader, SheetBody, SheetFooter } from './ui';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import {
  COMPANY_NAV_LINKS,
  getAccountNavConfig,
  PRIMARY_NAV_LINKS,
  type AppNavLink,
} from './navigationConfig';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import NotificationsPanel from './NotificationsPanel';
import { useLogoutAction } from '@/hooks/useLogoutAction';

export default function Navbar() {
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const { showPageLoader } = useNavigationLoading();
  const accountNav = getAccountNavConfig(user);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [hasPrefetchedRoutes, setHasPrefetchedRoutes] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationsPortalRef = useRef<HTMLDivElement>(null);
  const {
    isLogoutModalOpen,
    openLogoutModal,
    closeLogoutModal,
    handleLogout,
  } = useLogoutAction({
    onAfterLogout: () => setIsMobileOpen(false),
  });

  const {
    notifications,
    filteredNotifications,
    unreadCount,
    nextCursor,
    isLoadingNotifications,
    isLoadingMore,
    viewFilter,
    setViewFilter,
    handleNotificationClick,
    handleMarkAllRead,
    handleClearNotifications,
    handleLoadMore,
  } = useNotificationCenter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideButton = (event.target as Element).closest('[data-notification-trigger="true"]');
      const clickedInsideInlinePanel = notificationsRef.current?.contains(target);
      const clickedInsidePortal = notificationsPortalRef.current?.contains(target);

      if (!clickedInsideButton && !clickedInsideInlinePanel && !clickedInsidePortal) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const update = () => setIsDesktop(typeof window !== 'undefined' ? window.innerWidth > 1024 : false);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if ((!isMobileOpen && !isNotificationsOpen) || authStatus !== 'authenticated' || hasPrefetchedRoutes) {
      return;
    }

    if (typeof router.prefetch !== 'function') {
      return;
    }

    const routes = new Set<string>(accountNav.menuLinks.map((link) => link.href));

    routes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {
        // Ignore prefetch errors.
      }
    });

    setHasPrefetchedRoutes(true);
  }, [accountNav.menuLinks, isMobileOpen, isNotificationsOpen, authStatus, hasPrefetchedRoutes, router]);

  const isLinkActive = (link: AppNavLink) => {
    if (link.match) {
      return link.match(pathname ?? '');
    }

    if (!pathname) {
      return false;
    }

    if (link.href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(link.href);
  };

  const renderNavLink = (link: AppNavLink) => {
    const active = isLinkActive(link);
    const cls = `${styles.navItem} ${active ? styles.navItemActive : ''}`.trim();
    const Icon = link.icon;

    return (
      <li key={link.href}>
        <Link
          href={link.href}
          className={cls}
          onClick={() => {
            setIsMobileOpen(false);
            showPageLoader();
          }}
        >
          <span className={styles.navIcon} aria-hidden>
            <Icon />
          </span>
          <span className={styles.navLabel}>{link.label}</span>
        </Link>
      </li>
    );
  };

  const notificationPanelBody = (
    <NotificationsPanel
      notifications={notifications}
      filteredNotifications={filteredNotifications}
      unreadCount={unreadCount}
      nextCursor={nextCursor}
      isLoadingNotifications={isLoadingNotifications}
      isLoadingMore={isLoadingMore}
      viewFilter={viewFilter}
      onViewFilterChange={setViewFilter}
      onNotificationClick={async (notification) => {
        const link = await handleNotificationClick(notification);
        setIsNotificationsOpen(false);
        if (link) {
          showPageLoader();
          router.push(link);
        }
      }}
      onMarkAllRead={handleMarkAllRead}
      onClearNotifications={handleClearNotifications}
      onLoadMore={handleLoadMore}
    />
  );

  const notificationsButton = (
    <button
      type="button"
      data-notification-trigger="true"
      className={`${styles.navItem} ${styles.navButton}`}
      onClick={() => setIsNotificationsOpen((prev) => !prev)}
    >
      <span className={styles.navIcon} aria-hidden>
        <FaBell />
      </span>
      <span className={styles.navLabel}>Notifications</span>
      {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
    </button>
  );

  const notificationsPanel = isNotificationsOpen
    ? isDesktop
      ? createPortal(
          <div ref={notificationsPortalRef} className={`${styles.notificationsPanel} ${styles.notificationsPortalPanel}`}>
            {notificationPanelBody}
          </div>,
          document.body,
        )
      : (
          <div ref={notificationsRef} className={styles.notificationsPanel}>
            {notificationPanelBody}
          </div>
        )
    : null;

  const signOutButton = (
    <button
      type="button"
      className={`${styles.navItem} ${styles.navButton}`}
      onClick={openLogoutModal}
    >
      <span className={styles.navIcon} aria-hidden>
        <FaSignOutAlt />
      </span>
      <span className={styles.navLabel}>Sign out</span>
    </button>
  );

  const authButtons = (
    <div className={styles.authActions}>
      <button
        type="button"
        className="btn btn-ghost text-sm lowercase"
        onClick={() => {
          openModal('login');
          setIsMobileOpen(false);
        }}
      >
        Login
      </button>
      <button
        type="button"
        className="btn btn-primary text-sm lowercase"
        onClick={() => {
          openModal('register');
          setIsMobileOpen(false);
        }}
      >
        Register
      </button>
    </div>
  );

  return (
    <>
      <header className={styles.mobileBar}>
        <Link
          href="/"
          className={styles.brand}
          onClick={() => setIsMobileOpen(false)}
          aria-label="Stylr SA home"
        >
          <Image src="/logo-transparent.png" alt="Stylr SA" width={124} height={32} priority />
        </Link>

        <div className={styles.mobileActions}>
          {authStatus === 'authenticated' && (
            <button
              type="button"
              data-notification-trigger="true"
              className={`${styles.iconOnlyButton} ${styles.notificationButton}`}
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              aria-label="Notifications"
            >
              <FaBell />
              {unreadCount > 0 && <span className={styles.mobileBadge}>{unreadCount}</span>}
            </button>
          )}

          <button
            type="button"
            className={`${styles.iconOnlyButton} ${styles.hamburgerButton}`}
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {isMobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="right" showCloseButton={true}>
          <SheetHeader>
            <Link
              href="/"
              className={styles.brand}
              onClick={() => setIsMobileOpen(false)}
              aria-label="Stylr SA home"
            >
              <Image src="/logo-transparent.png" alt="Stylr SA" width={140} height={36} priority />
            </Link>
          </SheetHeader>

          <SheetBody>
            <nav>
              <p className={styles.sectionLabel}>Browse</p>
              <ul className={styles.navList}>{PRIMARY_NAV_LINKS.map(renderNavLink)}</ul>
            </nav>

            <div className={styles.companySection}>
              <button
                type="button"
                className={`${styles.sectionLabelButton} ${isCompanyMenuOpen ? styles.sectionLabelButtonOpen : ''}`}
                onClick={() => setIsCompanyMenuOpen((prev) => !prev)}
              >
                <span className={styles.sectionLabelContent}>
                  <FaBuilding className={styles.sectionIcon} />
                  <span>About Stylr SA</span>
                </span>
                <span className={styles.expandIcon}>
                  {isCompanyMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>

              <div className={`${styles.companyMenu} ${isCompanyMenuOpen ? styles.companyMenuOpen : ''}`}>
                <ul className={styles.navList}>{COMPANY_NAV_LINKS.map(renderNavLink)}</ul>
              </div>
            </div>

            {authStatus === 'authenticated' && (
              <div>
                <div className={styles.accountCard}>
                  <div className={styles.accountAvatar} aria-hidden>
                    {user?.firstName?.[0] || <FaUser />}
                  </div>
                  <div className={styles.accountCopy}>
                    <strong>{user?.firstName || 'Your account'}</strong>
                    <span>{accountNav.roleLabel}</span>
                  </div>
                  <Link
                    href={accountNav.primaryLink.href}
                    className={styles.accountShortcut}
                    onClick={() => {
                      setIsMobileOpen(false);
                      showPageLoader();
                    }}
                  >
                    {accountNav.entryLabel}
                  </Link>
                </div>

                <p className={styles.sectionLabel}>{accountNav.menuLabel}</p>
                <div className={styles.supportActions}>
                  <div className={styles.desktopOnlyActions}>{notificationsButton}</div>
                  {signOutButton}
                </div>
              </div>
            )}

            {authStatus === 'authenticated' && accountNav.menuLinks.length > 0 && (
              <nav>
                <p className={styles.sectionLabel}>Quick access</p>
                <ul className={styles.navList}>{accountNav.menuLinks.map(renderNavLink)}</ul>
              </nav>
            )}
          </SheetBody>

          <SheetFooter>{authStatus !== 'authenticated' && authButtons}</SheetFooter>
        </SheetContent>
      </Sheet>

      {notificationsPanel}

      {isLogoutModalOpen && (
        <ConfirmationModal
          message="Are you sure you want to log out?"
          onConfirm={handleLogout}
          onCancel={closeLogoutModal}
          confirmText="Logout"
        />
      )}
    </>
  );
}
