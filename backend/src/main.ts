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
    credentials: true,
  });

  // ✅ prefixo global para todas as rotas da API
  app.setGlobalPrefix('api');

  // ✅ serve apenas os arquivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'), { index: false });

  // ⚠️ Este trecho deve vir **DEPOIS** de registrar as rotas da API
  app.use('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  console.log(`🚀 Backend online na porta ${port}`);
}

bootstrap();

