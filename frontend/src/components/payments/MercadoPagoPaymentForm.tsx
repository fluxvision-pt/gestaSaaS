import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, CreditCard, Smartphone, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { mercadoPagoService, type CreatePaymentRequest } from '../../services/mercado-pago.service'

interface MercadoPagoPaymentFormProps {
  amount: number // Valor em centavos
  currency?: string
  description: string
  onSuccess?: (paymentData: any) => void
  onError?: (error: string) => void
  customerEmail?: string
  customerName?: string
}

export function MercadoPagoPaymentForm({
  amount,
  currency = 'BRL',
  description,
  onSuccess,
  onError,
  customerEmail,
  customerName
}: MercadoPagoPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'pix' | 'boleto'>('card')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }

  const handlePayment = async () => {
    setIsLoading(true)
    
    try {
      const externalReference = mercadoPagoService.generateExternalReference()
      
      const paymentData: CreatePaymentRequest = {
        amount,
        currency,
        description,
        external_reference: externalReference,
        payer: {
          email: customerEmail,
          name: customerName
        }
      }

      const preference = await mercadoPagoService.createPayment(paymentData)
      
      // Verificar se estamos em modo de teste
      const status = await mercadoPagoService.checkStatus()
      
      // Redirecionar para o checkout do Mercado Pago
      mercadoPagoService.redirectToCheckout(preference, status.testMode)
      
      // Simular sucesso após redirecionamento
      setTimeout(() => {
        onSuccess?.({
          id: preference.id,
          external_reference: externalReference,
          amount,
          currency,
          description
        })
      }, 1000)
      
    } catch (error: any) {
      console.error('Erro no pagamento:', error)
      const errorMessage = error.message || 'Erro ao processar pagamento'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img 
              src="https://logoeps.com/wp-content/uploads/2013/03/mercado-pago-vector-logo.png" 
              alt="Mercado Pago" 
              className="w-6 h-6"
            />
            Mercado Pago
          </CardTitle>
          <CardDescription>
            Pague com segurança usando cartão, PIX ou boleto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumo do Pagamento */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total a pagar:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(amount)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>

          {/* Métodos de Pagamento */}
          <div className="space-y-3">
            <h4 className="font-medium">Escolha o método de pagamento:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedMethod('card')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Cartão</div>
                    <div className="text-sm text-muted-foreground">
                      Crédito ou débito
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMethod('pix')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedMethod === 'pix' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">PIX</div>
                    <div className="text-sm text-muted-foreground">
                      Instantâneo
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMethod('boleto')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedMethod === 'boleto' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium">Boleto</div>
                    <div className="text-sm text-muted-foreground">
                      Até 3 dias úteis
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Informações do método selecionado */}
          {selectedMethod === 'card' && (
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                Você será redirecionado para o checkout seguro do Mercado Pago para inserir os dados do cartão.
              </AlertDescription>
            </Alert>
          )}

          {selectedMethod === 'pix' && (
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Após confirmar, você receberá um QR Code para pagamento instantâneo via PIX.
              </AlertDescription>
            </Alert>
          )}

          {selectedMethod === 'boleto' && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                O boleto será gerado e você poderá imprimir ou pagar online. Prazo de vencimento: 3 dias úteis.
              </AlertDescription>
            </Alert>
          )}

          {/* Botão de Pagamento */}
          <Button 
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Processando...' : `Pagar ${formatCurrency(amount)}`}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>

          {/* Informações de Segurança */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <img 
                src="https://logoeps.com/wp-content/uploads/2013/03/mercado-pago-vector-logo.png" 
                alt="Mercado Pago" 
                className="w-4 h-4"
              />
              Pagamento processado com segurança pelo Mercado Pago
            </div>
            <div className="text-xs text-muted-foreground">
              Seus dados estão protegidos com criptografia SSL
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Cartão de Crédito/Débito:</strong>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li>Aprovação instantânea</li>
                <li>Parcelamento disponível</li>
                <li>Principais bandeiras aceitas</li>
              </ul>
            </div>
            <div>
              <strong>PIX:</strong>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li>Pagamento instantâneo</li>
                <li>Disponível 24/7</li>
                <li>Sem taxas adicionais</li>
              </ul>
            </div>
          </div>
          
          <div>
            <strong>Boleto Bancário:</strong>
            <ul className="list-disc list-inside text-muted-foreground mt-1">
              <li>Pagamento em qualquer banco</li>
              <li>Vencimento em 3 dias úteis</li>
              <li>Confirmação em até 2 dias úteis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}