import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import type { Message } from '@/stores/useChatStore';
import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Smile } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatService } from '@/services/chatService';
import { toast } from 'sonner';

interface MessageItemProps {
  message: Message;
}

const MessageItem = ({ message }: MessageItemProps) => {
  const user = useAuthStore((s) => s.user);
  const { updateMessage } = useChatStore();
  const isOwnMessage = message.senderId._id === user?._id;
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const formatTime = (date: Date) => {
    try {
      return format(new Date(date), 'HH:mm', { locale: vi });
    } catch {
      return '';
    }
  };

  const handleEditMessage = async () => {
    if (!editedContent.trim()) return;
    try {
      await chatService.editMessage(message._id, editedContent);
      updateMessage(message._id, { content: editedContent });
      setIsEditing(false);
      toast.success('Đã chỉnh sửa tin nhắn');
    } catch (error) {
      console.error(error);
      toast.error('Không thể chỉnh sửa tin nhắn');
    }
  };

  const handleRecallMessage = async () => {
    try {
      await chatService.recallMessage(message._id);
      updateMessage(message._id, { isRecall: true });
      toast.success('Đã thu hồi tin nhắn');
    } catch (error) {
      console.error(error);
      toast.error('Không thể thu hồi tin nhắn');
    }
  };

  const handleReact = async (emoji: string) => {
    try {
      await chatService.reactToMessage(message._id, emoji);
      // Update local state - in real app, socket will handle this
      toast.success('Đã thêm reaction');
    } catch (error) {
      console.error(error);
      toast.error('Không thể thêm reaction');
    }
  };

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  if (message.isRecall) {
    return (
      <div className="flex justify-center">
        <p className="text-xs italic text-muted-foreground">Tin nhắn đã được thu hồi</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex gap-2',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {!isOwnMessage && (
        <>
          {message.senderId.avatarURL ? (
            <img
              src={message.senderId.avatarURL}
              alt={message.senderId.display_name}
              className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white font-semibold">
              {message.senderId.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </>
      )}

      {/* Message Content */}
      <div
        className={cn(
          'flex max-w-[70%] flex-col gap-1',
          isOwnMessage ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender Name (only for other users) */}
        {!isOwnMessage && (
          <span className="text-xs font-medium">{message.senderId.display_name}</span>
        )}

        {/* Message Bubble */}
        <div className="relative">
          <div
            className={cn(
              'rounded-lg px-4 py-2',
              isOwnMessage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            )}
          >
            {/* Image */}
            {message.imgUrl && (
              <img
                src={message.imgUrl}
                alt="Message attachment"
                className="mb-2 max-w-sm rounded-lg"
              />
            )}

            {/* Edit Mode */}
            {isEditing ? (
              <div className="flex gap-2 items-center">
                <Input
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditMessage();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  autoFocus
                  className="h-8"
                />
                <Button size="sm" onClick={handleEditMessage}>Lưu</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
              </div>
            ) : (
              <>
                {/* Text Content */}
                {message.content && <p className="break-words">{message.content}</p>}
              </>
            )}
          </div>

          {/* Message Actions (visible on hover) */}
          {isOwnMessage && !isEditing && (
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {message.content && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleRecallMessage} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Thu hồi
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Time & Reactions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1">
              {message.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  className="text-xs hover:scale-110 transition-transform"
                  onClick={() => handleReact(reaction.emoji)}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}

          {/* Add Reaction Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-3 w-3" />
            </Button>

            {/* Quick Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-1 bg-background border rounded-lg shadow-lg p-2 flex gap-1">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    className="hover:scale-125 transition-transform text-lg"
                    onClick={() => {
                      handleReact(emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
