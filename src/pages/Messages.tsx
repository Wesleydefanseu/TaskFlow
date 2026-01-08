import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search, 
  Send, 
  Plus, 
  Users, 
  MessageSquare,
  Hash,
  MoreVertical,
  Phone,
  Video,
  Smile
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Channel {
  id: string;
  name: string | null;
  type: 'direct' | 'group' | 'project';
  description?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  members?: Array<{
    id: string;
    full_name: string;
    avatar_url?: string;
    status?: 'online' | 'away' | 'offline';
  }>;
}

// Cameroon team members for demo
const cameroonTeam = [
  { id: '1', full_name: 'Jean-Paul Mbarga', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', status: 'online' as const },
  { id: '2', full_name: 'Marie-Claire Fotso', avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100', status: 'online' as const },
  { id: '3', full_name: 'Sandrine Tchamba', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', status: 'away' as const },
  { id: '4', full_name: 'Emmanuel Ngono', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', status: 'online' as const },
  { id: '5', full_name: 'Carine Atangana', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', status: 'offline' as const },
  { id: '6', full_name: 'Patrick Nganou', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', status: 'online' as const },
];

// Demo channels
const demoChannels: Channel[] = [
  {
    id: '1',
    name: null,
    type: 'direct',
    last_message: 'Super, on peut avancer sur le projet MTN!',
    last_message_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unread_count: 2,
    members: [cameroonTeam[0]],
  },
  {
    id: '2',
    name: null,
    type: 'direct',
    last_message: "J'ai push les dernières modifications",
    last_message_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unread_count: 0,
    members: [cameroonTeam[1]],
  },
  {
    id: '3',
    name: 'Équipe Développement',
    type: 'group',
    description: 'Canal pour l\'équipe de développement',
    last_message: 'La review du PR est prête',
    last_message_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    unread_count: 5,
    members: [cameroonTeam[0], cameroonTeam[1], cameroonTeam[3]],
  },
  {
    id: '4',
    name: 'Projet MTN Mobile Money',
    type: 'project',
    description: 'Discussions liées au projet MTN',
    last_message: 'Les specs sont validées',
    last_message_time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    unread_count: 1,
    members: [cameroonTeam[0], cameroonTeam[2], cameroonTeam[4], cameroonTeam[5]],
  },
  {
    id: '5',
    name: null,
    type: 'direct',
    last_message: 'Les maquettes sont prêtes',
    last_message_time: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    unread_count: 1,
    members: [cameroonTeam[2]],
  },
];

// Demo messages
const demoMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', content: 'Bonjour! Comment avance le projet?', user_id: '1', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), sender: cameroonTeam[0] },
    { id: '2', content: 'Ça avance bien, je termine la page dashboard', user_id: 'me', created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
    { id: '3', content: 'Parfait! Tu peux me montrer quand tu as fini?', user_id: '1', created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), sender: cameroonTeam[0] },
    { id: '4', content: 'Super, on peut avancer sur le projet MTN!', user_id: '1', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), sender: cameroonTeam[0] },
  ],
  '2': [
    { id: '1', content: 'Hey, tu as vu le PR?', user_id: '2', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), sender: cameroonTeam[1] },
    { id: '2', content: 'Oui je vais review ça maintenant', user_id: 'me', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: '3', content: "J'ai push les dernières modifications", user_id: '2', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), sender: cameroonTeam[1] },
  ],
  '3': [
    { id: '1', content: 'Bienvenue dans le canal de l\'équipe dev!', user_id: '1', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), sender: cameroonTeam[0] },
    { id: '2', content: 'Merci! Content d\'être là', user_id: '4', created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), sender: cameroonTeam[3] },
    { id: '3', content: 'La review du PR est prête', user_id: '2', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), sender: cameroonTeam[1] },
  ],
};

const Messages = () => {
  const { t, language } = useLanguage();
  const [channels, setChannels] = useState<Channel[]>(demoChannels);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dateLocale = language === 'fr' ? fr : enUS;

  useEffect(() => {
    if (selectedChannel) {
      setMessages(demoMessages[selectedChannel.id] || []);
    }
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      user_id: 'me',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update channel last message
    setChannels(prev => prev.map(ch => 
      ch.id === selectedChannel.id 
        ? { ...ch, last_message: newMessage, last_message_time: message.created_at }
        : ch
    ));

    // Simulate response after 2 seconds
    setTimeout(() => {
      const member = selectedChannel.members?.[0];
      if (member) {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          content: getAutoReply(),
          user_id: member.id,
          created_at: new Date().toISOString(),
          sender: member,
        };
        setMessages(prev => [...prev, response]);
      }
    }, 2000);
  };

  const getAutoReply = () => {
    const replies = language === 'fr' 
      ? [
          'D\'accord, je vais vérifier ça!',
          'Merci pour l\'info!',
          'Super, on continue comme ça!',
          'Je te tiens au courant.',
          'Parfait, c\'est noté!',
          'OK je m\'en occupe.',
          'Bien reçu!',
        ]
      : [
          "OK, I'll check that!",
          'Thanks for the info!',
          "Great, let's keep going!",
          "I'll keep you posted.",
          "Perfect, noted!",
          "OK I'll take care of it.",
          'Got it!',
        ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      toast.error(language === 'fr' ? 'Veuillez entrer un nom et sélectionner des membres' : 'Please enter a name and select members');
      return;
    }

    const newChannel: Channel = {
      id: Date.now().toString(),
      name: newGroupName,
      type: 'group',
      unread_count: 0,
      members: cameroonTeam.filter(m => selectedMembers.includes(m.id)),
    };

    setChannels(prev => [newChannel, ...prev]);
    setShowNewGroup(false);
    setNewGroupName('');
    setSelectedMembers([]);
    toast.success(language === 'fr' ? 'Groupe créé avec succès' : 'Group created successfully');
  };

  const getChannelName = (channel: Channel) => {
    if (channel.name) return channel.name;
    if (channel.type === 'direct' && channel.members?.[0]) {
      return channel.members[0].full_name;
    }
    return t.messages.noMessages;
  };

  const getChannelAvatar = (channel: Channel) => {
    if (channel.type === 'direct' && channel.members?.[0]) {
      return channel.members[0].avatar_url;
    }
    return null;
  };

  const getChannelStatus = (channel: Channel) => {
    if (channel.type === 'direct' && channel.members?.[0]) {
      return channel.members[0].status;
    }
    return null;
  };

  const filteredChannels = channels.filter(ch => {
    const name = getChannelName(ch).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const directChannels = filteredChannels.filter(ch => ch.type === 'direct');
  const groupChannels = filteredChannels.filter(ch => ch.type === 'group' || ch.type === 'project');

  return (
    <DashboardLayout title={t.messages.title} subtitle="">
      <div className="flex h-[calc(100vh-180px)] bg-card border border-border rounded-xl overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Search and New Group */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t.messages.searchConversations}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={showNewGroup} onOpenChange={setShowNewGroup}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  {t.messages.newGroup}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.messages.createGroup}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t.messages.groupName}</Label>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder={language === 'fr' ? 'Nom du groupe...' : 'Group name...'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.messages.selectMembers}</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cameroonTeam.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                          <Checkbox
                            id={member.id}
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMembers(prev => [...prev, member.id]);
                              } else {
                                setSelectedMembers(prev => prev.filter(id => id !== member.id));
                              }
                            }}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Label htmlFor={member.id} className="cursor-pointer flex-1">
                            {member.full_name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleCreateGroup} className="w-full">
                    {t.messages.createGroup}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Channels List */}
          <ScrollArea className="flex-1">
            {/* Direct Messages */}
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                <MessageSquare className="w-3 h-3" />
                {t.messages.directMessages}
              </div>
              {directChannels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    selectedChannel?.id === channel.id 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-secondary"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getChannelAvatar(channel) || ''} />
                      <AvatarFallback>{getChannelName(channel).charAt(0)}</AvatarFallback>
                    </Avatar>
                    {getChannelStatus(channel) && (
                      <span className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                        getChannelStatus(channel) === 'online' ? 'bg-status-done' :
                        getChannelStatus(channel) === 'away' ? 'bg-status-progress' : 'bg-muted'
                      )} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{getChannelName(channel)}</p>
                      {channel.last_message_time && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(channel.last_message_time), { addSuffix: false, locale: dateLocale })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {channel.last_message || t.messages.noMessages}
                    </p>
                  </div>
                  {channel.unread_count > 0 && (
                    <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                      {channel.unread_count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Groups */}
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                <Users className="w-3 h-3" />
                {t.messages.groups}
              </div>
              {groupChannels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    selectedChannel?.id === channel.id 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-secondary"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{channel.name}</p>
                      {channel.last_message_time && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(channel.last_message_time), { addSuffix: false, locale: dateLocale })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {channel.members?.length} {t.messages.members} • {channel.last_message || t.messages.noMessages}
                    </p>
                  </div>
                  {channel.unread_count > 0 && (
                    <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                      {channel.unread_count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {selectedChannel ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedChannel.type === 'direct' ? (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getChannelAvatar(selectedChannel) || ''} />
                      <AvatarFallback>{getChannelName(selectedChannel).charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{getChannelName(selectedChannel)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {getChannelStatus(selectedChannel) === 'online' ? t.messages.online :
                         getChannelStatus(selectedChannel) === 'away' ? t.messages.away : t.messages.offline}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedChannel.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedChannel.members?.length} {t.messages.members}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isMe = message.user_id === 'me';
                  const showAvatar = !isMe && (index === 0 || messages[index - 1]?.user_id !== message.user_id);
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && showAvatar && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender?.avatar_url} />
                          <AvatarFallback>{message.sender?.full_name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                      )}
                      {!isMe && !showAvatar && <div className="w-8" />}
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        isMe 
                          ? "bg-primary text-primary-foreground rounded-br-md" 
                          : "bg-secondary rounded-bl-md"
                      )}>
                        {!isMe && showAvatar && (
                          <p className="text-xs font-medium mb-1 opacity-70">{message.sender?.full_name}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {format(new Date(message.created_at), 'HH:mm', { locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon">
                  <Plus className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder={t.messages.typeMessage}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="pr-10"
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2">
                    <Smile className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <Button onClick={handleSendMessage} className="gap-2">
                  <Send className="w-4 h-4" />
                  {t.messages.send}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">{t.messages.noMessages}</h3>
              <p className="text-sm text-muted-foreground">{t.messages.startConversation}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Messages;
