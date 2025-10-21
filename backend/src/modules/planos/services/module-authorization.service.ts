import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assinatura, StatusAssinatura } from '../../assinaturas/entities/assinatura.entity';
import { Plano } from '../entities/plano.entity';
import { PlanoRecurso } from '../entities/plano-recurso.entity';
import { Recurso } from '../entities/recurso.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { 
  PlanoModulos, 
  ModuloSistema, 
  RecursoModulo, 
  PLANOS_CONFIGURACAO 
} from '../interfaces/plano-modulos.interface';

@Injectable()
export class ModuleAuthorizationService {
  constructor(
    @InjectRepository(Assinatura)
    private readonly assinaturaRepository: Repository<Assinatura>,
    @InjectRepository(Plano)
    private readonly planoRepository: Repository<Plano>,
    @InjectRepository(PlanoRecurso)
    private readonly planoRecursoRepository: Repository<PlanoRecurso>,
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
  ) {}

  /**
   * Verifica se o usuário tem acesso a um módulo específico
   */
  async hasModuleAccess(
    usuario: Usuario,
    modulo: ModuloSistema,
  ): Promise<boolean> {
    try {
      const planoModulos = await this.getUserPlanModules(usuario);
      return planoModulos[modulo] !== undefined;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se o usuário tem acesso a um recurso específico
   */
  async hasResourceAccess(
    usuario: Usuario,
    recurso: RecursoModulo,
  ): Promise<boolean> {
    try {
      const planoModulos = await this.getUserPlanModules(usuario);
      const [modulo, propriedade] = recurso.split('.') as [ModuloSistema, string];
      
      if (!planoModulos[modulo]) {
        return false;
      }

      const moduloConfig = planoModulos[modulo];
      return moduloConfig[propriedade] === true || moduloConfig[propriedade] === 'ilimitado';
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se o usuário pode criar mais itens baseado no limite do plano
   */
  async canCreateMore(
    usuario: Usuario,
    recurso: RecursoModulo,
    currentCount: number,
  ): Promise<boolean> {
    try {
      const planoModulos = await this.getUserPlanModules(usuario);
      const [modulo, propriedade] = recurso.split('.') as [ModuloSistema, string];
      
      if (!planoModulos[modulo]) {
        return false;
      }

      const moduloConfig = planoModulos[modulo];
      const limite = moduloConfig[propriedade];

      if (limite === 'ilimitado') {
        return true;
      }

      if (typeof limite === 'number') {
        return currentCount < limite;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém o valor de um recurso específico do plano
   */
  async getResourceValue(
    usuario: Usuario,
    recurso: RecursoModulo,
  ): Promise<any> {
    try {
      const planoModulos = await this.getUserPlanModules(usuario);
      const [modulo, propriedade] = recurso.split('.') as [ModuloSistema, string];
      
      if (!planoModulos[modulo]) {
        return null;
      }

      return planoModulos[modulo][propriedade];
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica acesso e lança exceção se não autorizado
   */
  async requireModuleAccess(
    usuario: Usuario,
    modulo: ModuloSistema,
    mensagem?: string,
  ): Promise<void> {
    const hasAccess = await this.hasModuleAccess(usuario, modulo);
    
    if (!hasAccess) {
      throw new ForbiddenException(
        mensagem || `Acesso ao módulo ${modulo} não permitido no seu plano atual`
      );
    }
  }

  /**
   * Verifica acesso a recurso e lança exceção se não autorizado
   */
  async requireResourceAccess(
    usuario: Usuario,
    recurso: RecursoModulo,
    mensagem?: string,
  ): Promise<void> {
    const hasAccess = await this.hasResourceAccess(usuario, recurso);
    
    if (!hasAccess) {
      throw new ForbiddenException(
        mensagem || `Recurso ${recurso} não disponível no seu plano atual`
      );
    }
  }

  /**
   * Verifica limite e lança exceção se excedido
   */
  async requireCanCreateMore(
    usuario: Usuario,
    recurso: RecursoModulo,
    currentCount: number,
    mensagem?: string,
  ): Promise<void> {
    const canCreate = await this.canCreateMore(usuario, recurso, currentCount);
    
    if (!canCreate) {
      const limite = await this.getResourceValue(usuario, recurso);
      throw new ForbiddenException(
        mensagem || `Limite de ${limite} itens atingido para o seu plano atual`
      );
    }
  }

  /**
   * Obtém a configuração completa dos módulos do plano do usuário
   */
  async getUserPlanModules(usuario: Usuario): Promise<PlanoModulos> {
    // Se for super admin, tem acesso total
    if (usuario.perfil === 'super_admin') {
      return PLANOS_CONFIGURACAO.PREMIUM;
    }

    // Buscar assinatura ativa do tenant do usuário
    const assinatura = await this.assinaturaRepository.findOne({
      where: {
        tenantId: usuario.tenantId,
        status: StatusAssinatura.ATIVA,
      },
      relations: ['plano', 'plano.planoRecursos', 'plano.planoRecursos.recurso'],
    });

    if (!assinatura) {
      throw new NotFoundException('Nenhuma assinatura ativa encontrada');
    }

    // Buscar configuração padrão baseada no nome do plano
    const nomeUpper = assinatura.plano.nome.toUpperCase();
    let configuracao = PLANOS_CONFIGURACAO.GRATUITO;

    if (nomeUpper.includes('BÁSICO') || nomeUpper.includes('BASICO')) {
      configuracao = PLANOS_CONFIGURACAO.BASICO;
    } else if (nomeUpper.includes('PROFISSIONAL')) {
      configuracao = PLANOS_CONFIGURACAO.PROFISSIONAL;
    } else if (nomeUpper.includes('PREMIUM')) {
      configuracao = PLANOS_CONFIGURACAO.PREMIUM;
    }

    // Aplicar customizações específicas do plano se existirem
    if (assinatura.plano.planoRecursos?.length > 0) {
      configuracao = this.applyCustomizations(configuracao, assinatura.plano.planoRecursos);
    }

    return configuracao;
  }

  /**
   * Aplica customizações específicas do plano
   */
  private applyCustomizations(
    configuracao: PlanoModulos,
    planoRecursos: PlanoRecurso[],
  ): PlanoModulos {
    const customConfig = JSON.parse(JSON.stringify(configuracao)); // Deep clone

    for (const planoRecurso of planoRecursos) {
      const chave = planoRecurso.recurso.chave;
      const valor = planoRecurso.valorTexto;

      // Aplicar customização baseada na chave do recurso
      if (chave.includes('.')) {
        const [modulo, propriedade] = chave.split('.');
        
        if (customConfig[modulo] && customConfig[modulo][propriedade] !== undefined) {
          // Converter valor baseado no tipo
          if (valor === 'true' || valor === 'false') {
            customConfig[modulo][propriedade] = valor === 'true';
          } else if (!isNaN(Number(valor))) {
            customConfig[modulo][propriedade] = Number(valor);
          } else if (valor === 'ilimitado') {
            customConfig[modulo][propriedade] = 'ilimitado';
          } else {
            customConfig[modulo][propriedade] = valor;
          }
        }
      }
    }

    return customConfig;
  }

  /**
   * Obtém informações resumidas do plano do usuário
   */
  async getUserPlanInfo(usuario: Usuario): Promise<{
    plano: string;
    status: string;
    modulosDisponiveis: string[];
    limitesImportantes: Record<string, any>;
  }> {
    try {
      const planoModulos = await this.getUserPlanModules(usuario);
      
      // Buscar assinatura para obter informações do plano
      const assinatura = await this.assinaturaRepository.findOne({
        where: {
          tenantId: usuario.tenantId,
          status: StatusAssinatura.ATIVA,
        },
        relations: ['plano'],
      });

      const modulosDisponiveis = Object.keys(planoModulos).filter(modulo => {
        const config = planoModulos[modulo];
        return Object.values(config).some(valor => valor === true || valor === 'ilimitado');
      });

      const limitesImportantes = {
        transacoes: planoModulos.transacoes.limite,
        veiculos: planoModulos.veiculos.limite,
        usuarios: planoModulos.usuarios.limite,
        backup_frequencia: planoModulos.backup.frequencia_dias,
        suporte_sla: planoModulos.suporte.sla_horas,
      };

      return {
        plano: assinatura?.plano.nome || 'Não identificado',
        status: assinatura?.status || 'Inativo',
        modulosDisponiveis,
        limitesImportantes,
      };
    } catch (error) {
      return {
        plano: 'Erro',
        status: 'Erro',
        modulosDisponiveis: [],
        limitesImportantes: {},
      };
    }
  }
}