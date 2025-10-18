import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanosController } from './planos.controller';
import { PlanosService } from './planos.service';
import { Plano } from './entities/plano.entity';
import { Recurso } from './entities/recurso.entity';
import { PlanoRecurso } from './entities/plano-recurso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plano, Recurso, PlanoRecurso])],
  controllers: [PlanosController],
  providers: [PlanosService],
  exports: [PlanosService],
})
export class PlanosModule {}