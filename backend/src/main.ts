import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe());

  // 🚀 Prefixo global para todas as rotas da API
  app.setGlobalPrefix('api');

  // 🚀 CORS configurado para produção
  app.enableCors({ origin: ['https://app.fluxvision.cloud'], credentials: true });
  // Desenvolvimento: const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];
  // Desenvolvimento: app.enableCors({ origin: corsOrigins, credentials: true });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`📚 Documentação disponível em https://api.fluxvision.cloud/api/docs`);
  // Desenvolvimento: const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
  // Desenvolvimento: console.log(`📚 Documentação disponível em ${baseUrl}/api/docs`);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 CORS habilitado para: https://app.fluxvision.cloud`);
}
bootstrap();
