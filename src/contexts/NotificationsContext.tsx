import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'mention' | 'comment';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  avatar?: string;
  sender?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  isLoading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { supabaseUser } = useUser();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!supabaseUser) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mappedNotifications: Notification[] = (data || []).map(n => ({
        id: n.id,
        type: (n.type as Notification['type']) || 'info',
        title: n.title,
        message: n.message || '',
        timestamp: new Date(n.created_at),
        read: n.is_read || false,
        link: n.link || undefined,
      }));

      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!supabaseUser) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabaseUser.id}`,
        },
        (payload) => {
          const n = payload.new as any;
          const newNotification: Notification = {
            id: n.id,
            type: (n.type as Notification['type']) || 'info',
            title: n.title,
            message: n.message || '',
            timestamp: new Date(n.created_at),
            read: n.is_read || false,
            link: n.link || undefined,
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUser]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!supabaseUser) return;

    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: supabaseUser.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          link: notification.link,
          is_read: false,
        });
      // Realtime will handle adding to state
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [supabaseUser]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!supabaseUser) return;

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', supabaseUser.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [supabaseUser]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    if (!supabaseUser) return;

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', supabaseUser.id);

      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [supabaseUser]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        isLoading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
