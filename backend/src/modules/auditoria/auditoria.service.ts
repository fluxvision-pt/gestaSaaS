import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Like } from 'typeorm';
import { Auditoria, TipoAcao, NivelRisco, StatusAuditoria } from './entities/auditoria.entity';
import { CreateAuditoriaDto, AuditoriaFilterDto } from './dto/create-auditoria.dto';

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(Auditoria)
    private auditoriaRepository: Repository<Auditoria>,
  ) {}

  async create(createAuditoriaDto: CreateAuditoriaDto): Promise<Auditoria> {
    try {
      const auditoria = this.auditoriaRepository.create(createAuditoriaDto);
      return await this.auditoriaRepository.save(auditoria);
    } catch (error) {
      this.logger.error('Erro ao criar registro de auditoria:', error);
      throw error;
    }
  }

  async findAll(
    tenantId: string,
    filters: AuditoriaFilterDto = {},
    page: number = 1,
    limit: number = 50,
  ) {
    const queryBuilder = this.auditoriaRepository
      .createQueryBuilder('auditoria')
      .where('auditoria.tenantId = :tenantId', { tenantId })
      .orderBy('auditoria.criadoEm', 'DESC');

    // Aplicar filtros
    if (filters.usuarioId) {
      queryBuilder.andWhere('auditoria.usuarioId = :usuarioId', {
        usuarioId: filters.usuarioId,
      });
    }

    if (filters.acao) {
      queryBuilder.andWhere('auditoria.acao = :acao', { acao: filters.acao });
    }

    if (filters.tabela) {
      queryBuilder.andWhere('auditoria.tabela = :tabela', {
        tabela: filters.tabela,
      });
    }

    if (filters.modulo) {
      queryBuilder.andWhere('auditoria.modulo = :modulo', {
        modulo: filters.modulo,
      });
    }

    if (filters.nivelRisco) {
      queryBuilder.andWhere('auditoria.nivelRisco = :nivelRisco', {
        nivelRisco: filters.nivelRisco,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('auditoria.status = :status', {
        status: filters.status,
      });
    }

    if (filters.ipAddress) {
      queryBuilder.andWhere('auditoria.ipAddress = :ipAddress', {
        ipAddress: filters.ipAddress,
      });
    }

    if (filters.dataInicial && filters.dataFinal) {
      queryBuilder.andWhere('auditoria.criadoEm BETWEEN :dataInicial AND :dataFinal', {
        dataInicial: new Date(filters.dataInicial),
        dataFinal: new Date(filters.dataFinal),
      });
    }

    if (filters.busca) {
      queryBuilder.andWhere(
        '(auditoria.descricao LIKE :busca OR auditoria.usuarioNome LIKE :busca OR auditoria.usuarioEmail LIKE :busca)',
        { busca: `%${filters.busca}%` },
      );
    }

    // Paginação
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, tenantId: string): Promise<Auditoria> {
    return this.auditoriaRepository.findOne({
      where: { id, tenantId },
    });
  }

  async getStatistics(tenantId: string, days: number = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - days);

    const queryBuilder = this.auditoriaRepository
      .createQueryBuilder('auditoria')
      .where('auditoria.tenantId = :tenantId', { tenantId })
      .andWhere('auditoria.criadoEm >= :dataInicio', { dataInicio });

    // Total de ações
    const totalAcoes = await queryBuilder.getCount();

    // Ações por tipo
    const acoesPorTipo = await queryBuilder
      .select('auditoria.acao', 'acao')
      .addSelect('COUNT(*)', 'total')
      .groupBy('auditoria.acao')
      .getRawMany();

    // Ações por nível de risco
    const acoesPorRisco = await queryBuilder
      .select('auditoria.nivelRisco', 'nivelRisco')
      .addSelect('COUNT(*)', 'total')
      .groupBy('auditoria.nivelRisco')
      .getRawMany();

    // Ações por status
    const acoesPorStatus = await queryBuilder
      .select('auditoria.status', 'status')
      .addSelect('COUNT(*)', 'total')
      .groupBy('auditoria.status')
      .getRawMany();

    // Usuários mais ativos
    const usuariosMaisAtivos = await queryBuilder
      .select('auditoria.usuarioNome', 'usuarioNome')
      .addSelect('auditoria.usuarioEmail', 'usuarioEmail')
      .addSelect('COUNT(*)', 'total')
      .where('auditoria.usuarioId IS NOT NULL')
      .groupBy('auditoria.usuarioId, auditoria.usuarioNome, auditoria.usuarioEmail')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    // Módulos mais acessados
    const modulosMaisAcessados = await queryBuilder
      .select('auditoria.modulo', 'modulo')
      .addSelect('COUNT(*)', 'total')
      .where('auditoria.modulo IS NOT NULL')
      .groupBy('auditoria.modulo')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    // IPs mais ativos
    const ipsMaisAtivos = await queryBuilder
      .select('auditoria.ipAddress', 'ipAddress')
      .addSelect('COUNT(*)', 'total')
      .where('auditoria.ipAddress IS NOT NULL')
      .groupBy('auditoria.ipAddress')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    // Atividade por dia (últimos 30 dias)
    const atividadePorDia = await queryBuilder
      .select("DATE(auditoria.criadoEm)", 'data')
      .addSelect('COUNT(*)', 'total')
      .groupBy("DATE(auditoria.criadoEm)")
      .orderBy("DATE(auditoria.criadoEm)", 'ASC')
      .getRawMany();

    return {
      totalAcoes,
      acoesPorTipo,
      acoesPorRisco,
      acoesPorStatus,
      usuariosMaisAtivos,
      modulosMaisAcessados,
      ipsMaisAtivos,
      atividadePorDia,
      periodo: {
        dataInicio,
        dataFim: new Date(),
        dias: days,
      },
    };
  }

  async getSecurityAlerts(tenantId: string, limit: number = 50) {
    // Buscar atividades suspeitas
    const alertas = [];

    // 1. Múltiplas tentativas de login falhadas
    const tentativasLoginFalhadas = await this.auditoriaRepository
      .createQueryBuilder('auditoria')
      .select('auditoria.ipAddress', 'ipAddress')
      .addSelect('auditoria.usuarioEmail', 'usuarioEmail')
      .addSelect('COUNT(*)', 'tentativas')
      .addSelect('MAX(auditoria.criadoEm)', 'ultimaTentativa')
      .where('auditoria.tenantId = :tenantId', { tenantId })
      .andWhere('auditoria.endpoint LIKE :endpoint', { endpoint: '%/auth/login%' })
      .andWhere('auditoria.status = :status', { status: StatusAuditoria.FALHA })
      .andWhere('auditoria.criadoEm >= :dataInicio', {
        dataInicio: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
      })
      .groupBy('auditoria.ipAddress, auditoria.usuarioEmail')
      .having('COUNT(*) >= 5') // 5 ou mais tentativas
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    tentativasLoginFalhadas.forEach(item => {
      alertas.push({
        tipo: 'TENTATIVAS_LOGIN_FALHADAS',
        severidade: 'ALTA',
        descricao: `${item.tentativas} tentativas de login falhadas para ${item.usuarioEmail} do IP ${item.ipAddress}`,
        detalhes: item,
        criadoEm: item.ultimaTentativa,
      });
    });

    // 2. Acessos de IPs suspeitos (muitos IPs diferentes para o mesmo usuário)
    const acessosMultiplosIPs = await this.auditoriaRepository
      .createQueryBuilder('auditoria')
      .select('auditoria.usuarioEmail', 'usuarioEmail')
      .addSelect('COUNT(DISTINCT auditoria.ipAddress)', 'ipsDistintos')
      .addSelect('GROUP_CONCAT(DISTINCT auditoria.ipAddress)', 'ips')
      .where('auditoria.tenantId = :tenantId', { tenantId })
      .andWhere('auditoria.usuarioId IS NOT NULL')
      .andWhere('auditoria.criadoEm >= :dataInicio', {
        dataInicio: new Date(Date.now() - 24 * 60 * 60 * 1000),
      })
      .groupBy('auditoria.usuarioEmail')
      .having('COUNT(DISTINCT auditoria.ipAddress) >= 5') // 5 ou mais IPs diferentes
      .getRawMany();

    acessosMultiplosIPs.forEach(item => {
      alertas.push({
        tipo: 'MULTIPLOS_IPS',
        severidade: 'MEDIA',
        descricao: `Usuário ${item.usuarioEmail} acessou de ${item.ipsDistintos} IPs diferentes`,
        detalhes: item,
        criadoEm: new Date(),
      });
    });

    // 3. Atividades de alto risco
    const atividadesAltoRisco = await this.auditoriaRepository.find({
      where: {
        tenantId,
        nivelRisco: In([NivelRisco.ALTO, NivelRisco.CRITICO]),
        criadoEm: Between(
          new Date(Date.now() - 24 * 60 * 60 * 1000),
          new Date(),
        ),
      },
      order: { criadoEm: 'DESC' },
      take: 20,
    });

    atividadesAltoRisco.forEach(item => {
      alertas.push({
        tipo: 'ATIVIDADE_ALTO_RISCO',
        severidade: item.nivelRisco === NivelRisco.CRITICO ? 'CRITICA' : 'ALTA',
        descricao: `Atividade de ${item.nivelRisco.toLowerCase()} risco: ${item.descricao}`,
        detalhes: item,
        criadoEm: item.criadoEm,
      });
    });

    // Ordenar por severidade e data
    const severidadeOrder = { 'CRITICA': 0, 'ALTA': 1, 'MEDIA': 2, 'BAIXA': 3 };
    alertas.sort((a, b) => {
      const severidadeDiff = severidadeOrder[a.severidade] - severidadeOrder[b.severidade];
      if (severidadeDiff !== 0) return severidadeDiff;
      return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
    });

    return alertas.slice(0, limit);
  }

  async exportAuditLogs(
    tenantId: string,
    filters: AuditoriaFilterDto = {},
    format: 'json' | 'csv' = 'json',
  ) {
    const queryBuilder = this.auditoriaRepository
      .createQueryBuilder('auditoria')
      .where('auditoria.tenantId = :tenantId', { tenantId })
      .orderBy('auditoria.criadoEm', 'DESC');

    // Aplicar os mesmos filtros do findAll
    if (filters.usuarioId) {
      queryBuilder.andWhere('auditoria.usuarioId = :usuarioId', {
        usuarioId: filters.usuarioId,
      });
    }

    if (filters.acao) {
      queryBuilder.andWhere('auditoria.acao = :acao', { acao: filters.acao });
    }

    if (filters.dataInicial && filters.dataFinal) {
      queryBuilder.andWhere('auditoria.criadoEm BETWEEN :dataInicial AND :dataFinal', {
        dataInicial: new Date(filters.dataInicial),
        dataFinal: new Date(filters.dataFinal),
      });
    }

    const logs = await queryBuilder.getMany();

    if (format === 'csv') {
      return this.convertToCSV(logs);
    }

    return logs;
  }

  private convertToCSV(logs: Auditoria[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'ID',
      'Data/Hora',
      'Usuário',
      'Email',
      'Ação',
      'Descrição',
      'Tabela',
      'Módulo',
      'IP',
      'Nível de Risco',
      'Status',
      'Código Resposta',
    ];

    const rows = logs.map(log => [
      log.id,
      log.criadoEm.toISOString(),
      log.usuarioNome || '',
      log.usuarioEmail || '',
      log.acao,
      log.descricao,
      log.tabela || '',
      log.modulo || '',
      log.ipAddress || '',
      log.nivelRisco,
      log.status,
      log.codigoResposta || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  async deleteOldLogs(tenantId: string, daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditoriaRepository.delete({
      tenantId,
      criadoEm: Between(new Date('1970-01-01'), cutoffDate),
    });

    this.logger.log(`Removidos ${result.affected} logs antigos do tenant ${tenantId}`);
    return result.affected || 0;
  }
}