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
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
  host: true,
  strictPort: true,
  port: 80,
  allowedHosts: ['app.fluxvision.cloud'],
  proxy: {
    '/api': {
      target: 'https://api.fluxvision.cloud',
      changeOrigin: true,
      secure: true,
    },
  },
},
