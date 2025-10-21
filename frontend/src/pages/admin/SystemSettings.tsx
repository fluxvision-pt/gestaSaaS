import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { 
  Settings, 
  Globe, 
  Mail, 
  CreditCard,
  MapPin,
  Shield,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { adminApi } from '@/services/adminApi';

interface SystemConfig {
  id: string;
  chave: string;
  valor: string;
  descricao?: string;
  categoria?: string;
  tipo?: 'string' | 'number' | 'boolean' | 'json' | 'password';
}

interface ConfigSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  configs: SystemConfig[];
}

export default function SystemSettings() {
  const [configurations, setConfigurations] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<{ [key: string]: any }>({});
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  const { data: configData, loading: configLoading, refetch: refetchConfig } = useApi<SystemConfig[]>(() => adminApi.getSystemConfigurations());

  useEffect(() => {
    if (configData) {
      setConfigurations(configData);
    }
    setLoading(configLoading);
  }, [configData, configLoading]);

  const handleConfigChange = (configKey: string, value: any) => {
    setChanges(prev => ({
      ...prev,
      [configKey]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(changes).length === 0) {
      toast.info("Não há alterações para salvar.");
      return;
    }

    setSaving(true);
    try {
      // Salvar cada configuração individualmente
      for (const [chave, valor] of Object.entries(changes)) {
        await adminApi.updateSystemConfiguration({ chave, valor: String(valor) });
      }

      toast.success("As configurações foram atualizadas com sucesso.");
      setChanges({});
      refetchConfig();
    } catch (error) {
      toast.error("Não foi possível salvar as configurações.");
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetChanges = () => {
    setChanges({});
    toast.info("Todas as alterações não salvas foram descartadas.");
  };

  const getConfigValue = (config: SystemConfig) => {
    if (changes[config.chave] !== undefined) {
      return changes[config.chave];
    }
    
    switch (config.tipo || 'string') {
      case 'boolean':
        return config.valor === 'true';
      case 'number':
        return Number(config.valor);
      case 'json':
        try {
          return JSON.parse(config.valor);
        } catch {
          return config.valor;
        }
      default:
        return config.valor;
    }
  };

  const togglePasswordVisibility = (configKey: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [configKey]: !prev[configKey]
    }));
  };

  const renderConfigInput = (config: SystemConfig) => {
    const value = getConfigValue(config);
    const isPassword = config.tipo === 'password' || config.chave.toLowerCase().includes('password') || config.chave.toLowerCase().includes('secret') || config.chave.toLowerCase().includes('key');
    
    switch (config.tipo || 'string') {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value}
              onCheckedChange={(checked) => handleConfigChange(config.chave, checked)}
            />
            <Badge variant={value ? "default" : "secondary"}>
              {value ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(config.chave, Number(e.target.value))}
            className="max-w-xs"
          />
        );
      
      case 'json':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => handleConfigChange(config.chave, e.target.value)}
            className="font-mono text-sm"
            rows={4}
          />
        );
      
      default:
        if (isPassword) {
          return (
            <div className="flex items-center space-x-2 max-w-md">
              <Input
                type={showPasswords[config.chave] ? "text" : "password"}
                value={value}
                onChange={(e) => handleConfigChange(config.chave, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => togglePasswordVisibility(config.chave)}
              >
                {showPasswords[config.chave] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          );
        }
        
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleConfigChange(config.chave, e.target.value)}
            className="max-w-md"
          />
        );
    }
  };

  const groupConfigsByCategory = (): ConfigSection[] => {
    const sections: ConfigSection[] = [
      {
        title: 'Geral',
        description: 'Configurações gerais da aplicação',
        icon: <Settings className="h-5 w-5" />,
        configs: configurations.filter(config => 
          config.chave.includes('app_') || 
          config.chave.includes('default_') ||
          config.chave.includes('timezone') ||
          config.chave.includes('max_')
        )
      },
      {
        title: 'Pagamentos',
        description: 'Configurações de gateways de pagamento',
        icon: <CreditCard className="h-5 w-5" />,
        configs: configurations.filter(config => 
          config.chave.includes('stripe') || 
          config.chave.includes('mercadopago') ||
          config.chave.includes('pix') ||
          config.chave.includes('boleto')
        )
      },
      {
        title: 'Email',
        description: 'Configurações de envio de emails',
        icon: <Mail className="h-5 w-5" />,
        configs: configurations.filter(config => 
          config.chave.includes('smtp') || 
          config.chave.includes('email')
        )
      },
      {
        title: 'Localização',
        description: 'Configurações de localização e idioma',
        icon: <MapPin className="h-5 w-5" />,
        configs: configurations.filter(config => 
          config.chave.includes('country') || 
          config.chave.includes('currency') ||
          config.chave.includes('language') ||
          config.chave.includes('timezone')
        )
      },
      {
        title: 'Segurança',
        description: 'Configurações de segurança e autenticação',
        icon: <Shield className="h-5 w-5" />,
        configs: configurations.filter(config => 
          config.chave.includes('password') || 
          config.chave.includes('session') ||
          config.chave.includes('login') ||
          config.chave.includes('2fa') ||
          config.chave.includes('verification')
        )
      },
      {
        title: 'Notificações',
        description: 'Configurações de notificações do sistema',
        icon: <Globe className="h-5 w-5" />,
        configs: configurations.filter(config => 
          config.chave.includes('notification') || 
          config.chave.includes('push') ||
          config.chave.includes('sms')
        )
      }
    ];

    return sections.filter(section => section.configs.length > 0);
  };

  const hasChanges = Object.keys(changes).length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const sections = groupConfigsByCategory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações globais da plataforma
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Button 
              variant="outline" 
              onClick={handleResetChanges}
              disabled={saving}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Descartar
            </Button>
          )}
          
          <Button 
            onClick={handleSaveChanges}
            disabled={!hasChanges || saving}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Status de alterações */}
      {hasChanges && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                Você tem {Object.keys(changes).length} alteração(ões) não salva(s)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de configurações */}
      <Tabs defaultValue={sections[0]?.title.toLowerCase() || 'geral'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          {sections.map((section) => (
            <TabsTrigger 
              key={section.title.toLowerCase()} 
              value={section.title.toLowerCase()}
              className="flex items-center gap-2"
            >
              {section.icon}
              <span className="hidden sm:inline">{section.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.title.toLowerCase()} value={section.title.toLowerCase()}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.configs.map((config, index) => (
                  <div key={config.chave}>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">
                            {config.chave.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          {config.descricao && (
                            <p className="text-xs text-muted-foreground">
                              {config.descricao}
                            </p>
                          )}
                        </div>
                        {changes[config.chave] !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            Modificado
                          </Badge>
                        )}
                      </div>
                      {renderConfigInput(config)}
                    </div>
                    {index < section.configs.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Footer com informações */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Importante:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• As alterações afetam todo o sistema globalmente</li>
                <li>• Algumas configurações podem exigir reinicialização do sistema</li>
                <li>• Mantenha backup das configurações importantes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}