import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditoriaService } from '../auditoria.service';
import { TipoAcao, NivelRisco, StatusAuditoria } from '../entities/auditoria.entity';
import { CreateAuditoriaDto } from '../dto/create-auditoria.dto';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Extrair informações da requisição
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('User-Agent') || '';
    const ipAddress = this.getClientIp(request);
    const user = (request as any).user;

    // Determinar tipo de ação baseado no método HTTP
    const acao = this.mapHttpMethodToAction(method);
    
    // Determinar nível de risco baseado na rota
    const nivelRisco = this.determineRiskLevel(url, method);

    // Extrair informações do módulo/tabela da URL
    const { modulo, tabela } = this.extractModuleAndTable(url);

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duracaoMs = endTime - startTime;

        // Criar registro de auditoria para operações bem-sucedidas
        this.createAuditLog({
          tenantId: user?.tenantId,
          usuarioId: user?.id,
          usuarioNome: user?.nome,
          usuarioEmail: user?.email,
          acao,
          descricao: `${method} ${url}`,
          tabela,
          modulo,
          endpoint: url,
          metodoHttp: method,
          codigoResposta: response.statusCode,
          ipAddress,
          userAgent,
          nivelRisco,
          status: StatusAuditoria.SUCESSO,
          duracaoMs,
          sessaoId: this.extractSessionId(request),
          dispositivo: this.extractDeviceInfo(userAgent),
          metadados: {
            requestBody: this.sanitizeRequestBody(request.body),
            queryParams: request.query,
            responseSize: JSON.stringify(data).length,
          },
        });
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duracaoMs = endTime - startTime;

        // Criar registro de auditoria para operações com erro
        this.createAuditLog({
          tenantId: user?.tenantId,
          usuarioId: user?.id,
          usuarioNome: user?.nome,
          usuarioEmail: user?.email,
          acao,
          descricao: `${method} ${url} - ERRO`,
          tabela,
          modulo,
          endpoint: url,
          metodoHttp: method,
          codigoResposta: error.status || 500,
          ipAddress,
          userAgent,
          nivelRisco: NivelRisco.ALTO, // Erros são considerados alto risco
          status: StatusAuditoria.FALHA,
          erroMensagem: error.message,
          duracaoMs,
          sessaoId: this.extractSessionId(request),
          dispositivo: this.extractDeviceInfo(userAgent),
          metadados: {
            requestBody: this.sanitizeRequestBody(request.body),
            queryParams: request.query,
            errorStack: error.stack,
          },
        });

        throw error;
      }),
    );
  }

  private async createAuditLog(auditData: CreateAuditoriaDto): Promise<void> {
    try {
      await this.auditoriaService.create(auditData);
    } catch (error) {
      // Log do erro sem interromper a execução
      console.error('Erro ao criar log de auditoria:', error);
    }
  }

  private mapHttpMethodToAction(method: string): TipoAcao {
    switch (method.toUpperCase()) {
      case 'POST':
        return TipoAcao.CREATE;
      case 'GET':
        return TipoAcao.READ;
      case 'PUT':
      case 'PATCH':
        return TipoAcao.UPDATE;
      case 'DELETE':
        return TipoAcao.DELETE;
      default:
        return TipoAcao.READ;
    }
  }

  private determineRiskLevel(url: string, method: string): NivelRisco {
    // URLs de alto risco
    const highRiskPatterns = [
      '/auth/login',
      '/auth/logout',
      '/auth/reset-password',
      '/usuarios',
      '/admin',
      '/backups',
      '/configuracoes',
    ];

    // URLs de risco crítico
    const criticalRiskPatterns = [
      '/auth/reset-password',
      '/admin/usuarios',
      '/backups/restore',
      '/configuracoes/sistema',
    ];

    // Operações de DELETE são sempre de alto risco
    if (method === 'DELETE') {
      return NivelRisco.ALTO;
    }

    // Verificar padrões críticos
    if (criticalRiskPatterns.some(pattern => url.includes(pattern))) {
      return NivelRisco.CRITICO;
    }

    // Verificar padrões de alto risco
    if (highRiskPatterns.some(pattern => url.includes(pattern))) {
      return NivelRisco.ALTO;
    }

    // Operações de escrita são de risco médio
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      return NivelRisco.MEDIO;
    }

    return NivelRisco.BAIXO;
  }

  private extractModuleAndTable(url: string): { modulo?: string; tabela?: string } {
    const segments = url.split('/').filter(Boolean);
    
    if (segments.length === 0) {
      return {};
    }

    const modulo = segments[0];
    const tabela = segments[0]; // Assumindo que o primeiro segmento é a tabela/entidade

    return { modulo, tabela };
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

  private extractSessionId(request: Request): string | undefined {
    // Extrair ID da sessão do token JWT ou cookies
    const authorization = request.headers.authorization;
    if (authorization) {
      // Aqui você pode decodificar o JWT para extrair o jti (JWT ID)
      return authorization.split(' ')[1]?.substring(0, 20); // Primeiros 20 caracteres do token
    }
    return undefined;
  }

  private extractDeviceInfo(userAgent: string): string {
    if (!userAgent) return 'Desconhecido';

    // Detectar tipo de dispositivo
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'Mobile';
    } else if (/Tablet/.test(userAgent)) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return undefined;

    // Remover campos sensíveis
    const sensitiveFields = ['password', 'senha', 'token', 'secret', 'key'];
    const sanitized = { ...body };

    const removeSensitiveData = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      const result = Array.isArray(obj) ? [] : {};
      
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          result[key] = removeSensitiveData(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }

      return result;
    };

    return removeSensitiveData(sanitized);
  }
}