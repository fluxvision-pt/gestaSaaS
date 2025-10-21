import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  Request,
  Response,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaFilterDto } from './dto/create-auditoria.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TipoAcao, NivelRisco, StatusAuditoria } from './entities/auditoria.entity';

@Controller('auditoria')
@UseGuards(JwtAuthGuard)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('usuarioId') usuarioId?: string,
    @Query('acao') acao?: TipoAcao,
    @Query('tabela') tabela?: string,
    @Query('modulo') modulo?: string,
    @Query('nivelRisco') nivelRisco?: NivelRisco,
    @Query('status') status?: StatusAuditoria,
    @Query('ipAddress') ipAddress?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('busca') busca?: string,
  ) {
    const filters: AuditoriaFilterDto = {
      usuarioId,
      acao,
      tabela,
      modulo,
      nivelRisco,
      status,
      ipAddress,
      dataInicial: dataInicio ? dataInicio : undefined,
      dataFinal: dataFim ? dataFim : undefined,
      busca: busca ? busca : undefined,
    };

    return this.auditoriaService.findAll(
      req.user.tenantId,
      filters,
      page,
      limit,
    );
  }

  @Get('statistics')
  async getStatistics(
    @Request() req,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.auditoriaService.getStatistics(req.user.tenantId, days);
  }

  @Get('security-alerts')
  async getSecurityAlerts(
    @Request() req,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.auditoriaService.getSecurityAlerts(req.user.tenantId, limit);
  }

  @Get('export')
  async exportLogs(
    @Request() req,
    @Response() res: ExpressResponse,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Query('usuarioId') usuarioId?: string,
    @Query('acao') acao?: TipoAcao,
    @Query('tabela') tabela?: string,
    @Query('modulo') modulo?: string,
    @Query('nivelRisco') nivelRisco?: NivelRisco,
    @Query('status') status?: StatusAuditoria,
    @Query('ipAddress') ipAddress?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('busca') busca?: string,
  ) {
    const filters: AuditoriaFilterDto = {
      usuarioId,
      acao,
      tabela,
      modulo,
      nivelRisco,
      status,
      ipAddress,
      dataInicial: dataInicio ? dataInicio : undefined,
      dataFinal: dataFim ? dataFim : undefined,
      busca: busca ? busca : undefined,
    };

    const data = await this.auditoriaService.exportAuditLogs(
      req.user.tenantId,
      filters,
      format,
    );

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `auditoria_${timestamp}.${format}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(HttpStatus.OK).send(data);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(HttpStatus.OK).json(data);
    }
  }

  @Get('enums')
  getEnums() {
    return {
      tipoAcao: Object.values(TipoAcao),
      nivelRisco: Object.values(NivelRisco),
      statusAuditoria: Object.values(StatusAuditoria),
    };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.auditoriaService.findOne(id, req.user.tenantId);
  }

  @Post('cleanup')
  async cleanupOldLogs(
    @Request() req,
    @Query('days', new DefaultValuePipe(90), ParseIntPipe) days: number,
  ) {
    const deletedCount = await this.auditoriaService.deleteOldLogs(
      req.user.tenantId,
      days,
    );

    return {
      message: `${deletedCount} registros antigos foram removidos`,
      deletedCount,
      daysKept: days,
    };
  }
}