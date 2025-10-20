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

import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  Globe, 
  Palette,
  Bell,
  Key,
  Server,
  Monitor,
  Users,
  DollarSign,
  FileText,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { adminApi, type SystemConfig } from '@/services/adminApi';

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

  const { data: configData, loading: configLoading, refetch: refetchConfig } = useApi<SystemConfig[]>(() => adminApi.getSystemConfigs());

  useEffect(() => {
    if (configData) {
      setConfigurations(configData);
    }
    setLoading(configLoading);
  }, [configData, configLoading]);

  const handleConfigChange = (configId: string, value: any) => {
    setChanges(prev => ({
      ...prev,
      [configId]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(changes).length === 0) {
      toast.info("Não há alterações para salvar.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/system/configurations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ changes })
      });

      if (response.ok) {
        toast.success("As configurações foram atualizadas com sucesso.");
        setChanges({});
        refetchConfig();
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      toast.error("Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetChanges = () => {
    setChanges({});
    toast.info("Todas as alterações não salvas foram descartadas.");
  };

  const getConfigValue = (config: SystemConfig) => {
    if (changes[config.id] !== undefined) {
      return changes[config.id];
    }
    
    switch (config.type) {
      case 'boolean':
        return config.value === 'true';
      case 'number':
        return Number(config.value);
      case 'json':
        try {
          return JSON.parse(config.value);
        } catch {
          return config.value;
        }
      default:
        return config.value;
    }
  };

  const renderConfigInput = (config: SystemConfig) => {
    const value = getConfigValue(config);

    switch (config.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value}
              onCheckedChange={(checked) => handleConfigChange(config.id, checked)}
            />
            <Label>{value ? 'Ativado' : 'Desativado'}</Label>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(config.id, Number(e.target.value))}
          />
        );

      case 'json':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleConfigChange(config.id, parsed);
              } catch {
                handleConfigChange(config.id, e.target.value);
              }
            }}
            rows={4}
            className="font-mono text-sm"
          />
        );

      default:
        if (config.key.includes('password') || config.key.includes('secret') || config.key.includes('key')) {
          return (
            <Input
              type="password"
              value={value}
              onChange={(e) => handleConfigChange(config.id, e.target.value)}
            />
          );
        }
        
        if (config.description && config.description.length > 100) {
          return (
            <Textarea
              value={value}
              onChange={(e) => handleConfigChange(config.id, e.target.value)}
              rows={3}
            />
          );
        }

        return (
          <Input
            value={value}
            onChange={(e) => handleConfigChange(config.id, e.target.value)}
          />
        );
    }
  };

  const groupConfigsByCategory = (): ConfigSection[] => {
    const grouped = configurations.reduce((acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    }, {} as { [key: string]: SystemConfig[] });

    const sections: ConfigSection[] = [
      {
        title: 'Geral',
        description: 'Configurações gerais do sistema',
        icon: <Settings className="h-5 w-5" />,
        configs: grouped['geral'] || []
      },
      {
        title: 'Banco de Dados',
        description: 'Configurações de conexão e performance do banco',
        icon: <Database className="h-5 w-5" />,
        configs: grouped['database'] || []
      },
      {
        title: 'Email',
        description: 'Configurações de envio de emails',
        icon: <Mail className="h-5 w-5" />,
        configs: grouped['email'] || []
      },
      {
        title: 'Segurança',
        description: 'Configurações de segurança e autenticação',
        icon: <Shield className="h-5 w-5" />,
        configs: grouped['security'] || []
      },
      {
        title: 'API',
        description: 'Configurações da API e integrações',
        icon: <Globe className="h-5 w-5" />,
        configs: grouped['api'] || []
      },
      {
        title: 'Interface',
        description: 'Configurações de aparência e tema',
        icon: <Palette className="h-5 w-5" />,
        configs: grouped['ui'] || []
      },
      {
        title: 'Notificações',
        description: 'Configurações de notificações do sistema',
        icon: <Bell className="h-5 w-5" />,
        configs: grouped['notifications'] || []
      },
      {
        title: 'Pagamentos',
        description: 'Configurações de gateway de pagamento',
        icon: <DollarSign className="h-5 w-5" />,
        configs: grouped['payments'] || []
      }
    ];

    return sections.filter(section => section.configs.length > 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sections = groupConfigsByCategory();
  const hasChanges = Object.keys(changes).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações globais do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <>
              <Button variant="outline" onClick={handleResetChanges}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Descartar
              </Button>
              <Button onClick={handleSaveChanges} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Changes Alert */}
      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Você tem {Object.keys(changes).length} alteração(ões) não salva(s)
                </p>
                <p className="text-sm text-yellow-700">
                  Lembre-se de salvar suas alterações antes de sair da página.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Sections */}
      <Tabs defaultValue={sections[0]?.title.toLowerCase()} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {sections.slice(0, 8).map((section) => (
            <TabsTrigger key={section.title} value={section.title.toLowerCase()}>
              {section.icon}
              <span className="ml-2 hidden sm:inline">{section.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.title} value={section.title.toLowerCase()}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {section.icon}
                  <span>{section.title}</span>
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.configs.map((config, index) => (
                  <div key={config.id}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={config.id} className="text-sm font-medium">
                          {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        <div className="flex items-center space-x-2">
                          {changes[config.id] !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              Alterado
                            </Badge>
                          )}
                          {config.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              Público
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {config.description && (
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      )}
                      
                      <div className="max-w-md">
                        {renderConfigInput(config)}
                      </div>
                    </div>
                    
                    {index < section.configs.length - 1 && (
                      <div className="mt-6 border-t border-gray-200" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Informações do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-sm font-medium">Versão do Sistema</Label>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Ambiente</Label>
              <p className="text-sm text-muted-foreground">Produção</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Última Atualização</Label>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Atenção</p>
              <p className="text-sm text-red-700">
                Alterações nas configurações do sistema podem afetar o funcionamento da aplicação. 
                Certifique-se de entender o impacto antes de fazer modificações.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}