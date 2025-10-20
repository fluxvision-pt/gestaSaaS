import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { Usuario, PerfilUsuario, StatusUsuario } from '../usuarios/entities/usuario.entity';
import { StatusTenant } from '../tenancy/entities/tenant.entity';
import { TokenRecuperacao, TipoToken } from './entities/token-recuperacao.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(TokenRecuperacao)
    private readonly tokenRecuperacaoRepository: Repository<TokenRecuperacao>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, senha: string): Promise<Usuario | null> {
  console.log(`[AuthService] Iniciando validação de login`);
  console.log(`📩 Email recebido: ${email}`);

  const usuario = await this.usuarioRepository
    .createQueryBuilder('u')
    .leftJoinAndSelect('u.tenant', 't')
    .where('LOWER(u.email) = LOWER(:email)', { email })
    .andWhere('u.status = :status', { status: 'ativo' })
    .getOne();

  if (!usuario) {
    console.warn('⚠️ Usuário não encontrado no banco (após query insensível)');
    return null;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  console.log('📊 Resultado do bcrypt.compare:', senhaValida);

  if (!senhaValida) {
    console.warn('❌ Senha incorreta');
    return null;
  }

  console.log('✅ Senha validada com sucesso');
  return usuario;
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

  async register(registerDto: RegisterDto) {
    const { nome, email, senha, telefoneE164 } = registerDto;

    // Verificar se o email já existe
    const existingUser = await this.usuarioRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const senhaHash = await this.hashPassword(senha);

    // Criar usuário
    const usuario = this.usuarioRepository.create({
      nome,
      email,
      senhaHash,
      telefoneE164,
      perfil: PerfilUsuario.CLIENTE_ADMIN, // Por padrão, novos usuários são admins de cliente
      status: StatusUsuario.ATIVO,
      emailVerificado: false, // Email não verificado inicialmente
    });

    const savedUser = await this.usuarioRepository.save(usuario);

    // Gerar token de verificação de email
    const verificationToken = await this.generateRecoveryToken(
      savedUser.id,
      TipoToken.EMAIL_VERIFICATION
    );

    // TODO: Enviar email de verificação
    console.log(`Token de verificação de email para ${email}: ${verificationToken.token}`);

    return {
      message: 'Usuário cadastrado com sucesso. Verifique seu email para ativar a conta.',
      usuario: {
        id: savedUser.id,
        nome: savedUser.nome,
        email: savedUser.email,
        emailVerificado: savedUser.emailVerificado,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const usuario = await this.usuarioRepository.findOne({
      where: { email },
    });

    if (!usuario) {
      // Por segurança, não revelamos se o email existe ou não
      return {
        message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
      };
    }

    // Invalidar tokens anteriores
    await this.tokenRecuperacaoRepository.update(
      { usuarioId: usuario.id, tipo: TipoToken.PASSWORD_RESET, usado: false },
      { usado: true }
    );

    // Gerar novo token
    const recoveryToken = await this.generateRecoveryToken(
      usuario.id,
      TipoToken.PASSWORD_RESET
    );

    // TODO: Enviar email com token de recuperação
    console.log(`Token de recuperação de senha para ${email}: ${recoveryToken.token}`);

    return {
      message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, novaSenha } = resetPasswordDto;

    const recoveryToken = await this.tokenRecuperacaoRepository.findOne({
      where: { token, tipo: TipoToken.PASSWORD_RESET },
      relations: ['usuario'],
    });

    if (!recoveryToken || !recoveryToken.isValid()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Hash da nova senha
    const senhaHash = await this.hashPassword(novaSenha);

    // Atualizar senha do usuário
    await this.usuarioRepository.update(recoveryToken.usuarioId, {
      senhaHash,
    });

    // Marcar token como usado
    await this.tokenRecuperacaoRepository.update(recoveryToken.id, {
      usado: true,
    });

    return {
      message: 'Senha redefinida com sucesso',
    };
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.tokenRecuperacaoRepository.findOne({
      where: { token, tipo: TipoToken.EMAIL_VERIFICATION },
      relations: ['usuario'],
    });

    if (!verificationToken || !verificationToken.isValid()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Marcar email como verificado
    await this.usuarioRepository.update(verificationToken.usuarioId, {
      emailVerificado: true,
    });

    // Marcar token como usado
    await this.tokenRecuperacaoRepository.update(verificationToken.id, {
      usado: true,
    });

    return {
      message: 'Email verificado com sucesso',
    };
  }

  private async generateRecoveryToken(usuarioId: string, tipo: TipoToken): Promise<TokenRecuperacao> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiraEm = new Date();
    
    // Token de recuperação de senha expira em 1 hora
    // Token de verificação de email expira em 24 horas
    if (tipo === TipoToken.PASSWORD_RESET) {
      expiraEm.setHours(expiraEm.getHours() + 1);
    } else {
      expiraEm.setHours(expiraEm.getHours() + 24);
    }

    const recoveryToken = this.tokenRecuperacaoRepository.create({
      usuarioId,
      token,
      tipo,
      expiraEm,
    });

    return this.tokenRecuperacaoRepository.save(recoveryToken);
  }
}
