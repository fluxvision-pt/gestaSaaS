import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Share2,
  Copy,
  QrCode,
  Gift,
  DollarSign,
  TrendingUp,
  Calendar,
  Mail,
  MessageCircle,
  ExternalLink,
  Award,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Crown,
  Zap,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Indicacao {
  id: string;
  nomeIndicado: string;
  emailIndicado: string;
  dataIndicacao: string;
  status: 'pendente' | 'cadastrado' | 'ativo' | 'cancelado';
  valorGanho: number;
  planoEscolhido?: string;
  dataConversao?: string;
}

interface Recompensa {
  id: string;
  tipo: 'dinheiro' | 'desconto' | 'bonus';
  valor: number;
  descricao: string;
  requisito: string;
  conquistada: boolean;
  dataConquista?: string;
}

const Indicacoes: React.FC = () => {
  const [linkPersonalizado, setLinkPersonalizado] = useState('gestasaas.com/ref/joao-silva');
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [dialogCompartilharOpen, setDialogCompartilharOpen] = useState(false);
  const [dialogRecompensasOpen, setDialogRecompensasOpen] = useState(false);

  // Dados mockados
  const estatisticas = {
    totalIndicacoes: 15,
    indicacoesPendentes: 3,
    indicacoesAtivas: 8,
    indicacoesCanceladas: 4,
    ganhoTotal: 2450.00,
    ganhoMesAtual: 380.00,
    metaMensal: 500.00,
    ranking: 12
  };

  const indicacoes: Indicacao[] = [
    {
      id: '1',
      nomeIndicado: 'Maria Silva',
      emailIndicado: 'maria@email.com',
      dataIndicacao: '2025-01-10',
      status: 'ativo',
      valorGanho: 150.00,
      planoEscolhido: 'Profissional',
      dataConversao: '2025-01-12'
    },
    {
      id: '2',
      nomeIndicado: 'Carlos Santos',
      emailIndicado: 'carlos@email.com',
      dataIndicacao: '2025-01-08',
      status: 'cadastrado',
      valorGanho: 0,
      planoEscolhido: 'Básico'
    },
    {
      id: '3',
      nomeIndicado: 'Ana Costa',
      emailIndicado: 'ana@email.com',
      dataIndicacao: '2025-01-05',
      status: 'pendente',
      valorGanho: 0
    },
    {
      id: '4',
      nomeIndicado: 'Pedro Lima',
      emailIndicado: 'pedro@email.com',
      dataIndicacao: '2024-12-28',
      status: 'ativo',
      valorGanho: 200.00,
      planoEscolhido: 'Premium',
      dataConversao: '2024-12-30'
    },
    {
      id: '5',
      nomeIndicado: 'Julia Oliveira',
      emailIndicado: 'julia@email.com',
      dataIndicacao: '2024-12-20',
      status: 'cancelado',
      valorGanho: 0,
      planoEscolhido: 'Básico'
    }
  ];

  const recompensas: Recompensa[] = [
    {
      id: '1',
      tipo: 'dinheiro',
      valor: 50,
      descricao: 'Primeira Indicação',
      requisito: '1 indicação ativa',
      conquistada: true,
      dataConquista: '2024-11-15'
    },
    {
      id: '2',
      tipo: 'bonus',
      valor: 100,
      descricao: 'Indicador Bronze',
      requisito: '5 indicações ativas',
      conquistada: true,
      dataConquista: '2024-12-10'
    },
    {
      id: '3',
      tipo: 'dinheiro',
      valor: 250,
      descricao: 'Indicador Prata',
      requisito: '10 indicações ativas',
      conquistada: false
    },
    {
      id: '4',
      tipo: 'desconto',
      valor: 50,
      descricao: 'Desconto Premium',
      requisito: '15 indicações ativas',
      conquistada: false
    },
    {
      id: '5',
      tipo: 'dinheiro',
      valor: 500,
      descricao: 'Indicador Ouro',
      requisito: '25 indicações ativas',
      conquistada: false
    }
  ];

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(`https://${linkPersonalizado}`);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleCompartilharWhatsApp = () => {
    const texto = `Olá! Conheça o GestaSaaS, a melhor plataforma para gestão de frotas e motoristas de aplicativo. Use meu link e ganhe desconto: https://${linkPersonalizado}`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const handleCompartilharEmail = () => {
    const assunto = 'Convite para conhecer o GestaSaaS';
    const corpo = `Olá!

Quero te apresentar o GestaSaaS, uma plataforma incrível para gestão de frotas e controle financeiro para motoristas de aplicativo.

Com o GestaSaaS você pode:
• Controlar receitas e despesas automaticamente
• Acompanhar a rentabilidade por aplicativo
• Gerenciar manutenções e combustível
• Gerar relatórios detalhados

Use meu link de indicação e ganhe desconto especial:
https://${linkPersonalizado}

Experimente gratuitamente!

Abraços!`;

    const url = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.open(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'cadastrado':
        return <Badge className="bg-blue-100 text-blue-800">Cadastrado</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return null;
    }
  };

  const getRecompensaIcon = (tipo: string) => {
    switch (tipo) {
      case 'dinheiro':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'desconto':
        return <Gift className="w-5 h-5 text-purple-600" />;
      case 'bonus':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const progressoMeta = (estatisticas.ganhoMesAtual / estatisticas.metaMensal) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-8 h-8 text-blue-600" />
                Programa de Indicações
              </h1>
              <p className="text-gray-600 mt-1">
                Indique amigos e ganhe recompensas por cada novo usuário
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button onClick={() => setDialogCompartilharOpen(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" onClick={() => setDialogRecompensasOpen(true)}>
                <Award className="w-4 h-4 mr-2" />
                Recompensas
              </Button>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {estatisticas.totalIndicacoes}
                </div>
                <div className="text-sm text-gray-600">Total de Indicações</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {estatisticas.indicacoesAtivas}
                </div>
                <div className="text-sm text-gray-600">Indicações Ativas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  R$ {estatisticas.ganhoTotal.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Ganho Total</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  #{estatisticas.ranking}
                </div>
                <div className="text-sm text-gray-600">Ranking Geral</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Link de Indicação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Seu Link de Indicação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={`https://${linkPersonalizado}`} 
                readOnly 
                className="flex-1"
              />
              <Button onClick={handleCopiarLink} variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={() => setQrCodeVisible(!qrCodeVisible)} variant="outline">
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
            
            {qrCodeVisible && (
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <QrCode className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">QR Code do seu link</p>
                    <p className="text-xs">{linkPersonalizado}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Como funciona:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Compartilhe seu link personalizado com amigos</li>
                <li>• Quando eles se cadastrarem, você ganha R$ 50</li>
                <li>• Quando eles assinarem um plano, você ganha mais R$ 100-200</li>
                <li>• Quanto mais indicações, maiores as recompensas!</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Meta Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Meta Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progresso da Meta</span>
                <span className="font-medium">
                  R$ {estatisticas.ganhoMesAtual.toFixed(2)} / R$ {estatisticas.metaMensal.toFixed(2)}
                </span>
              </div>
              <Progress value={progressoMeta} className="h-3" />
              <p className="text-xs text-gray-500">
                {Math.round(progressoMeta)}% da meta mensal alcançada
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="indicacoes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="indicacoes">Minhas Indicações</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Ganhos</TabsTrigger>
          </TabsList>

          <TabsContent value="indicacoes">
            <Card>
              <CardHeader>
                <CardTitle>Indicações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {indicacoes.map((indicacao) => (
                    <div key={indicacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{indicacao.nomeIndicado}</h4>
                          {getStatusBadge(indicacao.status)}
                        </div>
                        <p className="text-sm text-gray-600">{indicacao.emailIndicado}</p>
                        <p className="text-xs text-gray-500">
                          Indicado em {format(new Date(indicacao.dataIndicacao), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        {indicacao.planoEscolhido && (
                          <p className="text-xs text-blue-600">Plano: {indicacao.planoEscolhido}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {indicacao.valorGanho > 0 ? `R$ ${indicacao.valorGanho.toFixed(2)}` : '-'}
                        </div>
                        {indicacao.dataConversao && (
                          <p className="text-xs text-gray-500">
                            Convertido em {format(new Date(indicacao.dataConversao), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Ganhos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {indicacoes
                    .filter(i => i.valorGanho > 0)
                    .map((indicacao) => (
                      <div key={indicacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Indicação: {indicacao.nomeIndicado}</h4>
                            <p className="text-sm text-gray-600">
                              Plano {indicacao.planoEscolhido} - {format(new Date(indicacao.dataConversao!), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          + R$ {indicacao.valorGanho.toFixed(2)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Compartilhamento */}
        <Dialog open={dialogCompartilharOpen} onOpenChange={setDialogCompartilharOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compartilhar Link de Indicação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Seu Link</Label>
                <div className="flex gap-2">
                  <Input value={`https://${linkPersonalizado}`} readOnly />
                  <Button onClick={handleCopiarLink} variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label>Compartilhar via:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handleCompartilharWhatsApp}
                    className="h-16 flex-col bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-6 h-6 mb-1" />
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={handleCompartilharEmail}
                    variant="outline"
                    className="h-16 flex-col"
                  >
                    <Mail className="w-6 h-6 mb-1" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Recompensas */}
        <Dialog open={dialogRecompensasOpen} onOpenChange={setDialogRecompensasOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Sistema de Recompensas
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recompensas.map((recompensa) => (
                <div 
                  key={recompensa.id} 
                  className={`p-4 border rounded-lg ${
                    recompensa.conquistada ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRecompensaIcon(recompensa.tipo)}
                      <div>
                        <h4 className="font-semibold">{recompensa.descricao}</h4>
                        <p className="text-sm text-gray-600">{recompensa.requisito}</p>
                        {recompensa.conquistada && recompensa.dataConquista && (
                          <p className="text-xs text-green-600">
                            Conquistada em {format(new Date(recompensa.dataConquista), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {recompensa.tipo === 'dinheiro' && 'R$ '}
                        {recompensa.valor}
                        {recompensa.tipo === 'desconto' && '% OFF'}
                        {recompensa.tipo === 'bonus' && ' pts'}
                      </div>
                      {recompensa.conquistada ? (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Indicacoes;