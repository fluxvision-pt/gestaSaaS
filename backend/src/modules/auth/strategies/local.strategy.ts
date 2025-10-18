import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'senha',
    });
  }

  async validate(email: string, senha: string): Promise<Usuario> {
    const usuario = await this.authService.validateUser(email, senha);
    
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return usuario;
  }
}