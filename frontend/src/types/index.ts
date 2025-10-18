// Tipos para as entidades
export interface AppUser {
  id: number
  name: string
  email: string
  phone?: string
  tenantId: number
  tenant?: AppTenant
  role: 'admin' | 'user'
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface AppTenant {
  id: string
  name: string
  domain: string
  isActive: boolean
  maxUsers: number
  currentUsers: number
  planId: number
  plan?: AppPlan
  createdAt: string
  updatedAt: string
}

export interface AppPlan {
  id: string
  name: string
  description: string
  price?: number
  maxUsers?: number
  features?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: number
  tenantId: number
  tenant?: AppTenant
  planId: number
  plan?: AppPlan
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'pending'
  startDate: string
  endDate: string
  nextBillingDate?: string
  paymentMethod: string
  amount: number
  createdAt: string
  updatedAt: string
}

// Tipos para requisições
export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  usuario: {
    id: string
    nome: string
    email: string
    perfil: string
    tenantId: string | null
    idiomaEfetivo: string
    moedaEfetiva: string
    paisEfetivo: string
  }
}

export interface CreateUserRequest {
  nome: string
  email: string
  senha: string
  telefoneE164?: string
  tenantId?: string
  perfil: 'super_admin' | 'cliente_admin' | 'cliente_usuario'
}

export interface UpdateUserRequest {
  nome?: string
  email?: string
  telefoneE164?: string
  tenantId?: string
  perfil?: 'super_admin' | 'cliente_admin' | 'cliente_usuario'
}

export interface CreateTenantRequest {
  nomeFantasia: string
  razaoSocial?: string
  documento: string
  email: string
  telefoneE164?: string
  codPais?: string
  idiomaPreferido?: string
  moedaPreferida?: string
}

export interface UpdateTenantRequest {
  nomeFantasia?: string
  razaoSocial?: string
  documento?: string
  email?: string
  telefoneE164?: string
  codPais?: string
  idiomaPreferido?: string
  moedaPreferida?: string
  status?: 'ativo' | 'suspenso' | 'cancelado'
}

export interface CreatePlanRequest {
  name: string
  description: string
  price: number
  maxUsers: number
  features: string[]
}

export interface UpdatePlanRequest {
  name?: string
  description?: string
  price?: number
  maxUsers?: number
  features?: string[]
  isActive?: boolean
}

export interface CreateSubscriptionRequest {
  tenantId: number
  planId: number
  paymentMethod: string
  startDate: string
  endDate: string
}

export interface UpdateSubscriptionRequest {
  planId?: number
  status?: 'active' | 'inactive' | 'cancelled' | 'expired' | 'pending'
  paymentMethod?: string
  endDate?: string
}

// Interfaces para Pagamentos
export interface AppPagamento {
  id: string
  assinaturaId: string
  valor: number
  status: 'pendente' | 'pago' | 'cancelado' | 'estornado'
  metodo?: 'cartao' | 'boleto' | 'pix' | 'transferencia'
  dataVencimento: string
  dataPagamento?: string
  cliente?: string
  plano?: string
  observacoes?: string
  moeda: string
  gatewayId?: string
  referenciaExterna?: string
  comprovanteUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePagamentoRequest {
  assinaturaId: string
  valorCents: number
  moeda?: string
  status?: 'pendente' | 'pago' | 'cancelado' | 'estornado'
  gatewayId?: string
  referenciaExterna?: string
  comprovanteUrl?: string
}

export interface UpdatePagamentoRequest {
  valorCents?: number
  moeda?: string
  status?: 'pendente' | 'pago' | 'cancelado' | 'estornado'
  gatewayId?: string
  referenciaExterna?: string
  comprovanteUrl?: string
}