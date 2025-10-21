import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'
import { stripeService, type CreatePaymentIntentRequest } from '@/services/stripe.service'

// Configurar Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

interface PaymentFormProps {
  amount: number
  currency?: string
  description?: string
  assinaturaId?: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'brl',
  description,
  assinaturaId,
  onSuccess,
  onError
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      // Criar PaymentIntent no backend
      const paymentIntentData: CreatePaymentIntentRequest = {
        amount,
        currency,
        description,
        assinaturaId
      }

      const { client_secret } = await stripeService.createPaymentIntent(paymentIntentData)

      // Confirmar pagamento no frontend
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Elemento do cartão não encontrado')
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (error) {
        setPaymentStatus('error')
        setErrorMessage(error.message || 'Erro ao processar pagamento')
        onError?.(error.message || 'Erro ao processar pagamento')
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('success')
        onSuccess?.(paymentIntent)
      }
    } catch (error) {
      setPaymentStatus('error')
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      setErrorMessage(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pagamento Realizado!
            </h3>
            <p className="text-gray-600">
              Seu pagamento foi processado com sucesso.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pagamento Seguro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>

          {paymentStatus === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Valor:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: currency.toUpperCase()
                }).format(amount)}
              </span>
            </div>
            {description && (
              <div className="flex justify-between text-sm">
                <span>Descrição:</span>
                <span className="text-gray-600">{description}</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              `Pagar ${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: currency.toUpperCase()
              }).format(amount)}`
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Seus dados estão protegidos com criptografia SSL
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

interface StripePaymentFormProps extends PaymentFormProps {}

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    const checkStripeStatus = async () => {
      try {
        const status = await stripeService.getStatus()
        setStripeConfigured(status.configured)
      } catch (error) {
        console.error('Erro ao verificar status do Stripe:', error)
        setStripeConfigured(false)
      }
    }

    checkStripeStatus()
  }, [])

  if (stripeConfigured === null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Carregando sistema de pagamento...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stripeConfigured || !stripePublishableKey) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {!stripePublishableKey 
                ? 'Chave pública do Stripe não configurada. Verifique as variáveis de ambiente.'
                : 'Sistema de pagamento não está configurado. Entre em contato com o suporte.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const options: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  )
}

export default StripePaymentForm