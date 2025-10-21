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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from './entities/usuario.entity';

// Importar decorators de autorização por módulos
import { 
  UsuariosModuleAccess, 
  ModuleWithLimit 
} from '../planos/decorators/module-access.decorator';
import { ModuloSistema, RecursoModulo } from '../planos/interfaces/plano-modulos.interface';

@ApiTags('Usuários')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ModuleWithLimit(ModuloSistema.USUARIOS, RecursoModulo.USUARIOS_LIMITE, 'Criar novo usuário')
  @Roles('super_admin', 'cliente_admin')
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email já existe' })
  @ApiResponse({ status: 403, description: 'Acesso negado ou limite de usuários atingido' })
  create(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.usuariosService.create(createUsuarioDto, currentUser);
  }

  @Get()
  @UsuariosModuleAccess('Listar usuários')
  @Roles('super_admin', 'cliente_admin')
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado ou módulo não disponível no plano' })
  findAll(@CurrentUser() currentUser: Usuario) {
    return this.usuariosService.findAll(currentUser);
  }

  @Get(':id')
  @UsuariosModuleAccess('Buscar usuário por ID')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ou módulo não disponível no plano' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.usuariosService.findOne(id, currentUser);
  }

  @Patch(':id')
  @UsuariosModuleAccess('Atualizar usuário')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já existe' })
  @ApiResponse({ status: 403, description: 'Acesso negado ou módulo não disponível no plano' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto, currentUser);
  }

  @Delete(':id')
  @UsuariosModuleAccess('Excluir usuário')
  @Roles('super_admin', 'cliente_admin')
  @ApiResponse({ status: 200, description: 'Usuário excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ou módulo não disponível no plano' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.usuariosService.remove(id, currentUser);
  }

  @Patch(':id/change-password')
  @Roles('super_admin', 'cliente_admin', 'cliente_usuario')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Alterar senha do usuário' })
  @ApiResponse({ status: 204, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ou senha atual incorreta' })
  changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.usuariosService.changePassword(id, changePasswordDto, currentUser);
  }

  @Patch(':id/activate')
  @Roles('super_admin', 'cliente_admin')
  @ApiOperation({ summary: 'Ativar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário ativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  activate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.usuariosService.activate(id, currentUser);
  }

  @Patch(':id/deactivate')
  @Roles('super_admin', 'cliente_admin')
  @ApiOperation({ summary: 'Desativar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: Usuario,
  ) {
    return this.usuariosService.deactivate(id, currentUser);
  }
}