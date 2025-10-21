import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  HttpStatus, 
  HttpException,
  Logger,
  Query,
  Headers
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { MercadoPagoService, CreatePreferenceRequest, MercadoPagoStatusResponse } from '../services/mercado-pago.service'

class CreatePreferenceDto {
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

class WebhookDto {
  id?: string
  live_mode?: boolean
  type?: string
  date_created?: string
  application_id?: string
  user_id?: string
  version?: number
  api_version?: string
  action?: string
  data?: {
    id?: string
  }
}

@ApiTags('Mercado Pago')
@Controller('mercado-pago')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name)

  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @Post('create-preference')
  @ApiOperation({ summary: 'Criar preferência de pagamento' })
  @ApiBody({ type: CreatePreferenceDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Preferência criada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        init_point: { type: 'string' },
        sandbox_init_point: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async createPreference(@Body() createPreferenceDto: CreatePreferenceDto) {
    try {
      this.logger.log('Criando preferência de pagamento')
      
      const preference = await this.mercadoPagoService.createPreference(createPreferenceDto)
      
      return {
        success: true,
        data: {
          id: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point
        }
      }
    } catch (error) {
      this.logger.error('Erro ao criar preferência:', error)
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro ao criar preferência de pagamento'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get('payment/:id')
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pagamento encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        status: { type: 'string' },
        status_detail: { type: 'string' },
        payment_method_id: { type: 'string' },
        transaction_amount: { type: 'number' },
        currency_id: { type: 'string' },
        external_reference: { type: 'string' },
        description: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getPayment(@Param('id') id: string) {
    try {
      this.logger.log(`Buscando pagamento: ${id}`)
      
      const payment = await this.mercadoPagoService.getPayment(id)
      
      return {
        success: true,
        data: payment
      }
    } catch (error) {
      this.logger.error('Erro ao buscar pagamento:', error)
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro ao buscar pagamento'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook do Mercado Pago' })
  @ApiResponse({ status: 200, description: 'Webhook processado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados do webhook inválidos' })
  async handleWebhook(
    @Body() webhookData: WebhookDto,
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') requestId?: string
  ) {
    try {
      this.logger.log(`Webhook recebido: ${JSON.stringify(webhookData)}`)
      
      // Verificar se é um webhook de pagamento
      if (webhookData.type !== 'payment') {
        this.logger.log(`Tipo de webhook ignorado: ${webhookData.type}`)
        return { success: true, message: 'Webhook ignorado' }
      }

      // Verificar se tem ID do pagamento
      if (!webhookData.data?.id) {
        this.logger.warn('Webhook sem ID de pagamento')
        return { success: false, message: 'ID de pagamento não encontrado' }
      }

      // Processar webhook
      await this.mercadoPagoService.processWebhook(webhookData.data.id)
      
      return { success: true, message: 'Webhook processado com sucesso' }
      
    } catch (error) {
      this.logger.error('Erro ao processar webhook:', error)
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro ao processar webhook'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Verificar status da configuração do Mercado Pago' })
  @ApiResponse({ 
    status: 200, 
    description: 'Status da configuração',
    schema: {
      type: 'object',
      properties: {
        configured: { type: 'boolean' },
        testMode: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async getStatus(): Promise<{ success: boolean; data: MercadoPagoStatusResponse }> {
    try {
      const status = await this.mercadoPagoService.checkStatus()
      
      return {
        success: true,
        data: status
      }
    } catch (error) {
      this.logger.error('Erro ao verificar status:', error)
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro ao verificar status'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Post('create-payment')
  @ApiOperation({ summary: 'Criar pagamento direto (para assinaturas)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Valor em centavos' },
        currency: { type: 'string', default: 'BRL' },
        description: { type: 'string' },
        external_reference: { type: 'string' },
        payer: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            name: { type: 'string' },
            surname: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Pagamento criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        init_point: { type: 'string' },
        sandbox_init_point: { type: 'string' }
      }
    }
  })
  async createPayment(@Body() paymentData: {
    amount: number
    currency?: string
    description: string
    external_reference: string
    payer?: {
      email?: string
      name?: string
      surname?: string
    }
  }) {
    try {
      this.logger.log('Criando pagamento direto')
      
      const preferenceData: CreatePreferenceRequest = {
        items: [{
          title: paymentData.description,
          quantity: 1,
          unit_price: paymentData.amount / 100, // Converter de centavos para reais
          currency_id: paymentData.currency || 'BRL'
        }],
        external_reference: paymentData.external_reference,
        payer: paymentData.payer
      }
      
      const preference = await this.mercadoPagoService.createPreference(preferenceData)
      
      return {
        success: true,
        data: {
          id: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point
        }
      }
    } catch (error) {
      this.logger.error('Erro ao criar pagamento:', error)
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro ao criar pagamento'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}