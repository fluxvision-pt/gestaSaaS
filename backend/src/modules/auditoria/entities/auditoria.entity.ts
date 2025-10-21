import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '../../tenancy/entities/tenant.entity';

export enum TipoAcao {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  BACKUP = 'BACKUP',
  RESTORE = 'RESTORE',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  PAYMENT = 'PAYMENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum NivelRisco {
  BAIXO = 'BAIXO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
  CRITICO = 'CRITICO',
}

export enum StatusAuditoria {
  SUCESSO = 'SUCESSO',
  FALHA = 'FALHA',
  PENDENTE = 'PENDENTE',
  CANCELADO = 'CANCELADO',
}

@Entity({ name: 'auditoria', schema: 'public' })
@Index(['tenantId', 'criadoEm'])
@Index(['usuarioId', 'criadoEm'])
@Index(['acao', 'criadoEm'])
@Index(['nivelRisco', 'criadoEm'])
export class Auditoria {
  @ApiProperty({ description: 'ID único da auditoria' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant' })
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  @ApiProperty({ description: 'ID do usuário que executou a ação' })
  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId?: string;

  @ApiProperty({ description: 'Nome do usuário' })
  @Column({ name: 'usuario_nome', type: 'varchar', length: 255, nullable: true })
  usuarioNome?: string;

  @ApiProperty({ description: 'Email do usuário' })
  @Column({ name: 'usuario_email', type: 'varchar', length: 255, nullable: true })
  usuarioEmail?: string;

  @ApiProperty({ description: 'Tipo de ação executada', enum: TipoAcao })
  @Column({ type: 'enum', enum: TipoAcao })
  acao: TipoAcao;

  @ApiProperty({ description: 'Descrição detalhada da ação' })
  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @ApiProperty({ description: 'Tabela/entidade afetada' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  tabela?: string;

  @ApiProperty({ description: 'ID do registro afetado' })
  @Column({ name: 'registro_id', type: 'varchar', length: 255, nullable: true })
  registroId?: string;

  @ApiProperty({ description: 'Dados antes da alteração' })
  @Column({ name: 'dados_anteriores', type: 'jsonb', nullable: true })
  dadosAnteriores?: any;

  @ApiProperty({ description: 'Dados após a alteração' })
  @Column({ name: 'dados_novos', type: 'jsonb', nullable: true })
  dadosNovos?: any;

  @ApiProperty({ description: 'Metadados adicionais' })
  @Column({ type: 'jsonb', nullable: true })
  metadados?: any;

  @ApiProperty({ description: 'Endereço IP do usuário' })
  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @ApiProperty({ description: 'User Agent do navegador' })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @ApiProperty({ description: 'Localização geográfica' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  localizacao?: string;

  @ApiProperty({ description: 'Dispositivo utilizado' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  dispositivo?: string;

  @ApiProperty({ description: 'Nível de risco da ação', enum: NivelRisco })
  @Column({ name: 'nivel_risco', type: 'enum', enum: NivelRisco, default: NivelRisco.BAIXO })
  nivelRisco: NivelRisco;

  @ApiProperty({ description: 'Status da auditoria', enum: StatusAuditoria })
  @Column({ type: 'enum', enum: StatusAuditoria, default: StatusAuditoria.SUCESSO })
  status: StatusAuditoria;

  @ApiProperty({ description: 'Mensagem de erro (se houver)' })
  @Column({ name: 'erro_mensagem', type: 'text', nullable: true })
  erroMensagem?: string;

  @ApiProperty({ description: 'Duração da operação em milissegundos' })
  @Column({ name: 'duracao_ms', type: 'integer', nullable: true })
  duracaoMs?: number;

  @ApiProperty({ description: 'Sessão do usuário' })
  @Column({ name: 'sessao_id', type: 'varchar', length: 255, nullable: true })
  sessaoId?: string;

  @ApiProperty({ description: 'Módulo/funcionalidade do sistema' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  modulo?: string;

  @ApiProperty({ description: 'Endpoint/rota acessada' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  endpoint?: string;

  @ApiProperty({ description: 'Método HTTP utilizado' })
  @Column({ name: 'metodo_http', type: 'varchar', length: 10, nullable: true })
  metodoHttp?: string;

  @ApiProperty({ description: 'Código de resposta HTTP' })
  @Column({ name: 'codigo_resposta', type: 'integer', nullable: true })
  codigoResposta?: number;

  @ApiProperty({ description: 'Tamanho da resposta em bytes' })
  @Column({ name: 'tamanho_resposta', type: 'integer', nullable: true })
  tamanhoResposta?: number;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @ApiProperty({ description: 'Data de expiração do log' })
  @Column({ name: 'expira_em', type: 'timestamp', nullable: true })
  expiraEm?: Date;

  // Relacionamentos
  @ManyToOne(() => Tenant, (tenant) => tenant.auditorias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant;

  // Métodos auxiliares
  isHighRisk(): boolean {
    return this.nivelRisco === NivelRisco.ALTO || this.nivelRisco === NivelRisco.CRITICO;
  }

  isFailed(): boolean {
    return this.status === StatusAuditoria.FALHA;
  }

  isSecurityEvent(): boolean {
    const securityActions = [
      TipoAcao.LOGIN_FAILED,
      TipoAcao.PERMISSION_DENIED,
      TipoAcao.PASSWORD_CHANGE,
      TipoAcao.PASSWORD_RESET,
    ];
    return securityActions.includes(this.acao);
  }

  getDurationInSeconds(): number {
    return this.duracaoMs ? Math.round(this.duracaoMs / 1000) : 0;
  }

  getFormattedLocation(): string {
    return this.localizacao || 'Localização não disponível';
  }

  getFormattedDevice(): string {
    return this.dispositivo || 'Dispositivo não identificado';
  }
}
