import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  usuarioId: string;
  tenantId?: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  status: 'nao_lida' | 'lida' | 'arquivada';
  dados?: any;
  actionUrl?: string;
  criadoEm: string;
  atualizadoEm: string;
  lidoEm?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

export const useNotifications = () => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Conectar ao WebSocket
  useEffect(() => {
    if (!user || !token) return;

    const socketInstance = io(`${import.meta.env.VITE_API_URL}/notifications`, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Conectado ao WebSocket de notificações');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Desconectado do WebSocket de notificações');
      setIsConnected(false);
    });

    socketInstance.on('new_notification', (notification: Notification) => {
      console.log('Nova notificação recebida:', notification);
      
      // Adicionar à lista de notificações
      setNotifications(prev => [notification, ...prev]);
      
      // Mostrar toast baseado no tipo
      const toastOptions = {
        duration: 5000,
        action: notification.actionUrl ? {
          label: 'Ver',
          onClick: () => window.location.href = notification.actionUrl!,
        } : undefined,
      };

      switch (notification.tipo) {
        case 'success':
          toast.success(notification.titulo, {
            description: notification.mensagem,
            ...toastOptions,
          });
          break;
        case 'warning':
          toast.warning(notification.titulo, {
            description: notification.mensagem,
            ...toastOptions,
          });
          break;
        case 'error':
          toast.error(notification.titulo, {
            description: notification.mensagem,
            ...toastOptions,
          });
          break;
        default:
          toast.info(notification.titulo, {
            description: notification.mensagem,
            ...toastOptions,
          });
      }
    });

    socketInstance.on('unread_count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    socketInstance.on('status_update', (data: { type: string; data: any }) => {
      console.log('Atualização de status:', data);
      
      if (data.type === 'notification_updated') {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === data.data.notificationId 
              ? { ...notif, status: data.data.status }
              : notif
          )
        );
      } else if (data.type === 'notification_deleted') {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== data.data.notificationId)
        );
      }
    });

    socketInstance.on('real_time_update', (data: { type: string; data: any }) => {
      console.log('Atualização em tempo real:', data);
      // Aqui você pode implementar atualizações específicas baseadas no tipo
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, token]);

  // Buscar notificações da API
  const fetchNotifications = useCallback(async (options: {
    page?: number;
    limit?: number;
    status?: string;
    tipo?: string;
  } = {}) => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);
      if (options.tipo) params.append('tipo', options.tipo);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        return data;
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Buscar contador de não lidas
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
        return data.count;
      }
    } catch (error) {
      console.error('Erro ao buscar contador de não lidas:', error);
    }
  }, [token]);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/mark-as-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, status: 'lida' as const, lidoEm: new Date().toISOString() }
              : notif
          )
        );
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }, [token, fetchUnreadCount]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/mark-all-as-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            status: 'lida' as const, 
            lidoEm: new Date().toISOString() 
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, [token]);

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  }, [token, fetchUnreadCount]);

  // Buscar estatísticas
  const fetchStats = useCallback(async (): Promise<NotificationStats | null> => {
    if (!token) return null;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
    return null;
  }, [token]);

  // Inicializar dados
  useEffect(() => {
    if (user && token) {
      fetchNotifications({ limit: 20 });
      fetchUnreadCount();
    }
  }, [user, token, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isConnected,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchStats,
  };
};