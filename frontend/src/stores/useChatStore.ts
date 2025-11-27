import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, Socket } from "socket.io-client"; // Import Socket
import { useAuthStore } from './useAuthStore'; // Import Auth Store để lấy User ID
import type { Conversation, Message, User } from '@/types/modelType';

interface ChatStore {
  // --- State cũ ---
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  typingUsers: Map<string, { userId: string; userName: string }[]>;

  // --- THÊM STATE SOCKET ---
  socket: Socket | null;
  onlineUsers: string[]; // Danh sách ID người đang online

  // --- Actions cũ ---
  setConversations: (conversations: Conversation[]) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  setTypingUser: (conversationId: string, userId: string, userName: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  updateConversationLastMessage: (conversationId: string, message: Message) => void;
  clearMessages: () => void;
  setLoadingConversations: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  addConversation: (conversation: Conversation) => void;
  setOnlineUsers: (userIds: string[]) => void;

  // --- THÊM ACTION SOCKET ---
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      selectedConversation: null,
      messages: [],
      loadingConversations: false,
      loadingMessages: false,
      typingUsers: new Map(),

      // Init Socket State
      socket: null,
      onlineUsers: [],

      // Actions cũ giữ nguyên...
      setConversations: (conversations) => set({ conversations }),
      setSelectedConversation: (conversation) =>
        set((state) => {
          const currentUserId = useAuthStore.getState().user?._id;

          const isDifferentConv = state.selectedConversation?._id !== conversation?._id;

          // Reset unreadCount về 0 khi MỞ conversation MỚI
          if (conversation && currentUserId && isDifferentConv) {
            return {
              selectedConversation: conversation,
              conversations: state.conversations.map((conv) =>
                conv._id === conversation._id
                  ? {
                    ...conv,
                    unreadCounts: {
                      ...conv.unreadCounts,
                      [currentUserId]: 0,
                    },
                  }
                  : conv
              ),
            };
          }

          return { selectedConversation: conversation };
        }),
      setMessages: (messages) => set({ messages }),

      addMessage: (message) =>
        set((state) => {
          // Kiểm tra message đã tồn tại chưa (tránh duplicate khi socket + API response)
          const exists = state.messages.some((msg) => msg._id === message._id);
          if (exists) {
            return state; // Không thay đổi gì
          }

          return {
            messages: [...state.messages, message],
          };
        }),

      updateMessage: (messageId, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId ? { ...msg, ...updates } : msg
          ),
        })),

      removeMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId),
        })),

      updateConversation: (conversationId, updates) =>
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv._id === conversationId ? { ...conv, ...updates } : conv
          ),
        })),

      setTyping: (conversationId, userId, isTyping) =>
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers);
          const currentUsers = newTypingUsers.get(conversationId) || [];

          if (isTyping) {
            if (!currentUsers.find(u => u.userId === userId)) {
              newTypingUsers.set(conversationId, [...currentUsers, { userId, userName: 'User' }]);
            }
          } else {
            newTypingUsers.set(
              conversationId,
              currentUsers.filter((u) => u.userId !== userId)
            );
          }
          return { typingUsers: newTypingUsers };
        }),

      setTypingUser: (conversationId, userId, userName) =>
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers);
          const existingUsers = newTypingUsers.get(conversationId) || [];
          if (!existingUsers.find(u => u.userId === userId)) {
            newTypingUsers.set(conversationId, [...existingUsers, { userId, userName }]);
          }
          return { typingUsers: newTypingUsers };
        }),

      removeTypingUser: (conversationId, userId) =>
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers);
          const existingUsers = newTypingUsers.get(conversationId) || [];
          const filteredUsers = existingUsers.filter(u => u.userId !== userId);
          if (filteredUsers.length > 0) {
            newTypingUsers.set(conversationId, filteredUsers);
          } else {
            newTypingUsers.delete(conversationId);
          }
          return { typingUsers: newTypingUsers };
        }),

      updateConversationLastMessage: (conversationId, message) =>
        set((state) => {
          const currentUserId = useAuthStore.getState().user?._id;
          const isSelectedConv = state.selectedConversation?._id === conversationId;
          const isOwnMessage = message.senderId._id === currentUserId;

          return {
            conversations: state.conversations.map((conv) => {
              if (conv._id !== conversationId) return conv;

              // Tính unreadCount mới
              let newUnreadCount = conv.unreadCounts[currentUserId || ''] || 0;

              // Tăng unreadCount nếu:
              // 1. Không phải tin nhắn của mình
              // 2. Không đang mở conversation đó
              if (!isOwnMessage && !isSelectedConv) {
                newUnreadCount += 1;
              }

              return {
                ...conv,
                lastMessage: {
                  _id: message._id,
                  content: message.content,
                  senderId: message.senderId._id,
                  createdAt: message.createdAt,
                },
                lastMessageAt: message.createdAt,
                unreadCounts: {
                  ...conv.unreadCounts,
                  [currentUserId || '']: newUnreadCount,
                },
              };
            }),
          };
        }),

      clearMessages: () => set({ messages: [] }),
      setLoadingConversations: (loading) => set({ loadingConversations: loading }),
      setLoadingMessages: (loading) => set({ loadingMessages: loading }),
      addConversation: (newConversation) =>
        set((state) => ({
          conversations: [newConversation, ...state.conversations]
          // Nhét vào đầu mảng để nó hiện lên trên cùng
        })),
      setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),

      // --- LOGIC SOCKET MỚI (QUAN TRỌNG) ---
      connectSocket: () => {
        const { user, accessToken } = useAuthStore.getState();
        const { socket } = get();

        if (!user || (socket && socket.connected)) {
          // Logic check user cũ (đã fix ở bước trước)
          if (socket && socket.connected) {
            const socketAuth = socket.auth as { userId?: string };
            if (socketAuth && socketAuth.userId === user?._id) return;
            socket.disconnect();
          } else {
            // Nếu không có user thì return
            if (!user) return;
          }
        }

        // Nếu chưa có user thì thôi
        if (!user) return;

        const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8282";
        const newSocket = io(BASE_URL, {
          auth: { token: accessToken }, // <--- DÒNG CẦN THÊM
          query: { userId: user._id },
          transports: ["websocket"],
        });

        newSocket.connect();
        set({ socket: newSocket });

        // 1. Lắng nghe danh sách Online
        newSocket.on("getOnlineUsers", (userIds: string[]) => {
          set({ onlineUsers: userIds });
        });

        // 2. Lắng nghe Typing
        newSocket.on("user-typing", ({ conversationId, userId }: { conversationId: string, userId: string }) => {
          get().setTyping(conversationId, userId, true);
        });

        newSocket.on("user-stop-typing", ({ conversationId, userId }: { conversationId: string, userId: string }) => {
          get().setTyping(conversationId, userId, false);
        });

        // 3. 🔥 MỚI: Lắng nghe update status realtime để đồng bộ lastSeen
        newSocket.on("user-status-update", ({ userId, status, lastSeen }: { userId: string, status: string, lastSeen: Date }) => {
          set((state) => {
            // 1. Cập nhật danh sách conversations
            const updatedConversations = state.conversations.map((conv) => {
              const updatedParticipants = conv.participants.map((p) => {
                // Check ID an toàn
                const pId = typeof p.userId === 'string' ? p.userId : (p.userId as User)._id;

                // Nếu tìm thấy user cần update và user đó là Object (đã populate)
                if (pId === userId && typeof p.userId !== 'string') {
                  const currentUserObj = p.userId as User;

                  return {
                    ...p,
                    // TypeScript đang đòi userId là string, nhưng ta nhét Object vào -> Ép kiểu để nó im lặng
                    userId: {
                      ...currentUserObj,
                      status: status,
                      lastSeen: lastSeen
                    } as User
                  };
                }
                return p;
              });
              return { ...conv, participants: updatedParticipants };
            }) as Conversation[]; // 🔥 FIX LỖI 2: Ép kiểu kết quả map về Conversation[] để khớp với State

            // 2. Cập nhật selectedConversation (nếu đang mở)
            let updatedSelectedConv = state.selectedConversation;
            if (updatedSelectedConv) {
              // Tìm lại cuộc trò chuyện vừa update trong danh sách mới
              const found = updatedConversations.find(c => c._id === updatedSelectedConv?._id);
              // Vì đã ép kiểu as Conversation[] ở trên nên dòng này sẽ hết lỗi
              if (found) updatedSelectedConv = found;
            }

            return {
              conversations: updatedConversations,
              selectedConversation: updatedSelectedConv
            };
          });
        });
      },

      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
        }
        set({ socket: null, onlineUsers: [] });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        selectedConversation: state.selectedConversation,
      }),
    }
  )
);