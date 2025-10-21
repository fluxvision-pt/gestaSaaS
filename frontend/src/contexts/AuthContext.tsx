import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authService } from '@/services/api'
import type { AppUser, LoginRequest } from '@/types'

interface AuthContextType {
  user: AppUser | null
  token: string | null
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
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user
  const isSuperAdmin = user?.role === 'admin' && user?.tenantId === null // super admin => tenantId null

  // Carrega usuário se houver token salvo
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')

      if (storedToken) {
        setToken(storedToken)
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          // Token inválido: limpar tudo
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          setToken(null)
          console.log('Token inválido removido:', error)
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // LOGIN: normaliza o retorno do backend (camelCase/snake_case)
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true)

      const response = await authService.login(credentials)
      // console.log('Login response:', response)

      // Alguns backends enviam accessToken/refreshToken
      // outros enviam access_token/refresh_token
      const accessToken =
        (response as any).accessToken ?? (response as any).access_token
      const refreshToken =
        (response as any).refreshToken ?? (response as any).refresh_token

      // Usuário pode vir como "usuario" (pt) ou "user"
      const rawUser =
        (response as any).usuario ?? (response as any).user

      if (!accessToken || !rawUser) {
        throw new Error('Resposta de login inesperada do servidor')
      }

      // Salva tokens
      localStorage.setItem('token', accessToken)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      setToken(accessToken)

      // Normaliza usuário para o shape do AppUser
      const userData: AppUser = {
        id: String(rawUser.id),
        name: rawUser.nome ?? rawUser.name ?? '',
        email: rawUser.email,
        tenantId: rawUser.tenantId ?? null, // UUID ou null
        role:
          rawUser.perfil === 'super_admin'
            ? 'admin'
            : (rawUser.role as 'admin' | 'user') ?? 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setUser(userData)
    } catch (error) {
      // Propaga para a tela de login mostrar mensagem
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setToken(null)

    // Chamar API de logout (opcional)
    authService.logout().catch(() => {
      // Ignorar erros no logout
    })
  }

  const impersonate = async (tenantId: string) => {
    try {
      setLoading(true)
      const response = await authService.impersonate(tenantId)

      // Normaliza tokens/usuário também aqui
      const accessToken =
        (response as any).accessToken ?? (response as any).access_token
      const rawUser =
        (response as any).usuario ?? (response as any).user

      if (accessToken) {
        localStorage.setItem('token', accessToken)
        setToken(accessToken)
      }

      const userData: AppUser = {
        id: String(rawUser.id),
        name: rawUser.nome ?? rawUser.name ?? '',
        email: rawUser.email,
        tenantId: rawUser.tenantId ?? null,
        role:
          rawUser.perfil === 'super_admin'
            ? 'admin'
            : (rawUser.role as 'admin' | 'user') ?? 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
    token,
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
