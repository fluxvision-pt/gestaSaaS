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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { TenancyService } from './tenancy.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Tenancy')
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Criar novo tenant (apenas super admin)' })
  @ApiResponse({ status: 201, description: 'Tenant criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Documento ou email já existe' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenancyService.create(createTenantDto);
  }

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Listar todos os tenants (apenas super admin)' })
  @ApiResponse({ status: 200, description: 'Lista de tenants retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findAll() {
    return this.tenancyService.findAll();
  }

  @Get(':id')
  @Roles('super_admin', 'cliente_admin')
  @ApiOperation({ summary: 'Buscar tenant por ID' })
  @ApiResponse({ status: 200, description: 'Tenant encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenancyService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'cliente_admin')
  @ApiOperation({ summary: 'Atualizar tenant' })
  @ApiResponse({ status: 200, description: 'Tenant atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  @ApiResponse({ status: 409, description: 'Documento ou email já existe' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenancyService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Excluir tenant (apenas super admin)' })
  @ApiResponse({ status: 200, description: 'Tenant excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenancyService.remove(id);
  }

  @Patch(':id/activate')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Ativar tenant (apenas super admin)' })
  @ApiResponse({ status: 200, description: 'Tenant ativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenancyService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Desativar tenant (apenas super admin)' })
  @ApiResponse({ status: 200, description: 'Tenant desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenancyService.deactivate(id);
  }

  @Patch(':id/suspend')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Suspender tenant (apenas super admin)' })
  @ApiResponse({ status: 200, description: 'Tenant suspenso com sucesso' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  suspend(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenancyService.suspend(id);
  }
}