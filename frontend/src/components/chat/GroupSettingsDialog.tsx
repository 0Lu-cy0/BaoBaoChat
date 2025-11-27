import { useState } from 'react';
import { Settings, Users, Image as ImageIcon, UserMinus, Loader2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useChatStore } from '@/stores/useChatStore';
import type { Conversation } from '@/types/modelType';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { chatService } from '@/services/chatService';
import { uploadService } from '@/services/uploadService';
import { toast } from 'sonner';

interface GroupSettingsDialogProps {
  conversation: Conversation;
}

const GroupSettingsDialog = ({ conversation }: GroupSettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState(conversation.group?.name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const { friends } = useFriendStore();
  const user = useAuthStore((s) => s.user);
  const { updateConversation } = useChatStore();

  const isCreator = conversation.group?.createdBy === user?._id;
  const currentMemberIds = conversation.participants.map((p) => p.userId);

  // Get friends not in group
  const availableFriends = friends.filter(
    (f) => !currentMemberIds.includes(f.friendId._id)
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateName = async () => {
    if (!groupName.trim()) {
      toast.error('Vui lòng nhập tên nhóm');
      return;
    }

    try {
      setUpdating(true);
      await chatService.updateGroupName(conversation._id, groupName.trim());
      updateConversation(conversation._id, {
        group: { ...conversation.group!, name: groupName.trim() },
      });
      toast.success('Đã cập nhật tên nhóm');
    } catch (error) {
      console.error('Failed to update group name:', error);
      toast.error('Không thể cập nhật tên nhóm');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarFile) return;

    try {
      setUpdating(true);
      const uploadData = await uploadService.uploadGroupAvatar(conversation._id, avatarFile);
      await chatService.updateGroupName(conversation._id, groupName);

      updateConversation(conversation._id, {
        group: { ...conversation.group!, groupAvatar: uploadData.avatarURL },
      });

      toast.success('Đã cập nhật ảnh đại diện nhóm');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Failed to update avatar:', error);
      toast.error('Không thể cập nhật ảnh đại diện');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) {
      toast.error('Vui lòng chọn thành viên để thêm');
      return;
    }

    try {
      setUpdating(true);
      await chatService.addMembers(conversation._id, selectedFriends);
      toast.success('Đã thêm thành viên vào nhóm');
      setSelectedFriends([]);
      // Reload conversation
      const convData = await chatService.getConversations();
      const updatedConv = convData.conversations.find((c: { _id: string }) => c._id === conversation._id);
      if (updatedConv) {
        updateConversation(conversation._id, updatedConv);
      }
    } catch (error) {
      console.error('Failed to add members:', error);
      toast.error('Không thể thêm thành viên');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await chatService.removeMembers(conversation._id, [userId]);
      toast.success('Đã xóa thành viên khỏi nhóm');
      // Reload conversation
      const convData = await chatService.getConversations();
      const updatedConv = convData.conversations.find((c: { _id: string }) => c._id === conversation._id);
      if (updatedConv) {
        updateConversation(conversation._id, updatedConv);
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Không thể xóa thành viên');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cài đặt nhóm</DialogTitle>
          <DialogDescription>
            Quản lý thông tin và thành viên của nhóm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Avatar & Name */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarPreview || conversation.group?.groupAvatar ? (
                  <img
                    src={avatarPreview || conversation.group?.groupAvatar}
                    alt="Group avatar"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              {isCreator && (
                <div className="flex-1">
                  <Label htmlFor="avatar-update" className="cursor-pointer">
                    <div className="flex items-center gap-2 rounded-md border border-input px-4 py-2 hover:bg-accent">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm">Đổi ảnh đại diện</span>
                    </div>
                  </Label>
                  <Input
                    id="avatar-update"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  {avatarFile && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={handleUpdateAvatar}
                      disabled={updating}
                    >
                      Lưu ảnh
                    </Button>
                  )}
                </div>
              )}
            </div>

            {isCreator && (
              <div className="space-y-2">
                <Label>Tên nhóm</Label>
                <div className="flex gap-2">
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    disabled={updating}
                  />
                  <Button onClick={handleUpdateName} disabled={updating}>
                    Lưu
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Current Members */}
          <div className="space-y-2">
            <Label>Thành viên ({conversation.participants.length})</Label>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <div className="space-y-2">
                {conversation.participants.map((participant) => {
                  const isCurrentUser = participant.userId === user?._id;
                  const isMemberCreator = participant.userId === conversation.group?.createdBy;

                  return (
                    <div
                      key={participant.userId}
                      className="flex items-center justify-between rounded-lg p-2 hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          U
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {isCurrentUser ? 'Bạn' : `User ${participant.userId.slice(0, 6)}`}
                          </p>
                          {isMemberCreator && (
                            <p className="text-xs text-muted-foreground">Trưởng nhóm</p>
                          )}
                        </div>
                      </div>

                      {isCreator && !isMemberCreator && !isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(participant.userId)}
                        >
                          <UserMinus className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Add Members */}
          {isCreator && availableFriends.length > 0 && (
            <div className="space-y-2">
              <Label>Thêm thành viên</Label>
              <ScrollArea className="h-[150px] rounded-md border p-2">
                <div className="space-y-2">
                  {availableFriends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
                    >
                      <Checkbox
                        id={`add-${friend._id}`}
                        checked={selectedFriends.includes(friend.friendId._id)}
                        onCheckedChange={() => {
                          setSelectedFriends((prev) =>
                            prev.includes(friend.friendId._id)
                              ? prev.filter((id) => id !== friend.friendId._id)
                              : [...prev, friend.friendId._id]
                          );
                        }}
                      />

                      {friend.friendId.avatarURL ? (
                        <img
                          src={friend.friendId.avatarURL}
                          alt={friend.friendId.display_name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          {friend.friendId.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <Label
                        htmlFor={`add-${friend._id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {friend.friendId.display_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {selectedFriends.length > 0 && (
                <Button
                  onClick={handleAddMembers}
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Thêm ${selectedFriends.length} thành viên`
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsDialog;
