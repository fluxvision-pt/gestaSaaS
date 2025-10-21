import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Search, 
  Download, 
  RefreshCw, 
  Eye, 
  Filter,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { auditoriaService } from '@/services/api'
import type { AppLogAuditoria, FiltrosAuditoria } from '@/services/api'

export default function AuditoriaLogs() {
  const [logs, setLogs] = useState<AppLogAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({})
  const [selectedLog, setSelectedLog] = useState<AppLogAuditoria | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    loadLogs()
  }, [filtros])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const data = await auditoriaService.getLogs(filtros)
      setLogs(data)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (formato: 'csv' | 'json') => {
    try {
      const blob = await auditoriaService.exportLogs(filtros, formato)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `auditoria-logs.${formato}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
    }
  }

  const getStatusBadge = (status: 'SUCESSO' | 'FALHA' | 'PENDENTE' | 'CANCELADO' | undefined) => {
    const variants = {
      SUCESSO: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      FALHA: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      PENDENTE: { variant: 'secondary' as const, icon: AlertTriangle, color: 'text-yellow-600' },
      CANCELADO: { variant: 'outline' as const, icon: Shield, color: 'text-gray-600' }
    }
    
    const labels = {
      SUCESSO: 'Sucesso',
      FALHA: 'Falha',
      PENDENTE: 'Pendente',
      CANCELADO: 'Cancelado'
    }
    
    const config = variants[status as keyof typeof variants] || variants.SUCESSO
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {labels[status as keyof typeof labels] || status || 'Desconhecido'}
      </Badge>
    )
  }

  const getRiskBadge = (risco: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO' | undefined) => {
    const variants = {
      BAIXO: 'bg-green-100 text-green-800',
      MEDIO: 'bg-yellow-100 text-yellow-800',
      ALTO: 'bg-red-100 text-red-800',
      CRITICO: 'bg-red-200 text-red-900'
    }
    
    const labels = {
      BAIXO: 'Baixo',
      MEDIO: 'Médio',
      ALTO: 'Alto',
      CRITICO: 'Crítico'
    }
    
    return (
      <Badge className={variants[risco as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[risco as keyof typeof labels] || risco || 'Desconhecido'}
      </Badge>
    )
  }

  const filteredLogs = logs.filter(log =>
    log.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.acao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.recurso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ip?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
          <p className="text-muted-foreground">
            Visualize e analise todos os logs de auditoria do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar JSON
          </Button>
          <Button onClick={loadLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
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
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filtros.categoria || ''}
              onValueChange={(value) => setFiltros({ 
                ...filtros, 
                categoria: value ? value as 'autenticacao' | 'usuarios' | 'pagamentos' | 'sistema' | 'configuracao' : undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="autenticacao">Autenticação</SelectItem>
                <SelectItem value="usuarios">Usuários</SelectItem>
                <SelectItem value="pagamentos">Pagamentos</SelectItem>
                <SelectItem value="sistema">Sistema</SelectItem>
                <SelectItem value="configuracao">Configuração</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.nivelRisco || ''}
              onValueChange={(value) => setFiltros({ 
                ...filtros, 
                nivelRisco: value ? value as 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO' : undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nível de Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="BAIXO">Baixo</SelectItem>
                <SelectItem value="MEDIO">Médio</SelectItem>
                <SelectItem value="ALTO">Alto</SelectItem>
                <SelectItem value="CRITICO">Crítico</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.status || ''}
              onValueChange={(value) => setFiltros({ 
                ...filtros, 
                status: value ? value as 'SUCESSO' | 'FALHA' | 'PENDENTE' | 'CANCELADO' : undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="SUCESSO">Sucesso</SelectItem>
                <SelectItem value="FALHA">Falha</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
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
                  {paginatedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>{log.usuario || 'Sistema'}</TableCell>
                      <TableCell>{log.acao}</TableCell>
                      <TableCell>{log.recurso}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{getRiskBadge(log.nivelRisco)}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                      <TableCell>
                        <Dialog open={isDialogOpen && selectedLog?.id === log.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLog(log)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Log</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">ID</label>
                                  <p className="text-sm text-muted-foreground">{selectedLog?.id}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Timestamp</label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedLog && new Date(selectedLog.timestamp).toLocaleString('pt-BR')}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Usuário</label>
                                  <p className="text-sm text-muted-foreground">{selectedLog?.usuario || 'Sistema'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">IP</label>
                                  <p className="text-sm text-muted-foreground font-mono">{selectedLog?.ip}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Ação</label>
                                  <p className="text-sm text-muted-foreground">{selectedLog?.acao}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Recurso</label>
                                  <p className="text-sm text-muted-foreground">{selectedLog?.recurso}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <div className="mt-1">
                                    {selectedLog && getStatusBadge(selectedLog.status)}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Nível de Risco</label>
                                  <div className="mt-1">
                                    {selectedLog && getRiskBadge(selectedLog.nivelRisco)}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Detalhes</label>
                                <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                                  {selectedLog?.detalhes || 'Nenhum detalhe adicional'}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredLogs.length)} de {filteredLogs.length} logs
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}