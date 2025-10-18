import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '../../tenancy/entities/tenant.entity';
import { Plano } from '../../planos/entities/plano.entity';
import { Pagamento } from '../../pagamentos/entities/pagamento.entity';

export enum CicloAssinatura {
  MENSAL = 'mensal',
  TRIMESTRAL = 'trimestral',
  SEMESTRAL = 'semestral',
  ANUAL = 'anual',
}

export enum StatusAssinatura {
  ATIVA = 'ativa',
  PENDENTE = 'pendente',
  EXPIRADA = 'expirada',
  CANCELADA = 'cancelada',
}

export enum StatusPagamentoAssinatura {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  FALHOU = 'falhou',
}

@Entity('assinaturas')
export class Assinatura {
  @ApiProperty({ description: 'ID único da assinatura' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ApiProperty({ description: 'ID do plano' })
  @Column({ name: 'plano_id', type: 'uuid' })
  planoId: string;

  @ApiProperty({ description: 'Ciclo de cobrança', enum: CicloAssinatura, default: CicloAssinatura.MENSAL })
  @Column({ type: 'text', default: CicloAssinatura.MENSAL })
  ciclo: CicloAssinatura;

  @ApiProperty({ description: 'Preço em centavos', default: 0 })
  @Column({ name: 'preco_cents', type: 'integer', default: 0 })
  precoCents: number;

  @ApiProperty({ description: 'Moeda (ISO 4217)', default: 'BRL' })
  @Column({ type: 'text', default: 'BRL' })
  moeda: string;

  @ApiProperty({ description: 'Status da assinatura', enum: StatusAssinatura, default: StatusAssinatura.ATIVA })
  @Column({ type: 'text', default: StatusAssinatura.ATIVA })
  status: StatusAssinatura;

  @ApiProperty({ description: 'Status do pagamento', enum: StatusPagamentoAssinatura, default: StatusPagamentoAssinatura.PENDENTE })
  @Column({ name: 'status_pagamento', type: 'text', default: StatusPagamentoAssinatura.PENDENTE })
  statusPagamento: StatusPagamentoAssinatura;

  @ApiProperty({ description: 'Data de início da assinatura' })
  @Column({ name: 'inicio_em', type: 'date', default: () => 'CURRENT_DATE' })
  inicioEm: Date;

  @ApiProperty({ description: 'Data de fim da assinatura', required: false })
  @Column({ name: 'fim_em', type: 'date', nullable: true })
  fimEm?: Date;

  @ApiProperty({ description: 'Renovação automática', default: true })
  @Column({ name: 'renovacao_automatica', type: 'boolean', default: true })
  renovacaoAutomatica: boolean;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  // Relacionamentos
  @ManyToOne(() => Tenant, (tenant) => tenant.assinaturas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Plano, (plano) => plano.assinaturas)
  @JoinColumn({ name: 'plano_id' })
  plano: Plano;

  @OneToMany(() => Pagamento, (pagamento) => pagamento.assinatura)
  pagamentos: Pagamento[];

  // Métodos auxiliares
  isAtiva(): boolean {
    return this.status === StatusAssinatura.ATIVA;
  }

  isPagamentoEmDia(): boolean {
    return this.statusPagamento === StatusPagamentoAssinatura.PAGO;
  }

  getPrecoFormatado(): number {
    return this.precoCents / 100;
  }

  setPrecoFormatado(preco: number): void {
    this.precoCents = Math.round(preco * 100);
  }
}