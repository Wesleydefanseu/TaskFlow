import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'commented' | 'assigned' | 'moved';
  targetType: 'task' | 'project' | 'board' | 'comment';
  targetName: string;
  targetId: string;
  details?: string;
  timestamp: Date;
}

export interface Presence {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  currentPage?: string;
  lastSeen: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  mentions?: string[];
  reactions?: { emoji: string; users: string[] }[];
  timestamp: Date;
  edited?: boolean;
}

interface RealtimeContextType {
  activities: Activity[];
  presences: Presence[];
  comments: Record<string, TaskComment[]>;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  updatePresence: (presence: Partial<Presence>) => void;
  addComment: (taskId: string, content: string, mentions?: string[]) => void;
  addReaction: (commentId: string, emoji: string) => void;
  getTaskComments: (taskId: string) => TaskComment[];
  onlineUsers: Presence[];
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

const initialActivities: Activity[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'Marie-Claire Fotso',
    userAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100',
    action: 'completed',
    targetType: 'task',
    targetName: 'Design système de composants',
    targetId: 'task-1',
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Jean-Paul Mbarga',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    action: 'commented',
    targetType: 'task',
    targetName: 'Intégration authentification',
    targetId: 'task-2',
    details: 'J\'ai ajouté les tests unitaires pour le module',
    timestamp: new Date(Date.now() - 15 * 60000),
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'Sandrine Tchamba',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    action: 'created',
    targetType: 'task',
    targetName: 'Optimisation performances',
    targetId: 'task-3',
    timestamp: new Date(Date.now() - 30 * 60000),
  },
  {
    id: '4',
    userId: 'user-4',
    userName: 'Emmanuel Ngono',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    action: 'moved',
    targetType: 'task',
    targetName: 'Documentation API',
    targetId: 'task-4',
    details: 'À faire → En cours',
    timestamp: new Date(Date.now() - 45 * 60000),
  },
];

const initialPresences: Presence[] = [];

const initialComments: Record<string, TaskComment[]> = {
  'task-1': [
    {
      id: 'c1',
      taskId: 'task-1',
      userId: 'user-1',
      userName: 'Marie-Claire Fotso',
      userAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100',
      content: 'J\'ai terminé la première version du design system. @Jean-Paul peux-tu faire une revue?',
      mentions: ['Jean-Paul Mbarga'],
      reactions: [{ emoji: '👍', users: ['Jean-Paul Mbarga', 'Sandrine Tchamba'] }],
      timestamp: new Date(Date.now() - 60 * 60000),
    },
    {
      id: 'c2',
      taskId: 'task-1',
      userId: 'user-2',
      userName: 'Jean-Paul Mbarga',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      content: 'Super travail! J\'ai quelques suggestions mineures que je vais ajouter.',
      reactions: [{ emoji: '🎉', users: ['Marie-Claire Fotso'] }],
      timestamp: new Date(Date.now() - 30 * 60000),
    },
  ],
};

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [presences, setPresences] = useState<Presence[]>(initialPresences);
  const [comments, setComments] = useState<Record<string, TaskComment[]>>(initialComments);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPresences(prev => prev.map(p => ({
        ...p,
        lastSeen: p.status === 'online' ? new Date() : p.lastSeen,
      })));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  }, []);

  const updatePresence = useCallback((presence: Partial<Presence>) => {
    setPresences(prev => prev.map(p => 
      p.id === presence.id ? { ...p, ...presence, lastSeen: new Date() } : p
    ));
  }, []);

  const addComment = useCallback((taskId: string, content: string, mentions?: string[]) => {
    const newComment: TaskComment = {
      id: `comment-${Date.now()}`,
      taskId,
      userId: 'current-user',
      userName: 'Vous',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      content,
      mentions,
      reactions: [],
      timestamp: new Date(),
    };
    setComments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), newComment],
    }));
  }, []);

  const addReaction = useCallback((commentId: string, emoji: string) => {
    setComments(prev => {
      const updated = { ...prev };
      for (const taskId in updated) {
        updated[taskId] = updated[taskId].map(comment => {
          if (comment.id === commentId) {
            const existingReaction = comment.reactions?.find(r => r.emoji === emoji);
            if (existingReaction) {
              return {
                ...comment,
                reactions: comment.reactions?.map(r => 
                  r.emoji === emoji 
                    ? { ...r, users: [...r.users, 'Vous'] }
                    : r
                ),
              };
            }
            return {
              ...comment,
              reactions: [...(comment.reactions || []), { emoji, users: ['Vous'] }],
            };
          }
          return comment;
        });
      }
      return updated;
    });
  }, []);

  const getTaskComments = useCallback((taskId: string) => {
    return comments[taskId] || [];
  }, [comments]);

  const onlineUsers = presences.filter(p => p.status === 'online' || p.status === 'busy');

  return (
    <RealtimeContext.Provider value={{
      activities,
      presences,
      comments,
      addActivity,
      updatePresence,
      addComment,
      addReaction,
      getTaskComments,
      onlineUsers,
    }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
