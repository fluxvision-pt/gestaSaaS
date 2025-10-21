import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoriaTransacao } from '../entities/transacao.entity';

export enum TipoTransacao {
  RECEITA = 'receita',
  DESPESA = 'despesa',
}

export enum StatusTransacao {
  PENDENTE = 'pendente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
}

export class CreateTransacaoDto {
  @ApiProperty({ description: 'Tipo da transação', enum: TipoTransacao })
  @IsNotEmpty()
  @IsEnum(TipoTransacao)
  tipo: TipoTransacao;

  @ApiProperty({ description: 'Descrição da transação' })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiProperty({ description: 'Valor da transação' })
  @IsNotEmpty()
  @IsNumber()
  valor: number;

  @ApiProperty({ description: 'Categoria da transação', enum: CategoriaTransacao })
  @IsNotEmpty()
  @IsEnum(CategoriaTransacao)
  categoria: CategoriaTransacao;

  @ApiProperty({ description: 'Data da transação' })
  @IsNotEmpty()
  @IsDateString()
  data: string;

  @ApiProperty({ description: 'Status da transação', enum: StatusTransacao, required: false })
  @IsOptional()
  @IsEnum(StatusTransacao)
  status?: StatusTransacao;

  @ApiProperty({ description: 'Observações adicionais', required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({ description: 'ID do veículo relacionado', required: false })
  @IsOptional()
  @IsUUID()
  veiculoId?: string;

  @ApiProperty({ description: 'Tags da transação', required: false })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Localização da transação', required: false })
  @IsOptional()
  @IsString()
  localizacao?: string;

  @ApiProperty({ description: 'Método de pagamento', required: false })
  @IsOptional()
  @IsString()
  metodoPagamento?: string;
}