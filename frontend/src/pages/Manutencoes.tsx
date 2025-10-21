import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Wrench, 
  Calendar, 
  MapPin, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Car, 
  Fuel, 
  Settings, 
  FileText, 
  Upload,
  ArrowLeft,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Interfaces
interface Manutencao {
  id: string;
  tipo: string;
  data: string;
  km: number;
  descricao: string;
  valor: number;
  oficina: string;
  proximaManutencao?: {
    tipo: string;
    kmSugerido: number;
    dataSugerida: string;
  };
  status: 'concluida' | 'agendada' | 'atrasada';
}

interface AlertaManutencao {
  id: string;
  tipo: string;
  urgencia: 'baixa' | 'media' | 'alta' | 'critica';
  kmAtual: number;
  kmRecomendado: number;
  diasRestantes: number;
  descricao: string;
}

interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  kmAtual: number;
}

const Manutencoes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [alertas, setAlertas] = useState<AlertaManutencao[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

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
        kmAtual: 45000
      });

      // Dados mockados de manutenções
      setManutencoes([
        {
          id: '1',
          tipo: 'Troca de Óleo',
          data: '2024-12-15',
          km: 44500,
          descricao: 'Troca de óleo do motor e filtro',
          valor: 150.00,
          oficina: 'Auto Center Silva',
          proximaManutencao: {
            tipo: 'Troca de Óleo',
            kmSugerido: 49500,
            dataSugerida: '2025-03-15'
          },
          status: 'concluida'
        },
        {
          id: '2',
          tipo: 'Revisão Geral',
          data: '2024-11-20',
          km: 43000,
          descricao: 'Revisão completa dos 40.000 km',
          valor: 450.00,
          oficina: 'Concessionária Honda',
          proximaManutencao: {
            tipo: 'Revisão Geral',
            kmSugerido: 50000,
            dataSugerida: '2025-05-20'
          },
          status: 'concluida'
        },
        {
          id: '3',
          tipo: 'Troca de Pneus',
          data: '2025-02-10',
          km: 46000,
          descricao: 'Troca dos 4 pneus - Michelin',
          valor: 800.00,
          oficina: 'Pneus & Cia',
          status: 'agendada'
        }
      ]);

      // Dados mockados de alertas
      setAlertas([
        {
          id: '1',
          tipo: 'Troca de Óleo',
          urgencia: 'media',
          kmAtual: 45000,
          kmRecomendado: 49500,
          diasRestantes: 45,
          descricao: 'Próxima troca de óleo recomendada em 4.500 km'
        },
        {
          id: '2',
          tipo: 'Revisão dos Freios',
          urgencia: 'alta',
          kmAtual: 45000,
          kmRecomendado: 45500,
          diasRestantes: 15,
          descricao: 'Verificação do sistema de freios recomendada'
        },
        {
          id: '3',
          tipo: 'Alinhamento e Balanceamento',
          urgencia: 'baixa',
          kmAtual: 45000,
          kmRecomendado: 50000,
          diasRestantes: 90,
          descricao: 'Alinhamento e balanceamento das rodas'
        }
      ]);

      setIsLoading(false);
    };

    loadData();
  }, [id]);

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'critica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-500';
      case 'agendada': return 'bg-blue-500';
      case 'atrasada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'troca de óleo': return <Fuel className="h-4 w-4" />;
      case 'revisão geral': return <Settings className="h-4 w-4" />;
      case 'troca de pneus': return <Car className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  const handleNovaManutencao = (formData: any) => {
    // Aqui seria feita a integração com a API
    console.log('Nova manutenção:', formData);
    toast.success('Manutenção registrada com sucesso!');
    setIsModalOpen(false);
  };

  const manutencoesFiltradas = manutencoes.filter(manutencao => {
    const matchSearch = manutencao.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       manutencao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       manutencao.oficina.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = filtroTipo === 'todos' || manutencao.tipo === filtroTipo;
    
    return matchSearch && matchTipo;
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
                Manutenções
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
                Nova Manutenção
              </Button>
            </DialogTrigger>
            <NovaManutencaoModal onSubmit={handleNovaManutencao} veiculo={veiculo} />
          </Dialog>
        </div>

        {/* Alertas de Manutenção */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alertas.map((alerta) => (
            <Card key={alerta.id} className="border-l-4" style={{ borderLeftColor: getUrgenciaColor(alerta.urgencia).replace('bg-', '#') }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getTipoIcon(alerta.tipo)}
                    {alerta.tipo}
                  </CardTitle>
                  <Badge variant="outline" className={`${getUrgenciaColor(alerta.urgencia)} text-white`}>
                    {alerta.urgencia.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{alerta.descricao}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>KM: {alerta.kmRecomendado.toLocaleString()}</span>
                  <span>{alerta.diasRestantes} dias</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                    placeholder="Buscar por tipo, descrição ou oficina..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label htmlFor="tipo">Tipo de Manutenção</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="Troca de Óleo">Troca de Óleo</SelectItem>
                    <SelectItem value="Revisão Geral">Revisão Geral</SelectItem>
                    <SelectItem value="Troca de Pneus">Troca de Pneus</SelectItem>
                    <SelectItem value="Freios">Freios</SelectItem>
                    <SelectItem value="Suspensão">Suspensão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline de Manutenções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Manutenções
            </CardTitle>
            <CardDescription>
              {manutencoesFiltradas.length} manutenção(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {manutencoesFiltradas.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma manutenção encontrada</p>
              </div>
            ) : (
              <div className="space-y-6">
                {manutencoesFiltradas.map((manutencao, index) => (
                  <div key={manutencao.id} className="relative">
                    {/* Linha da timeline */}
                    {index < manutencoesFiltradas.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    
                    <div className="flex gap-4">
                      {/* Ícone da timeline */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getStatusColor(manutencao.status)} flex items-center justify-center text-white`}>
                        {getTipoIcon(manutencao.tipo)}
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1 bg-white rounded-lg border p-4 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{manutencao.tipo}</h3>
                            <p className="text-sm text-gray-600">{manutencao.descricao}</p>
                          </div>
                          <Badge variant="outline" className={`${getStatusColor(manutencao.status)} text-white w-fit`}>
                            {manutencao.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(manutencao.data).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-gray-400" />
                            <span>{manutencao.km.toLocaleString()} km</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>R$ {manutencao.valor.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{manutencao.oficina}</span>
                          </div>
                        </div>
                        
                        {manutencao.proximaManutencao && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">Próxima Manutenção:</p>
                            <p className="text-sm text-blue-600">
                              {manutencao.proximaManutencao.tipo} - {manutencao.proximaManutencao.kmSugerido.toLocaleString()} km
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Componente do Modal
const NovaManutencaoModal = ({ onSubmit, veiculo }: { onSubmit: (data: any) => void; veiculo: Veiculo | null }) => {
  const [formData, setFormData] = useState({
    tipo: '',
    data: '',
    km: veiculo?.kmAtual || 0,
    descricao: '',
    valor: '',
    oficina: '',
    outroTipo: ''
  });

  const tiposManutencao = [
    'Troca de Óleo',
    'Revisão Geral',
    'Troca de Pneus',
    'Freios',
    'Suspensão',
    'Ar Condicionado',
    'Sistema Elétrico',
    'Transmissão',
    'Outro'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tipoFinal = formData.tipo === 'Outro' ? formData.outroTipo : formData.tipo;
    
    onSubmit({
      ...formData,
      tipo: tipoFinal,
      valor: parseFloat(formData.valor)
    });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nova Manutenção
        </DialogTitle>
        <DialogDescription>
          Registre uma nova manutenção para o veículo {veiculo?.marca} {veiculo?.modelo}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipo">Tipo de Manutenção *</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposManutencao.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {formData.tipo === 'Outro' && (
            <div>
              <Label htmlFor="outroTipo">Especifique o Tipo *</Label>
              <Input
                id="outroTipo"
                value={formData.outroTipo}
                onChange={(e) => setFormData({...formData, outroTipo: e.target.value})}
                placeholder="Digite o tipo de manutenção"
                required
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({...formData, data: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="km">Quilometragem *</Label>
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
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              placeholder="Ex: 150.00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="oficina">Oficina/Local *</Label>
            <Input
              id="oficina"
              value={formData.oficina}
              onChange={(e) => setFormData({...formData, oficina: e.target.value})}
              placeholder="Ex: Auto Center Silva"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            placeholder="Descreva os serviços realizados..."
            rows={3}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="notaFiscal">Nota Fiscal (opcional)</Label>
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
            Registrar Manutenção
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default Manutencoes;