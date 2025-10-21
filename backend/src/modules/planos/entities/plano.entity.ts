import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PlanoRecurso } from './plano-recurso.entity';
import { Assinatura } from '../../assinaturas/entities/assinatura.entity';
import { DB_TYPES } from '../../../database/database-types.helper';

export enum StatusPlano {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
}

@Entity({ name: 'planos', schema: 'public' })
export class Plano {
  @ApiProperty({ description: 'ID único do plano' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome do plano', example: 'Teste Grátis' })
  @Column({ type: 'text' })
  nome: string;

  @ApiProperty({ description: 'Status do plano', enum: StatusPlano, default: StatusPlano.ATIVO })
  @Column({ type: 'text', default: StatusPlano.ATIVO })
  status: StatusPlano;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data de atualização do plano' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  // Relacionamentos
  @OneToMany(() => PlanoRecurso, (planoRecurso) => planoRecurso.plano)
  planoRecursos: PlanoRecurso[];

  @OneToMany(() => Assinatura, (assinatura) => assinatura.plano)
  assinaturas: Assinatura[];
}