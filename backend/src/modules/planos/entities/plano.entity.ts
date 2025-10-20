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

export enum StatusPlano {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
}

@Entity('planos')
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
  @CreateDateColumn({ name: 'criado_em', type: 'datetime' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn({ name: 'atualizado_em', type: 'datetime' })
  atualizadoEm: Date;

  // Relacionamentos
  @OneToMany(() => PlanoRecurso, (planoRecurso) => planoRecurso.plano)
  planoRecursos: PlanoRecurso[];

  @OneToMany(() => Assinatura, (assinatura) => assinatura.plano)
  assinaturas: Assinatura[];
}