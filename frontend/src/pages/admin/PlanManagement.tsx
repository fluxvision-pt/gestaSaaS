import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Plus,
  Edit,
  Copy,
  Power,
  PowerOff,
  Users,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { planService } from '@/services/api';
import type { AppPlan, CreatePlanRequest, UpdatePlanRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PlanFormData {
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  maxUsers: number | null
  maxStorage: number | null
  features: string[]
  isActive: boolean
}

export default function PlanManagement() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<AppPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AppPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    maxUsers: null,
    maxStorage: null,
    features: [],
    isActive: true
  });

  // Carregar planos da API
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await planService.getPlans();
      setPlans(plansData);
      toast.success('Planos carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast.error('Erro ao carregar planos', {
        description: 'Não foi possível carregar a lista de planos. Tente novamente.'
      });
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };



  // Filtrar planos
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (plan.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && plan.isActive) ||
                         (statusFilter === 'inactive' && !plan.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreatePlan = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      maxUsers: null,
      maxStorage: null,
      features: [],
      isActive: true
    });
    setShowCreateModal(true);
  };

  const handleEditPlan = (plan: AppPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price || 0,
      billingCycle: plan.billingCycle || 'monthly',
      maxUsers: plan.maxUsers || null,
      maxStorage: plan.maxStorage || null,
      features: [...(plan.features || [])],
      isActive: plan.isActive || true
    });
    setShowEditModal(true);
  };

  const handleDuplicatePlan = (plan: AppPlan) => {
    setFormData({
      name: `${plan.name} (Cópia)`,
      description: plan.description || '',
      price: plan.price || 0,
      billingCycle: plan.billingCycle || 'monthly',
      maxUsers: plan.maxUsers || null,
      maxStorage: plan.maxStorage || null,
      features: [...(plan.features || [])],
      isActive: false
    });
    setShowCreateModal(true);
  };

  const handleToggleStatus = async (planId: string) => {
    try {
      setToggleLoading(planId);
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const newStatus = !plan.isActive;
      const updatedPlan = await planService.updatePlan(planId, { isActive: newStatus });
      
      // Atualizar o estado local
      setPlans(prev => prev.map(p => 
        p.id === planId ? { ...p, isActive: newStatus } : p
      ));

      toast.success(
        `Plano ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
        {
          description: `O plano "${plan.name}" foi ${newStatus ? 'ativado' : 'desativado'}.`
        }
      );
    } catch (error) {
      console.error('Erro ao alterar status do plano:', error);
      toast.error('Erro ao alterar status do plano', {
        description: 'Não foi possível alterar o status do plano. Tente novamente.'
      });
    } finally {
      setToggleLoading(null);
    }
  };

  const handleSavePlan = async () => {
    try {
      setSaving(true);
      
      if (editingPlan) {
        // Editar plano existente
        const updateData: UpdatePlanRequest = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          billingCycle: formData.billingCycle,
          maxUsers: formData.maxUsers,
          maxStorage: formData.maxStorage,
          features: formData.features,
          isActive: formData.isActive
        };
        
        await planService.updatePlan(editingPlan.id, updateData);
        
        toast.success('Plano atualizado com sucesso', {
          description: `O plano "${formData.name}" foi atualizado.`
        });
      } else {
        // Criar novo plano
        const createData: CreatePlanRequest = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          billingCycle: formData.billingCycle,
          maxUsers: formData.maxUsers,
          maxStorage: formData.maxStorage,
          features: formData.features,
          isActive: formData.isActive
        };
        
        await planService.createPlan(createData);
        
        toast.success('Plano criado com sucesso', {
          description: `O plano "${formData.name}" foi criado.`
        });
      }
      
      // Recarregar a lista de planos
      await loadPlans();
      
      // Fechar modais
      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar plano', {
        description: 'Não foi possível salvar o plano. Verifique os dados e tente novamente.'
      });
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header com breadcrumb + botão "Criar Plano" */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span>Gestão de Planos</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Planos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os planos de assinatura do sistema
          </p>
        </div>
        <Button onClick={handleCreatePlan}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Plano
        </Button>
      </div>

      {/* Barra de filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Filtros e Busca</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Campo de busca */}
            <div className="relative">
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro por status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{filteredPlans.length} planos</Badge>
              <Badge variant="outline">
                {plans.filter(p => p.isActive).length} ativos
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando planos...</span>
        </div>
      ) : (
        /* Grid de cards de planos existentes */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                    {plan.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Preço */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {plan.billingCycle === 'monthly' ? 'Mensal:' : 'Anual:'}
                    </span>
                    <span className="text-lg font-bold">{formatPrice(plan.price || 0)}</span>
                  </div>
                </div>

                {/* Limites */}
                <div className="space-y-1 text-sm text-gray-600">
                  {plan.maxUsers && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Até {plan.maxUsers} usuários</span>
                    </div>
                  )}
                  {plan.maxStorage && (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>{plan.maxStorage}GB de armazenamento</span>
                    </div>
                  )}
                </div>

                {/* Features principais */}
                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700">Recursos:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-gray-400">+{plan.features.length - 3} recursos</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicatePlan(plan)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleToggleStatus(plan.id)}
                    disabled={toggleLoading === plan.id}
                    className={plan.isActive ? 'text-red-600' : 'text-green-600'}
                  >
                    {toggleLoading === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Processando...
                      </>
                    ) : plan.isActive ? (
                      <>
                        <PowerOff className="h-4 w-4 mr-1" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-1" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de criação/edição */}
      <Dialog open={showCreateModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingPlan(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              Configure os dados básicos, preços e recursos do plano.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Dados básicos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dados Básicos</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome do Plano</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Plano Básico"
                  />
                </div>
                
                <div>
                  <Label htmlFor="billingCycle">Ciclo de Cobrança</Label>
                  <Select value={formData.billingCycle} onValueChange={(value: 'monthly' | 'yearly') => 
                    setFormData(prev => ({ ...prev, billingCycle: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do plano..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isActive: checked as boolean }))
                  }
                />
                <Label htmlFor="isActive">Plano Ativo</Label>
              </div>
            </div>

            {/* Preço e Limites */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preço e Limites</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      price: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxUsers">Máximo de Usuários</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.maxUsers || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxUsers: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    placeholder="Ilimitado"
                  />
                </div>

                <div>
                  <Label htmlFor="maxStorage">Armazenamento (GB)</Label>
                  <Input
                    id="maxStorage"
                    type="number"
                    value={formData.maxStorage || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxStorage: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    placeholder="Ilimitado"
                  />
                </div>
              </div>
            </div>

            {/* Recursos/Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recursos do Plano</h3>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Descreva o recurso..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview do card */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preview do Plano</h3>
              <Card className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-xl">{formData.name || 'Nome do Plano'}</CardTitle>
                    </div>
                    <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                      {formData.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <CardDescription>{formData.description || 'Descrição do plano'}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formData.billingCycle === 'monthly' ? 'Mensal:' : 'Anual:'}
                      </span>
                      <span className="text-lg font-bold">{formatPrice(formData.price || 0)}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    {formData.maxUsers && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Até {formData.maxUsers} usuários</span>
                      </div>
                    )}
                    {formData.maxStorage && (
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>{formData.maxStorage}GB de armazenamento</span>
                      </div>
                    )}
                  </div>

                  {formData.features && formData.features.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-700">Recursos:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {formData.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center space-x-1">
                            <Check className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {formData.features.length > 3 && (
                          <li className="text-gray-400">+{formData.features.length - 3} recursos</li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setEditingPlan(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSavePlan} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                editingPlan ? 'Salvar Alterações' : 'Criar Plano'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}