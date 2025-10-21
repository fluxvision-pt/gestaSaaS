import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Assinatura } from '../../assinaturas/entities/assinatura.entity';
import { Transacao } from '../../financeiro/entities/transacao.entity';
import { KmDiario } from '../../km/entities/km-diario.entity';
import { Configuracao } from '../../configuracoes/entities/configuracao.entity';
import { Auditoria } from '../../auditoria/entities/auditoria.entity';
import { DB_TYPES } from '../../../database/database-types.helper';

export enum StatusTenant {
  ATIVO = 'ativo',
  SUSPENSO = 'suspenso',
  CANCELADO = 'cancelado',
}

@Entity({ name: 'tenants', schema: 'public' })
export class Tenant {
  @ApiProperty({ description: 'ID único do tenant (empresa)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome fantasia do tenant' })
  @Column({ name: 'nome_fantasia', type: 'text', nullable: false })
  nomeFantasia: string;

  @ApiProperty({ description: 'Razão social do tenant' })
  @Column({ name: 'razao_social', type: 'text', nullable: true })
  razaoSocial?: string;

  @ApiProperty({ description: 'Documento (CPF/CNPJ)' })
  @Column({ type: 'text', nullable: true })
  documento?: string;

  @ApiProperty({ description: 'E-mail principal do tenant' })
  @Column({ type: 'text', nullable: true })
  email?: string;

  @ApiProperty({ description: 'Telefone no formato E.164' })
  @Column({ name: 'telefone_e164', type: 'text', nullable: true })
  telefoneE164?: string;

  @ApiProperty({ description: 'Código do país ISO 3166-1 alpha-2' })
  @Column({ name: 'cod_pais', type: 'char', length: 2, default: 'BR' })
  codPais: string;

  @ApiProperty({ description: 'Idioma preferido (IETF tag)' })
  @Column({ name: 'idioma_preferido', type: 'text', default: 'pt-BR' })
  idiomaPreferido: string;

  @ApiProperty({ description: 'Moeda preferida (ISO 4217)' })
  @Column({ name: 'moeda_preferida', type: 'char', length: 3, default: 'BRL' })
  moedaPreferida: string;

  @ApiProperty({ description: 'Status do tenant', enum: StatusTenant })
  @Column({ type: 'text', default: StatusTenant.ATIVO })
  status: StatusTenant;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  // ===========================
  // Relacionamentos
  // ===========================

  @OneToMany(() => Usuario, (usuario) => usuario.tenant)
  usuarios: Usuario[];

  @OneToMany(() => Assinatura, (assinatura) => assinatura.tenant)
  assinaturas: Assinatura[];

  @OneToMany(() => Transacao, (transacao) => transacao.tenant)
  transacoes: Transacao[];

  @OneToMany(() => KmDiario, (km) => km.tenant)
  kmDiarios: KmDiario[];

  @OneToMany(() => Configuracao, (conf) => conf.tenant)
  configuracoes: Configuracao[];

  @OneToMany(() => Auditoria, (audit) => audit.tenant)
  auditorias: Auditoria[];
}
