import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CredencialGateway } from './credencial-gateway.entity';
import { Pagamento } from './pagamento.entity';

export enum TipoGateway {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

@Entity('gateways')
export class Gateway {
  @ApiProperty({ description: 'ID único do gateway' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome do gateway', example: 'Stripe' })
  @Column({ type: 'text' })
  nome: string;

  @ApiProperty({ description: 'Tipo do gateway', enum: TipoGateway })
  @Column({ type: 'text' })
  tipo: TipoGateway;

  @ApiProperty({ description: 'Gateway ativo', default: true })
  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  // Relacionamentos
  @OneToMany(() => CredencialGateway, (credencial) => credencial.gateway)
  credenciais: CredencialGateway[];

  @OneToMany(() => Pagamento, (pagamento) => pagamento.gateway)
  pagamentos: Pagamento[];
}