import React, { useState } from 'react'
import { Download, RefreshCw, Share, X, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePWA } from '@/hooks/usePWA'
import { toast } from 'sonner'

export function PWAPrompt() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    updateAvailable, 
    canInstall,
    installApp, 
    updateApp, 
    shareApp 
  } = usePWA()
  
  const [showInstallPrompt, setShowInstallPrompt] = useState(true)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(true)
  const [installing, setInstalling] = useState(false)

  const handleInstall = async () => {
    setInstalling(true)
    try {
      const success = await installApp()
      if (success) {
        toast.success('App instalado com sucesso!')
        setShowInstallPrompt(false)
      } else {
        toast.error('Falha ao instalar o app')
      }
    } catch (error) {
      toast.error('Erro ao instalar o app')
    } finally {
      setInstalling(false)
    }
  }

  const handleUpdate = () => {
    updateApp()
    setShowUpdatePrompt(false)
  }

  const handleShare = async () => {
    const success = await shareApp()
    if (success) {
      toast.success('Link copiado para a área de transferência!')
    } else {
      toast.error('Erro ao compartilhar')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Status de conectividade */}
      {!isOnline && (
        <Card className="w-80 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="flex items-center gap-3 p-4">
            <WifiOff className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Modo Offline
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Algumas funcionalidades podem estar limitadas
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt de instalação */}
      {canInstall && showInstallPrompt && (
        <Card className="w-80 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-sm text-blue-800 dark:text-blue-200">
                  Instalar App
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstallPrompt(false)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Instale o GestaSaaS para acesso rápido e funcionalidades offline
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                disabled={installing}
                size="sm"
                className="flex-1"
              >
                {installing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Instalando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Instalar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt de atualização */}
      {updateAvailable && showUpdatePrompt && (
        <Card className="w-80 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                <CardTitle className="text-sm text-green-800 dark:text-green-200">
                  Atualização Disponível
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpdatePrompt(false)}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-green-600 dark:text-green-400">
              Uma nova versão do app está disponível
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={handleUpdate}
              size="sm"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Agora
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Indicador de status PWA */}
      {isInstalled && (
        <div className="flex justify-end">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Wifi className="mr-1 h-3 w-3" />
            PWA Ativo
          </Badge>
        </div>
      )}
    </div>
  )
}