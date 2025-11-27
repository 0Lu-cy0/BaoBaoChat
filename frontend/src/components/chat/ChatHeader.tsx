import { Users, Phone, Video, MoreVertical } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Conversation, User } from '@/types/modelType';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import EditGroupDialog from './EditGroupDialog';

interface ChatHeaderProps {
  conversation: Conversation;
}

const ChatHeader = ({ conversation }: ChatHeaderProps) => {
  const { user } = useAuthStore();
  const { onlineUsers } = useChatStore(); // Lấy danh sách đang online từ Socket

  // State giả dùng để force re-render mỗi phút
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const otherParticipant = useMemo(() => {
    if (conversation.type === 'group' || !user) return null;

    return conversation.participants.find((p) => {
      const participantId = typeof p.userId === 'string'
        ? p.userId
        : (p.userId as User)._id;
      return participantId !== user._id;
    });
  }, [conversation, user]);

  const otherUser = otherParticipant?.userId as unknown as User;

  // --- 🕵️ LOG DEBUG TRẠNG THÁI (THÊM MỚI) ---
  useEffect(() => {
    if (conversation.type === 'direct' && otherUser) {
      console.group(`%c[ChatHeader Debug] Target: ${otherUser.display_name}`, 'color: #00bcd4; font-weight: bold;');

      console.log('1. Danh sách onlineUsers trong Store:', onlineUsers);
      console.log('2. ID của người kia (otherUser._id):', otherUser._id, `(Type: ${typeof otherUser._id})`);

      // Check thử các kiểu so sánh
      const rawCheck = onlineUsers.includes(otherUser._id);
      const stringCheck = onlineUsers.includes(otherUser._id?.toString());

      console.log('3. Check trực tiếp (.includes):', rawCheck);
      console.log('4. Check toString (.includes(id.toString())):', stringCheck);

      console.log('5. Dữ liệu LastSeen/Status của user trong conversation:', {
        status: otherUser.status,
        lastSeen: otherUser.lastSeen
      });

      if (onlineUsers.length === 0) {
        console.warn('⚠️ CẢNH BÁO: Danh sách onlineUsers đang RỖNG!');
      } else if (!rawCheck && stringCheck) {
        console.error('🚨 LỖI TYPE MISMATCH: ID trong store là string, ID user là Object. Cần fix logic isOnline!');
      } else if (!rawCheck && !stringCheck) {
        console.log('ℹ️ User này đang Offline theo danh sách Socket.');
      } else {
        console.log('✅ User này đang ONLINE.');
      }

      console.groupEnd();
    }
  }, [onlineUsers, otherUser, conversation.type]);
  // ---------------------------------------------

  // Logic xác định Online/Offline realtime (Có fix toString cho chắc ăn)
  const isOnline = useMemo(() => {
    if (!otherUser) return false;
    // Fix mạnh tay: Convert hết về string để so sánh
    return onlineUsers.includes(otherUser._id?.toString());
  }, [onlineUsers, otherUser]);

  const getStatusText = () => {
    if (conversation.type === 'group') {
      return `${conversation.participants.length} thành viên`;
    }

    if (!otherUser) return 'Người dùng';

    // Ưu tiên check socket realtime trước
    if (isOnline) {
      return 'Đang hoạt động';
    }

    // Nếu không online, tính toán Last Seen từ dữ liệu trong conversation
    if (otherUser.lastSeen) {
      const lastSeenDate = new Date(otherUser.lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - lastSeenDate.getTime();

      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `Hoạt động ${diffMins} phút trước`;
      if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;
      if (diffDays < 7) return `Hoạt động ${diffDays} ngày trước`;

      return `Hoạt động ${lastSeenDate.toLocaleDateString('vi-VN')}`;
    }

    return 'Ngoại tuyến';
  };

  const conversationName = useMemo(() => {
    if (conversation.type === 'group') {
      return conversation.group?.name || 'Nhóm không tên';
    }
    return otherUser?.display_name || otherUser?.user_name || 'Người dùng';
  }, [conversation.type, conversation.group, otherUser]);

  const getConversationAvatar = () => {
    if (conversation.type === 'group') {
      if (conversation.group?.groupAvatar) {
        return (
          <img
            src={conversation.group.groupAvatar}
            alt={conversation.group.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        );
      }
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
          <Users className="h-5 w-5" />
        </div>
      );
    }

    if (otherUser?.avatarURL) {
      return (
        <img
          src={otherUser.avatarURL}
          alt={conversationName}
          className="h-10 w-10 rounded-full object-cover"
        />
      );
    }

    const firstChar = conversationName.charAt(0) || 'D';
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold">
        {firstChar.toUpperCase()}
      </div>
    );
  };

  return (
    <div className="flex h-16 items-center justify-between border-b px-4">
      <div className="flex items-center gap-3">
        {getConversationAvatar()}
        <div>
          <h2 className="font-semibold">{conversationName}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {conversation.type === 'direct' && isOnline && (
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            )}
            {getStatusText()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {conversation.type === 'group' && (
          <EditGroupDialog
            conversationId={conversation._id}
            currentName={conversation.group?.name || 'Nhóm không tên'}
          />
        )}
        <Button variant="ghost" size="icon">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;