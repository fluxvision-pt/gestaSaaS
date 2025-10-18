import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Módulos da aplicação
import { AuthModule } from './modules/auth/auth.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { PlanosModule } from './modules/planos/planos.module';
import { AssinaturasModule } from './modules/assinaturas/assinaturas.module';
import { PagamentosModule } from './modules/pagamentos/pagamentos.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { KmModule } from './modules/km/km.module';
import { RelatoriosModule } from './modules/relatorios/relatorios.module';
import { ConfiguracoesModule } from './modules/configuracoes/configuracoes.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';

// Guards
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

// Entidades
import { Tenant } from './modules/tenancy/entities/tenant.entity';
import { Usuario } from './modules/usuarios/entities/usuario.entity';
import { Plano } from './modules/planos/entities/plano.entity';
import { Recurso } from './modules/planos/entities/recurso.entity';
import { PlanoRecurso } from './modules/planos/entities/plano-recurso.entity';
import { Assinatura } from './modules/assinaturas/entities/assinatura.entity';
import { Gateway } from './modules/pagamentos/entities/gateway.entity';
import { CredencialGateway } from './modules/pagamentos/entities/credencial-gateway.entity';
import { Pagamento } from './modules/pagamentos/entities/pagamento.entity';
import { Transacao } from './modules/financeiro/entities/transacao.entity';
import { KmDiario } from './modules/km/entities/km-diario.entity';
import { Configuracao } from './modules/configuracoes/entities/configuracao.entity';
import { Auditoria } from './modules/auditoria/entities/auditoria.entity';

@Module({
  imports: [
    // Configuração global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuração do banco de dados
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [
          Tenant,
          Usuario,
          Plano,
          Recurso,
          PlanoRecurso,
          Assinatura,
          Gateway,
          CredencialGateway,
          Pagamento,
          Transacao,
          KmDiario,
          Configuracao,
          Auditoria,
        ],
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL') || 60000, // 1 minuto
          limit: configService.get('THROTTLE_LIMIT') || 100, // 100 requests por minuto
        },
      ],
    }),

    // Módulos da aplicação
    AuthModule,
    TenancyModule,
    UsuariosModule,
    PlanosModule,
    AssinaturasModule,
    PagamentosModule,
    FinanceiroModule,
    KmModule,
    RelatoriosModule,
    ConfiguracoesModule,
    AuditoriaModule,
  ],
  providers: [
    // Guard global para JWT
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}