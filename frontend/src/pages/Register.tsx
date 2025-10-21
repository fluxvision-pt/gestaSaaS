import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, Car, TrendingUp, Shield, Users, CheckCircle, User, Mail, Phone, Lock, Loader2, ChevronRight, UserPlus, Check, BarChart3, Calculator, Clock, Smartphone, CreditCard, FileText } from 'lucide-react'
import { LanguageSelector } from '@/components/LanguageSelector'
import { CountrySelector } from '@/components/CountrySelector'
import { authService } from '@/services/api'
import { toast } from 'sonner'
import { formatPhoneNumber, formatToE164, parseE164, getMaxLength } from '@/utils/phoneFormatter'

interface PasswordStrength {
  score: number
  label: string
  color: string
  bgColor: string
}

interface StepperProps {
  currentStep: number
  steps: string[]
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={index} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isCurrent 
                        ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' 
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span 
                  className={`
                    mt-2 text-xs font-medium text-center max-w-20
                    ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-emerald-500' : 'text-gray-400'}
                  `}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className={`
                    flex-1 h-0.5 mx-4 transition-all duration-300
                    ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState({ code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' })
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefoneE164: ''
  })
  const [formErrors, setFormErrors] = useState({
    nome: '',
    email: '',
    senha: [] as string[],
    telefoneE164: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const steps = ['Dados', 'Verificação', 'Plano', 'Pagamento']

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

  const validateName = (name: string): string => {
    if (!name.trim()) return 'Nome é obrigatório'
    if (name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) return 'Nome deve conter apenas letras'
    return ''
  }

  const validateEmail = (email: string): string => {
    if (!email) return 'Email é obrigatório'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Email inválido'
    return ''
  }

  const validatePhone = (phone: string): string => {
    if (!phone) return '' // Telefone é opcional
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''))) return 'Telefone inválido'
    return ''
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

  const handleInputChange = (field: string, value: string) => {
    if (field === 'telefoneE164') {
      // Formatar telefone com máscara
      const formatted = formatPhoneNumber(value, selectedCountry.dialCode)
      setPhoneDisplay(formatted)
      
      // Salvar no formato E164
      const e164 = formatToE164(formatted, selectedCountry.dialCode)
      setFormData(prev => ({ ...prev, telefoneE164: e164 }))
      
      // Validação
      const error = validatePhone(e164)
      setFormErrors(prev => ({ ...prev, telefoneE164: error }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))

      // Validação em tempo real
      let error = ''
      let passwordErrors: string[] = []

      switch (field) {
        case 'nome':
          error = validateName(value)
          setFormErrors(prev => ({ ...prev, nome: error }))
          break
        case 'email':
          error = validateEmail(value)
          setFormErrors(prev => ({ ...prev, email: error }))
          break
        case 'senha':
          passwordErrors = validatePassword(value)
          setFormErrors(prev => ({ ...prev, senha: passwordErrors }))
          break
      }
    }
  }

  const handleCountryChange = (country: any) => {
    setSelectedCountry(country)
    
    // Reformatar telefone existente com nova máscara
    if (phoneDisplay) {
      const cleanNumber = phoneDisplay.replace(/\D/g, '')
      const formatted = formatPhoneNumber(cleanNumber, country.dialCode)
      setPhoneDisplay(formatted)
      
      const e164 = formatToE164(formatted, country.dialCode)
      setFormData(prev => ({ ...prev, telefoneE164: e164 }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação final
    const nameError = validateName(formData.nome)
    const emailError = validateEmail(formData.email)
    const phoneError = validatePhone(formData.telefoneE164)
    const passwordErrors = validatePassword(formData.senha)

    setFormErrors({
      nome: nameError,
      email: emailError,
      telefoneE164: phoneError,
      senha: passwordErrors
    })

    if (nameError || emailError || phoneError || passwordErrors.length > 0) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    setLoading(true)

    try {
      await authService.register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        telefoneE164: formData.telefoneE164 || undefined
      })
      
      setSuccess(true)
      toast.success('Conta criada com sucesso!')
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Erro no cadastro:', error)
      toast.error(error.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Tela de sucesso
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
                Conta Criada!
              </h2>
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-400">
                <p className="text-gray-600">
                  Sua conta foi criada com sucesso.
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

  const passwordStrength = getPasswordStrength(formData.senha)
  const isFormValid = 
    formData.nome && 
    formData.email && 
    formData.senha && 
    !formErrors.nome && 
    !formErrors.email && 
    !formErrors.telefoneE164 && 
    formErrors.senha.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="flex justify-end absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Lado esquerdo - Informações do produto */}
        <div className="hidden lg:block space-y-8 animate-in slide-in-from-left duration-700 delay-500">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-900">GestaSaaS</h1>
            </div>
            <p className="text-xl text-gray-600">
              Comece a gerenciar suas finanças como motorista de aplicativo
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center space-x-4 p-5 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 hover:bg-white/90 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Dashboard Inteligente</h3>
                <p className="text-sm text-gray-600">Visualize seus ganhos, gastos e lucro em tempo real com gráficos interativos</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 hover:bg-white/90 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Cálculo Automático</h3>
                <p className="text-sm text-gray-600">Calcule automaticamente impostos, combustível e manutenção do veículo</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 hover:bg-white/90 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">App Mobile</h3>
                <p className="text-sm text-gray-600">Registre corridas e despesas direto do celular, mesmo offline</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 hover:bg-white/90 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Relatórios Completos</h3>
                <p className="text-sm text-gray-600">Gere relatórios detalhados para Imposto de Renda e controle pessoal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 hover:bg-white/90 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Controle de Jornada</h3>
                <p className="text-sm text-gray-600">Monitore horas trabalhadas e otimize sua produtividade diária</p>
              </div>
            </div>
          </div>

          {/* Seção de benefícios adicionais */}
          <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="h-8 w-8" />
              <div>
                <h3 className="text-xl font-bold">Teste Grátis por 30 dias</h3>
                <p className="text-emerald-100">Sem compromisso, cancele quando quiser</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-200" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-200" />
                <span>Suporte 24/7</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-200" />
                <span>Backup automático</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-200" />
                <span>Atualizações grátis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário de cadastro */}
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-in zoom-in duration-500">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="text-center space-y-2 animate-in slide-in-from-top duration-500 delay-200">
                <div className="flex items-center justify-center lg:hidden mb-4">
                  <Car className="h-8 w-8 text-emerald-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">GestaSaaS</span>
                </div>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <UserPlus className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
                <p className="text-gray-600">
                  Preencha os dados para começar a usar o sistema
                </p>
              </div>

              {/* Stepper Visual */}
              <div className="animate-in slide-in-from-bottom duration-500 delay-250">
                <Stepper currentStep={currentStep} steps={steps} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom duration-500 delay-300">
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium text-gray-700">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className={`pl-10 transition-all duration-200 ${
                        formData.nome && !formErrors.nome
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                          : formErrors.nome
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : ''
                      }`}
                      required
                    />
                    {formData.nome && !formErrors.nome && (
                      <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {formErrors.nome && (
                    <p className="text-sm text-red-600 animate-in slide-in-from-left duration-300">
                      {formErrors.nome}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 transition-all duration-200 ${
                        formData.email && !formErrors.email
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                          : formErrors.email
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : ''
                      }`}
                      required
                    />
                    {formData.email && !formErrors.email && (
                      <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-red-600 animate-in slide-in-from-left duration-300">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                    Telefone (opcional)
                  </label>
                  <div className="flex space-x-2">
                    <CountrySelector
                      value={selectedCountry.dialCode}
                      onChange={handleCountryChange}
                      className="flex-shrink-0"
                    />
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="telefone"
                        type="tel"
                        placeholder="Digite seu telefone"
                        value={phoneDisplay}
                        onChange={(e) => handleInputChange('telefoneE164', e.target.value)}
                        maxLength={getMaxLength(selectedCountry.dialCode) + 10} // +10 para caracteres de formatação
                        className={`pl-10 transition-all duration-200 ${
                          formData.telefoneE164 && !formErrors.telefoneE164
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                            : formErrors.telefoneE164
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : ''
                        }`}
                      />
                      {formData.telefoneE164 && !formErrors.telefoneE164 && (
                        <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  {formErrors.telefoneE164 && (
                    <p className="text-sm text-red-600 animate-in slide-in-from-left duration-300">
                      {formErrors.telefoneE164}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="senha" className="text-sm font-medium text-gray-700">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="senha"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={formData.senha}
                      onChange={(e) => handleInputChange('senha', e.target.value)}
                      className={`pl-10 pr-10 transition-all duration-200 ${
                        formData.senha && formErrors.senha.length === 0
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                          : formData.senha && formErrors.senha.length > 0
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
                  {formData.senha && (
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
                  {formData.senha && formErrors.senha.length > 0 && (
                    <div className="text-xs text-red-600 space-y-1 animate-in slide-in-from-left duration-300">
                      <p className="font-medium">Critérios pendentes:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {formErrors.senha.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-600 animate-in slide-in-from-bottom duration-500 delay-400">
                  Ao criar uma conta, você concorda com nossos{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-500 transition-colors">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-500 transition-colors">
                    Política de Privacidade
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Criando conta...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Criar Conta</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center animate-in slide-in-from-bottom duration-500 delay-500">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <Link 
                    to="/login" 
                    className="text-emerald-600 hover:text-emerald-500 font-medium transition-colors duration-200"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}