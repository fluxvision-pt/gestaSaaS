import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PagamentosService } from './pagamentos.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '../usuarios/entities/usuario.entity';
import { Pagamento } from './entities/pagamento.entity';

@ApiTags('pagamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post()
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Criar um novo pagamento' })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso.', type: Pagamento })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  create(@Body() createPagamentoDto: CreatePagamentoDto, @Request() req): Promise<Pagamento> {
    return this.pagamentosService.create(createPagamentoDto, req.user.tenantId, req.user.perfil);
  }

  @Get()
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos retornada com sucesso.', type: [Pagamento] })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findAll(@Request() req): Promise<Pagamento[]> {
    return this.pagamentosService.findAll(req.user.tenantId, req.user.perfil);
  }

  @Get(':id')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Buscar um pagamento por ID' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado.', type: Pagamento })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findOne(@Param('id') id: string, @Request() req): Promise<Pagamento> {
    return this.pagamentosService.findOne(id, req.user.tenantId, req.user.perfil);
  }

  @Patch(':id')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Atualizar um pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento atualizado com sucesso.', type: Pagamento })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  update(@Param('id') id: string, @Body() updatePagamentoDto: UpdatePagamentoDto, @Request() req): Promise<Pagamento> {
    return this.pagamentosService.update(id, updatePagamentoDto, req.user.tenantId, req.user.perfil);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Excluir um pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento excluído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.pagamentosService.remove(id, req.user.tenantId, req.user.perfil);
  }
}