import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConfiguracoesService } from './configuracoes.service';
import { CreateConfiguracaoDto } from './dto/create-configuracao.dto';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario, PerfilUsuario } from '../usuarios/entities/usuario.entity';

@ApiTags('configuracoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova configuração' })
  @ApiResponse({ status: 201, description: 'Configuração criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 409, description: 'Configuração já existe.' })
  create(@Body() createConfiguracaoDto: CreateConfiguracaoDto, @CurrentUser() user: Usuario) {
    return this.configuracoesService.create(createConfiguracaoDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar configurações' })
  @ApiQuery({ 
    name: 'tenantId', 
    required: false, 
    description: 'ID do tenant (apenas para super admin)' 
  })
  @ApiResponse({ status: 200, description: 'Lista de configurações.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findAll(@CurrentUser() user: Usuario, @Query('tenantId') tenantId?: string) {
    return this.configuracoesService.findAll(user, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar configuração por ID' })
  @ApiResponse({ status: 200, description: 'Configuração encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada.' })
  findOne(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.configuracoesService.findOne(id, user);
  }

  @Get('chave/:chave')
  @ApiOperation({ summary: 'Buscar configuração por chave' })
  @ApiQuery({ 
    name: 'tenantId', 
    required: false, 
    description: 'ID do tenant (opcional)' 
  })
  @ApiResponse({ status: 200, description: 'Configuração encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada.' })
  async findByChave(
    @Param('chave') chave: string, 
    @Query('tenantId') tenantId?: string,
    @CurrentUser() user?: Usuario
  ) {
    // Se não especificou tenantId, usa o do usuário logado
    const finalTenantId = tenantId || user?.tenantId;
    
    const configuracao = await this.configuracoesService.findByChave(chave, finalTenantId);
    
    if (!configuracao) {
      return { chave, valor: null, encontrada: false };
    }
    
    return { 
      chave: configuracao.chave, 
      valor: configuracao.valor, 
      encontrada: true,
      isGlobal: configuracao.isGlobal()
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar configuração' })
  @ApiResponse({ status: 200, description: 'Configuração atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada.' })
  @ApiResponse({ status: 409, description: 'Chave já existe.' })
  update(
    @Param('id') id: string,
    @Body() updateConfiguracaoDto: UpdateConfiguracaoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.configuracoesService.update(id, updateConfiguracaoDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover configuração' })
  @ApiResponse({ status: 200, description: 'Configuração removida com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada.' })
  remove(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.configuracoesService.remove(id, user);
  }

  @Post('set')
  @ApiOperation({ summary: 'Definir valor de configuração (criar ou atualizar)' })
  @ApiResponse({ status: 200, description: 'Configuração definida com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  async setConfiguracao(
    @Body() body: { chave: string; valor: string; tenantId?: string },
    @CurrentUser() user: Usuario,
  ) {
    // Verificar permissões antes de definir
    if (body.tenantId === null || body.tenantId === undefined) {
      // Configuração global - apenas super admin
      if (user.perfil !== PerfilUsuario.SUPER_ADMIN) {
        throw new Error('Apenas super administradores podem definir configurações globais');
      }
    } else if (body.tenantId !== user.tenantId && user.perfil !== PerfilUsuario.SUPER_ADMIN) {
      // Configuração de outro tenant - apenas super admin
      throw new Error('Acesso negado a configurações de outro tenant');
    }

    return this.configuracoesService.setConfiguracao(body.chave, body.valor, body.tenantId);
  }
}