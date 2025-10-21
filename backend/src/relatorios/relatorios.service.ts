import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Usuario } from '../modules/usuarios/entities/usuario.entity';
import { Tenant } from '../modules/tenancy/entities/tenant.entity';
import { Assinatura } from '../modules/assinaturas/entities/assinatura.entity';
import { Auditoria } from '../modules/auditoria/entities/auditoria.entity';
import { RelatorioFiltros, RelatorioAgendado } from './relatorios.controller';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RelatoriosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Assinatura)
    private assinaturaRepository: Repository<Assinatura>,
    @InjectRepository(Auditoria)
    private auditoriaRepository: Repository<Auditoria>,
  ) {}

  async getTiposRelatorio(tenantId: string) {
    return [
      {
        id: 'usuarios',
        nome: 'Relatório de Usuários',
        descricao: 'Relatório detalhado dos usuários do sistema',
        campos: ['nome', 'email', 'status', 'ultimoLogin', 'dataCriacao'],
      },
      {
        id: 'empresas',
        nome: 'Relatório de Empresas',
        descricao: 'Relatório das empresas cadastradas',
        campos: ['nome', 'cnpj', 'status', 'plano', 'dataCriacao'],
      },
      {
        id: 'assinaturas',
        nome: 'Relatório de Assinaturas',
        descricao: 'Relatório das assinaturas e pagamentos',
        campos: ['empresa', 'plano', 'status', 'valor', 'dataVencimento'],
      },
      {
        id: 'auditoria',
        nome: 'Relatório de Auditoria',
        descricao: 'Relatório dos logs de auditoria',
        campos: ['usuario', 'acao', 'recurso', 'status', 'timestamp'],
      },
      {
        id: 'financeiro',
        nome: 'Relatório Financeiro',
        descricao: 'Relatório financeiro consolidado',
        campos: ['receita', 'despesas', 'lucro', 'periodo'],
      },
    ];
  }

  async gerarRelatorio(
    filtros: RelatorioFiltros,
    tenantId: string,
    userId: string,
  ) {
    const dados = await this.coletarDados(filtros, tenantId);
    
    switch (filtros.formato) {
      case 'pdf':
        return this.gerarPDF(dados, filtros);
      case 'excel':
        return this.gerarExcel(dados, filtros);
      case 'csv':
        return this.gerarCSV(dados, filtros);
      case 'json':
      default:
        return this.gerarJSON(dados, filtros);
    }
  }

  private async coletarDados(filtros: RelatorioFiltros, tenantId: string) {
    const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : new Date();

    const dados: any = {
      periodo: { inicio: dataInicio, fim: dataFim },
      filtros,
      geradoEm: new Date(),
    };

     if (filtros.tipo === 'usuarios' || filtros.tipo === 'todos') {
      dados.usuarios = await this.usuarioRepository.find({
        where: {
          tenantId,
          criadoEm: Between(dataInicio, dataFim),
        },
        select: ['id', 'nome', 'email', 'status', 'criadoEm'],
      });
    }

    if (filtros.tipo === 'empresas' || filtros.tipo === 'todos') {
      dados.empresas = await this.tenantRepository.find({
        where: {
          id: tenantId,
          criadoEm: Between(dataInicio, dataFim),
        },
        relations: ['assinaturas'],
      });
    }

    if (filtros.tipo === 'assinaturas' || filtros.tipo === 'todos') {
      dados.assinaturas = await this.assinaturaRepository.find({
        where: {
          tenantId,
          criadoEm: Between(dataInicio, dataFim),
        },
        relations: ['tenant', 'plano'],
      });
    }

    if (filtros.tipo === 'auditoria' || filtros.tipo === 'todos') {
      dados.auditoria = await this.auditoriaRepository.find({
        where: {
          tenantId,
          criadoEm: Between(dataInicio, dataFim),
        },
        take: 1000, // Limitar para evitar sobrecarga
        order: { criadoEm: 'DESC' },
      });
    }

    if (filtros.tipo === 'financeiro' || filtros.tipo === 'todos') {
      dados.financeiro = await this.calcularDadosFinanceiros(tenantId, dataInicio, dataFim);
    }

    return dados;
  }

  private async calcularDadosFinanceiros(tenantId: string, dataInicio: Date, dataFim: Date) {
    const assinaturas = await this.assinaturaRepository.find({
      where: {
        tenantId,
        criadoEm: Between(dataInicio, dataFim),
      },
      relations: ['plano'],
    });

    const receita = assinaturas.reduce((total, assinatura) => {
      return total + (assinatura.getPrecoFormatado() || 0);
    }, 0);

    return {
      receita,
      assinaturasAtivas: assinaturas.filter(a => a.status === 'ativa').length,
      assinaturasVencidas: assinaturas.filter(a => a.status === 'expirada').length,
      receitaMedia: receita / Math.max(assinaturas.length, 1),
      periodo: { inicio: dataInicio, fim: dataFim },
    };
  }

  private async gerarPDF(dados: any, filtros: RelatorioFiltros): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Cabeçalho
        doc.fontSize(20).text('Relatório do Sistema', 50, 50);
        doc.fontSize(12).text(`Tipo: ${filtros.tipo || 'Geral'}`, 50, 80);
        doc.text(`Período: ${dados.periodo.inicio.toLocaleDateString()} - ${dados.periodo.fim.toLocaleDateString()}`, 50, 100);
        doc.text(`Gerado em: ${dados.geradoEm.toLocaleString()}`, 50, 120);

        let yPosition = 160;

        // Dados dos usuários
        if (dados.usuarios) {
          doc.fontSize(16).text('Usuários', 50, yPosition);
          yPosition += 30;
          
          dados.usuarios.forEach((usuario: any, index: number) => {
            if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
            }
            doc.fontSize(10).text(
              `${index + 1}. ${usuario.nome} - ${usuario.email} - Status: ${usuario.status}`,
              50,
              yPosition
            );
            yPosition += 20;
          });
        }

        // Dados das empresas
        if (dados.empresas) {
          yPosition += 20;
          doc.fontSize(16).text('Empresas', 50, yPosition);
          yPosition += 30;
          
          dados.empresas.forEach((empresa: any, index: number) => {
            if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
            }
            doc.fontSize(10).text(
              `${index + 1}. ${empresa.nome} - CNPJ: ${empresa.cnpj} - Status: ${empresa.status}`,
              50,
              yPosition
            );
            yPosition += 20;
          });
        }

        // Dados financeiros
        if (dados.financeiro) {
          yPosition += 20;
          doc.fontSize(16).text('Resumo Financeiro', 50, yPosition);
          yPosition += 30;
          
          doc.fontSize(12).text(`Receita Total: R$ ${dados.financeiro.receita.toFixed(2)}`, 50, yPosition);
          yPosition += 20;
          doc.text(`Assinaturas Ativas: ${dados.financeiro.assinaturasAtivas}`, 50, yPosition);
          yPosition += 20;
          doc.text(`Assinaturas Vencidas: ${dados.financeiro.assinaturasVencidas}`, 50, yPosition);
          yPosition += 20;
          doc.text(`Receita Média: R$ ${dados.financeiro.receitaMedia.toFixed(2)}`, 50, yPosition);
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async gerarExcel(dados: any, filtros: RelatorioFiltros): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    
    // Planilha de resumo
    const resumoSheet = workbook.addWorksheet('Resumo');
    resumoSheet.addRow(['Relatório do Sistema']);
    resumoSheet.addRow(['Tipo:', filtros.tipo || 'Geral']);
    resumoSheet.addRow(['Período:', `${dados.periodo.inicio.toLocaleDateString()} - ${dados.periodo.fim.toLocaleDateString()}`]);
    resumoSheet.addRow(['Gerado em:', dados.geradoEm.toLocaleString()]);

    // Planilha de usuários
    if (dados.usuarios) {
      const usuariosSheet = workbook.addWorksheet('Usuários');
      usuariosSheet.addRow(['ID', 'Nome', 'Email', 'Status', 'Último Login', 'Data Criação']);
      
      dados.usuarios.forEach((usuario: any) => {
        usuariosSheet.addRow([
          usuario.id,
          usuario.nome,
          usuario.email,
          usuario.status,
          usuario.ultimoLogin?.toLocaleString() || 'Nunca',
          usuario.criadoEm.toLocaleString(),
        ]);
      });
    }

    // Planilha de empresas
    if (dados.empresas) {
      const empresasSheet = workbook.addWorksheet('Empresas');
      empresasSheet.addRow(['ID', 'Nome', 'CNPJ', 'Status', 'Data Criação']);
      
      dados.empresas.forEach((empresa: any) => {
        empresasSheet.addRow([
          empresa.id,
          empresa.nome,
          empresa.cnpj,
          empresa.status,
          empresa.criadoEm.toLocaleString(),
        ]);
      });
    }

    // Planilha financeira
    if (dados.financeiro) {
      const financeiroSheet = workbook.addWorksheet('Financeiro');
      financeiroSheet.addRow(['Métrica', 'Valor']);
      financeiroSheet.addRow(['Receita Total', `R$ ${dados.financeiro.receita.toFixed(2)}`]);
      financeiroSheet.addRow(['Assinaturas Ativas', dados.financeiro.assinaturasAtivas]);
      financeiroSheet.addRow(['Assinaturas Vencidas', dados.financeiro.assinaturasVencidas]);
      financeiroSheet.addRow(['Receita Média', `R$ ${dados.financeiro.receitaMedia.toFixed(2)}`]);
    }

    return await workbook.xlsx.writeBuffer();
  }

  private gerarCSV(dados: any, filtros: RelatorioFiltros): string {
    let csv = `Relatório do Sistema\n`;
    csv += `Tipo,${filtros.tipo || 'Geral'}\n`;
    csv += `Período,${dados.periodo.inicio.toLocaleDateString()} - ${dados.periodo.fim.toLocaleDateString()}\n`;
    csv += `Gerado em,${dados.geradoEm.toLocaleString()}\n\n`;

    if (dados.usuarios) {
      csv += `Usuários\n`;
      csv += `ID,Nome,Email,Status,Último Login,Data Criação\n`;
      dados.usuarios.forEach((usuario: any) => {
        csv += `${usuario.id},"${usuario.nome}","${usuario.email}",${usuario.status},"${usuario.ultimoLogin?.toLocaleString() || 'Nunca'}","${usuario.criadoEm.toLocaleString()}"\n`;
      });
      csv += `\n`;
    }

    if (dados.empresas) {
      csv += `Empresas\n`;
      csv += `ID,Nome,CNPJ,Status,Data Criação\n`;
      dados.empresas.forEach((empresa: any) => {
        csv += `${empresa.id},"${empresa.nome}","${empresa.cnpj}",${empresa.status},"${empresa.criadoEm.toLocaleString()}"\n`;
      });
      csv += `\n`;
    }

    if (dados.financeiro) {
      csv += `Financeiro\n`;
      csv += `Métrica,Valor\n`;
      csv += `Receita Total,R$ ${dados.financeiro.receita.toFixed(2)}\n`;
      csv += `Assinaturas Ativas,${dados.financeiro.assinaturasAtivas}\n`;
      csv += `Assinaturas Vencidas,${dados.financeiro.assinaturasVencidas}\n`;
      csv += `Receita Média,R$ ${dados.financeiro.receitaMedia.toFixed(2)}\n`;
    }

    return csv;
  }

  private gerarJSON(dados: any, filtros: RelatorioFiltros): any {
    return {
      relatorio: {
        tipo: filtros.tipo || 'geral',
        periodo: dados.periodo,
        geradoEm: dados.geradoEm,
        filtros,
      },
      dados,
      resumo: {
        totalUsuarios: dados.usuarios?.length || 0,
        totalEmpresas: dados.empresas?.length || 0,
        totalAssinaturas: dados.assinaturas?.length || 0,
        totalEventosAuditoria: dados.auditoria?.length || 0,
        receitaTotal: dados.financeiro?.receita || 0,
      },
    };
  }

  async getDashboardData(tenantId: string, periodo: number) {
    const dataInicio = new Date(Date.now() - periodo * 24 * 60 * 60 * 1000);
    const dataFim = new Date();

    const [usuarios, empresas, assinaturas, auditoria] = await Promise.all([
      this.usuarioRepository.count({
        where: { tenantId, criadoEm: Between(dataInicio, dataFim) },
      }),
      this.tenantRepository.count({
        where: { id: tenantId, criadoEm: Between(dataInicio, dataFim) },
      }),
      this.assinaturaRepository.count({
        where: { tenantId, criadoEm: Between(dataInicio, dataFim) },
      }),
      this.auditoriaRepository.count({
        where: { tenantId, criadoEm: Between(dataInicio, dataFim) },
      }),
    ]);

    return {
      periodo,
      usuarios,
      empresas,
      assinaturas,
      auditoria,
      ultimaAtualizacao: new Date(),
    };
  }

  async getEstatisticas(tenantId: string, tipo?: string, dataInicio?: string, dataFim?: string) {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fim = dataFim ? new Date(dataFim) : new Date();

    const estatisticas: any = {};

    if (!tipo || tipo === 'usuarios') {
      estatisticas.usuarios = await this.usuarioRepository.count({
        where: { tenantId, criadoEm: Between(inicio, fim) },
      });
    }

    if (!tipo || tipo === 'empresas') {
      estatisticas.empresas = await this.tenantRepository.count({
        where: { id: tenantId, criadoEm: Between(inicio, fim) },
      });
    }

    if (!tipo || tipo === 'financeiro') {
      const assinaturas = await this.assinaturaRepository.find({
        where: { tenantId, criadoEm: Between(inicio, fim) },
      });
      
      estatisticas.financeiro = {
        receita: assinaturas.reduce((total, a) => total + (a.getPrecoFormatado() || 0), 0),
        assinaturas: assinaturas.length,
      };
    }

    return estatisticas;
  }

  async agendarRelatorio(relatorio: RelatorioAgendado, tenantId: string, userId: string) {
    // Implementar lógica de agendamento
    // Por enquanto, retornar mock
    return {
      id: `agendado_${Date.now()}`,
      ...relatorio,
      tenantId,
      criadoPor: userId,
      criadoEm: new Date(),
    };
  }

  async getRelatoriosAgendados(tenantId: string) {
    // Implementar busca de relatórios agendados
    return [];
  }

  async executarRelatorioAgendado(id: string, tenantId: string) {
    // Implementar execução de relatório agendado
    return { success: true, executadoEm: new Date() };
  }

  async getHistoricoRelatorios(tenantId: string, page: number, limit: number, tipo?: string) {
    // Implementar histórico de relatórios
    return {
      relatorios: [],
      total: 0,
      page,
      limit,
    };
  }

  async getTemplatesRelatorio(tenantId: string) {
    return [
      {
        id: 'template_usuarios',
        nome: 'Relatório Padrão de Usuários',
        descricao: 'Template padrão para relatórios de usuários',
        filtros: { tipo: 'usuarios', formato: 'excel' },
      },
      {
        id: 'template_financeiro',
        nome: 'Relatório Financeiro Mensal',
        descricao: 'Template para relatórios financeiros mensais',
        filtros: { tipo: 'financeiro', formato: 'pdf', agrupamento: 'mes' },
      },
    ];
  }

  async criarTemplateRelatorio(template: any, tenantId: string, userId: string) {
    return {
      id: `template_${Date.now()}`,
      ...template,
      tenantId,
      criadoPor: userId,
      criadoEm: new Date(),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async executarRelatoriosAgendados() {
    // Implementar execução automática de relatórios agendados
    console.log('Executando relatórios agendados...');
  }
}