import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assinatura } from './entities/assinatura.entity';
import { Plano } from '../planos/entities/plano.entity';
import { AssinaturasService } from './assinaturas.service';
import { AssinaturasController } from './assinaturas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Assinatura, Plano])],
  controllers: [AssinaturasController],
  providers: [AssinaturasService],
  exports: [AssinaturasService],
})
export class AssinaturasModule {}