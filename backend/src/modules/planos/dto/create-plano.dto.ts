import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { StatusPlano } from '../entities/plano.entity';

export class CreatePlanoDto {
  @ApiProperty({ description: 'Nome do plano', example: 'Plano Básico' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ 
    description: 'Status do plano', 
    enum: StatusPlano, 
    default: StatusPlano.ATIVO,
    required: false 
  })
  @IsOptional()
  @IsEnum(StatusPlano)
  status?: StatusPlano;
}