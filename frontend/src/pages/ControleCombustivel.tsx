import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Fuel, 
  Calendar, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  Filter,
  Search,
  Upload,
  Car,
  BarChart3,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Interfaces
interface Abastecimento {
  id: string;
  data: string;
  km: number;
  litros: number;
  precoLitro: number;
  totalPago: number;
  posto: string;
  tanqueCheio: boolean;
  consumo?: number;
  comprovante?: string;
}

interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  tipoCombustivel: string;
  kmAtual: number;
}

interface ResumoConsumo {
  consumoMedio: number;
  gastoMensal: number;
  eficienciaVariacao: number;
  totalLitros: number;
  totalGasto: number;
}

const ControleCombustivel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [resumo, setResumo] = useState<ResumoConsumo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMes, setFiltroMes] = useState('todos');

  // Dados para o gráfico de consumo
  const [dadosGrafico, setDadosGrafico] = useState([
    { mes: 'Jul', consumo: 8.5, gasto: 450 },
    { mes: 'Ago', consumo: 8.2, gasto: 420 },
    { mes: 'Set', consumo: 8.8, gasto: 480 },
    { mes: 'Out', consumo: 8.1, gasto: 410 },
    { mes: 'Nov', consumo: 8.4, gasto: 440 },
    { mes: 'Dez', consumo: 8.6, gasto: 460 }
  ]);

  // Dados mockados para demonstração
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados do veículo
      setVeiculo({
        id: id || '1',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2020,
        placa: 'ABC-1234',
        tipoCombustivel: 'Gasolina',
        kmAtual: 45000
      });

      // Dados mockados de abastecimentos
      setAbastecimentos([
        {
          id: '1',
          data: '2024-12-20',
          km: 44800,
          litros: 45.5,
          precoLitro: 5.89,
          totalPago: 268.00,
          posto: 'Posto Ipiranga Centro',
          tanqueCheio: true,
          consumo: 8.2
        },
        {
          id: '2',
          data: '2024-12-05',
          km: 44200,
          litros: 42.0,
          precoLitro: 5.95,
          totalPago: 249.90,
          posto: 'Shell Express',
          tanqueCheio: true,
          consumo: 8.5
        },
        {
          id: '3',
          data: '2024-11-18',
          km: 43650,
          litros: 38.2,
          precoLitro: 5.82,
          totalPago: 222.32,
          posto: 'BR Distribuidora',
          tanqueCheio: false,
          consumo: 8.1
        },
        {
          id: '4',
          data: '2024-11-02',
          km: 43100,
          litros: 44.8,
          precoLitro: 5.78,
          totalPago: 258.94,
          posto: 'Posto Ipiranga Centro',
          tanqueCheio: true,
          consumo: 8.3
        },
        {
          id: '5',
          data: '2024-10-15',
          km: 42500,
          litros: 41.5,
          precoLitro: 5.85,
          totalPago: 242.78,
          posto: 'Petrobras',
          tanqueCheio: true,
          consumo: 8.7
        }
      ]);

      // Dados mockados do resumo
      setResumo({
        consumoMedio: 8.4,
        gastoMensal: 445.50,
        eficienciaVariacao: 2.3,
        totalLitros: 211.0,
        totalGasto: 1241.94
      });

      setIsLoading(false);
    };

    loadData();
  }, [id]);

  const handleNovoAbastecimento = (formData: any) => {
    // Aqui seria feita a integração com a API
    console.log('Novo abastecimento:', formData);
    toast.success('Abastecimento registrado com sucesso!');
    setIsModalOpen(false);
  };

  const abastecimentosFiltrados = abastecimentos.filter(abastecimento => {
    const matchSearch = abastecimento.posto.toLowerCase().includes(searchTerm.toLowerCase());
    
    const dataAbastecimento = new Date(abastecimento.data);
    const mesAbastecimento = dataAbastecimento.getMonth();
    const anoAbastecimento = dataAbastecimento.getFullYear();
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    
    let matchMes = true;
    if (filtroMes === 'este-mes') {
      matchMes = mesAbastecimento === mesAtual && anoAbastecimento === anoAtual;
    } else if (filtroMes === 'mes-passado') {
      const mesPassado = mesAtual === 0 ? 11 : mesAtual - 1;
      const anoMesPassado = mesAtual === 0 ? anoAtual - 1 : anoAtual;
      matchMes = mesAbastecimento === mesPassado && anoAbastecimento === anoMesPassado;
    }
    
    return matchSearch && matchMes;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/veiculos')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Controle de Combustível
              </h1>
              {veiculo && (
                <p className="text-gray-600">
                  {veiculo.marca} {veiculo.modelo} {veiculo.ano} - {veiculo.placa}
                </p>
              )}
            </div>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Abastecimento
              </Button>
            </DialogTrigger>
            <NovoAbastecimentoModal onSubmit={handleNovoAbastecimento} veiculo={veiculo} />
          </Dialog>
        </div>

        {/* Cards de Resumo */}
        {resumo && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Consumo Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {resumo.consumoMedio.toFixed(1)} L/100km
                </div>
                <p className="text-sm text-gray-600">
                  {veiculo?.tipoCombustivel}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Gasto Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {resumo.gastoMensal.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">
                  Média dos últimos 3 meses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {resumo.eficienciaVariacao >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  Eficiência vs Mês Anterior
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${resumo.eficienciaVariacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {resumo.eficienciaVariacao >= 0 ? '+' : ''}{resumo.eficienciaVariacao.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  {resumo.eficienciaVariacao >= 0 ? 'Melhoria' : 'Piora'} na eficiência
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-orange-500" />
                  Total Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {resumo.totalLitros.toFixed(1)} L
                </div>
                <p className="text-sm text-gray-600">
                  R$ {resumo.totalGasto.toFixed(2)} gastos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráfico de Consumo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Consumo dos Últimos 6 Meses
            </CardTitle>
            <CardDescription>
              Evolução do consumo e gastos mensais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'consumo' ? `${value} L/100km` : `R$ ${value}`,
                      name === 'consumo' ? 'Consumo' : 'Gasto'
                    ]}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="consumo" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="gasto" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Buscar por posto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label htmlFor="mes">Período</Label>
                <Select value={filtroMes} onValueChange={setFiltroMes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os meses</SelectItem>
                    <SelectItem value="este-mes">Este mês</SelectItem>
                    <SelectItem value="mes-passado">Mês passado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Abastecimentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Histórico de Abastecimentos
            </CardTitle>
            <CardDescription>
              {abastecimentosFiltrados.length} abastecimento(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {abastecimentosFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum abastecimento encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Data</th>
                      <th className="text-left p-3">Posto/Local</th>
                      <th className="text-right p-3">Litros</th>
                      <th className="text-right p-3">Preço/L</th>
                      <th className="text-right p-3">Total</th>
                      <th className="text-right p-3">KM</th>
                      <th className="text-right p-3">Consumo</th>
                      <th className="text-center p-3">Tanque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abastecimentosFiltrados.map((abastecimento) => (
                      <tr key={abastecimento.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(abastecimento.data).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {abastecimento.posto}
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {abastecimento.litros.toFixed(1)} L
                        </td>
                        <td className="p-3 text-right">
                          R$ {abastecimento.precoLitro.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-medium text-green-600">
                          R$ {abastecimento.totalPago.toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          {abastecimento.km.toLocaleString()} km
                        </td>
                        <td className="p-3 text-right">
                          {abastecimento.consumo ? (
                            <span className="text-blue-600 font-medium">
                              {abastecimento.consumo.toFixed(1)} L/100km
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={abastecimento.tanqueCheio ? "default" : "secondary"}>
                            {abastecimento.tanqueCheio ? "Cheio" : "Parcial"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Componente do Modal
const NovoAbastecimentoModal = ({ onSubmit, veiculo }: { onSubmit: (data: any) => void; veiculo: Veiculo | null }) => {
  const [formData, setFormData] = useState({
    data: '',
    km: veiculo?.kmAtual || 0,
    litros: '',
    precoLitro: '',
    totalPago: '',
    posto: '',
    tanqueCheio: true,
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      ...formData,
      litros: parseFloat(formData.litros),
      precoLitro: parseFloat(formData.precoLitro),
      totalPago: parseFloat(formData.totalPago)
    });
  };

  // Calcular total automaticamente
  const calcularTotal = () => {
    const litros = parseFloat(formData.litros) || 0;
    const precoLitro = parseFloat(formData.precoLitro) || 0;
    const total = litros * precoLitro;
    setFormData(prev => ({ ...prev, totalPago: total.toFixed(2) }));
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Novo Abastecimento
        </DialogTitle>
        <DialogDescription>
          Registre um novo abastecimento para o veículo {veiculo?.marca} {veiculo?.modelo}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="data">Data/Hora *</Label>
            <Input
              id="data"
              type="datetime-local"
              value={formData.data}
              onChange={(e) => setFormData({...formData, data: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="km">KM Atual *</Label>
            <Input
              id="km"
              type="number"
              value={formData.km}
              onChange={(e) => setFormData({...formData, km: parseInt(e.target.value)})}
              placeholder="Ex: 45000"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="litros">Quantidade (Litros) *</Label>
            <Input
              id="litros"
              type="number"
              step="0.01"
              value={formData.litros}
              onChange={(e) => setFormData({...formData, litros: e.target.value})}
              onBlur={calcularTotal}
              placeholder="Ex: 45.50"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="precoLitro">Preço por Litro (R$) *</Label>
            <Input
              id="precoLitro"
              type="number"
              step="0.001"
              value={formData.precoLitro}
              onChange={(e) => setFormData({...formData, precoLitro: e.target.value})}
              onBlur={calcularTotal}
              placeholder="Ex: 5.89"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="totalPago">Total Pago (R$) *</Label>
            <Input
              id="totalPago"
              type="number"
              step="0.01"
              value={formData.totalPago}
              onChange={(e) => setFormData({...formData, totalPago: e.target.value})}
              placeholder="Ex: 268.00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="posto">Posto/Local *</Label>
            <Input
              id="posto"
              value={formData.posto}
              onChange={(e) => setFormData({...formData, posto: e.target.value})}
              placeholder="Ex: Posto Ipiranga Centro"
              required
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="tanqueCheio"
            checked={formData.tanqueCheio}
            onCheckedChange={(checked) => setFormData({...formData, tanqueCheio: checked as boolean})}
          />
          <Label htmlFor="tanqueCheio">Tanque cheio?</Label>
        </div>
        
        <div>
          <Label htmlFor="observacoes">Observações (opcional)</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            placeholder="Observações adicionais..."
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="comprovante">Comprovante (opcional)</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Clique para fazer upload ou arraste o arquivo aqui</p>
            <p className="text-xs text-gray-500">PDF, JPG, PNG até 5MB</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
            Registrar Abastecimento
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default ControleCombustivel;