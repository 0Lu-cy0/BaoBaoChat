import { create } from 'zustand';
import type { Notification } from '@/types/modelType/notification';

interface NotificationStore {
  // State
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAsUnread: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  loading: false,

  // Actions
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    })),

  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAsUnread: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n._id === notificationId);
      const wasRead = notification?.isRead;
      return {
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: false } : n
        ),
        unreadCount: wasRead ? state.unreadCount + 1 : state.unreadCount,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  removeNotification: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n._id === notificationId);
      return {
        notifications: state.notifications.filter((n) => n._id !== notificationId),
        unreadCount: notification && !notification.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  setLoading: (loading) => set({ loading }),
}));
