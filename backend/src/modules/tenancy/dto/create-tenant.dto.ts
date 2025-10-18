import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEmail, 
  IsOptional, 
  IsEnum,
  Length,
  Matches,
} from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ 
    description: 'Nome fantasia da empresa',
    example: 'Empresa Exemplo Ltda'
  })
  @IsString({ message: 'Nome fantasia deve ser uma string' })
  @IsNotEmpty({ message: 'Nome fantasia é obrigatório' })
  @Length(2, 100, { message: 'Nome fantasia deve ter entre 2 e 100 caracteres' })
  nomeFantasia: string;

  @ApiProperty({ 
    description: 'Razão social da empresa',
    example: 'Empresa Exemplo Ltda',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Razão social deve ser uma string' })
  @Length(2, 100, { message: 'Razão social deve ter entre 2 e 100 caracteres' })
  razaoSocial?: string;

  @ApiProperty({ 
    description: 'CNPJ ou CPF da empresa',
    example: '12.345.678/0001-90'
  })
  @IsString({ message: 'Documento deve ser uma string' })
  @IsNotEmpty({ message: 'Documento é obrigatório' })
  @Matches(/^[\d\.\-\/]+$/, { message: 'Documento deve conter apenas números, pontos, hífens e barras' })
  documento: string;

  @ApiProperty({ 
    description: 'Email principal do tenant',
    example: 'contato@empresa.com'
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
    description: 'Código do país (ISO 3166-1 alpha-2)',
    example: 'BR',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Código do país deve ser uma string' })
  @Length(2, 2, { message: 'Código do país deve ter exatamente 2 caracteres' })
  @Matches(/^[A-Z]{2}$/, { message: 'Código do país deve estar em maiúsculas (ex: BR)' })
  codPais?: string;

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
}