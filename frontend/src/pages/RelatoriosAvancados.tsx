import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Settings,
  Filter,
  RefreshCw,
  Loader2,
  TrendingUp,
  DollarSign,
  Fuel,
  Target,
  Clock,
  FileSpreadsheet,
  FileImage,
  Mail,
  Smartphone,
  Car,
  MapPin,
  Activity
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface VeiculoOption {
  id: string;
  placa: string;
  modelo: string;
}

interface FiltrosAvancados {
  veiculos: string[];
  categorias: string[];
  periodo: {
    inicio: string;
    fim: string;
  };
  aplicativos: string[];
}

const RelatoriosAvancados: React.FC = () => {
  const [tipoAnaliseAtivo, setTipoAnaliseAtivo] = useState('rentabilidade');
  const [loading, setLoading] = useState(false);
  const [dialogExportOpen, setDialogExportOpen] = useState(false);
  const [dialogAgendamentoOpen, setDialogAgendamentoOpen] = useState(false);
  
  // Estados para filtros avançados
  const [filtros, setFiltros] = useState<FiltrosAvancados>({
    veiculos: [],
    categorias: [],
    periodo: {
      inicio: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
      fim: format(new Date(), 'yyyy-MM-dd')
    },
    aplicativos: []
  });

  // Dados mockados para os gráficos
  const dadosRentabilidadeApp = [
    { aplicativo: 'Uber', receita: 15000, custos: 8500, lucro: 6500 },
    { aplicativo: '99', receita: 12000, custos: 7200, lucro: 4800 },
    { aplicativo: 'iFood', receita: 8000, custos: 4800, lucro: 3200 },
    { aplicativo: 'Rappi', receita: 5500, custos: 3300, lucro: 2200 },
    { aplicativo: 'Loggi', receita: 4000, custos: 2800, lucro: 1200 }
  ];

  const dadosEficienciaCombustivel = [
    { mes: 'Set', eficiencia: 11.2, meta: 12.0 },
    { mes: 'Out', eficiencia: 11.8, meta: 12.0 },
    { mes: 'Nov', eficiencia: 12.3, meta: 12.0 },
    { mes: 'Dez', eficiencia: 11.9, meta: 12.0 },
    { mes: 'Jan', eficiencia: 12.5, meta: 12.0 }
  ];

  const dadosProjecoesFinanceiras = [
    { mes: 'Jan', receita: 25000, projecao: 28000 },
    { mes: 'Fev', receita: 27000, projecao: 30000 },
    { mes: 'Mar', receita: 29000, projecao: 32000 },
    { mes: 'Abr', receita: 31000, projecao: 34000 },
    { mes: 'Mai', receita: 33000, projecao: 36000 },
    { mes: 'Jun', receita: 35000, projecao: 38000 }
  ];

  const dadosSazonalidade = [
    { dia: 'Seg', h6: 120, h7: 180, h8: 250, h9: 200, h10: 150, h11: 180, h12: 220, h13: 200, h14: 180, h15: 160, h16: 190, h17: 240, h18: 280, h19: 220, h20: 180, h21: 140, h22: 100 },
    { dia: 'Ter', h6: 110, h7: 170, h8: 240, h9: 190, h10: 140, h11: 170, h12: 210, h13: 190, h14: 170, h15: 150, h16: 180, h17: 230, h18: 270, h19: 210, h20: 170, h21: 130, h22: 90 },
    { dia: 'Qua', h6: 115, h7: 175, h8: 245, h9: 195, h10: 145, h11: 175, h12: 215, h13: 195, h14: 175, h15: 155, h16: 185, h17: 235, h18: 275, h19: 215, h20: 175, h21: 135, h22: 95 },
    { dia: 'Qui', h6: 125, h7: 185, h8: 255, h9: 205, h10: 155, h11: 185, h12: 225, h13: 205, h14: 185, h15: 165, h16: 195, h17: 245, h18: 285, h19: 225, h20: 185, h21: 145, h22: 105 },
    { dia: 'Sex', h6: 140, h7: 200, h8: 270, h9: 220, h10: 170, h11: 200, h12: 240, h13: 220, h14: 200, h15: 180, h16: 210, h17: 260, h18: 300, h19: 240, h20: 200, h21: 160, h22: 120 },
    { dia: 'Sáb', h6: 80, h7: 120, h8: 200, h9: 180, h10: 160, h11: 190, h12: 230, h13: 210, h14: 190, h15: 170, h16: 200, h17: 250, h18: 290, h19: 230, h20: 190, h21: 150, h22: 110 },
    { dia: 'Dom', h6: 60, h7: 100, h8: 160, h9: 140, h10: 120, h11: 150, h12: 190, h13: 170, h14: 150, h15: 130, h16: 160, h17: 210, h18: 250, h19: 190, h20: 150, h21: 110, h22: 80 }
  ];

  const veiculosDisponiveis: VeiculoOption[] = [
    { id: '1', placa: 'ABC-1234', modelo: 'Honda Civic' },
    { id: '2', placa: 'DEF-5678', modelo: 'Toyota Corolla' },
    { id: '3', placa: 'GHI-9012', modelo: 'Nissan Sentra' },
    { id: '4', placa: 'JKL-3456', modelo: 'Hyundai HB20' }
  ];

  const categoriasDisponiveis = [
    'Transporte de Passageiros',
    'Delivery de Comida',
    'Transporte de Carga',
    'Serviços Executivos'
  ];

  const aplicativosDisponiveis = [
    'Uber',
    '99',
    'iFood',
    'Rappi',
    'Loggi',
    'Cabify'
  ];

  const tiposAnalise = [
    {
      id: 'rentabilidade',
      nome: 'Rentabilidade por App',
      icone: <DollarSign className="w-5 h-5" />,
      descricao: 'Análise de lucro por aplicativo'
    },
    {
      id: 'eficiencia',
      nome: 'Eficiência Combustível',
      icone: <Fuel className="w-5 h-5" />,
      descricao: 'Consumo e eficiência por período'
    },
    {
      id: 'projecoes',
      nome: 'Projeções Financeiras',
      icone: <TrendingUp className="w-5 h-5" />,
      descricao: 'Previsões de receita futura'
    },
    {
      id: 'sazonalidade',
      nome: 'Sazonalidade',
      icone: <Activity className="w-5 h-5" />,
      descricao: 'Padrões de demanda por horário'
    }
  ];

  const handleVeiculoChange = (veiculoId: string, checked: boolean) => {
    setFiltros(prev => ({
      ...prev,
      veiculos: checked 
        ? [...prev.veiculos, veiculoId]
        : prev.veiculos.filter(id => id !== veiculoId)
    }));
  };

  const handleCategoriaChange = (categoria: string, checked: boolean) => {
    setFiltros(prev => ({
      ...prev,
      categorias: checked 
        ? [...prev.categorias, categoria]
        : prev.categorias.filter(cat => cat !== categoria)
    }));
  };

  const handleAplicativoChange = (aplicativo: string, checked: boolean) => {
    setFiltros(prev => ({
      ...prev,
      aplicativos: checked 
        ? [...prev.aplicativos, aplicativo]
        : prev.aplicativos.filter(app => app !== aplicativo)
    }));
  };

  const handleExportarRelatorio = (formato: 'pdf' | 'excel' | 'csv') => {
    setLoading(true);
    // Simular exportação
    setTimeout(() => {
      setLoading(false);
      toast.success(`Relatório exportado em ${formato.toUpperCase()} com sucesso!`);
      setDialogExportOpen(false);
    }, 2000);
  };

  const handleAgendarRelatorio = () => {
    setLoading(true);
    // Simular agendamento
    setTimeout(() => {
      setLoading(false);
      toast.success('Relatório agendado com sucesso!');
      setDialogAgendamentoOpen(false);
    }, 1500);
  };

  const renderGraficoAtivo = () => {
    switch (tipoAnaliseAtivo) {
      case 'rentabilidade':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosRentabilidadeApp}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="aplicativo" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `R$ ${Number(value).toLocaleString('pt-BR')}`,
                  name === 'receita' ? 'Receita' : name === 'custos' ? 'Custos' : 'Lucro'
                ]}
              />
              <Legend />
              <Bar dataKey="receita" fill="#3b82f6" name="Receita" />
              <Bar dataKey="custos" fill="#ef4444" name="Custos" />
              <Bar dataKey="lucro" fill="#10b981" name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'eficiencia':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dadosEficienciaCombustivel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis domain={[10, 14]} />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)} km/l`,
                  name === 'eficiencia' ? 'Eficiência Real' : 'Meta'
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="eficiencia" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Eficiência Real"
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                name="Meta"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'projecoes':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dadosProjecoesFinanceiras}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `R$ ${Number(value).toLocaleString('pt-BR')}`,
                  name === 'receita' ? 'Receita Real' : 'Projeção'
                ]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="receita" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Receita Real"
              />
              <Area 
                type="monotone" 
                dataKey="projecao" 
                stackId="2"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.4}
                name="Projeção"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'sazonalidade':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Heatmap de demanda por dia da semana e horário (corridas por hora)
            </div>
            <div className="grid grid-cols-8 gap-1 text-xs">
              <div></div>
              {Array.from({ length: 17 }, (_, i) => (
                <div key={i} className="text-center font-medium p-1">
                  {6 + i}h
                </div>
              ))}
              {dadosSazonalidade.map((dia, diaIndex) => (
                <React.Fragment key={dia.dia}>
                  <div className="font-medium p-2 text-right">{dia.dia}</div>
                  {Object.entries(dia).slice(1).map(([hora, valor], horaIndex) => {
                    const intensity = Math.min(valor / 300, 1);
                    const backgroundColor = `rgba(59, 130, 246, ${intensity})`;
                    return (
                      <div
                        key={`${diaIndex}-${horaIndex}`}
                        className="aspect-square flex items-center justify-center text-xs rounded border"
                        style={{ backgroundColor }}
                        title={`${dia.dia} ${6 + horaIndex}h: ${valor} corridas`}
                      >
                        {valor}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Baixa demanda</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity) => (
                  <div
                    key={opacity}
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
                  />
                ))}
              </div>
              <span>Alta demanda</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-sm border-r min-h-screen p-6">
          <div className="space-y-6">
            {/* Header da Sidebar */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Tipos de Análise
              </h2>
              <p className="text-sm text-gray-600">
                Selecione o tipo de relatório que deseja visualizar
              </p>
            </div>

            {/* Lista de Tipos de Análise */}
            <div className="space-y-2">
              {tiposAnalise.map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => setTipoAnaliseAtivo(tipo.id)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    tipoAnaliseAtivo === tipo.id
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`${
                      tipoAnaliseAtivo === tipo.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {tipo.icone}
                    </div>
                    <span className="font-medium">{tipo.nome}</span>
                  </div>
                  <p className="text-sm text-gray-600">{tipo.descricao}</p>
                </button>
              ))}
            </div>

            <Separator />

            {/* Filtros Avançados */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros Avançados
              </h3>

              {/* Período */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Período</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filtros.periodo.inicio}
                    onChange={(e) => setFiltros(prev => ({
                      ...prev,
                      periodo: { ...prev.periodo, inicio: e.target.value }
                    }))}
                    className="text-xs"
                  />
                  <Input
                    type="date"
                    value={filtros.periodo.fim}
                    onChange={(e) => setFiltros(prev => ({
                      ...prev,
                      periodo: { ...prev.periodo, fim: e.target.value }
                    }))}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Veículos */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Veículos</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {veiculosDisponiveis.map((veiculo) => (
                    <div key={veiculo.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`veiculo-${veiculo.id}`}
                        checked={filtros.veiculos.includes(veiculo.id)}
                        onCheckedChange={(checked) => 
                          handleVeiculoChange(veiculo.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`veiculo-${veiculo.id}`}
                        className="text-xs cursor-pointer"
                      >
                        {veiculo.placa} - {veiculo.modelo}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorias */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categorias</Label>
                <div className="space-y-2">
                  {categoriasDisponiveis.map((categoria) => (
                    <div key={categoria} className="flex items-center space-x-2">
                      <Checkbox
                        id={`categoria-${categoria}`}
                        checked={filtros.categorias.includes(categoria)}
                        onCheckedChange={(checked) => 
                          handleCategoriaChange(categoria, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`categoria-${categoria}`}
                        className="text-xs cursor-pointer"
                      >
                        {categoria}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aplicativos */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Aplicativos</Label>
                <div className="space-y-2">
                  {aplicativosDisponiveis.map((aplicativo) => (
                    <div key={aplicativo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`app-${aplicativo}`}
                        checked={filtros.aplicativos.includes(aplicativo)}
                        onCheckedChange={(checked) => 
                          handleAplicativoChange(aplicativo, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`app-${aplicativo}`}
                        className="text-xs cursor-pointer"
                      >
                        {aplicativo}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Relatórios Avançados
                </h1>
                <p className="text-gray-600 mt-1">
                  Análises detalhadas com gráficos interativos e filtros avançados
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setDialogAgendamentoOpen(true)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Agendar
                </Button>
                <Button onClick={() => setDialogExportOpen(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Área do Gráfico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {tiposAnalise.find(t => t.id === tipoAnaliseAtivo)?.icone}
                  {tiposAnalise.find(t => t.id === tipoAnaliseAtivo)?.nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  renderGraficoAtivo()
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog de Exportação */}
      <Dialog open={dialogExportOpen} onOpenChange={setDialogExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Escolha o formato para exportar o relatório atual
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleExportarRelatorio('pdf')}
                disabled={loading}
                className="h-20 flex-col"
              >
                <FileText className="w-6 h-6 mb-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportarRelatorio('excel')}
                disabled={loading}
                className="h-20 flex-col"
              >
                <FileSpreadsheet className="w-6 h-6 mb-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportarRelatorio('csv')}
                disabled={loading}
                className="h-20 flex-col"
              >
                <FileImage className="w-6 h-6 mb-2" />
                CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Agendamento */}
      <Dialog open={dialogAgendamentoOpen} onOpenChange={setDialogAgendamentoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Relatório Automático</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input type="time" defaultValue="09:00" />
            </div>
            <div className="space-y-2">
              <Label>Enviar por</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <Smartphone className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAgendarRelatorio}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Agendar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RelatoriosAvancados;