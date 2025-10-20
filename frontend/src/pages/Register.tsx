import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Car, TrendingUp, Shield, Users, CheckCircle } from 'lucide-react'
import { LanguageSelector } from '@/components/LanguageSelector'
import { authService } from '@/services/api'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefoneE164: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        telefoneE164: formData.telefoneE164 || undefined
      })
      
      setSuccess(true)
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Erro no cadastro:', error)
      setError(error.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Conta criada com sucesso!</h2>
              <p className="text-gray-600">
                Verifique seu email para ativar sua conta. Você será redirecionado para o login em alguns segundos.
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
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Lado esquerdo - Informações do produto */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">GestaSaaS</h1>
              </div>
              <p className="text-xl text-gray-600">
                Comece a gerenciar suas finanças como motorista de aplicativo
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Controle Financeiro</h3>
                  <p className="text-gray-600">Gerencie receitas, despesas e acompanhe sua rentabilidade em tempo real</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Controle de KM</h3>
                  <p className="text-gray-600">Monitore quilometragem diária e calcule custos operacionais automaticamente</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Segurança Total</h3>
                  <p className="text-gray-600">Seus dados protegidos com criptografia de ponta e backups automáticos</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
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

          {/* Lado direito - Formulário de cadastro */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-center lg:hidden mb-4">
                  <Car className="h-8 w-8 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">GestaSaaS</span>
                </div>
                <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
                <CardDescription className="text-center">
                  Preencha os dados para começar a usar o sistema
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
                    <label htmlFor="nome" className="text-sm font-medium text-gray-700">
                      Nome Completo *
                    </label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                      Telefone (opcional)
                    </label>
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="+55 11 99999-9999"
                      value={formData.telefoneE164}
                      onChange={(e) => handleInputChange('telefoneE164', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="senha" className="text-sm font-medium text-gray-700">
                      Senha *
                    </label>
                    <div className="relative">
                      <Input
                        id="senha"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua senha (mínimo 6 caracteres)"
                        value={formData.senha}
                        onChange={(e) => handleInputChange('senha', e.target.value)}
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

                  <div className="text-xs text-gray-600">
                    Ao criar uma conta, você concorda com nossos{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      Termos de Uso
                    </a>{' '}
                    e{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      Política de Privacidade
                    </a>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                      Fazer login
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