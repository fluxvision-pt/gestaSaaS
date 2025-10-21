import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator,
  Target,
  Calendar,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnaliseRentabilidade = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('6meses');
  const [tipoAnalise, setTipoAnalise] = useState('completa');

  // Dados mockados para demonstração
  const dadosReceitas = [
    { mes: 'Jul', receitas: 8500, custos: 3200 },
    { mes: 'Ago', receitas: 9200, custos: 3800 },
    { mes: 'Set', receitas: 8800, custos: 3500 },
    { mes: 'Out', receitas: 9500, custos: 4100 },
    { mes: 'Nov', receitas: 10200, custos: 4300 },
    { mes: 'Dez', receitas: 11000, custos: 4800 }
  ];

  const dadosCustos = [
    { nome: 'Combustível', valor: 1800, cor: '#ef4444' },
    { nome: 'Manutenção', valor: 1200, cor: '#f97316' },
    { nome: 'Depreciação', valor: 1000, cor: '#eab308' },
    { nome: 'Outros', valor: 800, cor: '#6b7280' }
  ];

  const rentabilidadeMensal = [
    { mes: 'Julho', receita: 8500, custos: 3200, lucro: 5300, roi: 165.6 },
    { mes: 'Agosto', receita: 9200, custos: 3800, lucro: 5400, roi: 142.1 },
    { mes: 'Setembro', receita: 8800, custos: 3500, lucro: 5300, roi: 151.4 },
    { mes: 'Outubro', receita: 9500, custos: 4100, lucro: 5400, roi: 131.7 },
    { mes: 'Novembro', receita: 10200, custos: 4300, lucro: 5900, roi: 137.2 },
    { mes: 'Dezembro', receita: 11000, custos: 4800, lucro: 6200, roi: 129.2 }
  ];

  const projecoes = [
    { mes: 'Janeiro', receitaProjetada: 11500, custosProjetados: 5000, lucroProjetado: 6500 },
    { mes: 'Fevereiro', receitaProjetada: 12000, custosProjetados: 5200, lucroProjetado: 6800 },
    { mes: 'Março', receitaProjetada: 12500, custosProjetados: 5400, lucroProjetado: 7100 }
  ];

  // Cálculos dos KPIs
  const receitaTotal = dadosReceitas.reduce((acc, item) => acc + item.receitas, 0);
  const custosTotal = dadosReceitas.reduce((acc, item) => acc + item.custos, 0);
  const lucroLiquido = receitaTotal - custosTotal;
  const roi = ((lucroLiquido / custosTotal) * 100);

  const veiculo = {
    id: id,
    marca: 'Honda',
    modelo: 'Civic',
    placa: 'ABC-1234'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/veiculos')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Análise de Rentabilidade
              </h1>
              <p className="text-gray-600">
                {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtros:</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3meses">Últimos 3 meses</SelectItem>
                    <SelectItem value="6meses">Últimos 6 meses</SelectItem>
                    <SelectItem value="12meses">Últimos 12 meses</SelectItem>
                    <SelectItem value="ano">Este ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <Select value={tipoAnalise} onValueChange={setTipoAnalise}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completa">Análise Completa</SelectItem>
                    <SelectItem value="receitas">Apenas Receitas</SelectItem>
                    <SelectItem value="custos">Apenas Custos</SelectItem>
                    <SelectItem value="comparativa">Comparativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {receitaTotal.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5% vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Custos Totais</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {custosTotal.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">+8.3% vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {lucroLiquido.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15.2% vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ROI</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {roi.toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+5.8% vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico Receitas vs Custos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Receitas vs Custos (Mensal)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosReceitas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="receitas" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Receitas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="custos" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Custos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Breakdown de Custos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Breakdown de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosCustos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {dadosCustos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {dadosCustos.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.cor }}
                      />
                      <span className="text-sm text-gray-600">{item.nome}</span>
                    </div>
                    <span className="text-sm font-medium">
                      R$ {item.valor.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Rentabilidade Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidade Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Mês</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Receita</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Custos</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Lucro</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">ROI (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {rentabilidadeMensal.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.mes}</td>
                      <td className="py-3 px-4 text-right text-green-600">
                        R$ {item.receita.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600">
                        R$ {item.custos.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-600 font-medium">
                        R$ {item.lucro.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={item.roi > 140 ? "default" : "secondary"}>
                          {item.roi.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Projeções Futuras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Projeções Futuras (Baseado no Histórico)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {projecoes.map((item, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">{item.mes}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Receita:</span>
                      <span className="text-green-600 font-medium">
                        R$ {item.receitaProjetada.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custos:</span>
                      <span className="text-red-600 font-medium">
                        R$ {item.custosProjetados.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-gray-600">Lucro:</span>
                      <span className="text-blue-600 font-medium">
                        R$ {item.lucroProjetado.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> As projeções são baseadas na média dos últimos 6 meses e 
                tendências identificadas. Considere fatores externos que podem impactar os resultados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnaliseRentabilidade;