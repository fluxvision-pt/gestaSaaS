import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ModuleAuthorizationService } from '../services/module-authorization.service';
import { ModuloSistema, RecursoModulo } from '../interfaces/plano-modulos.interface';
import { Usuario } from '../../usuarios/entities/usuario.entity';

/**
 * Interface para estender o Request com informações do usuário
 */
interface AuthenticatedRequest extends Request {
  user?: Usuario;
}

/**
 * Middleware para verificação automática de recursos baseado na rota
 */
@Injectable()
export class ResourceCheckMiddleware implements NestMiddleware {
  constructor(
    private readonly moduleAuthService: ModuleAuthorizationService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const usuario = req.user;
    
    // Se não há usuário autenticado, deixa outros guards tratarem
    if (!usuario) {
      return next();
    }

    // Super admin sempre passa
    if (usuario.perfil === 'super_admin') {
      return next();
    }

    try {
      // Mapear rotas para módulos
      const moduleMapping = this.getModuleFromRoute(req.path, req.method);
      
      if (moduleMapping) {
        const { modulo, recurso, requiresLimit } = moduleMapping;
        
        // Verificar acesso ao módulo
        if (modulo) {
          await this.moduleAuthService.requireModuleAccess(usuario, modulo);
        }
        
        // Verificar acesso ao recurso específico
        if (recurso) {
          await this.moduleAuthService.requireResourceAccess(usuario, recurso);
        }
        
        // Verificar limites se necessário
        if (requiresLimit && recurso) {
          // Aqui você implementaria a lógica para contar itens existentes
          // const currentCount = await this.countExistingItems(usuario, recurso);
          // await this.moduleAuthService.requireCanCreateMore(usuario, recurso, currentCount);
        }
      }
      
      next();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mapeia rotas para módulos e recursos
   */
  private getModuleFromRoute(path: string, method: string): {
    modulo?: ModuloSistema;
    recurso?: RecursoModulo;
    requiresLimit?: boolean;
  } | null {
    // Remover prefixos da API
    const cleanPath = path.replace(/^\/api\/v\d+\//, '');
    
    // Mapeamento de rotas para módulos
    const routeModuleMap: Record<string, {
      modulo?: ModuloSistema;
      recurso?: RecursoModulo;
      requiresLimit?: boolean;
    }> = {
      // Módulo de Transações
      'financeiro/transacoes': {
        modulo: ModuloSistema.TRANSACOES,
        recurso: method === 'POST' ? RecursoModulo.TRANSACOES_LIMITE : undefined,
        requiresLimit: method === 'POST',
      },
      'financeiro': {
        modulo: ModuloSistema.TRANSACOES,
      },
      
      // Módulo de Veículos (assumindo que existe)
      'veiculos': {
        modulo: ModuloSistema.VEICULOS,
        recurso: method === 'POST' ? RecursoModulo.VEICULOS_LIMITE : undefined,
        requiresLimit: method === 'POST',
      },
      
      // Módulo de Relatórios
      'relatorios': {
        modulo: ModuloSistema.RELATORIOS,
        recurso: RecursoModulo.RELATORIOS_BASICOS,
      },
      'relatorios/avancados': {
        modulo: ModuloSistema.RELATORIOS,
        recurso: RecursoModulo.RELATORIOS_AVANCADOS,
      },
      'relatorios/exportar': {
        modulo: ModuloSistema.RELATORIOS,
        recurso: RecursoModulo.RELATORIOS_EXPORTACAO,
      },
      
      // Módulo de Dashboard
      'dashboard': {
        modulo: ModuloSistema.DASHBOARD,
        recurso: RecursoModulo.DASHBOARD_WIDGETS_BASICOS,
      },
      'dashboard/avancado': {
        modulo: ModuloSistema.DASHBOARD,
        recurso: RecursoModulo.DASHBOARD_WIDGETS_AVANCADOS,
      },
      
      // Módulo de Usuários
      'usuarios': {
        modulo: ModuloSistema.USUARIOS,
        recurso: method === 'POST' ? RecursoModulo.USUARIOS_LIMITE : undefined,
        requiresLimit: method === 'POST',
      },
      
      // Módulo de Integrações
      'integracoes': {
        modulo: ModuloSistema.INTEGRACOES,
        recurso: RecursoModulo.INTEGRACOES_API_EXTERNA,
      },
      'integracoes/webhooks': {
        modulo: ModuloSistema.INTEGRACOES,
        recurso: RecursoModulo.INTEGRACOES_WEBHOOKS,
      },
    };

    // Buscar correspondência exata primeiro
    if (routeModuleMap[cleanPath]) {
      return routeModuleMap[cleanPath];
    }

    // Buscar correspondência por prefixo
    for (const [route, config] of Object.entries(routeModuleMap)) {
      if (cleanPath.startsWith(route)) {
        return config;
      }
    }

    return null;
  }
}

/**
 * Middleware específico para verificação de limites em operações de criação
 */
@Injectable()
export class LimitCheckMiddleware implements NestMiddleware {
  constructor(
    private readonly moduleAuthService: ModuleAuthorizationService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const usuario = req.user;
    
    // Só verifica em operações POST (criação)
    if (req.method !== 'POST' || !usuario || usuario.perfil === 'super_admin') {
      return next();
    }

    try {
      const limitCheck = this.getLimitFromRoute(req.path);
      
      if (limitCheck) {
        // Aqui você implementaria a contagem específica para cada recurso
        // const currentCount = await this.countItems(usuario, limitCheck.recurso);
        // await this.moduleAuthService.requireCanCreateMore(usuario, limitCheck.recurso, currentCount);
      }
      
      next();
    } catch (error) {
      throw error;
    }
  }

  private getLimitFromRoute(path: string): { recurso: RecursoModulo } | null {
    const cleanPath = path.replace(/^\/api\/v\d+\//, '');
    
    const limitMap: Record<string, { recurso: RecursoModulo }> = {
      'financeiro/transacoes': { recurso: RecursoModulo.TRANSACOES_LIMITE },
      'veiculos': { recurso: RecursoModulo.VEICULOS_LIMITE },
      'usuarios': { recurso: RecursoModulo.USUARIOS_LIMITE },
    };

    for (const [route, config] of Object.entries(limitMap)) {
      if (cleanPath.startsWith(route)) {
        return config;
      }
    }

    return null;
  }
}

/**
 * Middleware para adicionar informações do plano ao request
 */
@Injectable()
export class PlanInfoMiddleware implements NestMiddleware {
  constructor(
    private readonly moduleAuthService: ModuleAuthorizationService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const usuario = req.user;
    
    if (usuario && usuario.perfil !== 'super_admin') {
      try {
        const planInfo = await this.moduleAuthService.getUserPlanInfo(usuario);
        
        // Adicionar informações do plano ao request para uso posterior
        (req as any).planInfo = planInfo;
        
        // Adicionar headers de resposta com informações do plano
        res.setHeader('X-Plan-Name', planInfo.plano);
        res.setHeader('X-Plan-Status', planInfo.status);
        res.setHeader('X-Plan-Modules', planInfo.modulosDisponiveis.join(','));
      } catch (error) {
        // Não bloquear a requisição se não conseguir obter info do plano
        console.warn('Erro ao obter informações do plano:', error.message);
      }
    }
    
    next();
  }
}