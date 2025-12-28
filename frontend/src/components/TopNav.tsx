'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { useAuthModal } from '@/context/AuthModalContext';
import {
    FaChevronDown,
    FaBell,
    FaUser,
    FaHome,
    FaCut,
    FaMagic,
    FaBoxOpen,
    FaInfoCircle,
    FaDollarSign,
    FaQuestionCircle,
    FaEnvelope,
    FaCalendarCheck,
    FaHeart,
    FaChartLine,
    FaStore,
    FaShieldAlt,
    FaSignOutAlt,
} from 'react-icons/fa';
import { ThemeToggle } from './ThemeToggle';
import styles from './TopNav.module.css';
import { toast } from 'react-toastify';
import { logger } from '@/lib/logger';
import { toFriendlyMessage } from '@/lib/errors';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import { useSocket } from '@/context/SocketContext';
import { Notification, PaginatedNotifications } from '@/types';
import { createPortal } from 'react-dom';
import RequestTop10Button from './RequestTop10/RequestTop10Button';
import { SalonMapButton } from './SalonMapView';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui';

// Notification constants
const NOTIFICATIONS_CACHE_KEY = 'nav-notifications-cache';
const NOTIFICATIONS_PAGE_SIZE = 10;

export default function TopNav() {
    const { authStatus, user, logout } = useAuth();
    const { openModal } = useAuthModal();
    const router = useRouter();
    const pathname = usePathname();
    const socket = useSocket();

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Notifications state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCountState, setUnreadCountState] = useState(0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [viewFilter, setViewFilter] = useState<'all' | 'unread'>('all');

    const notificationsPortalRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }

            // Also handle notification panel closing
            const target = event.target as Node;
            const clickedInsidePortal = notificationsPortalRef.current?.contains(target);
            const clickedBell = (event.target as Element).closest(`.${styles.iconButton}`);

            if (!clickedInsidePortal && !clickedBell && isNotificationsOpen) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isNotificationsOpen]);

    // Close dropdowns on route change
    useEffect(() => {
        setActiveDropdown(null);
        setIsNotificationsOpen(false);
    }, [pathname]);

    const toggleDropdown = (name: string) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const handleLogout = async () => {
        try {
            try { await signOut({ redirect: false }); } catch { }
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            logout();
            toast.success('You have been logged out successfully.');
            router.push('/');
        } catch (error) {
            logger.error('Logout failed:', error);
            toast.error(toFriendlyMessage(error, 'Logout failed. Please try again.'));
        } finally {
            setIsLogoutModalOpen(false);
        }
    };

    // --- Notifications Logic (Simplified from Navbar.tsx) ---

    const updateNotificationsCache = useCallback((items: Notification[], unread: number, cursor: string | null, userId?: string) => {
        if (typeof window === 'undefined' || !userId) return;
        try {
            sessionStorage.setItem(
                NOTIFICATIONS_CACHE_KEY,
                JSON.stringify({
                    items,
                    unreadCount: unread,
                    nextCursor: cursor,
                    timestamp: Date.now(),
                    userId,
                }),
            );
        } catch { }
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (authStatus !== 'authenticated') return;
        setIsLoadingNotifications(true);
        try {
            const res = await fetch(`/api/notifications?limit=${NOTIFICATIONS_PAGE_SIZE}`, { credentials: 'include' });
            if (!res.ok) return;

            const payload: PaginatedNotifications = await res.json();
            setNotifications(payload.items);
            const unread = payload.unreadCount ?? payload.items.filter(n => !n.isRead).length;
            setUnreadCountState(unread);
            setNextCursor(payload.nextCursor ?? null);
            updateNotificationsCache(payload.items, unread, payload.nextCursor ?? null, user?.id);
        } catch (error) {
            logger.error('Failed to load notifications', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    }, [authStatus, updateNotificationsCache, user?.id]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!socket) return;
        const handler = (newNotification: Notification) => {
            setUnreadCountState((count) => count + 1);
            setNotifications((prev) => [newNotification, ...prev]);
        };
        socket.on('newNotification', handler);
        return () => {
            socket.off('newNotification', handler);
        };
    }, [socket]);

    const handleNotificationClick = async (notification: Notification) => {
        try {
            if (!notification.isRead) {
                await fetch(`/api/notifications/${notification.id}/read`, { method: 'PATCH', credentials: 'include' });
                const updated = notifications.map(n => n.id === notification.id ? { ...n, isRead: true } : n);
                setNotifications(updated);
                setUnreadCountState(prev => Math.max(0, prev - 1));
            }
            setIsNotificationsOpen(false);

            if (notification.link) {
                router.push(notification.link);
            }
        } catch (error) {
            logger.error('Failed to handle notification click', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'PATCH', credentials: 'include' });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCountState(0);
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleClearNotifications = async () => {
        try {
            await fetch('/api/notifications', { method: 'DELETE', credentials: 'include' });
            setNotifications([]);
            setUnreadCountState(0);
        } catch (error) {
            toast.error('Failed to clear notifications');
        }
    };

    // --- Render Helpers ---

    const renderDropdownItem = (href: string, label: string, Icon: any, onClick?: () => void) => (
        <Link href={href} className={styles.dropdownItem} onClick={onClick}>
            <span className={styles.dropdownIcon}><Icon /></span>
            <span>{label}</span>
        </Link>
    );

    const notificationsPanel = isNotificationsOpen && createPortal(
        <div ref={notificationsPortalRef} className="notifications-panel-portal" style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            width: '360px',
            maxHeight: '600px',
            background: 'var(--nav-surface-active)',
            border: '1px solid var(--nav-border)',
            borderRadius: '18px',
            boxShadow: '0 20px 40px rgba(10, 15, 30, 0.18)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '1rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>NOTIFICATIONS</h3>
                {notifications.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleMarkAllRead} style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'var(--nav-surface-subtle)', cursor: 'pointer' }}>Mark read</button>
                        <button onClick={handleClearNotifications} style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'var(--nav-surface-subtle)', cursor: 'pointer' }}>Clear</button>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                    onClick={() => setViewFilter('all')}
                    style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: '20px',
                        border: 'none',
                        background: viewFilter === 'all' ? 'var(--color-primary-soft)' : 'var(--nav-surface-subtle)',
                        color: viewFilter === 'all' ? 'var(--color-primary)' : 'var(--nav-text)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                    }}
                >
                    All
                </button>
                <button
                    onClick={() => setViewFilter('unread')}
                    style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: '20px',
                        border: 'none',
                        background: viewFilter === 'unread' ? 'var(--color-primary-soft)' : 'var(--nav-surface-subtle)',
                        color: viewFilter === 'unread' ? 'var(--color-primary)' : 'var(--nav-text)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                    }}
                >
                    Unread
                </button>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px' }}>
                {isLoadingNotifications ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--nav-text-muted)' }}>Loading...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--nav-text-muted)' }}>No notifications</div>
                ) : (
                    notifications
                        .filter(n => viewFilter === 'all' || !n.isRead)
                        .map(n => (
                            <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: n.isRead ? 'transparent' : 'var(--color-primary-soft)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--nav-surface-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--color-primary-soft)'}
                            >
                                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{n.message}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)' }}>
                                    {new Date(n.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>,
        document.body
    );

    return (
        <>
            <nav className={styles.topNav} ref={navRef}>
                <div className={styles.leftSection}>
                    <Link href="/" className={styles.brand}>
                        <Image src="/logo-transparent.png" alt="Stylr SA" width={130} height={34} priority />
                    </Link>

                    <ul className={styles.navLinks}>
                        <li className={styles.navItem}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className={styles.navButton}>
                                        Discover
                                        <FaChevronDown className={styles.chevron} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" sideOffset={8}>
                                    <DropdownMenuItem asChild>
                                        <Link href="/" className={styles.dropdownItemLink}>
                                            <span className={styles.dropdownIcon}><FaHome /></span>
                                            <span>Home Feed</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/salons" className={styles.dropdownItemLink}>
                                            <span className={styles.dropdownIcon}><FaCut /></span>
                                            <span>Salons</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/products" className={styles.dropdownItemLink}>
                                            <span className={styles.dropdownIcon}><FaBoxOpen /></span>
                                            <span>Marketplace</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/promotions" className={styles.dropdownItemLink}>
                                            <span className={styles.dropdownIcon}><FaMagic /></span>
                                            <span>Promotions</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/candidates" className={styles.dropdownItemLink}>
                                            <span className={styles.dropdownIcon}><FaUser /></span>
                                            <span>Find Talent</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </li>



                        <li className={styles.navItem}>
                            <Link href="/about" className={styles.navButton}>
                                About Us
                            </Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link href="/prices" className={styles.navButton}>
                                Pricing
                            </Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link href="/how-it-works" className={styles.navButton}>
                                How It Works
                            </Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link href="/contact" className={styles.navButton}>
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className={styles.rightSection}>
                    <SalonMapButton variant="desktop" />
                    <RequestTop10Button variant="desktop" />
                    <ThemeToggle />

                    {authStatus === 'authenticated' ? (
                        <>
                            <button
                                className={styles.iconButton}
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                aria-label="Notifications"
                            >
                                <FaBell />
                                {unreadCountState > 0 && <span className={styles.badge}>{unreadCountState}</span>}
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className={styles.userButton}>
                                        <div className={styles.avatarPlaceholder}>
                                            {user?.firstName?.[0] || <FaUser />}
                                        </div>
                                        <span className={styles.userName}>{user?.firstName || 'User'}</span>
                                        <FaChevronDown className={styles.chevron} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={8}>
                                    {user?.role === 'SALON_OWNER' && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard" className={styles.dropdownItemLink}>
                                                <span className={styles.dropdownIcon}><FaChartLine /></span>
                                                <span>Salon Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {user?.role === 'PRODUCT_SELLER' && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/product-dashboard" className={styles.dropdownItemLink}>
                                                <span className={styles.dropdownIcon}><FaStore /></span>
                                                <span>Product Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {user?.role === 'ADMIN' && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className={styles.dropdownItemLink}>
                                                <span className={styles.dropdownIcon}><FaShieldAlt /></span>
                                                <span>Admin Console</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem asChild>
                                        <Link href="/my-profile" className={styles.dropdownItemLink}>
                                            <span className={styles.dropdownIcon}><FaUser /></span>
                                            <span>My Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/my-bookings" className={styles.dropdownItemLink}>
                                            <span className={styles.dropdownIcon}><FaCalendarCheck /></span>
                                            <span>My Bookings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/my-favorites" className={styles.dropdownItemLink}>
                                            <span className={styles.dropdownIcon}><FaHeart /></span>
                                            <span>Saved Salons</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        className={styles.signOutButton}
                                        onClick={() => setIsLogoutModalOpen(true)}
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
                                className="btn btn-ghost text-sm"
                                onClick={() => openModal('login')}
                            >
                                Login
                            </button>
                            <button
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
                    onCancel={() => setIsLogoutModalOpen(false)}
                    confirmText="Logout"
                />
            )}
        </>
    );
}
