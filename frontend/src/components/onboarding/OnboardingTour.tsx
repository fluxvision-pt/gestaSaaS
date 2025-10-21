import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Users, 
  Building2, 
  CreditCard, 
  BarChart3,
  Settings,
  DollarSign,
  MapPin,
  FileText
} from 'lucide-react'


interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
}

interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao GestaSaaS!',
      description: 'Vamos fazer um tour rápido pelas principais funcionalidades do sistema para você começar a usar com confiança.',
      icon: <CheckCircle className="h-8 w-8 text-green-600" />
    },
    {
      id: 'dashboard',
      title: 'Dashboard Principal',
      description: 'Aqui você encontra um resumo geral do seu negócio: métricas importantes, receita, usuários ativos e muito mais.',
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      target: '[data-tour="dashboard"]'
    },
    {
      id: 'users',
      title: 'Gestão de Usuários',
      description: 'Gerencie todos os usuários da sua empresa: adicione novos colaboradores, defina permissões e controle acessos.',
      icon: <Users className="h-8 w-8 text-purple-600" />,
      target: '[data-tour="users"]'
    },
    {
      id: 'companies',
      title: 'Empresas',
      description: 'Visualize e gerencie as informações das empresas cadastradas no sistema.',
      icon: <Building2 className="h-8 w-8 text-orange-600" />,
      target: '[data-tour="companies"]'
    },
    {
      id: 'plans',
      title: 'Planos e Assinaturas',
      description: 'Configure planos de serviço e gerencie assinaturas dos seus clientes.',
      icon: <CreditCard className="h-8 w-8 text-indigo-600" />,
      target: '[data-tour="plans"]'
    },
    {
      id: 'financial',
      title: 'Controle Financeiro',
      description: 'Acompanhe receitas, despesas e tenha controle total sobre as finanças do seu negócio.',
      icon: <DollarSign className="h-8 w-8 text-green-600" />,
      target: '[data-tour="financial"]'
    },
    {
      id: 'km-tracking',
      title: 'Controle de KM',
      description: 'Monitore a quilometragem dos veículos e calcule custos operacionais automaticamente.',
      icon: <MapPin className="h-8 w-8 text-red-600" />,
      target: '[data-tour="km"]'
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Gere relatórios detalhados para análise de performance e tomada de decisões estratégicas.',
      icon: <FileText className="h-8 w-8 text-cyan-600" />,
      target: '[data-tour="reports"]'
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Personalize o sistema de acordo com suas necessidades e preferências.',
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      target: '[data-tour="settings"]'
    },
    {
      id: 'complete',
      title: 'Parabéns!',
      description: 'Você concluiu o tour inicial. Agora você está pronto para aproveitar ao máximo o GestaSaaS. Explore as funcionalidades e comece a gerenciar seu negócio!',
      icon: <CheckCircle className="h-8 w-8 text-green-600" />
    }
  ]

  const currentStepData = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsCompleted(true)
    onComplete()
    onClose()
  }

  const handleSkip = () => {
    onClose()
  }

  useEffect(() => {
    if (isOpen && currentStepData.target) {
      const element = document.querySelector(currentStepData.target)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-75')
        
        return () => {
          element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-75')
        }
      }
    }
  }, [currentStep, isOpen, currentStepData.target])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} de {steps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-3 mt-4">
            {currentStepData.icon}
            <div>
              <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <CardDescription className="text-sm leading-relaxed">
            {currentStepData.description}
          </CardDescription>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-500"
              >
                Pular Tour
              </Button>
              
              <Button
                onClick={handleNext}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === steps.length - 1 ? (
                  'Finalizar'
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}