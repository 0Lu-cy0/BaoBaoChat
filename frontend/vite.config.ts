import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
// Nếu bước 2 bạn không cài @tailwindcss/vite thì xóa dòng dưới và cấu hình kiểu cũ
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Thay thế __dirname bằng import.meta.dirname (Node 20+) 
      // hoặc dùng path.resolve() thủ công nếu Node thấp hơn
      "@": path.resolve(__dirname, "./src"),
    },
  },
})