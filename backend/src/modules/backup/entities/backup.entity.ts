import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoBackup {
  COMPLETO = 'completo',
  INCREMENTAL = 'incremental',
  DIFERENCIAL = 'diferencial',
}

export enum StatusBackup {
  PENDENTE = 'pendente',
  EM_PROGRESSO = 'em_progresso',
  CONCLUIDO = 'concluido',
  FALHOU = 'falhou',
  CANCELADO = 'cancelado',
}

export enum TipoArmazenamento {
  LOCAL = 'local',
  S3 = 's3',
  GOOGLE_CLOUD = 'google_cloud',
  AZURE = 'azure',
}

@Entity('backups')
export class Backup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({
    type: 'enum',
    enum: TipoBackup,
    default: TipoBackup.COMPLETO,
  })
  tipo: TipoBackup;

  @Column({
    type: 'enum',
    enum: StatusBackup,
    default: StatusBackup.PENDENTE,
  })
  status: StatusBackup;

  @Column({
    type: 'enum',
    enum: TipoArmazenamento,
    default: TipoArmazenamento.LOCAL,
  })
  tipoArmazenamento: TipoArmazenamento;

  @Column({ type: 'varchar', length: 500 })
  caminhoArquivo: string;

  @Column({ type: 'bigint', nullable: true })
  tamanhoBytes: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  hashMD5: string;

  @Column({ type: 'json', nullable: true })
  metadados: any;

  @Column({ type: 'json', nullable: true })
  configuracao: {
    incluirTabelas?: string[];
    excluirTabelas?: string[];
    compressao?: boolean;
    criptografia?: boolean;
    retencaoDias?: number;
  };

  @Column({ type: 'timestamp', nullable: true })
  iniciadoEm: Date;

  @Column({ type: 'timestamp', nullable: true })
  finalizadoEm: Date;

  @Column({ type: 'int', nullable: true })
  duracaoSegundos: number;

  @Column({ type: 'text', nullable: true })
  mensagemErro: string;

  @Column({ type: 'json', nullable: true })
  estatisticas: {
    tabelasBackup?: number;
    registrosBackup?: number;
    arquivosBackup?: number;
  };

  @Column({ type: 'boolean', default: false })
  automatico: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  agendamentoId: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  usuarioId: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  // Métodos auxiliares
  get tamanhoFormatado(): string {
    if (!this.tamanhoBytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(this.tamanhoBytes) / Math.log(1024));
    return Math.round(this.tamanhoBytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  get duracaoFormatada(): string {
    if (!this.duracaoSegundos) return '0s';
    
    const horas = Math.floor(this.duracaoSegundos / 3600);
    const minutos = Math.floor((this.duracaoSegundos % 3600) / 60);
    const segundos = this.duracaoSegundos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos}m ${segundos}s`;
    } else if (minutos > 0) {
      return `${minutos}m ${segundos}s`;
    } else {
      return `${segundos}s`;
    }
  }

  get isCompleto(): boolean {
    return this.status === StatusBackup.CONCLUIDO;
  }

  get isFalhou(): boolean {
    return this.status === StatusBackup.FALHOU;
  }

  get isEmProgresso(): boolean {
    return this.status === StatusBackup.EM_PROGRESSO;
  }
}