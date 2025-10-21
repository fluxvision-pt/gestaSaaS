import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { 
  ModuleGuard, 
  TransacoesGuard, 
  VeiculosGuard, 
  RelatoriosGuard, 
  DashboardGuard, 
  UsuariosModuleGuard, 
  IntegracoesGuard,
  LimitGuard 
} from '../guards/module.guard';
import { ModuloSistema, RecursoModulo } from '../interfaces/plano-modulos.interface';

/**
 * Decorator para definir qual módulo é necessário para acessar a rota
 */
export const RequireModule = (modulo: ModuloSistema) => SetMetadata('module', modulo);

/**
 * Decorator para definir qual recurso específico é necessário
 */
export const RequireResource = (recurso: RecursoModulo) => SetMetadata('resource', recurso);

/**
 * Decorator para definir limite de criação
 */
export const RequireLimit = (recurso: RecursoModulo) => SetMetadata('limit', recurso);

/**
 * Decorator combinado para proteção de módulo com autenticação JWT
 */
export const ModuleAccess = (modulo: ModuloSistema, operacao?: string) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, ModuleGuard),
    RequireModule(modulo),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: `Acesso ao módulo ${modulo} não permitido no plano atual` 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};

/**
 * Decorator combinado para proteção de recurso específico
 */
export const ResourceAccess = (recurso: RecursoModulo, operacao?: string) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, ModuleGuard),
    RequireResource(recurso),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: `Recurso ${recurso} não disponível no plano atual` 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};

/**
 * Decorator para proteção do módulo de Transações
 */
export const TransacoesAccess = (operacao?: string) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, TransacoesGuard),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: 'Acesso ao módulo de transações não permitido no seu plano atual' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};

/**
 * Decorator para proteção do módulo de Veículos
 */
export const VeiculosAccess = (operacao?: string) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, VeiculosGuard),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: 'Acesso ao módulo de veículos não permitido no seu plano atual' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};

/**
 * Decorator para proteção do módulo de Relatórios
 */
export const RelatoriosAccess = (operacao?: string) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RelatoriosGuard),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: 'Acesso ao módulo de relatórios não permitido no seu plano atual' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};

/**
 * Decorator para proteção do módulo de Dashboard
 */
export const DashboardAccess = (operacao?: string) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, DashboardGuard),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: 'Acesso ao dashboard não permitido no seu plano atual' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};

/**
 * Decorator para proteção do módulo de Usuários
 */
export const UsuariosModuleAccess = (operacao?: string) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, UsuariosModuleGuard),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: 'Acesso ao módulo de usuários não permitido no seu plano atual' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};

/**
 * Decorator para proteção do módulo de Integrações
 */
export const IntegracoesAccess = (operacao?: string) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, IntegracoesGuard),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: 'Acesso ao módulo de integrações não permitido no seu plano atual' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};

/**
 * Decorator para verificação de limites
 */
export const LimitAccess = (recurso: RecursoModulo, operacao?: string) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, LimitGuard),
    RequireLimit(recurso),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: 'Limite do plano atingido para este recurso' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};

/**
 * Decorator combinado para operações que requerem módulo + limite
 */
export const ModuleWithLimit = (
  modulo: ModuloSistema, 
  recursoLimite: RecursoModulo, 
  operacao?: string
) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, ModuleGuard, LimitGuard),
    RequireModule(modulo),
    RequireLimit(recursoLimite),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: `Acesso ao módulo ${modulo} não permitido ou limite atingido` 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};

/**
 * Decorator para recursos premium (apenas planos profissional e premium)
 */
export const PremiumFeature = (operacao?: string) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, ModuleGuard),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: 'Recurso disponível apenas em planos premium' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido' 
    }),
    ...(operacao ? [ApiOperation({ summary: operacao })] : [])
  );
};