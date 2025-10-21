import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { Gateway } from '../entities/gateway.entity'
import { CredencialGateway } from '../entities/credencial-gateway.entity'
import { Pagamento } from '../entities/pagamento.entity'
import { StatusPagamento } from '../entities/pagamento.entity'

export interface MercadoPagoPreference {
  id: string
  init_point: string
  sandbox_init_point: string
  collector_id: number
  client_id: string
  marketplace: string
  operation_type: string
  additional_info: string
  external_reference: string
  preference_id: string
  site_id: string
  processing_mode: string
  merchant_account_id: string
}

export interface MercadoPagoPayment {
  id: number
  status: string
  status_detail: string
  payment_method_id: string
  payment_type_id: string
  transaction_amount: number
  currency_id: string
  external_reference: string
  description: string
  payer: {
    id: string
    email: string
    identification: {
      type: string
      number: string
    }
  }
  date_created: string
  date_approved: string
  date_last_updated: string
}

export interface CreatePreferenceRequest {
  items: Array<{
    title: string
    quantity: number
    unit_price: number
    currency_id?: string
  }>
  external_reference: string
  notification_url?: string
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: 'approved' | 'all'
  payer?: {
    name?: string
    surname?: string
    email?: string
    phone?: {
      area_code?: string
      number?: string
    }
    identification?: {
      type?: string
      number?: string
    }
    address?: {
      street_name?: string
      street_number?: number
      zip_code?: string
    }
  }
}

export interface MercadoPagoStatusResponse {
  configured: boolean
  testMode: boolean
  message?: string
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name)
  private client: MercadoPagoConfig | null = null

  constructor(
    @InjectRepository(Gateway)
    private gatewayRepository: Repository<Gateway>,
    @InjectRepository(CredencialGateway)
    private credencialGatewayRepository: Repository<CredencialGateway>,
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>
  ) {}

  private async initializeClient(): Promise<MercadoPagoConfig | null> {
    try {
      const gateway = await this.gatewayRepository.findOne({
        where: { nome: 'Mercado Pago', ativo: true }
      })

      if (!gateway) {
        this.logger.warn('Gateway Mercado Pago não encontrado ou inativo')
        return null
      }

      const credenciais = await this.credencialGatewayRepository.find({
        where: { gatewayId: gateway.id }
      })

      const accessToken = credenciais.find(c => c.chave === 'access_token')?.valor
      const testMode = credenciais.find(c => c.chave === 'test_mode')?.valor === 'true'

      if (!accessToken) {
        this.logger.warn('Access token do Mercado Pago não configurado')
        return null
      }

      this.client = new MercadoPagoConfig({
        accessToken,
        options: {
          timeout: 5000,
          idempotencyKey: 'abc'
        }
      })

      this.logger.log(`Mercado Pago inicializado - Modo: ${testMode ? 'Teste' : 'Produção'}`)
      return this.client

    } catch (error) {
      this.logger.error('Erro ao inicializar Mercado Pago:', error)
      return null
    }
  }

  async createPreference(data: CreatePreferenceRequest): Promise<MercadoPagoPreference> {
    const client = await this.initializeClient()
    if (!client) {
      throw new Error('Mercado Pago não configurado')
    }

    try {
      const preference = new Preference(client)
      
      const preferenceData = {
        items: data.items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id || 'BRL'
        })),
        external_reference: data.external_reference,
        notification_url: data.notification_url,
        back_urls: data.back_urls,
        auto_return: data.auto_return || 'approved',
        payer: data.payer
      }

      const response = await preference.create({ body: preferenceData })
      
      this.logger.log(`Preferência criada: ${response.id}`)
      return response as MercadoPagoPreference

    } catch (error) {
      this.logger.error('Erro ao criar preferência:', error)
      throw new Error('Falha ao criar preferência de pagamento')
    }
  }

  async getPayment(paymentId: string): Promise<MercadoPagoPayment> {
    const client = await this.initializeClient()
    if (!client) {
      throw new Error('Mercado Pago não configurado')
    }

    try {
      const payment = new Payment(client)
      const response = await payment.get({ id: paymentId })
      
      return response as MercadoPagoPayment

    } catch (error) {
      this.logger.error('Erro ao buscar pagamento:', error)
      throw new Error('Falha ao buscar pagamento')
    }
  }

  async processWebhook(paymentId: string): Promise<void> {
    try {
      const paymentData = await this.getPayment(paymentId)
      
      if (!paymentData.external_reference) {
        this.logger.warn(`Pagamento ${paymentId} sem referência externa`)
        return
      }

      // Buscar pagamento no banco de dados
      const pagamento = await this.pagamentoRepository.findOne({
        where: { referenciaExterna: paymentData.external_reference }
      })

      if (!pagamento) {
        this.logger.warn(`Pagamento não encontrado: ${paymentData.external_reference}`)
        return
      }

      // Atualizar status do pagamento
      let novoStatus: StatusPagamento

      switch (paymentData.status) {
        case 'approved':
          novoStatus = StatusPagamento.APROVADO
          break
        case 'pending':
        case 'in_process':
          novoStatus = StatusPagamento.PENDENTE
          break
        case 'rejected':
        case 'cancelled':
          novoStatus = StatusPagamento.FALHOU
          break
        default:
          this.logger.warn(`Status desconhecido: ${paymentData.status}`)
          return
      }

      pagamento.status = novoStatus
      pagamento.atualizadoEm = new Date()

      await this.pagamentoRepository.save(pagamento)
      
      this.logger.log(`Pagamento ${pagamento.id} atualizado para ${novoStatus}`)

    } catch (error) {
      this.logger.error('Erro ao processar webhook:', error)
      throw error
    }
  }

  async checkStatus(): Promise<MercadoPagoStatusResponse> {
    try {
      const gateway = await this.gatewayRepository.findOne({
        where: { nome: 'Mercado Pago' }
      })

      if (!gateway) {
        return {
          configured: false,
          testMode: false,
          message: 'Gateway Mercado Pago não encontrado'
        }
      }

      const credenciais = await this.credencialGatewayRepository.find({
        where: { gatewayId: gateway.id }
      })

      const accessToken = credenciais.find(c => c.chave === 'access_token')?.valor
      const testMode = credenciais.find(c => c.chave === 'test_mode')?.valor === 'true'

      if (!accessToken) {
        return {
          configured: false,
          testMode: false,
          message: 'Access token não configurado'
        }
      }

      // Testar conexão
      const client = await this.initializeClient()
      if (!client) {
        return {
          configured: false,
          testMode: false,
          message: 'Falha ao conectar com Mercado Pago'
        }
      }

      return {
        configured: true,
        testMode: testMode || false,
        message: 'Mercado Pago configurado corretamente'
      }

    } catch (error) {
      this.logger.error('Erro ao verificar status:', error)
      return {
        configured: false,
        testMode: false,
        message: 'Erro ao verificar configuração'
      }
    }
  }
}