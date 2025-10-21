import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// Entities
import { Usuario, PerfilUsuario, StatusUsuario } from '../usuarios/entities/usuario.entity';
import { Tenant, StatusTenant } from '../tenancy/entities/tenant.entity';
import { Plano } from '../planos/entities/plano.entity';
import { Assinatura, StatusAssinatura } from '../assinaturas/entities/assinatura.entity';
import { Transacao } from '../financeiro/entities/transacao.entity';
import { Pagamento } from '../pagamentos/entities/pagamento.entity';
import { KmDiario } from '../km/entities/km-diario.entity';
import { Auditoria, TipoAcao, StatusAuditoria } from '../auditoria/entities/auditoria.entity';
import { Configuracao } from '../configuracoes/entities/configuracao.entity';

// DTOs
import {
  DashboardStatsDto,
  TenantStatsDto,
  SystemHealthDto,
  RevenueChartDto,
  TopTenantsDto,
  ImpersonateUserDto,
  BulkTenantActionDto,
  BulkUserActionDto,
  UpdateTenantStatusDto,
  CreateSuperAdminDto,
  SystemConfigurationDto,
  AuditLogFilterDto,
} from './dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
    @InjectRepository(Assinatura)
    private assinaturaRepository: Repository<Assinatura>,
    @InjectRepository(Transacao)
    private transacaoRepository: Repository<Transacao>,
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>,
    @InjectRepository(KmDiario)
    private kmDiarioRepository: Repository<KmDiario>,
    @InjectRepository(Auditoria)
    private auditoriaRepository: Repository<Auditoria>,
    @InjectRepository(Configuracao)
    private configuracaoRepository: Repository<Configuracao>,
  ) {}

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalTenants,
      totalUsuarios,
      assinaturasAtivas,
      assinaturasCanceladas,
      receitaTotal,
      receitaMesAtual,
      totalTransacoes,
      totalKmRegistrados,
      novosTenants30Dias,
      novosUsuarios30Dias,
    ] = await Promise.all([
      this.tenantRepository.count(),
      this.usuarioRepository.count(),
      this.assinaturaRepository.count({ where: { status: StatusAssinatura.ATIVA } }),
      this.assinaturaRepository.count({ where: { status: StatusAssinatura.CANCELADA } }),
      this.getReceitaTotal(),
      this.getReceitaPeriodo(startOfMonth, endOfMonth),
      this.transacaoRepository.count(),
      this.getTotalKmRegistrados(),
      this.tenantRepository.count({ where: { criadoEm: MoreThan(thirtyDaysAgo) } }),
      this.usuarioRepository.count({ where: { criadoEm: MoreThan(thirtyDaysAgo) } }),
    ]);

    return {
      totalTenants,
      totalUsuarios,
      assinaturasAtivas,
      assinaturasCanceladas,
      receitaTotal,
      receitaMesAtual,
      totalTransacoes,
      totalKmRegistrados,
      novosTenants30Dias,
      novosUsuarios30Dias,
    };
  }

  async getTenantStats(): Promise<TenantStatsDto[]> {
    const tenants = await this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.usuarios', 'usuario')
      .leftJoinAndSelect('tenant.assinaturas', 'assinatura')
      .leftJoinAndSelect('tenant.transacoes', 'transacao')
      .getMany();

    return tenants.map(tenant => ({
      id: tenant.id,
      nomeFantasia: tenant.nomeFantasia,
      status: tenant.status,
      totalUsuarios: tenant.usuarios?.length || 0,
      assinaturasAtivas: tenant.assinaturas?.filter(a => a.status === StatusAssinatura.ATIVA).length || 0,
      receitaTotal: tenant.transacoes?.reduce((sum, t) => sum + (t.valorCents || 0), 0) || 0,
      criadoEm: tenant.criadoEm,
      ultimaAtividade: this.getUltimaAtividade(tenant),
    }));
  }

  async getSystemHealth(): Promise<SystemHealthDto> {
    const startTime = process.hrtime();
    
    // Simular verificações de saúde
    const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const uptime = Math.round(process.uptime());
    
    // Verificar erros recentes
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const errors24h = await this.auditoriaRepository.count({
      where: {
        status: StatusAuditoria.FALHA,
        criadoEm: MoreThan(oneDayAgo),
      },
    });

    const endTime = process.hrtime(startTime);
    const avgResponseTime = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (errors24h > 100 || memoryUsage > 1000) status = 'warning';
    if (errors24h > 500 || memoryUsage > 2000) status = 'critical';

    return {
      status,
      uptime,
      memoryUsage,
      version: process.env.npm_package_version || '1.0.0',
      dbConnections: 10, // Placeholder - implementar verificação real
      avgResponseTime,
      errors24h,
    };
  }

  async getRevenueChart(months: number = 12): Promise<RevenueChartDto[]> {
    const result = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [revenue, activeSubscriptions, newTenants] = await Promise.all([
        this.getReceitaPeriodo(startOfMonth, endOfMonth),
        this.assinaturaRepository.count({
          where: {
            status: StatusAssinatura.ATIVA,
            criadoEm: Between(startOfMonth, endOfMonth),
          },
        }),
        this.tenantRepository.count({
          where: {
            criadoEm: Between(startOfMonth, endOfMonth),
          },
        }),
      ]);

      result.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        revenue,
        activeSubscriptions,
        newTenants,
      });
    }

    return result;
  }

  async getTopTenants(limit: number = 10): Promise<TopTenantsDto[]> {
    const tenants = await this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoin('tenant.usuarios', 'usuario')
      .leftJoin('tenant.transacoes', 'transacao')
      .leftJoin('tenant.kmDiarios', 'km')
      .select([
        'tenant.id',
        'tenant.nomeFantasia',
        'tenant.status',
        'COUNT(DISTINCT usuario.id) as totalUsuarios',
        'COALESCE(SUM(transacao.valorCents), 0) as receitaTotal',
        'COALESCE(SUM(km.kmPercorrido), 0) as totalKm',
      ])
      .groupBy('tenant.id')
      .orderBy('receitaTotal', 'DESC')
      .limit(limit)
      .getRawMany();

    return tenants.map(tenant => ({
      id: tenant.tenant_id,
      nomeFantasia: tenant.tenant_nomeFantasia,
      status: tenant.tenant_status,
      totalUsuarios: parseInt(tenant.totalUsuarios) || 0,
      receitaTotal: parseInt(tenant.receitaTotal) || 0,
      totalKm: parseInt(tenant.totalKm) || 0,
    }));
  }

  // ==================== ADMIN ACTIONS ====================

  async impersonateUser(dto: ImpersonateUserDto, adminId: string): Promise<{ token: string }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: dto.usuarioId },
      relations: ['tenant'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Registrar auditoria
    await this.registrarAuditoria(
      TipoAcao.LOGIN,
      adminId,
      null,
      `Impersonação do usuário ${usuario.email}`,
      { usuarioId: dto.usuarioId, motivo: dto.motivo },
    );

    // Aqui você implementaria a lógica de geração de token
    // Por enquanto, retornamos um placeholder
    return { token: 'impersonation_token_placeholder' };
  }

  async bulkTenantAction(dto: BulkTenantActionDto, adminId: string): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const tenantId of dto.tenantIds) {
      try {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) {
          errors.push(`Tenant ${tenantId} não encontrado`);
          continue;
        }

        let newStatus: StatusTenant;
        switch (dto.action) {
          case 'suspend':
            newStatus = StatusTenant.SUSPENSO;
            break;
          case 'activate':
            newStatus = StatusTenant.ATIVO;
            break;
          case 'cancel':
            newStatus = StatusTenant.CANCELADO;
            break;
        }

        await this.tenantRepository.update(tenantId, { status: newStatus });
        
        await this.registrarAuditoria(
          TipoAcao.UPDATE,
          adminId,
          tenantId,
          `Ação em massa: ${dto.action}`,
          { action: dto.action, motivo: dto.motivo },
        );

        success++;
      } catch (error) {
        errors.push(`Erro no tenant ${tenantId}: ${error.message}`);
      }
    }

    return { success, errors };
  }

  async bulkUserAction(dto: BulkUserActionDto, adminId: string): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const usuarioId of dto.usuarioIds) {
      try {
        const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
        if (!usuario) {
          errors.push(`Usuário ${usuarioId} não encontrado`);
          continue;
        }

        switch (dto.action) {
          case 'activate':
            await this.usuarioRepository.update(usuarioId, { status: StatusUsuario.ATIVO });
            break;
          case 'deactivate':
            await this.usuarioRepository.update(usuarioId, { status: StatusUsuario.INATIVO });
            break;
          case 'reset_password':
            // Implementar reset de senha
            break;
        }

        await this.registrarAuditoria(
          TipoAcao.UPDATE,
          adminId,
          usuario.tenantId,
          `Ação em massa: ${dto.action}`,
          { action: dto.action, usuarioId, motivo: dto.motivo },
        );

        success++;
      } catch (error) {
        errors.push(`Erro no usuário ${usuarioId}: ${error.message}`);
      }
    }

    return { success, errors };
  }

  async updateTenantStatus(tenantId: string, dto: UpdateTenantStatusDto, adminId: string): Promise<void> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    await this.tenantRepository.update(tenantId, { status: dto.status });

    await this.registrarAuditoria(
      TipoAcao.UPDATE,
      adminId,
      tenantId,
      `Status alterado para ${dto.status}`,
      { oldStatus: tenant.status, newStatus: dto.status, motivo: dto.motivo },
    );
  }

  async createSuperAdmin(dto: CreateSuperAdminDto, adminId: string): Promise<Usuario> {
    const existingUser = await this.usuarioRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(dto.senha, 10);

    const superAdmin = this.usuarioRepository.create({
      nome: dto.nome,
      email: dto.email,
      senhaHash: hashedPassword,
      perfil: PerfilUsuario.SUPER_ADMIN,
      status: StatusUsuario.ATIVO,
      tenantId: null, // Super admin não pertence a nenhum tenant
    });

    const savedUser = await this.usuarioRepository.save(superAdmin);

    await this.registrarAuditoria(
      TipoAcao.CREATE,
      adminId,
      null,
      `Super admin criado: ${dto.email}`,
      { email: dto.email, forcarTrocaSenha: dto.forcarTrocaSenha },
    );

    return savedUser;
  }

  // ==================== SYSTEM CONFIGURATION ====================

  async getSystemConfigurations(): Promise<Configuracao[]> {
    return this.configuracaoRepository.find({
      where: { tenantId: null }, // Configurações globais
      order: { chave: 'ASC' },
    });
  }

  async updateSystemConfiguration(dto: SystemConfigurationDto, adminId: string): Promise<Configuracao> {
    let config = await this.configuracaoRepository.findOne({
      where: { chave: dto.chave, tenantId: null },
    });

    if (config) {
      config.valor = dto.valor;
    } else {
      config = this.configuracaoRepository.create({
        chave: dto.chave,
        valor: dto.valor,
        tenantId: null,
      });
    }

    const savedConfig = await this.configuracaoRepository.save(config);

    await this.registrarAuditoria(
      TipoAcao.CONFIG_CHANGE,
      adminId,
      null,
      `Configuração ${dto.chave} atualizada`,
      { chave: dto.chave, valor: dto.valor },
    );

    return savedConfig;
  }

  // ==================== AUDIT LOGS ====================

  async getAuditLogs(filter: AuditLogFilterDto): Promise<{ data: Auditoria[]; total: number }> {
    const queryBuilder = this.auditoriaRepository.createQueryBuilder('auditoria')
      .leftJoinAndSelect('auditoria.usuario', 'usuario')
      .leftJoinAndSelect('auditoria.tenant', 'tenant');

    if (filter.tenantId) {
      queryBuilder.andWhere('auditoria.tenantId = :tenantId', { tenantId: filter.tenantId });
    }

    if (filter.usuarioId) {
      queryBuilder.andWhere('auditoria.usuarioId = :usuarioId', { usuarioId: filter.usuarioId });
    }

    if (filter.acao) {
      queryBuilder.andWhere('auditoria.acao ILIKE :acao', { acao: `%${filter.acao}%` });
    }

    if (filter.dataInicial) {
      queryBuilder.andWhere('auditoria.criadoEm >= :dataInicial', { dataInicial: filter.dataInicial });
    }

    if (filter.dataFinal) {
      queryBuilder.andWhere('auditoria.criadoEm <= :dataFinal', { dataFinal: filter.dataFinal });
    }

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder
      .orderBy('auditoria.criadoEm', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  // ==================== HELPER METHODS ====================

  private async getReceitaTotal(): Promise<number> {
    const result = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valorCents)', 'total')
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  private async getReceitaPeriodo(inicio: Date, fim: Date): Promise<number> {
    const result = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valorCents)', 'total')
      .where('transacao.criadoEm BETWEEN :inicio AND :fim', { inicio, fim })
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  private async getTotalKmRegistrados(): Promise<number> {
    const result = await this.kmDiarioRepository
      .createQueryBuilder('km')
      .select('SUM(km.kmPercorrido)', 'total')
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  private getUltimaAtividade(tenant: Tenant): Date {
    // Implementar lógica para determinar última atividade
    // Por enquanto, retorna a data de criação
    return tenant.criadoEm;
  }

  private async registrarAuditoria(
    acao: TipoAcao,
    usuarioId: string,
    tenantId: string | null,
    descricao: string,
    detalhes?: any,
  ): Promise<void> {
    const auditoria = this.auditoriaRepository.create({
      acao,
      tenantId,
      usuarioId,
      descricao,
      tabela: 'admin_actions',
      metadados: detalhes || null,
    });

    await this.auditoriaRepository.save(auditoria);
  }
}