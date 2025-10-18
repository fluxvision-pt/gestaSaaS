import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { StatusPagamento } from '../entities/pagamento.entity';

export class CreatePagamentoDto {
  @ApiProperty({ description: 'ID da assinatura' })
  @IsNotEmpty()
  @IsUUID()
  assinaturaId: string;

  @ApiProperty({ description: 'Valor em centavos' })
  @IsNotEmpty()
  @IsNumber()
  valorCents: number;

  @ApiProperty({ description: 'Moeda (ISO 4217)', default: 'BRL' })
  @IsOptional()
  @IsString()
  moeda?: string = 'BRL';

  @ApiProperty({ description: 'Status do pagamento', enum: StatusPagamento, default: StatusPagamento.PENDENTE })
  @IsOptional()
  @IsEnum(StatusPagamento)
  status?: StatusPagamento = StatusPagamento.PENDENTE;

  @ApiProperty({ description: 'ID do gateway', required: false })
  @IsOptional()
  @IsUUID()
  gatewayId?: string;

  @ApiProperty({ description: 'Referência externa (ID do n8n/checkout)', required: false })
  @IsOptional()
  @IsString()
  referenciaExterna?: string;

  @ApiProperty({ description: 'URL do comprovante', required: false })
  @IsOptional()
  @IsString()
  comprovanteUrl?: string;
}