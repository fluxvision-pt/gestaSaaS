import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe,
  Mail,
  Smartphone,
  Key,
  Database,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { configuracaoService, type ConfiguracaoGeral, type ConfiguracaoNotificacao, type ConfiguracaoSeguranca, type ConfiguracaoIntegracao } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { toast } from 'sonner'

export default function Configuracoes() {
  // Carregar configurações da API
  const { data: configuracoes, loading: configLoading, refetch } = useApi(() => configuracaoService.getConfiguracoes())

  // Estados locais para as configurações
  const [configGeral, setConfigGeral] = useState<ConfiguracaoGeral>({
    nomeEmpresa: '',
    email: '',
    telefone: '',
    endereco: '',
    timezone: 'America/Sao_Paulo',
    idioma: 'pt-BR',
    moeda: 'BRL'
  })

  const [configNotificacao, setConfigNotificacao] = useState<ConfiguracaoNotificacao>({
    emailMarketing: false,
    emailTransacional: false,
    smsNotificacoes: false,
    pushNotificacoes: false,
    frequenciaRelatorios: 'semanal',
    notificarVencimentos: false,
    relatoriosSemanais: false,
    alertasSeguranca: false
  })

  const [configSeguranca, setConfigSeguranca] = useState<ConfiguracaoSeguranca>({
    autenticacaoDoisFatores: false,
    sessaoMaxima: 8,
    logAuditoria: false,
    backupAutomatico: false,
    loginSocial: false,
    sessaoTimeout: 30,
    tentativasLogin: 5
  })

  const [configIntegracao, setConfigIntegracao] = useState<ConfiguracaoIntegracao>({
    apiKey: '',
    webhookUrl: '',
    gatewayPagamento: 'stripe',
    emailProvider: 'sendgrid',
    backupAutomatico: false,
    retencaoDados: 365,
    rateLimitRequests: 1000
  })

  const [isLoading, setIsLoading] = useState(false)
  const [savedStates, setSavedStates] = useState({
    geral: false,
    notificacao: false,
    seguranca: false,
    integracao: false
  })

  // Atualizar estados quando as configurações são carregadas
  useEffect(() => {
    if (configuracoes) {
      setConfigGeral(configuracoes.geral)
      setConfigNotificacao(configuracoes.notificacao)
      setConfigSeguranca(configuracoes.seguranca)
      setConfigIntegracao(configuracoes.integracao)
    }
  }, [configuracoes])

  const handleSaveGeral = async () => {
    setIsLoading(true)
    try {
      await configuracaoService.saveConfiguracao('geral', configGeral)
      setSavedStates(prev => ({ ...prev, geral: true }))
      toast.success('Configurações gerais salvas com sucesso!')
      
      // Remover indicador de sucesso após 3 segundos
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, geral: false }))
      }, 3000)
    } catch (error) {
      toast.error('Erro ao salvar configurações gerais')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotificacao = async () => {
    setIsLoading(true)
    try {
      await configuracaoService.saveConfiguracao('notificacao', configNotificacao)
      setSavedStates(prev => ({ ...prev, notificacao: true }))
      toast.success('Configurações de notificação salvas com sucesso!')
      
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, notificacao: false }))
      }, 3000)
    } catch (error) {
      toast.error('Erro ao salvar configurações de notificação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSeguranca = async () => {
    setIsLoading(true)
    try {
      await configuracaoService.saveConfiguracao('seguranca', configSeguranca)
      setSavedStates(prev => ({ ...prev, seguranca: true }))
      toast.success('Configurações de segurança salvas com sucesso!')
      
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, seguranca: false }))
      }, 3000)
    } catch (error) {
      toast.error('Erro ao salvar configurações de segurança')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveIntegracao = async () => {
    setIsLoading(true)
    try {
      await configuracaoService.saveConfiguracao('integracao', configIntegracao)
      setSavedStates(prev => ({ ...prev, integracao: true }))
      toast.success('Configurações de integração salvas com sucesso!')
      
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, integracao: false }))
      }, 3000)
    } catch (error) {
      toast.error('Erro ao salvar configurações de integração')
    } finally {
      setIsLoading(false)
    }
  }



  const handleRestaurarPadroes = async () => {
    setIsLoading(true)
    try {
      await configuracaoService.restaurarPadroes()
      await refetch() // Recarregar configurações
      toast.success('Configurações restauradas para os padrões!')
    } catch (error) {
      toast.error('Erro ao restaurar configurações padrão')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema e preferências
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRestaurarPadroes}
          disabled={isLoading || configLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Restaurando...' : 'Restaurar Padrões'}
        </Button>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <Input
                    id="nomeEmpresa"
                    value={configGeral.nomeEmpresa}
                    onChange={(e) => setConfigGeral({...configGeral, nomeEmpresa: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Principal</Label>
                  <Input
                    id="email"
                    type="email"
                    value={configGeral.email}
                    onChange={(e) => setConfigGeral({...configGeral, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={configGeral.telefone}
                    onChange={(e) => setConfigGeral({...configGeral, telefone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select value={configGeral.timezone} onValueChange={(value) => setConfigGeral({...configGeral, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tóquio (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={configGeral.endereco}
                  onChange={(e) => setConfigGeral({...configGeral, endereco: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select value={configGeral.idioma} onValueChange={(value) => setConfigGeral({...configGeral, idioma: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moeda">Moeda</Label>
                  <Select value={configGeral.moeda} onValueChange={(value) => setConfigGeral({...configGeral, moeda: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveGeral} disabled={isLoading || configLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : savedStates.geral ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Salvando...' : savedStates.geral ? 'Salvo!' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Notificações */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notificações por Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emails de Marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber newsletters e promoções
                  </p>
                </div>
                <Switch
                  checked={configNotificacao.emailMarketing}
                  onCheckedChange={(checked) => setConfigNotificacao({...configNotificacao, emailMarketing: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emails Transacionais</Label>
                  <p className="text-sm text-muted-foreground">
                    Confirmações, faturas e atualizações importantes
                  </p>
                </div>
                <Switch
                  checked={configNotificacao.emailTransacional}
                  onCheckedChange={(checked) => setConfigNotificacao({...configNotificacao, emailTransacional: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Resumo semanal de atividades e métricas
                  </p>
                </div>
                <Switch
                  checked={configNotificacao.relatoriosSemanais}
                  onCheckedChange={(checked) => setConfigNotificacao({...configNotificacao, relatoriosSemanais: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Outras Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas importantes via SMS
                  </p>
                </div>
                <Switch
                  checked={configNotificacao.smsNotificacoes}
                  onCheckedChange={(checked) => setConfigNotificacao({...configNotificacao, smsNotificacoes: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações no navegador
                  </p>
                </div>
                <Switch
                  checked={configNotificacao.pushNotificacoes}
                  onCheckedChange={(checked) => setConfigNotificacao({...configNotificacao, pushNotificacoes: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Segurança</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre atividades suspeitas
                  </p>
                </div>
                <Switch
                  checked={configNotificacao.alertasSeguranca}
                  onCheckedChange={(checked) => setConfigNotificacao({...configNotificacao, alertasSeguranca: checked})}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveNotificacao} disabled={isLoading || configLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : savedStates.notificacao ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Salvando...' : savedStates.notificacao ? 'Salvo!' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Segurança */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Autenticação e Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores (2FA)</Label>
                  <p className="text-sm text-muted-foreground">
                    Adiciona uma camada extra de segurança
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={configSeguranca.autenticacaoDoisFatores ? "default" : "secondary"}>
                    {configSeguranca.autenticacaoDoisFatores ? "Ativo" : "Inativo"}
                  </Badge>
                  <Switch
                    checked={configSeguranca.autenticacaoDoisFatores}
                    onCheckedChange={(checked) => setConfigSeguranca({...configSeguranca, autenticacaoDoisFatores: checked})}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Social</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir login com Google, Facebook, etc.
                  </p>
                </div>
                <Switch
                  checked={configSeguranca.loginSocial}
                  onCheckedChange={(checked) => setConfigSeguranca({...configSeguranca, loginSocial: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Log de Auditoria</Label>
                  <p className="text-sm text-muted-foreground">
                    Registrar todas as ações dos usuários
                  </p>
                </div>
                <Switch
                  checked={configSeguranca.logAuditoria}
                  onCheckedChange={(checked) => setConfigSeguranca({...configSeguranca, logAuditoria: checked})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessaoTimeout">Timeout de Sessão (minutos)</Label>
                  <Input
                    id="sessaoTimeout"
                    type="number"
                    value={configSeguranca.sessaoTimeout}
                    onChange={(e) => setConfigSeguranca({...configSeguranca, sessaoTimeout: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tentativasLogin">Máximo de Tentativas de Login</Label>
                  <Input
                    id="tentativasLogin"
                    type="number"
                    value={configSeguranca.tentativasLogin}
                    onChange={(e) => setConfigSeguranca({...configSeguranca, tentativasLogin: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSeguranca} disabled={isLoading || configLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : savedStates.seguranca ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Salvando...' : savedStates.seguranca ? 'Salvo!' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Integrações */}
        <TabsContent value="integracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API e Webhooks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">URL do Webhook</Label>
                <Input
                  id="webhookUrl"
                  value={configIntegracao.webhookUrl}
                  onChange={(e) => setConfigIntegracao({...configIntegracao, webhookUrl: e.target.value})}
                  placeholder="https://api.exemplo.com/webhook"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Chave da API</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    value={configIntegracao.apiKey}
                    onChange={(e) => setConfigIntegracao({...configIntegracao, apiKey: e.target.value})}
                    type="password"
                  />
                  <Button variant="outline">
                    Gerar Nova
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rateLimitRequests">Limite de Requisições por Hora</Label>
                <Input
                  id="rateLimitRequests"
                  type="number"
                  value={configIntegracao.rateLimitRequests}
                  onChange={(e) => setConfigIntegracao({...configIntegracao, rateLimitRequests: parseInt(e.target.value)})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup e Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Realizar backup diário dos dados
                  </p>
                </div>
                <Switch
                  checked={configIntegracao.backupAutomatico}
                  onCheckedChange={(checked) => setConfigIntegracao({...configIntegracao, backupAutomatico: checked})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retencaoDados">Retenção de Dados (dias)</Label>
                <Input
                  id="retencaoDados"
                  type="number"
                  value={configIntegracao.retencaoDados}
                  onChange={(e) => setConfigIntegracao({...configIntegracao, retencaoDados: parseInt(e.target.value)})}
                />
                <p className="text-sm text-muted-foreground">
                  Dados serão mantidos por este período antes da exclusão automática
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveIntegracao} disabled={isLoading || configLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : savedStates.integracao ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Salvando...' : savedStates.integracao ? 'Salvo!' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}