import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"; // Lưu ý: Thường là react-router-dom
import { Toaster } from "sonner";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Pages & Components
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ChatAppPage from "./pages/ChatAppPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Stores
import { useAuthStore } from "./stores/useAuthStore";
import { useThemeStore } from "./stores/useThemeStore";
import { useChatStore } from "./stores/useChatStore";

function App() {
  const { user, isCheckingAuth, checkAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { connectSocket, disconnectSocket } = useChatStore();

  // Effect 1: Init Auth (Chạy 1 lần khi F5 để lấy thông tin user từ token)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Effect 2: Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Effect 3: Quản lý Socket (QUAN TRỌNG NHẤT)
  useEffect(() => {
    // 1. Nếu đang check auth thì khoan hãy làm gì cả
    if (isCheckingAuth) return;

    // 2. Nếu đã có user -> Kết nối
    if (user) {
      console.log("🟢 App: User authenticated, initializing socket...");
      connectSocket();
    }

    // 3. Cleanup Function: Chạy khi component unmount HOẶC khi dependencies thay đổi
    // Đây là chìa khóa để fix lỗi "4 kết nối ma":
    // Khi React Strict Mode chạy (Mount -> Unmount -> Mount), hàm này sẽ chạy disable socket cũ đi ngay lập tức.
    return () => {
      console.log("🛑 App: Cleaning up socket connection...");
      disconnectSocket();
    };

  }, [user, isCheckingAuth, connectSocket, disconnectSocket]);

  // Hiển thị màn hình Loading khi đang check auth
  // (Giúp tránh bug màn hình trắng hoặc redirect sai về trang login)
  if (isCheckingAuth && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Toaster richColors theme={theme as 'light' | 'dark'} />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          {/* Logic: Nếu đã login (có user) thì không cho vào trang Signin/Signup nữa mà đá về Home */}
          <Route
            path="/signin"
            element={!user ? <SignInPage /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!user ? <SignUpPage /> : <Navigate to="/" />}
          />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes (Phải login mới vào được) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout><ChatAppPage /></AppLayout>} path="/" />
            <Route element={<AppLayout><FriendsPage /></AppLayout>} path="/friends" />
            <Route element={<AppLayout><ProfilePage /></AppLayout>} path="/profile" />
            <Route element={<AppLayout><ChangePasswordPage /></AppLayout>} path="/change-password" />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;