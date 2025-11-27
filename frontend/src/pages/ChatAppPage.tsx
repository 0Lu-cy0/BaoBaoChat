import { useEffect } from 'react';
import { useLocation } from 'react-router';
import ConversationList from '@/components/chat/ConversationList';
import ChatArea from '@/components/chat/ChatArea';
import { useChatStore } from '@/stores/useChatStore';
import { chatService } from '@/services/chatService';
import { toast } from 'sonner';
import type { Conversation } from '@/types/modelType';

const ChatAppPage = () => {
  const location = useLocation();
  const { setConversations, setLoadingConversations, selectedConversation } =
    useChatStore();

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xử lý khi đến từ thông báo với conversationId
  useEffect(() => {
    const state = location.state as { conversationId?: string } | null;
    if (state?.conversationId) {
      // TODO: Implement selectConversation logic if needed
      // For now, just clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await chatService.getConversations();
      const conversations = data.conversations || [];
      setConversations(conversations);

      // Kiểm tra selectedConversation có tồn tại trong danh sách của user không
      // Nếu không (do persist từ user khác), clear nó đi
      if (selectedConversation) {
        const exists = conversations.some((c: Conversation) => c._id === selectedConversation._id);
        if (!exists) {
          useChatStore.getState().setSelectedConversation(null);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoadingConversations(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-background">
        <ConversationList />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        {selectedConversation ? (
          <ChatArea />
        ) : (
          <div className="flex h-full items-center justify-center bg-transparent">
            <div className="text-center">
              <div className="size-24 mx-auto mb-6 bg-gradient-chat rounded-full flex items-center justify-center shadow-glow pulse-ring">
                <span className="text-3xl">💬</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-chat bg-clip-text text-transparent">
                Chào mừng bạn đến với BaoBao!
              </h2>
              <p className="text-muted-foreground">Chọn một cuộc hội thoại để bắt đầu chat!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatAppPage;