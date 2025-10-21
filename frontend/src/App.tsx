import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import MainLayout from './components/layout/MainLayout'
import { AdminRoute } from './components/guards/AdminRoute'

// Componente de loading
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
)

// Lazy loading das páginas públicas
const Login = React.lazy(() => import('./pages/Login'))
const Register = React.lazy(() => import('./pages/Register'))
const VerifyAccount = React.lazy(() => import('./pages/VerifyAccount'))
const ChoosePlan = React.lazy(() => import('./pages/ChoosePlan'))
const Payment = React.lazy(() => import('./pages/Payment'))
const Welcome = React.lazy(() => import('./pages/Welcome'))
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'))

// Lazy loading das páginas principais
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const DashboardFinanceiro = React.lazy(() => import('./pages/DashboardFinanceiro'))
const Usuarios = React.lazy(() => import('./pages/Usuarios'))
const Empresas = React.lazy(() => import('./pages/Empresas'))
const Planos = React.lazy(() => import('./pages/Planos'))
const Assinaturas = React.lazy(() => import('./pages/Assinaturas'))
const Pagamentos = React.lazy(() => import('./pages/Pagamentos'))
const Gateways = React.lazy(() => import('./pages/Gateways'))
const Financeiro = React.lazy(() => import('./pages/Financeiro'))
const Receitas = React.lazy(() => import('./pages/Receitas'))
const Despesas = React.lazy(() => import('./pages/Despesas'))
const Km = React.lazy(() => import('./pages/Km'))
const Veiculos = React.lazy(() => import('./pages/Veiculos'))
const Manutencoes = React.lazy(() => import('./pages/Manutencoes'))
const ControleCombustivel = React.lazy(() => import('./pages/ControleCombustivel'))
const AnaliseRentabilidade = React.lazy(() => import('./pages/AnaliseRentabilidade'))
const Metas = React.lazy(() => import('./pages/Metas'))
const Conquistas = React.lazy(() => import('./pages/Conquistas'))
const Indicacoes = React.lazy(() => import('./pages/Indicacoes'))
const Relatorios = React.lazy(() => import('./pages/Relatorios'))
const RelatoriosAvancados = React.lazy(() => import('./pages/RelatoriosAvancados'))
const Configuracoes = React.lazy(() => import('./pages/Configuracoes'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Auditoria = React.lazy(() => import('./pages/Auditoria'))
const AuditoriaLogs = React.lazy(() => import('./pages/Auditoria/AuditoriaLogs'))
const SecurityDashboard = React.lazy(() => import('./pages/Auditoria/SecurityDashboard'))

// Lazy loading das páginas de admin
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'))
const TenantManagement = React.lazy(() => import('./pages/admin/TenantManagement'))
const SystemSettings = React.lazy(() => import('./pages/admin/SystemSettings'))
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'))
const PlanManagement = React.lazy(() => import('./pages/admin/PlanManagement'))

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
      <Suspense fallback={<PageLoader />}>
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
            <Route path="dashboard" element={
              <Suspense fallback={<PageLoader />}>
                <DashboardFinanceiro />
              </Suspense>
            } />
            <Route path="usuarios" element={
              <Suspense fallback={<PageLoader />}>
                <Usuarios />
              </Suspense>
            } />
            <Route path="empresas" element={
              <Suspense fallback={<PageLoader />}>
                <Empresas />
              </Suspense>
            } />
            <Route path="planos" element={
              <Suspense fallback={<PageLoader />}>
                <Planos />
              </Suspense>
            } />
            <Route path="assinaturas" element={
              <Suspense fallback={<PageLoader />}>
                <Assinaturas />
              </Suspense>
            } />
            <Route path="pagamentos" element={
              <Suspense fallback={<PageLoader />}>
                <Pagamentos />
              </Suspense>
            } />
            <Route path="gateways" element={
              <Suspense fallback={<PageLoader />}>
                <Gateways />
              </Suspense>
            } />
            <Route path="financeiro" element={
              <Suspense fallback={<PageLoader />}>
                <Financeiro />
              </Suspense>
            } />
            <Route path="receitas" element={
              <Suspense fallback={<PageLoader />}>
                <Receitas />
              </Suspense>
            } />
            <Route path="despesas" element={
              <Suspense fallback={<PageLoader />}>
                <Despesas />
              </Suspense>
            } />
            <Route path="km" element={
              <Suspense fallback={<PageLoader />}>
                <Km />
              </Suspense>
            } />
            <Route path="veiculos" element={
              <Suspense fallback={<PageLoader />}>
                <Veiculos />
              </Suspense>
            } />
            <Route path="veiculos/:id/manutencoes" element={
              <Suspense fallback={<PageLoader />}>
                <Manutencoes />
              </Suspense>
            } />
            <Route path="veiculos/:id/combustivel" element={
              <Suspense fallback={<PageLoader />}>
                <ControleCombustivel />
              </Suspense>
            } />
            <Route path="veiculos/:id/rentabilidade" element={
              <Suspense fallback={<PageLoader />}>
                <AnaliseRentabilidade />
              </Suspense>
            } />
            <Route path="metas" element={
              <Suspense fallback={<PageLoader />}>
                <Metas />
              </Suspense>
            } />
            <Route path="conquistas" element={
              <Suspense fallback={<PageLoader />}>
                <Conquistas />
              </Suspense>
            } />
            <Route path="indicacoes" element={
              <Suspense fallback={<PageLoader />}>
                <Indicacoes />
              </Suspense>
            } />
            <Route path="relatorios" element={
              <Suspense fallback={<PageLoader />}>
                <Relatorios />
              </Suspense>
            } />
            <Route path="relatorios/avancados" element={
              <Suspense fallback={<PageLoader />}>
                <RelatoriosAvancados />
              </Suspense>
            } />
            <Route path="configuracoes" element={
              <Suspense fallback={<PageLoader />}>
                <Configuracoes />
              </Suspense>
            } />
            <Route path="perfil" element={
              <Suspense fallback={<PageLoader />}>
                <Profile />
              </Suspense>
            } />
            <Route path="auditoria" element={
              <Suspense fallback={<PageLoader />}>
                <Auditoria />
              </Suspense>
            } />
            <Route path="auditoria/logs" element={
              <Suspense fallback={<PageLoader />}>
                <AuditoriaLogs />
              </Suspense>
            } />
            <Route path="auditoria/security" element={
              <Suspense fallback={<PageLoader />}>
                <SecurityDashboard />
              </Suspense>
            } />
            
            {/* Rotas do painel admin (super admin) */}
            <Route path="admin" element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              </AdminRoute>
            } />
            <Route path="admin/tenants" element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <TenantManagement />
                </Suspense>
              </AdminRoute>
            } />
            <Route path="admin/settings" element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <SystemSettings />
                </Suspense>
              </AdminRoute>
            } />
            <Route path="admin/users" element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <UserManagement />
                </Suspense>
              </AdminRoute>
            } />
            <Route path="admin/plans" element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <PlanManagement />
                </Suspense>
              </AdminRoute>
            } />
          </Route>
          
          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
