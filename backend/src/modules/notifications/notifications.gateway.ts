import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  tenantId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:5173', 'http://localhost:3000'] 
      : ['https://app.fluxvision.cloud'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('Cliente tentou conectar sem token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.tenantId = payload.tenantId;

      this.connectedUsers.set(client.userId, client);
      
      // Juntar o usuário à sala do seu tenant
      if (client.tenantId) {
        await client.join(`tenant_${client.tenantId}`);
      }
      
      // Juntar à sala pessoal
      await client.join(`user_${client.userId}`);

      this.logger.log(`Usuário ${client.userId} conectado ao WebSocket`);

      // Enviar notificações não lidas
      const unreadNotifications = await this.notificationsService.getUnreadCount(client.userId);
      client.emit('unread_count', { count: unreadNotifications });

    } catch (error) {
      this.logger.error('Erro na autenticação WebSocket:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`Usuário ${client.userId} desconectado do WebSocket`);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    this.logger.log(`Usuário ${client.userId} entrou na sala ${data.room}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    this.logger.log(`Usuário ${client.userId} saiu da sala ${data.room}`);
  }

  // Métodos para enviar notificações
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
    
    // Atualizar contador de não lidas
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    this.server.to(`user_${userId}`).emit('unread_count', { count: unreadCount });
  }

  async sendNotificationToTenant(tenantId: string, notification: any) {
    this.server.to(`tenant_${tenantId}`).emit('new_notification', notification);
  }

  async broadcastSystemNotification(notification: any) {
    this.server.emit('system_notification', notification);
  }

  // Notificar sobre atualizações de status
  async notifyStatusUpdate(userId: string, type: string, data: any) {
    this.server.to(`user_${userId}`).emit('status_update', { type, data });
  }

  // Notificar sobre atualizações em tempo real
  async notifyRealTimeUpdate(tenantId: string, type: string, data: any) {
    this.server.to(`tenant_${tenantId}`).emit('real_time_update', { type, data });
  }
}