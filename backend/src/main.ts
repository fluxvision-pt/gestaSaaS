import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

  app.use(helmet());
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe());

  // 🚀 Prefixo global para todas as rotas da API
  app.setGlobalPrefix('api');

  // 📚 Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('GestaSaaS API')
    .setDescription('API para sistema de gestão SaaS com controle de assinaturas, pagamentos e quilometragem')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e autorização')
    .addTag('tenants', 'Gestão de tenants')
    .addTag('usuarios', 'Gestão de usuários')
    .addTag('planos', 'Gestão de planos')
    .addTag('assinaturas', 'Gestão de assinaturas')
    .addTag('pagamentos', 'Gestão de pagamentos')
    .addTag('financeiro', 'Controle financeiro')
    .addTag('km', 'Controle de quilometragem')
    .addTag('relatorios', 'Relatórios')
    .addTag('configuracoes', 'Configurações')
    .addTag('auditoria', 'Auditoria')
    .addTag('health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 🚀 CORS configurado para desenvolvimento e produção
  if (process.env.NODE_ENV === 'development') {
    const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];
    app.enableCors({ origin: corsOrigins, credentials: true });
  } else {
    app.enableCors({ origin: ['https://app.fluxvision.cloud'], credentials: true });
  }

const port = process.env.PORT || 3001;
await app.listen(port);
  
  if (process.env.NODE_ENV === 'development') {
    const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
    console.log(`📚 Documentação disponível em ${baseUrl}/api/docs`);
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌐 CORS habilitado para desenvolvimento`);
  } else {
    console.log(`📚 Documentação disponível em https://api.fluxvision.cloud/api/docs`);
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌐 CORS habilitado para: https://app.fluxvision.cloud`);
  }
}
bootstrap();
