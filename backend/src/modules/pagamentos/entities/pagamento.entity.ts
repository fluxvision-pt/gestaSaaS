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
import { Assinatura } from '../../assinaturas/entities/assinatura.entity';
import { Gateway } from './gateway.entity';

export enum StatusPagamento {
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  FALHOU = 'falhou',
  ESTORNADO = 'estornado',
}

@Entity('pagamentos')
export class Pagamento {
  @ApiProperty({ description: 'ID único do pagamento' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID da assinatura' })
  @Column({ name: 'assinatura_id', type: 'uuid' })
  assinaturaId: string;

  @ApiProperty({ description: 'ID do gateway', required: false })
  @Column({ name: 'gateway_id', type: 'uuid', nullable: true })
  gatewayId?: string;

  @ApiProperty({ description: 'Valor em centavos' })
  @Column({ name: 'valor_cents', type: 'integer' })
  valorCents: number;

  @ApiProperty({ description: 'Moeda (ISO 4217)' })
  @Column({ type: 'text' })
  moeda: string;

  @ApiProperty({ description: 'Status do pagamento', enum: StatusPagamento, default: StatusPagamento.PENDENTE })
  @Column({ type: 'text', default: StatusPagamento.PENDENTE })
  status: StatusPagamento;

  @ApiProperty({ description: 'Referência externa (ID do n8n/checkout)', required: false })
  @Column({ name: 'referencia_externa', type: 'text', nullable: true })
  referenciaExterna?: string;

  @ApiProperty({ description: 'URL do comprovante', required: false })
  @Column({ name: 'comprovante_url', type: 'text', nullable: true })
  comprovanteUrl?: string;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  // Relacionamentos
  @ManyToOne(() => Assinatura, (assinatura) => assinatura.pagamentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assinatura_id' })
  assinatura: Assinatura;

  @ManyToOne(() => Gateway, (gateway) => gateway.pagamentos)
  @JoinColumn({ name: 'gateway_id' })
  gateway?: Gateway;

  // Métodos auxiliares
  getValorFormatado(): number {
    return this.valorCents / 100;
  }

  setValorFormatado(valor: number): void {
    this.valorCents = Math.round(valor * 100);
  }

  isAprovado(): boolean {
    return this.status === StatusPagamento.APROVADO;
  }

  isPendente(): boolean {
    return this.status === StatusPagamento.PENDENTE;
  }
}