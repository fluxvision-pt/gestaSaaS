import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AlertTriangle, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isSuperAdmin, logout } = useAuth()
  const navigate = useNavigate()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Se não autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Se não é super admin, mostrar página de acesso negado
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesso Negado
            </CardTitle>
            <CardDescription className="text-gray-600">
              Você não tem permissão para acessar esta área administrativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Área Restrita</p>
                  <p className="text-red-700 mt-1">
                    Esta seção é exclusiva para Super Administradores do sistema.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Usuário atual: <span className="font-medium">{user.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Perfil: <span className="font-medium">
                  {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                </span>
              </p>
              
              <div className="flex flex-col space-y-2 pt-4">
                <Button 
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="w-full"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Ir para Dashboard
                </Button>
                <Button 
                  onClick={logout}
                  variant="ghost"
                  className="w-full text-gray-600"
                >
                  Fazer Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se é super admin, renderizar o conteúdo
  return <>{children}</>
}