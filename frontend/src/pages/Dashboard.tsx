import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, DollarSign, TrendingUp } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { userService, tenantService, subscriptionService } from '@/services/api'
import { useMemo } from 'react'

export default function Dashboard() {
  const { t } = useTranslation()
  
  // Buscar dados reais da API
  const { data: users, loading: usersLoading } = useApi(() => userService.getUsers())
  const { data: tenants, loading: tenantsLoading } = useApi(() => tenantService.getTenants())

  const { data: subscriptions, loading: subscriptionsLoading } = useApi(() => subscriptionService.getSubscriptions())

  // Calcular estatísticas baseadas nos dados reais
  const stats = useMemo(() => {
    const totalUsers = users?.length || 0
    const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active')?.length || 0
    const totalTenants = tenants?.length || 0
    
    // Calcular receita mensal baseada nas assinaturas ativas
    const monthlyRevenue = subscriptions?.reduce((total, sub) => {
      if (sub.status === 'active' && sub.plan) {
        return total + (sub.plan.price || 0)
      }
      return total
    }, 0) || 0

    return [
      {
        name: 'Total de Usuários',
        value: totalUsers.toString(),
        change: '+4.75%',
        changeType: 'positive',
        icon: Users,
      },
      {
        name: 'Assinaturas Ativas',
        value: activeSubscriptions.toString(),
        change: '+54.02%',
        changeType: 'positive',
        icon: CreditCard,
      },
      {
        name: 'Receita Mensal',
        value: `R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        change: '+12.05%',
        changeType: 'positive',
        icon: DollarSign,
      },
      {
        name: 'Total de Empresas',
        value: totalTenants.toString(),
        change: '+2.02%',
        changeType: 'positive',
        icon: TrendingUp,
      },
    ]
  }, [users, subscriptions, tenants])

  const isLoading = usersLoading || tenantsLoading || subscriptionsLoading

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-lg text-gray-600">{t('dashboard.overview')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                </CardTitle>
                <div className="p-3 rounded-lg bg-blue-50">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {isLoading ? (
                  <div className="text-3xl font-bold text-gray-400">Carregando...</div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                )}
                <p className="text-sm text-green-600 font-medium mt-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change} em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-xl font-semibold text-gray-900">Atividade Recente</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-500">Carregando atividades...</div>
              ) : (
                <>
                  {subscriptions?.slice(0, 3).map((subscription) => (
                    <div key={subscription.id} className="flex items-center space-x-4 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Assinatura {subscription.status === 'active' ? 'ativa' : subscription.status}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {subscription.tenant?.name || 'Empresa não informada'}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500">Nenhuma atividade recente</div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="p-6 pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="text-xl font-semibold text-gray-900">Resumo Financeiro</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Visão geral das finanças do mês
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-500">Carregando dados financeiros...</div>
              ) : (
                <>
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-sm text-gray-600">Receita Total</span>
                    <span className="text-sm font-semibold text-gray-900">
                      R$ {(subscriptions?.reduce((total, sub) => {
                        if (sub.status === 'active' && sub.plan) {
                          return total + (sub.plan.price || 0)
                        }
                        return total
                      }, 0) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-sm text-gray-600">Assinaturas Ativas</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {subscriptions?.filter(sub => sub.status === 'active')?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <span className="text-sm text-gray-600">Total de Empresas</span>
                    <span className="text-sm font-semibold text-green-600">
                      {tenants?.length || 0}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <span className="text-sm font-medium text-gray-900">Total de Usuários</span>
                      <span className="text-lg font-bold text-blue-600">{users?.length || 0}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
         </div>
       </div>
     </div>
  )
}