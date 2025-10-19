import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authService } from '@/services/api'
import type { AppUser, LoginRequest } from '@/types'

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  impersonate: (tenantId: string) => Promise<void>
  isAuthenticated: boolean
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user
  const isSuperAdmin = user?.role === 'admin' && user?.tenantId === null  // Super admin tem tenantId null

  // Verificar se há token salvo e buscar dados do usuário
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          // Token inválido, remover
          localStorage.removeItem('token')
        }
      }
      
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
  try {
    setLoading(true)
    const response = await authService.login(credentials)

    // ⚠️ Corrigido conforme retorno real do backend
    const accessToken = response.access_token
    const userData = response.user

    // Salvar token
    localStorage.setItem('token', accessToken)

    // Converter dados do usuário para o formato esperado
    const formattedUser: AppUser = {
      id: userData.id.toString(),
      name: userData.nome || userData.name,
      email: userData.email,
      tenantId: userData.tenantId || null,
      role: userData.perfil === 'super_admin' ? 'admin' : 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setUser(formattedUser)
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    throw error
  } finally {
    setLoading(false)
  }
}

  const handleLogin = async (credentials) => {
  await login(credentials)
  navigate('/dashboard')
}

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
    
    // Chamar API de logout (opcional)
    authService.logout().catch(() => {
      // Ignorar erros no logout
    })
  }

  const impersonate = async (tenantId: string) => {
    try {
      setLoading(true)
      const response = await authService.impersonate(tenantId)
      
      // Salvar novo token
      localStorage.setItem('token', response.accessToken)
      
      // Converter dados do usuário para o formato esperado
      const userData: AppUser = {
        id: response.usuario.id.toString(),
        name: response.usuario.nome,
        email: response.usuario.email,
        tenantId: response.usuario.tenantId || null,  // Manter como UUID string ou null
        role: response.usuario.perfil === 'super_admin' ? 'admin' : 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setUser(userData)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    impersonate,
    isAuthenticated,
    isSuperAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
