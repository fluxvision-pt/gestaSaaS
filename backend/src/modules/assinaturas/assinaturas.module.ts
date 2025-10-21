import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assinatura } from './entities/assinatura.entity';
import { Plano } from '../planos/entities/plano.entity';
import { Pagamento } from '../pagamentos/entities/pagamento.entity';
import { Gateway } from '../pagamentos/entities/gateway.entity';
import { AssinaturasService } from './assinaturas.service';
import { AssinaturasController } from './assinaturas.controller';
import { BillingService } from './billing.service';
import { PagamentosModule } from '../pagamentos/pagamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assinatura, Plano, Pagamento, Gateway]),
    PagamentosModule,
  ],
  controllers: [AssinaturasController],
  providers: [AssinaturasService, BillingService],
  exports: [AssinaturasService, BillingService],
})
export class AssinaturasModule {}