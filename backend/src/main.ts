import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Servir arquivos estáticos do frontend
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    index: false,
  });

  // Servir o index.html para rotas SPA
  app.use('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  // Segurança
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilita CSP para permitir assets do frontend
  }));
  app.use(compression());

  // CORS
  // CORS — configuração dinâmica e compatível com produção
const allowedOrigins =
  configService.get('ALLOWLIST_ORIGINS')?.split(',') || [
    'https://app.fluxvision.cloud',
    'http://localhost:5173',
  ];

app.enableCors({
  origin: (origin, callback) => {
    // Permitir chamadas internas sem origin (como healthchecks)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('🚫 Origem bloqueada pelo CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders:
    'Content-Type, Accept, Authorization, X-Requested-With, Origin',
});


  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Prefixo global da API
  app.setGlobalPrefix('api/v1');

  // Documentação Swagger
  const config = new DocumentBuilder()
    .setTitle('Gesta SaaS Financeiro API')
    .setDescription('API do sistema de gestão financeira para motoristas de aplicativo')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e autorização')
    .addTag('tenancy', 'Gestão de tenants')
    .addTag('usuarios', 'Gestão de usuários')
    .addTag('planos', 'Gestão de planos e recursos')
    .addTag('assinaturas', 'Gestão de assinaturas')
    .addTag('pagamentos', 'Gestão de pagamentos')
    .addTag('financeiro', 'Gestão financeira')
    .addTag('km', 'Controle de quilometragem')
    .addTag('relatorios', 'Relatórios e análises')
    .addTag('configuracoes', 'Configurações do sistema')
    .addTag('auditoria', 'Auditoria e logs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('APP_PORT') || process.env.PORT || 3001;
await app.listen(port, '0.0.0.0');

console.log(`🚀 Gesta SaaS Backend rodando na porta ${port}`);
console.log(`📚 Documentação disponível em http://localhost:${port}/api/docs`);

}

bootstrap();
