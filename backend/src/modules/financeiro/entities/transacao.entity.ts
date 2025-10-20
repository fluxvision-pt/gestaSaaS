import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '../../tenancy/entities/tenant.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoTransacao {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
}

export enum CategoriaTransacao {
  // Entradas
  PLATAFORMA = 'plataforma',
  GORJETA = 'gorjeta',
  BONUS = 'bonus',
  OUTROS_GANHOS = 'outros_ganhos',
  
  // Saídas
  COMBUSTIVEL = 'combustivel',
  MANUTENCAO = 'manutencao',
  TAXAS = 'taxas',
  PEDAGIO = 'pedagio',
  ALIMENTACAO = 'alimentacao',
  ESTACIONAMENTO = 'estacionamento',
  OUTROS_GASTOS = 'outros_gastos',
}

export enum OrigemTransacao {
  WEB = 'web',
  API = 'api',
  IMPORTACAO = 'importacao',
}

@Entity({ name: 'transacoes', schema: 'public' })
export class Transacao {
  @ApiProperty({ description: 'ID único da transação' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ApiProperty({ description: 'ID do usuário', required: false })
  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId?: string;

  @ApiProperty({ description: 'Tipo da transação', enum: TipoTransacao })
  @Column({ type: 'text' })
  tipo: TipoTransacao;

  @ApiProperty({ description: 'Categoria da transação', enum: CategoriaTransacao })
  @Column({ type: 'text' })
  categoria: CategoriaTransacao;

  @ApiProperty({ description: 'Descrição da transação', required: false })
  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @ApiProperty({ description: 'Valor em centavos' })
  @Column({ name: 'valor_cents', type: 'integer' })
  valorCents: number;

  @ApiProperty({ description: 'Quilometragem associada', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  km?: number;

  @ApiProperty({ description: 'Data da transação' })
  @Column({ type: 'date' })
  data: Date;

  @ApiProperty({ description: 'Origem da transação', enum: OrigemTransacao, default: OrigemTransacao.WEB })
  @Column({ type: 'text', default: OrigemTransacao.WEB })
  origem: OrigemTransacao;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data de atualização da transação' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  // Relacionamentos
  @ManyToOne(() => Tenant, (tenant) => tenant.transacoes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Usuario, (usuario) => usuario.transacoes)
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  // Métodos auxiliares
  getValorFormatado(): number {
    return this.valorCents / 100;
  }

  setValorFormatado(valor: number): void {
    this.valorCents = Math.round(valor * 100);
  }

  isEntrada(): boolean {
    return this.tipo === TipoTransacao.ENTRADA;
  }

  isSaida(): boolean {
    return this.tipo === TipoTransacao.SAIDA;
  }

  getValorComSinal(): number {
    const valor = this.getValorFormatado();
    return this.isEntrada() ? valor : -valor;
  }
}