import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Edit,
  Trash2,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

interface Despesa {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  status: 'pago' | 'pendente' | 'vencido';
  fornecedor: string;
  formaPagamento: string;
  observacoes?: string;
  anexos?: string[];
}

const Despesas: React.FC = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    fornecedor: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [despesaSelecionada, setDespesaSelecionada] = useState<Despesa | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Dados mockados para demonstração
  useEffect(() => {
    const despesasMock: Despesa[] = [
      {
        id: '1',
        descricao: 'Hospedagem AWS',
        categoria: 'Infraestrutura',
        valor: 450.00,
        data: '2024-01-15',
        status: 'pago',
        fornecedor: 'Amazon Web Services',
        formaPagamento: 'Cartão de Crédito'
      },
      {
        id: '2',
        descricao: 'Licença Software',
        categoria: 'Software',
        valor: 299.90,
        data: '2024-01-20',
        status: 'pendente',
        fornecedor: 'Microsoft',
        formaPagamento: 'Boleto'
      },
      {
        id: '3',
        descricao: 'Marketing Digital',
        categoria: 'Marketing',
        valor: 1200.00,
        data: '2024-01-10',
        status: 'vencido',
        fornecedor: 'Google Ads',
        formaPagamento: 'PIX'
      },
      {
        id: '4',
        descricao: 'Material de Escritório',
        categoria: 'Administrativo',
        valor: 180.50,
        data: '2024-01-25',
        status: 'pago',
        fornecedor: 'Kalunga',
        formaPagamento: 'Cartão de Débito'
      }
    ];
    setDespesas(despesasMock);
  }, []);

  const categorias = ['Infraestrutura', 'Software', 'Marketing', 'Administrativo', 'Recursos Humanos', 'Jurídico'];
  const formasPagamento = ['Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto', 'Transferência'];

  const despesasFiltradas = despesas.filter(despesa => {
    return (
      despesa.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) &&
      (filtros.categoria === '' || despesa.categoria === filtros.categoria) &&
      (filtros.status === '' || despesa.status === filtros.status) &&
      (filtros.fornecedor === '' || despesa.fornecedor.toLowerCase().includes(filtros.fornecedor.toLowerCase()))
    );
  });

  const totalDespesas = despesasFiltradas.reduce((total, despesa) => total + despesa.valor, 0);
  const despesasPagas = despesasFiltradas.filter(d => d.status === 'pago').reduce((total, despesa) => total + despesa.valor, 0);
  const despesasPendentes = despesasFiltradas.filter(d => d.status === 'pendente').reduce((total, despesa) => total + despesa.valor, 0);
  const despesasVencidas = despesasFiltradas.filter(d => d.status === 'vencido').reduce((total, despesa) => total + despesa.valor, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'vencido':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNovaDespesa = () => {
    setDespesaSelecionada(null);
    setModoEdicao(false);
    setShowModal(true);
  };

  const handleEditarDespesa = (despesa: Despesa) => {
    setDespesaSelecionada(despesa);
    setModoEdicao(true);
    setShowModal(true);
  };

  const handleVisualizarDespesa = (despesa: Despesa) => {
    setDespesaSelecionada(despesa);
    setModoEdicao(false);
    setShowModal(true);
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      categoria: '',
      status: '',
      dataInicio: '',
      dataFim: '',
      fornecedor: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingDown className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Despesas</h1>
            <p className="text-gray-600">Controle e monitore todas as despesas da empresa</p>
          </div>
        </div>
        <button
          onClick={handleNovaDespesa}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Despesas</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas Pagas</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {despesasPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                R$ {despesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas Vencidas</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {despesasVencidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={limparFiltros}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Limpar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar despesas..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <select
            value={filtros.categoria}
            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>

          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="vencido">Vencido</option>
          </select>

          <input
            type="text"
            placeholder="Fornecedor..."
            value={filtros.fornecedor}
            onChange={(e) => setFiltros({ ...filtros, fornecedor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />

          <input
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />

          <input
            type="date"
            value={filtros.dataFim}
            onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Despesas */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Despesas ({despesasFiltradas.length})
            </h2>
            <div className="flex items-center space-x-2">
              <button className="text-gray-600 hover:text-gray-900 p-2">
                <Download className="w-4 h-4" />
              </button>
              <button className="text-gray-600 hover:text-gray-900 p-2">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
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
            <tbody className="bg-white divide-y divide-gray-200">
              {despesasFiltradas.map((despesa) => (
                <tr key={despesa.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{despesa.descricao}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{despesa.categoria}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{despesa.fornecedor}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(despesa.data).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(despesa.status)}`}>
                      {getStatusIcon(despesa.status)}
                      <span className="ml-1 capitalize">{despesa.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVisualizarDespesa(despesa)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditarDespesa(despesa)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {despesasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma despesa encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando uma nova despesa ou ajuste os filtros.
            </p>
          </div>
        )}
      </div>

      {/* Gráficos - Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de pizza será implementado aqui</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução das Despesas</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de linha será implementado aqui</p>
          </div>
        </div>
      </div>

      {/* Modal - Placeholder para formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modoEdicao ? 'Editar Despesa' : despesaSelecionada ? 'Visualizar Despesa' : 'Nova Despesa'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Formulário de despesa será implementado aqui com todos os campos necessários.
              </p>
              
              {despesaSelecionada && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Dados da Despesa:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Descrição:</span> {despesaSelecionada.descricao}
                    </div>
                    <div>
                      <span className="font-medium">Categoria:</span> {despesaSelecionada.categoria}
                    </div>
                    <div>
                      <span className="font-medium">Fornecedor:</span> {despesaSelecionada.fornecedor}
                    </div>
                    <div>
                      <span className="font-medium">Valor:</span> R$ {despesaSelecionada.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div>
                      <span className="font-medium">Data:</span> {new Date(despesaSelecionada.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {despesaSelecionada.status}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Fechar
              </button>
              {(modoEdicao || !despesaSelecionada) && (
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Salvar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Despesas;