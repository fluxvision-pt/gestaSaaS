import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Empresas from './pages/Empresas'
import Planos from './pages/Planos'
import Assinaturas from './pages/Assinaturas'
import Pagamentos from './pages/Pagamentos'
import Financeiro from './pages/Financeiro'
import Km from './pages/Km'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import Auditoria from './pages/Auditoria'
import { AdminDashboard, TenantManagement, SystemSettings } from './pages/admin'
import MainLayout from './components/layout/MainLayout'

// Componente para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  // Se não autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Componente para rotas públicas (redireciona se já autenticado)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  // Se já autenticado, redirecionar para dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Rotas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="empresas" element={<Empresas />} />
          <Route path="planos" element={<Planos />} />
          <Route path="assinaturas" element={<Assinaturas />} />
          <Route path="pagamentos" element={<Pagamentos />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="km" element={<Km />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="auditoria" element={<Auditoria />} />
          
          {/* Rotas do painel admin (super admin) */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/tenants" element={<TenantManagement />} />
          <Route path="admin/settings" element={<SystemSettings />} />
        </Route>
        
        {/* Rota padrão */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  )
}

export default App
