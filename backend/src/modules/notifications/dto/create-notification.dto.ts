import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TipoNotificacao } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID do usuário que receberá a notificação' })
  @IsUUID()
  usuarioId: string;

  @ApiProperty({ description: 'ID do tenant (opcional)', required: false })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({ description: 'Título da notificação' })
  @IsString()
  titulo: string;

  @ApiProperty({ description: 'Mensagem da notificação' })
  @IsString()
  mensagem: string;

  @ApiProperty({ description: 'Tipo da notificação', enum: TipoNotificacao, required: false })
  @IsOptional()
  @IsEnum(TipoNotificacao)
  tipo?: TipoNotificacao;

  @ApiProperty({ description: 'Dados adicionais (JSON)', required: false })
  @IsOptional()
  dados?: any;

  @ApiProperty({ description: 'URL de ação', required: false })
  @IsOptional()
  @IsString()
  actionUrl?: string;
}