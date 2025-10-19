import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'
import * as compression from 'compression'
import { join } from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Segurança e performance
  app.use(helmet())
  app.use(compression())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  // CORS para o frontend em produção
  app.enableCors({
    origin: ['https://app.fluxvision.cloud'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  // Prefixo global para rotas da API
  app.setGlobalPrefix('api')

  // Servir frontend buildado (Docker copia para ./public)
  app.useStaticAssets(join(__dirname, '..', 'public'), { index: false })

  // Entregar index.html apenas se não for rota de API
  app.use('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next()
    res.sendFile(join(__dirname, '..', 'public', 'index.html'))
  })

  await app.listen(3001)
  console.log('🚀 Backend ativo na porta 3001')
}

bootstrap()
