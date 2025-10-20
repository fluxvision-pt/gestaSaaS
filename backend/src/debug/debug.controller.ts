import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Public } from '../modules/auth/decorators/public.decorator'; // se existir
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

@Controller('debug')
export class DebugController {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource
  ) {}

  @Public()
  @Get()
  getDebugInfo() {
    return {
      message: '🔥 Rota pública funcionando!',
      timestamp: new Date().toISOString()
    };
  }
}
