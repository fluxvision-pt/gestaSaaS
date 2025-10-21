import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/services/adminApi';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: {
    name: string;
    color: string;
  };
  status: 'active' | 'suspended' | 'trial';
  lastActivity: string;
  createdAt: string;
  tenant?: {
    name: string;
  };
}

export default function UserManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [impersonateUserId, setImpersonateUserId] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const itemsPerPage = 10;

  // Dados mockados para demonstração (serão substituídos pela API real)
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      plan: { name: 'Pro', color: 'blue' },
      status: 'active',
      lastActivity: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      tenant: { name: 'Empresa ABC' }
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@startup.com',
      plan: { name: 'Business', color: 'purple' },
      status: 'trial',
      lastActivity: '2024-01-15T09:15:00Z',
      createdAt: '2024-01-10T00:00:00Z',
      tenant: { name: 'Startup XYZ' }
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@tech.com',
      plan: { name: 'Pro', color: 'blue' },
      status: 'active',
      lastActivity: '2024-01-14T16:45:00Z',
      createdAt: '2024-01-05T00:00:00Z',
      tenant: { name: 'Tech Solutions' }
    },
    {
      id: '4',
      name: 'Ana Oliveira',
      email: 'ana@digital.com',
      plan: { name: 'Starter', color: 'gray' },
      status: 'active',
      lastActivity: '2024-01-14T14:20:00Z',
      createdAt: '2024-01-08T00:00:00Z',
      tenant: { name: 'Digital Agency' }
    },
    {
      id: '5',
      name: 'Carlos Lima',
      email: 'carlos@inovacao.com',
      plan: { name: 'Business', color: 'purple' },
      status: 'suspended',
      lastActivity: '2024-01-12T11:30:00Z',
      createdAt: '2024-01-03T00:00:00Z',
      tenant: { name: 'Inovação Corp' }
    },
    {
      id: '6',
      name: 'Lucia Ferreira',
      email: 'lucia@consultoria.com',
      plan: { name: 'Pro', color: 'blue' },
      status: 'active',
      lastActivity: '2024-01-15T08:00:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      tenant: { name: 'Consultoria Plus' }
    },
    {
      id: '7',
      name: 'Roberto Alves',
      email: 'roberto@logistica.com',
      plan: { name: 'Business', color: 'purple' },
      status: 'trial',
      lastActivity: '2024-01-13T17:30:00Z',
      createdAt: '2024-01-12T00:00:00Z',
      tenant: { name: 'Logística Express' }
    },
    {
      id: '8',
      name: 'Fernanda Rocha',
      email: 'fernanda@marketing.com',
      plan: { name: 'Starter', color: 'gray' },
      status: 'active',
      lastActivity: '2024-01-15T12:15:00Z',
      createdAt: '2024-01-07T00:00:00Z',
      tenant: { name: 'Marketing Pro' }
    }
  ];

  const [users] = useState<User[]>(mockUsers);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      trial: { label: 'Trial', className: 'bg-blue-100 text-blue-800' },
      suspended: { label: 'Suspenso', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPlanBadge = (plan: { name: string; color: string }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      gray: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colorClasses[plan.color as keyof typeof colorClasses] || colorClasses.gray}>
        {plan.name}
      </Badge>
    );
  };

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesPlan = planFilter === 'all' || user.plan.name === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const handleImpersonate = (userId: string) => {
    setImpersonateUserId(userId);
    setShowImpersonateModal(true);
  };

  const confirmImpersonate = () => {
    if (impersonateUserId) {
      // Implementar lógica de impersonação
      console.log('Impersonating user:', impersonateUserId);
      setShowImpersonateModal(false);
      setImpersonateUserId(null);
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} for users:`, selectedUsers);
    setSelectedUsers([]);
    setShowBulkActions(false);
  };

  return (
    <div className="space-y-6">
      {/* Header com breadcrumb + botão "Novo Usuário" */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span>Gestão de Usuários</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Barra de filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros e Busca</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Campo de busca com autocomplete */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por plano */}
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Planos</SelectItem>
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por país */}
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Países</SelectItem>
                <SelectItem value="BR">Brasil</SelectItem>
                <SelectItem value="US">Estados Unidos</SelectItem>
                <SelectItem value="PT">Portugal</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por data de cadastro */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Data Cadastro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Datas</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedUsers.length} usuário(s) selecionado(s)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('suspend')}>
                  <UserX className="h-4 w-4 mr-1" />
                  Suspender
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('email')}>
                  <Mail className="h-4 w-4 mr-1" />
                  Enviar Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela responsiva */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Usuários ({filteredUsers.length})</span>
            </CardTitle>
            <Badge variant="secondary">{filteredUsers.length} total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">
                    <Checkbox
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Avatar + Nome + Email</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Plano atual (badge colorido)</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status (ativo/suspenso/trial)</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Última atividade</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500">Ações: Ver, Editar, Impersonar, Suspender</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.tenant && (
                            <div className="text-xs text-gray-400">{user.tenant.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      {getPlanBadge(user.plan)}
                    </td>
                    <td className="py-3">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {formatDateTime(user.lastActivity)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button variant="ghost" size="sm" title="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Impersonar"
                          onClick={() => handleImpersonate(user.id)}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Suspender"
                          className={user.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação com info de total */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuários
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de impersonação com confirmação */}
      <Dialog open={showImpersonateModal} onOpenChange={setShowImpersonateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span>Confirmar Impersonação</span>
            </DialogTitle>
            <DialogDescription>
              Você está prestes a impersonar este usuário. Esta ação será registrada nos logs de auditoria.
              Tem certeza que deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {impersonateUserId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Usuário:</strong> {users.find(u => u.id === impersonateUserId)?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {users.find(u => u.id === impersonateUserId)?.email}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImpersonateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmImpersonate} className="bg-amber-600 hover:bg-amber-700">
              <UserCheck className="h-4 w-4 mr-2" />
              Confirmar Impersonação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}