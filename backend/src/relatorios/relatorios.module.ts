import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelatoriosController } from './relatorios.controller';
import { RelatoriosService } from './relatorios.service';
import { Usuario } from '../modules/usuarios/entities/usuario.entity';
import { Tenant } from '../modules/tenancy/entities/tenant.entity';
import { Assinatura } from '../modules/assinaturas/entities/assinatura.entity';
import { Auditoria } from '../modules/auditoria/entities/auditoria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Tenant,
      Assinatura,
      Auditoria,
    ]),
  ],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
  exports: [RelatoriosService],
})
export class RelatoriosModule {}