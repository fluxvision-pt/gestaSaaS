import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { FinanceiroService } from './financeiro.service';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

// Importar decorators de autorização por módulos
import { 
  TransacoesAccess, 
  ModuleWithLimit,
  ResourceAccess 
} from '../planos/decorators/module-access.decorator';
import { ModuloSistema, RecursoModulo } from '../planos/interfaces/plano-modulos.interface';

@ApiTags('Financeiro - Transações')
@Controller('financeiro/transacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post()
  @ModuleWithLimit(ModuloSistema.TRANSACOES, RecursoModulo.TRANSACOES_LIMITE, 'Criar nova transação')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 201, description: 'Transação criada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado ou limite de transações atingido' })
  create(
    @Body() createTransacaoDto: CreateTransacaoDto,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.financeiroService.create(createTransacaoDto, currentUser);
  }

  @Get()
  @TransacoesAccess('Listar transações')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 200, description: 'Lista de transações retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso ao módulo de transações não permitido no seu plano atual' })
  findAll(
    @CurrentUser() currentUser: Usuario,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
  ) {
    return this.financeiroService.findAll(currentUser, { page, limit, tipo, categoria });
  }

  @Get('categorias')
  @ResourceAccess(RecursoModulo.TRANSACOES_CATEGORIAS_PERSONALIZADAS, 'Listar categorias personalizadas')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 200, description: 'Categorias retornadas com sucesso' })
  @ApiResponse({ status: 403, description: 'Categorias personalizadas não disponíveis no seu plano' })
  getCategorias(@CurrentUser() currentUser: Usuario) {
    return this.financeiroService.getCategorias(currentUser);
  }

  @Post('categorias')
  @ResourceAccess(RecursoModulo.TRANSACOES_CATEGORIAS_PERSONALIZADAS, 'Criar categoria personalizada')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  @ApiResponse({ status: 403, description: 'Categorias personalizadas não disponíveis no seu plano' })
  createCategoria(
    @Body() createCategoriaDto: any,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.financeiroService.createCategoria(createCategoriaDto, currentUser);
  }

  @Get('busca-avancada')
  @ResourceAccess(RecursoModulo.TRANSACOES_BUSCA_AVANCADA, 'Busca avançada de transações')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 200, description: 'Resultados da busca avançada' })
  @ApiResponse({ status: 403, description: 'Busca avançada não disponível no seu plano' })
  buscaAvancada(
    @CurrentUser() currentUser: Usuario,
    @Query() filtros: any,
  ) {
    return this.financeiroService.buscaAvancada(currentUser, filtros);
  }

  @Post('importar')
  @ResourceAccess(RecursoModulo.TRANSACOES_IMPORTACAO_AUTOMATICA, 'Importação automática de transações')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 200, description: 'Transações importadas com sucesso' })
  @ApiResponse({ status: 403, description: 'Importação automática não disponível no seu plano' })
  importarTransacoes(
    @Body() importData: any,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.financeiroService.importarTransacoes(importData, currentUser);
  }

  @Get(':id')
  @TransacoesAccess('Buscar transação por ID')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 200, description: 'Transação encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso ao módulo de transações não permitido no seu plano atual' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.financeiroService.findOne(id, currentUser);
  }

  @Patch(':id')
  @TransacoesAccess('Atualizar transação')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 200, description: 'Transação atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso ao módulo de transações não permitido no seu plano atual' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransacaoDto: UpdateTransacaoDto,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.financeiroService.update(id, updateTransacaoDto, currentUser);
  }

  @Delete(':id')
  @TransacoesAccess('Excluir transação')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 200, description: 'Transação excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso ao módulo de transações não permitido no seu plano atual' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.financeiroService.remove(id, currentUser);
  }

  @Post(':id/anexos')
  @ResourceAccess(RecursoModulo.TRANSACOES_ANEXOS, 'Adicionar anexo à transação')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 201, description: 'Anexo adicionado com sucesso' })
  @ApiResponse({ status: 403, description: 'Anexos não disponíveis no seu plano' })
  adicionarAnexo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() anexoData: any,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.financeiroService.adicionarAnexo(id, anexoData, currentUser);
  }

  @Post(':id/tags')
  @ResourceAccess(RecursoModulo.TRANSACOES_TAGS, 'Adicionar tags à transação')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 201, description: 'Tags adicionadas com sucesso' })
  @ApiResponse({ status: 403, description: 'Tags não disponíveis no seu plano' })
  adicionarTags(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() tagsData: any,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.financeiroService.adicionarTags(id, tagsData, currentUser);
  }

  // Endpoints específicos para o Dashboard Financeiro
  @Get('dashboard/dados')
  @TransacoesAccess('Acessar dashboard financeiro')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiOperation({ summary: 'Obter dados do dashboard financeiro' })
  @ApiResponse({ status: 200, description: 'Dados do dashboard retornados com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso ao módulo de transações não permitido no seu plano atual' })
  getDashboardData(@CurrentUser() currentUser: Usuario) {
    return this.financeiroService.getDashboardData(currentUser);
  }

  @Get('dashboard/grafico-receitas-despesas')
  @TransacoesAccess('Acessar gráfico de receitas vs despesas')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiOperation({ summary: 'Obter dados do gráfico receitas vs despesas' })
  @ApiResponse({ status: 200, description: 'Dados do gráfico retornados com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso ao módulo de transações não permitido no seu plano atual' })
  getGraficoReceitasDespesas(
    @CurrentUser() currentUser: Usuario,
    @Query('meses') meses?: number,
  ) {
    return this.financeiroService.getGraficoReceitasDespesas(currentUser, meses || 6);
  }

  @Get('dashboard/saldo-atual')
  @TransacoesAccess('Consultar saldo atual')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiOperation({ summary: 'Obter saldo atual' })
  @ApiResponse({ status: 200, description: 'Saldo atual retornado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso ao módulo de transações não permitido no seu plano atual' })
  getSaldoAtual(@CurrentUser() currentUser: Usuario) {
    return this.financeiroService.getSaldoAtual(currentUser);
  }

  @Get('dashboard/transacoes-recentes')
  @TransacoesAccess('Consultar transações recentes')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiOperation({ summary: 'Obter transações recentes' })
  @ApiResponse({ status: 200, description: 'Transações recentes retornadas com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso ao módulo de transações não permitido no seu plano atual' })
  getTransacoesRecentes(
    @CurrentUser() currentUser: Usuario,
    @Query('limite') limite?: number,
  ) {
    return this.financeiroService.getTransacoesRecentes(currentUser, limite || 5);
  }
}