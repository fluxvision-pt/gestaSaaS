import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  FileText,
  DollarSign,
  MapPin,
  BarChart3,
  Settings,
  History,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LanguageSelector } from '@/components/LanguageSelector'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'
import NotificationBadge from '@/components/notifications/NotificationBadge'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const { 
    isOnboardingOpen, 
    isOnboardingCompleted, 
    startOnboarding, 
    closeOnboarding, 
    completeOnboarding 
  } = useOnboarding()

  const navigation = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: LayoutDashboard, dataTour: 'dashboard' },
    { name: t('navigation.users'), href: '/usuarios', icon: Users, dataTour: 'users' },
    { name: 'Empresas', href: '/empresas', icon: Building2, dataTour: 'companies' },
    { name: t('navigation.plans'), href: '/planos', icon: CreditCard, dataTour: 'plans' },
    { name: t('navigation.subscriptions'), href: '/assinaturas', icon: FileText, dataTour: 'subscriptions' },
    { name: 'Pagamentos', href: '/pagamentos', icon: DollarSign, dataTour: 'payments' },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign, dataTour: 'financial' },
    { name: 'KM Tracking', href: '/km', icon: MapPin, dataTour: 'km' },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3, dataTour: 'reports' },
    { name: t('navigation.settings'), href: '/configuracoes', icon: Settings, dataTour: 'settings' },
    { name: 'Perfil', href: '/perfil', icon: User, dataTour: 'profile' },
    { name: 'Auditoria', href: '/auditoria', icon: History, dataTour: 'audit' },
  ]

  // Navegação específica para Super Admin
  const adminNavigation = [
    { name: 'Painel Admin', href: '/admin', icon: Shield },
    { name: 'Gestão de Usuários', href: '/admin/users', icon: Users },
    { name: 'Gestão de Planos', href: '/admin/plans', icon: CreditCard },
    { name: 'Gestão de Empresas', href: '/admin/tenants', icon: Building2 },
    { name: 'Configurações Sistema', href: '/admin/settings', icon: Settings },
  ]

  // Verificar se o usuário é super admin
  const isSuperAdmin = user?.role === 'admin' && user?.tenantId === null

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">GestaSaaS</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  data-tour={item.dataTour}
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Seção Super Admin */}
          {isSuperAdmin && (
            <div className="mt-8">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Super Admin
                </h3>
              </div>
              <div className="space-y-2">
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-red-600 text-white shadow-sm"
                          : "text-muted-foreground hover:bg-red-50 hover:text-red-700"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                          isActive ? "text-white" : "text-muted-foreground group-hover:text-red-700"
                        )}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border backdrop-blur-md">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <NotificationBadge />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={startOnboarding}
                className="text-muted-foreground hover:text-foreground"
                title="Iniciar tour do sistema"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              {user && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-accent/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </div>
  )
}