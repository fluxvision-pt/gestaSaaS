import { lazy, ComponentType, LazyExoticComponent } from 'react'

interface LazyComponentOptions {
  fallback?: ComponentType
  retryDelay?: number
  maxRetries?: number
}

/**
 * Hook para carregar componentes de forma lazy com retry automático
 */
export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): LazyExoticComponent<T> {
  const { retryDelay = 1000, maxRetries = 3 } = options

  const lazyComponent = lazy(() => {
    let retries = 0

    const loadComponent = async (): Promise<{ default: T }> => {
      try {
        return await importFn()
      } catch (error) {
        if (retries < maxRetries) {
          retries++
          console.warn(`Falha ao carregar componente. Tentativa ${retries}/${maxRetries}`)
          
          // Aguarda antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          return loadComponent()
        }
        
        console.error('Falha ao carregar componente após múltiplas tentativas:', error)
        throw error
      }
    }

    return loadComponent()
  })

  return lazyComponent
}

/**
 * Função utilitária para criar componentes lazy com configurações padrão
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return useLazyComponent(importFn, {
    retryDelay: 1000,
    maxRetries: 3
  })
}

/**
 * Preload de componentes para melhorar a performance
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  // Precarrega o componente em background
  importFn().catch(error => {
    console.warn('Falha ao precarregar componente:', error)
  })
}

/**
 * Hook para preload condicional baseado em interação do usuário
 */
export function usePreloadOnHover(importFn: () => Promise<any>) {
  const handleMouseEnter = () => {
    preloadComponent(importFn)
  }

  return { onMouseEnter: handleMouseEnter }
}

/**
 * Hook para preload baseado em visibilidade (Intersection Observer)
 */
export function usePreloadOnVisible(importFn: () => Promise<any>) {
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        preloadComponent(importFn)
      }
    })
  }

  return { handleIntersection }
}