import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoToken {
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
}

@Entity({ name: 'tokens_recuperacao', schema: 'public' })
export class TokenRecuperacao {
  @ApiProperty({ description: 'ID único do token' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do usuário' })
  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @ApiProperty({ description: 'Token único' })
  @Column({ type: 'text', unique: true })
  token: string;

  @ApiProperty({ description: 'Tipo do token', enum: TipoToken })
  @Column({ type: 'text', default: TipoToken.PASSWORD_RESET })
  tipo: TipoToken;

  @ApiProperty({ description: 'Se o token foi usado' })
  @Column({ type: 'boolean', default: false })
  usado: boolean;

  @ApiProperty({ description: 'Data de expiração' })
  @Column({ name: 'expira_em', type: 'timestamptz' })
  expiraEm: Date;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  // Relacionamentos
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  // Métodos auxiliares
  isExpired(): boolean {
    return new Date() > this.expiraEm;
  }

  isValid(): boolean {
    return !this.usado && !this.isExpired();
  }
}