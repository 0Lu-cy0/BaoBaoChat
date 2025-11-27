import { useEffect, useRef, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowDown, Loader2 } from 'lucide-react';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import { useChatStore, type Message } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface MessageListProps {
  messages: Message[];
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const MessageList = ({ messages, onLoadMore, hasMore, isLoadingMore }: MessageListProps) => {
  const user = useAuthStore((s) => s.user);
  const { loadingMessages } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef(messages.length);
  const scrollTimeoutRef = useRef<number | null>(null);
  const previousScrollHeightRef = useRef(0);
  const isLoadingRef = useRef(false);

  // State management
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Check if scroll is at bottom (với tolerance ~50px)
  const checkIsAtBottom = useCallback(() => {
    if (!scrollRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const threshold = 50; // Tolerance pixel
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Load more messages when scroll to top
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingRef.current) return;

    isLoadingRef.current = true;
    previousScrollHeightRef.current = scrollRef.current?.scrollHeight || 0;

    await onLoadMore();

    isLoadingRef.current = false;
  }, [hasMore, onLoadMore]);

  // Handle scroll event với throttle bằng requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) return;

    scrollTimeoutRef.current = window.requestAnimationFrame(() => {
      if (!scrollRef.current) {
        scrollTimeoutRef.current = null;
        return;
      }

      const { scrollTop } = scrollRef.current;
      const atBottom = checkIsAtBottom();

      setIsAtBottom(atBottom);
      setShowScrollButton(!atBottom);

      // Trigger load more khi scroll gần đến top (100px)
      if (scrollTop < 100 && hasMore && !isLoadingMore) {
        loadMore();
      }

      scrollTimeoutRef.current = null;
    });
  }, [checkIsAtBottom, hasMore, isLoadingMore, loadMore]);

  // Effect: Handle new messages
  useEffect(() => {
    const previousLength = previousMessagesLengthRef.current;
    const currentLength = messages.length;

    // Không có tin mới -> skip
    if (currentLength <= previousLength) {
      previousMessagesLengthRef.current = currentLength;
      return;
    }

    const latestMessage = messages[currentLength - 1];
    const isMyMessage = latestMessage?.senderId._id === user?._id;

    // Case 3: Tôi gửi tin -> nhảy lập tức xuống bottom
    if (isMyMessage) {
      scrollToBottom('auto');
    }
    // Case 1: Tin mới đến và tôi đang ở bottom -> smooth scroll
    else if (isAtBottom) {
      scrollToBottom('smooth');
    }
    // Case 2: Tin mới đến nhưng tôi đang cuộn lên -> không scroll

    previousMessagesLengthRef.current = currentLength;
  }, [messages, isAtBottom, scrollToBottom, user?._id]);

  // Effect: Initial scroll to bottom khi load messages lần đầu
  useEffect(() => {
    if (messages.length > 0 && scrollRef.current && !isLoadingMore) {
      scrollToBottom('auto');
    }
  }, [messages.length > 0 ? messages[0]?._id : null]); // Chỉ trigger khi conversation đổi

  // Effect: Preserve scroll position after loading more messages
  useEffect(() => {
    if (isLoadingMore || !scrollRef.current) return;

    const currentScrollHeight = scrollRef.current.scrollHeight;
    const previousScrollHeight = previousScrollHeightRef.current;

    // Nếu có tin nhắn cũ được load thêm (scroll height tăng)
    if (currentScrollHeight > previousScrollHeight && previousScrollHeight > 0) {
      const heightDiff = currentScrollHeight - previousScrollHeight;
      scrollRef.current.scrollTop = heightDiff;
    }
  }, [messages.length, isLoadingMore]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (loadingMessages) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Đang tải tin nhắn...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Chưa có tin nhắn nào</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hãy gửi tin nhắn đầu tiên!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        className="h-full overflow-y-auto overflow-x-hidden p-4 scroll-smooth"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div className="space-y-4">
          {/* Loading indicator at top when fetching older messages */}
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {messages.map((message) => (
            <MessageItem key={message._id} message={message} />
          ))}
          <TypingIndicator />
        </div>
      </div>

      {/* Scroll to Bottom Button - Case 4 */}
      {showScrollButton && (
        <Button
          onClick={() => scrollToBottom('auto')}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-110 animate-in fade-in slide-in-from-bottom-2"
          size="icon"
          variant="default"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}; export default MessageList;
