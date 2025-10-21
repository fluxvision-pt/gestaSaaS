import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Car, TrendingUp, Shield, Users, Loader2, Crown } from 'lucide-react'
import { LanguageSelector } from '@/components/LanguageSelector'
import { toast } from 'sonner'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginType, setLoginType] = useState<'client' | 'admin'>('client')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { login, loading, user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Redirecionamento automático se já estiver logado
  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'admin' && !user.tenantId ? '/admin/dashboard' : '/dashboard'
      navigate(redirectPath)
    }
  }, [user, navigate])

  // Validação de email em tempo real
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError('')
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError('Email inválido')
      return false
    }
    setEmailError('')
    return true
  }

  // Validação de senha em tempo real
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('')
      return false
    }
    if (password.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent, type: 'client' | 'admin') => {
    e.preventDefault()
    
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    setIsLoading(true)

    try {
      await login({ email, senha: password })
      
      // Toast de sucesso
      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo${type === 'admin' ? ' ao painel administrativo' : ''}!`
      })
      
      // Aguardar um pouco para garantir que o contexto seja atualizado
      setTimeout(() => {
        const redirectPath = type === 'admin' ? '/admin/dashboard' : '/dashboard'
        navigate(redirectPath)
      }, 100)
    } catch (error: any) {
      console.error('Erro no login:', error)
      const errorMessage = error.response?.data?.message || t('auth.loginError')
      toast.error('Erro no login', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex flex-col">
      {/* Header com seletor de idioma */}
      <div className="flex justify-end p-4">
        <LanguageSelector />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Lado esquerdo - Informações do produto */}
          <div className="hidden lg:block space-y-8 animate-in slide-in-from-left duration-700">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 animate-in fade-in duration-1000">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Car className="h-8 w-8 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">GestaSaaS</h1>
              </div>
              <p className="text-xl text-gray-600">
                Sistema completo de gestão financeira para motoristas de aplicativo
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 animate-in slide-in-from-left duration-700 delay-200">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Controle Financeiro</h3>
                  <p className="text-gray-600">Gerencie receitas, despesas e acompanhe sua rentabilidade em tempo real</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 animate-in slide-in-from-left duration-700 delay-300">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Controle de KM</h3>
                  <p className="text-gray-600">Monitore quilometragem diária e calcule custos operacionais automaticamente</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 animate-in slide-in-from-left duration-700 delay-400">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Segurança Total</h3>
                  <p className="text-gray-600">Seus dados protegidos com criptografia de ponta e backups automáticos</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 animate-in slide-in-from-left duration-700 delay-500">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Multi-usuário</h3>
                  <p className="text-gray-600">Gerencie múltiplos motoristas e frotas com controle de acesso</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário de login */}
          <div className="w-full max-w-md mx-auto animate-in slide-in-from-right duration-700">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-1 text-center">
                <div className="flex items-center justify-center lg:hidden mb-4 animate-in zoom-in duration-500">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-2">
                    <Car className="h-8 w-8 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">GestaSaaS</span>
                </div>
                <CardTitle className="text-2xl text-gray-900">Faça seu login</CardTitle>
                <CardDescription className="text-gray-600">
                  Acesse sua conta para gerenciar suas finanças
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        validateEmail(e.target.value)
                      }}
                      className={`w-full transition-colors ${emailError ? 'border-red-500 focus:border-red-500' : 'focus:border-emerald-500'}`}
                      autoComplete="email"
                    />
                    {emailError && (
                      <p className="text-sm text-red-600 animate-in slide-in-from-top duration-200">
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Senha
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          validatePassword(e.target.value)
                        }}
                        className={`w-full pr-10 transition-colors ${passwordError ? 'border-red-500 focus:border-red-500' : 'focus:border-emerald-500'}`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-sm text-red-600 animate-in slide-in-from-top duration-200">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-gray-600">Lembrar de mim</span>
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>

                  {/* Botões diferenciados */}
                  <div className="space-y-3">
                    <Button 
                      type="button"
                      onClick={(e) => handleSubmit(e, 'client')}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 transform hover:scale-[1.02]" 
                      disabled={isLoading || loading}
                    >
                      {(isLoading || loading) && loginType === 'client' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          <Car className="mr-2 h-4 w-4" />
                          Login Cliente
                        </>
                      )}
                    </Button>

                    <Button 
                      type="button"
                      onClick={(e) => {
                        setLoginType('admin')
                        handleSubmit(e, 'admin')
                      }}
                      variant="outline"
                      className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200 transform hover:scale-[1.02]" 
                      disabled={isLoading || loading}
                    >
                      {(isLoading || loading) && loginType === 'admin' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          <Crown className="mr-2 h-4 w-4" />
                          SuperAdmin
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <Link 
                      to="/register" 
                      className="text-emerald-600 hover:text-emerald-500 font-medium transition-colors"
                    >
                      Criar conta
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
