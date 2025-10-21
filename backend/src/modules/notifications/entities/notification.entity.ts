import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoNotificacao {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum StatusNotificacao {
  NAO_LIDA = 'nao_lida',
  LIDA = 'lida',
  ARQUIVADA = 'arquivada',
}

@Entity({ name: 'notifications', schema: 'public' })
@Index(['usuarioId', 'status'])
@Index(['criadoEm'])
export class Notification {
  @ApiProperty({ description: 'ID único da notificação' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do usuário que receberá a notificação' })
  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @ApiProperty({ description: 'ID do tenant (opcional para notificações globais)' })
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  @ApiProperty({ description: 'Título da notificação' })
  @Column({ type: 'text' })
  titulo: string;

  @ApiProperty({ description: 'Mensagem da notificação' })
  @Column({ type: 'text' })
  mensagem: string;

  @ApiProperty({ description: 'Tipo da notificação', enum: TipoNotificacao })
  @Column({ type: 'text', default: TipoNotificacao.INFO })
  tipo: TipoNotificacao;

  @ApiProperty({ description: 'Status da notificação', enum: StatusNotificacao })
  @Column({ type: 'text', default: StatusNotificacao.NAO_LIDA })
  status: StatusNotificacao;

  @ApiProperty({ description: 'Dados adicionais da notificação (JSON)' })
  @Column({ type: 'jsonb', nullable: true })
  dados?: any;

  @ApiProperty({ description: 'URL de ação (opcional)' })
  @Column({ name: 'action_url', type: 'text', nullable: true })
  actionUrl?: string;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data de atualização' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  @ApiProperty({ description: 'Data de leitura' })
  @Column({ name: 'lido_em', type: 'timestamp', nullable: true })
  lidoEm?: Date;

  // Relacionamentos
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}