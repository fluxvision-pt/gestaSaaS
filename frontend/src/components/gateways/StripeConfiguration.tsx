import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { gatewayService } from '@/services/api'
import { stripeService } from '@/services/stripe.service'
import type { AppGateway } from '@/types'
import { 
  CreditCard, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface StripeConfigurationProps {
  gateway: AppGateway
}

interface StripeCredentials {
  publishable_key: string
  secret_key: string
  webhook_secret: string
}

const StripeConfiguration: React.FC<StripeConfigurationProps> = ({ gateway }) => {
  const [credentials, setCredentials] = useState<StripeCredentials>({
    publishable_key: '',
    secret_key: '',
    webhook_secret: ''
  })
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isTestMode, setIsTestMode] = useState(true)
  const [stripeStatus, setStripeStatus] = useState<{
    configured: boolean
    message: string
  } | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  // Buscar credenciais existentes
  const { data: existingCredentials, refetch: refetchCredentials } = useApi(
    () => gatewayService.getCredenciais(gateway.id)
  )

  // Refazer busca quando gateway.id mudar
  useEffect(() => {
    refetchCredentials()
  }, [gateway.id, refetchCredentials])

  // Mutation para salvar credenciais
  const saveCredentialMutation = useApiMutation(
    ({ chave, valor }: { chave: string; valor: string }) => {
      const existingCred = existingCredentials?.find(c => c.chave === chave)
      if (existingCred) {
        return gatewayService.updateCredencial(existingCred.id, { chave, valor })
      } else {
        return gatewayService.createCredencial({ gatewayId: gateway.id, chave, valor })
      }
    }
  )

  // Carregar credenciais existentes
  useEffect(() => {
    if (existingCredentials) {
      const newCredentials = { ...credentials }
      existingCredentials.forEach(cred => {
        if (cred.chave in newCredentials) {
          newCredentials[cred.chave as keyof StripeCredentials] = cred.valor
        }
      })
      setCredentials(newCredentials)
    }
  }, [existingCredentials])

  // Verificar status do Stripe
  const checkStripeStatus = async () => {
    setIsCheckingStatus(true)
    try {
      const status = await stripeService.getStatus()
      setStripeStatus(status)
    } catch (error) {
      console.error('Erro ao verificar status do Stripe:', error)
      setStripeStatus({
        configured: false,
        message: 'Erro ao verificar configuração'
      })
    } finally {
      setIsCheckingStatus(false)
    }
  }

  useEffect(() => {
    checkStripeStatus()
  }, [])

  const handleCredentialChange = (key: keyof StripeCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveCredential = async (key: keyof StripeCredentials) => {
    const value = credentials[key]
    if (!value.trim()) {
      toast.error('O valor da credencial não pode estar vazio')
      return
    }

    try {
      await saveCredentialMutation.mutate({ chave: key, valor: value })
      refetchCredentials()
      checkStripeStatus()
      toast.success('Credencial salva com sucesso')
    } catch (error: any) {
      toast.error(`Erro ao salvar credencial: ${error.message || 'Erro desconhecido'}`)
    }
  }

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const getStatusIcon = () => {
    if (isCheckingStatus) {
      return <Loader2 className="w-4 h-4 animate-spin" />
    }
    if (stripeStatus?.configured) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <XCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusBadge = () => {
    if (isCheckingStatus) {
      return <Badge variant="secondary">Verificando...</Badge>
    }
    if (stripeStatus?.configured) {
      return <Badge variant="default" className="bg-green-500">Configurado</Badge>
    }
    return <Badge variant="destructive">Não Configurado</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <CardTitle>Configuração do Stripe</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Configure suas credenciais do Stripe para processar pagamentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status do Stripe */}
        <Alert>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <AlertDescription>
              {stripeStatus?.message || 'Verificando configuração...'}
            </AlertDescription>
          </div>
        </Alert>

        {/* Modo de Teste */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Modo de Teste</Label>
            <p className="text-sm text-gray-500">
              Use credenciais de teste para desenvolvimento
            </p>
          </div>
          <Switch
            checked={isTestMode}
            onCheckedChange={setIsTestMode}
          />
        </div>

        <Separator />

        {/* Credenciais */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Key className="w-4 h-4" />
            Credenciais do Stripe
          </h4>

          {/* Chave Pública */}
          <div className="space-y-2">
            <Label htmlFor="publishable_key">
              Chave Pública {isTestMode ? '(Teste)' : '(Produção)'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="publishable_key"
                type={showSecrets.publishable_key ? 'text' : 'password'}
                value={credentials.publishable_key}
                onChange={(e) => handleCredentialChange('publishable_key', e.target.value)}
                placeholder={isTestMode ? 'pk_test_...' : 'pk_live_...'}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowSecret('publishable_key')}
              >
                {showSecrets.publishable_key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                type="button"
                size="icon"
                onClick={() => handleSaveCredential('publishable_key')}
                disabled={saveCredentialMutation.loading}
              >
                {saveCredentialMutation.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Chave Secreta */}
          <div className="space-y-2">
            <Label htmlFor="secret_key">
              Chave Secreta {isTestMode ? '(Teste)' : '(Produção)'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="secret_key"
                type={showSecrets.secret_key ? 'text' : 'password'}
                value={credentials.secret_key}
                onChange={(e) => handleCredentialChange('secret_key', e.target.value)}
                placeholder={isTestMode ? 'sk_test_...' : 'sk_live_...'}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowSecret('secret_key')}
              >
                {showSecrets.secret_key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                type="button"
                size="icon"
                onClick={() => handleSaveCredential('secret_key')}
                disabled={saveCredentialMutation.loading}
              >
                {saveCredentialMutation.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label htmlFor="webhook_secret">Webhook Secret</Label>
            <div className="flex gap-2">
              <Input
                id="webhook_secret"
                type={showSecrets.webhook_secret ? 'text' : 'password'}
                value={credentials.webhook_secret}
                onChange={(e) => handleCredentialChange('webhook_secret', e.target.value)}
                placeholder="whsec_..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowSecret('webhook_secret')}
              >
                {showSecrets.webhook_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                type="button"
                size="icon"
                onClick={() => handleSaveCredential('webhook_secret')}
                disabled={saveCredentialMutation.loading}
              >
                {saveCredentialMutation.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Informações de Webhook */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Configuração de Webhook
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Configure o webhook no Stripe Dashboard com a URL:</p>
            <code className="block bg-gray-100 p-2 rounded text-xs">
              {window.location.origin.replace('5173', '3001')}/api/webhooks/stripe
            </code>
            <p>Eventos necessários: payment_intent.succeeded, payment_intent.payment_failed</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            onClick={checkStripeStatus}
            variant="outline"
            disabled={isCheckingStatus}
          >
            {isCheckingStatus ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar Configuração'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default StripeConfiguration