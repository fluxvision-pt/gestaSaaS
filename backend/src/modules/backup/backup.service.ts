import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { exec } from 'child_process';
import { Backup, StatusBackup, TipoBackup, TipoArmazenamento } from './entities/backup.entity';
import { CreateBackupDto } from './dto/create-backup.dto';
import { UpdateBackupDto, RestoreBackupDto } from './dto/update-backup.dto';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = process.env.BACKUP_DIR || './backups';

  constructor(
    @InjectRepository(Backup)
    private backupRepository: Repository<Backup>,
    private dataSource: DataSource,
  ) {
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.logger.log(`Diretório de backup criado: ${this.backupDir}`);
    }
  }

  async create(createBackupDto: CreateBackupDto, usuarioId: string): Promise<Backup> {
    const backup = this.backupRepository.create({
      ...createBackupDto,
      usuarioId,
      caminhoArquivo: this.generateBackupPath(createBackupDto.nome),
    });

    const savedBackup = await this.backupRepository.save(backup);
    
    // Iniciar backup em background
    this.executeBackup(savedBackup.id).catch(error => {
      this.logger.error(`Erro ao executar backup ${savedBackup.id}:`, error);
    });

    return savedBackup;
  }

  async findAll(tenantId?: string): Promise<Backup[]> {
    const query = this.backupRepository.createQueryBuilder('backup');
    
    if (tenantId) {
      query.where('backup.tenantId = :tenantId OR backup.tenantId IS NULL', { tenantId });
    }
    
    return query
      .orderBy('backup.criadoEm', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Backup> {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) {
      throw new NotFoundException(`Backup com ID ${id} não encontrado`);
    }
    return backup;
  }

  async update(id: string, updateBackupDto: UpdateBackupDto): Promise<Backup> {
    const backup = await this.findOne(id);
    Object.assign(backup, updateBackupDto);
    return this.backupRepository.save(backup);
  }

  async remove(id: string): Promise<void> {
    const backup = await this.findOne(id);
    
    // Remover arquivo físico se existir
    if (fs.existsSync(backup.caminhoArquivo)) {
      fs.unlinkSync(backup.caminhoArquivo);
      this.logger.log(`Arquivo de backup removido: ${backup.caminhoArquivo}`);
    }
    
    await this.backupRepository.remove(backup);
  }

  async executeBackup(backupId: string): Promise<void> {
    const backup = await this.findOne(backupId);
    
    try {
      await this.update(backupId, {
        status: StatusBackup.EM_PROGRESSO,
        iniciadoEm: new Date(),
      });

      const startTime = Date.now();
      
      switch (backup.tipo) {
        case TipoBackup.COMPLETO:
          await this.executeFullBackup(backup);
          break;
        case TipoBackup.INCREMENTAL:
          await this.executeIncrementalBackup(backup);
          break;
        case TipoBackup.DIFERENCIAL:
          await this.executeDifferentialBackup(backup);
          break;
      }

      const endTime = Date.now();
      const duracaoSegundos = Math.floor((endTime - startTime) / 1000);

      // Calcular hash MD5 do arquivo
      const hashMD5 = await this.calculateFileHash(backup.caminhoArquivo);
      
      // Obter tamanho do arquivo
      const stats = fs.statSync(backup.caminhoArquivo);
      
      await this.update(backupId, {
        status: StatusBackup.CONCLUIDO,
        finalizadoEm: new Date(),
        duracaoSegundos,
        tamanhoBytes: stats.size,
        hashMD5,
      });

      this.logger.log(`Backup ${backupId} concluído com sucesso`);
      
    } catch (error) {
      this.logger.error(`Erro ao executar backup ${backupId}:`, error);
      
      await this.update(backupId, {
        status: StatusBackup.FALHOU,
        finalizadoEm: new Date(),
        mensagemErro: error.message,
      });
    }
  }

  private async executeFullBackup(backup: Backup): Promise<void> {
    const dbConfig = this.dataSource.options;
    
    if (dbConfig.type === 'postgres') {
      await this.executePostgresBackup(backup);
    } else if (dbConfig.type === 'mysql') {
      await this.executeMysqlBackup(backup);
    } else {
      throw new Error(`Tipo de banco de dados não suportado: ${dbConfig.type}`);
    }
  }

  private async executePostgresBackup(backup: Backup): Promise<void> {
    const dbConfig = this.dataSource.options as any;
    const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f ${backup.caminhoArquivo}`;
    
    const env = { ...process.env, PGPASSWORD: dbConfig.password };
    await execAsync(command, { env });
    
    // Aplicar compressão se configurado
    if (backup.configuracao?.compressao) {
      await this.compressFile(backup.caminhoArquivo);
    }
  }

  private async executeMysqlBackup(backup: Backup): Promise<void> {
    const dbConfig = this.dataSource.options as any;
    const command = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.username} -p${dbConfig.password} ${dbConfig.database} > ${backup.caminhoArquivo}`;
    
    await execAsync(command);
    
    // Aplicar compressão se configurado
    if (backup.configuracao?.compressao) {
      await this.compressFile(backup.caminhoArquivo);
    }
  }

  private async executeIncrementalBackup(backup: Backup): Promise<void> {
    // Implementar backup incremental
    // Por enquanto, fazer backup completo
    await this.executeFullBackup(backup);
  }

  private async executeDifferentialBackup(backup: Backup): Promise<void> {
    // Implementar backup diferencial
    // Por enquanto, fazer backup completo
    await this.executeFullBackup(backup);
  }

  async restoreBackup(backupId: string, restoreDto: RestoreBackupDto): Promise<void> {
    const backup = await this.findOne(backupId);
    
    if (!backup.isCompleto) {
      throw new BadRequestException('Só é possível restaurar backups concluídos');
    }

    if (!fs.existsSync(backup.caminhoArquivo)) {
      throw new NotFoundException('Arquivo de backup não encontrado');
    }

    try {
      this.logger.log(`Iniciando restauração do backup ${backupId}`);
      
      // Validar integridade se solicitado
      if (restoreDto.validarIntegridade) {
        await this.validateBackupIntegrity(backup);
      }

      const dbConfig = this.dataSource.options;
      
      if (dbConfig.type === 'postgres') {
        await this.restorePostgresBackup(backup, restoreDto);
      } else if (dbConfig.type === 'mysql') {
        await this.restoreMysqlBackup(backup, restoreDto);
      }

      this.logger.log(`Restauração do backup ${backupId} concluída com sucesso`);
      
    } catch (error) {
      this.logger.error(`Erro ao restaurar backup ${backupId}:`, error);
      throw error;
    }
  }

  private async restorePostgresBackup(backup: Backup, restoreDto: RestoreBackupDto): Promise<void> {
    const dbConfig = this.dataSource.options as any;
    let filePath = backup.caminhoArquivo;
    
    // Descomprimir se necessário
    if (backup.configuracao?.compressao) {
      filePath = await this.decompressFile(backup.caminhoArquivo);
    }
    
    const command = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f ${filePath}`;
    
    const env = { ...process.env, PGPASSWORD: dbConfig.password };
    await execAsync(command, { env });
  }

  private async restoreMysqlBackup(backup: Backup, restoreDto: RestoreBackupDto): Promise<void> {
    const dbConfig = this.dataSource.options as any;
    let filePath = backup.caminhoArquivo;
    
    // Descomprimir se necessário
    if (backup.configuracao?.compressao) {
      filePath = await this.decompressFile(backup.caminhoArquivo);
    }
    
    const command = `mysql -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.username} -p${dbConfig.password} ${dbConfig.database} < ${filePath}`;
    
    await execAsync(command);
  }

  private async validateBackupIntegrity(backup: Backup): Promise<boolean> {
    if (!backup.hashMD5) {
      throw new BadRequestException('Backup não possui hash MD5 para validação');
    }

    const currentHash = await this.calculateFileHash(backup.caminhoArquivo);
    
    if (currentHash !== backup.hashMD5) {
      throw new BadRequestException('Integridade do backup comprometida - hash MD5 não confere');
    }

    return true;
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async compressFile(filePath: string): Promise<string> {
    const compressedPath = `${filePath}.gz`;
    
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath);
      const writeStream = fs.createWriteStream(compressedPath);
      const gzip = zlib.createGzip();
      
      readStream.pipe(gzip).pipe(writeStream);
      
      writeStream.on('finish', () => {
        fs.unlinkSync(filePath); // Remover arquivo original
        resolve(compressedPath);
      });
      
      writeStream.on('error', reject);
    });
  }

  private async decompressFile(filePath: string): Promise<string> {
    const decompressedPath = filePath.replace('.gz', '');
    
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath);
      const writeStream = fs.createWriteStream(decompressedPath);
      const gunzip = zlib.createGunzip();
      
      readStream.pipe(gunzip).pipe(writeStream);
      
      writeStream.on('finish', () => resolve(decompressedPath));
      writeStream.on('error', reject);
    });
  }

  private generateBackupPath(nome: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${nome}_${timestamp}.sql`;
    return path.join(this.backupDir, filename);
  }

  // Backup automático diário às 2:00 AM
  @Cron('0 2 * * *')
  async handleDailyBackup() {
    this.logger.log('Iniciando backup automático diário');
    
    try {
      const backupDto: CreateBackupDto = {
        nome: `backup_automatico_${new Date().toISOString().split('T')[0]}`,
        descricao: 'Backup automático diário do sistema',
        tipo: TipoBackup.COMPLETO,
        tipoArmazenamento: TipoArmazenamento.LOCAL,
        automatico: true,
        configuracao: {
          compressao: true,
          retencaoDias: 30,
        },
      };

      await this.create(backupDto, 'system');
      
    } catch (error) {
      this.logger.error('Erro no backup automático diário:', error);
    }
  }

  // Limpeza de backups antigos - executa semanalmente
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldBackups() {
    this.logger.log('Iniciando limpeza de backups antigos');
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 dias atrás
      
      const oldBackups = await this.backupRepository
        .createQueryBuilder('backup')
        .where('backup.criadoEm < :cutoffDate', { cutoffDate })
        .andWhere('backup.automatico = :automatico', { automatico: true })
        .getMany();

      for (const backup of oldBackups) {
        await this.remove(backup.id);
        this.logger.log(`Backup antigo removido: ${backup.id}`);
      }
      
    } catch (error) {
      this.logger.error('Erro na limpeza de backups antigos:', error);
    }
  }

  async getBackupStats(): Promise<any> {
    const stats = await this.backupRepository
      .createQueryBuilder('backup')
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN status = :concluido THEN 1 END) as concluidos',
        'COUNT(CASE WHEN status = :falhou THEN 1 END) as falharam',
        'SUM(CASE WHEN status = :concluido THEN tamanhoBytes ELSE 0 END) as tamanhoTotal',
        'AVG(CASE WHEN status = :concluido THEN duracaoSegundos ELSE NULL END) as duracaoMedia',
      ])
      .setParameters({
        concluido: StatusBackup.CONCLUIDO,
        falhou: StatusBackup.FALHOU,
      })
      .getRawOne();

    return {
      total: parseInt(stats.total),
      concluidos: parseInt(stats.concluidos),
      falharam: parseInt(stats.falharam),
      tamanhoTotal: parseInt(stats.tamanhoTotal) || 0,
      duracaoMedia: parseFloat(stats.duracaoMedia) || 0,
    };
  }
}