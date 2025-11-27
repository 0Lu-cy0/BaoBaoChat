import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/stores/useChatStore';
import { chatService } from '@/services/chatService';
import { socketService } from '@/services/socketService';
import { toast } from 'sonner';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { selectedConversation, addMessage } = useChatStore();

  // Stop typing on unmount or conversation change
  useEffect(() => {
    return () => {
      if (isTyping && selectedConversation) {
        socketService.stopTyping(selectedConversation._id);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?._id]);

  const handleTyping = () => {
    if (!selectedConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socketService.startTyping(selectedConversation._id);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(selectedConversation._id);
    }, 2000);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      setSending(true);

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        socketService.stopTyping(selectedConversation._id);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }

      const data = await chatService.sendMessage(
        selectedConversation._id,
        message.trim()
      );
      
      // Add message to store
      if (data.data) {
        addMessage(data.data);
      }

      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        {/* Attach Button */}
        <Button variant="ghost" size="icon" disabled={sending}>
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Message Input */}
        <Textarea
          placeholder="Nhập tin nhắn..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          disabled={sending}
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />

        {/* Emoji Button */}
        <Button variant="ghost" size="icon" disabled={sending}>
          <Smile className="h-5 w-5" />
        </Button>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
