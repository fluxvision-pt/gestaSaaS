import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Assinatura, StatusAssinatura, StatusPagamentoAssinatura, CicloAssinatura } from './entities/assinatura.entity';
import { Pagamento, StatusPagamento } from '../pagamentos/entities/pagamento.entity';
import { StripeService } from '../pagamentos/services/stripe.service';
import { MercadoPagoService } from '../pagamentos/services/mercado-pago.service';
import { Gateway } from '../pagamentos/entities/gateway.entity';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Assinatura)
    private assinaturaRepository: Repository<Assinatura>,
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>,
    @InjectRepository(Gateway)
    private gatewayRepository: Repository<Gateway>,
    private stripeService: StripeService,
    private mercadoPagoService: MercadoPagoService,
  ) {}

  /**
   * Job que executa diariamente às 6h para processar cobranças vencidas
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async processarCobrancasVencidas(): Promise<void> {
    this.logger.log('Iniciando processamento de cobranças vencidas...');

    try {
      const assinaturasVencidas = await this.buscarAssinaturasVencidas();
      this.logger.log(`Encontradas ${assinaturasVencidas.length} assinaturas vencidas`);

      for (const assinatura of assinaturasVencidas) {
        await this.processarCobrancaAssinatura(assinatura);
      }

      this.logger.log('Processamento de cobranças vencidas concluído');
    } catch (error) {
      this.logger.error('Erro ao processar cobranças vencidas:', error);
    }
  }

  /**
   * Job que executa diariamente às 8h para processar renovações automáticas
   */
  @Cron('0 8 * * *')
  async processarRenovacoesAutomaticas(): Promise<void> {
    this.logger.log('Iniciando processamento de renovações automáticas...');

    try {
      const assinaturasParaRenovar = await this.buscarAssinaturasParaRenovar();
      this.logger.log(`Encontradas ${assinaturasParaRenovar.length} assinaturas para renovar`);

      for (const assinatura of assinaturasParaRenovar) {
        await this.processarRenovacaoAssinatura(assinatura);
      }

      this.logger.log('Processamento de renovações automáticas concluído');
    } catch (error) {
      this.logger.error('Erro ao processar renovações automáticas:', error);
    }
  }

  /**
   * Busca assinaturas com pagamentos vencidos
   */
  private async buscarAssinaturasVencidas(): Promise<Assinatura[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return this.assinaturaRepository
      .createQueryBuilder('assinatura')
      .leftJoinAndSelect('assinatura.pagamentos', 'pagamento')
      .leftJoinAndSelect('assinatura.plano', 'plano')
      .leftJoinAndSelect('assinatura.tenant', 'tenant')
      .where('assinatura.status = :status', { status: StatusAssinatura.ATIVA })
      .andWhere('assinatura.statusPagamento = :statusPagamento', { 
        statusPagamento: StatusPagamentoAssinatura.PENDENTE 
      })
      .andWhere('assinatura.renovacaoAutomatica = :renovacao', { renovacao: true })
      .getMany();
  }

  /**
   * Busca assinaturas que precisam ser renovadas (próximas ao vencimento)
   */
  private async buscarAssinaturasParaRenovar(): Promise<Assinatura[]> {
    const hoje = new Date();
    const proximoVencimento = new Date();
    proximoVencimento.setDate(hoje.getDate() + 3); // 3 dias antes do vencimento

    return this.assinaturaRepository
      .createQueryBuilder('assinatura')
      .leftJoinAndSelect('assinatura.plano', 'plano')
      .leftJoinAndSelect('assinatura.tenant', 'tenant')
      .where('assinatura.status = :status', { status: StatusAssinatura.ATIVA })
      .andWhere('assinatura.renovacaoAutomatica = :renovacao', { renovacao: true })
      .andWhere('assinatura.statusPagamento = :statusPagamento', { 
        statusPagamento: StatusPagamentoAssinatura.PAGO 
      })
      .getMany();
  }

  /**
   * Processa cobrança de uma assinatura específica
   */
  private async processarCobrancaAssinatura(assinatura: Assinatura): Promise<void> {
    try {
      this.logger.log(`Processando cobrança da assinatura ${assinatura.id}`);

      // Verificar se já existe um pagamento pendente recente
      const pagamentoPendente = await this.pagamentoRepository.findOne({
        where: {
          assinaturaId: assinatura.id,
          status: StatusPagamento.PENDENTE,
        },
        order: { criadoEm: 'DESC' }
      });

      if (pagamentoPendente) {
        const diasPendente = Math.floor(
          (new Date().getTime() - pagamentoPendente.criadoEm.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasPendente > 7) {
          // Suspender assinatura após 7 dias de inadimplência
          await this.suspenderAssinatura(assinatura);
          return;
        }

        // Se tem pagamento pendente há menos de 7 dias, não criar novo
        return;
      }

      // Criar novo pagamento
      await this.criarPagamentoRecorrente(assinatura);

    } catch (error) {
      this.logger.error(`Erro ao processar cobrança da assinatura ${assinatura.id}:`, error);
    }
  }

  /**
   * Processa renovação automática de uma assinatura
   */
  private async processarRenovacaoAssinatura(assinatura: Assinatura): Promise<void> {
    try {
      this.logger.log(`Processando renovação da assinatura ${assinatura.id}`);

      // Calcular próxima data de vencimento
      const proximoVencimento = this.calcularProximoVencimento(assinatura);

      // Criar pagamento para o próximo período
      await this.criarPagamentoRecorrente(assinatura);

      // Atualizar status da assinatura
      assinatura.statusPagamento = StatusPagamentoAssinatura.PENDENTE;
      await this.assinaturaRepository.save(assinatura);

    } catch (error) {
      this.logger.error(`Erro ao processar renovação da assinatura ${assinatura.id}:`, error);
    }
  }

  /**
   * Cria um pagamento recorrente para a assinatura
   */
  private async criarPagamentoRecorrente(assinatura: Assinatura): Promise<Pagamento> {
    const pagamento = this.pagamentoRepository.create({
      assinaturaId: assinatura.id,
      valorCents: assinatura.precoCents,
      moeda: assinatura.moeda,
      status: StatusPagamento.PENDENTE,
    });

    const pagamentoSalvo = await this.pagamentoRepository.save(pagamento);

    // Tentar processar pagamento automaticamente via Stripe (se configurado)
    try {
      const stripeGateway = await this.gatewayRepository.findOne({
        where: { nome: 'Stripe', ativo: true }
      });

      if (stripeGateway) {
        await this.processarPagamentoStripe(pagamentoSalvo, assinatura);
      }
    } catch (error) {
      this.logger.warn(`Não foi possível processar pagamento automático via Stripe: ${error.message}`);
    }

    return pagamentoSalvo;
  }

  /**
   * Processa pagamento automático via Stripe
   */
  private async processarPagamentoStripe(pagamento: Pagamento, assinatura: Assinatura): Promise<void> {
    try {
      // Aqui você implementaria a lógica para cobrar automaticamente
      // usando um método de pagamento salvo do cliente no Stripe
      this.logger.log(`Tentando cobrança automática via Stripe para pagamento ${pagamento.id}`);
      
      // Exemplo de implementação (você precisaria ter o customer_id e payment_method_id salvos)
      // const paymentIntent = await this.stripeService.createPaymentIntent({
      //   amount: pagamento.valorCents,
      //   currency: pagamento.moeda.toLowerCase(),
      //   customer: assinatura.tenant.stripeCustomerId,
      //   payment_method: assinatura.tenant.stripePaymentMethodId,
      //   confirm: true,
      // });

    } catch (error) {
      this.logger.error(`Erro ao processar pagamento automático via Stripe: ${error.message}`);
    }
  }

  /**
   * Suspende uma assinatura por inadimplência
   */
  private async suspenderAssinatura(assinatura: Assinatura): Promise<void> {
    this.logger.log(`Suspendendo assinatura ${assinatura.id} por inadimplência`);

    assinatura.status = StatusAssinatura.EXPIRADA;
    assinatura.fimEm = new Date();
    
    await this.assinaturaRepository.save(assinatura);

    // Aqui você pode implementar notificações por email, webhook, etc.
    this.logger.log(`Assinatura ${assinatura.id} suspensa por inadimplência`);
  }

  /**
   * Calcula a próxima data de vencimento baseada no ciclo da assinatura
   */
  private calcularProximoVencimento(assinatura: Assinatura): Date {
    const hoje = new Date();
    const proximoVencimento = new Date(hoje);

    switch (assinatura.ciclo) {
      case CicloAssinatura.MENSAL:
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
        break;
      case CicloAssinatura.TRIMESTRAL:
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 3);
        break;
      case CicloAssinatura.SEMESTRAL:
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 6);
        break;
      case CicloAssinatura.ANUAL:
        proximoVencimento.setFullYear(proximoVencimento.getFullYear() + 1);
        break;
    }

    return proximoVencimento;
  }

  /**
   * Método manual para processar cobrança de uma assinatura específica
   */
  async processarCobrancaManual(assinaturaId: string): Promise<void> {
    const assinatura = await this.assinaturaRepository.findOne({
      where: { id: assinaturaId },
      relations: ['plano', 'tenant']
    });

    if (!assinatura) {
      throw new Error('Assinatura não encontrada');
    }

    await this.processarCobrancaAssinatura(assinatura);
  }

  /**
   * Reativar assinatura após pagamento
   */
  async reativarAssinatura(assinaturaId: string): Promise<void> {
    const assinatura = await this.assinaturaRepository.findOne({
      where: { id: assinaturaId }
    });

    if (!assinatura) {
      throw new Error('Assinatura não encontrada');
    }

    assinatura.status = StatusAssinatura.ATIVA;
    assinatura.statusPagamento = StatusPagamentoAssinatura.PAGO;
    assinatura.fimEm = null;

    await this.assinaturaRepository.save(assinatura);
    this.logger.log(`Assinatura ${assinaturaId} reativada`);
  }
}