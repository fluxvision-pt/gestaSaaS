import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '../../tenancy/entities/tenant.entity';

@Entity('configuracoes')
@Unique(['tenantId', 'chave'])
export class Configuracao {
  @ApiProperty({ description: 'ID único da configuração' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant (null = configuração global)', required: false })
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  @ApiProperty({ description: 'Chave da configuração', example: 'timezone' })
  @Column({ type: 'text' })
  chave: string;

  @ApiProperty({ description: 'Valor da configuração' })
  @Column({ type: 'text' })
  valor: string;

  // Relacionamentos
  @ManyToOne(() => Tenant, (tenant) => tenant.configuracoes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant;

  // Métodos auxiliares para conversão de tipos
  getValorBoolean(): boolean {
    return this.valor?.toLowerCase() === 'true';
  }

  getValorNumber(): number {
    return parseFloat(this.valor || '0');
  }

  getValorInt(): number {
    return parseInt(this.valor || '0', 10);
  }

  setValorBoolean(valor: boolean): void {
    this.valor = valor.toString();
  }

  setValorNumber(valor: number): void {
    this.valor = valor.toString();
  }

  isGlobal(): boolean {
    return this.tenantId === null || this.tenantId === undefined;
  }
}