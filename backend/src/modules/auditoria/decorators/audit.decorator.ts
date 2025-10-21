import { SetMetadata } from '@nestjs/common';
import { TipoAcao, NivelRisco } from '../entities/auditoria.entity';

export interface AuditOptions {
  acao?: TipoAcao;
  descricao?: string;
  tabela?: string;
  modulo?: string;
  nivelRisco?: NivelRisco;
  capturarDados?: boolean;
  ignorarErros?: boolean;
}

export const AUDIT_METADATA_KEY = 'audit_metadata';

export const Audit = (options: AuditOptions = {}) => {
  return SetMetadata(AUDIT_METADATA_KEY, {
    capturarDados: true,
    ignorarErros: true,
    nivelRisco: NivelRisco.BAIXO,
    ...options,
  });
};

// Decorators específicos para ações comuns
export const AuditCreate = (tabela?: string, modulo?: string) =>
  Audit({
    acao: TipoAcao.CREATE,
    tabela,
    modulo,
    nivelRisco: NivelRisco.MEDIO,
    descricao: `Criação de registro${tabela ? ` na tabela ${tabela}` : ''}`,
  });

export const AuditUpdate = (tabela?: string, modulo?: string) =>
  Audit({
    acao: TipoAcao.UPDATE,
    tabela,
    modulo,
    nivelRisco: NivelRisco.MEDIO,
    descricao: `Atualização de registro${tabela ? ` na tabela ${tabela}` : ''}`,
  });

export const AuditDelete = (tabela?: string, modulo?: string) =>
  Audit({
    acao: TipoAcao.DELETE,
    tabela,
    modulo,
    nivelRisco: NivelRisco.ALTO,
    descricao: `Exclusão de registro${tabela ? ` na tabela ${tabela}` : ''}`,
  });

export const AuditRead = (tabela?: string, modulo?: string) =>
  Audit({
    acao: TipoAcao.READ,
    tabela,
    modulo,
    nivelRisco: NivelRisco.BAIXO,
    descricao: `Leitura de dados${tabela ? ` da tabela ${tabela}` : ''}`,
  });

export const AuditLogin = () =>
  Audit({
    acao: TipoAcao.LOGIN,
    modulo: 'auth',
    nivelRisco: NivelRisco.MEDIO,
    descricao: 'Tentativa de login',
  });

export const AuditLogout = () =>
  Audit({
    acao: TipoAcao.LOGOUT,
    modulo: 'auth',
    nivelRisco: NivelRisco.BAIXO,
    descricao: 'Logout do sistema',
  });

export const AuditCritical = (descricao: string, modulo?: string) =>
  Audit({
    acao: TipoAcao.CONFIG_CHANGE,
    modulo,
    nivelRisco: NivelRisco.CRITICO,
    descricao,
    capturarDados: true,
  });