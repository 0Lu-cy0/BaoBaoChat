import api from '@/lib/axios';

export const chatService = {
  // Conversations
  getConversations: async (params?: { search?: string }) => {
    const res = await api.get('/home/conversations', { params });
    return res.data;
  },

  getConversation: async (id: string) => {
    const res = await api.get(`/home/conversations/${id}`);
    return res.data;
  },

  createDirectConversation: async (friendId: string) => {
    const res = await api.post(`/home/conversations/direct`, { userId: friendId });
    return res.data;
  },

  createGroup: async (groupName: string, participantIds: string[], groupAvatarUrl?: string) => {
    const res = await api.post('/home/conversations/group', { name: groupName, participantIds, groupAvatarUrl });
    return res.data;
  },

  updateGroupName: async (id: string, groupName: string) => {
    const res = await api.put(`/home/conversations/${id}/group-name`, { name: groupName });
    return res.data;
  },

  addMembers: async (id: string, userIds: string[]) => {
    const res = await api.put(`/home/conversations/${id}/members`, {
      action: 'add',
      userIds: userIds,
    });
    return res.data;
  },

  removeMembers: async (id: string, userIds: string[]) => {
    const res = await api.put(`/home/conversations/${id}/members`, {
      action: 'remove',
      userIds: userIds,
    });
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await api.post(`/home/conversations/${id}/mark-read`);
    return res.data;
  },

  deleteConversation: async (id: string) => {
    const res = await api.delete(`/home/conversations/${id}`);
    return res.data;
  },

  // Messages
  getMessages: async (conversationId: string, page = 1, limit = 50, before?: string) => {
    const res = await api.get(`/home/messages/${conversationId}`, {
      params: { page, limit, before },
    });
    return res.data;
  },

  sendMessage: async (
    conversationId: string,
    content?: string,
    imgUrl?: string,
    replyTo?: string
  ) => {
    const res = await api.post('/home/messages/send', {
      conversationId,
      content,
      imgUrl,
      replyTo,
    });
    return res.data;
  },

  editMessage: async (messageId: string, content: string) => {
    const res = await api.put(`/home/messages/${messageId}/edit`, { content });
    return res.data;
  },

  recallMessage: async (messageId: string) => {
    const res = await api.delete(`/home/messages/${messageId}/recall`);
    return res.data;
  },

  reactToMessage: async (messageId: string, emoji: string) => {
    const res = await api.post(`/home/messages/${messageId}/react`, { emoji });
    return res.data;
  },

  // Search messages
  searchMessages: async (query: string) => {
    const res = await api.get('/home/messages/search', { params: { q: query } });
    return res.data;
  },
};
