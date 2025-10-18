import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('auditoria')
export class Auditoria {
  @ApiProperty({ description: 'ID único do registro de auditoria' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant', required: false })
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  @ApiProperty({ description: 'ID do usuário', required: false })
  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId?: string;

  @ApiProperty({ description: 'Ação realizada', example: 'criar_transacao' })
  @Column({ type: 'text' })
  acao: string;

  @ApiProperty({ description: 'Entidade afetada', example: 'transacoes', required: false })
  @Column({ type: 'text', nullable: true })
  entidade?: string;

  @ApiProperty({ description: 'ID da entidade afetada', required: false })
  @Column({ name: 'entidade_id', type: 'uuid', nullable: true })
  entidadeId?: string;

  @ApiProperty({ description: 'Endereço IP do usuário', required: false })
  @Column({ type: 'text', nullable: true })
  ip?: string;

  @ApiProperty({ description: 'User Agent do navegador', required: false })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'datetime' })
  criadoEm: Date;
}