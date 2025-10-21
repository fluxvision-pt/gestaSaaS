import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';
import { GatewaysController } from './gateways.controller';
import { GatewaysService } from './gateways.service';
import { StripeService } from './services/stripe.service';
import { MercadoPagoService } from './services/mercado-pago.service';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { StripePaymentController } from './controllers/stripe-payment.controller';
import { MercadoPagoController } from './controllers/mercado-pago.controller';
import { Gateway } from './entities/gateway.entity';
import { CredencialGateway } from './entities/credencial-gateway.entity';
import { Pagamento } from './entities/pagamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gateway, CredencialGateway, Pagamento])],
  controllers: [
    PagamentosController, 
    GatewaysController, 
    StripeWebhookController, 
    StripePaymentController,
    MercadoPagoController
  ],
  providers: [PagamentosService, GatewaysService, StripeService, MercadoPagoService],
  exports: [PagamentosService, GatewaysService, StripeService, MercadoPagoService],
})
export class PagamentosModule {}