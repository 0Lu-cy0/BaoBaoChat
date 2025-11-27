import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  className?: string;
  showIcon?: boolean;
}

const NotificationBadge = ({ className, showIcon = true }: NotificationBadgeProps) => {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  if (unreadCount === 0) {
    return showIcon ? (
      <Bell className={cn('h-5 w-5', className)} />
    ) : null;
  }

  return (
    <div className={cn('relative', className)}>
      {showIcon && <Bell className="h-5 w-5" />}
      <Badge
        variant="destructive"
        className={cn(
          'h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-[10px]',
          showIcon ? 'absolute -right-2 -top-2' : ''
        )}
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </Badge>
    </div>
  );
};

export default NotificationBadge;
