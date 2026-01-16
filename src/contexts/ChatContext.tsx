import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

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
  type: 'direct' | 'group' | 'project';
  name?: string;
  members?: Array<{
    id: string;
    full_name: string;
    avatar_url?: string;
  }>;
}

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => void;
  totalUnread: number;
  isLoading: boolean;
  createChannel: (name: string, type: 'group' | 'project', memberIds: string[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { supabaseUser, user } = useUser();
  const { currentWorkspace, members } = useWorkspace();

  // Fetch channels and messages
  const fetchConversations = useCallback(async () => {
    if (!supabaseUser || !currentWorkspace) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch channels the user is a member of
      const { data: memberChannels, error: memberError } = await supabase
        .from('chat_channel_members')
        .select(`
          channel_id,
          last_read_at,
          chat_channels (
            id,
            name,
            type,
            description,
            workspace_id
          )
        `)
        .eq('user_id', supabaseUser.id);

      if (memberError) throw memberError;

      const channelIds = memberChannels?.map(mc => mc.channel_id) || [];

      if (channelIds.length === 0) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      // Fetch messages for each channel
      const conversationsData: ChatConversation[] = [];

      for (const mc of memberChannels || []) {
        const channel = mc.chat_channels as any;
        if (!channel || channel.workspace_id !== currentWorkspace.id) continue;

        // Get channel members with profiles
        const { data: channelMembers } = await supabase
          .from('chat_channel_members')
          .select('user_id')
          .eq('channel_id', channel.id);

        const memberUserIds = channelMembers?.map(cm => cm.user_id) || [];
        const { data: memberProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', memberUserIds);

        // Get messages
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('channel_id', channel.id)
          .order('created_at', { ascending: true });

        // Get sender profiles for messages
        const senderIds = [...new Set(messages?.map(m => m.user_id) || [])];
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', senderIds);

        const lastReadAt = mc.last_read_at ? new Date(mc.last_read_at) : new Date(0);
        const unreadCount = messages?.filter(m => 
          new Date(m.created_at) > lastReadAt && m.user_id !== supabaseUser.id
        ).length || 0;

        const formattedMessages: ChatMessage[] = (messages || []).map(m => {
          const sender = senderProfiles?.find(p => p.id === m.user_id);
          return {
            id: m.id,
            senderId: m.user_id,
            senderName: sender?.full_name || 'Unknown',
            senderAvatar: sender?.avatar_url || undefined,
            content: m.content,
            timestamp: new Date(m.created_at),
            isRead: new Date(m.created_at) <= lastReadAt || m.user_id === supabaseUser.id,
          };
        });

        const lastMessage = messages?.[messages.length - 1];
        
        // For direct messages, get the other participant
        const otherParticipant = channel.type === 'direct' 
          ? memberProfiles?.find(p => p.id !== supabaseUser.id)
          : null;

        conversationsData.push({
          id: channel.id,
          participantId: otherParticipant?.id || channel.id,
          participantName: otherParticipant?.full_name || channel.name || 'Conversation',
          participantAvatar: otherParticipant?.avatar_url || undefined,
          participantStatus: 'online', // Would need presence system for real status
          lastMessage: lastMessage?.content,
          lastMessageTime: lastMessage ? new Date(lastMessage.created_at) : undefined,
          unreadCount,
          messages: formattedMessages,
          type: channel.type as 'direct' | 'group' | 'project',
          name: channel.name,
          members: memberProfiles?.map(p => ({
            id: p.id,
            full_name: p.full_name || 'Unknown',
            avatar_url: p.avatar_url || undefined,
          })),
        });
      }

      // Sort by last message time
      conversationsData.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
      });

      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser, currentWorkspace]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to new messages
  useEffect(() => {
    if (!supabaseUser || !currentWorkspace) return;

    const channel = supabase
      .channel('chat-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Fetch sender profile
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMsg.user_id)
            .single();

          const chatMessage: ChatMessage = {
            id: newMsg.id,
            senderId: newMsg.user_id,
            senderName: sender?.full_name || 'Unknown',
            senderAvatar: sender?.avatar_url || undefined,
            content: newMsg.content,
            timestamp: new Date(newMsg.created_at),
            isRead: newMsg.user_id === supabaseUser.id || activeConversationId === newMsg.channel_id,
          };

          setConversations(prev => prev.map(conv => {
            if (conv.id === newMsg.channel_id) {
              return {
                ...conv,
                messages: [...conv.messages, chatMessage],
                lastMessage: newMsg.content,
                lastMessageTime: new Date(newMsg.created_at),
                unreadCount: newMsg.user_id !== supabaseUser.id && activeConversationId !== newMsg.channel_id
                  ? conv.unreadCount + 1 
                  : conv.unreadCount,
              };
            }
            return conv;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUser, currentWorkspace, activeConversationId]);

  const sendMessage = async (conversationId: string, content: string) => {
    if (!supabaseUser || !content.trim()) return;

    try {
      await supabase
        .from('chat_messages')
        .insert({
          channel_id: conversationId,
          user_id: supabaseUser.id,
          content: content.trim(),
        });
      // Realtime will handle adding to state
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!supabaseUser) return;

    try {
      await supabase
        .from('chat_channel_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('channel_id', conversationId)
        .eq('user_id', supabaseUser.id);

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
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const createChannel = async (name: string, type: 'group' | 'project', memberIds: string[]) => {
    if (!supabaseUser || !currentWorkspace) return;

    try {
      // Create channel
      const { data: channel, error: channelError } = await supabase
        .from('chat_channels')
        .insert({
          name,
          type,
          workspace_id: currentWorkspace.id,
          created_by: supabaseUser.id,
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Add members including creator
      const allMemberIds = [...new Set([supabaseUser.id, ...memberIds])];
      await supabase
        .from('chat_channel_members')
        .insert(allMemberIds.map(userId => ({
          channel_id: channel.id,
          user_id: userId,
        })));

      await fetchConversations();
    } catch (error) {
      console.error('Error creating channel:', error);
    }
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
      isLoading,
      createChannel,
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
