import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Check, X, Loader2 } from 'lucide-react'
import { planService } from '@/services/api'
import { useApi, useApiMutation } from '@/hooks/useApi'
import type { AppPlan, CreatePlanRequest, UpdatePlanRequest } from '@/types'

export default function Planos() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<AppPlan | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    features: [] as string[],
    maxUsers: '',
    maxStorage: ''
  })

  // Buscar dados
  const { data: plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = useApi(() => planService.getPlans())

  // Mutations
  const createPlanMutation = useApiMutation((data: CreatePlanRequest) => planService.createPlan(data))
  const updatePlanMutation = useApiMutation(({ id, data }: { id: string, data: UpdatePlanRequest }) => 
    planService.updatePlan(id, data)
  )
  const deletePlanMutation = useApiMutation((id: string) => planService.deletePlan(id))

  const filteredPlanos = plans?.filter(plano =>
    plano.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plano.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleEdit = (plano: AppPlan) => {
    setEditingPlan(plano)
    setFormData({
      name: plano.name,
      description: plano.description,
      price: (plano.price || 0).toString(),
      billingCycle: plano.billingCycle,
      features: plano.features || [],
      maxUsers: plano.maxUsers?.toString() || '',
      maxStorage: plano.maxStorage?.toString() || ''
    })
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      billingCycle: 'monthly',
      features: [],
      maxUsers: '',
      maxStorage: ''
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const planData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        billingCycle: formData.billingCycle,
        features: formData.features,
        maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : null,
        maxStorage: formData.maxStorage ? parseInt(formData.maxStorage) : null
      }

      if (editingPlan) {
        await updatePlanMutation.mutate({
          id: editingPlan.id,
          data: planData
        })
      } else {
        await createPlanMutation.mutate(planData)
      }
      
      setIsDialogOpen(false)
      refetchPlans()
    } catch (error) {
      console.error('Erro ao salvar plano:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await deletePlanMutation.mutate(id)
        refetchPlans()
      } catch (error) {
        console.error('Erro ao excluir plano:', error)
      }
    }
  }

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  if (plansError) {
    return (
      <div className="text-center text-red-600">
        Erro ao carregar planos: {plansError}
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos</h1>
          <p className="text-gray-600">Gerencie os planos de assinatura</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Grid de planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlanos.map((plano) => (
          <Card key={plano.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{plano.name}</CardTitle>
                  <CardDescription>{plano.description}</CardDescription>
                </div>
                <Badge variant={plano.isActive ? "default" : "secondary"}>
                  {plano.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {formatPrice(plano.price || 0)}
                <span className="text-sm font-normal text-gray-500">/{plano.billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plano.features && plano.features.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Recursos inclusos:</h4>
                  <ul className="space-y-1">
                    {plano.features.map((feature, index) => (
                      <li key={`${plano.id}-feature-${index}-${feature}`} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="space-y-2 text-sm text-gray-600">
                  {plano.maxUsers && (
                    <div className="flex justify-between items-center">
                      <span>Máx. usuários:</span>
                      <Badge variant="outline">{plano.maxUsers}</Badge>
                    </div>
                  )}
                  {plano.maxStorage && (
                    <div className="flex justify-between items-center">
                      <span>Armazenamento:</span>
                      <Badge variant="outline">{plano.maxStorage}GB</Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(plano)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(plano.id)} className="flex-1">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPlanos.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPlanos.filter(p => p.isActive).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(filteredPlanos.reduce((acc, plano) => acc + (plano.price || 0), 0) / (filteredPlanos.length || 1))}
            </div>
            <p className="text-xs text-muted-foreground">
              Média dos planos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPlanos.filter(p => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {filteredPlanos.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para criar/editar plano */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan 
                ? 'Edite as informações do plano abaixo.'
                : 'Preencha as informações para criar um novo plano.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Preço
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="features" className="text-right">
                  Recursos
                </Label>
                <Textarea
                  id="features"
                  placeholder="Um recurso por linha"
                  value={formData.features.join('\n')}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value.split('\n').filter(f => f.trim()) }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxUsers" className="text-right">
                  Máx. Usuários
                </Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxStorage" className="text-right">
                  Armazenamento (GB)
                </Label>
                <Input
                  id="maxStorage"
                  type="number"
                  value={formData.maxStorage}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxStorage: e.target.value }))}
                  className="col-span-3"
                />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={createPlanMutation.loading || updatePlanMutation.loading}
            >
              {(createPlanMutation.loading || updatePlanMutation.loading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPlan ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}