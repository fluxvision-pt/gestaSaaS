import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react'
import { tenantService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Tenant {
  id: string
  name: string
  domain: string
  isActive: boolean
  maxUsers: number
  currentUsers: number
  planId: number
  createdAt: string
  updatedAt: string
}

interface CreateTenantRequest {
  nomeFantasia: string
  razaoSocial?: string
  documento: string
  email: string
  telefoneE164?: string
  codPais?: string
  idiomaPreferido?: string
  moedaPreferida?: string
}

interface UpdateTenantRequest {
  nomeFantasia?: string
  razaoSocial?: string
  documento?: string
  email?: string
  telefoneE164?: string
  codPais?: string
  idiomaPreferido?: string
  moedaPreferida?: string
  status?: 'ativo' | 'suspenso' | 'cancelado'
}

export default function Empresas() {
  const { isSuperAdmin } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<CreateTenantRequest>({
    nomeFantasia: '',
    razaoSocial: '',
    documento: '',
    email: '',
    telefoneE164: '',
    codPais: 'BR',
    idiomaPreferido: 'pt-BR',
    moedaPreferida: 'BRL'
  })

  useEffect(() => {
    if (isSuperAdmin) {
      fetchTenants()
    }
  }, [isSuperAdmin])

  useEffect(() => {
    const filtered = tenants.filter(tenant =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTenants(filtered)
  }, [tenants, searchTerm])

  const fetchTenants = async () => {
    try {
      setLoading(true)
      const data = await tenantService.getTenants()
      setTenants(data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast.error('Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant)
    setFormData({
      nomeFantasia: tenant.name,
      razaoSocial: '',
      documento: '',
      email: tenant.domain,
      telefoneE164: '',
      codPais: 'BR',
      idiomaPreferido: 'pt-BR',
      moedaPreferida: 'BRL'
    })
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditingTenant(null)
    setFormData({
      nomeFantasia: '',
      razaoSocial: '',
      documento: '',
      email: '',
      telefoneE164: '',
      codPais: 'BR',
      idiomaPreferido: 'pt-BR',
      moedaPreferida: 'BRL'
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingTenant) {
        const updateData: UpdateTenantRequest = {
          nomeFantasia: formData.nomeFantasia,
          razaoSocial: formData.razaoSocial,
          documento: formData.documento,
          email: formData.email,
          telefoneE164: formData.telefoneE164,
          codPais: formData.codPais,
          idiomaPreferido: formData.idiomaPreferido,
          moedaPreferida: formData.moedaPreferida
        }
        await tenantService.updateTenant(editingTenant.id, updateData)
        toast.success('Empresa atualizada com sucesso!')
      } else {
        await tenantService.createTenant(formData)
        toast.success('Empresa criada com sucesso!')
      }
      
      setIsDialogOpen(false)
      fetchTenants()
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      toast.error('Erro ao salvar empresa')
    }
  }

  const handleDelete = async (tenant: Tenant) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await tenantService.deleteTenant(tenant.id)
        toast.success('Empresa excluída com sucesso!')
        fetchTenants()
      } catch (error) {
        console.error('Erro ao excluir empresa:', error)
        toast.error('Erro ao excluir empresa')
      }
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acesso negado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Apenas super administradores podem gerenciar empresas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie as empresas cadastradas no sistema
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as empresas cadastradas
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Carregando...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.domain}</TableCell>
                    <TableCell>
                      <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                        {tenant.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tenant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tenant)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTenants.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-center">
                        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          Nenhuma empresa encontrada
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? 'Tente ajustar sua pesquisa.' : 'Comece criando uma nova empresa.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? 'Editar Empresa' : 'Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              {editingTenant 
                ? 'Atualize as informações da empresa.' 
                : 'Preencha as informações para criar uma nova empresa.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
                <Input
                  id="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social</Label>
                <Input
                  id="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documento">CPF/CNPJ *</Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefoneE164">Telefone</Label>
                <Input
                  id="telefoneE164"
                  value={formData.telefoneE164}
                  onChange={(e) => setFormData({ ...formData, telefoneE164: e.target.value })}
                  placeholder="+5511999999999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codPais">País</Label>
                <Select
                  value={formData.codPais}
                  onValueChange={(value) => setFormData({ ...formData, codPais: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                    <SelectItem value="ES">Espanha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idiomaPreferido">Idioma</Label>
                <Select
                  value={formData.idiomaPreferido}
                  onValueChange={(value) => setFormData({ ...formData, idiomaPreferido: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español (España)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="moedaPreferida">Moeda</Label>
                <Select
                  value={formData.moedaPreferida}
                  onValueChange={(value) => setFormData({ ...formData, moedaPreferida: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (BRL)</SelectItem>
                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTenant ? 'Atualizar' : 'Criar'} Empresa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}