import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, X, Star, Crown, Zap, Shield, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { planService } from '../services/api'
// Tipo local para AppPlan
interface AppPlan {
  id: string
  name: string
  description?: string
  price?: number
  currency?: string
  interval?: string
  billingCycle?: 'monthly' | 'yearly'
  maxUsers?: number
  maxStorage?: number
  features?: string[]
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

// Componente Stepper
interface StepperProps {
  currentStep: number
  totalSteps: number
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { number: 1, title: 'Dados', description: 'Informações pessoais' },
    { number: 2, title: 'Verificação', description: 'Confirmar email' },
    { number: 3, title: 'Plano', description: 'Escolher plano' },
    { number: 4, title: 'Pagamento', description: 'Finalizar' }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step.number <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number <= currentStep ? (
                  step.number < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )
                ) : (
                  step.number
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  step.number <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-400 hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-colors ${
                  step.number < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Interface para planos predefinidos
interface PredefinedPlan {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  billingCycle: 'monthly' | 'yearly'
  badge?: string
  badgeColor?: string
  cardStyle: {
    background: string
    border: string
    textColor?: string
  }
  features: Array<{
    name: string
    included: boolean
    limit?: string
  }>
  popular?: boolean
  icon: React.ReactNode
}

const ChoosePlan: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [plans, setPlans] = useState<AppPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  // Buscar planos da API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true)
        const response = await planService.getPlans()
        setPlans(response.filter(plan => plan.isActive))
      } catch (error) {
        console.error('Erro ao buscar planos:', error)
        toast.error('Erro ao carregar planos. Usando planos padrão.')
      } finally {
        setLoadingPlans(false)
      }
    }

    fetchPlans()
  }, [])

  // Planos predefinidos (fallback)
  const predefinedPlans: PredefinedPlan[] = [
    {
      id: 'free',
      name: 'Gratuito',
      description: 'Ideal para começar',
      price: 0,
      billingCycle: 'monthly',
      cardStyle: {
        background: 'bg-gray-100',
        border: 'border-gray-300'
      },
      icon: <Shield className="w-6 h-6 text-gray-600" />,
      features: [
        { name: 'Até 2 usuários', included: true },
        { name: '1GB de armazenamento', included: true },
        { name: 'Suporte por email', included: true },
        { name: 'Relatórios básicos', included: true },
        { name: 'Integrações avançadas', included: false },
        { name: 'Suporte prioritário', included: false },
        { name: 'Backup automático', included: false },
        { name: 'API personalizada', included: false }
      ]
    },
    {
      id: 'basic',
      name: 'Básico',
      description: 'Para pequenas empresas',
      price: billingCycle === 'monthly' ? 29.90 : 299.90,
      originalPrice: billingCycle === 'yearly' ? 358.80 : undefined,
      billingCycle,
      cardStyle: {
        background: 'bg-emerald-50',
        border: 'border-emerald-300'
      },
      icon: <Zap className="w-6 h-6 text-emerald-600" />,
      features: [
        { name: 'Até 10 usuários', included: true },
        { name: '10GB de armazenamento', included: true },
        { name: 'Suporte por email', included: true },
        { name: 'Relatórios básicos', included: true },
        { name: 'Integrações básicas', included: true },
        { name: 'Suporte prioritário', included: false },
        { name: 'Backup automático', included: false },
        { name: 'API personalizada', included: false }
      ]
    },
    {
      id: 'professional',
      name: 'Profissional',
      description: 'Para empresas em crescimento',
      price: billingCycle === 'monthly' ? 79.90 : 799.90,
      originalPrice: billingCycle === 'yearly' ? 958.80 : undefined,
      billingCycle,
      badge: 'Popular',
      badgeColor: 'bg-blue-600',
      popular: true,
      cardStyle: {
        background: 'bg-blue-50',
        border: 'border-blue-300'
      },
      icon: <Star className="w-6 h-6 text-blue-600" />,
      features: [
        { name: 'Até 50 usuários', included: true },
        { name: '100GB de armazenamento', included: true },
        { name: 'Suporte prioritário', included: true },
        { name: 'Relatórios avançados', included: true },
        { name: 'Integrações avançadas', included: true },
        { name: 'Backup automático', included: true },
        { name: 'API básica', included: true },
        { name: 'API personalizada', included: false }
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Para grandes empresas',
      price: billingCycle === 'monthly' ? 149.90 : 1499.90,
      originalPrice: billingCycle === 'yearly' ? 1798.80 : undefined,
      billingCycle,
      badge: 'VIP',
      badgeColor: 'bg-purple-600',
      cardStyle: {
        background: 'bg-purple-50',
        border: 'border-purple-300'
      },
      icon: <Crown className="w-6 h-6 text-purple-600" />,
      features: [
        { name: 'Usuários ilimitados', included: true },
        { name: 'Armazenamento ilimitado', included: true },
        { name: 'Suporte 24/7', included: true },
        { name: 'Relatórios personalizados', included: true },
        { name: 'Integrações ilimitadas', included: true },
        { name: 'Backup automático', included: true },
        { name: 'API completa', included: true },
        { name: 'Gerente de conta dedicado', included: true }
      ]
    }
  ]

  // Usar planos da API se disponíveis, senão usar predefinidos
  const displayPlans = plans.length > 0 ? plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description || '',
    price: plan.price || 0,
    originalPrice: undefined,
    billingCycle: plan.interval as 'monthly' | 'yearly' || 'monthly',
    badge: undefined,
    badgeColor: undefined,
    popular: false,
    cardStyle: {
      background: 'bg-blue-50',
      border: 'border-blue-300'
    },
    icon: <Star className="w-6 h-6 text-blue-600" />,
    features: (plan.features || []).map(feature => ({
      name: feature,
      included: true
    }))
  })) : predefinedPlans

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleContinue = async () => {
    if (!selectedPlan) {
      toast.error('Por favor, selecione um plano para continuar.')
      return
    }

    setLoading(true)
    try {
      // Simular salvamento da seleção
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirecionar para página de pagamento
      navigate(`/payment?plan=${selectedPlan}&billing=${billingCycle}`)
      toast.success('Plano selecionado com sucesso!')
    } catch (error) {
      toast.error('Erro ao processar seleção. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100)
  }

  if (loadingPlans) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">GestaSaaS</h2>
        </div>

        {/* Stepper */}
        <Stepper currentStep={3} totalSteps={4} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal para sua empresa
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Selecione o plano que melhor atende às necessidades do seu negócio. 
            Você pode alterar ou cancelar a qualquer momento.
          </p>
        </div>

        {/* Toggle de cobrança */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Grid de planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className={`relative cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                selectedPlan === plan.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <div className={`${plan.cardStyle.background} ${plan.cardStyle.border} border-2 rounded-2xl p-6 h-full relative overflow-hidden`}>
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute top-4 right-4 ${plan.badgeColor || 'bg-blue-600'} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                    {plan.badge}
                  </div>
                )}

                {/* Popular indicator */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                      Mais Popular
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="mb-3">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-gray-500">
                        <span className="line-through">{formatPrice(plan.originalPrice)}</span>
                        <span className="ml-2 text-green-600 font-semibold">
                          -{getDiscountPercentage(plan.originalPrice, plan.price)}%
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      por {billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Selection indicator */}
                {selectedPlan === plan.id && (
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-10 rounded-2xl flex items-center justify-center">
                    <div className="bg-blue-600 text-white rounded-full p-2">
                      <Check className="w-6 h-6" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botão de comparação */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {showComparison ? 'Ocultar' : 'Ver'} comparação detalhada
          </button>
        </div>

        {/* Tabela de comparação */}
        {showComparison && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 overflow-x-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Comparação Detalhada de Planos
            </h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Recursos</th>
                  {displayPlans.map(plan => (
                    <th key={plan.id} className="text-center py-3 px-4 font-semibold text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {predefinedPlans[0].features.map((feature, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="py-3 px-4 text-gray-900">{feature.name}</td>
                    {displayPlans.map(plan => {
                      const planFeature = plan.features[index]
                      return (
                        <td key={plan.id} className="py-3 px-4 text-center">
                          {planFeature?.included ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Botões de navegação */}
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/verify-account')}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedPlan || loading}
            className="flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 mb-2">
            Todos os planos incluem teste gratuito de 14 dias
          </p>
          <p className="text-sm text-gray-500">
            Precisa de ajuda?{' '}
            <a href="mailto:suporte@gestasaas.com" className="text-blue-600 hover:text-blue-700 font-medium">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChoosePlan