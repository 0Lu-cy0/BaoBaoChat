import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Users, Image as ImageIcon, Loader2 } from 'lucide-react';
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
import { useFriendStore } from '@/stores/useFriendStore';
import { useChatStore } from '@/stores/useChatStore';
import { chatService } from '@/services/chatService';
import { uploadService } from '@/services/uploadService';
import { friendService } from '@/services/friendService';
import { toast } from 'sonner';
import type { Friend } from '@/types/modelType';

// --- 1. Component con: FriendItem (Đã tối ưu Re-render) ---
// --- Component con: FriendItem (Đã fix UX vùng chọn rộng) ---
const FriendItem = memo(
  ({
    friend,
    isSelected,
    onToggle
  }: {
    friend: Friend;
    isSelected: boolean;
    onToggle: (id: string) => void
  }) => {
    return (
      <div
        // 1. Thêm sự kiện click cho cả dòng
        onClick={() => onToggle(friend.friendId._id)}
        // 2. Thêm cursor-pointer để user biết là bấm được
        className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent cursor-pointer transition-colors"
      >
        <Checkbox
          id={friend._id}
          checked={isSelected}
          // 3. Quan trọng: Tắt tương tác chuột của checkbox để tránh conflict với div cha
          // Checkbox giờ chỉ nghe theo props 'checked'
          className="pointer-events-none"
        />

        {/* Avatar */}
        {friend.friendId.avatarURL ? (
          <img
            src={friend.friendId.avatarURL}
            alt={friend.friendId.display_name}
            className="h-8 w-8 rounded-full object-cover select-none" // Thêm select-none để tránh bôi đen ảnh khi click nhanh
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white select-none">
            {friend.friendId.display_name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Info */}
        <Label
          htmlFor={friend._id}
          className="flex-1 cursor-pointer text-sm font-medium pointer-events-none" // Tắt pointer-events của Label luôn cho mượt
        >
          {friend.friendId.display_name}
        </Label>
      </div>
    );
  },
  (prev, next) => prev.isSelected === next.isSelected && prev.friend === next.friend
);

// --- 2. Component chính ---
const CreateGroupDialog = () => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const { addConversation, setSelectedConversation } = useChatStore();

  const { friends, setFriends } = useFriendStore();

  // Reset state khi đóng dialog
  const handleClose = useCallback(() => {
    setOpen(false);
    // Delay clear state một chút để tránh UI giật khi dialog đang đóng
    setTimeout(() => {
      setGroupName('');
      setSelectedFriends([]);
      setAvatarFile(null);
      setAvatarPreview(null);
    }, 300);
  }, []);

  // Load friends khi dialog mở
  useEffect(() => {
    if (open) {
      const loadFriends = async () => {
        try {
          setLoadingFriends(true);
          // Kiểm tra nếu store đã có friends thì không cần fetch lại (optional optimization)
          if (friends.length === 0) {
            const data = await friendService.getFriends();
            setFriends(data.friends || []);
          }
        } catch (error) {
          console.error('Failed to load friends:', error);
          toast.error('Không thể tải danh sách bạn bè');
        } finally {
          setLoadingFriends(false);
        }
      };
      loadFriends();
    }
  }, [open, setFriends, friends.length]);

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

  // --- TỐI ƯU 1: Dùng useCallback để giữ nguyên tham chiếu hàm ---
  const handleToggleFriend = useCallback((friendId: string) => {
    setSelectedFriends((prev) => {
      // Logic cũ nhưng bọc trong callback
      return prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId];
    });
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Vui lòng nhập tên nhóm');
      return;
    }

    if (selectedFriends.length < 2) {
      toast.error('Nhóm cần có ít nhất 3 thành viên (bạn + 2 người khác)');
      return;
    }

    try {
      setCreating(true);

      // 1. Gọi API tạo nhóm
      const createData = await chatService.createGroup(
        groupName.trim(),
        selectedFriends
      );

      let newConversation = createData.conversation;

      // 2. Upload avatar (nếu có)
      if (avatarFile && newConversation) {
        const uploadRes = await uploadService.uploadGroupAvatar(newConversation._id, avatarFile);
        // Cập nhật lại avatar mới upload vào object conversation
        newConversation = { ...newConversation, avatarURL: uploadRes.avatarURL };
      }

      // 3. QUAN TRỌNG: Cập nhật Store ngay lập tức
      if (newConversation) {
        addConversation(newConversation); // <--- DÒNG FIX LỖI: Thêm vào list bên trái ngay
        setSelectedConversation(newConversation); // (Tuỳ chọn) Tự động mở nhóm mới tạo luôn
      }

      toast.success('Tạo nhóm thành công');
      handleClose();
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error('Không thể tạo nhóm');
    } finally {
      setCreating(false);
    }
  };

  // --- TỐI ƯU 2: Dùng Set để tìm kiếm O(1) ---
  const selectedFriendSet = useMemo(() => new Set(selectedFriends), [selectedFriends]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Tạo nhóm
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo nhóm chat</DialogTitle>
          <DialogDescription>
            Tạo nhóm để trò chuyện với nhiều người cùng lúc
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Group avatar"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-md border border-input px-4 py-2 hover:bg-accent">
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-sm">
                    {avatarFile ? avatarFile.name : 'Chọn ảnh đại diện'}
                  </span>
                </div>
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Tên nhóm *</Label>
            <Input
              id="groupName"
              placeholder="Nhập tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={creating}
            />
          </div>

          {/* Member Selection */}
          <div className="space-y-2">
            <Label>Chọn thành viên ({selectedFriends.length} đã chọn)</Label>
            <ScrollArea className="h-[250px] rounded-md border p-2">
              {loadingFriends ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Đang tải danh sách bạn bè...
                </div>
              ) : friends.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Chưa có bạn bè nào
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    // --- TỐI ƯU 3: Sử dụng component đã Memo ---
                    <FriendItem
                      key={friend._id}
                      friend={friend}
                      isSelected={selectedFriendSet.has(friend.friendId._id)}
                      onToggle={handleToggleFriend}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={creating}>
              Hủy
            </Button>
            <Button onClick={handleCreateGroup} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo nhóm'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;