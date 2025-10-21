import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Fuel, 
  Calendar, 
  Award,
  Lock,
  CheckCircle,
  Clock,
  Medal,
  Crown,
  Zap
} from 'lucide-react';

interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'financeiro' | 'eficiencia' | 'consistencia' | 'marcos';
  status: 'conquistada' | 'bloqueada' | 'em_progresso';
  icone: React.ReactNode;
  pontos: number;
  progresso?: number;
  progressoMax?: number;
  dataConquista?: string;
  requisitos: string[];
  cor: string;
}

const Conquistas: React.FC = () => {
  const [conquistaSelecionada, setConquistaSelecionada] = useState<Conquista | null>(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');

  // Dados mockados das conquistas
  const conquistas: Conquista[] = [
    // Financeiro
    {
      id: '1',
      titulo: 'Primeiro Lucro',
      descricao: 'Alcance seu primeiro mês com lucro positivo',
      categoria: 'financeiro',
      status: 'conquistada',
      icone: <DollarSign className="w-6 h-6" />,
      pontos: 100,
      dataConquista: '15/12/2024',
      requisitos: ['Receita > Custos por 1 mês'],
      cor: 'text-green-600'
    },
    {
      id: '2',
      titulo: 'Magnata dos Transportes',
      descricao: 'Alcance R$ 50.000 em receita mensal',
      categoria: 'financeiro',
      status: 'em_progresso',
      icone: <Crown className="w-6 h-6" />,
      pontos: 500,
      progresso: 32000,
      progressoMax: 50000,
      requisitos: ['Receita mensal ≥ R$ 50.000'],
      cor: 'text-yellow-600'
    },
    {
      id: '3',
      titulo: 'Economia Inteligente',
      descricao: 'Reduza custos em 20% em um mês',
      categoria: 'financeiro',
      status: 'bloqueada',
      icone: <TrendingUp className="w-6 h-6" />,
      pontos: 200,
      requisitos: ['Redução de custos ≥ 20%', 'Mínimo 3 meses de dados'],
      cor: 'text-gray-400'
    },
    
    // Eficiência
    {
      id: '4',
      titulo: 'Eco-Friendly',
      descricao: 'Mantenha eficiência de combustível acima de 12 km/l',
      categoria: 'eficiencia',
      status: 'conquistada',
      icone: <Fuel className="w-6 h-6" />,
      pontos: 150,
      dataConquista: '10/01/2025',
      requisitos: ['Eficiência ≥ 12 km/l por 30 dias'],
      cor: 'text-green-600'
    },
    {
      id: '5',
      titulo: 'Velocista Eficiente',
      descricao: 'Complete 100 viagens com eficiência máxima',
      categoria: 'eficiencia',
      status: 'em_progresso',
      icone: <Zap className="w-6 h-6" />,
      pontos: 300,
      progresso: 67,
      progressoMax: 100,
      requisitos: ['100 viagens com eficiência ≥ 90%'],
      cor: 'text-blue-600'
    },
    
    // Consistência
    {
      id: '6',
      titulo: 'Disciplinado',
      descricao: 'Registre dados por 30 dias consecutivos',
      categoria: 'consistencia',
      status: 'conquistada',
      icone: <Calendar className="w-6 h-6" />,
      pontos: 100,
      dataConquista: '05/01/2025',
      requisitos: ['30 dias consecutivos de registros'],
      cor: 'text-purple-600'
    },
    {
      id: '7',
      titulo: 'Mestre da Consistência',
      descricao: 'Registre dados por 365 dias consecutivos',
      categoria: 'consistencia',
      status: 'em_progresso',
      icone: <Target className="w-6 h-6" />,
      pontos: 1000,
      progresso: 89,
      progressoMax: 365,
      requisitos: ['365 dias consecutivos de registros'],
      cor: 'text-purple-600'
    },
    
    // Marcos
    {
      id: '8',
      titulo: 'Bem-vindo!',
      descricao: 'Complete seu primeiro registro no sistema',
      categoria: 'marcos',
      status: 'conquistada',
      icone: <Star className="w-6 h-6" />,
      pontos: 50,
      dataConquista: '01/12/2024',
      requisitos: ['Primeiro registro no sistema'],
      cor: 'text-yellow-600'
    },
    {
      id: '9',
      titulo: 'Veterano',
      descricao: 'Complete 1 ano usando o sistema',
      categoria: 'marcos',
      status: 'bloqueada',
      icone: <Medal className="w-6 h-6" />,
      pontos: 500,
      requisitos: ['1 ano de uso do sistema'],
      cor: 'text-gray-400'
    }
  ];

  // Estatísticas gerais
  const estatisticas = {
    totalConquistas: conquistas.length,
    conquistadas: conquistas.filter(c => c.status === 'conquistada').length,
    pontosTotais: conquistas
      .filter(c => c.status === 'conquistada')
      .reduce((acc, c) => acc + c.pontos, 0),
    ranking: 15 // Posição no ranking geral
  };

  // Filtrar conquistas por categoria
  const conquistasFiltradas = categoriaAtiva === 'todas' 
    ? conquistas 
    : conquistas.filter(c => c.categoria === categoriaAtiva);

  const categorias = [
    { id: 'todas', nome: 'Todas', icone: <Trophy className="w-4 h-4" /> },
    { id: 'financeiro', nome: 'Financeiro', icone: <DollarSign className="w-4 h-4" /> },
    { id: 'eficiencia', nome: 'Eficiência', icone: <Fuel className="w-4 h-4" /> },
    { id: 'consistencia', nome: 'Consistência', icone: <Calendar className="w-4 h-4" /> },
    { id: 'marcos', nome: 'Marcos', icone: <Award className="w-4 h-4" /> }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conquistada':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'em_progresso':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'bloqueada':
        return <Lock className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conquistada':
        return <Badge className="bg-green-100 text-green-800">Conquistada</Badge>;
      case 'em_progresso':
        return <Badge className="bg-blue-100 text-blue-800">Em Progresso</Badge>;
      case 'bloqueada':
        return <Badge className="bg-gray-100 text-gray-800">Bloqueada</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com Estatísticas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-600" />
                Conquistas
              </h1>
              <p className="text-gray-600 mt-1">
                Acompanhe seu progresso e desbloqueie novas conquistas
              </p>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {estatisticas.conquistadas}/{estatisticas.totalConquistas}
                </div>
                <div className="text-sm text-gray-600">Conquistas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {estatisticas.pontosTotais}
                </div>
                <div className="text-sm text-gray-600">Pontos</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  #{estatisticas.ranking}
                </div>
                <div className="text-sm text-gray-600">Ranking</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((estatisticas.conquistadas / estatisticas.totalConquistas) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Progresso</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtros por Categoria */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Tabs value={categoriaAtiva} onValueChange={setCategoriaAtiva}>
            <TabsList className="grid w-full grid-cols-5">
              {categorias.map((categoria) => (
                <TabsTrigger 
                  key={categoria.id} 
                  value={categoria.id}
                  className="flex items-center gap-2"
                >
                  {categoria.icone}
                  <span className="hidden sm:inline">{categoria.nome}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Grid de Conquistas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conquistasFiltradas.map((conquista) => (
            <Card 
              key={conquista.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                conquista.status === 'bloqueada' ? 'opacity-60' : ''
              }`}
              onClick={() => setConquistaSelecionada(conquista)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${
                    conquista.status === 'conquistada' ? 'bg-green-100' :
                    conquista.status === 'em_progresso' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <div className={conquista.cor}>
                      {conquista.icone}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusIcon(conquista.status)}
                    <Badge variant="secondary" className="text-xs">
                      {conquista.pontos} pts
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {conquista.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {conquista.descricao}
                </p>
                
                {conquista.status === 'em_progresso' && conquista.progresso && conquista.progressoMax && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-medium">
                        {conquista.progresso}/{conquista.progressoMax}
                      </span>
                    </div>
                    <Progress 
                      value={(conquista.progresso / conquista.progressoMax) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                
                {conquista.status === 'conquistada' && conquista.dataConquista && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Conquistada em {conquista.dataConquista}
                  </div>
                )}
                
                <div className="mt-3">
                  {getStatusBadge(conquista.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de Detalhes */}
        <Dialog 
          open={!!conquistaSelecionada} 
          onOpenChange={() => setConquistaSelecionada(null)}
        >
          <DialogContent className="max-w-md">
            {conquistaSelecionada && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      conquistaSelecionada.status === 'conquistada' ? 'bg-green-100' :
                      conquistaSelecionada.status === 'em_progresso' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      <div className={conquistaSelecionada.cor}>
                        {conquistaSelecionada.icone}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{conquistaSelecionada.titulo}</h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {conquistaSelecionada.pontos} pontos
                      </Badge>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 mb-3">
                      {conquistaSelecionada.descricao}
                    </p>
                    {getStatusBadge(conquistaSelecionada.status)}
                  </div>
                  
                  {conquistaSelecionada.status === 'em_progresso' && 
                   conquistaSelecionada.progresso && 
                   conquistaSelecionada.progressoMax && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Progresso Atual</span>
                        <span>
                          {conquistaSelecionada.progresso}/{conquistaSelecionada.progressoMax}
                        </span>
                      </div>
                      <Progress 
                        value={(conquistaSelecionada.progresso / conquistaSelecionada.progressoMax) * 100} 
                        className="h-3"
                      />
                      <p className="text-xs text-gray-500">
                        {Math.round((conquistaSelecionada.progresso / conquistaSelecionada.progressoMax) * 100)}% concluído
                      </p>
                    </div>
                  )}
                  
                  {conquistaSelecionada.dataConquista && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Conquistada!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Desbloqueada em {conquistaSelecionada.dataConquista}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requisitos:</h4>
                    <ul className="space-y-1">
                      {conquistaSelecionada.requisitos.map((requisito, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          {requisito}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Conquistas;