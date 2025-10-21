import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateConfiguracaoDto {
  @ApiProperty({ 
    description: 'ID do tenant (null para configuração global)', 
    required: false,
    example: null 
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({ 
    description: 'Chave da configuração', 
    example: 'timezone' 
  })
  @IsString()
  @IsNotEmpty()
  chave: string;

  @ApiProperty({ 
    description: 'Valor da configuração', 
    example: 'America/Sao_Paulo' 
  })
  @IsString()
  @IsNotEmpty()
  valor: string;
}