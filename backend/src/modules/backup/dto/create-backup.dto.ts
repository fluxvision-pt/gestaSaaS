import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoBackup, TipoArmazenamento } from '../entities/backup.entity';

class ConfiguracaoBackupDto {
  @ApiPropertyOptional({ type: [String], description: 'Tabelas a incluir no backup' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  incluirTabelas?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Tabelas a excluir do backup' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excluirTabelas?: string[];

  @ApiPropertyOptional({ description: 'Aplicar compressão ao backup' })
  @IsOptional()
  @IsBoolean()
  compressao?: boolean;

  @ApiPropertyOptional({ description: 'Aplicar criptografia ao backup' })
  @IsOptional()
  @IsBoolean()
  criptografia?: boolean;

  @ApiPropertyOptional({ description: 'Dias de retenção do backup' })
  @IsOptional()
  @IsNumber()
  retencaoDias?: number;
}

export class CreateBackupDto {
  @ApiProperty({ description: 'Nome do backup' })
  @IsString()
  nome: string;

  @ApiPropertyOptional({ description: 'Descrição do backup' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ enum: TipoBackup, description: 'Tipo do backup' })
  @IsEnum(TipoBackup)
  tipo: TipoBackup;

  @ApiProperty({ enum: TipoArmazenamento, description: 'Tipo de armazenamento' })
  @IsEnum(TipoArmazenamento)
  tipoArmazenamento: TipoArmazenamento;

  @ApiPropertyOptional({ description: 'Configurações específicas do backup' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ConfiguracaoBackupDto)
  configuracao?: ConfiguracaoBackupDto;

  @ApiPropertyOptional({ description: 'Metadados adicionais' })
  @IsOptional()
  @IsObject()
  metadados?: any;

  @ApiPropertyOptional({ description: 'Backup automático' })
  @IsOptional()
  @IsBoolean()
  automatico?: boolean;

  @ApiPropertyOptional({ description: 'ID do agendamento' })
  @IsOptional()
  @IsString()
  agendamentoId?: string;

  @ApiPropertyOptional({ description: 'ID do tenant' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}