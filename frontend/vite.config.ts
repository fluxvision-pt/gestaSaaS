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
    // Otimizações de bundle
    rollupOptions: {
      output: {
        // Code splitting manual para bibliotecas grandes
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'sonner', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'chart-vendor': ['recharts'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'table-vendor': ['@tanstack/react-table'],
          'date-vendor': ['date-fns'],
          
          // Feature chunks
          'dashboard': ['./src/pages/DashboardFinanceiro.tsx'],
          'financeiro': ['./src/pages/Financeiro.tsx', './src/pages/Receitas.tsx', './src/pages/Despesas.tsx'],
          'relatorios': ['./src/pages/Relatorios.tsx', './src/pages/RelatoriosAvancados.tsx'],
          'admin': ['./src/pages/admin/AdminDashboard.tsx', './src/pages/admin/TenantManagement.tsx'],
          'veiculos': ['./src/pages/Veiculos.tsx', './src/pages/Manutencoes.tsx', './src/pages/ControleCombustivel.tsx'],
        },
        // Nomes de arquivo com hash para cache busting
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            const name = path.basename(facadeModuleId, path.extname(facadeModuleId))
            return `chunks/${name}-[hash].js`
          }
          return 'chunks/[name]-[hash].js'
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Configurações de otimização
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Limite de aviso para chunks grandes (500kb)
    chunkSizeWarningLimit: 500,
    // Otimizações CSS
    cssCodeSplit: true,
    cssMinify: true
  },
  // Otimizações de desenvolvimento
  server: {
    hmr: {
      overlay: false
    }
  },
  // Pré-bundling de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'sonner',
      'date-fns',
      'recharts',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod'
    ],
    exclude: ['@vite/client', '@vite/env']
  }
})
