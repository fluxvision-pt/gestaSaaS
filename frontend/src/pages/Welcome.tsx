import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Users, 
  Building2, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Play,
  X,
  Sparkles,
  Target,
  Zap,
  Shield,
  ChevronRight,
  BookOpen,
  Video,
  MessageCircle
} from 'lucide-react'
import { toast } from 'sonner'

// Interface para os passos do tour
interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  action?: string
}

// Interface para cards de primeiros passos
interface FirstStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  completed: boolean
  action: string
  route?: string
}

const Welcome: React.FC = () => {
  const navigate = useNavigate()
  const [showTour, setShowTour] = useState(false)
  const [currentTourStep, setCurrentTourStep] = useState(0)
  const [animationPhase, setAnimationPhase] = useState<'welcome' | 'content'>('welcome')
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  // Passos do tour guiado
  const tourSteps: TourStep[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Financeiro',
      description: 'Visualize todas as métricas importantes do seu negócio em tempo real. Acompanhe receitas, despesas e indicadores de performance.',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: 'Ver Dashboard'
    },
    {
      id: 'users',
      title: 'Gestão de Usuários',
      description: 'Gerencie sua equipe, defina permissões e controle o acesso às funcionalidades do sistema.',
      icon: <Users className="w-8 h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: 'Gerenciar Usuários'
    },
    {
      id: 'companies',
      title: 'Empresas e Clientes',
      description: 'Cadastre e organize suas empresas clientes, mantenha informações atualizadas e histórico de relacionamento.',
      icon: <Building2 className="w-8 h-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: 'Ver Empresas'
    },
    {
      id: 'payments',
      title: 'Controle de Pagamentos',
      description: 'Monitore pagamentos, assinaturas e transações. Tenha controle total sobre o fluxo financeiro.',
      icon: <CreditCard className="w-8 h-8" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: 'Ver Pagamentos'
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Personalize o sistema de acordo com suas necessidades. Configure integrações, notificações e preferências.',
      icon: <Settings className="w-8 h-8" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      action: 'Configurar Sistema'
    }
  ]

  // Cards de primeiros passos
  const firstSteps: FirstStep[] = [
    {
      id: 'profile',
      title: 'Complete seu Perfil',
      description: 'Adicione informações da sua empresa e configure suas preferências',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      completed: false,
      action: 'Completar Perfil',
      route: '/perfil'
    },
    {
      id: 'company',
      title: 'Cadastre sua Primeira Empresa',
      description: 'Adicione os dados da sua empresa principal para começar',
      icon: <Building2 className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      completed: false,
      action: 'Cadastrar Empresa',
      route: '/empresas'
    },
    {
      id: 'team',
      title: 'Convide sua Equipe',
      description: 'Adicione membros da equipe e defina suas permissões',
      icon: <Users className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      completed: false,
      action: 'Convidar Equipe',
      route: '/usuarios'
    },
    {
      id: 'explore',
      title: 'Explore o Dashboard',
      description: 'Familiarize-se com as principais funcionalidades',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      completed: false,
      action: 'Ver Dashboard',
      route: '/dashboard'
    }
  ]

  // Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationPhase('content')
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleStartTour = () => {
    setShowTour(true)
    setCurrentTourStep(0)
  }

  const handleNextTourStep = () => {
    if (currentTourStep < tourSteps.length - 1) {
      setCurrentTourStep(prev => prev + 1)
    } else {
      setShowTour(false)
      toast.success('Tour concluído! Agora você está pronto para começar.')
    }
  }

  const handlePrevTourStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(prev => prev - 1)
    }
  }

  const handleSkipTour = () => {
    setShowTour(false)
    toast.info('Tour pulado. Você pode acessá-lo novamente nas configurações.')
  }

  const handleStepAction = (step: FirstStep) => {
    if (step.route) {
      navigate(step.route)
    }
    
    // Marcar como concluído
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps(prev => [...prev, step.id])
      toast.success(`${step.title} marcado como concluído!`)
    }
  }

  const handleStartDashboard = () => {
    navigate('/dashboard')
    toast.success('Bem-vindo ao GestaSaaS! Vamos começar.')
  }

  if (animationPhase === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-8 animate-bounce">
            <Sparkles className="w-24 h-24 mx-auto text-yellow-300" />
          </div>
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            Bem-vindo ao GestaSaaS!
          </h1>
          <p className="text-xl opacity-90 animate-fade-in-delay">
            Sua jornada para o sucesso começa agora
          </p>
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Tour Modal */}
      {showTour && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Tour */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Tour Guiado - Passo {currentTourStep + 1} de {tourSteps.length}
                  </h3>
                  <div className="flex mt-2">
                    {tourSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-8 rounded-full mr-2 transition-colors ${
                          index <= currentTourStep ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleSkipTour}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Tour */}
            <div className="p-6">
              <div className={`${tourSteps[currentTourStep].bgColor} rounded-2xl p-6 mb-6`}>
                <div className={`${tourSteps[currentTourStep].color} mb-4`}>
                  {tourSteps[currentTourStep].icon}
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">
                  {tourSteps[currentTourStep].title}
                </h4>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {tourSteps[currentTourStep].description}
                </p>
              </div>

              {/* Botões de Navegação do Tour */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevTourStep}
                  disabled={currentTourStep === 0}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </button>

                <button
                  onClick={handleSkipTour}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Pular Tour
                </button>

                <button
                  onClick={handleNextTourStep}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentTourStep === tourSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Header de Boas-vindas */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Parabéns! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Sua conta foi ativada com sucesso
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Agora você tem acesso completo ao GestaSaaS. Vamos te ajudar a dar os primeiros passos.
          </p>
        </div>

        {/* Botões de Ação Principal */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-delay">
          <button
            onClick={handleStartTour}
            className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Fazer Tour Guiado
          </button>
          <button
            onClick={handleStartDashboard}
            className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Target className="w-5 h-5 mr-2" />
            Começar Agora
          </button>
        </div>

        {/* Cards de Primeiros Passos */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Primeiros Passos Recomendados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {firstSteps.map((step, index) => (
              <div
                key={step.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl hover:scale-105 cursor-pointer border-2 ${
                  completedSteps.includes(step.id) 
                    ? 'border-green-200 bg-green-50/50' 
                    : 'border-transparent hover:border-blue-200'
                }`}
                onClick={() => handleStepAction(step)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${step.bgColor} p-3 rounded-xl`}>
                    <div className={step.color}>
                      {step.icon}
                    </div>
                  </div>
                  {completedSteps.includes(step.id) ? (
                    <div className="bg-green-500 text-white p-1 rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="bg-gray-100 text-gray-400 p-1 rounded-full">
                      <span className="text-sm font-semibold px-2">{index + 1}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {step.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    completedSteps.includes(step.id) ? 'text-green-600' : step.color
                  }`}>
                    {completedSteps.includes(step.id) ? 'Concluído' : step.action}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recursos de Ajuda */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Precisa de Ajuda?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all">
              <div className="bg-blue-50 p-3 rounded-xl w-fit mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Documentação
              </h3>
              <p className="text-gray-600 mb-4">
                Guias completos e tutoriais detalhados
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Acessar Docs
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all">
              <div className="bg-green-50 p-3 rounded-xl w-fit mx-auto mb-4">
                <Video className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Vídeo Tutoriais
              </h3>
              <p className="text-gray-600 mb-4">
                Aprenda assistindo nossos tutoriais
              </p>
              <button className="text-green-600 hover:text-green-700 font-medium">
                Ver Vídeos
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all">
              <div className="bg-purple-50 p-3 rounded-xl w-fit mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Suporte
              </h3>
              <p className="text-gray-600 mb-4">
                Fale conosco para tirar suas dúvidas
              </p>
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                Contatar Suporte
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">
            Você pode refazer este tour a qualquer momento nas configurações
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Seus dados estão seguros conosco</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome