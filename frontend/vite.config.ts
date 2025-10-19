import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',          // ✅ gera /frontend/dist automaticamente
    emptyOutDir: true,
  },
  server: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // ✅ redireciona para backend local
        changeOrigin: true,
      },
    },
  },
})
