import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { StatusTenant } from '../../tenancy/entities/tenant.entity';
import { StatusUsuario, PerfilUsuario } from '../../usuarios/entities/usuario.entity';

export class ImpersonateUserDto {
  @ApiProperty({ description: 'ID do usuário para impersonar' })
  @IsUUID()
  usuarioId: string;

  @ApiProperty({ description: 'Motivo da impersonação', required: false })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class BulkTenantActionDto {
  @ApiProperty({ description: 'IDs dos tenants para ação em massa' })
  @IsArray()
  @IsUUID('4', { each: true })
  tenantIds: string[];

  @ApiProperty({ description: 'Ação a ser executada', enum: ['suspend', 'activate', 'cancel'] })
  @IsEnum(['suspend', 'activate', 'cancel'])
  action: 'suspend' | 'activate' | 'cancel';

  @ApiProperty({ description: 'Motivo da ação', required: false })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class BulkUserActionDto {
  @ApiProperty({ description: 'IDs dos usuários para ação em massa' })
  @IsArray()
  @IsUUID('4', { each: true })
  usuarioIds: string[];

  @ApiProperty({ description: 'Ação a ser executada', enum: ['activate', 'deactivate', 'reset_password'] })
  @IsEnum(['activate', 'deactivate', 'reset_password'])
  action: 'activate' | 'deactivate' | 'reset_password';

  @ApiProperty({ description: 'Motivo da ação', required: false })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class UpdateTenantStatusDto {
  @ApiProperty({ description: 'Novo status do tenant', enum: StatusTenant })
  @IsEnum(StatusTenant)
  status: StatusTenant;

  @ApiProperty({ description: 'Motivo da alteração', required: false })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class CreateSuperAdminDto {
  @ApiProperty({ description: 'Nome completo do super admin' })
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Email do super admin' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Senha temporária' })
  @IsString()
  senha: string;

  @ApiProperty({ description: 'Se deve forçar troca de senha no primeiro login', default: true })
  @IsOptional()
  @IsBoolean()
  forcarTrocaSenha?: boolean;
}

export class SystemConfigurationDto {
  @ApiProperty({ description: 'Chave da configuração' })
  @IsString()
  chave: string;

  @ApiProperty({ description: 'Valor da configuração' })
  @IsString()
  valor: string;

  @ApiProperty({ description: 'Descrição da configuração', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ description: 'Se a configuração é pública (visível para tenants)', default: false })
  @IsOptional()
  @IsBoolean()
  publica?: boolean;
}

export class AuditLogFilterDto {
  @ApiProperty({ description: 'ID do tenant para filtrar', required: false })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({ description: 'ID do usuário para filtrar', required: false })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @ApiProperty({ description: 'Ação para filtrar', required: false })
  @IsOptional()
  @IsString()
  acao?: string;

  @ApiProperty({ description: 'Data inicial (ISO string)', required: false })
  @IsOptional()
  @IsString()
  dataInicial?: string;

  @ApiProperty({ description: 'Data final (ISO string)', required: false })
  @IsOptional()
  @IsString()
  dataFinal?: string;

  @ApiProperty({ description: 'Página', default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Itens por página', default: 20 })
  @IsOptional()
  limit?: number;
}