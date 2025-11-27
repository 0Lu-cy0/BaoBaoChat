import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Loader2, UserMinus, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendStore } from '@/stores/useFriendStore';
import { friendService } from '@/services/friendService';
import { toast } from 'sonner';

const AddFriendDialog = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { searchResults, setSearchResults, clearSearchResults, loadingSearch, setLoadingSearch } =
    useFriendStore();
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [cancelingRequest, setCancelingRequest] = useState<string | null>(null);
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        clearSearchResults();
      }
    }, 500); // Đợi 500ms sau khi dừng gõ

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      setLoadingSearch(true);
      const data = await friendService.searchUsers(searchQuery.trim());
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Không thể tìm kiếm người dùng');
    } finally {
      setLoadingSearch(false);
    }
  }, [searchQuery, setLoadingSearch, setSearchResults]);

  const handleSendRequest = async (userId: string) => {
    try {
      setSendingRequest(userId);
      const response = await friendService.sendFriendRequest(userId);
      toast.success('Đã gửi lời mời kết bạn');

      // Update status in search results with requestId from response
      const requestId = response.requestId || response.friendRequest?._id;
      setSearchResults(searchResults.map((u) =>
        u._id === userId ? { ...u, relationshipStatus: 'sent' as const, requestId } : u
      ));
    } catch (error: any) {
      console.error('Failed to send request:', error);
      const message = error.response?.data?.message || 'Không thể gửi lời mời kết bạn';
      toast.error(message);
    } finally {
      setSendingRequest(null);
    }
  };

  const handleCancelRequest = async (requestId: string, userId: string) => {
    try {
      setCancelingRequest(userId);
      await friendService.cancelRequest(requestId);
      toast.success('Đã hủy lời mời kết bạn');

      // Update status in search results
      setSearchResults(searchResults.map((u) =>
        u._id === userId ? { ...u, relationshipStatus: 'none' as const, requestId: undefined } : u
      ));
    } catch (error: any) {
      console.error('Failed to cancel request:', error);
      const message = error.response?.data?.message || 'Không thể hủy lời mời';
      toast.error(message);
    } finally {
      setCancelingRequest(null);
    }
  };

  const handleAcceptRequest = async (requestId: string, userId: string) => {
    try {
      setAcceptingRequest(userId);
      await friendService.acceptRequest(requestId);
      toast.success('Đã chấp nhận kết bạn');

      // Update status in search results
      setSearchResults(searchResults.map((u) =>
        u._id === userId ? { ...u, relationshipStatus: 'friend' as const, requestId: undefined } : u
      ));
    } catch (error: any) {
      console.error('Failed to accept request:', error);
      const message = error.response?.data?.message || 'Không thể chấp nhận lời mời';
      toast.error(message);
    } finally {
      setAcceptingRequest(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSearchQuery('');
    clearSearchResults();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm bạn bè
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm bạn bè</DialogTitle>
          <DialogDescription>
            Tìm kiếm và gửi lời mời kết bạn đến người dùng khác
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Input
            placeholder="Tìm theo tên hoặc username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loadingSearch ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Search Results */}
        <ScrollArea className="h-[300px] rounded-md border">
          {loadingSearch ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Đang tìm kiếm...</p>
            </div>
          ) : searchResults.length === 0 && searchQuery.trim() !== '' ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Không tìm thấy người dùng</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Nhập tên để tìm kiếm</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  {/* Avatar */}
                  {user.avatarURL ? (
                    <img
                      src={user.avatarURL}
                      alt={user.display_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                      {user.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{user.display_name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.user_name}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                    )}
                  </div>

                  {/* Action */}
                  {user.relationshipStatus === 'friend' ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserCheck className="h-4 w-4" />
                      <span>Bạn bè</span>
                    </div>
                  ) : user.relationshipStatus === 'sent' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => user.requestId && handleCancelRequest(user.requestId, user._id)}
                      disabled={cancelingRequest === user._id || !user.requestId}
                    >
                      {cancelingRequest === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserMinus className="h-4 w-4 mr-1" />
                          Hủy
                        </>
                      )}
                    </Button>
                  ) : user.relationshipStatus === 'received' ? (
                    <Button
                      size="sm"
                      onClick={() => user.requestId && handleAcceptRequest(user.requestId, user._id)}
                      disabled={acceptingRequest === user._id || !user.requestId}
                    >
                      {acceptingRequest === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Chấp nhận
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(user._id)}
                      disabled={sendingRequest === user._id}
                    >
                      {sendingRequest === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
