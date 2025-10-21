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
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Calendar,
  Filter
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi, type SystemHealth, type DashboardStats, type TenantStats } from '@/services/adminApi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Buscar dados do dashboard usando a API de admin
  const { data: stats, loading } = useApi<DashboardStats>(() => adminApi.getDashboardStats());
  const { data: health } = useApi<SystemHealth>(() => adminApi.getSystemHealth());
  const { data: tenantStats } = useApi<TenantStats>(() => adminApi.getTenantStats());

  // Dados mockados para demonstração (serão substituídos pela API real)
  const kpiData = {
    activeUsers: { value: 1247, growth: 12.5, trend: 'up' },
    monthlyRevenue: { value: 89750, growth: 8.3, trend: 'up' },
    conversion: { value: 3.2, growth: -2.1, trend: 'down', target: 5.0 },
    churnRate: { value: 2.8, growth: 0.5, trend: 'down' }
  };

  const recentUsers = [
    { id: 1, name: 'João Silva', email: 'joao@empresa.com', plan: 'Pro', status: 'active', joinedAt: '2024-01-15' },
    { id: 2, name: 'Maria Santos', email: 'maria@startup.com', plan: 'Business', status: 'trial', joinedAt: '2024-01-15' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@tech.com', plan: 'Pro', status: 'active', joinedAt: '2024-01-14' },
    { id: 4, name: 'Ana Oliveira', email: 'ana@digital.com', plan: 'Starter', status: 'active', joinedAt: '2024-01-14' },
    { id: 5, name: 'Carlos Lima', email: 'carlos@inovacao.com', plan: 'Business', status: 'suspended', joinedAt: '2024-01-13' }
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'Alto uso de CPU detectado (85%)', time: '5 min atrás' },
    { id: 2, type: 'info', message: 'Backup automático concluído com sucesso', time: '1 hora atrás' },
    { id: 3, type: 'error', message: '3 tentativas de login falharam para admin@sistema.com', time: '2 horas atrás' }
  ];

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
      {/* Header com avatar + dropdown */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard SuperAdmin</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.name}. Aqui está uma visão geral do sistema.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Super Admin</span>
          </Badge>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
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

      {/* Grid de KPI cards (4 colunas desktop, 2 mobile) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card "Usuários Ativos" (bg-emerald-50, ícone Users, valor + % crescimento) */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Usuários Ativos</CardTitle>
            <Users className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{kpiData.activeUsers.value.toLocaleString()}</div>
            <div className="flex items-center text-xs text-emerald-700 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+{kpiData.activeUsers.growth}% este mês</span>
            </div>
          </CardContent>
        </Card>

        {/* Card "Receita Mensal" (bg-blue-50, ícone DollarSign, valor + gráfico mini) */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Receita Mensal</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(kpiData.monthlyRevenue.value)}</div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center text-xs text-blue-700">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>+{kpiData.monthlyRevenue.growth}%</span>
              </div>
              <div className="w-16 h-6 bg-blue-200 rounded flex items-end justify-end px-1">
                <div className="w-1 h-2 bg-blue-500 rounded-sm mr-0.5"></div>
                <div className="w-1 h-3 bg-blue-500 rounded-sm mr-0.5"></div>
                <div className="w-1 h-4 bg-blue-500 rounded-sm mr-0.5"></div>
                <div className="w-1 h-5 bg-blue-600 rounded-sm"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card "Conversão" (bg-purple-50, ícone TrendingUp, % + meta) */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Conversão</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{kpiData.conversion.value}%</div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center text-xs text-purple-700">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                <span>{kpiData.conversion.growth}%</span>
              </div>
              <div className="text-xs text-purple-600">Meta: {kpiData.conversion.target}%</div>
            </div>
          </CardContent>
        </Card>

        {/* Card "Churn Rate" (bg-amber-50, ícone AlertTriangle, % + tendência) */}
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Churn Rate</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{kpiData.churnRate.value}%</div>
            <div className="flex items-center text-xs text-amber-700 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+{kpiData.churnRate.growth}% tendência</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de receita (Chart.js, 6 meses, filtros por plano) e Widget "Alertas do Sistema" */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico de receita */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Receita dos Últimos 6 Meses</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filtrar por Plano
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Gráfico Chart.js será implementado aqui</p>
                <p className="text-sm">Receita mensal com filtros por plano</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget "Alertas do Sistema" (notificações importantes) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Alertas do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-50">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === 'error' ? 'bg-red-500' :
                    alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela "Novos Usuários Hoje" (últimos 10, com ações rápidas) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Novos Usuários Hoje</span>
            </CardTitle>
            <Badge variant="secondary">{recentUsers.length} usuários</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Avatar + Nome + Email</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Plano atual (badge colorido)</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Status (ativo/suspenso/trial)</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Última atividade</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">Ações: Ver, Editar, Impersonar, Suspender</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className={
                        user.plan === 'Business' ? 'bg-purple-100 text-purple-800' :
                        user.plan === 'Pro' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {user.status === 'active' ? 'Ativo' :
                         user.status === 'trial' ? 'Trial' : 'Suspenso'}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(user.joinedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button variant="ghost" size="sm" title="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Impersonar">
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Suspender">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar com navegação fixa - Implementada via Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Estatísticas Gerais</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total de Empresas</span>
                    <span className="font-medium">{stats?.totalTenants || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Novos Tenants (30 dias)</span>
                    <span className="font-medium">{stats?.novosTenants30Dias || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total de Usuários</span>
                    <span className="font-medium">{stats?.totalUsuarios || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total de Transações</span>
                    <span className="font-medium">{stats?.totalTransacoes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">KM Registrados</span>
                    <span className="font-medium">{stats?.totalKmRegistrados?.toLocaleString() || 0}</span>
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
                      <span className="font-medium">{stats?.assinaturasAtivas || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Canceladas</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">{stats?.assinaturasCanceladas || 0}</span>
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