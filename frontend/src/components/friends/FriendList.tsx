import { useEffect } from 'react';
import { Users, MessageCircle, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendStore } from '@/stores/useFriendStore';
import { useChatStore } from '@/stores/useChatStore';
import { friendService } from '@/services/friendService';
import { chatService } from '@/services/chatService';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

const FriendList = () => {
  const { friends, setFriends, setLoadingFriends, loadingFriends, onlineUsers } = useFriendStore();
  const { setSelectedConversation, setConversations } = useChatStore();
  const [removingFriend, setRemovingFriend] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      const data = await friendService.getFriends();
      // Backend đã trả về 'friendId' nhất quán
      setFriends(data.friends || []);
    } catch (error) {
      console.error('Failed to load friends:', error);
      toast.error('Không thể tải danh sách bạn bè');
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleStartChat = async (friendId: string, conversationId?: string) => {
    try {
      if (conversationId) {
        // Use existing conversation
        const convData = await chatService.getConversations();
        const conversation = convData.conversations.find((c: { _id: string }) => c._id === conversationId);
        if (conversation) {
          setSelectedConversation(conversation);
        }
      } else {
        // Create new conversation
        const data = await chatService.createDirectConversation(friendId);
        setSelectedConversation(data.conversation);

        // Refresh conversations list
        const convData = await chatService.getConversations();
        setConversations(convData.conversations || []);
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Không thể bắt đầu trò chuyện');
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await friendService.removeFriend(friendshipId);
      setFriends(friends.filter((f) => f._id !== friendshipId));
      toast.success('Đã xóa bạn bè');
      setRemovingFriend(null);
    } catch (error) {
      console.error('Failed to remove friend:', error);
      toast.error('Không thể xóa bạn bè');
    }
  };

  if (loadingFriends) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Chưa có bạn bè nào</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hãy thêm bạn bè để bắt đầu trò chuyện
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-full">
        <div className="space-y-2 p-4">
          {friends.map((friend) => {
            const isOnline = onlineUsers.has(friend.friendId._id);

            return (
              <div
                key={friend._id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                {/* Avatar with online status */}
                <div className="relative">
                  {friend.friendId.avatarURL ? (
                    <img
                      src={friend.friendId.avatarURL}
                      alt={friend.friendId.display_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                      {friend.friendId.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Online indicator */}
                  <div
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                  />
                </div>

                {/* Friend info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {friend.friendId.display_name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    @{friend.friendId.user_name}
                  </p>
                  {isOnline ? (
                    <p className="text-xs text-green-600 dark:text-green-400">Đang hoạt động</p>
                  ) : friend.friendId.lastSeen ? (
                    <p className="text-xs text-muted-foreground">
                      Hoạt động lần cuối: {new Date(friend.friendId.lastSeen).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStartChat(friend.friendId._id)}
                    title="Nhắn tin"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRemovingFriend(friend._id)}
                    title="Xóa bạn"
                  >
                    <UserMinus className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Remove friend confirmation dialog */}
      <AlertDialog open={!!removingFriend} onOpenChange={() => setRemovingFriend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bạn bè</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người này khỏi danh sách bạn bè? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingFriend && handleRemoveFriend(removingFriend)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FriendList;
