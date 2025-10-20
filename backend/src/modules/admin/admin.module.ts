import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

// Importar entidades necessárias
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Tenant } from '../tenancy/entities/tenant.entity';
import { Plano } from '../planos/entities/plano.entity';
import { Assinatura } from '../assinaturas/entities/assinatura.entity';
import { Transacao } from '../financeiro/entities/transacao.entity';
import { Pagamento } from '../pagamentos/entities/pagamento.entity';
import { KmDiario } from '../km/entities/km-diario.entity';
import { Auditoria } from '../auditoria/entities/auditoria.entity';
import { Configuracao } from '../configuracoes/entities/configuracao.entity';

// Importar módulos relacionados
import { UsuariosModule } from '../usuarios/usuarios.module';
import { TenancyModule } from '../tenancy/tenancy.module';
import { PlanosModule } from '../planos/planos.module';
import { AssinaturasModule } from '../assinaturas/assinaturas.module';
import { PagamentosModule } from '../pagamentos/pagamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Tenant,
      Plano,
      Assinatura,
      Transacao,
      Pagamento,
      KmDiario,
      Auditoria,
      Configuracao,
    ]),
    UsuariosModule,
    TenancyModule,
    PlanosModule,
    AssinaturasModule,
    PagamentosModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}