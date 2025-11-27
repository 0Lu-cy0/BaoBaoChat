# Chat App API Routes - Phân tích và Thiết kế

## 📋 Tổng quan

Dựa trên các models đã tạo (User, Friend, FriendRequest, Conversation, Message), đây là danh sách đầy đủ các API routes cần thiết cho một ứng dụng chat hoàn chỉnh.

## ✅ Routes Đã Có

### Authentication Routes (`/api/auth`)
- ✅ `POST /register` - Đăng ký tài khoản
- ✅ `POST /login` - Đăng nhập
- ✅ `POST /logout` - Đăng xuất
- ✅ `POST /refresh` - Làm mới access token
- ✅ `POST /forgot-password` - Yêu cầu reset mật khẩu
- ✅ `POST /reset-password` - Reset mật khẩu với token

### User Routes (`/api/users`)
- ✅ `GET /me` - Lấy thông tin user hiện tại
- ✅ `PATCH /me` - Cập nhật profile
- ✅ `PATCH /change-password` - Đổi mật khẩu

---

## 🔴 Routes CẦN TẠO

### 1. User Management Routes (`/api/users`)

#### Tìm kiếm & Xem thông tin users
```
GET /api/users/search?q=username&limit=20
  - Tìm kiếm user theo username/display_name
  - Query params: q (search term), limit (default 20)
  - Return: Danh sách users (không bao gồm password)
  - Use case: Tìm bạn để kết bạn, thêm vào nhóm

GET /api/users/:userId
  - Xem thông tin public của một user
  - Return: User profile (display_name, avatar, bio, etc.)
  - Use case: Xem profile người khác
```

---

### 2. Friend Request Routes (`/api/friend-requests`)

#### Gửi & Quản lý lời mời kết bạn
```
POST /api/friend-requests
  - Gửi lời mời kết bạn
  - Body: { toUserId, message? }
  - Validation: Không thể gửi nếu đã là bạn hoặc đã gửi request
  - Return: FriendRequest object

GET /api/friend-requests/sent
  - Lấy danh sách lời mời đã gửi
  - Query: ?page=1&limit=20
  - Return: Paginated list of sent requests

GET /api/friend-requests/received
  - Lấy danh sách lời mời nhận được
  - Query: ?page=1&limit=20
  - Return: Paginated list of received requests
  - Populate: from (user info)

PATCH /api/friend-requests/:requestId/accept
  - Chấp nhận lời mời kết bạn
  - Action: 
    1. Tạo Friend record
    2. Tạo Conversation type="direct"
    3. Xóa FriendRequest
  - Return: Friend object & Conversation object

PATCH /api/friend-requests/:requestId/decline
  - Từ chối lời mời kết bạn
  - Action: Xóa FriendRequest
  - Return: Success message

DELETE /api/friend-requests/:requestId
  - Thu hồi lời mời đã gửi
  - Only: Người gửi mới có thể thu hồi
  - Return: Success message
```

---

### 3. Friends Routes (`/api/friends`)

#### Quản lý danh sách bạn bè
```
GET /api/friends
  - Lấy danh sách bạn bè
  - Query: ?page=1&limit=50&search=name
  - Return: Paginated list of friends
  - Populate: userA, userB với thông tin cơ bản

GET /api/friends/:userId
  - Kiểm tra quan hệ bạn bè với một user
  - Return: Friend object hoặc null
  - Use case: Check xem có phải bạn không trước khi hiện nút chat

DELETE /api/friends/:friendId
  - Hủy kết bạn
  - Action:
    1. Xóa Friend record
    2. Có thể giữ Conversation (set archived) hoặc xóa
  - Return: Success message
```

---

### 4. Conversations Routes (`/api/conversations`)

#### Quản lý hội thoại (cả direct và group)
```
GET /api/conversations
  - Lấy danh sách tất cả conversations
  - Query: ?page=1&limit=20&type=direct|group
  - Sort by: lastMessageAt DESC
  - Populate: participants.userId, lastMessage.senderId
  - Return: List với unreadCount cho mỗi conversation

GET /api/conversations/:conversationId
  - Lấy chi tiết một conversation
  - Populate: participants.userId (full info)
  - Return: Conversation object với member details

POST /api/conversations/direct
  - Tạo hoặc lấy conversation trực tiếp với một user
  - Body: { userId }
  - Logic: Check xem đã có conversation direct chưa, nếu có thì return, chưa thì tạo mới
  - Validation: Phải là bạn bè mới tạo được
  - Return: Conversation object

POST /api/conversations/group
  - Tạo nhóm chat mới
  - Body: { name, participantIds[] }
  - Validation: 
    - Tối thiểu 3 người (bao gồm creator)
    - Creator phải là bạn với tất cả participants
  - Action: Set createdBy = currentUser
  - Return: Conversation object

PATCH /api/conversations/:conversationId/group-name
  - Đổi tên nhóm
  - Body: { name }
  - Only: Members trong nhóm
  - Return: Updated conversation

POST /api/conversations/:conversationId/members
  - Thêm thành viên vào nhóm
  - Body: { userIds[] }
  - Only: Group conversation, current user must be member
  - Validation: Chỉ thêm được bạn bè
  - Return: Updated conversation

DELETE /api/conversations/:conversationId/members/:userId
  - Xóa thành viên khỏi nhóm (hoặc tự rời nhóm)
  - Only: 
    - Group conversation
    - Creator có thể kick member
    - Member có thể tự rời
  - Return: Updated conversation

PATCH /api/conversations/:conversationId/mark-read
  - Đánh dấu đã đọc
  - Action:
    1. Add currentUser to seenBy
    2. Reset unreadCounts[currentUserId] = 0
  - Return: Success

DELETE /api/conversations/:conversationId
  - Xóa/Rời conversation
  - Direct: Xóa hoàn toàn (hoặc archive)
  - Group: Rời nhóm (remove khỏi participants)
  - Return: Success message
```

---

### 5. Messages Routes (`/api/messages`)

#### Gửi & Quản lý tin nhắn
```
GET /api/messages/:conversationId
  - Lấy tin nhắn trong một conversation
  - Query: ?page=1&limit=50&before=messageId
  - Sort: createdAt DESC (tin mới nhất trước)
  - Populate: senderId (display_name, avatarURL)
  - Return: Paginated messages

POST /api/messages
  - Gửi tin nhắn mới
  - Body: { conversationId, content?, imgUrl? }
  - Validation: 
    - Phải là member của conversation
    - Ít nhất có content hoặc imgUrl
  - Action:
    1. Tạo Message
    2. Update Conversation.lastMessage
    3. Update Conversation.lastMessageAt
    4. Tăng unreadCounts cho các user khác
    5. Trigger WebSocket event
  - Return: Message object

PATCH /api/messages/:messageId
  - Chỉnh sửa tin nhắn
  - Body: { content }
  - Only: Sender của message
  - Validation: Chỉ edit được trong 15 phút
  - Return: Updated message

DELETE /api/messages/:messageId
  - Xóa tin nhắn (thu hồi)
  - Only: Sender của message
  - Action: Set isRecall = true (không xóa thật)
  - Update: lastMessage nếu đây là tin nhắn cuối
  - Return: Success message

POST /api/messages/:messageId/react
  - Thêm reaction vào tin nhắn (tính năng mở rộng)
  - Body: { emoji }
  - Return: Updated message (nếu implement reactions)
```

---

### 6. Upload Routes (`/api/upload`)

#### Upload ảnh đại diện và ảnh tin nhắn
```
POST /api/upload/avatar
  - Upload avatar
  - Multipart form: file
  - Validation: Image only, max 5MB
  - Action:
    1. Upload to cloud storage (Cloudinary/S3)
    2. Update User.avatarURL và avatarID
    3. Xóa ảnh cũ nếu có
  - Return: { avatarURL }

POST /api/upload/message-image
  - Upload ảnh cho tin nhắn
  - Multipart form: file
  - Validation: Image only, max 10MB
  - Return: { imgUrl }

POST /api/upload/group-avatar
  - Upload ảnh đại diện nhóm (tính năng mở rộng)
  - Similar to avatar upload
  - Return: { groupAvatarURL }
```

---

### 7. Notifications Routes (`/api/notifications` - Optional)

#### Quản lý thông báo
```
GET /api/notifications
  - Lấy danh sách thông báo
  - Types: friend_request, message, group_invite, etc.
  - Query: ?unread=true&limit=20
  - Return: List of notifications

PATCH /api/notifications/:notificationId/read
  - Đánh dấu đã đọc
  - Return: Success

PATCH /api/notifications/read-all
  - Đánh dấu tất cả đã đọc
  - Return: Success
```

---

## 📊 Models Cần Bổ Sung Fields

### Message Model
```typescript
// ✅ Đã có isRecall
reactions?: [{
  userId: ObjectId,
  emoji: string,
  createdAt: Date
}]  // Optional: Cho tính năng react tin nhắn

replyTo?: ObjectId  // Optional: Trả lời tin nhắn
```

### Conversation Model
```typescript
groupAvatar?: string  // Optional: Ảnh đại diện nhóm
groupAvatarId?: string  // Optional: ID ảnh trên cloud

admins?: ObjectId[]  // Optional: Danh sách admin của nhóm (nếu muốn phân quyền)
```

### User Model
```typescript
status?: 'online' | 'offline' | 'away'  // Optional: Trạng thái online
lastSeen?: Date  // Optional: Lần cuối online

blockedUsers?: ObjectId[]  // Optional: Danh sách user bị chặn
```

---

## 🔄 WebSocket Events (Real-time)

Để ứng dụng chat hoạt động real-time, cần implement WebSocket:

```typescript
// Socket.IO events
socket.on('join-conversation', { conversationId })
socket.on('leave-conversation', { conversationId })
socket.on('new-message', { conversationId, message })
socket.on('typing', { conversationId, userId })
socket.on('stop-typing', { conversationId, userId })
socket.on('message-seen', { conversationId, userId })
socket.on('user-online', { userId })
socket.on('user-offline', { userId })
```

---

## 🎯 Priority Implementation Order

### Phase 1 - Core Chat (HIGH Priority)
1. ✅ Friend Requests (send, accept, decline)
2. ✅ Friends Management (list, unfriend)
3. ✅ Conversations Direct (create/get, list)
4. ✅ Messages (send, list, delete/recall)
5. ✅ Mark conversation as read

### Phase 2 - Group Chat (MEDIUM Priority)
6. Group Conversations (create, add/remove members)
7. Update group name
8. Search users

### Phase 3 - Enhanced Features (LOW Priority)
9. Upload images (avatar, message images)
10. Edit messages
11. Notifications
12. Message reactions
13. Reply to messages
14. User status (online/offline)
15. Typing indicators

### Phase 4 - Real-time (CRITICAL for UX)
16. WebSocket integration for real-time messaging
17. Online/offline status
18. Typing indicators

---

## 🛡️ Security & Validation

### Middleware Required
- ✅ `protectedRoute` - Xác thực user
- `isMember` - Check user có phải member của conversation không
- `isGroupAdmin` - Check quyền admin trong nhóm
- `isFriend` - Check quan hệ bạn bè

### Validation Points
- Friend request: Không tự gửi cho mình, không duplicate
- Message: Phải là member, không rỗng content và imgUrl
- Group: Minimum participants, tất cả phải là bạn
- Edit/Delete: Chỉ owner, time limit cho edit

---

## 📝 Notes

1. **Pagination**: Tất cả list routes nên có pagination
2. **Populate**: Cẩn thận với populate để tránh over-fetching
3. **Indexes**: Đã có indexes phù hợp cho performance
4. **Soft Delete**: Messages dùng `isRecall` thay vì xóa cứng
5. **Real-time**: Cần Socket.IO hoặc WebSocket cho trải nghiệm tốt
6. **Images**: Cần tích hợp Cloudinary hoặc AWS S3
7. **Error Handling**: Consistent error response format
8. **Rate Limiting**: Cần có rate limit cho upload và send message

---

## 🚀 Next Steps

Bắt đầu implement theo thứ tự Phase 1, sau đó mở rộng dần. Mỗi route cần:
1. Controller method
2. Route definition
3. Validation schema
4. Error handling
5. Tests (optional nhưng recommended)

Bạn muốn tôi bắt đầu implement từ route nào trước?
