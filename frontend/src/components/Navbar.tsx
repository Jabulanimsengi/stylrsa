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
  FaMapMarkedAlt,
} from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import styles from './Navbar.module.css';
import { Sheet, SheetContent, SheetHeader, SheetBody, SheetTitle } from './ui';
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
import SalonMapModal from './SalonMapView/SalonMapModal';
import usePortalHost from '@/hooks/usePortalHost';

export default function Navbar() {
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const { showPageLoader } = useNavigationLoading();
  const accountNav = getAccountNavConfig(user);

  const [hasMounted, setHasMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [hasPrefetchedRoutes, setHasPrefetchedRoutes] = useState(false);
  const [isSalonMapOpen, setIsSalonMapOpen] = useState(false);
  const portalHost = usePortalHost();

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
    handleDeleteNotification,
    handleLoadMore,
  } = useNotificationCenter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

    return (
      <Link
        href={link.href}
        className={cls}
        onClick={() => {
          setIsMobileOpen(false);
          showPageLoader();
        }}
      >
        <span className={styles.navLabel}>{link.label}</span>
      </Link>
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
      onDeleteNotification={handleDeleteNotification}
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
      ? portalHost
        ? createPortal(
            <div ref={notificationsPortalRef} className={`${styles.notificationsPanel} ${styles.notificationsPortalPanel}`}>
              {notificationPanelBody}
            </div>,
            portalHost,
          )
        : null
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

  const mobileMenuSections = [
    { title: 'Explore', links: PRIMARY_NAV_LINKS, delay: 0 },
    ...(COMPANY_NAV_LINKS.length > 0 ? [{ title: 'Company', links: COMPANY_NAV_LINKS, delay: 40 }] : []),
  ];
  const quickAccessLinks = accountNav.menuLinks.filter((link) => link.href !== accountNav.primaryLink.href);

  if (!hasMounted) {
    return (
      <header className={styles.mobileBar}>
        <div className={styles.mobileLeading}>
          <button
            type="button"
            className={`iconOnlyButton ${styles.iconOnlyButton} ${styles.hamburgerButton}`}
            aria-label="Toggle navigation"
          >
            <FaBars />
          </button>
        </div>

        <Link
          href="/"
          className={styles.brand}
          aria-label="Stylr SA home"
        >
          <Image src="/logo-transparent.png" alt="Stylr SA" width={124} height={32} priority />
        </Link>

        <div className={styles.mobileTrailing} />
      </header>
    );
  }

  return (
    <>
      <header className={styles.mobileBar}>
        <div className={styles.mobileLeading}>
          <button
            type="button"
            className={`iconOnlyButton ${styles.iconOnlyButton} ${styles.hamburgerButton}`}
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {isMobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <Link
          href="/"
          className={styles.brand}
          onClick={() => setIsMobileOpen(false)}
          aria-label="Stylr SA home"
        >
          <Image src="/logo-transparent.png" alt="Stylr SA" width={124} height={32} priority />
        </Link>

        <div className={styles.mobileTrailing}>
          {authStatus === 'authenticated' && (
            <button
              type="button"
              data-notification-trigger="true"
              className={`iconOnlyButton ${styles.iconOnlyButton} ${styles.notificationButton}`}
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              aria-label="Notifications"
            >
              <FaBell />
              {unreadCount > 0 && <span className={styles.mobileBadge}>{unreadCount}</span>}
            </button>
          )}
        </div>
      </header>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" showCloseButton={true}>
          <SheetHeader>
            <SheetTitle className="sr-only">Mobile navigation menu</SheetTitle>
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
            <div className={styles.mobileMenu}>
              <button
                type="button"
                className={styles.mapFeatureCard}
                onClick={() => {
                  setIsMobileOpen(false);
                  setIsSalonMapOpen(true);
                }}
              >
                <span className={styles.mapFeatureIcon} aria-hidden>
                  <FaMapMarkedAlt />
                </span>
                <span className={styles.mapFeatureCopy}>
                  <strong>Salon Map</strong>
                  <span>Browse approved salon locations across South Africa.</span>
                </span>
              </button>

              {mobileMenuSections.map((section) => (
                <nav
                  key={section.title}
                  className={styles.menuSection}
                  style={{ ['--section-delay' as string]: `${section.delay}ms` }}
                >
                  <p className={styles.sectionLabel}>{section.title}</p>
                  <ul className={styles.navList}>
                    {section.links.map((link, index) => (
                      <li key={link.href} style={{ ['--nav-delay' as string]: `${section.delay + (index * 28)}ms` }}>
                        {renderNavLink(link)}
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}

              {authStatus === 'authenticated' && (
                <div className={styles.menuSection} style={{ ['--section-delay' as string]: '80ms' }}>
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

              {authStatus === 'authenticated' && quickAccessLinks.length > 0 && (
                <nav className={styles.menuSection} style={{ ['--section-delay' as string]: '120ms' }}>
                  <p className={styles.sectionLabel}>Quick access</p>
                  <ul className={styles.navList}>
                    {quickAccessLinks.map((link, index) => (
                      <li key={link.href} style={{ ['--nav-delay' as string]: `${120 + (index * 28)}ms` }}>
                        {renderNavLink(link)}
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {authStatus !== 'authenticated' && (
                <div className={styles.menuSection} style={{ ['--section-delay' as string]: '80ms' }}>
                  <p className={styles.sectionLabel}>Account</p>
                  <div className={styles.guestActions}>
                    <button
                      type="button"
                      className={styles.guestPrimaryAction}
                      onClick={() => {
                        openModal('login');
                        setIsMobileOpen(false);
                      }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className={styles.guestSecondaryAction}
                      onClick={() => {
                        openModal('register');
                        setIsMobileOpen(false);
                      }}
                    >
                      List your salon
                    </button>
                    <button
                      type="button"
                      className={styles.guestTertiaryAction}
                      onClick={() => {
                        openModal('login');
                        setIsMobileOpen(false);
                      }}
                    >
                      Saved salons
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <SalonMapModal isOpen={isSalonMapOpen} onClose={() => setIsSalonMapOpen(false)} />
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
