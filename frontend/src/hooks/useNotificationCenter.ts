'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Notification, PaginatedNotifications } from '@/types';
import { logger } from '@/lib/logger';
import { toFriendlyMessage } from '@/lib/errors';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';

const NOTIFICATIONS_CACHE_KEY = 'nav-notifications-cache';
const NOTIFICATIONS_PAGE_SIZE = 10;

export type NotificationViewFilter = 'all' | 'unread';

export function useNotificationCenter() {
  const { authStatus, user } = useAuth();
  const socket = useSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCountState, setUnreadCountState] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewFilter, setViewFilter] = useState<NotificationViewFilter>('all');

  const updateNotificationsCache = useCallback((items: Notification[], unread: number, cursor: string | null, userId?: string) => {
    if (typeof window === 'undefined' || !userId) {
      return;
    }

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
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const clearNotificationsCache = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || authStatus !== 'authenticated' || !user) {
      return;
    }

    const cached = sessionStorage.getItem(NOTIFICATIONS_CACHE_KEY);
    if (!cached) {
      return;
    }

    try {
      const parsed = JSON.parse(cached) as {
        items?: Notification[];
        unreadCount?: number;
        nextCursor?: string | null;
        userId?: string;
      };

      if (Array.isArray(parsed.items) && parsed.userId === user.id) {
        setNotifications(parsed.items);
        setUnreadCountState(parsed.unreadCount ?? 0);
        setNextCursor(parsed.nextCursor ?? null);
      } else {
        clearNotificationsCache();
      }
    } catch {
      clearNotificationsCache();
    }
  }, [authStatus, clearNotificationsCache, user]);

  const fetchNotifications = useCallback(
    async (options?: { cursor?: string; append?: boolean }) => {
      if (authStatus !== 'authenticated') {
        return;
      }

      if (options?.append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingNotifications(true);
      }

      try {
        const params = new URLSearchParams({ limit: NOTIFICATIONS_PAGE_SIZE.toString() });
        if (options?.cursor) {
          params.append('cursor', options.cursor);
        }

        const res = await fetch(`/api/notifications?${params.toString()}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          if (res.status === 401) {
            setNotifications([]);
            setUnreadCountState(0);
            setNextCursor(null);
            return;
          }

          throw new Error(`Failed to fetch notifications: ${res.status}`);
        }

        const payload: PaginatedNotifications = await res.json();
        let nextItems: Notification[] = [];

        setNotifications((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const incoming = options?.append
            ? payload.items.filter((item) => !existingIds.has(item.id))
            : payload.items;

          nextItems = options?.append ? [...prev, ...incoming] : payload.items;
          return nextItems;
        });

        const unreadValue = payload.unreadCount ?? nextItems.filter((item) => !item.isRead).length;
        setUnreadCountState(unreadValue);
        setNextCursor(payload.nextCursor ?? null);
        updateNotificationsCache(nextItems, unreadValue, payload.nextCursor ?? null, user?.id);
      } catch (error) {
        logger.error('Failed to load notifications', error);
        toast.error(toFriendlyMessage(error, 'Failed to load notifications.'));
      } finally {
        setIsLoadingNotifications(false);
        setIsLoadingMore(false);
      }
    },
    [authStatus, updateNotificationsCache, user?.id],
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      setNotifications([]);
      setUnreadCountState(0);
      setNextCursor(null);
      clearNotificationsCache();
    }
  }, [authStatus, clearNotificationsCache]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handler = (newNotification: Notification) => {
      setUnreadCountState((count) => count + 1);
      setNotifications((prev) => [newNotification, ...prev]);
    };

    socket.on('newNotification', handler);
    return () => {
      socket.off('newNotification', handler);
    };
  }, [socket]);

  const markNotificationRead = useCallback(async (notification: Notification) => {
    if (notification.isRead) {
      return;
    }

    await fetch(`/api/notifications/${notification.id}/read`, {
      method: 'PATCH',
      credentials: 'include',
    });

    let updatedItems: Notification[] = [];
    setNotifications((prev) => {
      updatedItems = prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item));
      return updatedItems;
    });

    const nextUnread = updatedItems.filter((item) => !item.isRead).length;
    setUnreadCountState(nextUnread);
    updateNotificationsCache(updatedItems, nextUnread, nextCursor, user?.id);
  }, [nextCursor, updateNotificationsCache, user?.id]);

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    try {
      await markNotificationRead(notification);
      return notification.link ?? null;
    } catch (error) {
      logger.error('Failed to update notification', error);
      toast.error(toFriendlyMessage(error, 'Failed to update notification.'));
      return null;
    }
  }, [markNotificationRead]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include',
      });

      let nextItems: Notification[] = [];
      setNotifications((prev) => {
        nextItems = prev.map((item) => ({ ...item, isRead: true }));
        return nextItems;
      });
      setUnreadCountState(0);
      updateNotificationsCache(nextItems, 0, nextCursor, user?.id);
    } catch (error) {
      logger.error('Failed to mark notifications as read', error);
      toast.error(toFriendlyMessage(error, 'Failed to mark notifications as read.'));
    }
  }, [nextCursor, updateNotificationsCache, user?.id]);

  const handleClearNotifications = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        credentials: 'include',
      });
      setNotifications([]);
      setNextCursor(null);
      setUnreadCountState(0);
      clearNotificationsCache();
    } catch (error) {
      logger.error('Failed to clear notifications', error);
      toast.error(toFriendlyMessage(error, 'Failed to clear notifications.'));
    }
  }, [clearNotificationsCache]);

  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      let nextItems: Notification[] = [];
      setNotifications((prev) => {
        nextItems = prev.filter((item) => item.id !== notificationId);
        return nextItems;
      });

      const nextUnread = nextItems.filter((item) => !item.isRead).length;
      setUnreadCountState(nextUnread);
      updateNotificationsCache(nextItems, nextUnread, nextCursor, user?.id);
    } catch (error) {
      logger.error('Failed to delete notification', error);
      toast.error(toFriendlyMessage(error, 'Failed to delete notification.'));
    }
  }, [nextCursor, updateNotificationsCache, user?.id]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    await fetchNotifications({ cursor: nextCursor, append: true });
  }, [fetchNotifications, isLoadingMore, nextCursor]);

  const unreadCount = unreadCountState ?? notifications.filter((item) => !item.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (viewFilter === 'unread') {
      return notifications.filter((item) => !item.isRead);
    }
    return notifications;
  }, [notifications, viewFilter]);

  return {
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
  };
}
