import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/stores/useChatStore'; // 🔥 IMPORT STORE VÀO ĐÂY

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket) {
      if (this.socket.connected) {
        console.log('✅ Socket already connected, skipping');
      } else {
        console.log('⏳ Socket is connecting...');
      }
      return;
    }

    console.log('🔌 Connecting socket to:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // --- Connection Events ---
    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully!');
      console.log('   Socket ID:', this.socket?.id);
      this.reconnectAttempts = 0;

      // Update socket instance vào store (nếu cần dùng ở chỗ khác)
      useChatStore.setState({ socket: this.socket });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      // Xóa danh sách online khi mất kết nối để UI cập nhật về offline
      useChatStore.setState({ onlineUsers: [] });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('💀 Max reconnection attempts reached - giving up');
        this.disconnect();
      }
    });

    // --- 🔥 FIX QUAN TRỌNG: LẮNG NGHE SỰ KIỆN TỪ SERVER & UPDATE STORE ---

    // 1. Nhận danh sách Online Users -> Đẩy thẳng vào Store
    this.socket.on('getOnlineUsers', (userIds: string[]) => {
      console.log('👥 Received Online Users:', userIds);
      useChatStore.getState().setOnlineUsers(userIds);
    });

    // 2. Nhận tín hiệu Typing -> Gọi Action trong Store
    this.socket.on('user-typing', ({ conversationId, userId }) => {
      useChatStore.getState().setTyping(conversationId, userId, true);
    });

    this.socket.on('user-stop-typing', ({ conversationId, userId }) => {
      useChatStore.getState().setTyping(conversationId, userId, false);
    });

    // 3. Nhận tin nhắn mới (Cập nhật unread count realtime nếu cần)
    // (Logic này tùy chọn, nhưng tốt nhất nên có để đồng bộ data)
    this.socket.on('new-message', ({ message }) => {
      const store = useChatStore.getState();
      // Nếu tin nhắn thuộc conversation đang mở -> thêm vào list messages
      if (store.selectedConversation?._id === message.conversationId) {
        store.addMessage(message);
      }
      // Luôn update lastMessage ở sidebar
      store.updateConversationLastMessage(message.conversationId, message);
    });

    // 4. Nhận nhóm mới tạo (Fix lỗi phải F5 mới thấy nhóm)
    this.socket.on('new-conversation', (conversation) => {
      useChatStore.getState().addConversation(conversation);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected manually');

      // Reset store state
      useChatStore.setState({ socket: null, onlineUsers: [] });
    }
  }

  // Wrapper methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  // Specific Actions
  sendMessage(data: { conversationId: string; content: string; imgUrl?: string }) {
    this.emit('send_message', data);
  }

  joinConversation(conversationId: string) {
    this.emit('join-conversation', { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.emit('leave-conversation', { conversationId });
  }

  startTyping(conversationId: string) {
    this.emit('typing', { conversationId });
  }

  stopTyping(conversationId: string) {
    this.emit('stop-typing', { conversationId });
  }

  sendFriendRequest(receiverId: string) {
    this.emit('send_friend_request', { receiverId });
  }

  acceptFriendRequest(requestId: string) {
    this.emit('accept_friend_request', { requestId });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();