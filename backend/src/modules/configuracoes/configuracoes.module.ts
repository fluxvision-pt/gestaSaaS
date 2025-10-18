import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { ConfiguracoesController } from './configuracoes.controller';
// import { ConfiguracoesService } from './configuracoes.service';
import { Configuracao } from './entities/configuracao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Configuracao])],
  // controllers: [ConfiguracoesController],
  // providers: [ConfiguracoesService],
  // exports: [ConfiguracoesService],
})
export class ConfiguracoesModule {}