import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { Transacao } from './entities/transacao.entity';
import { PlanosModule } from '../planos/planos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transacao]),
    PlanosModule,
  ],
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}