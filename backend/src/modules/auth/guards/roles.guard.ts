import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user }: { user: Usuario } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const hasRole = requiredRoles.includes(user.perfil);
    
    if (!hasRole) {
      throw new ForbiddenException('Acesso negado: perfil insuficiente');
    }

    return true;
  }
}