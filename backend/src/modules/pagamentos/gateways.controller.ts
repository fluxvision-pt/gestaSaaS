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
import { GatewaysService } from './gateways.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { CreateCredencialGatewayDto } from './dto/create-credencial-gateway.dto';
import { UpdateCredencialGatewayDto } from './dto/update-credencial-gateway.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '../usuarios/entities/usuario.entity';
import { Gateway } from './entities/gateway.entity';
import { CredencialGateway } from './entities/credencial-gateway.entity';

@ApiTags('gateways')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gateways')
export class GatewaysController {
  constructor(private readonly gatewaysService: GatewaysService) {}

  // CRUD para Gateways
  @Post()
  @Roles(PerfilUsuario.SUPER_ADMIN)
  @ApiOperation({ summary: 'Criar um novo gateway de pagamento' })
  @ApiResponse({ status: 201, description: 'Gateway criado com sucesso.', type: Gateway })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 409, description: 'Gateway com este nome já existe.' })
  createGateway(@Body() createGatewayDto: CreateGatewayDto, @Request() req): Promise<Gateway> {
    return this.gatewaysService.createGateway(createGatewayDto, req.user.perfil);
  }

  @Get()
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Listar todos os gateways de pagamento' })
  @ApiResponse({ status: 200, description: 'Lista de gateways retornada com sucesso.', type: [Gateway] })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findAllGateways(@Request() req): Promise<Gateway[]> {
    return this.gatewaysService.findAllGateways(req.user.perfil);
  }

  @Get(':id')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Buscar um gateway por ID' })
  @ApiResponse({ status: 200, description: 'Gateway encontrado.', type: Gateway })
  @ApiResponse({ status: 404, description: 'Gateway não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findOneGateway(@Param('id') id: string, @Request() req): Promise<Gateway> {
    return this.gatewaysService.findOneGateway(id, req.user.perfil);
  }

  @Patch(':id')
  @Roles(PerfilUsuario.SUPER_ADMIN)
  @ApiOperation({ summary: 'Atualizar um gateway de pagamento' })
  @ApiResponse({ status: 200, description: 'Gateway atualizado com sucesso.', type: Gateway })
  @ApiResponse({ status: 404, description: 'Gateway não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 409, description: 'Gateway com este nome já existe.' })
  updateGateway(@Param('id') id: string, @Body() updateGatewayDto: UpdateGatewayDto, @Request() req): Promise<Gateway> {
    return this.gatewaysService.updateGateway(id, updateGatewayDto, req.user.perfil);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.SUPER_ADMIN)
  @ApiOperation({ summary: 'Excluir um gateway de pagamento' })
  @ApiResponse({ status: 200, description: 'Gateway excluído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Gateway não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 409, description: 'Gateway possui pagamentos associados.' })
  removeGateway(@Param('id') id: string, @Request() req): Promise<void> {
    return this.gatewaysService.removeGateway(id, req.user.perfil);
  }

  // CRUD para Credenciais de Gateway
  @Post(':gatewayId/credenciais')
  @Roles(PerfilUsuario.SUPER_ADMIN)
  @ApiOperation({ summary: 'Criar uma nova credencial para um gateway' })
  @ApiResponse({ status: 201, description: 'Credencial criada com sucesso.', type: CredencialGateway })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Gateway não encontrado.' })
  @ApiResponse({ status: 409, description: 'Credencial com esta chave já existe para este gateway.' })
  createCredencial(@Param('gatewayId') gatewayId: string, @Body() createCredencialDto: CreateCredencialGatewayDto, @Request() req): Promise<CredencialGateway> {
    // Garantir que o gatewayId do parâmetro seja usado
    createCredencialDto.gatewayId = gatewayId;
    return this.gatewaysService.createCredencial(createCredencialDto, req.user.perfil);
  }

  @Get(':gatewayId/credenciais')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Listar todas as credenciais de um gateway' })
  @ApiResponse({ status: 200, description: 'Lista de credenciais retornada com sucesso.', type: [CredencialGateway] })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Gateway não encontrado.' })
  findAllCredenciais(@Param('gatewayId') gatewayId: string, @Request() req): Promise<CredencialGateway[]> {
    return this.gatewaysService.findAllCredenciais(gatewayId, req.user.perfil);
  }

  @Get('credenciais/:id')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Buscar uma credencial por ID' })
  @ApiResponse({ status: 200, description: 'Credencial encontrada.', type: CredencialGateway })
  @ApiResponse({ status: 404, description: 'Credencial não encontrada.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findOneCredencial(@Param('id') id: string, @Request() req): Promise<CredencialGateway> {
    return this.gatewaysService.findOneCredencial(id, req.user.perfil);
  }

  @Patch('credenciais/:id')
  @Roles(PerfilUsuario.SUPER_ADMIN)
  @ApiOperation({ summary: 'Atualizar uma credencial de gateway' })
  @ApiResponse({ status: 200, description: 'Credencial atualizada com sucesso.', type: CredencialGateway })
  @ApiResponse({ status: 404, description: 'Credencial não encontrada.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 409, description: 'Credencial com esta chave já existe para este gateway.' })
  updateCredencial(@Param('id') id: string, @Body() updateCredencialDto: UpdateCredencialGatewayDto, @Request() req): Promise<CredencialGateway> {
    return this.gatewaysService.updateCredencial(id, updateCredencialDto, req.user.perfil);
  }

  @Delete('credenciais/:id')
  @Roles(PerfilUsuario.SUPER_ADMIN)
  @ApiOperation({ summary: 'Excluir uma credencial de gateway' })
  @ApiResponse({ status: 200, description: 'Credencial excluída com sucesso.' })
  @ApiResponse({ status: 404, description: 'Credencial não encontrada.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  removeCredencial(@Param('id') id: string, @Request() req): Promise<void> {
    return this.gatewaysService.removeCredencial(id, req.user.perfil);
  }
}