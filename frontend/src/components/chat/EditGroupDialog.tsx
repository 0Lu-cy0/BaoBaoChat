import { useState } from 'react';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { chatService } from '@/services/chatService';
import { useChatStore } from '@/stores/useChatStore';
import { toast } from 'sonner';

interface EditGroupDialogProps {
  conversationId: string;
  currentName: string;
}

const EditGroupDialog = ({ conversationId, currentName }: EditGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const { setSelectedConversation, conversations } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error('Tên nhóm không được để trống');
      return;
    }

    if (groupName.trim() === currentName) {
      setOpen(false);
      return;
    }

    try {
      setLoading(true);
      await chatService.updateGroupName(conversationId, groupName.trim());

      // Update local state
      const updatedConv = conversations.find(c => c._id === conversationId);
      if (updatedConv) {
        const newConv = {
          ...updatedConv,
          group: updatedConv.group ? {
            ...updatedConv.group,
            name: groupName.trim()
          } : undefined
        };
        setSelectedConversation(newConv);
      }

      toast.success('Đã đổi tên nhóm thành công');
      setOpen(false);
    } catch (error) {
      console.error('Failed to update group name:', error);
      toast.error('Không thể đổi tên nhóm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Đổi tên nhóm</DialogTitle>
            <DialogDescription>
              Thay đổi tên hiển thị cho nhóm chat
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="groupName">Tên nhóm mới</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nhập tên nhóm..."
                maxLength={50}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {groupName.length}/50 ký tự
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDialog;
