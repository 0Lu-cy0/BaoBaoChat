import { useEffect } from 'react';
import { socketService } from '@/services/socketService';
import { useChatStore } from '@/stores/useChatStore';
import { useFriendStore } from '@/stores/useFriendStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import type { FriendRequest } from '@/types/modelType';

export const useSocket = () => {
  const user = useAuthStore((s) => s.user);
  const { addMessage, updateMessage, setTypingUser, removeTypingUser, updateConversationLastMessage } = useChatStore();
  const { setUserOnline, setUserOffline, addFriendRequest, removeFriendRequest } = useFriendStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (!token || !user) {
      // Disconnect if no token/user
      socketService.disconnect();
      return;
    }

    // Connect socket (sẽ skip nếu đã connected)
    socketService.connect(token);

    // Message events - Sửa thành "new-message" cho khớp với Backend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('new-message', (data: any) => {
      const { conversationId, message } = data;
      const currentConvId = useChatStore.getState().selectedConversation?._id;

      // CHỈ addMessage nếu tin nhắn thuộc conversation hiện tại
      if (conversationId === currentConvId) {
        addMessage(message);
      }

      // Luôn update lastMessage trong danh sách conversations
      updateConversationLastMessage(conversationId, message);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('message-updated', (data: any) => {
      const { conversationId, message } = data;
      const currentConvId = useChatStore.getState().selectedConversation?._id;

      // CHỈ update nếu message thuộc conversation hiện tại
      if (conversationId === currentConvId) {
        updateMessage(message._id, message);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('message-recalled', (data: any) => {
      const { conversationId, messageId } = data;
      const currentConvId = useChatStore.getState().selectedConversation?._id;

      // CHỈ recall nếu message thuộc conversation hiện tại
      if (conversationId === currentConvId) {
        updateMessage(messageId, { isRecall: true });
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('message_reacted', (data: any) => {
      const message = useChatStore.getState().messages.find(m => m._id === data.messageId);
      if (message) {
        const reactions = message.reactions || [];
        updateMessage(data.messageId, { reactions: [...reactions, data.reaction] });
      }
    });

    // Typing events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('user-typing', (data: any) => {
      setTypingUser(data.conversationId, data.userId, data.userName);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('user-stop-typing', (data: any) => {
      removeTypingUser(data.conversationId, data.userId);
    });

    // Friend events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('friend_request_received', (data: any) => {
      const friendRequest: FriendRequest = {
        _id: data.friendRequest._id,
        from: data.friendRequest.from,
        to: data.friendRequest.to,
        message: data.friendRequest.message,
        createdAt: data.friendRequest.createdAt,
        updatedAt: data.friendRequest.updatedAt,
      };

      addFriendRequest(friendRequest);
      toast.info(`${friendRequest.from.display_name} đã gửi lời mời kết bạn`);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('friend_request_accepted', (data: any) => {
      removeFriendRequest(data.requestId);
      toast.success(`${data.friend.display_name} đã chấp nhận lời mời kết bạn`);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('friend_request_declined', (data: any) => {
      removeFriendRequest(data.requestId);
    });

    // Online status events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('user-online', (data: any) => {
      setUserOnline(data.userId);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('user-offline', (data: any) => {
      setUserOffline(data.userId);
    });

    // Group conversation events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('conversation-updated', (data: any) => {
      const { conversation } = data;

      // Update conversation in store
      const currentConv = useChatStore.getState().selectedConversation;
      if (currentConv?._id === conversation._id) {
        useChatStore.getState().setSelectedConversation(conversation);
      }

      // Update in conversations list
      const convs = useChatStore.getState().conversations;
      const updatedConvs = convs.map(c => c._id === conversation._id ? conversation : c);
      useChatStore.getState().setConversations(updatedConvs);

      // Show toast notification
      if (conversation.type === 'group') {
        toast.info(`Nhóm "${conversation.group?.name}" đã được cập nhật`);
      }
    });

    // Friend request events
    socketService.on('friend-request-cancelled', ({ requestId }: { requestId: string }) => {
      // Remove from received requests (receiver's perspective)
      useFriendStore.getState().removeFriendRequest(requestId);
      toast.info('Một lời mời kết bạn đã bị thu hồi');
    });

    socketService.on('friend-request-declined', ({ requestId }: { requestId: string }) => {
      // Remove from sent requests (sender's perspective)
      useFriendStore.getState().removeFriendRequest(requestId);
      toast.info('Lời mời kết bạn của bạn đã bị từ chối');
    });

    socketService.on('friend-request-accepted', ({ requestId }: { requestId: string }) => {
      // Remove request from both perspectives
      useFriendStore.getState().removeFriendRequest(requestId);
      // Reload friends list will happen via notification
    });

    // Notification events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.on('new_notification', (notification: any) => {
      addNotification(notification);

      // Show toast based on notification type
      switch (notification.type) {
        case 'message':
          toast.info(notification.content);
          break;
        case 'friend_request':
          toast.info(notification.content);
          break;
        case 'friend_accept':
          toast.success(notification.content);
          break;
        case 'group_invite':
          toast.info(notification.content);
          break;
        default:
          toast(notification.content);
      }
    });

    // Cleanup: chỉ remove listeners, không disconnect
    // Socket sẽ được disconnect khi user logout hoặc token null
    return () => {
      // Remove all listeners to prevent memory leaks
      socketService.off('new-message');
      socketService.off('message-updated');
      socketService.off('message-recalled');
      socketService.off('message_reacted');
      socketService.off('user-typing');
      socketService.off('user-stop-typing');
      socketService.off('friend_request_received');
      socketService.off('friend_request_accepted');
      socketService.off('friend_request_declined');
      socketService.off('friend-request-cancelled');
      socketService.off('friend-request-declined');
      socketService.off('friend-request-accepted');
      socketService.off('user-online');
      socketService.off('user-offline');
      socketService.off('conversation-updated');
      socketService.off('new_notification');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  return {
    socket: socketService,
    isConnected: socketService.isConnected(),
  };
};
