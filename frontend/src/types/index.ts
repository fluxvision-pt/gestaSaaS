// Tipos para as entidades
export interface AppPlan {
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

export interface AppTenant {
  id: string
  name: string
  domain: string
  status?: string
  isActive?: boolean
  maxUsers?: number
  currentUsers?: number
  planId?: number
  plan?: AppPlan
  users?: AppUser[]
  createdAt: string
  updatedAt: string
}

export interface AppUser {
  id: string
  name: string
  email: string
  phone?: string
  tenantId?: string | null  // UUID string ou null para super_admin
  tenant?: AppTenant
  role?: 'admin' | 'user'
  status?: string
  isActive?: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: number
  tenantId: string  // UUID string
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
  billingCycle: 'monthly' | 'yearly'
  maxUsers: number | null
  maxStorage: number | null
  features: string[]
}

export interface UpdatePlanRequest {
  name?: string
  description?: string
  price?: number
  billingCycle?: 'monthly' | 'yearly'
  maxUsers?: number | null
  maxStorage?: number | null
  features?: string[]
  isActive?: boolean
}

export interface CreateSubscriptionRequest {
  tenantId: string  // UUID string
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
