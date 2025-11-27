import { useChatStore } from '@/stores/useChatStore';

const TypingIndicator = () => {
  const { selectedConversation, typingUsers } = useChatStore();

  if (!selectedConversation) return null;

  const typingInCurrentConv = typingUsers.get(selectedConversation._id);

  if (!typingInCurrentConv || typingInCurrentConv.length === 0) {
    return null;
  }

  const typingText =
    typingInCurrentConv.length === 1
      ? `${typingInCurrentConv[0].userName} đang nhập...`
      : typingInCurrentConv.length === 2
      ? `${typingInCurrentConv[0].userName} và ${typingInCurrentConv[1].userName} đang nhập...`
      : `${typingInCurrentConv.length} người đang nhập...`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span className="animate-bounce animation-delay-0 inline-block h-2 w-2 rounded-full bg-muted-foreground"></span>
        <span className="animate-bounce animation-delay-150 inline-block h-2 w-2 rounded-full bg-muted-foreground"></span>
        <span className="animate-bounce animation-delay-300 inline-block h-2 w-2 rounded-full bg-muted-foreground"></span>
      </div>
      <span>{typingText}</span>
    </div>
  );
};

export default TypingIndicator;
