import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyAccount from './pages/VerifyAccount'
import ChoosePlan from './pages/ChoosePlan'
import Payment from './pages/Payment'
import Welcome from './pages/Welcome'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DashboardFinanceiro from './pages/DashboardFinanceiro'
import Usuarios from './pages/Usuarios'
import Empresas from './pages/Empresas'
import Planos from './pages/Planos'
import Assinaturas from './pages/Assinaturas'
import Pagamentos from './pages/Pagamentos'
import Gateways from './pages/Gateways'
import Financeiro from './pages/Financeiro'
import Receitas from './pages/Receitas'
import Despesas from './pages/Despesas'
import Km from './pages/Km'
import Veiculos from './pages/Veiculos'
import Manutencoes from './pages/Manutencoes'
import Relatorios from './pages/Relatorios'
import RelatoriosAvancados from './pages/RelatoriosAvancados'
import Configuracoes from './pages/Configuracoes'
import Profile from './pages/Profile'
import Auditoria from './pages/Auditoria'
import AuditoriaLogs from './pages/Auditoria/AuditoriaLogs'
import SecurityDashboard from './pages/Auditoria/SecurityDashboard'
import { AdminDashboard, TenantManagement, SystemSettings, UserManagement, PlanManagement } from './pages/admin'
import MainLayout from './components/layout/MainLayout'
import { AdminRoute } from './components/guards/AdminRoute'

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
        <Route path="/verify-account/:token" element={<VerifyAccount />} />
        <Route path="/choose-plan" element={<ChoosePlan />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/welcome" element={<Welcome />} />
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
          <Route path="dashboard" element={<DashboardFinanceiro />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="empresas" element={<Empresas />} />
          <Route path="planos" element={<Planos />} />
          <Route path="assinaturas" element={<Assinaturas />} />
          <Route path="pagamentos" element={<Pagamentos />} />
          <Route path="gateways" element={<Gateways />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="receitas" element={<Receitas />} />
          <Route path="despesas" element={<Despesas />} />
          <Route path="km" element={<Km />} />
          <Route path="veiculos" element={<Veiculos />} />
          <Route path="veiculos/:id/manutencoes" element={<Manutencoes />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="relatorios/avancados" element={<RelatoriosAvancados />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="auditoria" element={<Auditoria />} />
          <Route path="auditoria/logs" element={<AuditoriaLogs />} />
          <Route path="auditoria/security" element={<SecurityDashboard />} />
          
          {/* Rotas do painel admin (super admin) */}
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="admin/tenants" element={
            <AdminRoute>
              <TenantManagement />
            </AdminRoute>
          } />
          <Route path="admin/settings" element={
            <AdminRoute>
              <SystemSettings />
            </AdminRoute>
          } />
          <Route path="admin/users" element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } />
          <Route path="admin/plans" element={
            <AdminRoute>
              <PlanManagement />
            </AdminRoute>
          } />
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
