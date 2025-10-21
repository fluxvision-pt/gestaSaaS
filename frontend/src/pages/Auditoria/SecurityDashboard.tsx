import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
// Alert component não disponível - usando implementação simples
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Lock, 
  Unlock,
  RefreshCw,
  Download
} from 'lucide-react'
import { auditoriaService } from '@/services/api'

interface SecurityMetrics {
  totalLogins: number
  loginsFalhos: number
  tentativasInvasao: number
  usuariosAtivos: number
  sessoesSuspeitas: number
  alertasSeguranca: number
  scoreSeguranca: number
  tendenciaSeguranca: 'up' | 'down' | 'stable'
}

interface SecurityAlert {
  id: string
  tipo: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  descricao: string
  timestamp: string
  status: 'ativo' | 'resolvido' | 'investigando'
  usuario?: string
  ip?: string
}

interface LoginAttempt {
  id: string
  usuario: string
  ip: string
  timestamp: string
  sucesso: boolean
  localizacao?: string
  userAgent?: string
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')

  useEffect(() => {
    loadSecurityData()
  }, [timeRange])

  const loadSecurityData = async () => {
    try {
      setLoading(true)
      
      // Simular dados de segurança
      const mockMetrics: SecurityMetrics = {
        totalLogins: 1247,
        loginsFalhos: 23,
        tentativasInvasao: 5,
        usuariosAtivos: 156,
        sessoesSuspeitas: 3,
        alertasSeguranca: 8,
        scoreSeguranca: 87,
        tendenciaSeguranca: 'up'
      }

      const mockAlerts: SecurityAlert[] = [
        {
          id: '1',
          tipo: 'Tentativa de invasão',
          severidade: 'alta',
          descricao: 'Múltiplas tentativas de login falharam para o usuário admin',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'ativo',
          usuario: 'admin',
          ip: '192.168.1.100'
        },
        {
          id: '2',
          tipo: 'Login suspeito',
          severidade: 'media',
          descricao: 'Login de localização incomum detectado',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'investigando',
          usuario: 'joao.silva',
          ip: '203.45.67.89'
        },
        {
          id: '3',
          tipo: 'Sessão expirada',
          severidade: 'baixa',
          descricao: 'Sessão de usuário expirou por inatividade',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'resolvido',
          usuario: 'maria.santos'
        }
      ]

      const mockLoginAttempts: LoginAttempt[] = [
        {
          id: '1',
          usuario: 'admin',
          ip: '192.168.1.100',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          sucesso: false,
          localizacao: 'São Paulo, BR',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        {
          id: '2',
          usuario: 'joao.silva',
          ip: '203.45.67.89',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          sucesso: true,
          localizacao: 'Rio de Janeiro, BR',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        },
        {
          id: '3',
          usuario: 'maria.santos',
          ip: '10.0.0.50',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          sucesso: true,
          localizacao: 'Belo Horizonte, BR',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64)'
        }
      ]

      setMetrics(mockMetrics)
      setAlerts(mockAlerts)
      setLoginAttempts(mockLoginAttempts)
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityBadge = (severidade: string) => {
    const variants = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      critica: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={variants[severidade as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {severidade}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: { variant: 'destructive' as const, icon: AlertTriangle },
      resolvido: { variant: 'default' as const, icon: CheckCircle },
      investigando: { variant: 'secondary' as const, icon: Activity }
    }
    
    const config = variants[status as keyof typeof variants] || variants.ativo
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Segurança</h1>
          <p className="text-muted-foreground">
            Monitore a segurança do sistema em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hora</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadSecurityData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Score de Segurança */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Score de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getScoreColor(metrics.scoreSeguranca)}`}>
                  {metrics.scoreSeguranca}%
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metrics.tendenciaSeguranca)}
                  <span className="text-sm text-muted-foreground">
                    {metrics.tendenciaSeguranca === 'up' ? 'Melhorando' : 
                     metrics.tendenciaSeguranca === 'down' ? 'Piorando' : 'Estável'}
                  </span>
                </div>
              </div>
              <div className="w-64">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full" 
                    style={{ width: `${metrics.scoreSeguranca}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas Principais */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Logins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalLogins}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Logins Falhados</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.loginsFalhos}</div>
              <p className="text-xs text-muted-foreground">
                -5% em relação ao período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tentativas de Invasão</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.tentativasInvasao}</div>
              <p className="text-xs text-muted-foreground">
                +2 desde ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.usuariosAtivos}</div>
              <p className="text-xs text-muted-foreground">
                +8% em relação ao período anterior
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Segurança Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.severidade === 'critica' ? 'border-l-red-500' :
                alert.severidade === 'alta' ? 'border-l-orange-500' :
                alert.severidade === 'media' ? 'border-l-yellow-500' :
                'border-l-green-500'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{alert.tipo}</h4>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(alert.severidade)}
                          {getStatusBadge(alert.status)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.descricao}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(alert.timestamp).toLocaleString('pt-BR')}</span>
                        {alert.usuario && <span>Usuário: {alert.usuario}</span>}
                        {alert.ip && <span>IP: {alert.ip}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tentativas de Login Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Tentativas de Login Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loginAttempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">{attempt.usuario}</TableCell>
                  <TableCell className="font-mono text-sm">{attempt.ip}</TableCell>
                  <TableCell>{attempt.localizacao || 'Desconhecida'}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.sucesso ? 'default' : 'destructive'} className="flex items-center gap-1 w-fit">
                      {attempt.sucesso ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Sucesso
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Falhou
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(attempt.timestamp).toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}