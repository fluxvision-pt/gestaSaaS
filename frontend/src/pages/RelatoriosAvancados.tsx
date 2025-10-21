import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Settings,
  Play,
  Pause,
  Trash2,
  Eye,
  Plus,
  Filter,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { relatoriosService } from '../services/api'
import type { RelatorioRequest, RelatorioResponse, DashboardData, RelatorioAgendado } from '../services/api'
import { toast } from 'sonner';



export default function RelatoriosAvancados() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [relatoriosAgendados, setRelatoriosAgendados] = useState<RelatorioAgendado[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Estados para geração de relatórios
  const [reportType, setReportType] = useState<'usuarios' | 'empresas' | 'assinaturas' | 'auditoria' | 'financeiro' | ''>('');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [dateRange, setDateRange] = useState({
    inicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    fim: format(new Date(), 'yyyy-MM-dd')
  });
  const [filters, setFilters] = useState({
    empresaId: '',
    usuarioId: '',
    status: ''
  });

  // Estados para agendamento
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState<'diario' | 'semanal' | 'mensal' | ''>('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleDescription, setScheduleDescription] = useState('');

  useEffect(() => {
    loadDashboardData();
    loadScheduledReports();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await relatoriosService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduledReports = async () => {
    try {
      const reports = await relatoriosService.listarAgendados();
      setRelatoriosAgendados(reports);
    } catch (error) {
      console.error('Erro ao carregar relatórios agendados:', error);
      toast.error('Erro ao carregar relatórios agendados');
    }
  };

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast.error('Selecione um tipo de relatório');
      return;
    }

    try {
      setLoading(true);
      const request: RelatorioRequest = {
        tipo: reportType,
        formato: reportFormat,
        filtros: {
          dataInicio: dateRange.inicio,
          dataFim: dateRange.fim,
          empresaId: filters.empresaId || undefined,
          usuarioId: filters.usuarioId || undefined,
          status: filters.status || undefined
        }
      };

      const response = await relatoriosService.gerarRelatorio(request);
      
      if (response.url) {
        // Download direto
        window.open(response.url, '_blank');
        toast.success('Relatório gerado com sucesso!');
      } else {
        toast.success('Relatório está sendo processado. Você será notificado quando estiver pronto.');
      }
      
      setIsDialogOpen(false);
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReport = async () => {
    if (!scheduleName || !reportType || !scheduleFrequency) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const request: RelatorioRequest = {
        tipo: reportType,
        formato: reportFormat,
        filtros: {
          dataInicio: dateRange.inicio,
          dataFim: dateRange.fim,
          empresaId: filters.empresaId || undefined,
          usuarioId: filters.usuarioId || undefined,
          status: filters.status || undefined
        },
        agendamento: {
          frequencia: scheduleFrequency,
          hora: scheduleTime,
          ativo: true
        }
      };

      await relatoriosService.agendarRelatorio(request);

      toast.success('Relatório agendado com sucesso!');
      setIsScheduleDialogOpen(false);
      loadScheduledReports();
      
      // Reset form
      setScheduleName('');
      setScheduleDescription('');
      setScheduleFrequency('');
    } catch (error) {
      console.error('Erro ao agendar relatório:', error);
      toast.error('Erro ao agendar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSchedule = async (id: string, ativo: boolean) => {
    try {
      await relatoriosService.atualizarAgendamento(id, ativo);
      toast.success(`Relatório ${ativo ? 'ativado' : 'pausado'} com sucesso!`);
      loadScheduledReports();
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error('Erro ao atualizar agendamento');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await relatoriosService.cancelarAgendamento(id);
      toast.success('Agendamento removido com sucesso!');
      loadScheduledReports();
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      toast.error('Erro ao remover agendamento');
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const statusConfig = {
      ativo: { variant: 'default' as const, label: 'Ativo', icon: CheckCircle },
      pausado: { variant: 'secondary' as const, label: 'Pausado', icon: Pause },
      erro: { variant: 'destructive' as const, label: 'Erro', icon: AlertTriangle }
    };

    const normalizedStatus = status || 'ativo';
    const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.ativo;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      quarterly: 'Trimestral'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Avançados</h1>
          <p className="text-muted-foreground">
            Gere relatórios personalizados e configure agendamentos automáticos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsScheduleDialogOpen(true)} variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Agendar Relatório
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="agendados">Agendados</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {loading && !dashboardData ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.totalRelatorios || 0}</div>
                    <p className="text-xs text-muted-foreground">Gerados até agora</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hoje</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.relatoriosHoje || 0}</div>
                    <p className="text-xs text-muted-foreground">Relatórios gerados hoje</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Agendados</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.relatoriosAgendados || 0}</div>
                    <p className="text-xs text-muted-foreground">Execuções automáticas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Formato Popular</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">PDF</div>
                    <p className="text-xs text-muted-foreground">Mais utilizado</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData?.relatoriosRecentes?.map((relatorio) => (
                        <TableRow key={relatorio.id}>
                          <TableCell className="font-medium">{relatorio.nome}</TableCell>
                          <TableCell>{relatorio.tipo}</TableCell>
                          <TableCell>
                            {format(new Date(relatorio.dataGeracao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={relatorio.status === 'concluido' ? 'default' : 'secondary'}>
                              {relatorio.status || 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Nenhum relatório encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="agendados" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Próxima Execução</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatoriosAgendados.map((relatorio) => (
                    <TableRow key={relatorio.id}>
                      <TableCell className="font-medium">{relatorio.nome}</TableCell>
                      <TableCell>{relatorio.tipo}</TableCell>
                      <TableCell>{getFrequencyLabel(relatorio.frequencia)}</TableCell>
                      <TableCell>
                        {format(new Date(relatorio.proximaExecucao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{getStatusBadge(relatorio.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSchedule(relatorio.id, !relatorio.ativo)}
                          >
                            {relatorio.ativo ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSchedule(relatorio.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {relatoriosAgendados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum relatório agendado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Histórico de relatórios será implementado em breve
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para gerar novo relatório */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerar Novo Relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={(value: 'usuarios' | 'empresas' | 'assinaturas' | 'auditoria' | 'financeiro') => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuarios">Usuários</SelectItem>
                    <SelectItem value="empresas">Empresas</SelectItem>
                    <SelectItem value="assinaturas">Assinaturas</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="auditoria">Auditoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportFormat">Formato</Label>
                <Select value={reportFormat} onValueChange={(value: 'pdf' | 'excel' | 'csv' | 'json') => setReportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateStart">Data Início</Label>
                <Input
                  type="date"
                  value={dateRange.inicio}
                  onChange={(e) => setDateRange(prev => ({ ...prev, inicio: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEnd">Data Fim</Label>
                <Input
                  type="date"
                  value={dateRange.fim}
                  onChange={(e) => setDateRange(prev => ({ ...prev, fim: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateReport} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Gerar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para agendar relatório */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agendar Relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleName">Nome do Agendamento</Label>
              <Input
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="Ex: Relatório Mensal de Usuários"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scheduleDescription">Descrição</Label>
              <Textarea
                value={scheduleDescription}
                onChange={(e) => setScheduleDescription(e.target.value)}
                placeholder="Descrição opcional do relatório"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={(value: string) => setReportType(value as 'usuarios' | 'empresas' | 'assinaturas' | 'auditoria' | 'financeiro')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuarios">Usuários</SelectItem>
                    <SelectItem value="assinaturas">Assinaturas</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="auditoria">Auditoria</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportFormat">Formato</Label>
                <Select value={reportFormat} onValueChange={(value: string) => setReportFormat(value as 'pdf' | 'excel' | 'csv' | 'json')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduleFrequency">Frequência</Label>
                <Select value={scheduleFrequency} onValueChange={(value: string) => setScheduleFrequency(value as 'diario' | 'semanal' | 'mensal')}>
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
                <Label htmlFor="scheduleTime">Horário</Label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleScheduleReport} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agendar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}