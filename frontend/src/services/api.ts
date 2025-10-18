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

// Configuracao base da API
const API_BASE_URL = process.env.API_URL || 'http://148.230.118.81:3001/api/v1'

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
      // Token expirado ou invalido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
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
      id: user.id,
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

  impersonate: async (tenantId: string): Promise<LoginResponse> => {
    const response = await api.post(`/auth/impersonate/${tenantId}`)
    return response.data
  }
}

export const userService = {
  getUsers: async (): Promise<AppUser[]> => {
    const response = await api.get('/usuarios')
    const users = response.data
    return users.map((user: any) => ({
      id: user.id,
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

  getUserById: async (id: number): Promise<AppUser> => {
    const response = await api.get(`/usuarios/${id}`)
    const user = response.data
    return {
      id: user.id,
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
      id: user.id,
      name: user.name || user.nome,
      email: user.email,
      role: user.role || user.papel,
      status: user.status || 'ativo',
      phone: user.phone || user.telefone,
      createdAt: user.criadoEm || user.createdAt,
      updatedAt: user.atualizadoEm || user.updatedAt
    }
  },

  updateUser: async (id: number, data: UpdateUserRequest): Promise<AppUser> => {
    const response = await api.patch(`/usuarios/${id}`, data)
    return response.data
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/usuarios/${id}`)
  }
}

export const tenantService = {
  getTenants: async (): Promise<AppTenant[]> => {
    const response = await api.get('/tenants')
    const tenants = response.data
    return tenants.map((tenant: any) => ({
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
    }))
  },

  getTenantById: async (id: string): Promise<AppTenant> => {
    const response = await api.get(`/tenants/${id}`)
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

  createTenant: async (data: CreateTenantRequest): Promise<AppTenant> => {
    const response = await api.post('/tenants', data)
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
      id: plan.id,
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
      id: plan.id,
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
      id: plan.id,
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
      id: plan.id,
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
        email: 'contato@gestasaas.com',
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
        webhookUrl: 'https://gestasaas.com/webhook',
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
  status: 'sucesso' | 'erro' | 'pendente'
  categoria: 'autenticacao' | 'usuarios' | 'pagamentos' | 'sistema' | 'configuracao'
  risco: 'baixo' | 'medio' | 'alto'
  ip: string
  userAgent?: string
  detalhes: string
  metadata?: Record<string, any>
}

export interface FiltrosAuditoria {
  dataInicio?: string
  dataFim?: string
  usuario?: string
  acao?: string
  status?: 'todos' | 'sucesso' | 'erro' | 'pendente'
  categoria?: 'todas' | 'autenticacao' | 'usuarios' | 'pagamentos' | 'sistema' | 'configuracao'
  risco?: 'todos' | 'baixo' | 'medio' | 'alto'
  limite?: number
  ordenacao?: 'asc' | 'desc'
}

export const auditoriaService = {
  getLogs: async (filtros?: FiltrosAuditoria): Promise<AppLogAuditoria[]> => {
    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const acoes = [
      'Login realizado', 'Logout realizado', 'Usuario criado', 'Usuario atualizado', 'Usuario excluido',
      'Pagamento processado', 'Pagamento cancelado', 'Assinatura criada', 'Assinatura cancelada',
      'Configuracao alterada', 'Backup realizado', 'Sistema reiniciado', 'API key gerada',
      'Relatorio exportado', 'Dados importados', 'Senha alterada', 'Perfil atualizado'
    ]
    
    const usuarios = ['admin@gestasaas.com', 'usuario1@empresa.com', 'usuario2@empresa.com', 'sistema']
    const recursos = ['usuarios', 'pagamentos', 'assinaturas', 'configuracoes', 'sistema', 'relatorios']
    const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.10']
    
    const logs: AppLogAuditoria[] = []
    
    for (let i = 0; i < 50; i++) {
      const status = Math.random() > 0.1 ? 'sucesso' : Math.random() > 0.5 ? 'erro' : 'pendente'
      const categoria = ['autenticacao', 'usuarios', 'pagamentos', 'sistema', 'configuracao'][Math.floor(Math.random() * 5)] as any
      const risco = status === 'erro' ? 'alto' : Math.random() > 0.7 ? 'medio' : 'baixo'
      
      logs.push({
        id: `log_${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        acao: acoes[Math.floor(Math.random() * acoes.length)],
        recurso: recursos[Math.floor(Math.random() * recursos.length)],
        status,
        categoria,
        risco,
        ip: ips[Math.floor(Math.random() * ips.length)],
        detalhes: `Detalhes da acao ${acoes[Math.floor(Math.random() * acoes.length)].toLowerCase()}`
      })
    }
    
    // Aplicar filtros
    let logsFilterados = logs
    
    if (filtros?.status && filtros.status !== 'todos') {
      logsFilterados = logsFilterados.filter(log => log.status === filtros.status)
    }
    
    if (filtros?.categoria && filtros.categoria !== 'todas') {
      logsFilterados = logsFilterados.filter(log => log.categoria === filtros.categoria)
    }
    
    if (filtros?.risco && filtros.risco !== 'todos') {
      logsFilterados = logsFilterados.filter(log => log.risco === filtros.risco)
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
  },

  exportLogs: async (filtros?: FiltrosAuditoria): Promise<Blob> => {
    const logs = await auditoriaService.getLogs(filtros)
    
    const csvContent = [
      'ID,Timestamp,Usuario,Acao,Recurso,Status,Categoria,Risco,IP,Detalhes',
      ...logs.map(log => 
        `${log.id},${log.timestamp},${log.usuario},${log.acao},${log.recurso},${log.status},${log.categoria},${log.risco},${log.ip},"${log.detalhes}"`
      )
    ].join('\n')

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  },

  getLogById: async (id: string): Promise<AppLogAuditoria | null> => {
    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const logs = await auditoriaService.getLogs()
    return logs.find(log => log.id === id) || null
  }
}

export default api