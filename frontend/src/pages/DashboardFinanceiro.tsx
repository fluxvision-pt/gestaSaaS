import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PiggyBank,
  Plus,
  Calendar,
  MapPin,
  Target,
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { dashboardFinanceiroService, type DashboardFinanceiroData, type GraficoReceitasDespesas } from '@/services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function DashboardFinanceiro() {
  const { t } = useTranslation()
  const [mesesGrafico, setMesesGrafico] = useState(6)

  // Buscar dados do dashboard
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useApi<DashboardFinanceiroData>(
    () => dashboardFinanceiroService.getDashboardData()
  )

  // Buscar dados do gráfico
  const { data: graficoData, loading: graficoLoading } = useApi<GraficoReceitasDespesas[]>(
    () => dashboardFinanceiroService.getGraficoReceitasDespesas(mesesGrafico),
    [mesesGrafico]
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getVariationIcon = (variation: number) => {
    return variation >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    )
  }

  const getVariationColor = (variation: number) => {
    return variation >= 0 ? 'text-green-600' : 'text-red-600'
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar dashboard</h2>
            <p className="text-gray-600">Não foi possível carregar os dados financeiros. Tente novamente mais tarde.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Dashboard Financeiro</h1>
            <p className="text-lg text-gray-600">Visão geral das suas finanças e transações</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Este mês
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cards de Resumo Rápido */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Saldo Atual */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Saldo Atual</CardTitle>
              <div className="p-2 rounded-lg bg-blue-200">
                <PiggyBank className="h-5 w-5 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="text-2xl font-bold text-blue-900">Carregando...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-900">
                    {formatCurrency(dashboardData?.saldoAtual.valor || 0)}
                  </div>
                  <div className={`flex items-center mt-2 text-sm font-medium ${getVariationColor(dashboardData?.saldoAtual.variacao || 0)}`}>
                    {getVariationIcon(dashboardData?.saldoAtual.variacao || 0)}
                    <span className="ml-1">
                      {formatPercentage(dashboardData?.saldoAtual.variacao || 0)} vs mês anterior
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Receitas do Mês */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Receitas do Mês</CardTitle>
              <div className="p-2 rounded-lg bg-green-200">
                <TrendingUp className="h-5 w-5 text-green-700" />
              </div>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="text-2xl font-bold text-green-900">Carregando...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-green-900">
                    {formatCurrency(dashboardData?.receitasMes.total || 0)}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className={`flex items-center text-sm font-medium ${getVariationColor(dashboardData?.receitasMes.variacao || 0)}`}>
                      {getVariationIcon(dashboardData?.receitasMes.variacao || 0)}
                      <span className="ml-1">
                        {formatPercentage(dashboardData?.receitasMes.variacao || 0)}
                      </span>
                    </div>
                    <span className="text-sm text-green-600">
                      {dashboardData?.receitasMes.quantidade || 0} transações
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Despesas do Mês */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Despesas do Mês</CardTitle>
              <div className="p-2 rounded-lg bg-red-200">
                <TrendingDown className="h-5 w-5 text-red-700" />
              </div>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="text-2xl font-bold text-red-900">Carregando...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-red-900">
                    {formatCurrency(dashboardData?.despesasMes.total || 0)}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className={`flex items-center text-sm font-medium ${getVariationColor(dashboardData?.despesasMes.variacao || 0)}`}>
                      {getVariationIcon(dashboardData?.despesasMes.variacao || 0)}
                      <span className="ml-1">
                        {formatPercentage(dashboardData?.despesasMes.variacao || 0)}
                      </span>
                    </div>
                    <span className="text-sm text-red-600">
                      {dashboardData?.despesasMes.quantidade || 0} transações
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico e Indicadores */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Gráfico Receitas vs Despesas */}
          <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="p-6 pb-4 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Receitas vs Despesas</CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Evolução financeira dos últimos {mesesGrafico} meses
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant={mesesGrafico === 3 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setMesesGrafico(3)}
                  >
                    3M
                  </Button>
                  <Button 
                    variant={mesesGrafico === 6 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setMesesGrafico(6)}
                  >
                    6M
                  </Button>
                  <Button 
                    variant={mesesGrafico === 12 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setMesesGrafico(12)}
                  >
                    1A
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {graficoLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center text-gray-500">Carregando gráfico...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={graficoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="mes" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                      tickFormatter={(value) => `€${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'receitas' ? 'Receitas' : 'Despesas'
                      ]}
                      labelStyle={{ color: '#333' }}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Grid de Indicadores */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="p-6 pb-4 bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="text-xl font-semibold text-gray-900">Indicadores KPI</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Métricas importantes do negócio
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {dashboardLoading ? (
                <div className="text-center text-gray-500">Carregando indicadores...</div>
              ) : (
                <>
                  {/* Melhor Dia da Semana */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-200">
                        <Calendar className="h-4 w-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Melhor Dia</p>
                        <p className="text-xs text-gray-600">da semana</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-700">
                      {dashboardData?.indicadores.melhorDiaSemana || 'N/A'}
                    </span>
                  </div>

                  {/* KM/€ Médio */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-green-200">
                        <MapPin className="h-4 w-4 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">KM/€ Médio</p>
                        <p className="text-xs text-gray-600">eficiência</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-700">
                      {dashboardData?.indicadores.kmEuroMedio || 'N/A'}
                    </span>
                  </div>

                  {/* Meta Mensal */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-yellow-200">
                        <Target className="h-4 w-4 text-yellow-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Meta Mensal</p>
                        <p className="text-xs text-gray-600">objetivo</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-yellow-700">
                      {formatCurrency(dashboardData?.indicadores.metaMensal || 0)}
                    </span>
                  </div>

                  {/* Próxima Manutenção */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-200">
                        <Wrench className="h-4 w-4 text-purple-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Próxima Manutenção</p>
                        <p className="text-xs text-gray-600">em dias</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-purple-700">
                      {dashboardData?.indicadores.proximaManutencao || 0} dias
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Widget de Transações Recentes */}
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="p-6 pb-4 bg-gradient-to-r from-indigo-50 to-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Transações Recentes</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Últimas movimentações financeiras
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {dashboardLoading ? (
              <div className="text-center text-gray-500 py-8">Carregando transações...</div>
            ) : (
              <div className="space-y-4">
                {dashboardData?.transacoesRecentes?.length ? (
                  dashboardData.transacoesRecentes.map((transacao) => (
                    <div key={transacao.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${transacao.tipo === 'ENTRADA' ? 'bg-green-200' : 'bg-red-200'}`}>
                          {transacao.tipo === 'ENTRADA' ? (
                            <TrendingUp className={`h-4 w-4 ${transacao.tipo === 'ENTRADA' ? 'text-green-700' : 'text-red-700'}`} />
                          ) : (
                            <TrendingDown className={`h-4 w-4 ${transacao.tipo === 'ENTRADA' ? 'text-green-700' : 'text-red-700'}`} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transacao.descricao}</p>
                          <p className="text-xs text-gray-600">{transacao.categoria}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${transacao.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                          {transacao.tipo === 'ENTRADA' ? '+' : '-'}{formatCurrency(Math.abs(transacao.valor))}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transacao.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>Nenhuma transação encontrada</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão Flutuante para Adicionar Transação */}
        <div className="fixed bottom-6 right-6">
          <Button 
            size="lg" 
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>
    </div>
  )
}