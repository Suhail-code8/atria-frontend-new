import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../auth/AuthContext';
import { notificationApi } from '../api/notification.api';
import { env } from '../utils/env';
import { showToast } from '../lib/toast';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  referenceId?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications();
      // Backend returns { success: true, data: [...] }
      const data = response.data || response.data?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(Array.isArray(data) ? data.filter((n: Notification) => !n.read).length : 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const newSocket = io(env.SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'], // Ensure reliable connection
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket for notifications');
        newSocket.emit('join_user_room', user.id || user._id);
      });

      newSocket.on('new_notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
        
        // Show real-time toast for immediate feedback
        showToast.info(notification.title, {
            description: notification.message,
            duration: 5000,
        });

        // Browser Notification feature
        if ("Notification" in window && window.Notification.permission === "granted") {
            new window.Notification(notification.title, { body: notification.message });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
