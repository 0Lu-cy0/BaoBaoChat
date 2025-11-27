import { useEffect, useState } from 'react';
import { UserPlus, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFriendStore } from '@/stores/useFriendStore';
import { friendService } from '@/services/friendService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const FriendRequestList = () => {
  const {
    friendRequests,
    sentRequests,
    setFriendRequests,
    setSentRequests,
    setLoadingRequests,
    loadingRequests,
    removeFriendRequest,
  } = useFriendStore();
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const [receivedData, sentData] = await Promise.all([
        friendService.getReceivedRequests(),
        friendService.getSentRequests(),
      ]);
      setFriendRequests(receivedData.receivedRequests || []);
      setSentRequests(sentData.sentRequests || []);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
      toast.error('Không thể tải lời mời kết bạn');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      await friendService.acceptRequest(requestId);
      removeFriendRequest(requestId);
      toast.success('Đã chấp nhận lời mời kết bạn');
    } catch (error) {
      console.error('Failed to accept request:', error);
      toast.error('Không thể chấp nhận lời mời');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      await friendService.declineRequest(requestId);
      removeFriendRequest(requestId);
      toast.success('Đã từ chối lời mời kết bạn');
    } catch (error) {
      console.error('Failed to decline request:', error);
      toast.error('Không thể từ chối lời mời');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      await friendService.cancelRequest(requestId);
      removeFriendRequest(requestId);
      toast.success('Đã hủy lời mời kết bạn');
    } catch (error) {
      console.error('Failed to cancel request:', error);
      toast.error('Không thể hủy lời mời');
    } finally {
      setProcessingRequest(null);
    }
  };

  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  };

  if (loadingRequests) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="received" className="h-full flex flex-col">
      <TabsList className="w-full">
        <TabsTrigger value="received" className="flex-1">
          Đã nhận ({friendRequests.length})
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex-1">
          Đã gửi ({sentRequests.length})
        </TabsTrigger>
      </TabsList>

      {/* Received Requests */}
      <TabsContent value="received" className="flex-1 overflow-hidden">
        {friendRequests.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">Không có lời mời kết bạn</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-2 p-4">
              {friendRequests.map((request: any) => {
                // Backend trả về from cho received requests
                const sender = request.from;
                return (
                  <div
                    key={request._id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    {/* Avatar */}
                    {sender?.avatarURL ? (
                      <img
                        src={sender.avatarURL}
                        alt={sender.display_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                        {sender?.display_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {sender?.display_name || 'Unknown'}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        @{sender?.user_name || 'unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(request.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => handleAcceptRequest(request._id)}
                        disabled={processingRequest === request._id}
                        title="Chấp nhận"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeclineRequest(request._id)}
                        disabled={processingRequest === request._id}
                        title="Từ chối"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </TabsContent>

      {/* Sent Requests */}
      <TabsContent value="sent" className="flex-1 overflow-hidden">
        {sentRequests.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">Chưa gửi lời mời nào</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-2 p-4">
              {sentRequests.map((request: any) => {
                // Backend trả về to cho sent requests
                const receiver = request.to;
                return (
                  <div
                    key={request._id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    {/* Avatar */}
                    {receiver?.avatarURL ? (
                      <img
                        src={receiver.avatarURL}
                        alt={receiver.display_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                        {receiver?.display_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {receiver?.display_name || 'Unknown'}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        @{receiver?.user_name || 'unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(request.createdAt)}
                      </p>
                    </div>

                    {/* Status & Action */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Đang chờ</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancelRequest(request._id)}
                        disabled={processingRequest === request._id}
                        title="Hủy lời mời"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default FriendRequestList;
