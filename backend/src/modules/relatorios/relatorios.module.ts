import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { RelatoriosController } from './relatorios.controller';
// import { RelatoriosService } from './relatorios.service';
import { Transacao } from '../financeiro/entities/transacao.entity';
import { KmDiario } from '../km/entities/km-diario.entity';
import { Assinatura } from '../assinaturas/entities/assinatura.entity';
import { Pagamento } from '../pagamentos/entities/pagamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transacao, KmDiario, Assinatura, Pagamento])],
  // controllers: [RelatoriosController],
  // providers: [RelatoriosService],
  // exports: [RelatoriosService],
})
export class RelatoriosModule {}