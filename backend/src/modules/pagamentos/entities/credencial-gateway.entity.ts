import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Gateway } from './gateway.entity';

@Entity({ name: 'credenciais_gateway', schema: 'public' })
@Unique(['gatewayId', 'chave'])
export class CredencialGateway {
  @ApiProperty({ description: 'ID único da credencial' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do gateway' })
  @Column({ name: 'gateway_id', type: 'uuid' })
  gatewayId: string;

  @ApiProperty({ description: 'Chave da credencial', example: 'public_key' })
  @Column({ type: 'text' })
  chave: string;

  @ApiProperty({ description: 'Valor da credencial (criptografado)' })
  @Exclude()
  @Column({ type: 'text' })
  valor: string;

  // Relacionamentos
  @ManyToOne(() => Gateway, (gateway) => gateway.credenciais, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gateway_id' })
  gateway: Gateway;
}