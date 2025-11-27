import { User, KeyRound, LogOut, Users, MessageSquare, Home, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { useFriendStore } from '@/stores/useFriendStore';
import { useNavigate, useLocation } from 'react-router';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useThemeStore } from '@/stores/useThemeStore';
import { useSocket } from '@/hooks/useSocket';
import { useMemo } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const user = useAuthStore((s) => s.user);
  const signout = useAuthStore((s) => s.signout);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  const { conversations } = useChatStore();
  const { friendRequests } = useFriendStore();

  // Initialize socket connection
  useSocket();

  // Tính tổng tin nhắn chưa đọc
  const totalUnreadMessages = useMemo(() => {
    if (!user) return 0;
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCounts[user._id] || 0);
    }, 0);
  }, [conversations, user]);

  // Số lời mời kết bạn
  const totalFriendRequests = friendRequests.length;

  const handleLogout = async () => {
    await signout();
    navigate('/signin');
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      // Nếu đang ở trang chủ, reload trang
      window.location.reload();
    } else {
      // Nếu ở trang khác, chuyển về trang chủ
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gradient-purple">
      {/* Fixed Header with gradient */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 px-4 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Logo - Clickable */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Home className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Moji
            </h1>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Buttons */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/')}
                  className={`hover:bg-white/20 ${location.pathname === '/' ? 'bg-white/20' : ''} text-white relative`}
                >
                  <MessageSquare className="h-5 w-5" />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                      {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tin nhắn</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/friends')}
                  className={`hover:bg-white/20 ${location.pathname === '/friends' ? 'bg-white/20' : ''} text-white relative`}
                >
                  <Users className="h-5 w-5" />
                  {totalFriendRequests > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                      {totalFriendRequests > 9 ? '9+' : totalFriendRequests}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bạn bè</p>
              </TooltipContent>
            </Tooltip>

            {/* Dark Mode Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-white/20 text-white relative"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notification Center */}
          <NotificationCenter />

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-2 h-auto p-0 hover:bg-white/20 rounded-full">
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="h-8 w-8 ring-2 ring-white/30">
                    <AvatarImage src={user?.avatarURL} alt={user?.display_name} />
                    <AvatarFallback className="bg-white/20 text-white font-semibold backdrop-blur-sm">
                      {user?.display_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium text-white">
                    {user?.display_name}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{user?.user_name}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Xem hồ sơ</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/change-password')}>
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Đổi mật khẩu</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content with top padding to account for fixed header */}
      <main className="mt-16 flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

export default AppLayout;
