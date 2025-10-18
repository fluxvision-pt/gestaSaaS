import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Segurança
  app.use(helmet());
  app.use(compression());

  // CORS
  const allowedOrigins = configService.get('ALLOWLIST_ORIGINS')?.split(',') || ['http://localhost:3000'];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
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

  const port = configService.get('APP_PORT') || 8080;
  await app.listen(port);

  console.log(`🚀 Gesta SaaS Backend rodando na porta ${port}`);
  console.log(`📚 Documentação disponível em http://localhost:${port}/api/docs`);
}

bootstrap();