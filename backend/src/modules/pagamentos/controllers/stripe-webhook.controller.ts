import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Logger, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StripeService } from '../services/stripe.service';
import { Request } from 'express';

@ApiTags('Stripe Webhooks')
@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook do Stripe para eventos de pagamento' })
  @ApiResponse({ status: 200, description: 'Webhook processado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao processar webhook.' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    try {
      const payload = req.rawBody?.toString() || '';
      
      if (!signature) {
        this.logger.error('Assinatura do webhook não encontrada');
        throw new Error('Assinatura do webhook não encontrada');
      }

      await this.stripeService.handleWebhook(payload, signature);
      
      this.logger.log('Webhook do Stripe processado com sucesso');
      return { received: true };
    } catch (error) {
      this.logger.error('Erro ao processar webhook do Stripe:', error);
      throw error;
    }
  }
}