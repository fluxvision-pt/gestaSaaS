import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../services/api'

interface VerificationState {
  status: 'loading' | 'success' | 'error' | 'expired'
  message: string
}

const VerifyAccount: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [verification, setVerification] = useState<VerificationState>({
    status: 'loading',
    message: ''
  })

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerification({
          status: 'error',
          message: 'Token de verificação não encontrado.'
        })
        return
      }

      try {
        const response = await authService.verifyEmail(token)
        setVerification({
          status: 'success',
          message: response.message || 'Email verificado com sucesso!'
        })
        
        // Mostrar toast de sucesso
        toast.success('Email verificado com sucesso! Você pode fazer login agora.')
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate('/login')
        }, 3000)
        
      } catch (error: any) {
        console.error('Erro na verificação:', error)
        
        // Determinar o tipo de erro
        let status: 'error' | 'expired' = 'error'
        let message = 'Erro ao verificar email. Tente novamente.'
        
        if (error.response?.status === 400) {
          status = 'expired'
          message = 'Token de verificação expirado ou inválido.'
        } else if (error.response?.data?.message) {
          message = error.response.data.message
        }
        
        setVerification({ status, message })
        toast.error(message)
      }
    }

    verifyEmail()
  }, [token, navigate])

  const handleResendVerification = async () => {
    try {
      // Aqui você pode implementar a lógica para reenviar o email de verificação
      // Por enquanto, apenas mostrar uma mensagem
      toast.info('Para reenviar o email de verificação, faça login e acesse as configurações da conta.')
      navigate('/login')
    } catch (error) {
      toast.error('Erro ao tentar reenviar email de verificação.')
    }
  }

  const renderContent = () => {
    switch (verification.status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verificando seu email...
            </h1>
            <p className="text-gray-600 mb-8">
              Aguarde enquanto verificamos seu email. Isso pode levar alguns segundos.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Email verificado com sucesso!
            </h1>
            <p className="text-gray-600 mb-8">
              {verification.message}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Você será redirecionado para a página de login em alguns segundos...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir para Login
            </Link>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Token expirado
            </h1>
            <p className="text-gray-600 mb-8">
              {verification.message}
            </p>
            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reenviar email de verificação
              </button>
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Link>
            </div>
          </div>
        )

      case 'error':
      default:
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Erro na verificação
            </h1>
            <p className="text-gray-600 mb-8">
              {verification.message}
            </p>
            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Solicitar novo email
              </button>
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Link>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">GestaSaaS</h2>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Precisa de ajuda?{' '}
            <a href="mailto:suporte@gestasaas.com" className="text-blue-600 hover:text-blue-700 font-medium">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyAccount