import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "../backend/app/frontend",
    emptyOutDir: true,
  },
  server: {
    // 固定开发端口：冲突时直接失败而不是静默顺延（顺延会导致 Origin 与 Playwright 配置对不上）
    port: 5173,
    strictPort: true,
    // 反向代理：把 /api 前缀的请求转发给后端，浏览器始终只面对 5173 这一个源
    // → 无跨域、Cookie 自动同域携带，无需后端 CORS 白名单
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
})
