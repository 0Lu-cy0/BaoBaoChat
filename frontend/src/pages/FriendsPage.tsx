import { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FriendList from '@/components/friends/FriendList';
import FriendRequestList from '@/components/friends/FriendRequestList';
import AddFriendDialog from '@/components/friends/AddFriendDialog';
import { useFriendStore } from '@/stores/useFriendStore';
import { friendService } from '@/services/friendService';

const FriendsPage = () => {
  const { friendRequests, setFriendRequests, setSentRequests } = useFriendStore();
  const [activeTab, setActiveTab] = useState('friends');

  // Load friend requests ngay khi vào trang để hiển thị badge
  useEffect(() => {
    const loadRequestsCount = async () => {
      try {
        const [receivedData, sentData] = await Promise.all([
          friendService.getReceivedRequests(),
          friendService.getSentRequests(),
        ]);
        setFriendRequests(receivedData.receivedRequests || []);
        setSentRequests(sentData.sentRequests || []);
      } catch (error) {
        console.error('Failed to load friend requests:', error);
      }
    };
    loadRequestsCount();
  }, [setFriendRequests, setSentRequests]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bạn bè</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý bạn bè và lời mời kết bạn
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="w-auto justify-start">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Danh sách bạn bè
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2 relative">
              <UserPlus className="h-4 w-4" />
              Lời mời kết bạn
              {friendRequests.length > 0 && (
                <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-white">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Friends List */}
        <TabsContent value="friends" className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            <div className="p-4 border-b">
              <AddFriendDialog />
            </div>
            <div className="flex-1 overflow-hidden">
              <FriendList />
            </div>
          </div>
        </TabsContent>

        {/* Friend Requests */}
        <TabsContent value="requests" className="flex-1 overflow-hidden">
          <FriendRequestList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendsPage;
