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
    port: 5173,  // Porta padrão do Vite para desenvolvimento
    strictPort: false,
    proxy: {
      '/api': {
        target: 'https://api.fluxvision.cloud',
        changeOrigin: true,
        secure: true,
      },
    },
    // Desenvolvimento local (comentado para produção):
    // proxy: undefined,
  },
  preview: {
    host: true,
    port: 4173,  // Porta padrão do Vite para preview
  },
})
