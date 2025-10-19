import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Edit, Trash2, Loader2, LogIn, User } from 'lucide-react'
import { userService, tenantService, planService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import type { AppUser, CreateUserRequest, UpdateUserRequest } from '@/types'
import { useApi, useApiMutation } from '@/hooks/useApi'

// Função para gerar senha temporária segura
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export default function Usuarios() {
  const { isSuperAdmin, impersonate } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    tenantId: '',
    planId: '',
    role: 'user' as 'admin' | 'user'
  })

  // Buscar dados
  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useApi(() => userService.getUsers())
  const { data: tenants, loading: tenantsLoading } = useApi(() => tenantService.getTenants())
  const { data: plans, loading: plansLoading } = useApi(() => planService.getPlans())

  // Mutations
  const createUserMutation = useApiMutation((data: CreateUserRequest) => userService.createUser(data))
  const updateUserMutation = useApiMutation(({ id, data }: { id: number, data: UpdateUserRequest }) => 
    userService.updateUser(id, data)
  )
  const deleteUserMutation = useApiMutation((id: number) => userService.deleteUser(id))

  const filteredUsuarios = users?.filter(usuario =>
    usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario.tenant?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).filter((usuario, index, array) => 
    array.findIndex(u => u.id === usuario.id) === index
  ) || []

  const handleEdit = (usuario: AppUser) => {
    setEditingUser(usuario)
    setFormData({
      name: usuario.name,
      email: usuario.email,
      phone: usuario.phone || '',
      password: '',
      tenantId: usuario.tenantId ? usuario.tenantId.toString() : 'none',
      planId: usuario.tenant?.plan?.id ? usuario.tenant.plan.id.toString() : 'none',
      role: usuario.role || 'user'
    })
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      tenantId: 'none',
      planId: 'none',
      role: 'user'
    })
    setIsDialogOpen(true)
  }

  // Função para formatar telefone para E164
  const formatPhoneToE164 = (phone: string): string | undefined => {
    if (!phone) return undefined
    
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Se já começa com código do país, adiciona apenas o +
    if (cleanPhone.length >= 10) {
      // Se não tem código do país, assume Brasil (+55)
      if (cleanPhone.length === 10 || cleanPhone.length === 11) {
        return `+55${cleanPhone}`
      }
      // Se já tem código do país
      return `+${cleanPhone}`
    }
    
    return undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        const userData = {
          nome: formData.name,
          email: formData.email,
          telefoneE164: formatPhoneToE164(formData.phone),
          tenantId: formData.tenantId !== 'none' ? formData.tenantId : undefined,
          perfil: formData.role as 'super_admin' | 'cliente_admin' | 'cliente_usuario'
        }
        await updateUserMutation.mutate({ id: editingUser.id, data: userData })
      } else {
        const userData = {
          nome: formData.name,
          email: formData.email,
          telefoneE164: formatPhoneToE164(formData.phone),
          senha: formData.password || generateTempPassword(), // Senha temporária se não informada
          tenantId: formData.tenantId !== 'none' ? formData.tenantId : undefined,
          perfil: formData.role as 'super_admin' | 'cliente_admin' | 'cliente_usuario'
        }
        await createUserMutation.mutate(userData)
      }
      
      setIsDialogOpen(false)
      refetchUsers()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      alert('Erro ao salvar usuário. Verifique os dados e tente novamente.')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUserMutation.mutate(id)
        refetchUsers()
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
      }
    }
  }

  const handleImpersonate = async (usuario: AppUser) => {
    if (!isSuperAdmin) {
      alert('Apenas super administradores podem visualizar como usuário')
      return
    }

    if (window.confirm(`Deseja visualizar o sistema como ${usuario.name}?`)) {
      try {
        await impersonate(usuario.tenantId?.toString() || '0')
        // Redirecionar para o dashboard após impersonação
        window.location.href = '/dashboard'
      } catch (error) {
        console.error('Erro ao impersonar usuário:', error)
        alert('Erro ao visualizar como usuário. Tente novamente.')
      }
    }
  }

  const handleViewProfile = (usuario: AppUser) => {
    // Implementar visualização do perfil do usuário
    alert(`Visualizar perfil de ${usuario.name}\nEmail: ${usuario.email}\nEmpresa: ${usuario.tenant?.name || 'N/A'}\nPlano: ${usuario.tenant?.plan?.name || 'N/A'}`)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">Inativo</Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (usersLoading || tenantsLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  if (usersError) {
    return (
      <div className="text-center text-red-600">
        Erro ao carregar usuários: {usersError}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque e filtre usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {filteredUsuarios.length} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usuario, index) => (
                <TableRow key={`user-${usuario.id}-${index}`}>
                  <TableCell className="font-medium">{usuario.name}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{usuario.tenant?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{usuario.tenant?.plan?.name || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(usuario.isActive || false)}</TableCell>
                  <TableCell>{formatDate(usuario.lastLogin || usuario.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewProfile(usuario)}
                        title="Visualizar perfil do usuário"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      {isSuperAdmin && (usuario.tenantId || 0) > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleImpersonate(usuario)}
                          title="Logar como este usuário"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <LogIn className="h-4 w-4 mr-1" />
                          Logar como
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(usuario)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(usuario.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para criar/editar usuário */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Edite as informações do usuário abaixo.'
                : 'Preencha as informações para criar um novo usuário.'
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Telefone <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="11999999999 ou +5511999999999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Formato aceito: +5511999999999 ou apenas números
                  </p>
                </div>
              </div>
              {!editingUser && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Senha
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Deixe vazio para senha padrão"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Deixe vazio para gerar uma senha temporária automaticamente
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenantId" className="text-right">
                  Empresa <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma empresa (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma empresa</SelectItem>
                    {tenants?.map((tenant, index) => (
                      <SelectItem key={`tenant-${tenant.id}-${index}-${tenant.name}`} value={tenant.id.toString()}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="planId" className="text-right">
                  Plano <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Select
                  value={formData.planId}
                  onValueChange={(value) => setFormData({ ...formData, planId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um plano (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum plano</SelectItem>
                    {plans?.map((plan, index) => (
                      <SelectItem key={`plan-${plan.id}-${index}-${plan.name}`} value={plan.id.toString()}>
                        {plan.name} - R$ {(plan.price || 0).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Função
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={createUserMutation.loading || updateUserMutation.loading}
            >
              {(createUserMutation.loading || updateUserMutation.loading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingUser ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
