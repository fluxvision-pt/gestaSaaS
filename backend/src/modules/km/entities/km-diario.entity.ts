import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '../../tenancy/entities/tenant.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('km_diario')
@Unique(['tenantId', 'data'])
export class KmDiario {
  @ApiProperty({ description: 'ID único do registro de KM diário' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ApiProperty({ description: 'ID do usuário', required: false })
  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId?: string;

  @ApiProperty({ description: 'Data do registro' })
  @Column({ type: 'date' })
  data: Date;

  @ApiProperty({ description: 'Quilometragem inicial', required: false })
  @Column({ name: 'km_inicio', type: 'decimal', precision: 10, scale: 2, nullable: true })
  kmInicio?: number;

  @ApiProperty({ description: 'Quilometragem final', required: false })
  @Column({ name: 'km_fim', type: 'decimal', precision: 10, scale: 2, nullable: true })
  kmFim?: number;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  // Relacionamentos
  @ManyToOne(() => Tenant, (tenant) => tenant.kmDiarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Usuario, (usuario) => usuario.kmDiarios)
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  // Métodos auxiliares
  getKmPercorrido(): number | null {
    if (this.kmInicio !== null && this.kmFim !== null && this.kmInicio !== undefined && this.kmFim !== undefined) {
      return this.kmFim - this.kmInicio;
    }
    return null;
  }

  isCompleto(): boolean {
    return this.kmInicio !== null && this.kmFim !== null && this.kmInicio !== undefined && this.kmFim !== undefined;
  }

  isIniciado(): boolean {
    return this.kmInicio !== null && this.kmInicio !== undefined;
  }

  isFinalizado(): boolean {
    return this.kmFim !== null && this.kmFim !== undefined;
  }
}