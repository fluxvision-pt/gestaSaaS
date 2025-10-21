import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Filter, 
  Download, 
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { toast } from 'sonner'

// Tipos
interface Receita {
  id: string
  descricao: string
  valor: number
  categoria: string
  data: string
  status: 'recebida' | 'pendente' | 'vencida'
  cliente?: string
  formaPagamento: string
  observacoes?: string
}

interface FiltrosReceita {
  dataInicio: string
  dataFim: string
  categoria: string
  status: string
  cliente: string
  valorMin: string
  valorMax: string
}

const Receitas: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [filtros, setFiltros] = useState<FiltrosReceita>({
    dataInicio: '',
    dataFim: '',
    categoria: '',
    status: '',
    cliente: '',
    valorMin: '',
    valorMax: ''
  })
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFiltros, setShowFiltros] = useState(false)
  const [viewMode, setViewMode] = useState<'lista' | 'graficos'>('lista')

  // Dados mockados para demonstração
  const receitasMock: Receita[] = [
    {
      id: '1',
      descricao: 'Assinatura Premium - Janeiro',
      valor: 299.90,
      categoria: 'Assinaturas',
      data: '2024-01-15',
      status: 'recebida',
      cliente: 'João Silva',
      formaPagamento: 'Cartão de Crédito'
    },
    {
      id: '2',
      descricao: 'Consultoria Empresarial',
      valor: 1500.00,
      categoria: 'Serviços',
      data: '2024-01-20',
      status: 'recebida',
      cliente: 'Empresa ABC Ltda',
      formaPagamento: 'PIX'
    },
    {
      id: '3',
      descricao: 'Assinatura Basic - Janeiro',
      valor: 99.90,
      categoria: 'Assinaturas',
      data: '2024-01-25',
      status: 'pendente',
      cliente: 'Maria Santos',
      formaPagamento: 'Boleto'
    },
    {
      id: '4',
      descricao: 'Licença Software Anual',
      valor: 2400.00,
      categoria: 'Licenças',
      data: '2024-01-10',
      status: 'recebida',
      cliente: 'Tech Solutions',
      formaPagamento: 'Transferência'
    },
    {
      id: '5',
      descricao: 'Assinatura Premium - Dezembro',
      valor: 299.90,
      categoria: 'Assinaturas',
      data: '2023-12-15',
      status: 'vencida',
      cliente: 'Carlos Oliveira',
      formaPagamento: 'Cartão de Crédito'
    }
  ]

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setReceitas(receitasMock)
      setLoading(false)
    }, 1000)
  }, [])

  // Calcular estatísticas
  const estatisticas = {
    totalRecebido: receitas
      .filter(r => r.status === 'recebida')
      .reduce((acc, r) => acc + r.valor, 0),
    totalPendente: receitas
      .filter(r => r.status === 'pendente')
      .reduce((acc, r) => acc + r.valor, 0),
    totalVencido: receitas
      .filter(r => r.status === 'vencida')
      .reduce((acc, r) => acc + r.valor, 0),
    totalReceitas: receitas.length
  }

  // Filtrar receitas
  const receitasFiltradas = receitas.filter(receita => {
    const matchBusca = receita.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                      receita.cliente?.toLowerCase().includes(busca.toLowerCase()) ||
                      receita.categoria.toLowerCase().includes(busca.toLowerCase())
    
    const matchCategoria = !filtros.categoria || receita.categoria === filtros.categoria
    const matchStatus = !filtros.status || receita.status === filtros.status
    const matchCliente = !filtros.cliente || receita.cliente?.toLowerCase().includes(filtros.cliente.toLowerCase())
    
    return matchBusca && matchCategoria && matchStatus && matchCliente
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recebida': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'vencida': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'recebida': return 'Recebida'
      case 'pendente': return 'Pendente'
      case 'vencida': return 'Vencida'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando receitas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestão de Receitas
              </h1>
              <p className="text-gray-600">
                Controle e monitore todas as suas receitas
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex bg-white rounded-lg shadow-sm border">
                <button
                  onClick={() => setViewMode('lista')}
                  className={`px-4 py-2 rounded-l-lg text-sm font-medium transition-colors ${
                    viewMode === 'lista'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('graficos')}
                  className={`px-4 py-2 rounded-r-lg text-sm font-medium transition-colors ${
                    viewMode === 'graficos'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Gráficos
                </button>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Nova Receita
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatarMoeda(estatisticas.totalRecebido)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+12.5%</span>
              <span className="text-gray-500 ml-1">vs mês anterior</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatarMoeda(estatisticas.totalPendente)}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">
                {receitas.filter(r => r.status === 'pendente').length} receitas
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencido</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatarMoeda(estatisticas.totalVencido)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <ArrowDownRight className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">
                {receitas.filter(r => r.status === 'vencida').length} receitas
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Receitas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {estatisticas.totalReceitas}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">Este mês</span>
            </div>
          </div>
        </div>

        {viewMode === 'lista' ? (
          <>
            {/* Filtros e Busca */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar receitas..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => setShowFiltros(!showFiltros)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </button>
                </div>
              </div>

              {showFiltros && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={filtros.categoria}
                      onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Todas</option>
                      <option value="Assinaturas">Assinaturas</option>
                      <option value="Serviços">Serviços</option>
                      <option value="Licenças">Licenças</option>
                      <option value="Produtos">Produtos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filtros.status}
                      onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Todos</option>
                      <option value="recebida">Recebida</option>
                      <option value="pendente">Pendente</option>
                      <option value="vencida">Vencida</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Início
                    </label>
                    <input
                      type="date"
                      value={filtros.dataInicio}
                      onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Fim
                    </label>
                    <input
                      type="date"
                      value={filtros.dataFim}
                      onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tabela de Receitas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {receitasFiltradas.map((receita) => (
                      <tr key={receita.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {receita.descricao}
                            </div>
                            <div className="text-sm text-gray-500">
                              {receita.formaPagamento}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {receita.cliente || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatarMoeda(receita.valor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {receita.categoria}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatarData(receita.data)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(receita.status)}`}>
                            {getStatusText(receita.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Visualização de Gráficos */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Receitas por Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Receitas por Status
                </h3>
                <PieChart className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Recebidas</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatarMoeda(estatisticas.totalRecebido)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Pendentes</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatarMoeda(estatisticas.totalPendente)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Vencidas</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatarMoeda(estatisticas.totalVencido)}
                  </span>
                </div>
              </div>
            </div>

            {/* Gráfico de Receitas por Categoria */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Receitas por Categoria
                </h3>
                <BarChart3 className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-4">
                {['Assinaturas', 'Serviços', 'Licenças', 'Produtos'].map((categoria, index) => {
                  const total = receitas
                    .filter(r => r.categoria === categoria)
                    .reduce((acc, r) => acc + r.valor, 0)
                  const cores = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']
                  
                  return (
                    <div key={categoria} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${cores[index]} rounded-full mr-3`}></div>
                        <span className="text-sm text-gray-600">{categoria}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatarMoeda(total)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Evolução Mensal */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Evolução das Receitas
                </h3>
                <TrendingUp className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Gráfico de evolução das receitas será implementado aqui</p>
                <p className="text-sm">Integração com biblioteca de gráficos em desenvolvimento</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Receitas