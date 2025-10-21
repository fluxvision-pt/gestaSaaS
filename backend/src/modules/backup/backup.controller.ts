import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BackupService } from './backup.service';
import { CreateBackupDto } from './dto/create-backup.dto';
import { UpdateBackupDto, RestoreBackupDto } from './dto/update-backup.dto';
import { Backup } from './entities/backup.entity';

@ApiTags('backups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('backups')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Criar novo backup' })
  @ApiResponse({ status: 201, description: 'Backup criado com sucesso', type: Backup })
  async create(@Body() createBackupDto: CreateBackupDto, @Request() req): Promise<Backup> {
    return this.backupService.create(createBackupDto, req.user.id);
  }

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Listar todos os backups' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Filtrar por tenant' })
  @ApiResponse({ status: 200, description: 'Lista de backups', type: [Backup] })
  async findAll(@Query('tenantId') tenantId?: string): Promise<Backup[]> {
    return this.backupService.findAll(tenantId);
  }

  @Get('stats')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Obter estatísticas de backups' })
  @ApiResponse({ status: 200, description: 'Estatísticas de backups' })
  async getStats() {
    return this.backupService.getBackupStats();
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Obter backup por ID' })
  @ApiResponse({ status: 200, description: 'Backup encontrado', type: Backup })
  @ApiResponse({ status: 404, description: 'Backup não encontrado' })
  async findOne(@Param('id') id: string): Promise<Backup> {
    return this.backupService.findOne(id);
  }

  @Get(':id/download')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Baixar arquivo de backup' })
  @ApiResponse({ status: 200, description: 'Arquivo de backup' })
  @ApiResponse({ status: 404, description: 'Backup ou arquivo não encontrado' })
  async downloadBackup(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const backup = await this.backupService.findOne(id);
    
    if (!fs.existsSync(backup.caminhoArquivo)) {
      throw new Error('Arquivo de backup não encontrado');
    }

    const file = fs.createReadStream(backup.caminhoArquivo);
    const filename = backup.caminhoArquivo.split('/').pop() || 'backup.sql';
    
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(file);
  }

  @Post(':id/restore')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restaurar backup' })
  @ApiResponse({ status: 200, description: 'Backup restaurado com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro na restauração' })
  @ApiResponse({ status: 404, description: 'Backup não encontrado' })
  async restore(@Param('id') id: string, @Body() restoreDto: RestoreBackupDto): Promise<{ message: string }> {
    await this.backupService.restoreBackup(id, restoreDto);
    return { message: 'Backup restaurado com sucesso' };
  }

  @Post(':id/execute')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Executar backup manualmente' })
  @ApiResponse({ status: 200, description: 'Backup iniciado' })
  @ApiResponse({ status: 404, description: 'Backup não encontrado' })
  async executeBackup(@Param('id') id: string): Promise<{ message: string }> {
    // Executar em background
    this.backupService.executeBackup(id).catch(error => {
      console.error(`Erro ao executar backup ${id}:`, error);
    });
    
    return { message: 'Backup iniciado com sucesso' };
  }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Atualizar backup' })
  @ApiResponse({ status: 200, description: 'Backup atualizado', type: Backup })
  @ApiResponse({ status: 404, description: 'Backup não encontrado' })
  async update(@Param('id') id: string, @Body() updateBackupDto: UpdateBackupDto): Promise<Backup> {
    return this.backupService.update(id, updateBackupDto);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover backup' })
  @ApiResponse({ status: 204, description: 'Backup removido' })
  @ApiResponse({ status: 404, description: 'Backup não encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.backupService.remove(id);
  }

  @Post('cleanup')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Executar limpeza de backups antigos' })
  @ApiResponse({ status: 200, description: 'Limpeza executada' })
  async cleanup(): Promise<{ message: string }> {
    // Executar em background
    this.backupService.cleanupOldBackups().catch(error => {
      console.error('Erro na limpeza de backups:', error);
    });
    
    return { message: 'Limpeza de backups iniciada' };
  }

  @Post('daily-backup')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Executar backup diário manualmente' })
  @ApiResponse({ status: 200, description: 'Backup diário iniciado' })
  async dailyBackup(): Promise<{ message: string }> {
    // Executar em background
    this.backupService.handleDailyBackup().catch(error => {
      console.error('Erro no backup diário:', error);
    });
    
    return { message: 'Backup diário iniciado' };
  }
}