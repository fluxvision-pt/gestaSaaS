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

  // 🔓 Ignora autenticação
  @UseGuards()
  @Get()
  async getDebugInfo() {
    let dbStatus = 'unknown';

    try {
      await this.dataSource.query('SELECT NOW()');
      dbStatus = 'connected ✅';
    } catch (error) {
      dbStatus = `error ❌: ${error.message}`;
    }

    return {
      status: 'online ✅',
      environment: this.configService.get('NODE_ENV') || 'development',
      timestamp: new Date().toISOString(),
      cors: this.configService.get('CORS_ORIGINS') || 'https://app.fluxvision.cloud',
      db: dbStatus,
      docs: 'https://api.fluxvision.cloud/api/docs',
    };
  }
}
