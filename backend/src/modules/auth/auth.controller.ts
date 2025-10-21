import { 
  Controller, 
  Post, 
  Get,
  Body, 
  UseGuards, 
  HttpCode, 
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SuperAdminOnly } from './decorators/super-admin-only.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login no sistema' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        usuario: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string' },
            email: { type: 'string' },
            perfil: { type: 'string' },
            tenantId: { type: 'string' },
            idiomaEfetivo: { type: 'string' },
            moedaEfetiva: { type: 'string' },
            paisEfetivo: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar token de acesso' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário atual' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados do usuário retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        nome: { type: 'string' },
        email: { type: 'string' },
        perfil: { type: 'string' },
        tenantId: { type: 'string' },
        idiomaEfetivo: { type: 'string' },
        moedaEfetiva: { type: 'string' },
        paisEfetivo: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getCurrentUser(@CurrentUser() user: Usuario) {
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
      tenantId: user.tenantId,
      idiomaEfetivo: user.getIdiomaEfetivo(),
      moedaEfetiva: user.getMoedaEfetiva(),
      paisEfetivo: user.getPaisEfetivo(),
    };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário cadastrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        usuario: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string' },
            email: { type: 'string' },
            emailVerificado: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitação processada',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir senha com token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Senha redefinida com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verificar email com token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verificado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @SuperAdminOnly()
  @Post('impersonate/:tenantId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Impersonar um tenant (apenas super admin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Impersonate realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        usuario: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string' },
            email: { type: 'string' },
            perfil: { type: 'string' },
            tenantId: { type: 'string' },
            impersonatedBy: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async impersonate(
    @CurrentUser() user: Usuario,
    @Param('tenantId') tenantId: string,
  ) {
    return this.authService.impersonate(user.id, tenantId);
  }
}