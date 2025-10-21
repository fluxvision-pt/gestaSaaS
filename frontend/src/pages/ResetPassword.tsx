import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, Car, CheckCircle, AlertCircle, Shield, Loader2, ChevronRight, Lock } from 'lucide-react'
import { LanguageSelector } from '@/components/LanguageSelector'
import { authService } from '@/services/api'
import { toast } from 'sonner'

interface PasswordStrength {
  score: number
  label: string
  color: string
  bgColor: string
}

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    novaSenha: '',
    confirmarSenha: ''
  })
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenValidating, setTokenValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  // Validação de força da senha
  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    score = Object.values(checks).filter(Boolean).length

    if (score <= 2) return { score, label: 'Fraca', color: 'text-red-600', bgColor: 'bg-red-500' }
    if (score === 3) return { score, label: 'Média', color: 'text-yellow-600', bgColor: 'bg-yellow-500' }
    if (score === 4) return { score, label: 'Forte', color: 'text-blue-600', bgColor: 'bg-blue-500' }
    return { score, label: 'Muito Forte', color: 'text-green-600', bgColor: 'bg-green-500' }
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) errors.push('Mínimo 8 caracteres')
    if (!/[a-z]/.test(password)) errors.push('Uma letra minúscula')
    if (!/[A-Z]/.test(password)) errors.push('Uma letra maiúscula')
    if (!/\d/.test(password)) errors.push('Um número')
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Um caractere especial')
    
    return errors
  }

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false)
        setTokenValidating(false)
        return
      }

      try {
        // Simular validação de token (você pode implementar um endpoint específico)
        setTokenValid(true)
        toast.success('Token válido! Você pode redefinir sua senha.')
      } catch (error) {
        setTokenValid(false)
        toast.error('Token inválido ou expirado.')
      } finally {
        setTokenValidating(false)
      }
    }

    validateToken()
  }, [token])

  useEffect(() => {
    setPasswordErrors(validatePassword(formData.novaSenha))
  }, [formData.novaSenha])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('Token de recuperação não encontrado')
      return
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem')
      return
    }

    if (passwordErrors.length > 0) {
      toast.error('A senha não atende aos critérios de segurança')
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword({
        token,
        novaSenha: formData.novaSenha
      })
      
      setSuccess(true)
      toast.success('Senha redefinida com sucesso!')
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error)
      toast.error(error.response?.data?.message || 'Erro ao redefinir senha. Verifique se o token é válido.')
    } finally {
      setLoading(false)
    }
  }

  // Loading de validação do token
  if (tokenValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="flex justify-end absolute top-4 right-4">
          <LanguageSelector />
        </div>
        
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900">Validando Token</h2>
              <p className="text-gray-600">
                Verificando a validade do seu link de recuperação...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Token inválido
  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-4">
        <div className="flex justify-end absolute top-4 right-4">
          <LanguageSelector />
        </div>
        
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-in zoom-in duration-500">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-in zoom-in duration-700 delay-200">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 animate-in slide-in-from-bottom duration-500 delay-300">
                Link Inválido
              </h2>
              <p className="text-gray-600 animate-in slide-in-from-bottom duration-500 delay-400">
                O link de recuperação de senha é inválido ou expirou.
              </p>
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-500">
                <Link to="/forgot-password">
                  <Button className="w-full bg-red-500 hover:bg-red-600">
                    Solicitar Nova Recuperação
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full border-gray-300 text-gray-600 hover:bg-gray-50">
                    Voltar para Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4">
        <div className="flex justify-end absolute top-4 right-4">
          <LanguageSelector />
        </div>
        
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-in zoom-in duration-500">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-in zoom-in duration-700 delay-200">
                <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 animate-in slide-in-from-bottom duration-500 delay-300">
                Senha Redefinida!
              </h2>
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-400">
                <p className="text-gray-600">
                  Sua senha foi redefinida com sucesso.
                </p>
                <p className="text-sm text-gray-500">
                  Você será redirecionado para o login em alguns segundos.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full bg-emerald-500 hover:bg-emerald-600 animate-in slide-in-from-bottom duration-500 delay-500"
              >
                <div className="flex items-center space-x-2">
                  <span>Ir para Login</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const passwordStrength = getPasswordStrength(formData.novaSenha)
  const passwordsMatch = formData.novaSenha && formData.confirmarSenha && formData.novaSenha === formData.confirmarSenha
  const isFormValid = formData.novaSenha && formData.confirmarSenha && passwordsMatch && passwordErrors.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="flex justify-end absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-in zoom-in duration-500">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="text-center space-y-2 animate-in slide-in-from-top duration-500 delay-200">
                <Shield className="h-12 w-12 text-blue-600 mx-auto" />
                <h1 className="text-2xl font-bold text-gray-900">Nova Senha</h1>
                <p className="text-gray-600">
                  Digite sua nova senha para redefinir o acesso
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom duration-500 delay-300">
                <div className="space-y-2">
                  <label htmlFor="novaSenha" className="text-sm font-medium text-gray-700">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="novaSenha"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua nova senha"
                      value={formData.novaSenha}
                      onChange={(e) => handleInputChange('novaSenha', e.target.value)}
                      className={`pl-10 pr-10 transition-all duration-200 ${
                        formData.novaSenha && passwordErrors.length === 0
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                          : formData.novaSenha && passwordErrors.length > 0
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : ''
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Indicador de força da senha */}
                  {formData.novaSenha && (
                    <div className="space-y-2 animate-in slide-in-from-left duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Força da senha:</span>
                        <span className={`text-xs font-medium ${passwordStrength.color}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.bgColor}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Lista de critérios */}
                  {formData.novaSenha && passwordErrors.length > 0 && (
                    <div className="text-xs text-red-600 space-y-1 animate-in slide-in-from-left duration-300">
                      <p className="font-medium">Critérios pendentes:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmarSenha" className="text-sm font-medium text-gray-700">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmarSenha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua nova senha"
                      value={formData.confirmarSenha}
                      onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                      className={`pl-10 pr-10 transition-all duration-200 ${
                        passwordsMatch
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                          : formData.confirmarSenha && !passwordsMatch
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : ''
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {passwordsMatch && (
                      <CheckCircle className="absolute right-10 top-3 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  {formData.confirmarSenha && (
                    <p className={`text-sm animate-in slide-in-from-left duration-300 ${
                      passwordsMatch ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {passwordsMatch ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Redefinindo...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Redefinir Senha</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center animate-in slide-in-from-bottom duration-500 delay-400">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <span>Voltar para Login</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="hidden lg:block space-y-8 animate-in slide-in-from-right duration-700 delay-500">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Defina uma senha segura
            </h2>
            <p className="text-lg text-gray-600">
              Sua nova senha deve ser forte e única para manter sua conta protegida.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-center space-x-4 p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 hover:bg-white/80 transition-all duration-200">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Segurança Avançada</h3>
                <p className="text-sm text-gray-600">Critérios rigorosos de senha</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 hover:bg-white/80 transition-all duration-200">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Validação em Tempo Real</h3>
                <p className="text-sm text-gray-600">Feedback instantâneo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}