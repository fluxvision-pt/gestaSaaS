import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBackupDto } from './create-backup.dto';
import { StatusBackup } from '../entities/backup.entity';

export class UpdateBackupDto extends PartialType(CreateBackupDto) {
  @ApiPropertyOptional({ enum: StatusBackup, description: 'Status do backup' })
  @IsOptional()
  @IsEnum(StatusBackup)
  status?: StatusBackup;

  @ApiPropertyOptional({ description: 'Caminho do arquivo de backup' })
  @IsOptional()
  @IsString()
  caminhoArquivo?: string;

  @ApiPropertyOptional({ description: 'Tamanho do backup em bytes' })
  @IsOptional()
  @IsNumber()
  tamanhoBytes?: number;

  @ApiPropertyOptional({ description: 'Hash MD5 do arquivo' })
  @IsOptional()
  @IsString()
  hashMD5?: string;

  @ApiPropertyOptional({ description: 'Data de início do backup' })
  @IsOptional()
  iniciadoEm?: Date;

  @ApiPropertyOptional({ description: 'Data de finalização do backup' })
  @IsOptional()
  finalizadoEm?: Date;

  @ApiPropertyOptional({ description: 'Duração em segundos' })
  @IsOptional()
  @IsNumber()
  duracaoSegundos?: number;

  @ApiPropertyOptional({ description: 'Mensagem de erro' })
  @IsOptional()
  @IsString()
  mensagemErro?: string;

  @ApiPropertyOptional({ description: 'Estatísticas do backup' })
  @IsOptional()
  @IsObject()
  estatisticas?: {
    tabelasBackup?: number;
    registrosBackup?: number;
    arquivosBackup?: number;
  };
}

export class RestoreBackupDto {
  @ApiPropertyOptional({ description: 'Sobrescrever dados existentes' })
  @IsOptional()
  @IsString()
  sobrescrever?: boolean;

  @ApiPropertyOptional({ description: 'Tabelas específicas para restaurar' })
  @IsOptional()
  @IsString({ each: true })
  tabelasEspecificas?: string[];

  @ApiPropertyOptional({ description: 'Ponto de restauração específico' })
  @IsOptional()
  @IsString()
  pontoRestauracao?: string;

  @ApiPropertyOptional({ description: 'Validar integridade antes da restauração' })
  @IsOptional()
  @IsString()
  validarIntegridade?: boolean;
}