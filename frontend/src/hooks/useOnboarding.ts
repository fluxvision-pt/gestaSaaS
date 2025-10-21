import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const ONBOARDING_STORAGE_KEY = 'gestasaas_onboarding_completed'

export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Verificar se o onboarding já foi completado
  useEffect(() => {
    if (isAuthenticated && user) {
      const storageKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`
      const completed = localStorage.getItem(storageKey) === 'true'
      setIsOnboardingCompleted(completed)
      
      // Se não foi completado e é um novo usuário, abrir o onboarding
      if (!completed && shouldShowOnboarding(user)) {
        // Delay para garantir que a página carregou completamente
        setTimeout(() => {
          setIsOnboardingOpen(true)
        }, 1500)
      }
    }
  }, [isAuthenticated, user])

  // Verificar se deve mostrar o onboarding
  const shouldShowOnboarding = (user: any): boolean => {
    if (!user) return false
    
    // Mostrar para usuários criados recentemente (últimos 7 dias)
    const userCreatedAt = new Date(user.criadoEm || user.createdAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    return userCreatedAt > sevenDaysAgo
  }

  const startOnboarding = () => {
    setIsOnboardingOpen(true)
  }

  const closeOnboarding = () => {
    setIsOnboardingOpen(false)
  }

  const completeOnboarding = () => {
    if (user) {
      const storageKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`
      localStorage.setItem(storageKey, 'true')
      setIsOnboardingCompleted(true)
      setIsOnboardingOpen(false)
    }
  }

  const resetOnboarding = () => {
    if (user) {
      const storageKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`
      localStorage.removeItem(storageKey)
      setIsOnboardingCompleted(false)
    }
  }

  return {
    isOnboardingOpen,
    isOnboardingCompleted,
    startOnboarding,
    closeOnboarding,
    completeOnboarding,
    resetOnboarding
  }
}