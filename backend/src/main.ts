import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: ['https://app.fluxvision.cloud'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ✅ todas as rotas da API são prefixadas com /api
  app.setGlobalPrefix('api');

  // ✅ servir o frontend apenas se quiser o mesmo domínio
  app.useStaticAssets(join(__dirname, '..', 'public'), { index: false });

  // ✅ esta linha deve ser a última
  app.use('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}

bootstrap();
