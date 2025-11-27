import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { accessToken, user, refresh } = useAuthStore();
  // Biến này đóng vai trò "cái cổng", mặc định là ĐÓNG (true)
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      // Nếu chưa có token (trường hợp F5), thì gọi refresh
      if (!accessToken) {
        // await ở đây cực kỳ quan trọng, nó bắt code phải đợi API trả về
        await refresh();
      }

      // Dù API thành công hay thất bại, lúc này mới mở cổng
      setIsChecking(false);
    };

    processAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  // 1. GIAI ĐOẠN CHỜ:
  // Nếu đang check (isChecking = true) -> Hiện Loading
  // Tuyệt đối không chạy xuống logic bên dưới
  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang khôi phục phiên làm việc...</p>
        </div>
      </div>
    );
  }

  // 2. GIAI ĐOẠN QUYẾT ĐỊNH:
  // Lúc này refresh đã chạy xong.
  // Nếu có token và user -> Cho vào (Outlet)
  // Nếu vẫn không có -> Đích thị là hết hạn hoặc chưa login -> Đá về Signin
  if (!accessToken || !user) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;