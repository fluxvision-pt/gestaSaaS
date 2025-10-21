import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCredencialGatewayDto {
  @ApiProperty({ description: 'ID do gateway' })
  @IsNotEmpty()
  @IsUUID()
  gatewayId: string;

  @ApiProperty({ description: 'Chave da credencial', example: 'api_key' })
  @IsNotEmpty()
  @IsString()
  chave: string;

  @ApiProperty({ description: 'Valor da credencial', example: 'sk_test_...' })
  @IsNotEmpty()
  @IsString()
  valor: string;
}