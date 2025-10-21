import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { TipoGateway } from '../entities/gateway.entity';

export class CreateGatewayDto {
  @ApiProperty({ description: 'Nome do gateway', example: 'Stripe' })
  @IsNotEmpty()
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Tipo do gateway', enum: TipoGateway })
  @IsNotEmpty()
  @IsEnum(TipoGateway)
  tipo: TipoGateway;

  @ApiProperty({ description: 'Gateway ativo', default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean = true;
}