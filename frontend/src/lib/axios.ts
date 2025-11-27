import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.MODE === 'development' ? "http://localhost:8282/api" : "/api",
  withCredentials: true, // Gửi cookie cùng với yêu cầu
})


api.interceptors.request.use((config) => {
  // Lấy access token từ localStorage
  const accessToken = useAuthStore.getState().accessToken

  // Nếu có access token, thêm nó vào header
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }

  return config
})

//tự động gọi refresh api khi accesstoken hết hạn
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. CHẶN VÒNG LẶP (Logic từ file mẫu của bạn)
    // Nếu lỗi xảy ra ngay tại các API Auth (Login, Signup, Refresh) thì KHÔNG được retry.
    // Vì nếu Refresh mà lỗi 403 nữa thì retry đến tết cũng không được.
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/forgot-password") ||
      originalRequest.url?.includes("/auth/reset-password")
    ) {
      return Promise.reject(error);
    }

    // 2. KIỂM TRA LỖI 401/403 VÀ CHƯA RETRY
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Đánh dấu đã thử 1 lần

      try {
        // 3. GỌI REFRESH TỪ STORE
        // Chúng ta dùng store.refresh() vì nó đã bao gồm logic cập nhật cả User + Token
        const success = await useAuthStore.getState().refresh();

        if (success) {
          // 4. LẤY TOKEN MỚI
          const newAccessToken = useAuthStore.getState().accessToken;

          // 5. GẮN LẠI VÀO HEADER
          // Lưu ý: Gán trực tiếp vào headers của request cũ
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          // 6. GỌI LẠI REQUEST CŨ
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh thất bại -> Xóa sạch state (Logout)
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }

    // Nếu không phải lỗi Auth hoặc đã retry rồi mà vẫn lỗi -> Trả về lỗi gốc
    return Promise.reject(error);
  }
);
export default api