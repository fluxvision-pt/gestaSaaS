import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAssinaturaDto {
  @ApiProperty({ description: 'ID do plano' })
  @IsNotEmpty()
  @IsString()
  planoId: string;

  @ApiProperty({ description: 'Status da assinatura', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Data de fim da assinatura', required: false })
  @IsOptional()
  @IsDateString()
  dataFim?: Date;

  @ApiProperty({ description: 'Observações', required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;
}