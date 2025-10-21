import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Tenant } from '../../tenancy/entities/tenant.entity';
import { Transacao } from '../../financeiro/entities/transacao.entity';
import { KmDiario } from '../../km/entities/km-diario.entity';
import { DB_TYPES } from '../../../database/database-types.helper';

export enum PerfilUsuario {
  SUPER_ADMIN = 'super_admin',
  CLIENTE_ADMIN = 'cliente_admin',
  CLIENTE_USER = 'cliente_user',
}

export enum StatusUsuario {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  SUSPENSO = 'suspenso',
}

@Entity({ name: 'usuarios', schema: 'public' })
@Unique(['email'])
export class Usuario {
  @ApiProperty({ description: 'ID único do usuário' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant' })
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  @ApiProperty({ description: 'Nome completo do usuário' })
  @Column({ type: 'text' })
  nome: string;

  @ApiProperty({ description: 'Email do usuário' })
  @Column({ type: 'text', unique: true })
  email: string;

  @ApiProperty({ description: 'Telefone no formato E.164 (opcional)' })
  @Column({ name: 'telefone_e164', type: 'text', nullable: true })
  telefoneE164?: string;

  @ApiProperty({ description: 'Hash da senha' })
  @Exclude()
  @Column({ name: 'senha_hash', type: 'text' })
  senhaHash: string;

  @ApiProperty({ description: 'Perfil do usuário', enum: PerfilUsuario, default: PerfilUsuario.CLIENTE_USER })
  @Column({ type: 'text', default: PerfilUsuario.CLIENTE_USER })
  perfil: PerfilUsuario;

  @ApiProperty({ description: 'Idioma preferido (override do tenant)', required: false })
  @Column({ name: 'idioma_preferido', type: 'text', nullable: true })
  idiomaPreferido?: string;

  @ApiProperty({ description: 'Moeda preferida (override do tenant)', required: false })
  @Column({ name: 'moeda_preferida', type: 'text', nullable: true })
  moedaPreferida?: string;

  @ApiProperty({ description: 'Código do país (ISO 3166-1 alpha-2)', required: false })
  @Column({ name: 'cod_pais', type: 'text', nullable: true })
  codPais?: string;

  @ApiProperty({ description: 'Status do usuário', enum: StatusUsuario, default: StatusUsuario.ATIVO })
  @Column({ type: 'text', default: StatusUsuario.ATIVO })
  status: StatusUsuario;

  @ApiProperty({ description: 'Email verificado' })
  @Column({ name: 'email_verificado', type: 'boolean', default: false })
  emailVerificado: boolean;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data de atualização do usuário' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  // Relacionamentos
  @ManyToOne(() => Tenant, (tenant) => tenant.usuarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Transacao, (transacao) => transacao.usuario)
  transacoes: Transacao[];

  @OneToMany(() => KmDiario, (kmDiario) => kmDiario.usuario)
  kmDiarios: KmDiario[];

  // Métodos auxiliares para localização
  getIdiomaEfetivo(): string {
    return this.idiomaPreferido || this.tenant?.idiomaPreferido || 'pt-BR';
  }

  getMoedaEfetiva(): string {
    return this.moedaPreferida || this.tenant?.moedaPreferida || 'BRL';
  }

  getPaisEfetivo(): string {
    return this.codPais || this.tenant?.codPais || 'BR';
  }
}
