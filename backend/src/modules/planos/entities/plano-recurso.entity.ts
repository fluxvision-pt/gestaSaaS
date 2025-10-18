import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Plano } from './plano.entity';
import { Recurso } from './recurso.entity';

@Entity('plano_recursos')
export class PlanoRecurso {
  @ApiProperty({ description: 'ID do plano' })
  @PrimaryColumn({ name: 'plano_id', type: 'uuid' })
  planoId: string;

  @ApiProperty({ description: 'ID do recurso' })
  @PrimaryColumn({ name: 'recurso_id', type: 'uuid' })
  recursoId: string;

  @ApiProperty({ description: 'Valor do recurso em formato texto', required: false })
  @Column({ name: 'valor_texto', type: 'text', nullable: true })
  valorTexto?: string;

  // Relacionamentos
  @ManyToOne(() => Plano, (plano) => plano.planoRecursos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plano_id' })
  plano: Plano;

  @ManyToOne(() => Recurso, (recurso) => recurso.planoRecursos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recurso_id' })
  recurso: Recurso;

  // Métodos auxiliares para conversão de tipos
  getValorBoolean(): boolean {
    return this.valorTexto === 'true';
  }

  getValorInt(): number {
    return parseInt(this.valorTexto || '0', 10);
  }

  getValorText(): string {
    return this.valorTexto || '';
  }

  setValorBoolean(valor: boolean): void {
    this.valorTexto = valor.toString();
  }

  setValorInt(valor: number): void {
    this.valorTexto = valor.toString();
  }

  setValorText(valor: string): void {
    this.valorTexto = valor;
  }
}