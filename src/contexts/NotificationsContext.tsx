import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Mock initial notifications
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'mention',
    title: 'Nouvelle mention',
    message: 'Sophie Martin vous a mentionné dans "Refonte du site web"',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    sender: 'Sophie Martin',
    link: '/projects/1'
  },
  {
    id: '2',
    type: 'task',
    title: 'Tâche assignée',
    message: 'Vous avez été assigné à "Créer les maquettes UI"',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    link: '/projects/1'
  },
  {
    id: '3',
    type: 'comment',
    title: 'Nouveau commentaire',
    message: 'Lucas Dubois a commenté sur votre tâche',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    sender: 'Lucas Dubois',
    link: '/projects/2'
  },
  {
    id: '4',
    type: 'success',
    title: 'Projet terminé',
    message: 'Le projet "Marketing Q1" a été marqué comme terminé',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    link: '/projects/3'
  },
  {
    id: '5',
    type: 'warning',
    title: 'Échéance proche',
    message: 'La tâche "Revue du design" expire demain',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    link: '/projects/1'
  },
  {
    id: '6',
    type: 'info',
    title: 'Mise à jour système',
    message: 'De nouvelles fonctionnalités sont disponibles',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    read: true
  }
];

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldAddNotification = Math.random() > 0.7;
      if (shouldAddNotification) {
        const types: Array<Notification['type']> = ['info', 'task', 'mention', 'comment'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const messages = {
          info: { title: 'Information', message: 'Une nouvelle mise à jour est disponible' },
          task: { title: 'Nouvelle tâche', message: 'Une tâche vous a été assignée' },
          mention: { title: 'Mention', message: 'Quelqu\'un vous a mentionné dans un commentaire' },
          comment: { title: 'Commentaire', message: 'Nouveau commentaire sur votre tâche' }
        };
        addNotification({
          type: randomType,
          ...messages[randomType]
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
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
