import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'
import * as compression from 'compression'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.use(helmet())
  app.use(compression())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  app.enableCors({
    origin: ['https://app.fluxvision.cloud'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  app.setGlobalPrefix('api')

  const port = 3001
  await app.listen(port)
  console.log(`🚀 API ativa em https://api.fluxvision.cloud`)
}

bootstrap()
