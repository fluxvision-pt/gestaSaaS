import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog'
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  FileBarChart,
  Eye,
  Plus,
  Loader2
} from 'lucide-react'
import { subscriptionService, tenantService, planService } from '@/services/api'
import { useApi } from '@/hooks/useApi'

interface Relatorio {
  id: number
  nome: string
  tipo: 'financeiro' | 'usuarios' | 'assinaturas' | 'performance' | 'personalizado'
  descricao: string
  dataGeracao: string
  status: 'gerado' | 'processando' | 'erro'
  tamanho: string
  formato: 'PDF' | 'Excel' | 'CSV'
  agendado: boolean
}

interface RelatorioTemplate {
  id: number
  nome: string
  tipo: string
  descricao: string
  icone: React.ReactNode
  metricas: string[]
}



const templatesRelatorios: RelatorioTemplate[] = [
  {
    id: 1,
    nome: 'Relatório Financeiro',
    tipo: 'financeiro',
    descricao: 'Análise completa de receitas, despesas e lucros',
    icone: <DollarSign className="h-6 w-6" />,
    metricas: ['Receita Total', 'Despesas', 'Lucro Líquido', 'Margem de Lucro', 'Fluxo de Caixa']
  },
  {
    id: 2,
    nome: 'Relatório de Usuários',
    tipo: 'usuarios',
    descricao: 'Estatísticas de usuários e engajamento',
    icone: <Users className="h-6 w-6" />,
    metricas: ['Usuários Ativos', 'Novos Usuários', 'Taxa de Retenção', 'Tempo de Sessão', 'Churn Rate']
  },
  {
    id: 3,
    nome: 'Relatório de Assinaturas',
    tipo: 'assinaturas',
    descricao: 'Análise de assinaturas e planos',
    icone: <BarChart3 className="h-6 w-6" />,
    metricas: ['Assinaturas Ativas', 'Novas Assinaturas', 'Cancelamentos', 'MRR', 'ARR']
  },
  {
    id: 4,
    nome: 'Relatório de Performance',
    tipo: 'performance',
    descricao: 'Métricas de performance e conversão',
    icone: <TrendingUp className="h-6 w-6" />,
    metricas: ['Taxa de Conversão', 'CAC', 'LTV', 'ROI', 'Funil de Vendas']
  },
  {
    id: 5,
    nome: 'Dashboard Executivo',
    tipo: 'personalizado',
    descricao: 'Visão geral para tomada de decisões',
    icone: <PieChart className="h-6 w-6" />,
    metricas: ['KPIs Principais', 'Tendências', 'Alertas', 'Projeções', 'Comparativos']
  }
]

export default function Relatorios() {
  const navigate = useNavigate()
  
  // Buscar dados reais
  const { data: subscriptions, loading: subscriptionsLoading } = useApi(() => subscriptionService.getSubscriptions())
  const { data: tenants, loading: tenantsLoading } = useApi(() => tenantService.getTenants())
  const { data: plans, loading: plansLoading } = useApi(() => planService.getPlans())

  // Gerar relatórios baseados em dados reais
  const relatorios = useMemo(() => {
    if (!subscriptions || !tenants || !plans) return []

    const now = new Date()
    const currentMonth = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    
    const relatoriosGerados: Relatorio[] = []

    // Relatório Financeiro
    const assinaturasAtivas = subscriptions.filter(sub => sub.status === 'active')
    const receitaTotal = assinaturasAtivas.reduce((total, sub) => {
      const plan = plans.find(p => p.id === sub.planId.toString())
      return total + (plan?.price || 0)
    }, 0)

    if (receitaTotal > 0) {
      relatoriosGerados.push({
        id: 1,
        nome: `Relatório Financeiro - ${currentMonth}`,
        tipo: 'financeiro',
        descricao: `Análise completa das receitas, despesas e lucros de ${currentMonth}`,
        dataGeracao: now.toISOString().split('T')[0],
        status: 'gerado',
        tamanho: '2.1 MB',
        formato: 'PDF',
        agendado: true
      })
    }

    // Relatório de Usuários
    if (tenants.length > 0) {
      relatoriosGerados.push({
        id: 2,
        nome: 'Relatório de Usuários Ativos',
        tipo: 'usuarios',
        descricao: 'Estatísticas de usuários ativos e engajamento',
        dataGeracao: now.toISOString().split('T')[0],
        status: 'gerado',
        tamanho: '1.5 MB',
        formato: 'Excel',
        agendado: false
      })
    }

    // Relatório de Assinaturas
    if (subscriptions.length > 0) {
      const quarterName = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`
      
      relatoriosGerados.push({
        id: 3,
        nome: `Análise de Assinaturas ${quarterName}`,
        tipo: 'assinaturas',
        descricao: 'Relatório trimestral de assinaturas e churn',
        dataGeracao: now.toISOString().split('T')[0],
        status: 'gerado',
        tamanho: '2.8 MB',
        formato: 'PDF',
        agendado: true
      })
    }

    // Relatório de Performance (sempre em processamento para simular)
    relatoriosGerados.push({
      id: 4,
      nome: 'Performance de Vendas',
      tipo: 'performance',
      descricao: 'Métricas de conversão e performance comercial',
      dataGeracao: now.toISOString().split('T')[0],
      status: 'processando',
      tamanho: '-',
      formato: 'Excel',
      agendado: false
    })

    return relatoriosGerados
  }, [subscriptions, tenants, plans])

  const [templates] = useState<RelatorioTemplate[]>(templatesRelatorios)
  const [tipoFilter, setTipoFilter] = useState<string>('todos')
  const [selectedTemplate, setSelectedTemplate] = useState<RelatorioTemplate | null>(null)
  const [isGenerating, setIsGenerating] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const isLoading = subscriptionsLoading || tenantsLoading || plansLoading

  const handleGerarRelatorio = async (template: RelatorioTemplate) => {
    setIsGenerating(template.id)
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Aqui você pode adicionar a lógica real para gerar o relatório
      console.log(`Gerando relatório: ${template.nome}`)
      
      // Simular download do arquivo
      const blob = new Blob(['Dados do relatório simulado'], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.nome.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setIsGenerating(null)
    }
  }

  const handleGerarRelatorioDialog = async () => {
    if (!selectedTemplate) return
    
    await handleGerarRelatorio(selectedTemplate)
    setIsDialogOpen(false)
    setSelectedTemplate(null)
  }

  const filteredRelatorios = relatorios.filter(relatorio => {
    const matchesTipo = tipoFilter === 'todos' || relatorio.tipo === tipoFilter
    return matchesTipo
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      gerado: 'bg-green-100 text-green-800',
      processando: 'bg-yellow-100 text-yellow-800',
      erro: 'bg-red-100 text-red-800'
    }
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const getTipoBadge = (tipo: string) => {
    const variants = {
      financeiro: 'bg-blue-100 text-blue-800',
      usuarios: 'bg-purple-100 text-purple-800',
      assinaturas: 'bg-green-100 text-green-800',
      performance: 'bg-orange-100 text-orange-800',
      personalizado: 'bg-gray-100 text-gray-800'
    }
    return variants[tipo as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const getFormatoBadge = (formato: string) => {
    const variants = {
      PDF: 'bg-red-100 text-red-800',
      Excel: 'bg-green-100 text-green-800',
      CSV: 'bg-blue-100 text-blue-800'
    }
    return variants[formato as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere e gerencie relatórios personalizados
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/relatorios/avancados')}
          >
            <FileBarChart className="mr-2 h-4 w-4" />
            Relatórios Avançados
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Relatório
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Relatório</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {template.icone}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{template.nome}</CardTitle>
                        <Badge className={getTipoBadge(template.tipo)} variant="secondary">
                          {template.tipo}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.descricao}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Métricas incluídas:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.metricas.slice(0, 3).map((metrica, index) => (
                          <Badge key={`${template.id}-metrica-${index}-${metrica}`} variant="outline" className="text-xs">
                            {metrica}
                          </Badge>
                        ))}
                        {template.metricas.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.metricas.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedTemplate(null)
                }}
              >
                Cancelar
              </Button>
              <Button 
                disabled={!selectedTemplate || isGenerating !== null}
                onClick={handleGerarRelatorioDialog}
              >
                {isGenerating !== null ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  'Gerar Relatório'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : (
                relatorios.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Carregando...' : `${relatorios.filter(r => r.agendado).length} agendados`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gerados Este Mês</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : (
                relatorios.filter(r => r.status === 'gerado').length
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? (
                'Carregando...'
              ) : (
                <>
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +25% vs mês anterior
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : (
                relatorios.filter(r => r.status === 'processando').length
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Carregando...' : 'Tempo médio: 5 min'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Disponíveis</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              Personalizáveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de Relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="usuarios">Usuários</SelectItem>
                <SelectItem value="assinaturas">Assinaturas</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data de Geração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Agendado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Carregando relatórios...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRelatorios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum relatório encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredRelatorios.map((relatorio) => (
                <TableRow key={relatorio.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{relatorio.nome}</p>
                      <p className="text-sm text-muted-foreground">{relatorio.descricao}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTipoBadge(relatorio.tipo)}>
                      {relatorio.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(relatorio.dataGeracao)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(relatorio.status)}>
                      {relatorio.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getFormatoBadge(relatorio.formato)}>
                      {relatorio.formato}
                    </Badge>
                  </TableCell>
                  <TableCell>{relatorio.tamanho}</TableCell>
                  <TableCell>
                    {relatorio.agendado ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Não
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={relatorio.status !== 'gerado'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Templates de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {template.icone}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{template.nome}</CardTitle>
                      <Badge className={getTipoBadge(template.tipo)} variant="secondary">
                        {template.tipo}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.descricao}
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Métricas incluídas:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.metricas.map((metrica, index) => (
                        <Badge key={`${template.id}-all-metrica-${index}-${metrica}`} variant="outline" className="text-xs">
                          {metrica}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="sm"
                    disabled={isGenerating === template.id}
                    onClick={() => handleGerarRelatorio(template)}
                  >
                    {isGenerating === template.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      'Gerar Relatório'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}