import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PerfilUsuario } from '../../usuarios/entities/usuario.entity';
import { StripeService, StripePaymentIntent, StripeSubscription } from '../services/stripe.service';

class CreatePaymentIntentDto {
  amount: number;
  currency?: string;
  assinaturaId?: string;
  description?: string;
}

class CreateCustomerDto {
  email: string;
  name?: string;
}

class CreateSubscriptionDto {
  customerId: string;
  priceId: string;
  assinaturaId?: string;
}

@ApiTags('Stripe Payments')
@Controller('stripe')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StripePaymentController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('payment-intent')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN, PerfilUsuario.CLIENTE_USER)
  @ApiOperation({ summary: 'Criar PaymentIntent do Stripe' })
  @ApiResponse({ status: 201, description: 'PaymentIntent criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao criar PaymentIntent.' })
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Request() req
  ): Promise<StripePaymentIntent> {
    const metadata: Record<string, string> = {
      tenantId: req.user.tenantId,
      userId: req.user.sub,
    };

    if (createPaymentIntentDto.assinaturaId) {
      metadata.assinaturaId = createPaymentIntentDto.assinaturaId;
    }

    if (createPaymentIntentDto.description) {
      metadata.description = createPaymentIntentDto.description;
    }

    return this.stripeService.createPaymentIntent(
      createPaymentIntentDto.amount,
      createPaymentIntentDto.currency || 'brl',
      metadata
    );
  }

  @Post('customer')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Criar cliente no Stripe' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao criar cliente.' })
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @Request() req
  ) {
    const metadata = {
      tenantId: req.user.tenantId,
      userId: req.user.sub,
    };

    return this.stripeService.createCustomer(
      createCustomerDto.email,
      createCustomerDto.name,
      metadata
    );
  }

  @Post('subscription')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Criar assinatura no Stripe' })
  @ApiResponse({ status: 201, description: 'Assinatura criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao criar assinatura.' })
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req
  ): Promise<StripeSubscription> {
    const metadata: Record<string, string> = {
      tenantId: req.user.tenantId,
      userId: req.user.sub,
    };

    if (createSubscriptionDto.assinaturaId) {
      metadata.assinaturaId = createSubscriptionDto.assinaturaId;
    }

    return this.stripeService.createSubscription(
      createSubscriptionDto.customerId,
      createSubscriptionDto.priceId,
      metadata
    );
  }

  @Post('subscription/:id/cancel')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Cancelar assinatura no Stripe' })
  @ApiResponse({ status: 200, description: 'Assinatura cancelada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao cancelar assinatura.' })
  async cancelSubscription(@Param('id') subscriptionId: string) {
    return this.stripeService.cancelSubscription(subscriptionId);
  }

  @Get('payment-intent/:id')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN, PerfilUsuario.CLIENTE_USER)
  @ApiOperation({ summary: 'Buscar PaymentIntent do Stripe' })
  @ApiResponse({ status: 200, description: 'PaymentIntent encontrado.' })
  @ApiResponse({ status: 404, description: 'PaymentIntent não encontrado.' })
  async getPaymentIntent(@Param('id') paymentIntentId: string) {
    return this.stripeService.retrievePaymentIntent(paymentIntentId);
  }

  @Get('status')
  @Roles(PerfilUsuario.SUPER_ADMIN, PerfilUsuario.CLIENTE_ADMIN)
  @ApiOperation({ summary: 'Verificar status da configuração do Stripe' })
  @ApiResponse({ status: 200, description: 'Status da configuração.' })
  async getStripeStatus() {
    return {
      configured: this.stripeService.isConfigured(),
      message: this.stripeService.isConfigured() 
        ? 'Stripe configurado e pronto para uso' 
        : 'Stripe não está configurado. Verifique as credenciais.'
    };
  }
}