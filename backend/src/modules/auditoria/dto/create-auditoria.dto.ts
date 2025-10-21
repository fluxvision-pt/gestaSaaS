import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, IsObject, IsUUID, IsDateString } from 'class-validator';
import { TipoAcao, NivelRisco, StatusAuditoria } from '../entities/auditoria.entity';

export class CreateAuditoriaDto {
  @ApiPropertyOptional({ description: 'ID do tenant' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'ID do usuário que executou a ação' })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @ApiPropertyOptional({ description: 'Nome do usuário' })
  @IsOptional()
  @IsString()
  usuarioNome?: string;

  @ApiPropertyOptional({ description: 'Email do usuário' })
  @IsOptional()
  @IsString()
  usuarioEmail?: string;

  @ApiProperty({ description: 'Tipo de ação executada', enum: TipoAcao })
  @IsEnum(TipoAcao)
  acao: TipoAcao;

  @ApiPropertyOptional({ description: 'Descrição detalhada da ação' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ description: 'Tabela/entidade afetada' })
  @IsOptional()
  @IsString()
  tabela?: string;

  @ApiPropertyOptional({ description: 'ID do registro afetado' })
  @IsOptional()
  @IsString()
  registroId?: string;

  @ApiPropertyOptional({ description: 'Dados antes da alteração' })
  @IsOptional()
  @IsObject()
  dadosAnteriores?: any;

  @ApiPropertyOptional({ description: 'Dados após a alteração' })
  @IsOptional()
  @IsObject()
  dadosNovos?: any;

  @ApiPropertyOptional({ description: 'Metadados adicionais' })
  @IsOptional()
  @IsObject()
  metadados?: any;

  @ApiPropertyOptional({ description: 'Endereço IP do usuário' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User Agent do navegador' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Localização geográfica' })
  @IsOptional()
  @IsString()
  localizacao?: string;

  @ApiPropertyOptional({ description: 'Dispositivo utilizado' })
  @IsOptional()
  @IsString()
  dispositivo?: string;

  @ApiPropertyOptional({ description: 'Nível de risco da ação', enum: NivelRisco })
  @IsOptional()
  @IsEnum(NivelRisco)
  nivelRisco?: NivelRisco;

  @ApiPropertyOptional({ description: 'Status da auditoria', enum: StatusAuditoria })
  @IsOptional()
  @IsEnum(StatusAuditoria)
  status?: StatusAuditoria;

  @ApiPropertyOptional({ description: 'Mensagem de erro (se houver)' })
  @IsOptional()
  @IsString()
  erroMensagem?: string;

  @ApiPropertyOptional({ description: 'Duração da operação em milissegundos' })
  @IsOptional()
  @IsNumber()
  duracaoMs?: number;

  @ApiPropertyOptional({ description: 'Sessão do usuário' })
  @IsOptional()
  @IsString()
  sessaoId?: string;

  @ApiPropertyOptional({ description: 'Módulo/funcionalidade do sistema' })
  @IsOptional()
  @IsString()
  modulo?: string;

  @ApiPropertyOptional({ description: 'Endpoint/rota acessada' })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({ description: 'Método HTTP utilizado' })
  @IsOptional()
  @IsString()
  metodoHttp?: string;

  @ApiPropertyOptional({ description: 'Código de resposta HTTP' })
  @IsOptional()
  @IsNumber()
  codigoResposta?: number;

  @ApiPropertyOptional({ description: 'Tamanho da resposta em bytes' })
  @IsOptional()
  @IsNumber()
  tamanhoResposta?: number;

  @ApiPropertyOptional({ description: 'Data de expiração do log' })
  @IsOptional()
  @IsDateString()
  expiraEm?: Date;
}

export class AuditoriaFilterDto {
  @ApiPropertyOptional({ description: 'ID do tenant para filtrar' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'ID do usuário para filtrar' })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @ApiPropertyOptional({ description: 'Tipo de ação para filtrar', enum: TipoAcao })
  @IsOptional()
  @IsEnum(TipoAcao)
  acao?: TipoAcao;

  @ApiPropertyOptional({ description: 'Tabela para filtrar' })
  @IsOptional()
  @IsString()
  tabela?: string;

  @ApiPropertyOptional({ description: 'Nível de risco para filtrar', enum: NivelRisco })
  @IsOptional()
  @IsEnum(NivelRisco)
  nivelRisco?: NivelRisco;

  @ApiPropertyOptional({ description: 'Status para filtrar', enum: StatusAuditoria })
  @IsOptional()
  @IsEnum(StatusAuditoria)
  status?: StatusAuditoria;

  @ApiPropertyOptional({ description: 'Data inicial para filtrar (ISO string)' })
  @IsOptional()
  @IsDateString()
  dataInicial?: string;

  @ApiPropertyOptional({ description: 'Data final para filtrar (ISO string)' })
  @IsOptional()
  @IsDateString()
  dataFinal?: string;

  @ApiPropertyOptional({ description: 'Endereço IP para filtrar' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Módulo para filtrar' })
  @IsOptional()
  @IsString()
  modulo?: string;

  @ApiPropertyOptional({ description: 'Apenas eventos de segurança' })
  @IsOptional()
  apenasEventosSeguranca?: boolean;

  @ApiPropertyOptional({ description: 'Termo de busca para filtrar por descrição, nome ou email do usuário' })
  @IsOptional()
  @IsString()
  busca?: string;

  @ApiPropertyOptional({ description: 'Apenas eventos de alto risco' })
  @IsOptional()
  apenasAltoRisco?: boolean;

  @ApiPropertyOptional({ description: 'Página para paginação', default: 1 })
  @IsOptional()
  @IsNumber()
  pagina?: number;

  @ApiPropertyOptional({ description: 'Limite de registros por página', default: 50 })
  @IsOptional()
  @IsNumber()
  limite?: number;

  @ApiPropertyOptional({ description: 'Campo para ordenação', default: 'criadoEm' })
  @IsOptional()
  @IsString()
  ordenarPor?: string;

  @ApiPropertyOptional({ description: 'Direção da ordenação', default: 'DESC' })
  @IsOptional()
  @IsString()
  direcaoOrdem?: 'ASC' | 'DESC';
}