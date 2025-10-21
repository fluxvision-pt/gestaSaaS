import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.fluxvision.cloud/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticacao
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface StripePaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
}

export interface StripeCustomer {
  id: string
  email: string
  name?: string
}

export interface StripeSubscription {
  id: string
  status: string
  current_period_start: number
  current_period_end: number
  customer: string
}

export interface CreatePaymentIntentRequest {
  amount: number
  currency?: string
  assinaturaId?: string
  description?: string
}

export interface CreateCustomerRequest {
  email: string
  name?: string
}

export interface CreateSubscriptionRequest {
  customerId: string
  priceId: string
  assinaturaId?: string
}

export interface StripeStatusResponse {
  configured: boolean
  message: string
}

class StripeService {
  private readonly baseUrl = '/stripe'

  // Criar PaymentIntent
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<StripePaymentIntent> {
    const response = await api.post(`${this.baseUrl}/payment-intent`, data)
    return response.data
  }

  // Criar cliente no Stripe
  async createCustomer(data: CreateCustomerRequest): Promise<StripeCustomer> {
    const response = await api.post(`${this.baseUrl}/customer`, data)
    return response.data
  }

  // Criar assinatura no Stripe
  async createSubscription(data: CreateSubscriptionRequest): Promise<StripeSubscription> {
    const response = await api.post(`${this.baseUrl}/subscription`, data)
    return response.data
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
    const response = await api.delete(`${this.baseUrl}/subscription/${subscriptionId}`)
    return response.data
  }

  // Buscar PaymentIntent
  async getPaymentIntent(paymentIntentId: string): Promise<any> {
    const response = await api.get(`${this.baseUrl}/payment-intent/${paymentIntentId}`)
    return response.data
  }

  // Verificar status da configuração do Stripe
  async getStatus(): Promise<StripeStatusResponse> {
    const response = await api.get(`${this.baseUrl}/status`)
    return response.data
  }
}

export const stripeService = new StripeService()