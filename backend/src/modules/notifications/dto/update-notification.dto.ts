import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { StatusNotificacao } from '../entities/notification.entity';

export class UpdateNotificationDto {
  @ApiProperty({ description: 'Status da notificação', enum: StatusNotificacao, required: false })
  @IsOptional()
  @IsEnum(StatusNotificacao)
  status?: StatusNotificacao;
}

export class MarkAsReadDto {
  @ApiProperty({ description: 'IDs das notificações para marcar como lidas' })
  notificationIds: string[];
}