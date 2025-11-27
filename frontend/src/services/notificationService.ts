import api from '@/lib/axios';

export const notificationService = {
  getNotifications: async (page = 1, limit = 20, unread = false) => {
    const res = await api.get('/home/notifications', {
      params: { page, limit, unread },
    });
    return res.data;
  },

  markAsRead: async (notificationId: string) => {
    const res = await api.put(`/home/notifications/${notificationId}/read`);
    return res.data;
  },

  markAsUnread: async (notificationId: string) => {
    const res = await api.put(`/home/notifications/${notificationId}/unread`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.put('/home/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (notificationId: string) => {
    const res = await api.delete(`/home/notifications/${notificationId}`);
    return res.data;
  },
};
