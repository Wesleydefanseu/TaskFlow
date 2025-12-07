import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantStatus: 'online' | 'away' | 'offline';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  messages: ChatMessage[];
}

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, content: string) => void;
  markAsRead: (conversationId: string) => void;
  totalUnread: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Noms africains pour les conversations
const africanTeamMembers = [
  { id: '1', name: 'Aminata Diallo', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100', status: 'online' as const },
  { id: '2', name: 'Kwame Asante', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', status: 'online' as const },
  { id: '3', name: 'Fatou Ndiaye', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', status: 'away' as const },
  { id: '4', name: 'Ousmane Traoré', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', status: 'online' as const },
  { id: '5', name: 'Aïcha Coulibaly', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', status: 'offline' as const },
];

const initialConversations: ChatConversation[] = [
  {
    id: '1',
    participantId: '1',
    participantName: 'Aminata Diallo',
    participantAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100',
    participantStatus: 'online',
    lastMessage: 'Super, on peut avancer sur le projet!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    messages: [
      { id: '1', senderId: '1', senderName: 'Aminata Diallo', senderAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100', content: 'Bonjour! Comment avance le projet?', timestamp: new Date(Date.now() - 1000 * 60 * 30), isRead: true },
      { id: '2', senderId: 'me', senderName: 'Moi', content: 'Ça avance bien, je termine la page dashboard', timestamp: new Date(Date.now() - 1000 * 60 * 25), isRead: true },
      { id: '3', senderId: '1', senderName: 'Aminata Diallo', senderAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100', content: 'Parfait! Tu peux me montrer quand tu as fini?', timestamp: new Date(Date.now() - 1000 * 60 * 10), isRead: false },
      { id: '4', senderId: '1', senderName: 'Aminata Diallo', senderAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100', content: 'Super, on peut avancer sur le projet!', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false },
    ],
  },
  {
    id: '2',
    participantId: '2',
    participantName: 'Kwame Asante',
    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    participantStatus: 'online',
    lastMessage: 'J\'ai push les dernières modifications',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    messages: [
      { id: '1', senderId: '2', senderName: 'Kwame Asante', senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', content: 'Hey, tu as vu le PR?', timestamp: new Date(Date.now() - 1000 * 60 * 60), isRead: true },
      { id: '2', senderId: 'me', senderName: 'Moi', content: 'Oui je vais review ça maintenant', timestamp: new Date(Date.now() - 1000 * 60 * 45), isRead: true },
      { id: '3', senderId: '2', senderName: 'Kwame Asante', senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', content: 'J\'ai push les dernières modifications', timestamp: new Date(Date.now() - 1000 * 60 * 30), isRead: true },
    ],
  },
  {
    id: '3',
    participantId: '3',
    participantName: 'Fatou Ndiaye',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    participantStatus: 'away',
    lastMessage: 'Les maquettes sont prêtes',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
    messages: [
      { id: '1', senderId: '3', senderName: 'Fatou Ndiaye', senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', content: 'Les maquettes sont prêtes', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: false },
    ],
  },
  {
    id: '4',
    participantId: '4',
    participantName: 'Ousmane Traoré',
    participantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    participantStatus: 'online',
    unreadCount: 0,
    messages: [],
  },
];

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const sendMessage = (conversationId: string, content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'Moi',
      content,
      timestamp: new Date(),
      isRead: true,
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: content,
          lastMessageTime: new Date(),
        };
      }
      return conv;
    }));

    // Simuler une réponse automatique
    setTimeout(() => {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        const autoReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: conv.participantId,
          senderName: conv.participantName,
          senderAvatar: conv.participantAvatar,
          content: getAutoReply(),
          timestamp: new Date(),
          isRead: activeConversationId === conversationId,
        };

        setConversations(prev => prev.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: [...c.messages, autoReply],
              lastMessage: autoReply.content,
              lastMessageTime: new Date(),
              unreadCount: activeConversationId === conversationId ? c.unreadCount : c.unreadCount + 1,
            };
          }
          return c;
        }));
      }
    }, 2000);
  };

  const getAutoReply = () => {
    const replies = [
      'D\'accord, je vais vérifier ça!',
      'Merci pour l\'info!',
      'Super, on continue comme ça!',
      'Je te tiens au courant.',
      'Parfait, c\'est noté!',
      'OK je m\'en occupe.',
      'Bien reçu!',
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map(msg => ({ ...msg, isRead: true })),
        };
      }
      return conv;
    }));
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversationId,
      setActiveConversationId,
      sendMessage,
      markAsRead,
      totalUnread,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
