import { useState, useEffect, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  immediate?: boolean
}

export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await apiFunction()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido'
      setState({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }, [])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, options.immediate])

  const refetch = useCallback(() => {
    return execute()
  }, [execute])

  return {
    ...state,
    execute,
    refetch,
  }
}

export function useApiMutation<T, P = any>(
  apiFunction: (params: P) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await apiFunction(params)
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    mutate,
    reset,
  }
}