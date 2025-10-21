import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification, StatusNotificacao, TipoNotificacao } from './entities/notification.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      tipo: createNotificationDto.tipo || TipoNotificacao.INFO,
    });

    return this.notificationRepository.save(notification);
  }

  async findAll(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: StatusNotificacao;
      tipo?: TipoNotificacao;
    } = {},
  ): Promise<{ notifications: Notification[]; total: number; totalPages: number }> {
    const { page = 1, limit = 20, status, tipo } = options;
    const skip = (page - 1) * limit;

    const where: any = { usuarioId: userId };
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;

    const findOptions: FindManyOptions<Notification> = {
      where,
      order: { criadoEm: 'DESC' },
      skip,
      take: limit,
    };

    const [notifications, total] = await this.notificationRepository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);

    return { notifications, total, totalPages };
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, usuarioId: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return notification;
  }

  async update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id, userId);

    if (updateNotificationDto.status === StatusNotificacao.LIDA && !notification.lidoEm) {
      notification.lidoEm = new Date();
    }

    Object.assign(notification, updateNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async markAsRead(notificationIds: string[], userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ 
        status: StatusNotificacao.LIDA,
        lidoEm: new Date(),
      })
      .where('id IN (:...ids)', { ids: notificationIds })
      .andWhere('usuarioId = :userId', { userId })
      .execute();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { usuarioId: userId, status: StatusNotificacao.NAO_LIDA },
      { 
        status: StatusNotificacao.LIDA,
        lidoEm: new Date(),
      },
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationRepository.remove(notification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        usuarioId: userId,
        status: StatusNotificacao.NAO_LIDA,
      },
    });
  }

  async getStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<TipoNotificacao, number>;
  }> {
    const [total, unread] = await Promise.all([
      this.notificationRepository.count({ where: { usuarioId: userId } }),
      this.notificationRepository.count({ 
        where: { usuarioId: userId, status: StatusNotificacao.NAO_LIDA } 
      }),
    ]);

    const byTypeResults = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.tipo', 'tipo')
      .addSelect('COUNT(*)', 'count')
      .where('notification.usuarioId = :userId', { userId })
      .groupBy('notification.tipo')
      .getRawMany();

    const byType = Object.values(TipoNotificacao).reduce((acc, tipo) => {
      acc[tipo] = 0;
      return acc;
    }, {} as Record<TipoNotificacao, number>);

    byTypeResults.forEach(result => {
      byType[result.tipo] = parseInt(result.count);
    });

    return { total, unread, byType };
  }

  // Métodos de conveniência para criar notificações específicas
  async createSystemNotification(
    userId: string,
    titulo: string,
    mensagem: string,
    dados?: any,
  ): Promise<Notification> {
    return this.create({
      usuarioId: userId,
      titulo,
      mensagem,
      tipo: TipoNotificacao.INFO,
      dados,
    });
  }

  async createSuccessNotification(
    userId: string,
    titulo: string,
    mensagem: string,
    actionUrl?: string,
  ): Promise<Notification> {
    return this.create({
      usuarioId: userId,
      titulo,
      mensagem,
      tipo: TipoNotificacao.SUCCESS,
      actionUrl,
    });
  }

  async createWarningNotification(
    userId: string,
    titulo: string,
    mensagem: string,
    dados?: any,
  ): Promise<Notification> {
    return this.create({
      usuarioId: userId,
      titulo,
      mensagem,
      tipo: TipoNotificacao.WARNING,
      dados,
    });
  }

  async createErrorNotification(
    userId: string,
    titulo: string,
    mensagem: string,
    dados?: any,
  ): Promise<Notification> {
    return this.create({
      usuarioId: userId,
      titulo,
      mensagem,
      tipo: TipoNotificacao.ERROR,
      dados,
    });
  }

  // Limpeza automática de notificações antigas
  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('criadoEm < :cutoffDate', { cutoffDate })
      .andWhere('status = :status', { status: StatusNotificacao.LIDA })
      .execute();

    return result.affected || 0;
  }
}