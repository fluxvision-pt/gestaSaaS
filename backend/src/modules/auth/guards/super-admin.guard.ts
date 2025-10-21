import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user }: { user: Usuario } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verificar se é super admin (perfil super_admin E tenantId null)
    const isSuperAdmin = user.perfil === 'super_admin' && user.tenantId === null;
    
    if (!isSuperAdmin) {
      throw new ForbiddenException('Acesso negado: apenas Super Administradores podem acessar esta área');
    }

    return true;
  }
}