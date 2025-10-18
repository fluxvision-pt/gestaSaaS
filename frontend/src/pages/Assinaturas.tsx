import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Eye, Edit, AlertTriangle, Calendar, DollarSign, Users, TrendingUp, Loader2 } from 'lucide-react'
import { subscriptionService, tenantService, planService } from '@/services/api'
import { useApi, useApiMutation } from '@/hooks/useApi'
import type { Subscription, CreateSubscriptionRequest, UpdateSubscriptionRequest } from '@/types'

export default function Assinaturas() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  // Buscar dados
  const { data: subscriptions, loading: subscriptionsLoading, error: subscriptionsError, refetch: refetchSubscriptions } = useApi(() => subscriptionService.getSubscriptions())
  const { data: tenants, loading: tenantsLoading } = useApi(() => tenantService.getTenants())
  const { data: plans, loading: plansLoading } = useApi(() => planService.getPlans())

  // Mutations
  const updateSubscriptionMutation = useApiMutation(({ id, data }: { id: number, data: UpdateSubscriptionRequest }) => 
    subscriptionService.updateSubscription(id, data)
  )
  const cancelSubscriptionMutation = useApiMutation((id: number) => subscriptionService.cancelSubscription(id))

  const filteredAssinaturas = subscriptions?.filter(assinatura => {
    const matchesSearch = 
      (assinatura.tenant?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assinatura.tenant?.users?.[0]?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assinatura.tenant?.users?.[0]?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assinatura.plan?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'todos' || assinatura.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const handleView = (assinatura: Subscription) => {
    setSelectedSubscription(assinatura)
    setIsDialogOpen(true)
  }

  const handleCancel = async (id: number) => {
    if (confirm('Tem certeza que deseja cancelar esta assinatura?')) {
      try {
        await cancelSubscriptionMutation.mutate(id)
        refetchSubscriptions()
      } catch (error) {
        console.error('Erro ao cancelar assinatura:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  if (subscriptionsLoading || tenantsLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  if (subscriptionsError) {
    return (
      <div className="text-center text-red-600">
        Erro ao carregar assinaturas: {subscriptionsError}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativa</Badge>
      case 'expired':
        return <Badge variant="destructive">Vencida</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelada</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date()
    const expiry = new Date(endDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Estatísticas
  const stats = {
    total: subscriptions?.length || 0,
    ativas: subscriptions?.filter(a => a.status === 'active').length || 0,
    vencidas: subscriptions?.filter(a => a.status === 'expired').length || 0,
    receitaMensal: subscriptions
      ?.filter(a => a.status === 'active')
      .reduce((acc, a) => acc + (a.plan?.price || 0), 0) || 0,
    vencendoEmBreve: subscriptions?.filter(a => 
      a.status === 'active' && 
      a.endDate && 
      getDaysUntilExpiry(a.endDate) <= 7 && 
      getDaysUntilExpiry(a.endDate) > 0
    ).length || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assinaturas</h1>
          <p className="text-gray-600">Gerencie as assinaturas dos clientes</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">assinaturas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ativas}</div>
            <p className="text-xs text-muted-foreground">em funcionamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.vencidas}</div>
            <p className="text-xs text-muted-foreground">precisam atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(stats.receitaMensal)}
            </div>
            <p className="text-xs text-muted-foreground">recorrente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.vencendoEmBreve}</div>
            <p className="text-xs text-muted-foreground">em 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque e filtre assinaturas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por empresa ou plano..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="expired">Vencida</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de assinaturas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Assinaturas</CardTitle>
          <CardDescription>
            {filteredAssinaturas.length} assinatura(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Próximo Pagamento</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssinaturas.map((assinatura) => (
                <TableRow key={assinatura.id}>
                  <TableCell className="font-medium">{assinatura.tenant?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{assinatura.plan?.name || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(assinatura.status)}
                  </TableCell>
                  <TableCell>{formatPrice(assinatura.plan?.price || 0)}</TableCell>
                  <TableCell>
                    {assinatura.endDate ? formatDate(assinatura.endDate) : '-'}
                  </TableCell>
                  <TableCell>
                    {assinatura.tenant?.users?.length || 0}/{assinatura.plan?.maxUsers === 999 ? '∞' : assinatura.plan?.maxUsers || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(assinatura)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {assinatura.status === 'active' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleCancel(assinatura.id)}
                          disabled={cancelSubscriptionMutation.loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para visualizar detalhes da assinatura */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Assinatura</DialogTitle>
            <DialogDescription>
              Informações completas da assinatura
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Empresa</Label>
                  <p className="text-sm">{selectedSubscription.tenant?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Plano</Label>
                  <p className="text-sm">{selectedSubscription.plan?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedSubscription.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valor Mensal</Label>
                  <p className="text-sm font-semibold">{formatPrice(selectedSubscription.plan?.price || 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Data de Início</Label>
                  <p className="text-sm">{selectedSubscription.startDate ? formatDate(selectedSubscription.startDate) : '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Data de Término</Label>
                  <p className="text-sm">
                    {selectedSubscription.endDate ? formatDate(selectedSubscription.endDate) : '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Usuários</Label>
                  <p className="text-sm">
                    {selectedSubscription.tenant?.users?.length || 0}/{selectedSubscription.plan?.maxUsers === 999 ? '∞' : selectedSubscription.plan?.maxUsers || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Contato</Label>
                  <p className="text-sm">{selectedSubscription.tenant?.users?.[0]?.email || 'N/A'}</p>
                </div>
              </div>

              {selectedSubscription.endDate && selectedSubscription.status === 'active' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    {getDaysUntilExpiry(selectedSubscription.endDate) > 0 
                      ? `Vence em ${getDaysUntilExpiry(selectedSubscription.endDate)} dia(s)`
                      : `Vencida há ${Math.abs(getDaysUntilExpiry(selectedSubscription.endDate))} dia(s)`
                    }
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Fechar
            </Button>
            <Button>
              Editar Assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}