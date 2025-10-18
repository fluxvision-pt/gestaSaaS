import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2
} from 'lucide-react'
import { auditoriaService, type AppLogAuditoria, type FiltrosAuditoria } from '@/services/api'
import { useApi } from '@/hooks/useApi'

export default function Auditoria() {
  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({})
  
  // Buscar logs de auditoria da API
  const { data: logs, loading: logsLoading, refetch: refetchLogs } = useApi(() => auditoriaService.getLogs(filtros))

  // Estados locais
  const [filteredLogs, setFilteredLogs] = useState<AppLogAuditoria[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todas')
  const [riscoFilter, setRiscoFilter] = useState<string>('todos')
  const [selectedLog, setSelectedLog] = useState<AppLogAuditoria | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Atualizar logs filtrados quando os dados ou filtros mudarem
  useEffect(() => {
    if (!logs) return

    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.recurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.detalhes.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(log => log.status === statusFilter)
    }

    if (categoriaFilter !== 'todas') {
      filtered = filtered.filter(log => log.categoria === categoriaFilter)
    }

    if (riscoFilter !== 'todos') {
      filtered = filtered.filter(log => log.risco === riscoFilter)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, statusFilter, categoriaFilter, riscoFilter])

  // Atualizar filtros da API quando os filtros locais mudarem
  useEffect(() => {
    const novosFiltros: FiltrosAuditoria = {}
    
    if (statusFilter !== 'todos') novosFiltros.status = statusFilter as "pendente" | "sucesso" | "erro"
    if (categoriaFilter !== 'todas') novosFiltros.categoria = categoriaFilter as "autenticacao" | "usuarios" | "pagamentos" | "sistema" | "configuracao"
    if (riscoFilter !== 'todos') novosFiltros.risco = riscoFilter as "baixo" | "medio" | "alto"
    if (searchTerm) {
      novosFiltros.usuario = searchTerm
      novosFiltros.acao = searchTerm
    }

    setFiltros(novosFiltros)
  }, [statusFilter, categoriaFilter, riscoFilter, searchTerm])

  // Recarregar dados quando filtros mudarem
  useEffect(() => {
    refetchLogs()
  }, [filtros, refetchLogs])

  const isLoading = logsLoading

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sucesso':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sucesso</Badge>
      case 'falha':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Falha</Badge>
      case 'pendente':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiscoBadge = (risco: string) => {
    switch (risco) {
      case 'baixo':
        return <Badge variant="outline" className="text-green-600 border-green-600">Baixo</Badge>
      case 'medio':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Médio</Badge>
      case 'alto':
        return <Badge variant="outline" className="text-red-600 border-red-600">Alto</Badge>
      default:
        return <Badge variant="outline">{risco}</Badge>
    }
  }

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'autenticacao':
        return <Shield className="w-4 h-4" />
      case 'crud':
        return <FileText className="w-4 h-4" />
      case 'configuracao':
        return <Activity className="w-4 h-4" />
      case 'sistema':
        return <Activity className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  const handleExportLogs = async () => {
    setIsExporting(true)
    try {
      const blob = await auditoriaService.exportLogs(filtros)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `logs-auditoria-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getLogStats = () => {
    const logsArray = logs || []
    const total = logsArray.length
    const sucessos = logsArray.filter(log => log.status === 'sucesso').length
    const falhas = logsArray.filter(log => log.status === 'erro').length
    const riscoAlto = logsArray.filter(log => log.risco === 'alto').length

    return { total, sucessos, falhas, riscoAlto }
  }

  const stats = getLogStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auditoria</h1>
          <p className="text-muted-foreground">
            Monitore todas as atividades e eventos do sistema
          </p>
        </div>
        <Button onClick={handleExportLogs} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isExporting ? 'Exportando...' : 'Exportar Logs'}
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Carregando...
                    </div>
                  ) : (
                    stats.total
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Sucessos</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Carregando...
                    </div>
                  ) : (
                    stats.sucessos
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Falhas</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Carregando...
                    </div>
                  ) : (
                    stats.falhas
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Alto Risco</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Carregando...
                    </div>
                  ) : (
                    stats.riscoAlto
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="sucesso">Sucesso</SelectItem>
                  <SelectItem value="falha">Falha</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="autenticacao">Autenticação</SelectItem>
                  <SelectItem value="crud">CRUD</SelectItem>
                  <SelectItem value="configuracao">Configuração</SelectItem>
                  <SelectItem value="sistema">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nível de Risco</Label>
              <Select value={riscoFilter} onValueChange={setRiscoFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Carregando logs de auditoria...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {log.usuario}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCategoriaIcon(log.categoria)}
                      {log.acao}
                    </div>
                  </TableCell>
                  <TableCell>{log.recurso}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>{getRiscoBadge(log.risco)}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">ID do Log</Label>
                                <p className="text-sm text-muted-foreground">{selectedLog.id}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Timestamp</Label>
                                <p className="text-sm text-muted-foreground">{formatTimestamp(selectedLog.timestamp)}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Usuário</Label>
                                <p className="text-sm text-muted-foreground">{selectedLog.usuario}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Ação</Label>
                                <p className="text-sm text-muted-foreground">{selectedLog.acao}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Recurso</Label>
                                <p className="text-sm text-muted-foreground">{selectedLog.recurso}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Status</Label>
                                <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Categoria</Label>
                                <p className="text-sm text-muted-foreground capitalize">{selectedLog.categoria}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Nível de Risco</Label>
                                <div className="mt-1">{getRiscoBadge(selectedLog.risco)}</div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Endereço IP</Label>
                                <p className="text-sm text-muted-foreground font-mono">{selectedLog.ip}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Detalhes</Label>
                              <p className="text-sm text-muted-foreground mt-1">{selectedLog.detalhes}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">User Agent</Label>
                              <p className="text-sm text-muted-foreground font-mono mt-1 break-all">{selectedLog.userAgent}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}