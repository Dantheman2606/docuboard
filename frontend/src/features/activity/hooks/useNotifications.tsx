// features/activity/hooks/useNotifications.tsx
import { useState, useEffect, useCallback } from 'react';
import { api, Notification } from '@/lib/api';
import toast from 'react-hot-toast';

interface UseNotificationsOptions {
  userId: string | null;
  pollInterval?: number; // in milliseconds
}

export function useNotifications({ userId, pollInterval = 30000 }: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getNotifications(userId, { limit: 50 });
      setNotifications(data);
      
      const count = await api.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await api.markAllNotificationsAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  }, [userId]);

  const showNewNotificationToast = useCallback((notification: Notification) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">@</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                  {notification.message}
                </p>
                {notification.metadata.context && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    "{notification.metadata.context}"
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                markAsRead(notification.id);
                toast.dismiss(t.id);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg px-4 py-3 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ),
      {
        duration: 6000,
        position: 'top-right',
      }
    );
  }, [markAsRead]);

  // Poll for new notifications
  useEffect(() => {
    if (!userId || pollInterval <= 0) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollInterval);

    return () => clearInterval(interval);
  }, [userId, pollInterval, fetchNotifications]);

  // Check for new notifications and show toasts
  useEffect(() => {
    if (notifications.length === 0) return;

    const newUnreadNotifications = notifications.filter(
      (n) => !n.read && new Date(n.timestamp).getTime() > Date.now() - pollInterval
    );

    newUnreadNotifications.forEach((notification) => {
      showNewNotificationToast(notification);
    });
  }, [notifications, pollInterval, showNewNotificationToast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
