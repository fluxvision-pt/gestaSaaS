import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Wrench, 
  Calendar, 
  MapPin, 
  Fuel,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor: string;
  kmAtual: number;
  status: 'ativo' | 'manutencao' | 'inativo';
  proximaManutencao?: {
    tipo: string;
    km: number;
    dias: number;
  };
}

const Veiculos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Dados mockados para demonstração
  const veiculos: Veiculo[] = [
    {
      id: '1',
      marca: 'Honda',
      modelo: 'Civic',
      ano: 2020,
      placa: 'ABC-1234',
      cor: 'Prata',
      kmAtual: 45000,
      status: 'ativo',
      proximaManutencao: {
        tipo: 'Troca de Óleo',
        km: 49500,
        dias: 45
      }
    },
    {
      id: '2',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2019,
      placa: 'DEF-5678',
      cor: 'Branco',
      kmAtual: 52000,
      status: 'ativo',
      proximaManutencao: {
        tipo: 'Revisão Geral',
        km: 55000,
        dias: 30
      }
    },
    {
      id: '3',
      marca: 'Volkswagen',
      modelo: 'Gol',
      ano: 2018,
      placa: 'GHI-9012',
      cor: 'Azul',
      kmAtual: 68000,
      status: 'manutencao'
    },
    {
      id: '4',
      marca: 'Ford',
      modelo: 'Ka',
      ano: 2021,
      placa: 'JKL-3456',
      cor: 'Vermelho',
      kmAtual: 25000,
      status: 'ativo',
      proximaManutencao: {
        tipo: 'Primeira Revisão',
        km: 30000,
        dias: 60
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500';
      case 'manutencao': return 'bg-yellow-500';
      case 'inativo': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'manutencao': return 'Em Manutenção';
      case 'inativo': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  const veiculosFiltrados = veiculos.filter(veiculo => {
    const matchSearch = veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || veiculo.status === filtroStatus;
    
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
            <p className="text-gray-600">Gerencie sua frota de veículos</p>
          </div>
          
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Veículo
          </Button>
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por marca, modelo ou placa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="manutencao">Em Manutenção</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Veículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {veiculosFiltrados.map((veiculo) => (
            <Card key={veiculo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Car className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {veiculo.marca} {veiculo.modelo}
                      </CardTitle>
                      <CardDescription>
                        {veiculo.ano} • {veiculo.placa}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`${getStatusColor(veiculo.status)} text-white`}>
                    {getStatusText(veiculo.status)}
                  </Badge>
                  <span className="text-sm text-gray-600">{veiculo.cor}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{veiculo.kmAtual.toLocaleString()} km</span>
                </div>
                
                {veiculo.proximaManutencao && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-1">
                      <Calendar className="h-4 w-4" />
                      Próxima Manutenção
                    </div>
                    <p className="text-sm text-blue-600">
                      {veiculo.proximaManutencao.tipo}
                    </p>
                    <p className="text-xs text-blue-500">
                      {veiculo.proximaManutencao.km.toLocaleString()} km • {veiculo.proximaManutencao.dias} dias
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/veiculos/${veiculo.id}/manutencoes`)}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Manutenções
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/veiculos/${veiculo.id}/combustivel`)}
                  >
                    <Fuel className="h-4 w-4 mr-2" />
                    Combustível
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {veiculosFiltrados.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum veículo encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Não encontramos veículos com os filtros aplicados.
              </p>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Veículo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Veiculos;