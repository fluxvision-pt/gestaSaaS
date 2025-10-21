import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleAuthorizationService } from '../services/module-authorization.service';
import { ModuloSistema, RecursoModulo } from '../interfaces/plano-modulos.interface';
import { Usuario } from '../../usuarios/entities/usuario.entity';

/**
 * Guard base para verificação de acesso a módulos
 */
@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleAuthService: ModuleAuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario: Usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Super admin sempre tem acesso
    if (usuario.perfil === 'super_admin') {
      return true;
    }

    // Verificar módulo requerido
    const requiredModule = this.reflector.get<ModuloSistema>('module', context.getHandler()) ||
                          this.reflector.get<ModuloSistema>('module', context.getClass());

    if (requiredModule) {
      await this.moduleAuthService.requireModuleAccess(usuario, requiredModule);
    }

    // Verificar recurso requerido
    const requiredResource = this.reflector.get<RecursoModulo>('resource', context.getHandler()) ||
                            this.reflector.get<RecursoModulo>('resource', context.getClass());

    if (requiredResource) {
      await this.moduleAuthService.requireResourceAccess(usuario, requiredResource);
    }

    return true;
  }
}

/**
 * Guard específico para módulo de Transações
 */
@Injectable()
export class TransacoesGuard implements CanActivate {
  constructor(private readonly moduleAuthService: ModuleAuthorizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario: Usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Super admin sempre tem acesso
    if (usuario.perfil === 'super_admin') {
      return true;
    }

    await this.moduleAuthService.requireModuleAccess(
      usuario, 
      ModuloSistema.TRANSACOES,
      'Acesso ao módulo de transações não permitido no seu plano atual'
    );

    return true;
  }
}

/**
 * Guard específico para módulo de Veículos
 */
@Injectable()
export class VeiculosGuard implements CanActivate {
  constructor(private readonly moduleAuthService: ModuleAuthorizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario: Usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Super admin sempre tem acesso
    if (usuario.perfil === 'super_admin') {
      return true;
    }

    await this.moduleAuthService.requireModuleAccess(
      usuario, 
      ModuloSistema.VEICULOS,
      'Acesso ao módulo de veículos não permitido no seu plano atual'
    );

    return true;
  }
}

/**
 * Guard específico para módulo de Relatórios
 */
@Injectable()
export class RelatoriosGuard implements CanActivate {
  constructor(private readonly moduleAuthService: ModuleAuthorizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario: Usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Super admin sempre tem acesso
    if (usuario.perfil === 'super_admin') {
      return true;
    }

    await this.moduleAuthService.requireModuleAccess(
      usuario, 
      ModuloSistema.RELATORIOS,
      'Acesso ao módulo de relatórios não permitido no seu plano atual'
    );

    return true;
  }
}

/**
 * Guard específico para módulo de Dashboard
 */
@Injectable()
export class DashboardGuard implements CanActivate {
  constructor(private readonly moduleAuthService: ModuleAuthorizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario: Usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Super admin sempre tem acesso
    if (usuario.perfil === 'super_admin') {
      return true;
    }

    await this.moduleAuthService.requireModuleAccess(
      usuario, 
      ModuloSistema.DASHBOARD,
      'Acesso ao dashboard não permitido no seu plano atual'
    );

    return true;
  }
}

/**
 * Guard específico para módulo de Usuários
 */
@Injectable()
export class UsuariosModuleGuard implements CanActivate {
  constructor(private readonly moduleAuthService: ModuleAuthorizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario: Usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Super admin sempre tem acesso
    if (usuario.perfil === 'super_admin') {
      return true;
    }

    await this.moduleAuthService.requireModuleAccess(
      usuario, 
      ModuloSistema.USUARIOS,
      'Acesso ao módulo de usuários não permitido no seu plano atual'
    );

    return true;
  }
}

/**
 * Guard específico para módulo de Integrações
 */
@Injectable()
export class IntegracoesGuard implements CanActivate {
  constructor(private readonly moduleAuthService: ModuleAuthorizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario: Usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Super admin sempre tem acesso
    if (usuario.perfil === 'super_admin') {
      return true;
    }

    await this.moduleAuthService.requireModuleAccess(
      usuario, 
      ModuloSistema.INTEGRACOES,
      'Acesso ao módulo de integrações não permitido no seu plano atual'
    );

    return true;
  }
}

/**
 * Guard para verificar limites de criação
 */
@Injectable()
export class LimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleAuthService: ModuleAuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario: Usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Super admin sempre tem acesso
    if (usuario.perfil === 'super_admin') {
      return true;
    }

    // Verificar limite específico
    const limitResource = this.reflector.get<RecursoModulo>('limit', context.getHandler()) ||
                         this.reflector.get<RecursoModulo>('limit', context.getClass());

    if (limitResource) {
      // Aqui você precisaria implementar a lógica para contar os itens existentes
      // Por exemplo, para transações, contar quantas transações o usuário já tem
      // const currentCount = await this.countUserItems(usuario, limitResource);
      // await this.moduleAuthService.requireCanCreateMore(usuario, limitResource, currentCount);
    }

    return true;
  }
}