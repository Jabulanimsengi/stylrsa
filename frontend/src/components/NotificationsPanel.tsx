'use client';

import { Notification } from '@/types';
import { FaTrashAlt } from 'react-icons/fa';
import styles from './NotificationsPanel.module.css';

interface NotificationsPanelProps {
  notifications: Notification[];
  filteredNotifications: Notification[];
  unreadCount: number;
  isLoadingNotifications: boolean;
  isLoadingMore?: boolean;
  nextCursor?: string | null;
  viewFilter: 'all' | 'unread';
  onViewFilterChange: (view: 'all' | 'unread') => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onLoadMore?: () => void;
  className?: string;
}

function formatTimestamp(isoDate: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch {
    return '';
  }
}

export default function NotificationsPanel({
  notifications,
  filteredNotifications,
  unreadCount,
  isLoadingNotifications,
  isLoadingMore = false,
  nextCursor = null,
  viewFilter,
  onViewFilterChange,
  onNotificationClick,
  onMarkAllRead,
  onClearNotifications,
  onDeleteNotification,
  onLoadMore,
  className,
}: NotificationsPanelProps) {
  return (
    <div className={`${styles.panel} ${className ?? ''}`.trim()}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Notifications</h3>
        </div>
        {notifications.length > 0 && (
          <div className={styles.headerActions}>
            <button type="button" className={styles.actionButton} onClick={onMarkAllRead}>
              Mark read
            </button>
            <button type="button" className={styles.actionButton} onClick={onClearNotifications}>
              Clear
            </button>
          </div>
        )}
      </div>

      <div className={styles.filters}>
        <button
          type="button"
          className={`${styles.filterButton} ${viewFilter === 'all' ? styles.filterButtonActive : ''}`}
          onClick={() => onViewFilterChange('all')}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          className={`${styles.filterButton} ${viewFilter === 'unread' ? styles.filterButtonActive : ''}`}
          onClick={() => onViewFilterChange('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className={styles.list}>
        {isLoadingNotifications ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={styles.loadingItem}>
              <div className="skeleton" style={{ height: '1rem', width: '72%' }} />
              <div className="skeleton" style={{ height: '0.85rem', width: '38%' }} />
            </div>
          ))
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`${styles.item} ${!notification.isRead ? styles.itemUnread : ''}`}
            >
              <button
                type="button"
                onClick={() => onNotificationClick(notification)}
                className={styles.itemButton}
              >
                <span className={styles.message}>{notification.message}</span>
                <span className={styles.meta}>{formatTimestamp(notification.createdAt)}</span>
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                aria-label="Delete notification"
                onClick={() => onDeleteNotification(notification.id)}
              >
                <FaTrashAlt />
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No notifications yet.</div>
        )}
      </div>

      {viewFilter === 'all' && nextCursor && onLoadMore && (
        <button
          type="button"
          className={styles.loadMoreButton}
          onClick={onLoadMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? 'Loading...' : 'Load older notifications'}
        </button>
      )}
    </div>
  );
}
