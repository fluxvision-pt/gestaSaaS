import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Car, CheckCircle, AlertCircle } from 'lucide-react'
import { LanguageSelector } from '@/components/LanguageSelector'
import { authService } from '@/services/api'

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    novaSenha: '',
    confirmarSenha: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Token de recuperação não encontrado na URL')
    }
  }, [token])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token de recuperação não encontrado')
      return
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword({
        token,
        novaSenha: formData.novaSenha
      })
      
      setSuccess(true)
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error)
      setError(error.response?.data?.message || 'Erro ao redefinir senha. Verifique se o token é válido.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <div className="flex justify-end absolute top-4 right-4">
          <LanguageSelector />
        </div>
        
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Link Inválido</h2>
              <p className="text-gray-600">
                O link de recuperação de senha é inválido ou expirou.
              </p>
              <div className="space-y-2">
                <Link to="/forgot-password">
                  <Button className="w-full">
                    Solicitar Nova Recuperação
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="flex justify-end absolute top-4 right-4">
          <LanguageSelector />
        </div>
        
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Senha redefinida!</h2>
              <p className="text-gray-600">
                Sua senha foi redefinida com sucesso. Você será redirecionado para o login em alguns segundos.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header com seletor de idioma */}
      <div className="flex justify-end p-4">
        <LanguageSelector />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <Car className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">GestaSaaS</span>
              </div>
              <CardTitle className="text-2xl text-center">Nova Senha</CardTitle>
              <CardDescription className="text-center">
                Digite sua nova senha para redefinir o acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="novaSenha" className="text-sm font-medium text-gray-700">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="novaSenha"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua nova senha (mínimo 6 caracteres)"
                      value={formData.novaSenha}
                      onChange={(e) => handleInputChange('novaSenha', e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmarSenha" className="text-sm font-medium text-gray-700">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua nova senha"
                      value={formData.confirmarSenha}
                      onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {formData.novaSenha && formData.confirmarSenha && (
                  <div className={`text-sm ${formData.novaSenha === formData.confirmarSenha ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.novaSenha === formData.confirmarSenha ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || formData.novaSenha !== formData.confirmarSenha}
                >
                  {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  Voltar para Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}