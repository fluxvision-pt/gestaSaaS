import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Settings
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi, type SystemHealth, type DashboardStats, type TenantStats } from '@/services/adminApi';



export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Buscar dados do dashboard usando a API de admin
  const { data: stats, loading } = useApi<DashboardStats>({
    initialData: {
      totalTenants: 0,
      activeTenants: 0,
      totalUsers: 0,
      activeUsers: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0
    },
    fetchFn: async () => {
      return await adminApi.getDashboardStats();
    }
  });

  const { data: health } = useApi<SystemHealth>({
    initialData: {
      status: 'healthy',
      database: true,
      redis: true,
      storage: true,
      uptime: 0,
      version: '',
      timestamp: ''
    },
    fetchFn: async () => {
      return await adminApi.getSystemHealth();
    }
  });

  const { data: tenantStats } = useApi<TenantStats>({
    initialData: {
      topTenantsByRevenue: [],
      topTenantsByUsers: []
    },
    fetchFn: async () => {
      return await adminApi.getTenantStats();
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Administração</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.nome}. Aqui está uma visão geral do sistema.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Super Admin</span>
          </Badge>
        </div>
      </div>

      {/* System Health */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Status do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Badge className={getHealthStatusColor(health.status)}>
                  {getHealthIcon(health.status)}
                  <span className="ml-1 capitalize">{health.status}</span>
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="font-medium">{formatUptime(health.uptime)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Database</p>
                <p className="font-medium">{health.database ? 'Online' : 'Offline'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="font-medium">{health.version}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeTenants} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.monthlyRevenue)} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalSubscriptions} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Views */}
      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants">Empresas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Recentes</CardTitle>
              <CardDescription>
                Últimas empresas cadastradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenantStats?.topTenantsByRevenue.slice(0, 5).map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {tenant.users} usuários
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(tenant.revenue)}</p>
                      <Badge variant="default">
                        Top Revenue
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Métricas de Crescimento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Novos Tenants (30d)</span>
                    <span className="font-medium">{stats?.novosTenants30Dias}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Novos Usuários (30d)</span>
                    <span className="font-medium">{stats?.novosUsuarios30Dias}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total de Transações</span>
                    <span className="font-medium">{stats?.totalTransacoes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">KM Registrados</span>
                    <span className="font-medium">{stats?.totalKmRegistrados?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Distribuição de Assinaturas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ativas</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{stats?.assinaturasAtivas}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Canceladas</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">{stats?.assinaturasCanceladas}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Informações do Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {health && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tempo de Resposta Médio</span>
                        <span>{health.avgResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conexões DB</span>
                        <span>{health.dbConnections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Versão</span>
                        <span>{health.version}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Recursos</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Uso de Memória</span>
                        <span>{health.memoryUsage} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime</span>
                        <span>{formatUptime(health.uptime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Erros (24h)</span>
                        <span className={health.errors24h > 0 ? 'text-red-600' : 'text-green-600'}>
                          {health.errors24h}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}