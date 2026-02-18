// Niumba - Notifications Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  subscribeToNotifications,
  type Notification,
} from '../services/notificationService';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useNotifications = (options: {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
} = {}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(options.page || 0);

  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadNotifications = useCallback(async (reset: boolean = false) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const currentPage = reset ? 0 : page;
      const { data, count } = await getUserNotifications(user.id, {
        ...options,
        page: currentPage,
      });

      if (reset) {
        setNotifications(data);
        setPage(0);
      } else {
        setNotifications((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === (options.pageSize || 20) && (count || 0) > (currentPage + 1) * (options.pageSize || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [user, options, page]);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const count = await getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  }, [user]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadNotifications(false);
    }
  }, [loading, hasMore, loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return false;

    try {
      const success = await markNotificationAsRead(notificationId, user.id);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return false;

    try {
      const success = await markAllNotificationsAsRead(user.id);
      if (success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  }, [user]);

  const remove = useCallback(async (notificationId: string) => {
    if (!user) return false;

    try {
      const success = await deleteNotification(notificationId, user.id);
      if (success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        // Update unread count if notification was unread
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  }, [user, notifications]);

  const removeAll = useCallback(async () => {
    if (!user) return false;

    try {
      const success = await deleteAllNotifications(user.id);
      if (success) {
        setNotifications([]);
        setUnreadCount(0);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  }, [user]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!user) return;

    // Cleanup previous subscription
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = subscribeToNotifications(user.id, (notification) => {
      setNotifications((prev) => {
        // Avoid duplicates
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Load notifications and unread count on mount
  useEffect(() => {
    if (user) {
      loadNotifications(true);
      loadUnreadCount();
    }
  }, [user, loadNotifications, loadUnreadCount]);

  // Refresh unread count periodically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    remove,
    removeAll,
    loadMore,
    refresh: () => {
      setPage(0);
      loadNotifications(true);
      loadUnreadCount();
    },
  };
};

export default useNotifications;



