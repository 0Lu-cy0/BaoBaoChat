import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types/theme';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // 1. Logic khởi tạo: Ưu tiên System -> Default Light
      // (Lưu ý: persist sẽ tự động ghi đè giá trị này nếu trong localStorage đã có)
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',

      setTheme: (theme: Theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage', // Tên key lưu trong LocalStorage
    }
  )
);