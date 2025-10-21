import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  Download, 
  FileText, 
  Package, 
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface BundleInfo {
  name: string
  size: number
  gzipSize: number
  loadTime: number
  isLazy: boolean
  dependencies: string[]
}

interface PerformanceMetrics {
  totalBundleSize: number
  lazyChunks: number
  totalChunks: number
  averageLoadTime: number
  largestChunk: BundleInfo
}

export function BundleAnalyzer() {
  const [bundles, setBundles] = useState<BundleInfo[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Simula análise do bundle (em produção, isso viria de ferramentas como webpack-bundle-analyzer)
  const analyzeBundles = async () => {
    setIsAnalyzing(true)
    
    // Simula dados de análise do bundle
    const mockBundles: BundleInfo[] = [
      {
        name: 'main',
        size: 245000,
        gzipSize: 85000,
        loadTime: 120,
        isLazy: false,
        dependencies: ['react', 'react-dom', 'react-router-dom']
      },
      {
        name: 'dashboard',
        size: 180000,
        gzipSize: 62000,
        loadTime: 95,
        isLazy: true,
        dependencies: ['recharts', 'date-fns']
      },
      {
        name: 'financeiro',
        size: 165000,
        gzipSize: 58000,
        loadTime: 88,
        isLazy: true,
        dependencies: ['react-table', 'react-hook-form']
      },
      {
        name: 'relatorios',
        size: 220000,
        gzipSize: 78000,
        loadTime: 110,
        isLazy: true,
        dependencies: ['jspdf', 'xlsx', 'recharts']
      },
      {
        name: 'admin',
        size: 145000,
        gzipSize: 52000,
        loadTime: 75,
        isLazy: true,
        dependencies: ['react-table', 'react-hook-form']
      }
    ]

    // Simula delay de análise
    await new Promise(resolve => setTimeout(resolve, 2000))

    setBundles(mockBundles)
    
    const totalSize = mockBundles.reduce((sum, bundle) => sum + bundle.size, 0)
    const lazyChunks = mockBundles.filter(bundle => bundle.isLazy).length
    const avgLoadTime = mockBundles.reduce((sum, bundle) => sum + bundle.loadTime, 0) / mockBundles.length
    const largestChunk = mockBundles.reduce((largest, current) => 
      current.size > largest.size ? current : largest
    )

    setMetrics({
      totalBundleSize: totalSize,
      lazyChunks,
      totalChunks: mockBundles.length,
      averageLoadTime: avgLoadTime,
      largestChunk
    })

    setIsAnalyzing(false)
  }

  const formatSize = (bytes: number): string => {
    const kb = bytes / 1024
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`
  }

  const getSizeColor = (size: number): string => {
    if (size > 200000) return 'destructive'
    if (size > 100000) return 'secondary'
    return 'default'
  }

  const getPerformanceScore = (): number => {
    if (!metrics) return 0
    
    let score = 100
    
    // Penaliza bundles grandes
    if (metrics.totalBundleSize > 1000000) score -= 30
    else if (metrics.totalBundleSize > 500000) score -= 15
    
    // Bonifica lazy loading
    const lazyRatio = metrics.lazyChunks / metrics.totalChunks
    score += lazyRatio * 20
    
    // Penaliza tempo de carregamento alto
    if (metrics.averageLoadTime > 150) score -= 20
    else if (metrics.averageLoadTime > 100) score -= 10
    
    return Math.max(0, Math.min(100, score))
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      analyzeBundles()
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Análise de Bundle
          </h2>
          <p className="text-muted-foreground">
            Monitore o tamanho e performance dos chunks da aplicação
          </p>
        </div>
        <Button onClick={analyzeBundles} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analisando...' : 'Analisar Bundle'}
        </Button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamanho Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatSize(metrics.totalBundleSize)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalChunks} chunks no total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lazy Loading</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.lazyChunks}</div>
              <p className="text-xs text-muted-foreground">
                de {metrics.totalChunks} chunks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageLoadTime.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground">
                tempo de carregamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              {getPerformanceScore() > 80 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getPerformanceScore().toFixed(0)}</div>
              <Progress value={getPerformanceScore()} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {bundles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes dos Chunks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bundles.map((bundle, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{bundle.name}</h3>
                      {bundle.isLazy && (
                        <Badge variant="secondary">Lazy</Badge>
                      )}
                      <Badge variant={getSizeColor(bundle.size)}>
                        {formatSize(bundle.size)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Gzip: {formatSize(bundle.gzipSize)} | Tempo: {bundle.loadTime}ms</p>
                      <p>Dependências: {bundle.dependencies.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(bundle.size / (metrics?.largestChunk.size || 1)) * 100} 
                      className="w-20"
                    />
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.totalBundleSize > 1000000 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Bundle muito grande. Considere dividir em mais chunks.</span>
                </div>
              )}
              
              {metrics.lazyChunks / metrics.totalChunks < 0.5 && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Poucos chunks com lazy loading. Implemente mais code splitting.</span>
                </div>
              )}
              
              {metrics.averageLoadTime > 150 && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Tempo de carregamento alto. Otimize as dependências.</span>
                </div>
              )}
              
              {getPerformanceScore() > 80 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Excelente performance! Bundle bem otimizado.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}