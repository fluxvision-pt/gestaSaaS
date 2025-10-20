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

export enum StatusTenant {
  ATIVO = 'ativo',
  SUSPENSO = 'suspenso',
  CANCELADO = 'cancelado',
}

@Entity('tenants')
export class Tenant {
  @ApiProperty({ description: 'ID único do tenant' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome fantasia da empresa' })
  @Column({ name: 'nome_fantasia', type: 'text' })
  nomeFantasia: string;

  @ApiProperty({ description: 'Razão social da empresa', required: false })
  @Column({ name: 'razao_social', type: 'text', nullable: true })
  razaoSocial?: string;

  @ApiProperty({ description: 'CPF/CNPJ da empresa', required: false })
  @Column({ type: 'text', nullable: true })
  documento?: string;

  @ApiProperty({ description: 'Email de contato', required: false })
  @Column({ type: 'text', nullable: true })
  email?: string;

  @ApiProperty({ description: 'Telefone no formato E.164', required: false })
  @Column({ name: 'telefone_e164', type: 'text', nullable: true })
  telefoneE164?: string;

  @ApiProperty({ description: 'Código do país (ISO 3166-1 alpha-2)', default: 'BR' })
  @Column({ name: 'cod_pais', type: 'text', default: 'BR' })
  codPais: string;

  @ApiProperty({ description: 'Idioma preferido (ISO 639-1)', example: 'pt' })
  @Column({ name: 'idioma_preferido', type: 'text', default: 'pt' })
  idiomaPreferido: string;

  @ApiProperty({ description: 'Moeda preferida (ISO 4217)', example: 'BRL' })
  @Column({ name: 'moeda_preferida', type: 'text', default: 'BRL' })
  moedaPreferida: string;

  @ApiProperty({ description: 'Status do tenant', enum: StatusTenant, default: StatusTenant.ATIVO })
  @Column({ type: 'text', default: StatusTenant.ATIVO })
  status: StatusTenant;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'datetime' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'datetime' })
  atualizadoEm: Date;

  // Relacionamentos
  @OneToMany(() => Usuario, (usuario) => usuario.tenant)
  usuarios: Usuario[];

  @OneToMany(() => Assinatura, (assinatura) => assinatura.tenant)
  assinaturas: Assinatura[];

  @OneToMany(() => Transacao, (transacao) => transacao.tenant)
  transacoes: Transacao[];

  @OneToMany(() => KmDiario, (kmDiario) => kmDiario.tenant)
  kmDiarios: KmDiario[];

  @OneToMany(() => Configuracao, (configuracao) => configuracao.tenant)
  configuracoes: Configuracao[];
}