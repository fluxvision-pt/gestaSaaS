import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SuperAdminGuard } from '../guards/super-admin.guard';

/**
 * Decorator que aplica proteção de Super Admin
 * Combina JwtAuthGuard + SuperAdminGuard + documentação Swagger
 */
export function SuperAdminOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, SuperAdminGuard),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 403, 
      description: 'Acesso negado: apenas Super Administradores podem acessar esta rota' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Token de autenticação inválido ou ausente' 
    })
  );
}