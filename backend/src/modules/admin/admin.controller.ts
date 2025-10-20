import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '../usuarios/entities/usuario.entity';

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

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PerfilUsuario.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== DASHBOARD ENDPOINTS ====================

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Obter estatísticas gerais do dashboard' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso', type: DashboardStatsDto })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/tenants')
  @ApiOperation({ summary: 'Obter estatísticas de todos os tenants' })
  @ApiResponse({ status: 200, description: 'Estatísticas dos tenants obtidas com sucesso', type: [TenantStatsDto] })
  async getTenantStats(): Promise<TenantStatsDto[]> {
    return this.adminService.getTenantStats();
  }

  @Get('dashboard/health')
  @ApiOperation({ summary: 'Verificar saúde do sistema' })
  @ApiResponse({ status: 200, description: 'Status de saúde obtido com sucesso', type: SystemHealthDto })
  async getSystemHealth(): Promise<SystemHealthDto> {
    return this.adminService.getSystemHealth();
  }

  @Get('dashboard/revenue')
  @ApiOperation({ summary: 'Obter dados de receita para gráficos' })
  @ApiResponse({ status: 200, description: 'Dados de receita obtidos com sucesso', type: [RevenueChartDto] })
  async getRevenueChart(@Query('months') months?: number): Promise<RevenueChartDto[]> {
    return this.adminService.getRevenueChart(months);
  }

  @Get('dashboard/top-tenants')
  @ApiOperation({ summary: 'Obter top tenants por receita' })
  @ApiResponse({ status: 200, description: 'Top tenants obtidos com sucesso', type: [TopTenantsDto] })
  async getTopTenants(@Query('limit') limit?: number): Promise<TopTenantsDto[]> {
    return this.adminService.getTopTenants(limit);
  }

  // ==================== ADMIN ACTIONS ENDPOINTS ====================

  @Post('impersonate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Impersonar um usuário' })
  @ApiResponse({ status: 200, description: 'Impersonação realizada com sucesso' })
  async impersonateUser(@Body() dto: ImpersonateUserDto, @Request() req): Promise<{ token: string }> {
    return this.adminService.impersonateUser(dto, req.user.id);
  }

  @Post('tenants/bulk-action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Executar ação em massa em tenants' })
  @ApiResponse({ status: 200, description: 'Ação em massa executada com sucesso' })
  async bulkTenantAction(
    @Body() dto: BulkTenantActionDto,
    @Request() req,
  ): Promise<{ success: number; errors: string[] }> {
    return this.adminService.bulkTenantAction(dto, req.user.id);
  }

  @Post('users/bulk-action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Executar ação em massa em usuários' })
  @ApiResponse({ status: 200, description: 'Ação em massa executada com sucesso' })
  async bulkUserAction(
    @Body() dto: BulkUserActionDto,
    @Request() req,
  ): Promise<{ success: number; errors: string[] }> {
    return this.adminService.bulkUserAction(dto, req.user.id);
  }

  @Put('tenants/:id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualizar status de um tenant' })
  @ApiResponse({ status: 204, description: 'Status atualizado com sucesso' })
  async updateTenantStatus(
    @Param('id') tenantId: string,
    @Body() dto: UpdateTenantStatusDto,
    @Request() req,
  ): Promise<void> {
    return this.adminService.updateTenantStatus(tenantId, dto, req.user.id);
  }

  @Post('super-admin')
  @ApiOperation({ summary: 'Criar novo super admin' })
  @ApiResponse({ status: 201, description: 'Super admin criado com sucesso' })
  async createSuperAdmin(@Body() dto: CreateSuperAdminDto, @Request() req) {
    const user = await this.adminService.createSuperAdmin(dto, req.user.id);
    // Remover senha da resposta
    const { senhaHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ==================== SYSTEM CONFIGURATION ENDPOINTS ====================

  @Get('system/configurations')
  @ApiOperation({ summary: 'Obter configurações globais do sistema' })
  @ApiResponse({ status: 200, description: 'Configurações obtidas com sucesso' })
  async getSystemConfigurations() {
    return this.adminService.getSystemConfigurations();
  }

  @Post('system/configurations')
  @ApiOperation({ summary: 'Criar ou atualizar configuração do sistema' })
  @ApiResponse({ status: 201, description: 'Configuração salva com sucesso' })
  async updateSystemConfiguration(@Body() dto: SystemConfigurationDto, @Request() req) {
    return this.adminService.updateSystemConfiguration(dto, req.user.id);
  }

  // ==================== AUDIT LOGS ENDPOINTS ====================

  @Get('audit-logs')
  @ApiOperation({ summary: 'Obter logs de auditoria' })
  @ApiResponse({ status: 200, description: 'Logs de auditoria obtidos com sucesso' })
  async getAuditLogs(@Query() filter: AuditLogFilterDto) {
    return this.adminService.getAuditLogs(filter);
  }

  // ==================== HEALTH CHECK ENDPOINT ====================

  @Get('health')
  @ApiOperation({ summary: 'Health check do módulo admin' })
  @ApiResponse({ status: 200, description: 'Módulo admin funcionando corretamente' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      module: 'admin',
      version: '1.0.0',
    };
  }
}