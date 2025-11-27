import { Bell, Check, UserPlus, MessageCircle, Users, MoreVertical, Trash2, BellOff } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/stores/useNotificationStore';
import type { Notification } from '@/types/modelType/notification';
import { notificationService } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const { markAsRead, markAsUnread, removeNotification } = useNotificationStore();
  const navigate = useNavigate();

  const handleNotificationClick = async () => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        markAsRead(notification._id);
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Điều hướng đến trang tương ứng
    switch (notification.type) {
      case 'friend_request':
      case 'friend_accept':
        navigate('/friends');
        break;
      case 'message':
      case 'group_message':
      case 'group_invite':
        // Điều hướng đến cuộc trò chuyện nếu có relatedId
        if (notification.relatedId) {
          navigate('/', { state: { conversationId: notification.relatedId } });
        } else {
          navigate('/');
        }
        break;
      default:
        break;
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notification._id);
      markAsRead(notification._id);
      toast.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAsUnread = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsUnread(notification._id);
      markAsUnread(notification._id);
      toast.success('Đã đánh dấu chưa đọc');
    } catch (error) {
      console.error('Failed to mark as unread:', error);
      toast.error('Không thể đánh dấu chưa đọc');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notification._id);
      removeNotification(notification._id);
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'friend_request':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'friend_accept':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'group_invite':
        return <Users className="h-4 w-4 text-orange-500" />;
      case 'group_message':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
        }`}
      onClick={handleNotificationClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.content}
        </p>
        <p className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleMarkAsRead}
            title="Đánh dấu đã đọc"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {!notification.isRead ? (
              <DropdownMenuItem onClick={handleMarkAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Đánh dấu đã đọc
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleMarkAsUnread}>
                <Bell className="mr-2 h-4 w-4" />
                Đánh dấu chưa đọc
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa thông báo này
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <BellOff className="mr-2 h-4 w-4" />
              Tắt các thông báo này
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const { notifications, unreadCount, setNotifications, markAllAsRead, setLoading } =
    useNotificationStore();

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      markAllAsRead();
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-white/20 text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h3 className="font-semibold">Thông báo</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* Notification List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem key={notification._id} notification={notification} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
