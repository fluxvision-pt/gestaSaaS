import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, Mail, ArrowLeft, CheckCircle, ChevronRight, Loader2 } from 'lucide-react'
import { LanguageSelector } from '@/components/LanguageSelector'
import { authService } from '@/services/api'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { t } = useTranslation()

  // Validação de email em tempo real
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Digite um email válido')
      return false
    }
    setEmailError('')
    return true
  }

  // Timer de reenvio
  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      toast.error('Digite um email válido')
      return
    }

    setLoading(true)

    try {
      const response = await authService.forgotPassword({ email })
      setSuccess(true)
      startCountdown()
      toast.success('Instruções enviadas! Verifique seu email.')
    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error)
      toast.error(error.response?.data?.message || 'Erro ao solicitar recuperação de senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setSuccess(false)
    setEmail('')
    setEmailError('')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="flex justify-end absolute top-4 right-4">
          <LanguageSelector />
        </div>
        
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-in zoom-in duration-500">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-in zoom-in duration-700 delay-200">
                <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 animate-in slide-in-from-bottom duration-500 delay-300">
                Email enviado!
              </h2>
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-400">
                <p className="text-gray-600">
                  Se o email <strong>{email}</strong> existir em nossa base, você receberá instruções para redefinir sua senha.
                </p>
                <p className="text-sm text-gray-500">
                  Verifique sua caixa de entrada e também a pasta de spam.
                </p>
              </div>
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-500">
                <Link to="/login">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                    Voltar para Login
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                  onClick={handleResend}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `Reenviar em ${countdown}s` : 'Enviar novamente'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="flex justify-end absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-in zoom-in duration-500">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="text-center space-y-2 animate-in slide-in-from-top duration-500 delay-200">
                <Car className="h-12 w-12 text-blue-600 mx-auto" />
                <h1 className="text-2xl font-bold text-gray-900">Recuperar Senha</h1>
                <p className="text-gray-600">
                  Digite seu email para receber instruções de recuperação
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom duration-500 delay-300">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailError) setEmailError('')
                      }}
                      onBlur={() => validateEmail(email)}
                      className={`pl-10 transition-all duration-200 ${
                        emailError 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : email && !emailError 
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                            : ''
                      }`}
                      required
                    />
                    {email && !emailError && (
                      <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {emailError && (
                    <p className="text-red-600 text-sm animate-in slide-in-from-left duration-300">
                      {emailError}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={loading || !!emailError || !email}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Enviar Instruções</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center space-y-2 animate-in slide-in-from-bottom duration-500 delay-400">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar para Login
                </Link>
                <div className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                    Cadastre-se
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="hidden lg:block space-y-8 animate-in slide-in-from-right duration-700 delay-500">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Recupere o acesso ao seu GestaSaaS
            </h2>
            <p className="text-lg text-gray-600">
              Não se preocupe, isso acontece com todos nós. Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-center space-x-4 p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 hover:bg-white/80 transition-all duration-200">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Verificação por Email</h3>
                <p className="text-sm text-gray-600">Processo seguro e rápido</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 hover:bg-white/80 transition-all duration-200">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Segurança Garantida</h3>
                <p className="text-sm text-gray-600">Seus dados estão protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}