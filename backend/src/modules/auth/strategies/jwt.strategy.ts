import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario, PerfilUsuario, StatusUsuario } from '../../usuarios/entities/usuario.entity';
import { StatusTenant } from '../../tenancy/entities/tenant.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub },
      relations: ['tenant'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (usuario.status !== StatusUsuario.ATIVO) {
      throw new UnauthorizedException('Usuário inativo');
    }

    // Verificar se o tenant está ativo (exceto para super admin)
    if (usuario.perfil !== PerfilUsuario.SUPER_ADMIN && usuario.tenant && usuario.tenant.status !== StatusTenant.ATIVO) {
      throw new UnauthorizedException('Tenant inativo');
    }

    // Adicionar informações do payload ao usuário para uso nos guards
    (usuario as any).impersonatedBy = payload.impersonatedBy;

    return usuario;
  }
}