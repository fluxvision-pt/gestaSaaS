import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { gatewayService } from '@/services/api'
import StripeConfiguration from '@/components/gateways/StripeConfiguration'
import { MercadoPagoConfiguration } from '@/components/gateways/MercadoPagoConfiguration'
import type { AppGateway, AppCredencialGateway, CreateGatewayRequest, UpdateGatewayRequest, CreateCredencialGatewayRequest, UpdateCredencialGatewayRequest } from '@/types'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  CreditCard, 
  Smartphone, 
  Building, 
  Key,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react'

export default function Gateways() {
  const [selectedGateway, setSelectedGateway] = useState<AppGateway | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false)
  const [editingCredential, setEditingCredential] = useState<AppCredencialGateway | null>(null)
  const [showCredentialValues, setShowCredentialValues] = useState<Record<string, boolean>>({})

  // Estados para formulários
  const [gatewayForm, setGatewayForm] = useState<CreateGatewayRequest>({
    nome: '',
    tipo: 'ONLINE',
    ativo: true
  })

  const [credentialForm, setCredentialForm] = useState<CreateCredencialGatewayRequest>({
    gatewayId: '',
    chave: '',
    valor: ''
  })

  // Hooks de API
  const { data: gateways, isLoading, refetch } = useApi(gatewayService.getGateways)
  const { data: credentials, refetch: refetchCredentials } = useApi(
    () => selectedGateway ? gatewayService.getCredenciais(selectedGateway.id) : Promise.resolve([]),
    [selectedGateway?.id]
  )

  const createGatewayMutation = useApiMutation(gatewayService.createGateway, {
    onSuccess: () => {
      toast({ title: 'Gateway criado com sucesso!' })
      setIsCreateDialogOpen(false)
      resetGatewayForm()
      refetch()
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar gateway', description: error.message, variant: 'destructive' })
    }
  })

  const updateGatewayMutation = useApiMutation(
    ({ id, data }: { id: string; data: UpdateGatewayRequest }) => gatewayService.updateGateway(id, data),
    {
      onSuccess: () => {
        toast({ title: 'Gateway atualizado com sucesso!' })
        setIsEditDialogOpen(false)
        resetGatewayForm()
        refetch()
      },
      onError: (error) => {
        toast({ title: 'Erro ao atualizar gateway', description: error.message, variant: 'destructive' })
      }
    }
  )

  const deleteGatewayMutation = useApiMutation(gatewayService.deleteGateway, {
    onSuccess: () => {
      toast({ title: 'Gateway excluído com sucesso!' })
      refetch()
      if (selectedGateway) {
        setSelectedGateway(null)
      }
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir gateway', description: error.message, variant: 'destructive' })
    }
  })

  const createCredentialMutation = useApiMutation(gatewayService.createCredencial, {
    onSuccess: () => {
      toast({ title: 'Credencial criada com sucesso!' })
      setIsCredentialDialogOpen(false)
      resetCredentialForm()
      refetchCredentials()
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar credencial', description: error.message, variant: 'destructive' })
    }
  })

  const updateCredentialMutation = useApiMutation(
    ({ id, data }: { id: string; data: UpdateCredencialGatewayRequest }) => gatewayService.updateCredencial(id, data),
    {
      onSuccess: () => {
        toast({ title: 'Credencial atualizada com sucesso!' })
        setIsCredentialDialogOpen(false)
        setEditingCredential(null)
        resetCredentialForm()
        refetchCredentials()
      },
      onError: (error) => {
        toast({ title: 'Erro ao atualizar credencial', description: error.message, variant: 'destructive' })
      }
    }
  )

  const deleteCredentialMutation = useApiMutation(gatewayService.deleteCredencial, {
    onSuccess: () => {
      toast({ title: 'Credencial excluída com sucesso!' })
      refetchCredentials()
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir credencial', description: error.message, variant: 'destructive' })
    }
  })

  // Funções auxiliares
  const resetGatewayForm = () => {
    setGatewayForm({
      nome: '',
      tipo: 'ONLINE',
      ativo: true
    })
  }

  const resetCredentialForm = () => {
    setCredentialForm({
      gatewayId: selectedGateway?.id || '',
      chave: '',
      valor: ''
    })
  }

  const handleCreateGateway = () => {
    createGatewayMutation.mutate(gatewayForm)
  }

  const handleUpdateGateway = () => {
    if (!selectedGateway) return
    updateGatewayMutation.mutate({
      id: selectedGateway.id,
      data: gatewayForm
    })
  }

  const handleDeleteGateway = (gateway: AppGateway) => {
    if (confirm(`Tem certeza que deseja excluir o gateway "${gateway.nome}"?`)) {
      deleteGatewayMutation.mutate(gateway.id)
    }
  }

  const handleEditGateway = (gateway: AppGateway) => {
    setSelectedGateway(gateway)
    setGatewayForm({
      nome: gateway.nome,
      tipo: gateway.tipo,
      ativo: gateway.ativo
    })
    setIsEditDialogOpen(true)
  }

  const handleCreateCredential = () => {
    createCredentialMutation.mutate({
      ...credentialForm,
      gatewayId: selectedGateway!.id
    })
  }

  const handleEditCredential = (credential: AppCredencialGateway) => {
    setEditingCredential(credential)
    setCredentialForm({
      gatewayId: credential.gatewayId,
      chave: credential.chave,
      valor: credential.valor
    })
    setIsCredentialDialogOpen(true)
  }

  const handleUpdateCredential = () => {
    if (!editingCredential) return
    updateCredentialMutation.mutate({
      id: editingCredential.id,
      data: {
        chave: credentialForm.chave,
        valor: credentialForm.valor
      }
    })
  }

  const handleDeleteCredential = (credential: AppCredencialGateway) => {
    if (confirm(`Tem certeza que deseja excluir a credencial "${credential.chave}"?`)) {
      deleteCredentialMutation.mutate(credential.id)
    }
  }

  const toggleCredentialVisibility = (credentialId: string) => {
    setShowCredentialValues(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }))
  }

  const getGatewayIcon = (tipo: string) => {
    switch (tipo) {
      case 'ONLINE':
        return <CreditCard className="h-4 w-4" />
      case 'OFFLINE':
        return <Building className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getGatewayTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'ONLINE':
        return 'Online'
      case 'OFFLINE':
        return 'Offline'
      default:
        return tipo
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando gateways...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gateways de Pagamento</h1>
          <p className="text-muted-foreground">
            Configure e gerencie os gateways de pagamento do sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Gateway
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Gateway</DialogTitle>
              <DialogDescription>
                Configure um novo gateway de pagamento para o sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Gateway</Label>
                <Input
                  id="nome"
                  value={gatewayForm.nome}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Stripe, Mercado Pago, PIX"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={gatewayForm.tipo}
                  onValueChange={(value: 'ONLINE' | 'OFFLINE') => 
                    setGatewayForm(prev => ({ ...prev, tipo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={gatewayForm.ativo}
                  onCheckedChange={(checked) => setGatewayForm(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="ativo">Gateway ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateGateway}
                disabled={createGatewayMutation.isPending}
              >
                {createGatewayMutation.isPending ? 'Criando...' : 'Criar Gateway'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Gateways */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Gateways Disponíveis</CardTitle>
              <CardDescription>
                {gateways?.length || 0} gateway(s) configurado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gateways?.map((gateway) => (
                  <div
                    key={gateway.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedGateway?.id === gateway.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedGateway(gateway)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getGatewayIcon(gateway.tipo)}
                        <div>
                          <p className="font-medium">{gateway.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {getGatewayTypeLabel(gateway.tipo)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={gateway.ativo ? 'default' : 'secondary'}>
                          {gateway.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditGateway(gateway)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteGateway(gateway)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!gateways || gateways.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum gateway configurado</p>
                    <p className="text-xs">Clique em "Novo Gateway" para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Gateway Selecionado */}
        <div className="lg:col-span-2">
          {selectedGateway ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getGatewayIcon(selectedGateway.tipo)}
                    <div>
                      <CardTitle>{selectedGateway.nome}</CardTitle>
                      <CardDescription>
                        Gateway {getGatewayTypeLabel(selectedGateway.tipo)} • 
                        {selectedGateway.ativo ? ' Ativo' : ' Inativo'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={selectedGateway.ativo ? 'default' : 'secondary'}>
                    {selectedGateway.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="credenciais" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="credenciais">Credenciais</TabsTrigger>
                    <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="credenciais" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Credenciais de Acesso</h3>
                      <Dialog open={isCredentialDialogOpen} onOpenChange={setIsCredentialDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => {
                            setEditingCredential(null)
                            resetCredentialForm()
                            setIsCredentialDialogOpen(true)
                          }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Credencial
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {editingCredential ? 'Editar Credencial' : 'Nova Credencial'}
                            </DialogTitle>
                            <DialogDescription>
                              {editingCredential 
                                ? 'Atualize as informações da credencial'
                                : 'Adicione uma nova credencial para este gateway'
                              }
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="chave">Chave</Label>
                              <Input
                                id="chave"
                                value={credentialForm.chave}
                                onChange={(e) => setCredentialForm(prev => ({ ...prev, chave: e.target.value }))}
                                placeholder="Ex: api_key, secret_key, client_id"
                              />
                            </div>
                            <div>
                              <Label htmlFor="valor">Valor</Label>
                              <Input
                                id="valor"
                                type="password"
                                value={credentialForm.valor}
                                onChange={(e) => setCredentialForm(prev => ({ ...prev, valor: e.target.value }))}
                                placeholder="Valor da credencial"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => {
                              setIsCredentialDialogOpen(false)
                              setEditingCredential(null)
                              resetCredentialForm()
                            }}>
                              Cancelar
                            </Button>
                            <Button 
                              onClick={editingCredential ? handleUpdateCredential : handleCreateCredential}
                              disabled={createCredentialMutation.isPending || updateCredentialMutation.isPending}
                            >
                              {(createCredentialMutation.isPending || updateCredentialMutation.isPending) 
                                ? 'Salvando...' 
                                : editingCredential ? 'Atualizar' : 'Criar'
                              }
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-2">
                      {credentials?.map((credential) => (
                        <div key={credential.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Key className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{credential.chave}</p>
                                <p className="text-sm text-muted-foreground">
                                  {showCredentialValues[credential.id] 
                                    ? credential.valor 
                                    : '•'.repeat(credential.valor.length)
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleCredentialVisibility(credential.id)}
                              >
                                {showCredentialValues[credential.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditCredential(credential)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCredential(credential)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!credentials || credentials.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Key className="h-8 w-8 mx-auto mb-2" />
                          <p>Nenhuma credencial configurada</p>
                          <p className="text-xs">Adicione credenciais para usar este gateway</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="configuracoes" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Informações do Gateway</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>ID</Label>
                            <p className="text-sm text-muted-foreground font-mono">{selectedGateway.id}</p>
                          </div>
                          <div>
                            <Label>Tipo</Label>
                            <p className="text-sm">{getGatewayTypeLabel(selectedGateway.tipo)}</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <p className="text-sm">
                              <Badge variant={selectedGateway.ativo ? 'default' : 'secondary'}>
                                {selectedGateway.ativo ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <Label>Criado em</Label>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedGateway.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Configuração específica do Stripe */}
                      {selectedGateway.nome.toLowerCase() === 'stripe' && (
                        <>
                          <div>
                            <h3 className="text-lg font-medium mb-2">Configuração do Stripe</h3>
                            <StripeConfiguration gatewayId={selectedGateway.id} />
                          </div>
                          <Separator />
                        </>
                      )}

                      {/* Configuração específica do Mercado Pago */}
                      {selectedGateway.nome.toLowerCase() === 'mercado pago' && (
                        <>
                          <div>
                            <h3 className="text-lg font-medium mb-2">Configuração do Mercado Pago</h3>
                            <MercadoPagoConfiguration 
                              gatewayId={selectedGateway.id}
                              credentials={selectedGateway.credenciais || []}
                              onCredentialsUpdate={refetchGateways}
                            />
                          </div>
                          <Separator />
                        </>
                      )}
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Ações</h3>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => handleEditGateway(selectedGateway)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Gateway
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteGateway(selectedGateway)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Gateway
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Selecione um Gateway</h3>
                  <p>Escolha um gateway na lista ao lado para ver os detalhes e configurações</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de Edição de Gateway */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Gateway</DialogTitle>
            <DialogDescription>
              Atualize as informações do gateway de pagamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nome">Nome do Gateway</Label>
              <Input
                id="edit-nome"
                value={gatewayForm.nome}
                onChange={(e) => setGatewayForm(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Stripe, Mercado Pago, PIX"
              />
            </div>
            <div>
              <Label htmlFor="edit-tipo">Tipo</Label>
              <Select
                value={gatewayForm.tipo}
                onValueChange={(value: 'ONLINE' | 'OFFLINE') => 
                  setGatewayForm(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-ativo"
                checked={gatewayForm.ativo}
                onCheckedChange={(checked) => setGatewayForm(prev => ({ ...prev, ativo: checked }))}
              />
              <Label htmlFor="edit-ativo">Gateway ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateGateway}
              disabled={updateGatewayMutation.isPending}
            >
              {updateGatewayMutation.isPending ? 'Atualizando...' : 'Atualizar Gateway'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}