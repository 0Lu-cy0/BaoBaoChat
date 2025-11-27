import api from '@/lib/axios';

export const uploadService = {
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await api.post('/home/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  uploadMessageImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await api.post('/home/upload/message-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  uploadGroupAvatar: async (conversationId: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('conversationId', conversationId);

    const res = await api.post('/home/upload/group-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};