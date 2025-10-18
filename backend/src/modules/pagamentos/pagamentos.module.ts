import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';
import { Gateway } from './entities/gateway.entity';
import { CredencialGateway } from './entities/credencial-gateway.entity';
import { Pagamento } from './entities/pagamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gateway, CredencialGateway, Pagamento])],
  controllers: [PagamentosController],
  providers: [PagamentosService],
  exports: [PagamentosService],
})
export class PagamentosModule {}