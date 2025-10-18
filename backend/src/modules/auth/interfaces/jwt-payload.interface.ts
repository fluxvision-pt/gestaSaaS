import { PerfilUsuario } from '../../usuarios/entities/usuario.entity';

export interface JwtPayload {
  sub: string; // ID do usuário
  email: string;
  tenantId?: string;
  perfil: PerfilUsuario;
  impersonatedBy?: string; // ID do super admin que está fazendo impersonate
  iat?: number; // Issued at
  exp?: number; // Expires at
}