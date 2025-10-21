import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface MercadoPagoPreference {
  id: string
  init_point: string
  sandbox_init_point: string
}

export interface CreatePreferenceRequest {
  items: Array<{
    title: string
    quantity: number
    unit_price: number
    currency_id?: string
  }>
  external_reference: string
  notification_url?: string
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: 'approved' | 'all'
  payer?: {
    name?: string
    surname?: string
    email?: string
    phone?: {
      area_code?: string
      number?: string
    }
    identification?: {
      type?: string
      number?: string
    }
    address?: {
      street_name?: string
      street_number?: number
      zip_code?: string
    }
  }
}

export interface MercadoPagoPayment {
  id: number
  status: string
  status_detail: string
  payment_method_id: string
  payment_type_id: string
  transaction_amount: number
  currency_id: string
  external_reference: string
  description: string
  payer: {
    id: string
    email: string
    identification: {
      type: string
      number: string
    }
  }
  date_created: string
  date_approved: string
  date_last_updated: string
}

export interface MercadoPagoStatusResponse {
  configured: boolean
  testMode: boolean
  message?: string
}

export interface CreatePaymentRequest {
  amount: number
  currency?: string
  description: string
  external_reference: string
  payer?: {
    email?: string
    name?: string
    surname?: string
  }
}

class MercadoPagoService {
  async createPreference(data: CreatePreferenceRequest): Promise<MercadoPagoPreference> {
    try {
      const response = await api.post('/mercado-pago/create-preference', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro ao criar preferência:', error)
      throw new Error(error.response?.data?.message || 'Erro ao criar preferência de pagamento')
    }
  }

  async getPayment(paymentId: string): Promise<MercadoPagoPayment> {
    try {
      const response = await api.get(`/mercado-pago/payment/${paymentId}`)
      return response.data.data
    } catch (error: any) {
      console.error('Erro ao buscar pagamento:', error)
      throw new Error(error.response?.data?.message || 'Erro ao buscar pagamento')
    }
  }

  async createPayment(data: CreatePaymentRequest): Promise<MercadoPagoPreference> {
    try {
      const response = await api.post('/mercado-pago/create-payment', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error)
      throw new Error(error.response?.data?.message || 'Erro ao criar pagamento')
    }
  }

  async checkStatus(): Promise<MercadoPagoStatusResponse> {
    try {
      const response = await api.get('/mercado-pago/status')
      return response.data.data
    } catch (error: any) {
      console.error('Erro ao verificar status:', error)
      throw new Error(error.response?.data?.message || 'Erro ao verificar status')
    }
  }

  // Método para redirecionar para o checkout do Mercado Pago
  redirectToCheckout(preference: MercadoPagoPreference, testMode: boolean = false) {
    const checkoutUrl = testMode ? preference.sandbox_init_point : preference.init_point
    window.open(checkoutUrl, '_blank')
  }

  // Método para gerar um external_reference único
  generateExternalReference(): string {
    return `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Método para formatar valor em centavos para reais
  formatCentsToReais(cents: number): number {
    return cents / 100
  }

  // Método para formatar valor em reais para centavos
  formatReaisToCents(reais: number): number {
    return Math.round(reais * 100)
  }
}

export const mercadoPagoService = new MercadoPagoService()
export default mercadoPagoService