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
  Car,
  Bike,
  MapPin,
  Clock,
  X
} from 'lucide-react'
import { toast } from 'sonner'

// Tipos
interface Receita {
  id: string
  dataHora: string
  aplicativo: 'uber' | 'glovo' | '99' | 'ifood'
  tipo: 'motorista' | 'entregador'
  valor: number
  kmRodados: number
  observacoes?: string
}

interface FiltrosReceita {
  dataInicio: string
  dataFim: string
  aplicativo: string
  tipo: string
}

interface EstatisticasApp {
  aplicativo: 'uber' | 'glovo' | '99' | 'ifood'
  valor: number
  percentual: number
  logo: string
  cor: string
  bgColor: string
}

const Receitas: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [filtros, setFiltros] = useState<FiltrosReceita>({
    dataInicio: '',
    dataFim: '',
    aplicativo: '',
    tipo: ''
  })
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFiltros, setShowFiltros] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [novaReceita, setNovaReceita] = useState<Partial<Receita>>({
    aplicativo: 'uber',
    tipo: 'motorista',
    valor: 0,
    kmRodados: 0,
    dataHora: new Date().toISOString().slice(0, 16),
    observacoes: ''
  })

  // Dados mockados para demonstração
  const receitasMock: Receita[] = [
    {
      id: '1',
      dataHora: '2024-01-15T08:30:00',
      aplicativo: 'uber',
      tipo: 'motorista',
      valor: 45.80,
      kmRodados: 12.5,
      observacoes: 'Corrida para aeroporto'
    },
    {
      id: '2',
      dataHora: '2024-01-15T12:15:00',
      aplicativo: 'ifood',
      tipo: 'entregador',
      valor: 28.50,
      kmRodados: 8.2,
      observacoes: 'Entrega no centro'
    },
    {
      id: '3',
      dataHora: '2024-01-15T14:45:00',
      aplicativo: 'glovo',
      tipo: 'entregador',
      valor: 22.30,
      kmRodados: 6.1
    },
    {
      id: '4',
      dataHora: '2024-01-15T18:20:00',
      aplicativo: '99',
      tipo: 'motorista',
      valor: 38.90,
      kmRodados: 15.3,
      observacoes: 'Corrida longa'
    },
    {
      id: '5',
      dataHora: '2024-01-14T20:10:00',
      aplicativo: 'uber',
      tipo: 'motorista',
      valor: 52.40,
      kmRodados: 18.7
    },
    {
      id: '6',
      dataHora: '2024-01-14T16:30:00',
      aplicativo: 'ifood',
      tipo: 'entregador',
      valor: 31.20,
      kmRodados: 9.4
    }
  ]

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setReceitas(receitasMock)
      setLoading(false)
    }, 1000)
  }, [])

  // Calcular estatísticas por aplicativo
  const calcularEstatisticas = (): EstatisticasApp[] => {
    const totalGeral = receitas.reduce((acc, r) => acc + r.valor, 0)
    
    const apps = ['uber', 'glovo', '99', 'ifood'] as const
    const cores = {
      uber: { cor: 'text-black', bgColor: 'bg-black', logo: '🚗' },
      glovo: { cor: 'text-orange-600', bgColor: 'bg-orange-50', logo: '🛵' },
      '99': { cor: 'text-yellow-600', bgColor: 'bg-yellow-50', logo: '🚕' },
      ifood: { cor: 'text-red-600', bgColor: 'bg-red-50', logo: '🍔' }
    }

    return apps.map(app => {
      const valorApp = receitas
        .filter(r => r.aplicativo === app)
        .reduce((acc, r) => acc + r.valor, 0)
      
      return {
        aplicativo: app,
        valor: valorApp,
        percentual: totalGeral > 0 ? (valorApp / totalGeral) * 100 : 0,
        logo: cores[app].logo,
        cor: cores[app].cor,
        bgColor: cores[app].bgColor
      }
    })
  }

  // Filtrar receitas
  const receitasFiltradas = receitas.filter(receita => {
    const matchBusca = receita.aplicativo.toLowerCase().includes(busca.toLowerCase()) ||
                      receita.tipo.toLowerCase().includes(busca.toLowerCase()) ||
                      receita.observacoes?.toLowerCase().includes(busca.toLowerCase())
    
    const matchApp = !filtros.aplicativo || receita.aplicativo === filtros.aplicativo
    const matchTipo = !filtros.tipo || receita.tipo === filtros.tipo
    
    // Filtro de data
    let matchData = true
    if (filtros.dataInicio && filtros.dataFim) {
      const dataReceita = new Date(receita.dataHora).toISOString().split('T')[0]
      matchData = dataReceita >= filtros.dataInicio && dataReceita <= filtros.dataFim
    }
    
    return matchBusca && matchApp && matchTipo && matchData
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarDataHora = (dataHora: string) => {
    return new Date(dataHora).toLocaleString('pt-BR')
  }

  const getAppName = (app: string) => {
    const names = {
      uber: 'Uber',
      glovo: 'Glovo',
      '99': '99',
      ifood: 'iFood'
    }
    return names[app as keyof typeof names] || app
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === 'motorista' ? <Car className="w-4 h-4" /> : <Bike className="w-4 h-4" />
  }

  const handleSubmitReceita = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!novaReceita.valor || !novaReceita.kmRodados) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const receita: Receita = {
      id: Date.now().toString(),
      dataHora: novaReceita.dataHora!,
      aplicativo: novaReceita.aplicativo!,
      tipo: novaReceita.tipo!,
      valor: novaReceita.valor!,
      kmRodados: novaReceita.kmRodados!,
      observacoes: novaReceita.observacoes
    }

    setReceitas(prev => [receita, ...prev])
    setShowModal(false)
    setNovaReceita({
      aplicativo: 'uber',
      tipo: 'motorista',
      valor: 0,
      kmRodados: 0,
      dataHora: new Date().toISOString().slice(0, 16),
      observacoes: ''
    })
    toast.success('Receita adicionada com sucesso!')
  }

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      aplicativo: '',
      tipo: ''
    })
    setBusca('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando receitas...</p>
        </div>
      </div>
    )
  }

  const estatisticas = calcularEstatisticas()
  const totalReceitas = receitasFiltradas.reduce((acc, r) => acc + r.valor, 0)
  const totalKm = receitasFiltradas.reduce((acc, r) => acc + r.kmRodados, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                Gestão de Receitas
              </h1>
              <p className="text-gray-600">
                Controle suas receitas de aplicativos de delivery e transporte
              </p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowFiltros(!showFiltros)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Receita
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {showFiltros && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aplicativo
                </label>
                <select
                  value={filtros.aplicativo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, aplicativo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos</option>
                  <option value="uber">Uber</option>
                  <option value="glovo">Glovo</option>
                  <option value="99">99</option>
                  <option value="ifood">iFood</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos</option>
                  <option value="motorista">Motorista</option>
                  <option value="entregador">Entregador</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por aplicativo, tipo ou observações..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <button
                onClick={limparFiltros}
                className="ml-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Cards de Resumo por Aplicativo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {estatisticas.map((stat) => (
            <div key={stat.aplicativo} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stat.logo}</span>
                  <h3 className={`font-semibold ${stat.cor}`}>
                    {getAppName(stat.aplicativo)}
                  </h3>
                </div>
                <span className="text-sm text-gray-500">
                  {stat.percentual.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(stat.valor)}
                </p>
                <p className="text-sm text-gray-600">
                  {receitas.filter(r => r.aplicativo === stat.aplicativo).length} corridas/entregas
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Total de Receitas</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {formatarMoeda(totalReceitas)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {receitasFiltradas.length} registros
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Total KM</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {totalKm.toFixed(1)} km
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Distância percorrida
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Média por KM</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {totalKm > 0 ? formatarMoeda(totalReceitas / totalKm) : formatarMoeda(0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Receita por quilômetro
            </p>
          </div>
        </div>

        {/* Tabela de Receitas */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Histórico de Receitas
            </h3>
          </div>
          
          {receitasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma receita encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {receitas.length === 0 
                  ? 'Comece adicionando sua primeira receita'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Receita
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aplicativo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KM Rodados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receitasFiltradas.map((receita) => (
                    <tr key={receita.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatarDataHora(receita.dataHora)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          receita.aplicativo === 'uber' ? 'bg-black text-white' :
                          receita.aplicativo === 'glovo' ? 'bg-orange-100 text-orange-800' :
                          receita.aplicativo === '99' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getAppName(receita.aplicativo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          {getTipoIcon(receita.tipo)}
                          <span className="capitalize">{receita.tipo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                        {formatarMoeda(receita.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {receita.kmRodados.toFixed(1)} km
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {receita.observacoes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-emerald-600 hover:text-emerald-800 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Nova Receita */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nova Receita
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitReceita} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aplicativo *
                  </label>
                  <select
                    value={novaReceita.aplicativo}
                    onChange={(e) => setNovaReceita(prev => ({ ...prev, aplicativo: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="uber">🚗 Uber</option>
                    <option value="glovo">🛵 Glovo</option>
                    <option value="99">🚕 99</option>
                    <option value="ifood">🍔 iFood</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Serviço *
                  </label>
                  <select
                    value={novaReceita.tipo}
                    onChange={(e) => setNovaReceita(prev => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="motorista">🚗 Motorista</option>
                    <option value="entregador">🛵 Entregador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novaReceita.valor}
                    onChange={(e) => setNovaReceita(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    KM Rodados *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={novaReceita.kmRodados}
                    onChange={(e) => setNovaReceita(prev => ({ ...prev, kmRodados: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data/Hora *
                  </label>
                  <input
                    type="datetime-local"
                    value={novaReceita.dataHora}
                    onChange={(e) => setNovaReceita(prev => ({ ...prev, dataHora: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={novaReceita.observacoes}
                    onChange={(e) => setNovaReceita(prev => ({ ...prev, observacoes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Informações adicionais sobre a corrida/entrega..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Salvar Receita
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Receitas