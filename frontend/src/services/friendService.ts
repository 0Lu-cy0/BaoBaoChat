import api from '@/lib/axios';

export const friendService = {
  // Friends
  getFriends: async (page = 1, limit = 50) => {
    const res = await api.get('/home/friends', { params: { page, limit } });
    return res.data;
  },

  checkFriendship: async (userId: string) => {
    const res = await api.get(`/home/friends/check/${userId}`);
    return res.data;
  },

  removeFriend: async (friendId: string) => {
    const res = await api.delete(`/home/friends/${friendId}`);
    return res.data;
  },

  // Friend Requests
  sendFriendRequest: async (receiverId: string) => {
    const res = await api.post('/home/friend-requests/send', { toUserId: receiverId });
    return res.data;
  },

  getSentRequests: async () => {
    const res = await api.get('/home/friend-requests/sent');
    return res.data;
  },

  getReceivedRequests: async () => {
    const res = await api.get('/home/friend-requests/received');
    return res.data;
  },

  acceptRequest: async (requestId: string) => {
    const res = await api.post(`/home/friend-requests/${requestId}/accept`);
    return res.data;
  },

  declineRequest: async (requestId: string) => {
    const res = await api.post(`/home/friend-requests/${requestId}/decline`);
    return res.data;
  },

  cancelRequest: async (requestId: string) => {
    const res = await api.delete(`/home/friend-requests/${requestId}/cancel`);
    return res.data;
  },

  // User Search
  searchUsers: async (keyword: string) => {
    const res = await api.get('/home/users/search', { params: { q: keyword } });
    return res.data;
  },

  getUserById: async (userId: string) => {
    const res = await api.get(`/home/users/${userId}`);
    return res.data;
  },
};
