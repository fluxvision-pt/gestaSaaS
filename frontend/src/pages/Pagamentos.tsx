import React, { useState } from 'react'
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Loader2
} from 'lucide-react'
import { subscriptionService, pagamentoService } from '@/services/api'
import type { AppPagamento, CreatePagamentoRequest } from '@/types'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { toast } from 'sonner'

export default function Pagamentos() {
  // Buscar dados dos pagamentos e assinaturas
  const { data: pagamentos, loading: pagamentosLoading, refetch: refetchPagamentos } = useApi(() => pagamentoService.getPagamentos())
  const { data: subscriptions } = useApi(() => subscriptionService.getSubscriptions())

  // Estados
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [metodoFilter, setMetodoFilter] = useState<string>('todos')
  const [selectedPagamento, setSelectedPagamento] = useState<AppPagamento | null>(null)
  const [isNewPagamentoOpen, setIsNewPagamentoOpen] = useState(false)
  const [formData, setFormData] = useState<CreatePagamentoRequest>({
    assinaturaId: '',
    valorCents: 0,
    moeda: 'BRL',
    status: 'pendente'
  })

  // Mutations
  const createPagamentoMutation = useApiMutation((data: CreatePagamentoRequest) => pagamentoService.createPagamento(data))

  // Funções de manipulação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPagamentoMutation.mutate(formData)
      toast.success('Pagamento criado com sucesso!')
      setIsNewPagamentoOpen(false)
      setFormData({
        assinaturaId: '',
        valorCents: 0,
        moeda: 'BRL',
        status: 'pendente'
      })
      refetchPagamentos()
    } catch (error) {
      console.error('Erro ao criar pagamento:', error)
      toast.error('Erro ao criar pagamento')
    }
  }



  const filteredPagamentos = pagamentos?.filter(pagamento => {
    const matchesSearch = (pagamento.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pagamento.plano || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || pagamento.status === statusFilter
    const matchesMetodo = metodoFilter === 'todos' || pagamento.metodo === metodoFilter
    
    return matchesSearch && matchesStatus && matchesMetodo
  })

  const totalReceitas = pagamentos
    ?.filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.valor, 0) || 0

  const totalPendente = pagamentos
    ?.filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.valor, 0) || 0

  const totalCancelado = pagamentos
    ?.filter(p => p.status === 'cancelado')
    .reduce((sum, p) => sum + p.valor, 0) || 0

  const getStatusBadge = (status: string) => {
    const variants = {
      pago: 'bg-green-100 text-green-800',
      pendente: 'bg-yellow-100 text-yellow-800',
      cancelado: 'bg-red-100 text-red-800',
      estornado: 'bg-gray-100 text-gray-800'
    }
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const getMetodoBadge = (metodo: string) => {
    const variants = {
      cartao: 'bg-blue-100 text-blue-800',
      boleto: 'bg-orange-100 text-orange-800',
      pix: 'bg-purple-100 text-purple-800',
      transferencia: 'bg-indigo-100 text-indigo-800'
    }
    return variants[metodo as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os pagamentos e transações
          </p>
        </div>
        <Dialog open={isNewPagamentoOpen} onOpenChange={setIsNewPagamentoOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Pagamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="assinaturaId">Assinatura</Label>
                <Select 
                  value={formData.assinaturaId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assinaturaId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma assinatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptions?.map((subscription) => (
                      <SelectItem key={subscription.id} value={subscription.id.toString()}>
                        {subscription.tenant?.name} - {subscription.plan?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valorCents / 100}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    valorCents: Math.round(parseFloat(e.target.value || '0') * 100)
                  }))}
                  placeholder="0,00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="estornado">Estornado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="referenciaExterna">Referência Externa (opcional)</Label>
                <Input
                  id="referenciaExterna"
                  value={formData.referenciaExterna || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, referenciaExterna: e.target.value }))}
                  placeholder="ID do gateway de pagamento"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewPagamentoOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPagamentoMutation.loading}>
                  {createPagamentoMutation.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Pagamento'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pagamentosLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : (
                formatCurrency(totalReceitas)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagamentosLoading ? 'Carregando...' : `${pagamentos?.filter(p => p.status === 'pago').length || 0} pagamentos`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pagamentosLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : (
                formatCurrency(totalPendente)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagamentos?.filter(p => p.status === 'pendente').length || 0} pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelado</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {pagamentosLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : (
                formatCurrency(totalCancelado)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagamentosLoading ? 'Carregando...' : `${pagamentos?.filter(p => p.status === 'cancelado').length || 0} pagamentos`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagamentosLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : (
                pagamentos && pagamentos.length > 0 ? `${((pagamentos.filter(p => p.status === 'pago').length / pagamentos.length) * 100).toFixed(1)}%` : '0%'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagamentos aprovados
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente ou plano..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="estornado">Estornado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={metodoFilter} onValueChange={setMetodoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Métodos</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Pagamentos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Pagamentos</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentosLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Carregando pagamentos...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPagamentos?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum pagamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredPagamentos?.map((pagamento) => (
                <TableRow key={pagamento.id}>
                  <TableCell className="font-medium">#{pagamento.id}</TableCell>
                  <TableCell>{pagamento.cliente}</TableCell>
                  <TableCell>{pagamento.plano}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(pagamento.valor)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(pagamento.status)}>
                      {pagamento.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getMetodoBadge(pagamento.metodo || 'N/A')}>
                      {pagamento.metodo || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(pagamento.dataVencimento)}</TableCell>
                  <TableCell>
                    {pagamento.dataPagamento ? formatDate(pagamento.dataPagamento) : '-'}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedPagamento(pagamento)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Detalhes do Pagamento #{selectedPagamento?.id}</DialogTitle>
                        </DialogHeader>
                        {selectedPagamento && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Cliente</Label>
                                <p className="text-sm text-muted-foreground">{selectedPagamento.cliente}</p>
                              </div>
                              <div>
                                <Label>Plano</Label>
                                <p className="text-sm text-muted-foreground">{selectedPagamento.plano}</p>
                              </div>
                              <div>
                                <Label>Valor</Label>
                                <p className="text-sm text-muted-foreground">{formatCurrency(selectedPagamento.valor)}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <Badge className={getStatusBadge(selectedPagamento.status)}>
                                  {selectedPagamento.status}
                                </Badge>
                              </div>
                              <div>
                                <Label>Método</Label>
                                <Badge className={getMetodoBadge(selectedPagamento.metodo || 'N/A')}>
                                  {selectedPagamento.metodo || 'N/A'}
                                </Badge>
                              </div>
                              <div>
                                <Label>Data de Vencimento</Label>
                                <p className="text-sm text-muted-foreground">{formatDate(selectedPagamento.dataVencimento)}</p>
                              </div>
                              {selectedPagamento.dataPagamento && (
                                <div>
                                  <Label>Data de Pagamento</Label>
                                  <p className="text-sm text-muted-foreground">{formatDate(selectedPagamento.dataPagamento)}</p>
                                </div>
                              )}
                            </div>
                            {selectedPagamento.observacoes && (
                              <div>
                                <Label>Observações</Label>
                                <p className="text-sm text-muted-foreground">{selectedPagamento.observacoes}</p>
                              </div>
                            )}
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline">Fechar</Button>
                        </DialogFooter>
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