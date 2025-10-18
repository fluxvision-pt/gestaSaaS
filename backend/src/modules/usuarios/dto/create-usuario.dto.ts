import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEmail, 
  IsOptional, 
  IsEnum,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { PerfilUsuario } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @ApiProperty({ 
    description: 'ID do tenant (obrigatório para perfis cliente_admin e cliente_usuario)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID(4, { message: 'Tenant ID deve ser um UUID válido' })
  tenantId?: string;

  @ApiProperty({ 
    description: 'Nome completo do usuário',
    example: 'João Silva'
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  nome: string;

  @ApiProperty({ 
    description: 'Email do usuário',
    example: 'joao@empresa.com'
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ 
    description: 'Telefone no formato E164',
    example: '+5511999999999',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @Matches(/^\+\d{10,15}$/, { message: 'Telefone deve estar no formato E164 (+5511999999999)' })
  telefoneE164?: string;

  @ApiProperty({ 
    description: 'Senha do usuário',
    example: 'MinhaSenh@123'
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'
  })
  senha: string;

  @ApiProperty({ 
    description: 'Perfil do usuário',
    enum: PerfilUsuario,
    example: PerfilUsuario.CLIENTE_USER
  })
  @IsEnum(PerfilUsuario, {
    message: 'Perfil deve ser super_admin, cliente_admin ou cliente_usuario'
  })
  perfil: PerfilUsuario;

  @ApiProperty({ 
    description: 'Idioma preferido',
    example: 'pt-BR',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Idioma preferido deve ser uma string' })
  @IsEnum(['pt-BR', 'en-US', 'es-ES'], { message: 'Idioma deve ser pt-BR, en-US ou es-ES' })
  idiomaPreferido?: string;

  @ApiProperty({ 
    description: 'Moeda preferida',
    example: 'BRL',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Moeda preferida deve ser uma string' })
  @Length(3, 3, { message: 'Moeda deve ter exatamente 3 caracteres' })
  @Matches(/^[A-Z]{3}$/, { message: 'Moeda deve estar em maiúsculas (ex: BRL)' })
  moedaPreferida?: string;

  @ApiProperty({ 
    description: 'Código do país (ISO 3166-1 alpha-2)',
    example: 'BR',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Código do país deve ser uma string' })
  @Length(2, 2, { message: 'Código do país deve ter exatamente 2 caracteres' })
  @Matches(/^[A-Z]{2}$/, { message: 'Código do país deve estar em maiúsculas (ex: BR)' })
  codPais?: string;

  // Campo interno para hash da senha (não exposto na API)
  senhaHash?: string;
}