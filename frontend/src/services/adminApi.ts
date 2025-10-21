import api from './api'

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error'
  database: boolean
  redis: boolean
  storage: boolean
  uptime: number
  version: string
  timestamp: string
  avgResponseTime: number
  dbConnections: number
  memoryUsage: number
  errors24h: number
}

export interface DashboardStats {
  totalTenants: number
  totalUsuarios: number
  assinaturasAtivas: number
  assinaturasCanceladas: number
  receitaTotal: number
  receitaMesAtual: number
  totalTransacoes: number
  totalKmRegistrados: number
  novosTenants30Dias: number
  novosUsuarios30Dias: number
}

export interface TenantStats {
  topTenantsByRevenue: Array<{
    id: string
    name: string
    revenue: number
    users: number
  }>
  topTenantsByUsers: Array<{
    id: string
    name: string
    users: number
    revenue: number
  }>
}

export interface SystemConfig {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  category: string
  description?: string
  isPublic: boolean
}


export interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string
  userEmail: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface TenantDetails {
  id: string
  name: string
  domain: string
  status: 'active' | 'inactive' | 'suspended'
  plan: {
    id: string
    name: string
    price: number
  }
  users: number
  revenue: number
  createdAt: string
  lastActivity: string
  razaoSocial?: string
  cnpj?: string
  email?: string
  telefone?: string
}

export const adminApi = {
  // Dashboard
  getSystemHealth: (): Promise<SystemHealth> =>
    api.get('/admin/dashboard/health').then(res => res.data),

  getDashboardStats: (): Promise<DashboardStats> =>
    api.get('/admin/dashboard/stats').then(res => res.data),

  getTenantStats: (): Promise<TenantStats> =>
    api.get('/admin/dashboard/tenant-stats').then(res => res.data),

  // Tenant Management
  getAllTenants: (): Promise<TenantDetails[]> =>
    api.get('/admin/tenants').then(res => res.data),

  updateTenantStatus: (tenantId: string, status: string): Promise<void> =>
    api.patch(`/admin/tenants/${tenantId}/status`, { status }),

  deleteTenant: (tenantId: string): Promise<void> =>
    api.delete(`/admin/tenants/${tenantId}`),

  impersonateTenant: (tenantId: string): Promise<{ token: string }> =>
    api.post(`/admin/tenants/${tenantId}/impersonate`).then(res => res.data),

  // System Configuration
  getSystemConfigs: (): Promise<SystemConfig[]> =>
    api.get('/admin/system/configs').then(res => res.data),

  updateSystemConfig: (configId: string, value: string): Promise<void> =>
    api.patch(`/admin/system/configs/${configId}`, { value }),

  createSystemConfig: (config: Omit<SystemConfig, 'id'>): Promise<SystemConfig> =>
    api.post('/admin/system/configs', config).then(res => res.data),

  deleteSystemConfig: (configId: string): Promise<void> =>
    api.delete(`/admin/system/configs/${configId}`),

  // Audit Logs
  getAuditLogs: (params?: {
    page?: number
    limit?: number
    action?: string
    entityType?: string
    userId?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    logs: AuditLog[]
    total: number
    page: number
    totalPages: number
  }> =>
    api.get('/admin/audit-logs', { params }).then(res => res.data),

  // User Management
  createSuperAdmin: (userData: {
    name: string
    email: string
    password: string
  }): Promise<void> =>
    api.post('/admin/users/super-admin', userData),

  bulkUpdateUsers: (userIds: string[], updates: Record<string, any>): Promise<void> =>
    api.patch('/admin/users/bulk', { userIds, updates }),

  bulkDeleteUsers: (userIds: string[]): Promise<void> =>
    api.delete('/admin/users/bulk', { data: { userIds } }),

  // System Operations
  getSystemInfo: (): Promise<{
    version: string
    environment: string
    nodeVersion: string
    uptime: number
    memoryUsage: Record<string, number>
    cpuUsage: number
  }> =>
    api.get('/admin/system/info').then(res => res.data),

  restartSystem: (): Promise<void> =>
    api.post('/admin/system/restart'),

  clearCache: (): Promise<void> =>
    api.post('/admin/system/clear-cache'),

  // Revenue Analytics
  getRevenueAnalytics: (params?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<{
    total: number
    data: Array<{
      date: string
      revenue: number
      subscriptions: number
    }>
  }> =>
    api.get('/admin/analytics/revenue', { params }).then(res => res.data)
}