import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RelatoriosService } from './relatorios.service';
import { AuditCreate } from '../modules/auditoria/decorators/audit.decorator';

export interface RelatorioFiltros {
  dataInicio?: string;
  dataFim?: string;
  tipo?: 'usuarios' | 'financeiro' | 'auditoria' | 'empresas' | 'assinaturas' | 'km' | 'todos';
  formato?: 'pdf' | 'excel' | 'csv' | 'json';
  incluirGraficos?: boolean;
  agrupamento?: 'dia' | 'semana' | 'mes' | 'ano';
  empresaId?: string;
  usuarioId?: string;
}

export interface RelatorioAgendado {
  nome: string;
  descricao?: string;
  filtros: RelatorioFiltros;
  frequencia: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual';
  proximaExecucao: Date;
  ativo: boolean;
  emailDestino?: string[];
}

@Controller('relatorios')
@UseGuards(JwtAuthGuard)
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('tipos')
  @AuditCreate('RELATORIO_TIPOS_LISTADOS')
  async getTiposRelatorio(@Request() req) {
    return this.relatoriosService.getTiposRelatorio(req.user.tenantId);
  }

  @Post('gerar')
  @AuditCreate('RELATORIO_GERADO')
  async gerarRelatorio(
    @Body() filtros: RelatorioFiltros,
    @Request() req,
    @Res() res: Response,
  ) {
    try {
      const resultado = await this.relatoriosService.gerarRelatorio(
        filtros,
        req.user.tenantId,
        req.user.id,
      );

      if (filtros.formato === 'json') {
        return res.json(resultado);
      }

      // Para outros formatos, retornar como arquivo
      const filename = `relatorio_${filtros.tipo || 'geral'}_${new Date().toISOString().split('T')[0]}.${filtros.formato}`;
      
      res.setHeader('Content-Type', this.getContentType(filtros.formato));
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      return res.send(resultado);
    } catch (error) {
      throw new HttpException(
        `Erro ao gerar relatório: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dashboard')
  @AuditCreate('DASHBOARD_RELATORIOS_ACESSADO')
  async getDashboardData(@Request() req, @Query() query: any) {
    const { periodo = '30' } = query;
    return this.relatoriosService.getDashboardData(req.user.tenantId, parseInt(periodo));
  }

  @Get('estatisticas')
  @AuditCreate('ESTATISTICAS_RELATORIOS_ACESSADAS')
  async getEstatisticas(@Request() req, @Query() query: any) {
    const { tipo, dataInicio, dataFim } = query;
    return this.relatoriosService.getEstatisticas(
      req.user.tenantId,
      tipo,
      dataInicio,
      dataFim,
    );
  }

  @Post('agendar')
  @AuditCreate('RELATORIO_AGENDADO')
  async agendarRelatorio(
    @Body() relatorioAgendado: RelatorioAgendado,
    @Request() req,
  ) {
    return this.relatoriosService.agendarRelatorio(
      relatorioAgendado,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get('agendados')
  @AuditCreate('RELATORIOS_AGENDADOS_LISTADOS')
  async getRelatoriosAgendados(@Request() req) {
    return this.relatoriosService.getRelatoriosAgendados(req.user.tenantId);
  }

  @Post('agendar/:id/executar')
  @AuditCreate('RELATORIO_AGENDADO_EXECUTADO')
  async executarRelatorioAgendado(
    @Request() req,
    @Query('id') id: string,
  ) {
    return this.relatoriosService.executarRelatorioAgendado(
      id,
      req.user.tenantId,
    );
  }

  @Get('historico')
  @AuditCreate('HISTORICO_RELATORIOS_ACESSADO')
  async getHistoricoRelatorios(
    @Request() req,
    @Query() query: any,
  ) {
    const { page = 1, limit = 20, tipo } = query;
    return this.relatoriosService.getHistoricoRelatorios(
      req.user.tenantId,
      parseInt(page),
      parseInt(limit),
      tipo,
    );
  }

  @Get('templates')
  @AuditCreate('TEMPLATES_RELATORIOS_LISTADOS')
  async getTemplatesRelatorio(@Request() req) {
    return this.relatoriosService.getTemplatesRelatorio(req.user.tenantId);
  }

  @Post('templates')
  @AuditCreate('TEMPLATE_RELATORIO_CRIADO')
  async criarTemplateRelatorio(
    @Body() template: any,
    @Request() req,
  ) {
    return this.relatoriosService.criarTemplateRelatorio(
      template,
      req.user.tenantId,
      req.user.id,
    );
  }

  private getContentType(formato: string): string {
    switch (formato) {
      case 'pdf':
        return 'application/pdf';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}