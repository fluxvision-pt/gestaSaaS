import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { authService, userService } from '@/services/api'
import { 
  User, 
  CreditCard, 
  Settings, 
  Shield, 
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Bell,
  Globe,
  Smartphone,
  Lock,
  Key,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ProfileData {
  id: string
  nome: string
  name: string
  email: string
  telefoneE164?: string
  avatar?: string
  idiomaPreferido?: string
  moedaPreferida?: string
  codPais?: string
}

interface PaymentHistory {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  description: string
}

interface PlanData {
  nome: string
  name: string
  preco: number
  price: number
  periodo: string
  proximoVencimento: string
  nextBilling: string
  status: 'ativo' | 'cancelado' | 'suspenso' | 'active'
  recursos: string[]
  features: string[]
  paymentHistory: PaymentHistory[]
}

interface NotificationSettings {
  email: boolean
  emailMarketing: boolean
  emailTransacional: boolean
  push: boolean
  sms: boolean
  smsNotificacoes: boolean
  pushNotificacoes: boolean
  marketing: boolean
}

interface Session {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

interface SecuritySettings {
  autenticacaoDoisFatores: boolean
  sessaoTimeout: number
  loginSocial: boolean
  lastPasswordChange: string
  activeSessions: Session[]
}

const Profile: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estados para dados do perfil
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    nome: '',
    name: '',
    email: '',
    telefoneE164: '',
    idiomaPreferido: 'pt-BR',
    moedaPreferida: 'BRL',
    codPais: 'BR'
  })

  // Carregar dados do usuário atual
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true)
        const userData = await authService.getCurrentUser()
        setProfileData({
          id: userData.id,
          nome: userData.name,
          name: userData.name,
          email: userData.email,
          telefoneE164: '',
          idiomaPreferido: 'pt-BR',
          moedaPreferida: 'BRL',
          codPais: 'BR'
        })
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        toast.error('Erro ao carregar dados do perfil')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Estados para dados do plano (mockado por enquanto)
  const [planData] = useState<PlanData>({
    nome: user?.tenant?.plan?.name || 'Plano Básico',
    name: user?.tenant?.plan?.name || 'Plano Básico',
    preco: 29.90,
    price: 29.90,
    periodo: 'mensal',
    proximoVencimento: '2024-02-15',
    nextBilling: '2024-02-15',
    status: 'active',
    recursos: [
      'Dashboard financeiro completo',
      'Gestão de receitas e despesas',
      'Relatórios básicos',
      'Suporte por email',
      'Até 5 usuários'
    ],
    features: [
      'Dashboard financeiro completo',
      'Gestão de receitas e despesas',
      'Relatórios básicos',
      'Suporte por email',
      'Até 5 usuários'
    ],
    paymentHistory: [
      {
        id: '1',
        date: '2024-01-15',
        amount: 29.90,
        status: 'paid',
        description: 'Plano Básico - Janeiro 2024'
      },
      {
        id: '2',
        date: '2023-12-15',
        amount: 29.90,
        status: 'paid',
        description: 'Plano Básico - Dezembro 2023'
      }
    ]
  })

  // Estados para configurações de notificação
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    emailMarketing: true,
    emailTransacional: true,
    push: true,
    sms: false,
    smsNotificacoes: false,
    pushNotificacoes: true,
    marketing: false
  })

  // Estados para segurança
  const [security] = useState<SecuritySettings>({
    autenticacaoDoisFatores: false,
    sessaoTimeout: 30,
    loginSocial: false,
    lastPasswordChange: '2023-11-15',
    activeSessions: [
      {
        id: '1',
        device: 'Chrome - Windows',
        location: 'São Paulo, SP',
        lastActive: 'Agora',
        current: true
      },
      {
        id: '2',
        device: 'Safari - iPhone',
        location: 'São Paulo, SP',
        lastActive: '2 horas atrás',
        current: false
      }
    ]
  })

  // Estados para alteração de senha
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  })

  const tabs = [
    { id: 'personal', label: 'Dados Pessoais', icon: User },
    { id: 'plan', label: 'Plano & Assinatura', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'security', label: 'Segurança', icon: Shield }
  ]

  const handleSavePersonalData = async () => {
    setIsLoading(true)
    try {
      const updateData = {
        nome: profileData.nome,
        telefoneE164: profileData.telefoneE164,
        idiomaPreferido: profileData.idiomaPreferido,
        moedaPreferida: profileData.moedaPreferida,
        codPais: profileData.codPais
      }

      await userService.updateUser(profileData.id, updateData)
      setIsEditing(false)
      toast.success('Dados pessoais atualizados com sucesso!')
    } catch (error: any) {
      console.error('Erro ao atualizar dados pessoais:', error)
      toast.error(error.response?.data?.message || 'Erro ao atualizar dados pessoais')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.novaSenha !== passwordData.confirmarSenha) {
      toast.error('As senhas não coincidem')
      return
    }

    if (passwordData.novaSenha.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres')
      return
    }

    // Validar formato da senha
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!senhaRegex.test(passwordData.novaSenha)) {
      toast.error('A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial')
      return
    }

    setIsLoading(true)
    try {
      await userService.changePassword(profileData.id, {
        senhaAtual: passwordData.senhaAtual,
        novaSenha: passwordData.novaSenha
      })

      setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })
      toast.success('Senha alterada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error)
      toast.error(error.message || 'Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotificationSettings((prev: NotificationSettings) => ({
      ...prev,
      [key]: !prev[key]
    }))
    toast.success('Configuração atualizada!')
  }

  const renderPersonalTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profileData.name.charAt(0).toUpperCase()}
          </div>
          <button className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Camera className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{profileData.name}</h3>
          <p className="text-gray-600">{profileData.email}</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Informações Pessoais</h4>
          {!editingPersonal ? (
            <button
              onClick={() => setEditingPersonal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSavePersonalData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Salvando...' : 'Salvar'}</span>
              </button>
              <button
                onClick={() => setEditingPersonal(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
            <input
              type="text"
              value={profileData.nome}
              onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone (formato E164)</label>
            <input
              type="tel"
              value={profileData.telefoneE164 || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, telefoneE164: e.target.value }))}
              disabled={!isEditing}
              placeholder="+5511999999999"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Idioma Preferido</label>
            <select
              value={profileData.idiomaPreferido || 'pt-BR'}
              onChange={(e) => setProfileData(prev => ({ ...prev, idiomaPreferido: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moeda Preferida</label>
            <select
              value={profileData.moedaPreferida || 'BRL'}
              onChange={(e) => setProfileData(prev => ({ ...prev, moedaPreferida: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="BRL">Real (BRL)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
            <select
              value={profileData.codPais || 'BR'}
              onChange={(e) => setProfileData(prev => ({ ...prev, codPais: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="BR">Brasil</option>
              <option value="US">Estados Unidos</option>
              <option value="ES">Espanha</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPlanTab = () => (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{planData.nome}</h3>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium capitalize">{planData.status}</span>
          </div>
        </div>
        <div className="mb-4">
          <span className="text-3xl font-bold">R$ {planData.preco.toFixed(2)}</span>
          <span className="text-blue-100 ml-2">/{planData.periodo}</span>
        </div>
        <p className="text-blue-100 mb-4">Próxima cobrança: {planData.proximoVencimento}</p>
        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
          Alterar Plano
        </button>
      </div>

      {/* Plan Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recursos Inclusos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {planData.recursos.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Pagamentos</h4>
        <div className="space-y-3">
          {planData.paymentHistory.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{payment.description}</p>
                <p className="text-sm text-gray-600">{payment.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">R$ {payment.amount.toFixed(2)}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {payment.status === 'paid' ? 'Pago' : 
                   payment.status === 'pending' ? 'Pendente' : 'Falhou'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Notificações por Email</p>
                <p className="text-sm text-gray-600">Receba atualizações importantes por email</p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationChange('email')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.email ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.email ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Notificações Push</p>
                <p className="text-sm text-gray-600">Receba notificações no navegador</p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationChange('push')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.push ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.push ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">SMS</p>
                <p className="text-sm text-gray-600">Receba alertas importantes por SMS</p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationChange('sms')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.sms ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.sms ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Marketing</p>
                <p className="text-sm text-gray-600">Receba novidades e promoções</p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationChange('marketing')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.marketing ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.marketing ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Idioma e Região</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fuso Horário</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="Europe/London">London (GMT+0)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.senhaAtual}
                onChange={(e) => setPasswordData(prev => ({ ...prev, senhaAtual: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.novaSenha}
                onChange={(e) => setPasswordData(prev => ({ ...prev, novaSenha: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmarSenha}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={isLoading || !passwordData.senhaAtual || !passwordData.novaSenha || !passwordData.confirmarSenha}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </div>
      </div>

      {/* Two Factor Authentication */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Autenticação de Dois Fatores</h4>
            <p className="text-sm text-gray-600">Adicione uma camada extra de segurança à sua conta</p>
          </div>
          <div className="flex items-center space-x-2">
            {security.autenticacaoDoisFatores ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className={`text-sm font-medium ${
              security.autenticacaoDoisFatores ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {security.autenticacaoDoisFatores ? 'Ativado' : 'Desativado'}
            </span>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {security.autenticacaoDoisFatores ? 'Desativar 2FA' : 'Ativar 2FA'}
        </button>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Sessões Ativas</h4>
        <div className="space-y-3">
          {security.activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{session.device}</p>
                  <p className="text-sm text-gray-600">{session.location}</p>
                  <p className="text-xs text-gray-500">Último acesso: {session.lastActive}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {session.current && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Atual
                  </span>
                )}
                {!session.current && (
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Encerrar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900">Última alteração de senha</h5>
            <p className="text-sm text-blue-700">{security.lastPasswordChange}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Perfil do Usuário</h1>
          <p className="text-gray-600 mt-2">Gerencie suas informações pessoais, plano e configurações de segurança</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'personal' && renderPersonalTab()}
            {activeTab === 'plan' && renderPlanTab()}
            {activeTab === 'settings' && renderSettingsTab()}
            {activeTab === 'security' && renderSecurityTab()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile