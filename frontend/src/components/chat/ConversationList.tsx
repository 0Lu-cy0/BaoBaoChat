import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConversationItem from './ConversationItem';
import CreateGroupDialog from './CreateGroupDialog';
import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { chatService } from '@/services/chatService';
import { socketService } from '@/services/socketService';
import { toast } from 'sonner';
import type { Conversation, PopulatedConversation, PopulatedParticipant } from '@/types/modelType';

/**
 * Helper: Remove Vietnamese accents
 */
const removeVietnameseAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

/**
 * Helper: Highlight matched text
 */
const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;

  const normalizedText = removeVietnameseAccents(text);
  const normalizedQuery = removeVietnameseAccents(query);

  const index = normalizedText.indexOf(normalizedQuery);
  if (index === -1) return text;

  const matchedText = text.substring(index, index + query.length);
  return (
    <>
      {text.substring(0, index)}
      <strong className="font-bold">{matchedText}</strong>
      {text.substring(index + query.length)}
    </>
  );
};

interface MessageSearchResult {
  conversationId: string;
  conversationName: string;
  conversationAvatar?: string;
  messageId: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

const ConversationList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'contacts' | 'messages'>('contacts');
  const [messageResults, setMessageResults] = useState<MessageSearchResult[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { conversations, setConversations, setSelectedConversation, loadingConversations } = useChatStore();
  const { user } = useAuthStore();

  const loadConversations = useCallback(async (search?: string) => {
    try {
      const params: { search?: string } = {};
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const data = await chatService.getConversations(params);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Không thể tải danh sách cuộc trò chuyện');
    }
  }, [setConversations]);

  const searchMessagesAPI = useCallback(async (query: string) => {
    if (!query.trim()) {
      setMessageResults([]);
      return;
    }

    try {
      setLoadingMessages(true);
      const data = await chatService.searchMessages(query.trim());
      setMessageResults(data.results || []);
    } catch (error) {
      console.error('Failed to search messages:', error);
      toast.error('Không thể tìm kiếm tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Load conversations khi component mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Listen socket events cho realtime updates
  useEffect(() => {
    if (!socketService?.isConnected()) return;

    // Handle tin nhắn mới
    const handleNewMessage = () => {
      if (!searchQuery.trim()) loadConversations();
    };

    // Handle khi mình được add vào nhóm mới (Backend cần emit sự kiện này)
    const handleNewConversation = (newConv: Conversation) => {
      // Dùng hàm addConversation của store để thêm vào list
      useChatStore.getState().addConversation(newConv);
    };

    socketService.on('new-message', handleNewMessage);
    socketService.on('new-conversation', handleNewConversation); // <--- Lắng nghe

    return () => {
      socketService.off('new-message', handleNewMessage);
      socketService.off('new-conversation', handleNewConversation);
    };
  }, [loadConversations, searchQuery]);

  // Debounced search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        loadConversations(searchQuery);
        searchMessagesAPI(searchQuery);
      } else {
        loadConversations();
        setMessageResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, loadConversations, searchMessagesAPI]);

  // Client-side filter for direct chats
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;

    const normalizedQuery = removeVietnameseAccents(searchQuery);

    // For group: already filtered by backend
    if (conv.type === 'group') return true;

    // For direct chat: check participant names (populated by backend)
    const populatedConv = conv as unknown as PopulatedConversation;
    const currentUserId = user?._id;

    const otherParticipant = populatedConv.participants.find(
      (p: PopulatedParticipant) => p.userId._id !== currentUserId
    );

    if (otherParticipant) {
      const normalizedName = removeVietnameseAccents(otherParticipant.userId.display_name || '');
      return normalizedName.includes(normalizedQuery);
    }

    return false;
  });

  const handleMessageClick = async (result: MessageSearchResult) => {
    try {
      const data = await chatService.getConversation(result.conversationId);
      setSelectedConversation(data.conversation);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Không thể mở cuộc trò chuyện');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header with Create Group Button */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Cuộc trò chuyện</h2>
          <CreateGroupDialog />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm cuộc trò chuyện, tin nhắn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs và Results */}
      {searchQuery.trim() ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'contacts' | 'messages')} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="contacts" className="rounded-none">
              Liên hệ ({filteredConversations.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-none">
              Tin nhắn ({messageResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="flex-1 mt-0">
            <ScrollArea className="h-full">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">Đang tìm kiếm...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">Không tìm thấy liên hệ</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => (
                    <ConversationItem key={conversation._id} conversation={conversation} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="messages" className="flex-1 mt-0">
            <ScrollArea className="h-full">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messageResults.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">Không tìm thấy tin nhắn</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {messageResults.map((result) => (
                    <div
                      key={result.messageId}
                      className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleMessageClick(result)}
                    >
                      {/* Avatar */}
                      {result.conversationAvatar ? (
                        <img
                          src={result.conversationAvatar}
                          alt={result.conversationName}
                          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                          {result.conversationName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">{result.conversationName}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.senderName}
                        </p>
                        <p className="text-sm mt-1">
                          {highlightText(result.content, searchQuery)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      ) : (
        <ScrollArea className="flex-1">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Đang tải...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => (
                <ConversationItem key={conversation._id} conversation={conversation} />
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default ConversationList;
