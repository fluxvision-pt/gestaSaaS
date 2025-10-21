import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { mercadoPagoService, type MercadoPagoStatusResponse } from '../../services/mercado-pago.service'

interface MercadoPagoConfigurationProps {
  gatewayId: string
  credentials: Array<{
    id: string
    chave: string
    valor: string
  }>
  onCredentialsUpdate: () => void
}

export function MercadoPagoConfiguration({ 
  gatewayId, 
  credentials, 
  onCredentialsUpdate 
}: MercadoPagoConfigurationProps) {
  const [accessToken, setAccessToken] = useState('')
  const [testMode, setTestMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [status, setStatus] = useState<MercadoPagoStatusResponse | null>(null)

  useEffect(() => {
    // Carregar credenciais existentes
    const accessTokenCred = credentials.find(c => c.chave === 'access_token')
    const testModeCred = credentials.find(c => c.chave === 'test_mode')

    if (accessTokenCred) {
      setAccessToken(accessTokenCred.valor)
    }
    if (testModeCred) {
      setTestMode(testModeCred.valor === 'true')
    }

    // Verificar status se há credenciais
    if (accessTokenCred) {
      checkMercadoPagoStatus()
    }
  }, [credentials])

  const checkMercadoPagoStatus = async () => {
    try {
      setIsTesting(true)
      const statusResponse = await mercadoPagoService.checkStatus()
      setStatus(statusResponse)
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      setStatus({
        configured: false,
        testMode: false,
        message: 'Erro ao verificar configuração'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    if (!accessToken.trim()) {
      toast.error('Access Token é obrigatório')
      return
    }

    setIsLoading(true)
    try {
      // Salvar access_token
      const accessTokenResponse = await fetch(`/api/gateways/${gatewayId}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          chave: 'access_token',
          valor: accessToken.trim()
        })
      })

      if (!accessTokenResponse.ok) {
        throw new Error('Erro ao salvar Access Token')
      }

      // Salvar test_mode
      const testModeResponse = await fetch(`/api/gateways/${gatewayId}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          chave: 'test_mode',
          valor: testMode.toString()
        })
      })

      if (!testModeResponse.ok) {
        throw new Error('Erro ao salvar modo de teste')
      }

      toast.success('Configurações do Mercado Pago salvas com sucesso!')
      onCredentialsUpdate()
      
      // Verificar status após salvar
      await checkMercadoPagoStatus()
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações do Mercado Pago')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTest = async () => {
    if (!accessToken.trim()) {
      toast.error('Configure o Access Token primeiro')
      return
    }

    await checkMercadoPagoStatus()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img 
              src="https://logoeps.com/wp-content/uploads/2013/03/mercado-pago-vector-logo.png" 
              alt="Mercado Pago" 
              className="w-6 h-6"
            />
            Configuração do Mercado Pago
          </CardTitle>
          <CardDescription>
            Configure suas credenciais do Mercado Pago para processar pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token *</Label>
            <Input
              id="access_token"
              type="password"
              placeholder="APP_USR-..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Encontre seu Access Token no{' '}
              <a 
                href="https://www.mercadopago.com.br/developers/panel/app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                painel do desenvolvedor
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="test_mode"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
            <Label htmlFor="test_mode">Modo de Teste (Sandbox)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            No modo de teste, use credenciais de teste para simular transações
          </p>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Configurações
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTest}
              disabled={isTesting || !accessToken.trim()}
            >
              {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Testar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status da Configuração */}
      {status && (
        <Alert className={status.configured ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <div className="flex items-center gap-2">
            {status.configured ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={status.configured ? 'text-green-800' : 'text-red-800'}>
              <strong>Status:</strong> {status.message}
              {status.configured && (
                <span className="block mt-1">
                  Modo: {status.testMode ? 'Teste (Sandbox)' : 'Produção'}
                </span>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Documentação */}
      <Card>
        <CardHeader>
          <CardTitle>Documentação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium">Como obter suas credenciais:</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mt-2">
              <li>Acesse o <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">painel do desenvolvedor</a></li>
              <li>Crie uma aplicação ou selecione uma existente</li>
              <li>Copie o Access Token (produção ou teste)</li>
              <li>Cole aqui e salve as configurações</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium">Recursos suportados:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
              <li>Pagamentos com cartão de crédito</li>
              <li>PIX instantâneo</li>
              <li>Boleto bancário</li>
              <li>Checkout transparente</li>
              <li>Webhooks para confirmação automática</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">Modo de Teste:</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Use o modo de teste para simular transações sem cobranças reais. 
              Certifique-se de usar credenciais de teste quando esta opção estiver ativada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}