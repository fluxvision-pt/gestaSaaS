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

  // 🚀 CORS configurado baseado no ambiente
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://app.fluxvision.cloud']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];
    
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.fluxvision.cloud'
    : `http://localhost:${port}`;
    
  console.log(`📚 Documentação disponível em ${baseUrl}/api/docs`);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
}
bootstrap();
