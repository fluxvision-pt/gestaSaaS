import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Usuario, PerfilUsuario, StatusUsuario } from '../usuarios/entities/usuario.entity';
import { StatusTenant } from '../tenancy/entities/tenant.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, senha: string): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });

    if (usuario && await bcrypt.compare(senha, usuario.senhaHash)) {
      return usuario;
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.validateUser(loginDto.email, loginDto.senha);

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (usuario.status !== StatusUsuario.ATIVO) {
      throw new UnauthorizedException('Usuário inativo');
    }

    if (usuario.tenant && usuario.tenant.status !== StatusTenant.ATIVO) {
      throw new UnauthorizedException('Tenant inativo');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      tenantId: usuario.tenantId,
      perfil: usuario.perfil,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        tenantId: usuario.tenantId,
        idiomaEfetivo: usuario.getIdiomaEfetivo(),
        moedaEfetiva: usuario.getMoedaEfetiva(),
        paisEfetivo: usuario.getPaisEfetivo(),
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const usuario = await this.usuarioRepository.findOne({
        where: { id: payload.sub },
        relations: ['tenant'],
      });

      if (!usuario || usuario.status !== StatusUsuario.ATIVO) {
        throw new UnauthorizedException('Token inválido');
      }

      const newPayload: JwtPayload = {
        sub: usuario.id,
        email: usuario.email,
        tenantId: usuario.tenantId,
        perfil: usuario.perfil,
      };

      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async impersonate(superAdminId: string, tenantId: string) {
    // Verificar se o usuário é super admin
    const superAdmin = await this.usuarioRepository.findOne({
      where: { id: superAdminId },
    });

    if (!superAdmin || superAdmin.perfil !== PerfilUsuario.SUPER_ADMIN) {
      throw new UnauthorizedException('Apenas super admins podem fazer impersonate');
    }

    // Buscar um admin do tenant para impersonar
    const tenantAdmin = await this.usuarioRepository.findOne({
      where: { 
        tenantId,
        perfil: PerfilUsuario.CLIENTE_ADMIN,
        status: StatusUsuario.ATIVO,
      },
      relations: ['tenant'],
    });

    if (!tenantAdmin) {
      throw new UnauthorizedException('Tenant não encontrado ou sem admin ativo');
    }

    const payload: JwtPayload = {
      sub: tenantAdmin.id,
      email: tenantAdmin.email,
      tenantId: tenantAdmin.tenantId,
      perfil: tenantAdmin.perfil,
      impersonatedBy: superAdminId,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }), // Token mais curto para impersonate
      usuario: {
        id: tenantAdmin.id,
        nome: tenantAdmin.nome,
        email: tenantAdmin.email,
        perfil: tenantAdmin.perfil,
        tenantId: tenantAdmin.tenantId,
        impersonatedBy: superAdminId,
      },
    };
  }

  async hashPassword(senha: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(senha, salt);
  }
}