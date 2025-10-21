import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanosController } from './planos.controller';
import { PlanosService } from './planos.service';
import { Plano } from './entities/plano.entity';
import { Recurso } from './entities/recurso.entity';
import { PlanoRecurso } from './entities/plano-recurso.entity';
import { Assinatura } from '../assinaturas/entities/assinatura.entity';

// Serviços de autorização
import { ModuleAuthorizationService } from './services/module-authorization.service';

// Guards de módulos
import {
  ModuleGuard,
  TransacoesGuard,
  VeiculosGuard,
  RelatoriosGuard,
  DashboardGuard,
  UsuariosModuleGuard,
  IntegracoesGuard,
  LimitGuard,
} from './guards/module.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plano, 
      Recurso, 
      PlanoRecurso, 
      Assinatura
    ])
  ],
  controllers: [PlanosController],
  providers: [
    PlanosService,
    ModuleAuthorizationService,
    ModuleGuard,
    TransacoesGuard,
    VeiculosGuard,
    RelatoriosGuard,
    DashboardGuard,
    UsuariosModuleGuard,
    IntegracoesGuard,
    LimitGuard,
  ],
  exports: [
    PlanosService,
    ModuleAuthorizationService,
    ModuleGuard,
    TransacoesGuard,
    VeiculosGuard,
    RelatoriosGuard,
    DashboardGuard,
    UsuariosModuleGuard,
    IntegracoesGuard,
    LimitGuard,
  ],
})
export class PlanosModule {}