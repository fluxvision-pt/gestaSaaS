import { useState } from 'react'

interface UseApiMutationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseApiMutationResult<T, P> {
  mutate: (params: P) => Promise<void>
  loading: boolean
  error: Error | null
  data: T | null
}

export function useApiMutation<T, P = void>(
  mutationFn: (params: P) => Promise<T>,
  options?: UseApiMutationOptions<T>
): UseApiMutationResult<T, P> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const mutate = async (params: P) => {
    try {
      setLoading(true)
      setError(null)
      const result = await mutationFn(params)
      setData(result)
      options?.onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      setError(error)
      options?.onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  return {
    mutate,
    loading,
    error,
    data
  }
}