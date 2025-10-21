import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AuditoriaService } from '../auditoria.service';
import { StatusAuditoria, NivelRisco } from '../entities/auditoria.entity';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly logger = new Logger(SecurityGuard.name);
  private readonly maxLoginAttempts = 5;
  private readonly timeWindowMinutes = 15;
  private readonly maxRequestsPerMinute = 100;

  constructor(private readonly auditoriaService: AuditoriaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ipAddress = this.getClientIp(request);
    const userAgent = request.get('User-Agent') || '';
    const user = (request as any).user;

    try {
      // 1. Verificar tentativas de login falhadas
      if (request.url.includes('/auth/login')) {
        await this.checkFailedLoginAttempts(ipAddress, user?.email);
      }

      // 2. Verificar rate limiting
      await this.checkRateLimit(ipAddress, user?.tenantId);

      // 3. Verificar padrões suspeitos de user agent
      this.checkSuspiciousUserAgent(userAgent);

      // 4. Verificar acessos de localizações suspeitas (implementação básica)
      await this.checkSuspiciousLocation(ipAddress, user?.tenantId);

      return true;
    } catch (error) {
      this.logger.warn(`Acesso bloqueado: ${error.message}`, {
        ip: ipAddress,
        userAgent,
        url: request.url,
        user: user?.email,
      });

      // Registrar tentativa de acesso bloqueada
      if (user?.tenantId) {
        await this.auditoriaService.create({
          tenantId: user.tenantId,
          usuarioId: user?.id,
          usuarioNome: user?.nome,
          usuarioEmail: user?.email,
          acao: 'BLOCKED_ACCESS' as any,
          descricao: `Acesso bloqueado: ${error.message}`,
          endpoint: request.url,
          metodoHttp: request.method,
          ipAddress,
          userAgent,
          nivelRisco: NivelRisco.CRITICO,
          status: StatusAuditoria.FALHA,
          erroMensagem: error.message,
          metadados: {
            reason: 'SECURITY_VIOLATION',
            blockType: error.constructor.name,
          },
        });
      }

      throw error;
    }
  }

  private async checkFailedLoginAttempts(ipAddress: string, email?: string): Promise<void> {
    // Implementação simplificada - em produção, usar Redis ou cache
    const timeWindow = new Date(Date.now() - this.timeWindowMinutes * 60 * 1000);
    
    // Aqui você implementaria a lógica para verificar tentativas falhadas
    // Por exemplo, consultando um cache Redis ou banco de dados
    
    // Simulação de verificação
    const failedAttempts = 0; // Substituir por consulta real
    
    if (failedAttempts >= this.maxLoginAttempts) {
      throw new ForbiddenException(
        `Muitas tentativas de login falhadas. Tente novamente em ${this.timeWindowMinutes} minutos.`
      );
    }
  }

  private async checkRateLimit(ipAddress: string, tenantId?: string): Promise<void> {
    // Implementação simplificada - em produção, usar Redis
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    // Aqui você implementaria a lógica de rate limiting
    // Por exemplo, contando requisições no último minuto
    
    // Simulação de verificação
    const requestCount = 0; // Substituir por consulta real
    
    if (requestCount > this.maxRequestsPerMinute) {
      throw new ForbiddenException(
        'Muitas requisições. Aguarde um momento antes de tentar novamente.'
      );
    }
  }

  private checkSuspiciousUserAgent(userAgent: string): void {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /go-http-client/i,
    ];

    // Permitir alguns bots legítimos
    const allowedBots = [
      /googlebot/i,
      /bingbot/i,
      /slackbot/i,
      /facebookexternalhit/i,
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    const isAllowed = allowedBots.some(pattern => pattern.test(userAgent));

    if (isSuspicious && !isAllowed) {
      throw new ForbiddenException('User-Agent suspeito detectado');
    }
  }

  private async checkSuspiciousLocation(ipAddress: string, tenantId?: string): Promise<void> {
    // Implementação básica - em produção, usar serviço de geolocalização
    
    // Lista de IPs suspeitos (exemplo)
    const suspiciousIPs = [
      '127.0.0.1', // Remover em produção
      // Adicionar IPs conhecidos como maliciosos
    ];

    // Verificar se o IP está em uma lista de bloqueio
    if (suspiciousIPs.includes(ipAddress)) {
      // Em desenvolvimento, apenas log, não bloquear
      this.logger.warn(`IP suspeito detectado: ${ipAddress}`);
      // throw new ForbiddenException('Acesso negado para esta localização');
    }

    // Verificar mudanças bruscas de localização para o mesmo usuário
    // Implementar lógica para detectar logins de países diferentes em pouco tempo
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}