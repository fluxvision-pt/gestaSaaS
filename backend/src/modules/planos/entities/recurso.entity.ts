import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PlanoRecurso } from './plano-recurso.entity';

export enum TipoRecurso {
  BOOLEAN = 'boolean',
  INT = 'int',
  TEXT = 'text',
}

@Entity('recursos')
export class Recurso {
  @ApiProperty({ description: 'ID único do recurso' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Chave única do recurso', example: 'dashboard_basico' })
  @Column({ type: 'text', unique: true })
  chave: string;

  @ApiProperty({ description: 'Descrição do recurso', example: 'Dashboard básico com métricas essenciais' })
  @Column({ type: 'text' })
  descricao: string;

  @ApiProperty({ description: 'Tipo do recurso', enum: TipoRecurso, default: TipoRecurso.BOOLEAN })
  @Column({ type: 'text', default: TipoRecurso.BOOLEAN })
  tipo: TipoRecurso;

  // Relacionamentos
  @OneToMany(() => PlanoRecurso, (planoRecurso) => planoRecurso.recurso)
  planoRecursos: PlanoRecurso[];
}