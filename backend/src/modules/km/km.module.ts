import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { KmController } from './km.controller';
// import { KmService } from './km.service';
import { KmDiario } from './entities/km-diario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KmDiario])],
  // controllers: [KmController],
  // providers: [KmService],
  // exports: [KmService],
})
export class KmModule {}