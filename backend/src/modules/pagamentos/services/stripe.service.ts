import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagamento, StatusPagamento } from '../entities/pagamento.entity';
import { Gateway } from '../entities/gateway.entity';
import { CredencialGateway } from '../entities/credencial-gateway.entity';

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface StripeSubscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  customer: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Gateway)
    private gatewayRepository: Repository<Gateway>,
    @InjectRepository(CredencialGateway)
    private credencialRepository: Repository<CredencialGateway>,
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>,
  ) {
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      // Buscar credenciais do Stripe no banco
      const stripeGateway = await this.gatewayRepository.findOne({
        where: { nome: 'Stripe', ativo: true },
        relations: ['credenciais'],
      });

      if (!stripeGateway) {
        this.logger.warn('Gateway Stripe não encontrado ou inativo');
        return;
      }

      const secretKey = stripeGateway.credenciais?.find(
        (cred) => cred.chave === 'secret_key'
      )?.valor;

      if (!secretKey) {
        this.logger.warn('Chave secreta do Stripe não configurada');
        return;
      }

      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-09-30.clover',
      });

      this.logger.log('Stripe inicializado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao inicializar Stripe:', error);
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'brl',
    metadata?: Record<string, string>
  ): Promise<StripePaymentIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não está configurado');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Converter para centavos
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
      };
    } catch (error) {
      this.logger.error('Erro ao criar PaymentIntent:', error);
      throw new BadRequestException('Erro ao processar pagamento');
    }
  }

  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não está configurado');
    }

    try {
      return await this.stripe.customers.create({
        email,
        name,
        metadata,
      });
    } catch (error) {
      this.logger.error('Erro ao criar cliente:', error);
      throw new BadRequestException('Erro ao criar cliente');
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>
  ): Promise<StripeSubscription> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não está configurado');
    }

    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      const sub = subscription as any; // Stripe subscription object
      return {
        id: sub.id,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        customer: sub.customer as string,
      };
    } catch (error) {
      this.logger.error('Erro ao criar assinatura:', error);
      throw new BadRequestException('Erro ao criar assinatura');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não está configurado');
    }

    try {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      this.logger.error('Erro ao cancelar assinatura:', error);
      throw new BadRequestException('Erro ao cancelar assinatura');
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não está configurado');
    }

    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error('Erro ao buscar PaymentIntent:', error);
      throw new BadRequestException('Erro ao buscar pagamento');
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não está configurado');
    }

    try {
      // Buscar webhook secret
      const stripeGateway = await this.gatewayRepository.findOne({
        where: { nome: 'Stripe', ativo: true },
        relations: ['credenciais'],
      });

      const webhookSecret = stripeGateway?.credenciais?.find(
        (cred) => cred.chave === 'webhook_secret'
      )?.valor;

      if (!webhookSecret) {
        throw new BadRequestException('Webhook secret não configurado');
      }

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      this.logger.log(`Webhook recebido: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          this.logger.log(`Evento não tratado: ${event.type}`);
      }
    } catch (error) {
      this.logger.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const pagamento = await this.pagamentoRepository.findOne({
        where: { referenciaExterna: paymentIntent.id },
      });

      if (pagamento) {
        pagamento.status = StatusPagamento.APROVADO;
        await this.pagamentoRepository.save(pagamento);
        this.logger.log(`Pagamento ${pagamento.id} marcado como aprovado`);
      }
    } catch (error) {
      this.logger.error('Erro ao processar pagamento bem-sucedido:', error);
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const pagamento = await this.pagamentoRepository.findOne({
        where: { referenciaExterna: paymentIntent.id },
      });

      if (pagamento) {
        pagamento.status = StatusPagamento.FALHOU;
        await this.pagamentoRepository.save(pagamento);
        this.logger.log(`Pagamento ${pagamento.id} marcado como falhou`);
      }
    } catch (error) {
      this.logger.error('Erro ao processar falha de pagamento:', error);
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    try {
      this.logger.log(`Pagamento da fatura ${invoice.id} bem-sucedido`);
      
      // Buscar assinatura relacionada
      if (invoice.subscription && typeof invoice.subscription === 'string') {
        const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
        
        // Atualizar status da assinatura no banco de dados
        // Aqui você pode integrar com o AssinaturasService para atualizar o status
        this.logger.log(`Atualizando status da assinatura ${subscription.id} para ativa`);
      }
    } catch (error) {
      this.logger.error('Erro ao processar pagamento bem-sucedido:', error);
    }
  }

  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    try {
      this.logger.log(`Falha no pagamento da fatura ${invoice.id}`);
      
      // Buscar assinatura relacionada
      if (invoice.subscription && typeof invoice.subscription === 'string') {
        const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
        
        // Marcar assinatura como inadimplente
        this.logger.log(`Marcando assinatura ${subscription.id} como inadimplente`);
        
        // Implementar lógica de retry ou suspensão
        if (invoice.attempt_count && invoice.attempt_count >= 3) {
          this.logger.log(`Suspendendo assinatura ${subscription.id} após 3 tentativas falhadas`);
        }
      }
    } catch (error) {
      this.logger.error('Erro ao processar falha no pagamento:', error);
    }
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    try {
      this.logger.log(`Assinatura ${subscription.id} atualizada - Status: ${subscription.status}`);
      
      // Atualizar dados da assinatura no banco de dados
      const updateData = {
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      };
      
      this.logger.log(`Dados para atualização:`, updateData);
      // Aqui você pode integrar com o AssinaturasService
    } catch (error) {
      this.logger.error('Erro ao processar atualização de assinatura:', error);
    }
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    try {
      this.logger.log(`Assinatura ${subscription.id} cancelada definitivamente`);
      
      // Marcar assinatura como cancelada no banco de dados
      // Aqui você pode integrar com o AssinaturasService para cancelar a assinatura
      this.logger.log(`Cancelando assinatura ${subscription.id} no sistema`);
    } catch (error) {
      this.logger.error('Erro ao processar cancelamento de assinatura:', error);
    }
  }

  async createPrice(
    amount: number,
    currency: string = 'brl',
    interval: 'month' | 'year' = 'month',
    productName: string
  ): Promise<Stripe.Price> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não está configurado');
    }

    try {
      // Primeiro criar o produto
      const product = await this.stripe.products.create({
        name: productName,
      });

      // Depois criar o preço
      return await this.stripe.prices.create({
        unit_amount: Math.round(amount * 100),
        currency,
        recurring: { interval },
        product: product.id,
      });
    } catch (error) {
      this.logger.error('Erro ao criar preço:', error);
      throw new BadRequestException('Erro ao criar preço');
    }
  }

  isConfigured(): boolean {
    return !!this.stripe;
  }
}