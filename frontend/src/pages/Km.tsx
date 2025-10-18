import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Fuel,
  DollarSign,
  BarChart3,
  TrendingUp,
  Navigation,
  Loader2
} from 'lucide-react'
import { subscriptionService, tenantService } from '@/services/api'
import { useApi } from '@/hooks/useApi'

interface RegistroKm {
  id: string
  data: string
  veiculo: string
  placa: string
  kmInicial: number
  kmFinal: number
  kmPercorrida: number
  origem: string
  destino: string
  finalidade: string
  combustivel: number
  valorCombustivel: number
  pedagio: number
  observacoes: string
  usuario: string
  status: 'aprovado' | 'pendente' | 'rejeitado'
}



export default function Km() {
  // Estados para gerenciar os registros e operações
  const [registrosState, setRegistros] = useState<RegistroKm[]>([])
  
  // Buscar dados reais das APIs
  const { data: subscriptions, loading: loadingSubscriptions } = useApi(subscriptionService.getSubscriptions)
  const { data: tenants, loading: loadingTenants } = useApi(tenantService.getTenants)

  // Gerar registros simulados baseados nos dados reais ou usar registros do estado
  const registros = useMemo(() => {
    // Se há registros no estado, usar eles
    if (registrosState.length > 0) return registrosState
    
    // Caso contrário, gerar registros simulados
    if (!subscriptions || !tenants) return []

    const veiculos = [
      { modelo: 'Honda Civic', placa: 'ABC-1234' },
      { modelo: 'Toyota Corolla', placa: 'XYZ-5678' },
      { modelo: 'Volkswagen Jetta', placa: 'DEF-9012' },
      { modelo: 'Ford Focus', placa: 'GHI-3456' },
      { modelo: 'Chevrolet Onix', placa: 'JKL-7890' },
      { modelo: 'Hyundai HB20', placa: 'MNO-2468' },
      { modelo: 'Nissan Versa', placa: 'PQR-1357' }
    ]

    const finalidades = [
      'Reunião com cliente',
      'Visita técnica',
      'Treinamento',
      'Entrega de documentos',
      'Feira de negócios',
      'Manutenção',
      'Suporte técnico',
      'Apresentação comercial'
    ]

    const cidades = [
      { origem: 'São Paulo, SP', destino: 'Campinas, SP' },
      { origem: 'São Paulo, SP', destino: 'Santos, SP' },
      { origem: 'São Paulo, SP', destino: 'Ribeirão Preto, SP' },
      { origem: 'São Paulo, SP', destino: 'Osasco, SP' },
      { origem: 'São Paulo, SP', destino: 'Belo Horizonte, MG' },
      { origem: 'Rio de Janeiro, RJ', destino: 'Niterói, RJ' },
      { origem: 'Brasília, DF', destino: 'Goiânia, GO' }
    ]

    const usuarios = tenants.map(tenant => tenant.name).slice(0, 5)
    const statuses: ('aprovado' | 'pendente' | 'rejeitado')[] = ['aprovado', 'pendente', 'rejeitado']

    return Array.from({ length: Math.min(subscriptions.length * 2, 15) }, (_, index) => {
      const veiculo = veiculos[index % veiculos.length]
      const cidade = cidades[index % cidades.length]
      const kmPercorrida = Math.floor(Math.random() * 300) + 50
      const kmInicial = Math.floor(Math.random() * 50000) + 10000
      const combustivel = (kmPercorrida / 12) + Math.random() * 5
      const valorCombustivel = combustivel * (5.5 + Math.random() * 1.5)
      const pedagio = Math.random() > 0.3 ? Math.random() * 50 : 0

      return {
        id: (index + 1).toString(),
        data: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        veiculo: veiculo.modelo,
        placa: veiculo.placa,
        kmInicial,
        kmFinal: kmInicial + kmPercorrida,
        kmPercorrida,
        origem: cidade.origem,
        destino: cidade.destino,
        finalidade: finalidades[index % finalidades.length],
        combustivel: Math.round(combustivel * 10) / 10,
        valorCombustivel: Math.round(valorCombustivel * 100) / 100,
        pedagio: Math.round(pedagio * 100) / 100,
        observacoes: `Registro de quilometragem para ${finalidades[index % finalidades.length].toLowerCase()}`,
        usuario: usuarios[index % usuarios.length] || 'Usuário Sistema',
        status: statuses[index % statuses.length]
      }
    })
  }, [subscriptions, tenants, registrosState])

  const isLoading = loadingSubscriptions || loadingTenants
  
  // Estados para gerenciar operações
  const [isSubmitLoading, setIsLoading] = useState(false)

  const [filteredRegistros, setFilteredRegistros] = useState<RegistroKm[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [usuarioFilter, setUsuarioFilter] = useState<string>('todos')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRegistro, setEditingRegistro] = useState<RegistroKm | null>(null)

  const [formData, setFormData] = useState<Partial<RegistroKm>>({
    data: '',
    veiculo: '',
    placa: '',
    kmInicial: 0,
    kmFinal: 0,
    origem: '',
    destino: '',
    finalidade: '',
    combustivel: 0,
    valorCombustivel: 0,
    pedagio: 0,
    observacoes: '',
    status: 'pendente'
  })

  useEffect(() => {
    let filtered = registros

    if (searchTerm) {
      filtered = filtered.filter(registro => 
        registro.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.finalidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.usuario.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(registro => registro.status === statusFilter)
    }

    if (usuarioFilter !== 'todos') {
      filtered = filtered.filter(registro => registro.usuario === usuarioFilter)
    }

    setFilteredRegistros(filtered)
  }, [registros, searchTerm, statusFilter, usuarioFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>
      case 'rejeitado':
        return <Badge variant="destructive">Rejeitado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Calcular km percorrida
    const kmPercorrida = (formData.kmFinal || 0) - (formData.kmInicial || 0)

    const novoRegistro: RegistroKm = {
      id: editingRegistro ? editingRegistro.id : Date.now().toString(),
      ...formData as RegistroKm,
      kmPercorrida,
      usuario: 'Usuário Atual' // Em um app real, viria do contexto de autenticação
    }

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingRegistro) {
      setRegistros(registros.map(r => r.id === editingRegistro.id ? novoRegistro : r))
    } else {
      setRegistros([novoRegistro, ...registros])
    }

    setIsDialogOpen(false)
    setEditingRegistro(null)
    setFormData({
      data: '',
      veiculo: '',
      placa: '',
      kmInicial: 0,
      kmFinal: 0,
      origem: '',
      destino: '',
      finalidade: '',
      combustivel: 0,
      valorCombustivel: 0,
      pedagio: 0,
      observacoes: '',
      status: 'pendente'
    })
    setIsLoading(false)
  }

  const handleEdit = (registro: RegistroKm) => {
    setEditingRegistro(registro)
    setFormData(registro)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      setRegistros(registros.filter(r => r.id !== id))
    }
  }

  const getEstatisticas = () => {
    const totalKm = registros.reduce((acc, reg) => acc + reg.kmPercorrida, 0)
    const totalCombustivel = registros.reduce((acc, reg) => acc + reg.valorCombustivel, 0)
    const totalPedagio = registros.reduce((acc, reg) => acc + reg.pedagio, 0)
    const mediaKmPorViagem = registros.length > 0 ? totalKm / registros.length : 0

    return {
      totalKm,
      totalCombustivel,
      totalPedagio,
      mediaKmPorViagem,
      totalViagens: registros.length
    }
  }

  const stats = getEstatisticas()

  const usuarios = Array.from(new Set(registros.map(r => r.usuario)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Quilometragem</h1>
          <p className="text-muted-foreground">
            Gerencie os registros de quilometragem e despesas de viagem
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Registro
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Navigation className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total KM</p>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{stats.totalKm.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Viagens</p>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{stats.totalViagens}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Fuel className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Combustível</p>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">R$ {stats.totalCombustivel.toFixed(2)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pedágio</p>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">R$ {stats.totalPedagio.toFixed(2)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Média KM</p>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{stats.mediaKmPorViagem.toFixed(0)}</p>
                )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar registros..."
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
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Select value={usuarioFilter} onValueChange={setUsuarioFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {usuarios.map(usuario => (
                    <SelectItem key={usuario} value={usuario}>{usuario}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Quilometragem</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Origem → Destino</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Combustível</TableHead>
                <TableHead>Pedágio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Carregando registros de quilometragem...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRegistros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistros.map((registro) => (
                <TableRow key={registro.id}>
                  <TableCell>
                    {new Date(registro.data).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{registro.veiculo}</p>
                      <p className="text-sm text-muted-foreground">{registro.placa}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{registro.origem} → {registro.destino}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{registro.kmPercorrida} km</p>
                      <p className="text-sm text-muted-foreground">
                        {registro.kmInicial} → {registro.kmFinal}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>R$ {registro.valorCombustivel.toFixed(2)}</TableCell>
                  <TableCell>R$ {registro.pedagio.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(registro.status)}</TableCell>
                  <TableCell>{registro.usuario}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(registro)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(registro.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para Novo/Editar Registro */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRegistro ? 'Editar Registro' : 'Novo Registro de Quilometragem'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="veiculo">Veículo</Label>
                <Input
                  id="veiculo"
                  value={formData.veiculo}
                  onChange={(e) => setFormData({...formData, veiculo: e.target.value})}
                  placeholder="Ex: Honda Civic"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  value={formData.placa}
                  onChange={(e) => setFormData({...formData, placa: e.target.value})}
                  placeholder="Ex: ABC-1234"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="finalidade">Finalidade</Label>
                <Input
                  id="finalidade"
                  value={formData.finalidade}
                  onChange={(e) => setFormData({...formData, finalidade: e.target.value})}
                  placeholder="Ex: Reunião com cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Input
                  id="origem"
                  value={formData.origem}
                  onChange={(e) => setFormData({...formData, origem: e.target.value})}
                  placeholder="Ex: São Paulo, SP"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destino">Destino</Label>
                <Input
                  id="destino"
                  value={formData.destino}
                  onChange={(e) => setFormData({...formData, destino: e.target.value})}
                  placeholder="Ex: Campinas, SP"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmInicial">KM Inicial</Label>
                <Input
                  id="kmInicial"
                  type="number"
                  value={formData.kmInicial}
                  onChange={(e) => setFormData({...formData, kmInicial: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmFinal">KM Final</Label>
                <Input
                  id="kmFinal"
                  type="number"
                  value={formData.kmFinal}
                  onChange={(e) => setFormData({...formData, kmFinal: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="combustivel">Litros de Combustível</Label>
                <Input
                  id="combustivel"
                  type="number"
                  step="0.1"
                  value={formData.combustivel}
                  onChange={(e) => setFormData({...formData, combustivel: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorCombustivel">Valor Combustível (R$)</Label>
                <Input
                  id="valorCombustivel"
                  type="number"
                  step="0.01"
                  value={formData.valorCombustivel}
                  onChange={(e) => setFormData({...formData, valorCombustivel: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pedagio">Pedágio (R$)</Label>
                <Input
                  id="pedagio"
                  type="number"
                  step="0.01"
                  value={formData.pedagio}
                  onChange={(e) => setFormData({...formData, pedagio: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Observações adicionais sobre a viagem..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : editingRegistro ? 'Atualizar' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}