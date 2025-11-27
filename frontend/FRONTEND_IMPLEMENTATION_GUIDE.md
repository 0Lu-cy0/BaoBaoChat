# BaoBao Chat App Frontend - Implementation Guide

## 📋 Tổng Quan

Frontend cho BaoBao Chat App sẽ được xây dựng với **React 19**, **TypeScript**, **React Router**, **Zustand**, và **shadcn/ui components**.

**Tech Stack đã có:**
- ✅ React 19.2.0
- ✅ TypeScript 5.9.3
- ✅ React Router 7.9.6
- ✅ Zustand 5.0.8 (state management)
- ✅ Axios 1.13.2 (HTTP client)
- ✅ React Hook Form 7.66.1 + Zod 4.1.12 (form validation)
- ✅ shadcn/ui components (Radix UI + Tailwind CSS)
- ✅ Lucide React 0.554.0 (icons)
- ✅ Sonner 2.0.7 (toast notifications)

---

## 🎯 Roadmap Implementation

### Phase 1: Core UI Setup & Authentication ✅ (Đã có)
- [x] Authentication pages (SignIn, SignUp, ForgotPassword, ResetPassword)
- [x] Profile & Change Password pages
- [x] Auth store với Zustand
- [x] Protected routes
- [x] Basic UI components (Button, Input, Card, Label)

### Phase 2: Chat Interface (Main Focus)
- [ ] Chat Layout với Sidebar + Main Chat Area
- [ ] Conversation List
- [ ] Message List
- [ ] Message Input với emoji picker
- [ ] Online/Offline status indicators
- [ ] Typing indicators
- [ ] Message reactions UI
- [ ] Reply to message UI

### Phase 3: Friends & Search
- [ ] Friend list management
- [ ] Friend request notifications
- [ ] User search interface
- [ ] Add friend dialog

### Phase 4: Group Chat
- [ ] Create group dialog
- [ ] Group settings (rename, add/remove members)
- [ ] Group avatar upload

### Phase 5: Real-time Features
- [ ] Socket.IO integration
- [ ] Real-time message updates
- [ ] Real-time typing indicators
- [ ] Real-time online status
- [ ] Real-time notifications

### Phase 6: Upload & Media
- [ ] Avatar upload
- [ ] Message image upload
- [ ] Image preview & lightbox

### Phase 7: Notifications
- [ ] Notification center
- [ ] Badge counts
- [ ] Toast notifications for real-time events

---

## 🗂️ Cấu Trúc Thư Mục Đề Xuất

```
frontend/src/
├── components/
│   ├── auth/                    # ✅ Đã có
│   │   ├── signin-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   ├── reset-password-form.tsx
│   │   ├── change-password-form.tsx
│   │   ├── update-profile-form.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── chat/                    # 🆕 Cần tạo
│   │   ├── ChatLayout.tsx       # Main layout với sidebar
│   │   ├── ConversationList.tsx # List conversations bên trái
│   │   ├── ConversationItem.tsx # Single conversation item
│   │   ├── ChatHeader.tsx       # Header với avatar, name, status
│   │   ├── MessageList.tsx      # List messages
│   │   ├── MessageItem.tsx      # Single message bubble
│   │   ├── MessageInput.tsx     # Input box với emoji, image
│   │   ├── EmojiPicker.tsx      # Emoji picker
│   │   ├── TypingIndicator.tsx  # "User is typing..."
│   │   ├── MessageReactions.tsx # Reaction emoji display
│   │   └── ReplyPreview.tsx     # Preview when replying
│   │
│   ├── friends/                 # 🆕 Cần tạo
│   │   ├── FriendList.tsx       # List bạn bè
│   │   ├── FriendRequestList.tsx # Lời mời kết bạn
│   │   ├── FriendRequestItem.tsx
│   │   ├── AddFriendDialog.tsx  # Dialog tìm và thêm bạn
│   │   └── UserSearchResult.tsx # Kết quả search user
│   │
│   ├── groups/                  # 🆕 Cần tạo
│   │   ├── CreateGroupDialog.tsx
│   │   ├── GroupSettingsDialog.tsx
│   │   ├── GroupMemberList.tsx
│   │   ├── AddMembersDialog.tsx
│   │   └── GroupAvatarUpload.tsx
│   │
│   ├── notifications/           # 🆕 Cần tạo
│   │   ├── NotificationCenter.tsx
│   │   ├── NotificationItem.tsx
│   │   └── NotificationBadge.tsx
│   │
│   ├── upload/                  # 🆕 Cần tạo
│   │   ├── AvatarUpload.tsx
│   │   ├── ImageUpload.tsx
│   │   └── ImagePreview.tsx
│   │
│   └── ui/                      # ✅ Đã có (shadcn/ui)
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── label.tsx
│       ├── separator.tsx
│       └── field.tsx
│       # 🆕 Cần thêm các components:
│       # - dialog.tsx (cho modals)
│       # - avatar.tsx (hiển thị avatar)
│       # - badge.tsx (notification counts)
│       # - scroll-area.tsx (scrollable lists)
│       # - dropdown-menu.tsx (context menus)
│       # - tooltip.tsx (hover tooltips)
│       # - popover.tsx (emoji picker)
│       # - tabs.tsx (switch between tabs)
│
├── stores/
│   ├── useAuthStore.ts          # ✅ Đã có
│   ├── useChatStore.ts          # 🆕 Messages & conversations
│   ├── useFriendStore.ts        # 🆕 Friends & requests
│   ├── useNotificationStore.ts  # 🆕 Notifications
│   └── useSocketStore.ts        # 🆕 Socket.IO connection
│
├── services/
│   ├── authService.ts           # ✅ Đã có
│   ├── chatService.ts           # 🆕 Messages & conversations API
│   ├── friendService.ts         # 🆕 Friends & requests API
│   ├── uploadService.ts         # 🆕 Upload images API
│   ├── notificationService.ts   # 🆕 Notifications API
│   └── socketService.ts         # 🆕 Socket.IO client
│
├── types/
│   ├── store.ts                 # 🆕 Type definitions for stores
│   ├── api.ts                   # 🆕 API response types
│   ├── models.ts                # 🆕 Data models (User, Message, etc.)
│   └── socket.ts                # 🆕 Socket event types
│
├── hooks/                       # 🆕 Cần tạo
│   ├── useSocket.ts             # Socket.IO connection hook
│   ├── useTyping.ts             # Typing indicator logic
│   ├── useOnlineStatus.ts       # Online status tracking
│   └── useInfiniteScroll.ts     # Pagination for messages
│
├── lib/
│   ├── axios.ts                 # ✅ Đã có
│   └── utils.ts                 # ✅ Đã có
│
└── pages/
    ├── SignInPage.tsx           # ✅ Đã có
    ├── SignUpPage.tsx           # ✅ Đã có
    ├── ForgotPasswordPage.tsx   # ✅ Đã có
    ├── ResetPasswordPage.tsx    # ✅ Đã có
    ├── ChangePasswordPage.tsx   # ✅ Đã có
    ├── ProfilePage.tsx          # ✅ Đã có
    └── ChatAppPage.tsx          # ✅ Đã có (cần refactor)
```

---

## 🎨 UI Components Cần Thêm (shadcn/ui)

Các components này có sẵn trong shadcn/ui, chỉ cần install:

```bash
# Dialog (Modals)
npx shadcn@latest add dialog

# Avatar
npx shadcn@latest add avatar

# Badge (Notification counts)
npx shadcn@latest add badge

# Scroll Area (Scrollable lists)
npx shadcn@latest add scroll-area

# Dropdown Menu (Context menus)
npx shadcn@latest add dropdown-menu

# Tooltip (Hover info)
npx shadcn@latest add tooltip

# Popover (Emoji picker container)
npx shadcn@latest add popover

# Tabs (Switch views)
npx shadcn@latest add tabs

# Textarea (Message input)
npx shadcn@latest add textarea

# Sheet (Slide-in panels)
npx shadcn@latest add sheet

# Command (Search/command palette)
npx shadcn@latest add command

# Alert Dialog (Confirmations)
npx shadcn@latest add alert-dialog
```

---

## 🚀 Phase 2: Chat Interface - Chi Tiết Implementation

### 1. ChatLayout Component

**Mục đích:** Layout chính cho trang chat với sidebar + main area

**Design Reference:** WhatsApp Web / Telegram Web

```
┌─────────────────────────────────────────┐
│  [Avatar] BaoBao Chat    [🔔] [⚙️]      │ ← Header
├────────────┬────────────────────────────┤
│            │                            │
│  Sidebar   │    Main Chat Area          │
│            │                            │
│ [Search]   │  [Chat Header]             │
│            │                            │
│ Conv List  │  [Messages]                │
│   • Conv1  │    Message 1               │
│   • Conv2  │    Message 2               │
│   • Conv3  │    ...                     │
│            │                            │
│            │  [Message Input + Emoji]   │
│            │                            │
└────────────┴────────────────────────────┘
```

**Props:**
```typescript
interface ChatLayoutProps {
  children?: React.ReactNode;
}
```

**Features:**
- Responsive layout (mobile: stack, desktop: side-by-side)
- Sidebar width: 320px (desktop)
- Main area: flex-grow
- Header sticky với notifications badge

---

### 2. ConversationList Component

**Mục đích:** Danh sách conversations bên trái sidebar

**API Endpoint:** `GET /api/conversations`

**Design Elements:**
- Search bar ở top
- Scrollable list
- Each item shows:
  - Avatar (user hoặc group)
  - Name
  - Last message preview
  - Timestamp
  - Unread badge
  - Online status (green dot)

**Zustand Store:**
```typescript
// useChatStore.ts
interface ChatStore {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  
  fetchConversations: () => Promise<void>;
  selectConversation: (id: string) => void;
  updateConversation: (id: string, data: Partial<Conversation>) => void;
}
```

**shadcn components cần:**
- `ScrollArea` - Scrollable list
- `Avatar` - User/group avatars
- `Badge` - Unread count
- `Input` - Search bar

---

### 3. MessageList Component

**Mục đích:** Hiển thị danh sách tin nhắn trong conversation

**API Endpoint:** `GET /api/messages/:conversationId`

**Design:**
- Auto-scroll to bottom khi có tin nhắn mới
- Infinite scroll up để load tin nhắn cũ (pagination)
- Group messages by date
- Show "User is typing..." at bottom

**Message Bubble Design:**
```
Người khác (left-aligned):
┌─────────────────────────┐
│ [Avatar] User Name      │
│ ┌──────────────────┐    │
│ │ Message content  │    │
│ │ with text...     │    │
│ └──────────────────┘    │
│ 10:30 AM  ❤️ 2         │ ← Reactions
└─────────────────────────┘

Của mình (right-aligned):
                    ┌─────────────────────────┐
                    │        You              │
                    │    ┌──────────────────┐ │
                    │    │ Message content  │ │
                    │    │ ...              │ │
                    │    └──────────────────┘ │
                    │  10:32 AM ✓✓  😂 1     │
                    └─────────────────────────┘
```

**Features:**
- Recalled messages show "Message recalled"
- Edited messages show "(edited)"
- Reply preview above message
- Long-press/right-click for context menu (Reply, React, Edit, Recall)

**shadcn components:**
- `ScrollArea` - Scrollable messages
- `Avatar` - User avatars
- `DropdownMenu` - Context menu
- `Popover` - Emoji reactions

---

### 4. MessageInput Component

**Mục đích:** Input box để gửi tin nhắn

**API Endpoint:** `POST /api/messages/send`

**Design:**
```
┌────────────────────────────────────────────┐
│ [📎] [Message input here...]  [😊] [➤]    │
└────────────────────────────────────────────┘
     ↑        ↑                    ↑    ↑
   Upload  Text input           Emoji Send
```

**Features:**
- Upload image button (📎)
- Emoji picker (😊)
- Auto-resize textarea
- Send on Enter (Shift+Enter for new line)
- Show typing indicator to others
- Reply preview (when replying)

**shadcn components:**
- `Textarea` - Multi-line input
- `Popover` - Emoji picker
- `Button` - Send, upload, emoji buttons

---

### 5. EmojiPicker Component

**Mục đích:** Chọn emoji để gửi hoặc react

**Library:** Có thể dùng `emoji-picker-react` hoặc tự build với Unicode emojis

**Install:**
```bash
npm install emoji-picker-react
# hoặc
yarn add emoji-picker-react
```

**Usage:**
```tsx
import EmojiPicker from 'emoji-picker-react';

<Popover>
  <PopoverTrigger>😊</PopoverTrigger>
  <PopoverContent>
    <EmojiPicker onEmojiClick={handleEmojiClick} />
  </PopoverContent>
</Popover>
```

---

### 6. TypingIndicator Component

**Mục đích:** Hiển thị "User is typing..."

**Socket Event:** `user-typing`, `user-stop-typing`

**Design:**
```
┌────────────────────────────────┐
│ [Avatar] John is typing...     │
│          ●●● (animated dots)   │
└────────────────────────────────┘
```

**Logic:**
- Emit `typing` event khi user gõ
- Emit `stop-typing` sau 3 giây không gõ
- Show typing indicator khi nhận `user-typing` event
- Hide khi nhận `user-stop-typing` hoặc timeout

---

### 7. MessageReactions Component

**Mục đích:** Hiển thị reactions dưới message

**API Endpoint:** `POST /api/messages/:messageId/react`

**Design:**
```
Message content here
[❤️ 2] [😂  1] [👍 3] [+]
  ↑                    ↑
Reaction count    Add reaction
```

**Features:**
- Hover to see who reacted
- Click to toggle own reaction
- Click [+] to add new reaction

**shadcn components:**
- `Badge` - Reaction display
- `Tooltip` - Show usernames on hover
- `Popover` - Emoji picker for new reaction

---

### 8. ReplyPreview Component

**Mục đích:** Preview tin nhắn đang reply

**Design:**
```
┌─────────────────────────────────┐
│ ↩️ Replying to John             │
│ "Original message text..."   ❌ │
└─────────────────────────────────┘
      Message input box
```

**State:**
```typescript
const [replyingTo, setReplyingTo] = useState<Message | null>(null);
```

**Features:**
- Show original message preview
- Click ❌ to cancel reply
- Include `replyTo` field when sending message

---

## 🧑‍🤝‍🧑 Phase 3: Friends & Search

### 1. FriendList Component

**API Endpoint:** `GET /api/friends`

**Design:**
```
┌────────────────────────────────┐
│ Friends (24)                   │
│ ─────────────────────────────  │
│ [Avatar] John Doe              │
│          🟢 Online             │
│                                │
│ [Avatar] Jane Smith            │
│          🔴 Offline            │
│                                │
│ ...                            │
└────────────────────────────────┘
```

**Features:**
- Online status indicator
- Last seen timestamp (if offline)
- Click to start conversation

**shadcn components:**
- `ScrollArea`
- `Avatar`
- `Badge` (online/offline status)

---

### 2. AddFriendDialog Component

**API Endpoints:**
- `GET /api/users/search?keyword=abc` - Search users
- `POST /api/friend-requests/send` - Send friend request

**Design:**
```
┌──────────── Add Friend ─────────────┐
│                                     │
│ [Search for users...]               │
│                                     │
│ Results:                            │
│ ─────────────────────────────────   │
│ [Avatar] John Doe                   │
│          @johndoe                   │
│                      [Add Friend]   │
│                                     │
│ [Avatar] Jane Smith                 │
│          @janesmith                 │
│                      [Pending...]   │
│                                     │
└─────────────────────────────────────┘
```

**shadcn components:**
- `Dialog` - Modal
- `Input` - Search box
- `Button` - Send request
- `Avatar`

---

### 3. FriendRequestList Component

**API Endpoints:**
- `GET /api/friend-requests/received` - Incoming requests
- `POST /api/friend-requests/:id/accept` - Accept
- `POST /api/friend-requests/:id/decline` - Decline

**Design:**
```
┌────────────────────────────────┐
│ Friend Requests (3)            │
│ ─────────────────────────────  │
│ [Avatar] John Doe              │
│          wants to be friends   │
│          [Accept] [Decline]    │
│                                │
│ [Avatar] Jane Smith            │
│          wants to be friends   │
│          [Accept] [Decline]    │
└────────────────────────────────┘
```

**shadcn components:**
- `Card` - Request card
- `Button` - Accept/Decline
- `Avatar`

---

## 👥 Phase 4: Group Chat

### 1. CreateGroupDialog Component

**API Endpoint:** `POST /api/conversations/group`

**Design:**
```
┌──────── Create Group Chat ──────────┐
│                                     │
│ Group Name:                         │
│ [Enter group name...]               │
│                                     │
│ Add Members:                        │
│ ─────────────────────────────────   │
│ ☑️ John Doe                         │
│ ☑️ Jane Smith                       │
│ ☐ Mike Johnson                      │
│                                     │
│           [Cancel] [Create]         │
└─────────────────────────────────────┘
```

**shadcn components:**
- `Dialog`
- `Input` - Group name
- `Checkbox` - Select members

---

### 2. GroupSettingsDialog Component

**API Endpoints:**
- `PUT /api/conversations/:id/group-name` - Rename
- `PUT /api/conversations/:id/members` - Add/remove members
- `POST /api/upload/group-avatar` - Upload avatar

**Design:**
```
┌──────── Group Settings ─────────────┐
│                                     │
│        [Group Avatar]               │
│        [Change Photo]               │
│                                     │
│ Group Name:                         │
│ [Family Chat                    ]   │
│                                     │
│ Members (5):                        │
│ ─────────────────────────────────   │
│ [Avatar] John (Admin)               │
│ [Avatar] Jane              [Remove] │
│ [Avatar] Mike              [Remove] │
│                                     │
│ [+ Add Members]                     │
│                                     │
│           [Close] [Save]            │
└─────────────────────────────────────┘
```

**shadcn components:**
- `Dialog`
- `Avatar`
- `Button`
- `Input`

---

## 🔌 Phase 5: Real-time Features (Socket.IO)

### 1. Socket Service Setup

**File:** `services/socketService.ts`

```typescript
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('http://localhost:8282', {
      auth: { token }
    });

    // Event listeners
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Chat events
    this.socket.on('new-message', this.handleNewMessage);
    this.socket.on('message-updated', this.handleMessageUpdated);
    this.socket.on('user-typing', this.handleTyping);
    this.socket.on('user-online', this.handleUserOnline);
    this.socket.on('notification', this.handleNotification);
  }

  disconnect() {
    this.socket?.disconnect();
  }

  // Emit events
  joinConversation(conversationId: string) {
    this.socket?.emit('join-conversation', { conversationId });
  }

  sendTyping(conversationId: string) {
    this.socket?.emit('typing', { conversationId });
  }

  // ... more methods
}

export const socketService = new SocketService();
```

**Install Socket.IO Client:**
```bash
npm install socket.io-client
# hoặc
yarn add socket.io-client
```

---

### 2. useSocket Hook

**File:** `hooks/useSocket.ts`

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { socketService } from '@/services/socketService';

export const useSocket = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const addMessage = useChatStore((s) => s.addMessage);

  useEffect(() => {
    if (accessToken) {
      socketService.connect(accessToken);

      // Cleanup
      return () => {
        socketService.disconnect();
      };
    }
  }, [accessToken]);

  return socketService;
};
```

---

### 3. useTyping Hook

**File:** `hooks/useTyping.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { socketService } from '@/services/socketService';

export const useTyping = (conversationId: string) => {
  const [isTyping, setIsTyping] = useState(false);
  let timeout: NodeJS.Timeout;

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTyping(conversationId);
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setIsTyping(false);
      socketService.sendStopTyping(conversationId);
    }, 3000);
  }, [conversationId, isTyping]);

  useEffect(() => {
    return () => clearTimeout(timeout);
  }, []);

  return { startTyping };
};
```

---

## 📤 Phase 6: Upload & Media

### 1. AvatarUpload Component

**API Endpoint:** `POST /api/upload/avatar`

**Design:**
```
┌─────────────────────┐
│                     │
│   [Current Avatar]  │
│                     │
│   [Change Photo]    │
│                     │
└─────────────────────┘
```

**Features:**
- Preview before upload
- Crop/resize image
- Max 5MB validation

**Library:** `react-image-crop` (optional)

```bash
npm install react-image-crop
```

---

### 2. ImageUpload Component

**API Endpoint:** `POST /api/upload/message-image`

**Features:**
- Drag & drop support
- Preview thumbnail
- Progress bar during upload
- Max 10MB validation

**shadcn components:**
- `Dialog` - Preview
- Custom file input

---

## 🔔 Phase 7: Notifications

### 1. NotificationCenter Component

**API Endpoint:** `GET /api/notifications`

**Design:**
```
┌────────── Notifications ─────────────┐
│                                      │
│ 🔵 John sent you a friend request   │
│    2 minutes ago          [Accept]   │
│                                      │
│ 💬 Jane mentioned you in a group    │
│    1 hour ago                        │
│                                      │
│ ✅ Mike accepted your friend request│
│    Yesterday                         │
│                                      │
│ [Mark all as read]                   │
└──────────────────────────────────────┘
```

**shadcn components:**
- `Sheet` - Slide-in panel
- `Badge` - Unread count in header
- `Button`

---

### 2. NotificationBadge Component

**Mục đích:** Badge hiển thị số thông báo chưa đọc

**Design:**
```
[🔔]  ← No badge if 0
[🔔 3] ← With count
```

**shadcn components:**
- `Badge`

---

## 🗃️ Zustand Stores Chi Tiết

### 1. useChatStore.ts

```typescript
interface ChatStore {
  // State
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  typingUsers: Map<string, string[]>; // conversationId -> userIds

  // Actions
  fetchConversations: () => Promise<void>;
  selectConversation: (id: string) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, imgUrl?: string) => Promise<void>;
  addMessage: (message: Message) => void; // From Socket
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
}
```

---

### 2. useFriendStore.ts

```typescript
interface FriendStore {
  // State
  friends: Friend[];
  friendRequests: FriendRequest[];
  onlineUsers: string[]; // User IDs

  // Actions
  fetchFriends: () => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  setUserOnline: (userId: string) => void; // From Socket
  setUserOffline: (userId: string) => void;
}
```

---

### 3. useNotificationStore.ts

```typescript
interface NotificationStore {
  // State
  notifications: Notification[];
  unreadCount: number;

  // Actions
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void; // From Socket
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}
```

---

## 📦 API Services Chi Tiết

### 1. chatService.ts

```typescript
export const chatService = {
  // Conversations
  getConversations: () => api.get('/conversations'),
  getConversation: (id: string) => api.get(`/conversations/${id}`),
  createDirectConversation: (friendId: string) => 
    api.post(`/conversations/direct/${friendId}`),
  createGroup: (name: string, memberIds: string[]) =>
    api.post('/conversations/group', { groupName: name, memberIds }),
  updateGroupName: (id: string, name: string) =>
    api.put(`/conversations/${id}/group-name`, { groupName: name }),
  addMembers: (id: string, userIds: string[]) =>
    api.put(`/conversations/${id}/members`, { action: 'add', userIds }),
  removeMembers: (id: string, userIds: string[]) =>
    api.put(`/conversations/${id}/members`, { action: 'remove', userIds }),
  markAsRead: (id: string) =>
    api.post(`/conversations/${id}/mark-read`),
  deleteConversation: (id: string) =>
    api.delete(`/conversations/${id}`),

  // Messages
  getMessages: (conversationId: string, page = 1, limit = 50) =>
    api.get(`/messages/${conversationId}`, { params: { page, limit } }),
  sendMessage: (conversationId: string, content?: string, imgUrl?: string, replyTo?: string) =>
    api.post('/messages/send', { conversationId, content, imgUrl, replyTo }),
  editMessage: (messageId: string, content: string) =>
    api.put(`/messages/${messageId}/edit`, { content }),
  recallMessage: (messageId: string) =>
    api.delete(`/messages/${messageId}/recall`),
  reactToMessage: (messageId: string, emoji: string) =>
    api.post(`/messages/${messageId}/react`, { emoji }),
};
```

---

### 2. friendService.ts

```typescript
export const friendService = {
  getFriends: (page = 1, limit = 50) =>
    api.get('/friends', { params: { page, limit } }),
  checkFriendship: (userId: string) =>
    api.get(`/friends/check/${userId}`),
  removeFriend: (friendId: string) =>
    api.delete(`/friends/${friendId}`),

  sendFriendRequest: (receiverId: string) =>
    api.post('/friend-requests/send', { receiverId }),
  getSentRequests: () =>
    api.get('/friend-requests/sent'),
  getReceivedRequests: () =>
    api.get('/friend-requests/received'),
  acceptRequest: (requestId: string) =>
    api.post(`/friend-requests/${requestId}/accept`),
  declineRequest: (requestId: string) =>
    api.post(`/friend-requests/${requestId}/decline`),
  cancelRequest: (requestId: string) =>
    api.delete(`/friend-requests/${requestId}/cancel`),

  searchUsers: (keyword: string) =>
    api.get('/users/search', { params: { keyword } }),
};
```

---

### 3. uploadService.ts

```typescript
export const uploadService = {
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  uploadMessageImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/message-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  uploadGroupAvatar: (groupId: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('groupId', groupId);
    return api.post('/upload/group-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};
```

---

### 4. notificationService.ts

```typescript
export const notificationService = {
  getNotifications: (page = 1, limit = 20, unread = false) =>
    api.get('/notifications', { params: { page, limit, unread } }),
  
  markAsRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`),
  
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
  
  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),
};
```

---

## 🎨 Design System & Color Scheme

### Tailwind Colors (đã có trong shadcn/ui)

```css
/* Primary colors */
--primary: hsl(var(--primary));
--primary-foreground: hsl(var(--primary-foreground));

/* Neutral colors */
--background: hsl(var(--background));
--foreground: hsl(var(--foreground));
--muted: hsl(var(--muted));
--muted-foreground: hsl(var(--muted-foreground));

/* Status colors */
--destructive: hsl(var(--destructive)); /* Red for delete */
--success: hsl(142, 76%, 36%); /* Green for online */
--warning: hsl(38, 92%, 50%); /* Yellow for pending */
```

### Custom Colors for Chat

```typescript
// Message bubbles
const messageColors = {
  sent: 'bg-blue-500 text-white', // Tin nhắn của mình
  received: 'bg-gray-200 text-gray-900', // Tin nhắn người khác
  recalled: 'bg-gray-100 text-gray-500 italic', // Tin nhắn thu hồi
};

// Status indicators
const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
};
```

---

## 📱 Responsive Design

### Breakpoints

```typescript
// Tailwind breakpoints (default)
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop small
xl: 1280px  // Desktop large
2xl: 1536px // Desktop XL
```

### Layout Rules

**Mobile (<768px):**
- Full screen conversation list
- Click conversation → Full screen chat
- Back button to return to list

**Tablet (768px - 1024px):**
- Collapsible sidebar
- Main chat always visible

**Desktop (>1024px):**
- Sidebar + Main chat side by side
- Sidebar: 320px width
- Main: flex-grow

---

## 🔐 Authentication Flow trong Chat

### 1. App Initialization
```typescript
// App.tsx
useEffect(() => {
  const initializeApp = async () => {
    // 1. Try refresh token
    const success = await authStore.refresh();
    
    if (success) {
      // 2. Connect Socket.IO
      socketService.connect(authStore.accessToken);
      
      // 3. Fetch initial data
      await Promise.all([
        chatStore.fetchConversations(),
        friendStore.fetchFriends(),
        notificationStore.fetchNotifications(),
      ]);
    }
  };
  
  initializeApp();
}, []);
```

### 2. Token Refresh Logic
```typescript
// lib/axios.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired → Refresh
      const success = await authStore.refresh();
      
      if (success) {
        // Retry original request
        return api.request(error.config);
      } else {
        // Redirect to login
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🧪 Testing Strategy

### 1. Component Testing (Optional)
```bash
npm install -D vitest @testing-library/react @testing-library/user-event
```

### 2. E2E Testing (Optional)
```bash
npm install -D playwright
```

---

## 📊 Performance Optimization

### 1. Message Virtualization
Với hàng nghìn tin nhắn, dùng virtualization:

```bash
npm install react-virtual
```

```typescript
import { useVirtual } from 'react-virtual';

// Chỉ render messages trong viewport
const rowVirtualizer = useVirtual({
  size: messages.length,
  parentRef: scrollRef,
  estimateSize: useCallback(() => 80, []), // Estimate message height
});
```

### 2. Image Lazy Loading

```tsx
<img 
  src={imageUrl} 
  loading="lazy" 
  alt="Message image"
/>
```

### 3. Debounce Search

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (keyword: string) => {
    friendService.searchUsers(keyword);
  },
  500 // 500ms delay
);
```

---

## 🚀 Deployment Checklist

### Environment Variables

```env
VITE_API_URL=https://api.baobao.com
VITE_SOCKET_URL=https://api.baobao.com
```

### Build Command

```bash
npm run build
# Output: dist/
```

### Hosting Options
- **Vercel** (recommended for Vite apps)
- **Netlify**
- **Cloudflare Pages**

---

## 📚 Documentation & References

### shadcn/ui Components
- Docs: https://ui.shadcn.com/docs/components
- Examples: https://ui.shadcn.com/examples

### Socket.IO Client
- Docs: https://socket.io/docs/v4/client-api/

### React Hook Form
- Docs: https://react-hook-form.com/get-started

### Zustand
- Docs: https://zustand-demo.pmnd.rs/

---

## 🎯 Priority Implementation Order

### Week 1: Core Chat UI
1. Install required shadcn components
2. Create ChatLayout component
3. Create ConversationList + ConversationItem
4. Create MessageList + MessageItem
5. Create MessageInput
6. Implement basic send message (API only)

### Week 2: Real-time Features
1. Setup Socket.IO client
2. Implement useSocket hook
3. Handle real-time message events
4. Implement typing indicators
5. Implement online/offline status

### Week 3: Friends & Search
1. Create FriendList component
2. Create AddFriendDialog
3. Create FriendRequestList
4. Implement user search
5. Connect to friend APIs

### Week 4: Advanced Features
1. Message reactions UI
2. Reply to message
3. Edit/Recall messages
4. Image upload
5. Avatar upload

### Week 5: Groups & Notifications
1. Create group chat UI
2. Group settings dialog
3. Notification center
4. Polish & bug fixes

### Week 6: Testing & Deployment
1. Test all features
2. Performance optimization
3. Responsive design tweaks
4. Deploy to production

---

## 💡 Pro Tips

### 1. Component Reusability
Tạo generic components có thể reuse:
```typescript
// GenericList.tsx - Reusable list component
interface GenericListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}
```

### 2. Custom Hooks for Logic
Tách logic ra khỏi components:
```typescript
// useMessageActions.ts
export const useMessageActions = (messageId: string) => {
  const edit = () => { /* ... */ };
  const recall = () => { /* ... */ };
  const react = (emoji: string) => { /* ... */ };
  
  return { edit, recall, react };
};
```

### 3. Error Boundaries
Bắt lỗi trong components:
```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<ErrorFallback />}>
  <ChatApp />
</ErrorBoundary>
```

### 4. Loading States
Luôn có loading UI:
```typescript
{loading && <Skeleton />}
{!loading && data && <Content />}
{!loading && !data && <EmptyState />}
```

---

## 🎓 Learning Resources

- **React 19 Docs:** https://react.dev/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Zustand Guide:** https://docs.pmnd.rs/zustand/getting-started/introduction
- **Socket.IO Tutorial:** https://socket.io/get-started/chat

---

**Prepared by:** AI Assistant  
**Date:** November 2025  
**Version:** 1.0.0

---

## 📌 Next Steps

1. **Install missing shadcn components** (dialog, avatar, badge, etc.)
2. **Create folder structure** cho components mới
3. **Implement ChatLayout** làm nền tảng
4. **Build ConversationList** và test với API
5. **Implement MessageList** với pagination
6. **Add Socket.IO** cho real-time

**Hãy bắt đầu từ Phase 2: Chat Interface!** 🚀
