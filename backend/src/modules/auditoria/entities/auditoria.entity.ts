import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenancy/entities/tenant.entity';

@Entity({ name: 'auditoria', schema: 'public' })
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  @Column({ type: 'text', nullable: true })
  acao?: string;

  @Column({ type: 'text', nullable: true })
  tabela?: string;

  @Column({ type: 'jsonb', nullable: true })
  dados?: any;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  // 🔥 Adiciona este relacionamento:
  @ManyToOne(() => Tenant, (tenant) => tenant.auditorias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
