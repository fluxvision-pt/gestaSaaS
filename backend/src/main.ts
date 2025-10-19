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

  // 🚀 CORS liberado para o domínio do frontend
  app.enableCors({
    origin: ['https://app.fluxvision.cloud'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
  
  console.log(`📚 Documentação disponível em https://api.fluxvision.cloud/api/docs`);
  console.log(`🚀 Server running on port ${process.env.PORT || 3001}`);
}
bootstrap();
