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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto, MarkAsReadDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StatusNotificacao, TipoNotificacao } from './entities/notification.entity';

@ApiTags('Notificações')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova notificação' })
  @ApiResponse({ status: 201, description: 'Notificação criada com sucesso' })
  async create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    const notification = await this.notificationsService.create(createNotificationDto);
    
    // Enviar via WebSocket
    await this.notificationsGateway.sendNotificationToUser(
      createNotificationDto.usuarioId,
      notification,
    );

    return notification;
  }

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusNotificacao })
  @ApiQuery({ name: 'tipo', required: false, enum: TipoNotificacao })
  async findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: StatusNotificacao,
    @Query('tipo') tipo?: TipoNotificacao,
  ) {
    return this.notificationsService.findAll(req.user.id, {
      page: page ? parseInt(page.toString()) : undefined,
      limit: limit ? parseInt(limit.toString()) : undefined,
      status,
      tipo,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas das notificações' })
  async getStats(@Request() req) {
    return this.notificationsService.getStats(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obter contagem de notificações não lidas' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter notificação específica' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.notificationsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar notificação' })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Request() req,
  ) {
    const notification = await this.notificationsService.update(
      id,
      req.user.id,
      updateNotificationDto,
    );

    // Notificar via WebSocket sobre a atualização
    await this.notificationsGateway.notifyStatusUpdate(
      req.user.id,
      'notification_updated',
      { notificationId: id, status: updateNotificationDto.status },
    );

    return notification;
  }

  @Post('mark-as-read')
  @ApiOperation({ summary: 'Marcar notificações como lidas' })
  async markAsRead(@Body() markAsReadDto: MarkAsReadDto, @Request() req) {
    await this.notificationsService.markAsRead(markAsReadDto.notificationIds, req.user.id);
    
    // Atualizar contador via WebSocket
    const unreadCount = await this.notificationsService.getUnreadCount(req.user.id);
    await this.notificationsGateway.sendNotificationToUser(req.user.id, {
      type: 'unread_count_update',
      count: unreadCount,
    });

    return { message: 'Notificações marcadas como lidas' };
  }

  @Post('mark-all-as-read')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    
    // Notificar via WebSocket
    await this.notificationsGateway.sendNotificationToUser(req.user.id, {
      type: 'all_marked_as_read',
    });

    return { message: 'Todas as notificações foram marcadas como lidas' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar notificação' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.notificationsService.remove(id, req.user.id);
    
    // Notificar via WebSocket
    await this.notificationsGateway.notifyStatusUpdate(
      req.user.id,
      'notification_deleted',
      { notificationId: id },
    );

    return { message: 'Notificação deletada com sucesso' };
  }
}