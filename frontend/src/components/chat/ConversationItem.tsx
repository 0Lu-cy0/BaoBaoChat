import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Users } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/useChatStore'; // 1. Import useChatStore
import type { Conversation, User } from '@/types/modelType';
import { useAuthStore } from '@/stores/useAuthStore';

interface ConversationItemProps {
  conversation: Conversation;
}

const ConversationItem = ({ conversation }: ConversationItemProps) => {
  const currentUser = useAuthStore((s) => s.user);

  // 2. Lấy onlineUsers từ ChatStore (Nơi Socket cập nhật dữ liệu)
  // Lưu ý: onlineUsers là Array string[] chứa các ID
  const {
    selectedConversation,
    setSelectedConversation,
    onlineUsers
  } = useChatStore();

  const isSelected = selectedConversation?._id === conversation._id;
  const unreadCount = currentUser ? conversation.unreadCounts[currentUser._id] || 0 : 0;

  // --- LOGIC TÌM NGƯỜI KIA (Giữ nguyên) ---
  const otherUser = useMemo(() => {
    if (conversation.type === 'group' || !currentUser) return null;

    const participant = conversation.participants.find((p) => {
      const pId = typeof p.userId === 'string'
        ? p.userId
        : (p.userId as unknown as User)._id;

      return pId !== currentUser._id;
    });

    return participant?.userId as unknown as User;
  }, [conversation.participants, conversation.type, currentUser]);

  // --- LOGIC TÊN HỘI THOẠI (Giữ nguyên) ---
  const conversationName = useMemo(() => {
    if (conversation.type === 'group') {
      return conversation.group?.name || 'Nhóm chat';
    }
    return otherUser?.display_name || otherUser?.user_name || 'Người dùng ẩn danh';
  }, [conversation.type, conversation.group, otherUser]);

  // 3. SỬA LOGIC CHECK ONLINE (QUAN TRỌNG)
  const isOnline = useMemo(() => {
    if (conversation.type === 'group' || !otherUser) return false;

    // Kiểm tra xem ID của user kia có nằm trong mảng onlineUsers không
    // Dùng .includes vì onlineUsers là Array
    return onlineUsers.includes(otherUser._id);
  }, [conversation.type, otherUser, onlineUsers]);

  // --- RENDER AVATAR (Giữ nguyên) ---
  const renderAvatar = () => {
    if (conversation.type === 'group') {
      if (conversation.group?.groupAvatar) {
        return (
          <img
            src={conversation.group.groupAvatar}
            alt={conversationName}
            className="h-12 w-12 rounded-full object-cover"
          />
        );
      }
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
          <Users className="h-6 w-6" />
        </div>
      );
    }

    if (otherUser?.avatarURL) {
      return (
        <img
          src={otherUser.avatarURL}
          alt={conversationName}
          className="h-12 w-12 rounded-full object-cover"
        />
      );
    }

    const nameString = typeof conversationName === 'string' ? conversationName : "U";
    const firstChar = nameString.charAt(0) || 'U';

    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-semibold">
        {firstChar.toUpperCase()}
      </div>
    );
  };

  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    } catch {
      return '';
    }
  };

  return (
    <div
      onClick={() => setSelectedConversation(conversation)}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted',
        isSelected && 'bg-muted'
      )}
    >
      <div className="relative flex-shrink-0">
        {renderAvatar()}

        {/* 4. Hiển thị chấm xanh REALTIME */}
        {conversation.type === 'direct' && isOnline && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn(
            "truncate",
            unreadCount > 0 ? "font-bold" : "font-semibold"
          )}>
            {conversationName}
          </h3>
          {conversation.lastMessageAt && (
            <span className={cn(
              "flex-shrink-0 text-xs",
              unreadCount > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
            )}>
              {formatTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            "truncate text-sm",
            unreadCount > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
          )}>
            {conversation.lastMessage?.senderId === currentUser?._id && "Bạn: "}
            {conversation.lastMessage?.content || 'Bắt đầu cuộc trò chuyện'}
          </p>
          {unreadCount > 0 && (
            <div className="flex h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;