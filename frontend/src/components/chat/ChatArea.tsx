import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { chatService } from '@/services/chatService';
import { socketService } from '@/services/socketService';
import { toast } from 'sonner';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatArea = () => {
  const { selectedConversation, messages, setMessages, setLoadingMessages, clearMessages } =
    useChatStore();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (selectedConversation) {
      loadInitialMessages();
      // Join conversation room để nhận realtime messages
      socketService.joinConversation(selectedConversation._id);
    } else {
      clearMessages();
      setHasMore(true);
    }

    // Cleanup: Leave conversation khi unmount hoặc đổi conversation
    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation._id);
      }
    };
  }, [selectedConversation?._id]);

  // Load tin nhắn ban đầu (30 tin mới nhất)
  const loadInitialMessages = async () => {
    if (!selectedConversation) return;

    try {
      setLoadingMessages(true);
      const data = await chatService.getMessages(selectedConversation._id, 1, 30);
      // Reverse để tin cũ lên trên, tin mới xuống dưới
      const reversedMessages = (data.messages || []).reverse();
      setMessages(reversedMessages);

      // Check nếu số tin nhắn < 30 thì không còn tin cũ để tải
      setHasMore(data.messages?.length === 30);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      // Nếu 403 (không có quyền), clear selectedConversation
      if (error?.response?.status === 403) {
        useChatStore.getState().setSelectedConversation(null);
        toast.error('Bạn không có quyền truy cập cuộc trò chuyện này');
      } else {
        toast.error('Không thể tải tin nhắn');
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Load thêm tin nhắn cũ khi scroll lên trên
  const loadMoreMessages = async () => {
    if (!selectedConversation || !hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const oldestMessage = messages[0];
      if (!oldestMessage) return;

      // Sử dụng before parameter để lấy tin nhắn trước tin nhắn cũ nhất hiện tại
      const data = await chatService.getMessages(
        selectedConversation._id,
        1,
        30,
        oldestMessage._id
      );

      if (data.messages && data.messages.length > 0) {
        // Thêm tin nhắn cũ vào đầu mảng
        const reversedMessages = data.messages.reverse();
        setMessages([...reversedMessages, ...messages]);

        // Nếu số tin < 30 thì hết tin để tải
        setHasMore(data.messages.length === 30);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
      toast.error('Không thể tải thêm tin nhắn');
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (!selectedConversation) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader conversation={selectedConversation} />
      <MessageList
        messages={messages}
        onLoadMore={loadMoreMessages}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
      <MessageInput />
    </div>
  );
};

export default ChatArea;
