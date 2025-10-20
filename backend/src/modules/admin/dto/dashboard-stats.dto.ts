import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total de empresas (tenants) no sistema' })
  totalTenants: number;

  @ApiProperty({ description: 'Total de usuários no sistema' })
  totalUsuarios: number;

  @ApiProperty({ description: 'Total de assinaturas ativas' })
  assinaturasAtivas: number;

  @ApiProperty({ description: 'Total de assinaturas canceladas' })
  assinaturasCanceladas: number;

  @ApiProperty({ description: 'Receita total em centavos' })
  receitaTotal: number;

  @ApiProperty({ description: 'Receita do mês atual em centavos' })
  receitaMesAtual: number;

  @ApiProperty({ description: 'Total de transações' })
  totalTransacoes: number;

  @ApiProperty({ description: 'Total de KM registrados' })
  totalKmRegistrados: number;

  @ApiProperty({ description: 'Empresas criadas nos últimos 30 dias' })
  novosTenants30Dias: number;

  @ApiProperty({ description: 'Usuários criados nos últimos 30 dias' })
  novosUsuarios30Dias: number;
}

export class TenantStatsDto {
  @ApiProperty({ description: 'ID do tenant' })
  id: string;

  @ApiProperty({ description: 'Nome fantasia da empresa' })
  nomeFantasia: string;

  @ApiProperty({ description: 'Status do tenant' })
  status: string;

  @ApiProperty({ description: 'Total de usuários' })
  totalUsuarios: number;

  @ApiProperty({ description: 'Assinaturas ativas' })
  assinaturasAtivas: number;

  @ApiProperty({ description: 'Receita total em centavos' })
  receitaTotal: number;

  @ApiProperty({ description: 'Data de criação' })
  criadoEm: Date;

  @ApiProperty({ description: 'Última atividade' })
  ultimaAtividade: Date;
}

export class SystemHealthDto {
  @ApiProperty({ description: 'Status geral do sistema' })
  status: 'healthy' | 'warning' | 'critical';

  @ApiProperty({ description: 'Uptime do sistema em segundos' })
  uptime: number;

  @ApiProperty({ description: 'Uso de memória em MB' })
  memoryUsage: number;

  @ApiProperty({ description: 'Versão da aplicação' })
  version: string;

  @ApiProperty({ description: 'Número de conexões ativas no banco' })
  dbConnections: number;

  @ApiProperty({ description: 'Tempo de resposta médio da API em ms' })
  avgResponseTime: number;

  @ApiProperty({ description: 'Erros nas últimas 24 horas' })
  errors24h: number;
}

export class RevenueChartDto {
  @ApiProperty({ description: 'Mês (YYYY-MM)' })
  month: string;

  @ApiProperty({ description: 'Receita do mês em centavos' })
  revenue: number;

  @ApiProperty({ description: 'Número de assinaturas ativas no mês' })
  activeSubscriptions: number;

  @ApiProperty({ description: 'Novos tenants no mês' })
  newTenants: number;
}

export class TopTenantsDto {
  @ApiProperty({ description: 'ID do tenant' })
  id: string;

  @ApiProperty({ description: 'Nome fantasia' })
  nomeFantasia: string;

  @ApiProperty({ description: 'Receita total em centavos' })
  receitaTotal: number;

  @ApiProperty({ description: 'Total de usuários' })
  totalUsuarios: number;

  @ApiProperty({ description: 'Total de KM registrados' })
  totalKm: number;

  @ApiProperty({ description: 'Status do tenant' })
  status: string;
}