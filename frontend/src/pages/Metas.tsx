import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  DollarSign,
  Fuel,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Meta {
  id: string;
  titulo: string;
  tipo: 'receita' | 'economia' | 'km' | 'eficiencia';
  valorAtual: number;
  valorObjetivo: number;
  periodo: 'diario' | 'semanal' | 'mensal';
  dataLimite: string;
  status: 'em_andamento' | 'concluida' | 'atrasada';
  notificacoes: boolean;
  dataCriacao: string;
  dataConclusao?: string;
}

const Metas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [novaMetaForm, setNovaMetaForm] = useState({
    titulo: '',
    tipo: '' as Meta['tipo'] | '',
    valorObjetivo: '',
    periodo: '' as Meta['periodo'] | '',
    dataLimite: '',
    notificacoes: true
  });

  // Dados mockados para demonstração
  const metasAtivas: Meta[] = [
    {
      id: '1',
      titulo: 'Aumentar receita mensal',
      tipo: 'receita',
      valorAtual: 15000,
      valorObjetivo: 20000,
      periodo: 'mensal',
      dataLimite: '2025-01-31',
      status: 'em_andamento',
      notificacoes: true,
      dataCriacao: '2025-01-01'
    },
    {
      id: '2',
      titulo: 'Economizar em combustível',
      tipo: 'economia',
      valorAtual: 800,
      valorObjetivo: 1200,
      periodo: 'mensal',
      dataLimite: '2025-01-31',
      status: 'em_andamento',
      notificacoes: true,
      dataCriacao: '2025-01-01'
    },
    {
      id: '3',
      titulo: 'Melhorar eficiência de combustível',
      tipo: 'eficiencia',
      valorAtual: 12.5,
      valorObjetivo: 15.0,
      periodo: 'mensal',
      dataLimite: '2025-01-31',
      status: 'atrasada',
      notificacoes: true,
      dataCriacao: '2025-01-01'
    },
    {
      id: '4',
      titulo: 'Atingir 5000 KM rodados',
      tipo: 'km',
      valorAtual: 4200,
      valorObjetivo: 5000,
      periodo: 'mensal',
      dataLimite: '2025-01-31',
      status: 'em_andamento',
      notificacoes: false,
      dataCriacao: '2025-01-01'
    }
  ];

  const metasConcluidas: Meta[] = [
    {
      id: '5',
      titulo: 'Reduzir custos operacionais',
      tipo: 'economia',
      valorAtual: 2000,
      valorObjetivo: 2000,
      periodo: 'mensal',
      dataLimite: '2024-12-31',
      status: 'concluida',
      notificacoes: true,
      dataCriacao: '2024-12-01',
      dataConclusao: '2024-12-28'
    },
    {
      id: '6',
      titulo: 'Aumentar receita em 10%',
      tipo: 'receita',
      valorAtual: 22000,
      valorObjetivo: 22000,
      periodo: 'mensal',
      dataLimite: '2024-12-31',
      status: 'concluida',
      notificacoes: true,
      dataCriacao: '2024-12-01',
      dataConclusao: '2024-12-30'
    }
  ];

  const getMetaIcon = (tipo: Meta['tipo']) => {
    switch (tipo) {
      case 'receita':
        return <DollarSign className="h-5 w-5" />;
      case 'economia':
        return <TrendingUp className="h-5 w-5" />;
      case 'km':
        return <Target className="h-5 w-5" />;
      case 'eficiencia':
        return <Fuel className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: Meta['status']) => {
    switch (status) {
      case 'em_andamento':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
      case 'concluida':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'atrasada':
        return <Badge variant="destructive">Atrasada</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getProgressPercentage = (valorAtual: number, valorObjetivo: number) => {
    return Math.min((valorAtual / valorObjetivo) * 100, 100);
  };

  const getDiasRestantes = (dataLimite: string) => {
    const hoje = new Date();
    const limite = new Date(dataLimite);
    const diffTime = limite.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatarValor = (valor: number, tipo: Meta['tipo']) => {
    switch (tipo) {
      case 'receita':
      case 'economia':
        return `R$ ${valor.toLocaleString('pt-BR')}`;
      case 'km':
        return `${valor.toLocaleString('pt-BR')} km`;
      case 'eficiencia':
        return `${valor.toFixed(1)} km/l`;
      default:
        return valor.toString();
    }
  };

  const handleSubmitNovaMeta = () => {
    if (!novaMetaForm.titulo || !novaMetaForm.tipo || !novaMetaForm.valorObjetivo || 
        !novaMetaForm.periodo || !novaMetaForm.dataLimite) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Aqui seria feita a integração com a API
    console.log('Nova meta:', novaMetaForm);
    
    // Reset do formulário
    setNovaMetaForm({
      titulo: '',
      tipo: '',
      valorObjetivo: '',
      periodo: '',
      dataLimite: '',
      notificacoes: true
    });
    
    setIsModalOpen(false);
    alert('Meta criada com sucesso!');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Metas</h1>
          <p className="text-gray-600 mt-1">Defina e acompanhe suas metas de negócio</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título da Meta *</Label>
                <Input
                  id="titulo"
                  value={novaMetaForm.titulo}
                  onChange={(e) => setNovaMetaForm({...novaMetaForm, titulo: e.target.value})}
                  placeholder="Ex: Aumentar receita mensal"
                />
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo de Meta *</Label>
                <Select value={novaMetaForm.tipo} onValueChange={(value: Meta['tipo']) => setNovaMetaForm({...novaMetaForm, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="economia">Economia</SelectItem>
                    <SelectItem value="km">Quilometragem</SelectItem>
                    <SelectItem value="eficiencia">Eficiência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="valorObjetivo">Valor Objetivo *</Label>
                <Input
                  id="valorObjetivo"
                  type="number"
                  value={novaMetaForm.valorObjetivo}
                  onChange={(e) => setNovaMetaForm({...novaMetaForm, valorObjetivo: e.target.value})}
                  placeholder="Ex: 20000"
                />
              </div>
              
              <div>
                <Label htmlFor="periodo">Período *</Label>
                <Select value={novaMetaForm.periodo} onValueChange={(value: Meta['periodo']) => setNovaMetaForm({...novaMetaForm, periodo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dataLimite">Data Limite *</Label>
                <Input
                  id="dataLimite"
                  type="date"
                  value={novaMetaForm.dataLimite}
                  onChange={(e) => setNovaMetaForm({...novaMetaForm, dataLimite: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notificacoes"
                  checked={novaMetaForm.notificacoes}
                  onCheckedChange={(checked) => setNovaMetaForm({...novaMetaForm, notificacoes: checked as boolean})}
                />
                <Label htmlFor="notificacoes">Receber notificações sobre o progresso</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitNovaMeta}>
                Criar Meta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metas Ativas */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Metas Ativas ({metasAtivas.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metasAtivas.map((meta) => {
            const progressPercentage = getProgressPercentage(meta.valorAtual, meta.valorObjetivo);
            const diasRestantes = getDiasRestantes(meta.dataLimite);
            
            return (
              <Card key={meta.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getMetaIcon(meta.tipo)}
                      <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                    </div>
                    {getStatusBadge(meta.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar Circular */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
                          className={`${
                            meta.status === 'atrasada' ? 'text-red-500' :
                            meta.status === 'concluida' ? 'text-green-500' :
                            'text-blue-500'
                          } transition-all duration-300`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">{Math.round(progressPercentage)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Valor Atual vs Objetivo */}
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatarValor(meta.valorAtual, meta.tipo)}
                    </div>
                    <div className="text-sm text-gray-600">
                      de {formatarValor(meta.valorObjetivo, meta.tipo)}
                    </div>
                  </div>
                  
                  {/* Prazo Restante */}
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className={diasRestantes < 0 ? 'text-red-600' : diasRestantes <= 7 ? 'text-yellow-600' : 'text-gray-600'}>
                      {diasRestantes < 0 
                        ? `${Math.abs(diasRestantes)} dias em atraso`
                        : diasRestantes === 0 
                        ? 'Vence hoje'
                        : `${diasRestantes} dias restantes`
                      }
                    </span>
                  </div>
                  
                  {/* Progress Bar Linear */}
                  <Progress value={progressPercentage} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Metas Concluídas */}
      <Collapsible open={isCompletedExpanded} onOpenChange={setIsCompletedExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold">Metas Concluídas ({metasConcluidas.length})</span>
            </div>
            {isCompletedExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metasConcluidas.map((meta) => (
              <Card key={meta.id} className="opacity-75 border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getMetaIcon(meta.tipo)}
                      <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                    </div>
                    {getStatusBadge(meta.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {formatarValor(meta.valorAtual, meta.tipo)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Meta atingida!
                    </div>
                  </div>
                  
                  {meta.dataConclusao && (
                    <div className="text-center text-sm text-gray-500">
                      Concluída em {new Date(meta.dataConclusao).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  
                  <Progress value={100} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default Metas;