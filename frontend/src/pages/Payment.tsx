import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  QrCode, 
  FileText, 
  Shield, 
  Check, 
  Loader2,
  Upload,
  Clock,
  Copy,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import StripePaymentForm from '@/components/payments/StripePaymentForm'
import { MercadoPagoPaymentForm } from '@/components/payments/MercadoPagoPaymentForm'

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
                  <Check className="w-5 h-5" />
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

// Interface para o plano selecionado
interface SelectedPlan {
  id: string
  name: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  discount?: number
}

// Interface para dados do cartão
interface CardData {
  number: string
  name: string
  expiry: string
  cvv: string
}

const Payment: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'card' | 'mercadopago' | 'pix' | 'boleto'>('card')
  const [pixTimer, setPixTimer] = useState(600) // 10 minutos
  const [pixCode, setPixCode] = useState('')
  const [pixCopied, setPixCopied] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  // Dados do cartão
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })

  // Plano selecionado (simulado - normalmente viria dos parâmetros da URL)
  const [selectedPlan] = useState<SelectedPlan>({
    id: 'professional',
    name: 'Profissional',
    price: 49.90,
    billingCycle: 'monthly',
    features: [
      'Até 10 usuários',
      'Transações ilimitadas',
      'Relatórios avançados',
      'Suporte prioritário',
      'API integrations'
    ],
    discount: 20
  })

  // Timer do PIX
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTab === 'pix' && pixTimer > 0) {
      interval = setInterval(() => {
        setPixTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTab, pixTimer])

  // Gerar código PIX simulado
  useEffect(() => {
    if (activeTab === 'pix' && !pixCode) {
      setPixCode('00020126580014BR.GOV.BCB.PIX013636c4b8c4-4c4c-4c4c-4c4c-4c4c4c4c4c4c5204000053039865802BR5925GESTASAAS TECNOLOGIA LTDA6009SAO PAULO62070503***6304ABCD')
    }
  }, [activeTab, pixCode])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardInputChange = (field: keyof CardData, value: string) => {
    let formattedValue = value
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4)
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setPixCopied(true)
      toast.success('Código PIX copiado!')
      setTimeout(() => setPixCopied(false), 2000)
    } catch (err) {
      toast.error('Erro ao copiar código PIX')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Arquivo muito grande. Máximo 5MB.')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Apenas imagens são aceitas.')
        return
      }
      setUploadedFile(file)
      toast.success('Comprovante enviado com sucesso!')
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (activeTab === 'card') {
        // Validar dados do cartão
        if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
          toast.error('Preencha todos os campos do cartão')
          return
        }
      } else if (activeTab === 'pix' && !uploadedFile) {
        toast.error('Envie o comprovante do PIX')
        return
      } else if (activeTab === 'boleto' && !uploadedFile) {
        toast.error('Envie o comprovante do boleto')
        return
      }
      
      toast.success('Pagamento processado com sucesso!')
      
      // Redirecionar para página de onboarding
      setTimeout(() => {
        navigate('/welcome')
      }, 1500)
      
    } catch (error) {
      toast.error('Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateTotal = () => {
    const basePrice = selectedPlan.price
    const discount = selectedPlan.discount || 0
    const discountAmount = (basePrice * discount) / 100
    return basePrice - discountAmount
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header com Stepper */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finalizar Assinatura
          </h1>
          <p className="text-gray-600">
            Complete seu pagamento para ativar sua conta
          </p>
        </div>

        <Stepper currentStep={4} totalSteps={4} />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumo do Plano - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Resumo do Pedido
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-blue-900">
                      Plano {selectedPlan.name}
                    </h4>
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {selectedPlan.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {selectedPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-blue-800">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex justify-between text-sm text-blue-800 mb-1">
                      <span>Subtotal:</span>
                      <span>R$ {selectedPlan.price.toFixed(2)}</span>
                    </div>
                    {selectedPlan.discount && (
                      <div className="flex justify-between text-sm text-green-600 mb-1">
                        <span>Desconto ({selectedPlan.discount}%):</span>
                        <span>-R$ {((selectedPlan.price * selectedPlan.discount) / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold text-blue-900 border-t border-blue-200 pt-2">
                      <span>Total:</span>
                      <span>R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Selo de Segurança */}
                <div className="flex items-center justify-center p-3 bg-green-50 rounded-xl border border-green-200">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800 font-medium">
                    Pagamento 100% Seguro
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Pagamento */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              {/* Abas de Métodos de Pagamento */}
              <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setActiveTab('card')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'card'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Cartão (Stripe)
                </button>
                <button
                  onClick={() => setActiveTab('mercadopago')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'mercadopago'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Mercado Pago
                </button>
                <button
                  onClick={() => setActiveTab('pix')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'pix'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  PIX
                </button>
                <button
                  onClick={() => setActiveTab('boleto')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'boleto'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Boleto
                </button>
              </div>

              {/* Conteúdo das Abas */}
              <div className="space-y-6">
                {/* Cartão de Crédito com Stripe */}
                {activeTab === 'card' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Pagamento com Cartão
                    </h4>
                    
                    <StripePaymentForm
                      amount={selectedPlan.price * 100} // Converter para centavos
                      currency="brl"
                      description={`Assinatura ${selectedPlan.name} - ${selectedPlan.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}`}
                      onSuccess={(paymentIntent) => {
                        toast.success('Pagamento realizado com sucesso!')
                        // Redirecionar para página de sucesso ou dashboard
                        navigate('/dashboard')
                      }}
                      onError={(error) => {
                        toast.error(`Erro no pagamento: ${error}`)
                      }}
                    />
                  </div>
                )}

                {/* Mercado Pago */}
                {activeTab === 'mercadopago' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Pagamento via Mercado Pago
                    </h4>
                    
                    <MercadoPagoPaymentForm
                      amount={selectedPlan.price}
                      currency="BRL"
                      description={`Assinatura ${selectedPlan.name} - ${selectedPlan.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}`}
                      onSuccess={(payment) => {
                        toast.success('Pagamento realizado com sucesso!')
                        // Redirecionar para página de sucesso ou dashboard
                        navigate('/dashboard')
                      }}
                      onError={(error) => {
                        toast.error(`Erro no pagamento: ${error}`)
                      }}
                    />
                  </div>
                )}

                {/* PIX */}
                {activeTab === 'pix' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Pagamento via PIX
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Escaneie o QR Code ou copie o código PIX
                      </p>
                      
                      {/* Timer */}
                      <div className="flex items-center justify-center mb-6">
                        <Clock className="w-5 h-5 text-orange-500 mr-2" />
                        <span className="text-lg font-mono text-orange-600">
                          {formatTime(pixTimer)}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          para expirar
                        </span>
                      </div>
                    </div>
                    
                    {/* QR Code Simulado */}
                    <div className="flex justify-center mb-6">
                      <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Código PIX */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Código PIX (Copia e Cola)
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={pixCode}
                          readOnly
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl bg-gray-50 text-sm font-mono"
                        />
                        <button
                          onClick={copyPixCode}
                          className={`px-4 py-3 rounded-r-xl border border-l-0 border-gray-300 transition-colors ${
                            pixCopied
                              ? 'bg-green-500 text-white'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {pixCopied ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Upload do Comprovante */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Comprovante de Pagamento
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="pix-upload"
                        />
                        <label
                          htmlFor="pix-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            {uploadedFile ? uploadedFile.name : 'Clique para enviar o comprovante'}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            PNG, JPG até 5MB
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Boleto */}
                {activeTab === 'boleto' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Pagamento via Boleto
                      </h4>
                      <p className="text-gray-600 mb-6">
                        O boleto será gerado após a confirmação
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-yellow-800 mb-1">
                            Importante sobre o Boleto
                          </h5>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Vencimento em 3 dias úteis</li>
                            <li>• Pagamento pode levar até 2 dias úteis para compensar</li>
                            <li>• Sua conta será ativada após a confirmação do pagamento</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {/* Upload do Comprovante */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Comprovante de Pagamento (Opcional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="boleto-upload"
                        />
                        <label
                          htmlFor="boleto-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            {uploadedFile ? uploadedFile.name : 'Envie o comprovante para agilizar a ativação'}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            PNG, JPG até 5MB
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Navegação */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate('/choose-plan')}
                  className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </button>
                
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Finalizar Assinatura
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment