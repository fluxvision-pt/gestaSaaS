import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type {
  AppUser,
  AppTenant,
  AppPlan,
  CreateUserRequest,
  UpdateUserRequest,
  CreateTenantRequest,
  UpdateTenantRequest,
  CreatePlanRequest,
  UpdatePlanRequest,
  LoginRequest,
  LoginResponse,
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  AppPagamento,
  CreatePagamentoRequest,
  UpdatePagamentoRequest
} from '@/types'

// 🚀 Configuração da URL base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.fluxvision.cloud/api'
// Desenvolvimento: const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Criar instancia do axios
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

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou invalido - apenas limpar tokens
      // Deixar que o contexto de autenticação e rotas protegidas gerenciem o redirecionamento
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

// Servicos de API

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getCurrentUser: async (): Promise<AppUser> => {
    const response = await api.get('/auth/me')
    const user = response.data
    return {
      id: user.id.toString(), // UUID como string
      name: user.nome, // Backend retorna 'nome'
      email: user.email,
      role: user.perfil === 'super_admin' ? 'admin' : 'user', // Backend retorna 'perfil'
      tenantId: user.tenantId || null, // Manter como string (UUID) ou null para super_admin
      isActive: true,
      createdAt: new Date().toISOString(), // Backend não retorna essas datas no /auth/me
      updatedAt: new Date().toISOString()
    }
  },

  impersonate: async (tenantId: string): Promise<LoginResponse> => {
    const response = await api.post(`/auth/impersonate/${tenantId}`)
    return response.data
  },

  register: async (data: {
    nome: string
    email: string
    senha: string
    telefoneE164?: string
  }): Promise<{
    message: string
    usuario: {
      id: string
      nome: string
      email: string
      emailVerificado: boolean
    }
  }> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  forgotPassword: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', data)
    return response.data
  },

  resetPassword: async (data: {
    token: string
    novaSenha: string
  }): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', data)
    return response.data
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.get(`/auth/verify-email/${token}`)
    return response.data
  }
}

export const userService = {
  getUsers: async (): Promise<AppUser[]> => {
    const response = await api.get('/usuarios')
    const users = response.data
    return users.map((user: any) => ({
      id: user.id.toString(),
      name: user.name || user.nome,
      email: user.email,
      role: user.role || user.papel,
      status: user.status || 'ativo',
      phone: user.phone || user.telefone,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name || user.tenant.nome,
        domain: user.tenant.domain || user.tenant.dominio,
        status: user.tenant.status || 'ativo',
        createdAt: user.tenant.criadoEm || user.tenant.createdAt,
        updatedAt: user.tenant.atualizadoEm || user.tenant.updatedAt
      } : undefined,
      createdAt: user.criadoEm || user.createdAt,
      updatedAt: user.atualizadoEm || user.updatedAt
    }))
  },

  getUserById: async (id: string): Promise<AppUser> => {
    const response = await api.get(`/usuarios/${id}`)
    const user = response.data
    return {
      id: user.id.toString(),
      name: user.name || user.nome,
      email: user.email,
      role: user.role || user.papel,
      status: user.status || 'ativo',
      phone: user.phone || user.telefone,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name || user.tenant.nome,
        domain: user.tenant.domain || user.tenant.dominio,
        status: user.tenant.status || 'ativo',
        createdAt: user.tenant.criadoEm || user.tenant.createdAt,
        updatedAt: user.tenant.atualizadoEm || user.tenant.updatedAt
      } : undefined,
      createdAt: user.criadoEm || user.createdAt,
      updatedAt: user.atualizadoEm || user.updatedAt
    }
  },

  createUser: async (data: CreateUserRequest): Promise<AppUser> => {
    const response = await api.post('/usuarios', data)
    const user = response.data
    return {
      id: user.id.toString(),
      name: user.name || user.nome,
      email: user.email,
      role: user.role || user.papel,
      status: user.status || 'ativo',
      phone: user.phone || user.telefone,
      createdAt: user.criadoEm || user.createdAt,
      updatedAt: user.atualizadoEm || user.updatedAt
    }
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<AppUser> => {
    const response = await api.patch(`/usuarios/${id}`, data)
    const user = response.data
    return {
      ...user,
      id: user.id.toString()
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/usuarios/${id}`)
  },

  changePassword: async (id: string, data: {
    senhaAtual?: string
    novaSenha: string
  }): Promise<void> => {
    await api.patch(`/usuarios/${id}/change-password`, data)
  }
}

export const tenantService = {
  getTenants: async (): Promise<AppTenant[]> => {
    const response = await api.get('/tenants')
    const tenants = response.data
    return tenants.map((tenant: any) => ({
      id: tenant.id.toString(),
      name: tenant.name || tenant.nome,
      domain: tenant.domain || tenant.dominio,
      status: tenant.status || 'ativo',
      plan: tenant.plan ? {
        id: tenant.plan.id.toString(),
        name: tenant.plan.name || tenant.plan.nome,
        price: tenant.plan.price || tenant.plan.preco,
        features: tenant.plan.features || tenant.plan.recursos
      } : undefined,
      createdAt: tenant.criadoEm || tenant.createdAt,
      updatedAt: tenant.atualizadoEm || tenant.updatedAt
    }))
  },

  getTenantById: async (id: string): Promise<AppTenant> => {
    const response = await api.get(`/tenants/${id}`)
    const tenant = response.data
    return {
      id: tenant.id.toString(),
      name: tenant.name || tenant.nome,
      domain: tenant.domain || tenant.dominio,
      status: tenant.status || 'ativo',
      plan: tenant.plan ? {
        id: tenant.plan.id.toString(),
        name: tenant.plan.name || tenant.plan.nome,
        price: tenant.plan.price || tenant.plan.preco,
        features: tenant.plan.features || tenant.plan.recursos
      } : undefined,
      createdAt: tenant.criadoEm || tenant.createdAt,
      updatedAt: tenant.atualizadoEm || tenant.updatedAt
    }
  },

  createTenant: async (data: CreateTenantRequest): Promise<AppTenant> => {
    const response = await api.post('/tenants', data)
    const tenant = response.data
    return {
      id: tenant.id.toString(),
      name: tenant.name || tenant.nome,
      domain: tenant.domain || tenant.dominio,
      status: tenant.status || 'ativo',
      plan: tenant.plan ? {
        id: tenant.plan.id.toString(),
        name: tenant.plan.name || tenant.plan.nome,
        price: tenant.plan.price || tenant.plan.preco,
        features: tenant.plan.features || tenant.plan.recursos
      } : undefined,
      createdAt: tenant.criadoEm || tenant.createdAt,
      updatedAt: tenant.atualizadoEm || tenant.updatedAt
    }
  },

  updateTenant: async (id: string, data: UpdateTenantRequest): Promise<AppTenant> => {
    const response = await api.patch(`/tenants/${id}`, data)
    const tenant = response.data
    return {
      id: tenant.id,
      name: tenant.name || tenant.nome,
      domain: tenant.domain || tenant.dominio,
      status: tenant.status || 'ativo',
      plan: tenant.plan ? {
        id: tenant.plan.id,
        name: tenant.plan.name || tenant.plan.nome,
        price: tenant.plan.price || tenant.plan.preco,
        features: tenant.plan.features || tenant.plan.recursos
      } : undefined,
      createdAt: tenant.criadoEm || tenant.createdAt,
      updatedAt: tenant.atualizadoEm || tenant.updatedAt
    }
  },

  deleteTenant: async (id: string): Promise<void> => {
    await api.delete(`/tenants/${id}`)
  }
}

export const planService = {
  getPlans: async (): Promise<AppPlan[]> => {
    const response = await api.get('/planos')
    const plans = response.data
    return plans.map((plan: any) => ({
      id: plan.id.toString(),
      name: plan.name || plan.nome,
      description: plan.description || plan.descricao,
      price: plan.price || plan.preco,
      currency: plan.currency || plan.moeda || 'BRL',
      interval: plan.interval || plan.intervalo || 'monthly',
      features: plan.features || plan.recursos || [],
      isActive: plan.isActive !== undefined ? plan.isActive : plan.ativo !== undefined ? plan.ativo : true,
      createdAt: plan.criadoEm || plan.createdAt,
      updatedAt: plan.atualizadoEm || plan.updatedAt
    }))
  },

  getPlanById: async (id: string): Promise<AppPlan> => {
    const response = await api.get(`/planos/${id}`)
    const plan = response.data
    return {
      id: plan.id.toString(),
      name: plan.name || plan.nome,
      description: plan.description || plan.descricao,
      price: plan.price || plan.preco,
      currency: plan.currency || plan.moeda || 'BRL',
      interval: plan.interval || plan.intervalo || 'monthly',
      features: plan.features || plan.recursos || [],
      isActive: plan.isActive !== undefined ? plan.isActive : plan.ativo !== undefined ? plan.ativo : true,
      createdAt: plan.criadoEm || plan.createdAt,
      updatedAt: plan.atualizadoEm || plan.updatedAt
    }
  },

  createPlan: async (data: CreatePlanRequest): Promise<AppPlan> => {
    const response = await api.post('/planos', data)
    const plan = response.data
    return {
      id: plan.id.toString(),
      name: plan.name || plan.nome,
      description: plan.description || plan.descricao,
      price: plan.price || plan.preco,
      currency: plan.currency || plan.moeda || 'BRL',
      interval: plan.interval || plan.intervalo || 'monthly',
      features: plan.features || plan.recursos || [],
      isActive: plan.isActive !== undefined ? plan.isActive : plan.ativo !== undefined ? plan.ativo : true,
      createdAt: plan.criadoEm || plan.createdAt,
      updatedAt: plan.atualizadoEm || plan.updatedAt
    }
  },

  updatePlan: async (id: string, data: UpdatePlanRequest): Promise<AppPlan> => {
    const response = await api.patch(`/planos/${id}`, data)
    const plan = response.data
    return {
      id: plan.id.toString(),
      name: plan.name || plan.nome,
      description: plan.description || plan.descricao,
      price: plan.price || plan.preco,
      currency: plan.currency || plan.moeda || 'BRL',
      interval: plan.interval || plan.intervalo || 'monthly',
      features: plan.features || plan.recursos || [],
      isActive: plan.isActive !== undefined ? plan.isActive : plan.ativo !== undefined ? plan.ativo : true,
      createdAt: plan.criadoEm || plan.createdAt,
      updatedAt: plan.atualizadoEm || plan.updatedAt
    }
  },

  deletePlan: async (id: string): Promise<void> => {
    await api.delete(`/planos/${id}`)
  }
}

export const subscriptionService = {
  getSubscriptions: async (): Promise<Subscription[]> => {
    const response = await api.get('/assinaturas')
    return response.data
  },

  getSubscriptionById: async (id: number): Promise<Subscription> => {
    const response = await api.get(`/assinaturas/${id}`)
    return response.data
  },

  createSubscription: async (data: CreateSubscriptionRequest): Promise<Subscription> => {
    const response = await api.post('/assinaturas', data)
    return response.data
  },

  updateSubscription: async (id: number, data: UpdateSubscriptionRequest): Promise<Subscription> => {
    const response = await api.patch(`/assinaturas/${id}`, data)
    return response.data
  },

  deleteSubscription: async (id: number): Promise<void> => {
    await api.delete(`/assinaturas/${id}`)
  },

  cancelSubscription: async (id: number): Promise<Subscription> => {
    const response = await api.patch(`/assinaturas/${id}/cancel`)
    return response.data
  }
}

// Servico de Pagamentos
export const pagamentoService = {
  getPagamentos: async (): Promise<AppPagamento[]> => {
    const response = await api.get('/pagamentos')
    const pagamentos = response.data
    return pagamentos.map((pagamento: any) => ({
      id: pagamento.id || '',
      assinaturaId: pagamento.assinaturaId || '',
      valor: pagamento.valorCents ? pagamento.valorCents / 100 : 0,
      status: pagamento.status || 'pendente',
      metodo: pagamento.metodo || 'cartao',
      dataVencimento: pagamento.criadoEm || new Date().toISOString(),
      dataPagamento: pagamento.status === 'pago' ? pagamento.atualizadoEm : undefined,
      cliente: pagamento.assinatura?.tenant?.name || 'Cliente nao informado',
      plano: pagamento.assinatura?.plano?.nome || 'Plano nao informado',
      observacoes: pagamento.observacoes || '',
      moeda: pagamento.moeda || 'BRL',
      gatewayId: pagamento.gatewayId,
      referenciaExterna: pagamento.referenciaExterna,
      comprovanteUrl: pagamento.comprovanteUrl,
      createdAt: pagamento.criadoEm || new Date().toISOString(),
      updatedAt: pagamento.atualizadoEm || new Date().toISOString()
    }))
  },

  getPagamentoById: async (id: string): Promise<AppPagamento> => {
    const response = await api.get(`/pagamentos/${id}`)
    const pagamento = response.data
    return {
      id: pagamento.id || '',
      assinaturaId: pagamento.assinaturaId || '',
      valor: pagamento.valorCents ? pagamento.valorCents / 100 : 0,
      status: pagamento.status || 'pendente',
      metodo: pagamento.metodo || 'cartao',
      dataVencimento: pagamento.criadoEm || new Date().toISOString(),
      dataPagamento: pagamento.status === 'pago' ? pagamento.atualizadoEm : undefined,
      cliente: pagamento.assinatura?.tenant?.name || 'Cliente nao informado',
      plano: pagamento.assinatura?.plano?.nome || 'Plano nao informado',
      observacoes: pagamento.observacoes || '',
      moeda: pagamento.moeda || 'BRL',
      gatewayId: pagamento.gatewayId,
      referenciaExterna: pagamento.referenciaExterna,
      comprovanteUrl: pagamento.comprovanteUrl,
      createdAt: pagamento.criadoEm || new Date().toISOString(),
      updatedAt: pagamento.atualizadoEm || new Date().toISOString()
    }
  },

  createPagamento: async (data: CreatePagamentoRequest): Promise<AppPagamento> => {
    const response = await api.post('/pagamentos', data)
    const pagamento = response.data
    return {
      id: pagamento.id || '',
      assinaturaId: pagamento.assinaturaId || '',
      valor: pagamento.valorCents ? pagamento.valorCents / 100 : 0,
      status: pagamento.status || 'pendente',
      metodo: pagamento.metodo || 'cartao',
      dataVencimento: pagamento.criadoEm || new Date().toISOString(),
      dataPagamento: pagamento.status === 'pago' ? pagamento.atualizadoEm : undefined,
      cliente: pagamento.assinatura?.tenant?.name || 'Cliente nao informado',
      plano: pagamento.assinatura?.plano?.nome || 'Plano nao informado',
      observacoes: pagamento.observacoes || '',
      moeda: pagamento.moeda || 'BRL',
      gatewayId: pagamento.gatewayId,
      referenciaExterna: pagamento.referenciaExterna,
      comprovanteUrl: pagamento.comprovanteUrl,
      createdAt: pagamento.criadoEm || new Date().toISOString(),
      updatedAt: pagamento.atualizadoEm || new Date().toISOString()
    }
  },

  updatePagamento: async (id: string, data: UpdatePagamentoRequest): Promise<AppPagamento> => {
    const response = await api.patch(`/pagamentos/${id}`, data)
    const pagamento = response.data
    return {
      id: pagamento.id || '',
      assinaturaId: pagamento.assinaturaId || '',
      valor: pagamento.valorCents ? pagamento.valorCents / 100 : 0,
      status: pagamento.status || 'pendente',
      metodo: pagamento.metodo || 'cartao',
      dataVencimento: pagamento.criadoEm || new Date().toISOString(),
      dataPagamento: pagamento.status === 'pago' ? pagamento.atualizadoEm : undefined,
      cliente: pagamento.assinatura?.tenant?.name || 'Cliente nao informado',
      plano: pagamento.assinatura?.plano?.nome || 'Plano nao informado',
      observacoes: pagamento.observacoes || '',
      moeda: pagamento.moeda || 'BRL',
      gatewayId: pagamento.gatewayId,
      referenciaExterna: pagamento.referenciaExterna,
      comprovanteUrl: pagamento.comprovanteUrl,
      createdAt: pagamento.criadoEm || new Date().toISOString(),
      updatedAt: pagamento.atualizadoEm || new Date().toISOString()
    }
  },

  deletePagamento: async (id: string): Promise<void> => {
    await api.delete(`/pagamentos/${id}`)
  }
}

// Interfaces para Configuracoes
export interface AppConfiguracao {
  id: string
  chave: string
  valor: string
  tenantId?: string
}

export interface ConfiguracaoGeral {
  nomeEmpresa: string
  email: string
  telefone: string
  endereco: string
  timezone: string
  idioma: string
  moeda: string
}

export interface ConfiguracaoNotificacao {
  emailMarketing: boolean
  emailTransacional: boolean
  smsNotificacoes: boolean
  pushNotificacoes: boolean
  frequenciaRelatorios: 'diario' | 'semanal' | 'mensal'
  notificarVencimentos: boolean
  relatoriosSemanais: boolean
  alertasSeguranca: boolean
}

export interface ConfiguracaoSeguranca {
  autenticacaoDoisFatores: boolean
  sessaoMaxima: number
  logAuditoria: boolean
  backupAutomatico: boolean
  loginSocial: boolean
  sessaoTimeout: number
  tentativasLogin: number
}

export interface ConfiguracaoIntegracao {
  apiKey: string
  webhookUrl: string
  gatewayPagamento: 'stripe' | 'mercadopago' | 'pagseguro'
  emailProvider: 'sendgrid' | 'mailgun' | 'ses'
  backupAutomatico: boolean
  retencaoDados: number
  rateLimitRequests: number
}

export const configuracaoService = {
  getConfiguracoes: async (): Promise<{
    geral: ConfiguracaoGeral
    notificacao: ConfiguracaoNotificacao
    seguranca: ConfiguracaoSeguranca
    integracao: ConfiguracaoIntegracao
  }> => {
    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      geral: {
        nomeEmpresa: 'GestaSaaS',
        email: 'contato@exemplo.com',
        telefone: '+55 11 99999-9999',
        endereco: 'Rua das Empresas, 123 - São Paulo, SP',
        timezone: 'America/Sao_Paulo',
        idioma: 'pt-BR',
        moeda: 'BRL'
      },
      notificacao: {
        emailMarketing: true,
        emailTransacional: true,
        smsNotificacoes: false,
        pushNotificacoes: true,
        frequenciaRelatorios: 'semanal',
        notificarVencimentos: true,
        relatoriosSemanais: true,
        alertasSeguranca: true
      },
      seguranca: {
        autenticacaoDoisFatores: false,
        sessaoMaxima: 8,
        logAuditoria: true,
        backupAutomatico: true,
        loginSocial: false,
        sessaoTimeout: 30,
        tentativasLogin: 5
      },
      integracao: {
        apiKey: 'sk_test_123456789',
        webhookUrl: 'https://exemplo.com/webhook',
        gatewayPagamento: 'stripe',
        emailProvider: 'sendgrid',
        backupAutomatico: true,
        retencaoDados: 30,
        rateLimitRequests: 1000
      }
    }
  },

  saveConfiguracao: async (tipo: 'geral' | 'notificacao' | 'seguranca' | 'integracao', dados: any): Promise<void> => {
    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`Configuracao ${tipo} salva:`, dados)
  },

  gerarNovaApiKey: async (): Promise<string> => {
    // Simular geracao de nova API key
    await new Promise(resolve => setTimeout(resolve, 500))
    return `sk_test_${Math.random().toString(36).substring(2, 15)}`
  },

  restaurarPadroes: async (): Promise<void> => {
    // Simular restauracao de configuracoes padrao
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// Interfaces para Auditoria
export interface AppLogAuditoria {
  id: string
  timestamp: string
  usuario: string
  acao: string
  recurso: string
  status: 'SUCESSO' | 'FALHA' | 'PENDENTE' | 'CANCELADO'
  categoria: 'autenticacao' | 'usuarios' | 'pagamentos' | 'sistema' | 'configuracao'
  nivelRisco: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO'
  ip: string
  userAgent?: string
  detalhes: string
  metadata?: Record<string, any>
}

export interface FiltrosAuditoria {
  dataInicial?: string
  dataFinal?: string
  usuario?: string
  acao?: string
  status?: 'SUCESSO' | 'FALHA' | 'PENDENTE' | 'CANCELADO'
  categoria?: 'autenticacao' | 'usuarios' | 'pagamentos' | 'sistema' | 'configuracao'
  nivelRisco?: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO'
  limite?: number
  ordenacao?: 'asc' | 'desc'
}

export const auditoriaService = {
  getLogs: async (filtros?: FiltrosAuditoria): Promise<AppLogAuditoria[]> => {
    try {
      const params = new URLSearchParams()
      if (filtros?.dataInicial) params.append('dataInicial', filtros.dataInicial)
      if (filtros?.dataFinal) params.append('dataFinal', filtros.dataFinal)
      if (filtros?.usuario) params.append('usuario', filtros.usuario)
      if (filtros?.acao) params.append('acao', filtros.acao)
      if (filtros?.status) params.append('status', filtros.status)
      if (filtros?.categoria) params.append('categoria', filtros.categoria)
      if (filtros?.nivelRisco) params.append('nivelRisco', filtros.nivelRisco)
      if (filtros?.limite) params.append('limite', filtros.limite.toString())
      if (filtros?.ordenacao) params.append('ordenacao', filtros.ordenacao)

      const response = await api.get(`/auditoria?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error)
      // Fallback para dados simulados em caso de erro
      await new Promise(resolve => setTimeout(resolve, 800))
    
    const acoes = [
      'Login realizado', 'Logout realizado', 'Usuario criado', 'Usuario atualizado', 'Usuario excluido',
      'Pagamento processado', 'Pagamento cancelado', 'Assinatura criada', 'Assinatura cancelada',
      'Configuracao alterada', 'Backup realizado', 'Sistema reiniciado', 'API key gerada',
      'Relatorio exportado', 'Dados importados', 'Senha alterada', 'Perfil atualizado'
    ]
    
    const usuarios = ['admin@exemplo.com', 'usuario1@exemplo.com', 'usuario2@exemplo.com', 'sistema']
    const recursos = ['usuarios', 'pagamentos', 'assinaturas', 'configuracoes', 'sistema', 'relatorios']
    const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.10']
    
    const logs: AppLogAuditoria[] = []
    
    for (let i = 0; i < 50; i++) {
      const status = Math.random() > 0.1 ? 'SUCESSO' : Math.random() > 0.5 ? 'FALHA' : Math.random() > 0.5 ? 'PENDENTE' : 'CANCELADO'
      const categoria = ['autenticacao', 'usuarios', 'pagamentos', 'sistema', 'configuracao'][Math.floor(Math.random() * 5)] as any
      const nivelRisco = status === 'FALHA' ? 'ALTO' : Math.random() > 0.7 ? 'MEDIO' : Math.random() > 0.5 ? 'BAIXO' : 'CRITICO'
      
      logs.push({
        id: `log_${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        acao: acoes[Math.floor(Math.random() * acoes.length)],
        recurso: recursos[Math.floor(Math.random() * recursos.length)],
        status,
        categoria,
        nivelRisco,
        ip: ips[Math.floor(Math.random() * ips.length)],
        detalhes: `Detalhes da acao ${acoes[Math.floor(Math.random() * acoes.length)].toLowerCase()}`
      })
    }
    
    // Aplicar filtros
    let logsFilterados = logs
    
    if (filtros?.status) {
      logsFilterados = logsFilterados.filter(log => log.status === filtros.status)
    }
    
    if (filtros?.categoria) {
      logsFilterados = logsFilterados.filter(log => log.categoria === filtros.categoria)
    }
    
    if (filtros?.nivelRisco) {
      logsFilterados = logsFilterados.filter(log => log.nivelRisco === filtros.nivelRisco)
    }
    
    if (filtros?.usuario) {
      logsFilterados = logsFilterados.filter(log => 
        log.usuario.toLowerCase().includes(filtros.usuario!.toLowerCase())
      )
    }
    
    if (filtros?.acao) {
      logsFilterados = logsFilterados.filter(log => 
        log.acao.toLowerCase().includes(filtros.acao!.toLowerCase())
      )
    }
    
    // Ordenar por timestamp
    logsFilterados.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return filtros?.ordenacao === 'asc' ? dateA - dateB : dateB - dateA
    })
    
    return logsFilterados
    }
  },

  // Buscar estatísticas de auditoria
  getStatistics: async (days: number = 30): Promise<any> => {
    try {
      const response = await api.get(`/auditoria/statistics?days=${days}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      // Retornar dados simulados em caso de erro
      return {
        totalEventos: 1250,
        eventosPorDia: Array.from({ length: days }, (_, i) => ({
          data: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          eventos: Math.floor(Math.random() * 50) + 10
        })),
        eventosPorTipo: [
          { tipo: 'Login', quantidade: 450 },
          { tipo: 'CRUD', quantidade: 320 },
          { tipo: 'Sistema', quantidade: 280 },
          { tipo: 'Configuração', quantidade: 200 }
        ],
        alertasSeguranca: 15,
        usuariosAtivos: 45
      }
    }
  },

  // Buscar alertas de segurança
  getSecurityAlerts: async (limit: number = 20): Promise<any[]> => {
    try {
      const response = await api.get(`/auditoria/security-alerts?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar alertas de segurança:', error)
      // Retornar dados simulados em caso de erro
      return [
        {
          id: '1',
          tipo: 'Múltiplas tentativas de login',
          usuario: 'usuario@exemplo.com',
          ip: '192.168.1.100',
          timestamp: new Date().toISOString(),
          severidade: 'alta'
        },
        {
          id: '2',
          tipo: 'Login de IP suspeito',
          usuario: 'admin@exemplo.com',
          ip: '203.0.113.10',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severidade: 'media'
        }
      ]
    }
  },

  exportLogs: async (filtros?: FiltrosAuditoria, formato: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    try {
      const params = new URLSearchParams()
      if (filtros?.dataInicial) params.append('dataInicial', filtros.dataInicial)
      if (filtros?.dataFinal) params.append('dataFinal', filtros.dataFinal)
      if (filtros?.usuario) params.append('usuario', filtros.usuario)
      if (filtros?.acao) params.append('acao', filtros.acao)
      if (filtros?.status) params.append('status', filtros.status)
      if (filtros?.categoria) params.append('categoria', filtros.categoria)
      if (filtros?.nivelRisco) params.append('nivelRisco', filtros.nivelRisco)
      params.append('formato', formato)

      const response = await api.get(`/auditoria/export?${params.toString()}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
      // Fallback para exportação local
      const logs = await auditoriaService.getLogs(filtros)
      
      if (formato === 'json') {
        const jsonContent = JSON.stringify(logs, null, 2)
        return new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      } else {
        const csvContent = [
          'ID,Timestamp,Usuario,Acao,Recurso,Status,Categoria,Risco,IP,Detalhes',
          ...logs.map(log => 
            `${log.id},${log.timestamp},${log.usuario},${log.acao},${log.recurso},${log.status},${log.categoria},${log.nivelRisco},${log.ip},"${log.detalhes}"`
          )
        ].join('\n')

        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      }
    }
  },

  getLogById: async (id: string): Promise<AppLogAuditoria | null> => {
    try {
      const response = await api.get(`/auditoria/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar log por ID:', error)
      // Fallback para busca local
      const logs = await auditoriaService.getLogs()
      return logs.find(log => log.id === id) || null
    }
  }
}

// Interfaces para Relatórios
export interface RelatorioRequest {
  tipo: 'usuarios' | 'empresas' | 'assinaturas' | 'auditoria' | 'financeiro'
  formato: 'pdf' | 'excel' | 'csv' | 'json'
  filtros?: {
    dataInicio?: string
    dataFim?: string
    empresaId?: string
    usuarioId?: string
    status?: string
  }
  agendamento?: {
    frequencia: 'diario' | 'semanal' | 'mensal'
    diasSemana?: number[]
    diaMes?: number
    hora: string
    ativo: boolean
  }
}

export interface RelatorioResponse {
  id: string
  nome: string
  tipo: string
  formato: string
  status: 'pendente' | 'processando' | 'concluido' | 'erro'
  dataGeracao: string
  tamanho?: number
  url?: string
  erro?: string
}

export interface RelatorioAgendado {
  id: string
  nome: string
  tipo: string
  formato: string
  frequencia: string
  proximaExecucao: string
  ativo: boolean
  ultimaExecucao?: string
  status?: string
}

export interface DashboardData {
  totalUsuarios: number
  totalEmpresas: number
  totalAssinaturas: number
  receitaMensal: number
  crescimentoUsuarios: number
  crescimentoReceita: number
  assinaturasPorPlano: Array<{ plano: string; quantidade: number }>
  receitaPorMes: Array<{ mes: string; receita: number }>
  // Campos específicos para relatórios
  totalRelatorios: number
  relatoriosHoje: number
  relatoriosAgendados: number
  formatosMaisUsados: Array<{ formato: string; quantidade: number }>
  relatoriosRecentes: Array<{
    id: string
    nome: string
    tipo: string
    dataGeracao: string
    status: string
  }>
}

export interface EstatisticasRelatorio {
  totalRelatorios: number
  relatoriosHoje: number
  relatoriosAgendados: number
  formatoMaisUsado: string
  tipoMaisGerado: string
}

// Serviço de Relatórios
export const relatoriosService = {
  // Gerar relatório
  gerarRelatorio: async (request: RelatorioRequest): Promise<RelatorioResponse> => {
    try {
      const response = await api.post('/relatorios/gerar', request)
      return response.data
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      // Fallback para dados simulados
      return {
        id: `rel_${Date.now()}`,
        nome: `Relatório ${request.tipo}`,
        tipo: request.tipo,
        formato: request.formato,
        status: 'processando',
        dataGeracao: new Date().toISOString()
      }
    }
  },

  // Listar relatórios
  listarRelatorios: async (): Promise<RelatorioResponse[]> => {
    try {
      const response = await api.get('/relatorios')
      return response.data
    } catch (error) {
      console.error('Erro ao listar relatórios:', error)
      // Fallback para dados simulados
      return [
        {
          id: 'rel_1',
          nome: 'Relatório de Usuários - Janeiro',
          tipo: 'usuarios',
          formato: 'pdf',
          status: 'concluido',
          dataGeracao: '2024-01-15T10:30:00Z',
          tamanho: 2048576,
          url: '/downloads/relatorio-usuarios-jan.pdf'
        },
        {
          id: 'rel_2',
          nome: 'Relatório Financeiro - Q4',
          tipo: 'financeiro',
          formato: 'excel',
          status: 'concluido',
          dataGeracao: '2024-01-10T14:20:00Z',
          tamanho: 1536000,
          url: '/downloads/relatorio-financeiro-q4.xlsx'
        }
      ]
    }
  },

  // Baixar relatório
  baixarRelatorio: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/relatorios/${id}/download`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
      throw error
    }
  },

  // Agendar relatório
  agendarRelatorio: async (request: RelatorioRequest): Promise<RelatorioAgendado> => {
    try {
      const response = await api.post('/relatorios/agendar', request)
      return response.data
    } catch (error) {
      console.error('Erro ao agendar relatório:', error)
      // Fallback para dados simulados
      return {
        id: `agenda_${Date.now()}`,
        nome: `Relatório ${request.tipo} Agendado`,
        tipo: request.tipo,
        formato: request.formato,
        frequencia: request.agendamento?.frequencia || 'mensal',
        proximaExecucao: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        ativo: true
      }
    }
  },

  // Listar relatórios agendados
  listarAgendados: async (): Promise<RelatorioAgendado[]> => {
    try {
      const response = await api.get('/relatorios/agendados')
      return response.data
    } catch (error) {
      console.error('Erro ao listar relatórios agendados:', error)
      // Fallback para dados simulados
      return [
        {
          id: 'agenda_1',
          nome: 'Relatório Mensal de Usuários',
          tipo: 'usuarios',
          formato: 'pdf',
          frequencia: 'mensal',
          proximaExecucao: '2024-02-01T09:00:00Z',
          ativo: true,
          ultimaExecucao: '2024-01-01T09:00:00Z',
          status: 'concluido'
        }
      ]
    }
  },

  // Obter dados do dashboard
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const response = await api.get('/relatorios/dashboard')
      return response.data
    } catch (error) {
      console.error('Erro ao obter dados do dashboard:', error)
      // Fallback para dados simulados
      return {
        totalUsuarios: 1250,
        totalEmpresas: 85,
        totalAssinaturas: 320,
        receitaMensal: 45000,
        crescimentoUsuarios: 12.5,
        crescimentoReceita: 8.3,
        assinaturasPorPlano: [
          { plano: 'Básico', quantidade: 150 },
          { plano: 'Pro', quantidade: 120 },
          { plano: 'Enterprise', quantidade: 50 }
        ],
        receitaPorMes: [
          { mes: 'Jan', receita: 42000 },
          { mes: 'Fev', receita: 45000 },
          { mes: 'Mar', receita: 48000 }
        ],
        // Campos específicos para relatórios
        totalRelatorios: 156,
        relatoriosHoje: 8,
        relatoriosAgendados: 12,
        formatosMaisUsados: [
          { formato: 'PDF', quantidade: 89 },
          { formato: 'Excel', quantidade: 45 },
          { formato: 'CSV', quantidade: 22 }
        ],
        relatoriosRecentes: [
          {
            id: '1',
            nome: 'Relatório de Usuários',
            tipo: 'usuarios',
            dataGeracao: new Date().toISOString(),
            status: 'concluido'
          },
          {
            id: '2',
            nome: 'Relatório Financeiro',
            tipo: 'financeiro',
            dataGeracao: new Date(Date.now() - 86400000).toISOString(),
            status: 'concluido'
          }
        ]
      }
    }
  },

  // Obter estatísticas de relatórios
  getEstatisticas: async (): Promise<EstatisticasRelatorio> => {
    try {
      const response = await api.get('/relatorios/estatisticas')
      return response.data
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      // Fallback para dados simulados
      return {
        totalRelatorios: 156,
        relatoriosHoje: 8,
        relatoriosAgendados: 12,
        formatoMaisUsado: 'PDF',
        tipoMaisGerado: 'usuarios'
      }
    }
  },

  // Cancelar relatório agendado
  cancelarAgendamento: async (id: string): Promise<void> => {
    try {
      await api.delete(`/relatorios/agendados/${id}`)
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      throw error
    }
  },

  // Atualizar status de agendamento
  atualizarAgendamento: async (id: string, ativo: boolean): Promise<RelatorioAgendado> => {
    try {
      const response = await api.patch(`/relatorios/agendados/${id}`, { ativo })
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      throw error
    }
  }
}

// Interfaces para Dashboard Financeiro
export interface DashboardFinanceiroData {
  saldoAtual: {
    valor: number
    variacao: number
  }
  receitasMes: {
    total: number
    quantidade: number
    variacao: number
  }
  despesasMes: {
    total: number
    quantidade: number
    variacao: number
  }
  transacoesRecentes: Array<{
    id: string
    descricao: string
    valor: number
    tipo: 'ENTRADA' | 'SAIDA'
    categoria: string
    data: string
  }>
  indicadores: {
    melhorDiaSemana: string
    kmEuroMedio: string
    metaMensal: number
    proximaManutencao: number
  }
}

export interface GraficoReceitasDespesas {
  mes: string
  receitas: number
  despesas: number
}

// Serviço do Dashboard Financeiro
export const dashboardFinanceiroService = {
  getDashboardData: async (): Promise<DashboardFinanceiroData> => {
    const response = await api.get('/financeiro/transacoes/dashboard/dados')
    return response.data
  },

  getGraficoReceitasDespesas: async (meses: number = 6): Promise<GraficoReceitasDespesas[]> => {
    const response = await api.get(`/financeiro/transacoes/dashboard/grafico-receitas-despesas?meses=${meses}`)
    return response.data
  },

  getSaldoAtual: async (): Promise<number> => {
    const response = await api.get('/financeiro/transacoes/dashboard/saldo-atual')
    return response.data
  },

  getTransacoesRecentes: async (limite: number = 5): Promise<any[]> => {
    const response = await api.get(`/financeiro/transacoes/dashboard/transacoes-recentes?limite=${limite}`)
    return response.data
  }
}

// Exportações explícitas para garantir compatibilidade
export type { DashboardData, RelatorioAgendado, RelatorioRequest, RelatorioResponse, EstatisticasRelatorio, DashboardFinanceiroData, GraficoReceitasDespesas }

export default api
