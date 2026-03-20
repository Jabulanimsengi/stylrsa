'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import {
    FaChevronDown,
    FaBell,
    FaSearch,
    FaUser,
    FaSignOutAlt,
} from 'react-icons/fa';
import styles from './TopNav.module.css';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import { createPortal } from 'react-dom';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { getAccountNavConfig, PRIMARY_NAV_LINKS } from './navigationConfig';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import NotificationsPanel from './NotificationsPanel';
import { useLogoutAction } from '@/hooks/useLogoutAction';
import usePortalHost from '@/hooks/usePortalHost';

export default function TopNav() {
    const { authStatus, user } = useAuth();
    const { openModal } = useAuthModal();
    const router = useRouter();
    const pathname = usePathname();
    const { showPageLoader } = useNavigationLoading();
    const accountNav = getAccountNavConfig(user);

    const [desktopSearchQuery, setDesktopSearchQuery] = useState('');
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const portalHost = usePortalHost();

    const notificationsPortalRef = useRef<HTMLDivElement>(null);
    const bellButtonRef = useRef<HTMLButtonElement>(null);
    const {
        isLogoutModalOpen,
        openLogoutModal,
        closeLogoutModal,
        handleLogout,
    } = useLogoutAction();
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

    const isPrimaryNavActive = useCallback((href: string, match?: (path: string) => boolean) => {
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
    }, [pathname]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            const clickedInsidePortal = notificationsPortalRef.current?.contains(target);
            const clickedBell = bellButtonRef.current?.contains(target);

            if (!clickedInsidePortal && !clickedBell && isNotificationsOpen) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isNotificationsOpen]);

    // Close dropdowns on route change
    useEffect(() => {
        setIsNotificationsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 18);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const notificationsPanel = isNotificationsOpen && portalHost
        ? createPortal(
            <div
                ref={notificationsPortalRef}
                id="topnav-notifications-panel"
                style={{
                    position: 'fixed',
                    top: '80px',
                    right: '24px',
                    zIndex: 1000,
                }}
            >
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
            </div>,
            portalHost
        )
        : null;

    const handleDesktopSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = desktopSearchQuery.trim();
        showPageLoader();
        router.push(value ? `/salons?service=${encodeURIComponent(value)}` : '/salons');
    };

    return (
        <>
            <nav className={`${styles.topNav} ${isScrolled ? styles.topNavScrolled : ''}`} aria-label="Primary">
                <div className={styles.leftSection}>
                    <Link href="/" className={styles.brand}>
                        <Image src="/logo-transparent.png" alt="Stylr SA" width={130} height={34} priority />
                    </Link>

                    <ul className={styles.navLinks}>
                        {PRIMARY_NAV_LINKS.map(({ href, label, icon: Icon, match }) => {
                            const isActive = isPrimaryNavActive(href, match);

                            return (
                                <li key={href} className={styles.navItem}>
                                    <Link
                                        href={href}
                                        className={`${styles.navButton} ${isActive ? styles.activeButton : ''}`}
                                        aria-current={isActive ? 'page' : undefined}
                                        onClick={() => showPageLoader()}
                                    >
                                        <Icon aria-hidden="true" />
                                        <span>{label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <span className={styles.navDivider} aria-hidden="true" />

                    <form className={styles.searchForm} onSubmit={handleDesktopSearch}>
                        <FaSearch className={styles.searchIcon} aria-hidden="true" />
                        <input
                            type="search"
                            value={desktopSearchQuery}
                            onChange={(event) => setDesktopSearchQuery(event.target.value)}
                            className={styles.searchInput}
                            placeholder="Search salons or treatments"
                            aria-label="Search salons or treatments"
                        />
                        <button type="submit" className={styles.searchSubmit}>
                            Search
                        </button>
                    </form>
                </div>

                <div className={styles.rightSection}>
                    {authStatus === 'authenticated' ? (
                        <>
                            <button
                                ref={bellButtonRef}
                                type="button"
                                className={styles.iconButton}
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                aria-label="Notifications"
                                aria-haspopup="dialog"
                                aria-expanded={isNotificationsOpen}
                                aria-controls="topnav-notifications-panel"
                            >
                                <FaBell aria-hidden="true" />
                                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={styles.userButton}
                                        aria-haspopup="menu"
                                        aria-label={`Open account menu for ${user?.firstName || 'user'}`}
                                    >
                                        <div className={styles.avatarPlaceholder}>
                                            {user?.firstName?.[0] || <FaUser aria-hidden="true" />}
                                        </div>
                                        <span className={styles.userName}>{user?.firstName || 'User'}</span>
                                        <FaChevronDown className={styles.chevron} aria-hidden="true" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={8}>
                                    <DropdownMenuLabel className={styles.dropdownLabel}>
                                        <span className={styles.dropdownLabelName}>{user?.firstName || 'Your account'}</span>
                                        <span className={styles.dropdownLabelMeta}>{accountNav.roleLabel}</span>
                                    </DropdownMenuLabel>

                                    <DropdownMenuSeparator />

                                    {accountNav.menuLinks.map(({ href, label, icon: Icon }) => (
                                        <DropdownMenuItem key={href} asChild>
                                            <Link
                                                href={href}
                                                className={styles.dropdownItemLink}
                                                onClick={() => showPageLoader()}
                                            >
                                                <span className={styles.dropdownIcon}><Icon /></span>
                                                <span>{label}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        className={styles.signOutButton}
                                        onClick={openLogoutModal}
                                    >
                                        <span className={styles.dropdownIcon}><FaSignOutAlt /></span>
                                        <span>Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className={styles.authButtons}>
                            <button
                                type="button"
                                className="btn btn-ghost text-sm"
                                onClick={() => openModal('login')}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary text-sm"
                                onClick={() => openModal('register')}
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </nav>

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
