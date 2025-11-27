import { create } from 'zustand'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import { persist } from 'zustand/middleware' // Bỏ createJSONStorage nếu không dùng custom
import type { AuthState } from '@/types/store'

// CÚ PHÁP CHUẨN: create<Type>()(persist(...))
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      isCheckingAuth: true,

      checkAuth: async () => {
        try {
          // Gọi hàm refresh cũ của bạn để lấy token
          await get().refresh();
        } catch (error) {
          // Nếu lỗi thì thôi, coi như chưa login
          console.log("Check auth failed:", error);
          get().clearState();
        } finally {
          // Quan trọng nhất: Dù thành công hay thất bại cũng phải tắt loading
          set({ isCheckingAuth: false });
        }
      },

      clearState: () => {
        set({ accessToken: null, user: null, loading: false })
      },

      signup: async (user_name, password, email, first_name, last_name) => {
        try {
          set({ loading: true })
          await authService.signUp(user_name, password, email, first_name, last_name)
          toast.success('Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập.')
        } catch (error) {
          console.error(error)
          toast.error('Đăng ký không thành công')
        } finally {
          set({ loading: false })
        }
      },

      signin: async (user_name, password) => {
        try {
          set({ loading: true })
          const { accessToken, user } = await authService.signIn(user_name, password)
          set({ accessToken, user })
          toast.success('Chào mừng bạn quay trở lại BaoBao')
        } catch (error) {
          console.error(error)
          toast.error('Đăng nhập không thành công')
        } finally {
          set({ loading: false })
        }
      },

      signout: async () => {
        try {
          set({ loading: true })
          await authService.signOut()
          // Clear chat store để tránh hiển thị conversation của user cũ
          const { useChatStore } = await import('./useChatStore')
          useChatStore.getState().setSelectedConversation(null)
          useChatStore.getState().setConversations([])
          useChatStore.getState().clearMessages()
          toast.success('Đăng xuất thành công')
        } catch (error) {
          console.error(error)
          toast.error('Đăng xuất không thành công')
        } finally {
          get().clearState()
          set({ loading: false })
        }
      },

      refresh: async () => {
        try {
          // Lưu ý: Không set loading: true ở đây để tránh nháy màn hình khi F5
          const { accessToken, user } = await authService.refresh()
          set({ accessToken, user })
          return true
        } catch {
          // Silent fail - không log error nếu chưa đăng nhập
          get().clearState()
          return false
        }
      },

      updateProfile: async (display_name: string, bio?: string, phone?: string) => {
        try {
          set({ loading: true })
          const response = await authService.updateProfile(display_name, bio, phone)
          set({ user: response.user })
          return { message: response.message, user: response.user };
        } catch (error) {
          console.error(error)
          throw error
        } finally {
          set({ loading: false })
        }
      }
    }),
    {
      name: 'auth-storage', // Tên key trong localStorage

      // 👇 Logic này của bạn là CHUẨN 100%
      // Chỉ lưu user để hiển thị Avatar/Tên ngay khi mở app
      // accessToken vẫn null cho đến khi hàm refresh() chạy xong
      partialize: (state) => ({
        user: state.user
      }),
    }
  )
)