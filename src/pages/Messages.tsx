import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';
import { useUser } from '@/contexts/UserContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
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
  Smile,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const Messages = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: userLoading, supabaseUser } = useUser();
  const { members } = useWorkspace();
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    sendMessage, 
    markAsRead,
    createChannel,
    isLoading: chatLoading 
  } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);

  const [conversationTab, setConversationTab] = useState<'all' | 'direct' | 'group'>('all');

  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dateLocale = language === 'fr' ? fr : enUS;

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, userLoading, navigate]);

  const selectedChannel = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChannel?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(activeConversationId, newMessage);
      setNewMessage('');
    } catch (error) {
      toast.error(language === 'fr' ? 'Erreur lors de l\'envoi' : 'Error sending message');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      toast.error(language === 'fr' ? 'Veuillez entrer un nom et sélectionner des membres' : 'Please enter a name and select members');
      return;
    }

    try {
      await createChannel(newGroupName, 'group', selectedMembers);
      setShowNewGroup(false);
      setNewGroupName('');
      setSelectedMembers([]);
      toast.success(language === 'fr' ? 'Groupe créé avec succès' : 'Group created successfully');
    } catch (error) {
      toast.error(language === 'fr' ? 'Erreur lors de la création' : 'Error creating group');
    }
  };

  const getChannelName = (channel: typeof conversations[0]) => {
    if (channel.name) return channel.name;
    if (channel.type === 'direct') {
      return channel.participantName;
    }
    return t.messages.noMessages;
  };

  const getChannelAvatar = (channel: typeof conversations[0]) => {
    if (channel.type === 'direct') {
      return channel.participantAvatar;
    }
    return null;
  };

  const filteredChannels = conversations.filter(ch => {
    const name = getChannelName(ch).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const directChannels = filteredChannels.filter(ch => ch.type === 'direct');
  const groupChannels = filteredChannels.filter(ch => ch.type === 'group' || ch.type === 'project');

  // Get available members for group creation
  const availableMembers = members.map(m => ({
    id: m.user_id,
    full_name: m.profile?.full_name || m.profile?.email || 'Unknown',
    avatar_url: m.profile?.avatar_url,
  })).filter(m => m.id !== supabaseUser?.id);

  if (userLoading || chatLoading) {
    return (
      <DashboardLayout title={t.messages.title} subtitle="">
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
                      {availableMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {language === 'fr' ? 'Aucun membre disponible' : 'No members available'}
                        </p>
                      ) : (
                        availableMembers.map(member => (
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
                              <AvatarImage src={member.avatar_url || ''} />
                              <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Label htmlFor={member.id} className="cursor-pointer flex-1">
                              {member.full_name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <Button onClick={handleCreateGroup} className="w-full" disabled={availableMembers.length === 0}>
                    {t.messages.createGroup}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs for conversation types */}
          <Tabs value={conversationTab} onValueChange={(value: any) => setConversationTab(value)} className="w-full flex flex-col flex-1">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">Tous</span>
                <Badge variant="secondary" className="h-5 px-1 text-xs">{conversations.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="direct" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">Messages</span>
                <Badge variant="secondary" className="h-5 px-1 text-xs">{directChannels.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="group" className="gap-2">
                <Hash className="w-4 h-4" />
                <span className="text-xs">Groupes</span>
                <Badge variant="secondary" className="h-5 px-1 text-xs">{groupChannels.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Channels List */}
            <ScrollArea className="flex-1 mt-4">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'fr' ? 'Aucune conversation' : 'No conversations'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'fr' ? 'Créez un groupe pour commencer' : 'Create a group to start'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Show all conversations */}
                  {conversationTab === 'all' && (
                    <>
                      {/* Direct Messages */}
                      {directChannels.length > 0 && (
                        <div className="p-2">
                          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                            <MessageSquare className="w-3 h-3" />
                            {t.messages.directMessages}
                          </div>
                          {directChannels.map(channel => (
                            <button
                              key={channel.id}
                              onClick={() => setActiveConversationId(channel.id)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                activeConversationId === channel.id 
                                  ? "bg-primary/10 text-primary" 
                                  : "hover:bg-secondary"
                              )}
                            >
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={getChannelAvatar(channel) || ''} />
                                  <AvatarFallback>{getChannelName(channel).charAt(0)}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm truncate">{getChannelName(channel)}</p>
                                  {channel.lastMessageTime && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(channel.lastMessageTime, { addSuffix: false, locale: dateLocale })}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {channel.lastMessage || t.messages.noMessages}
                                </p>
                              </div>
                              {channel.unreadCount > 0 && (
                                <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                                  {channel.unreadCount}
                                </Badge>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Groups */}
                      {groupChannels.length > 0 && (
                        <div className="p-2">
                          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                            <Users className="w-3 h-3" />
                            {t.messages.groups}
                          </div>
                          {groupChannels.map(channel => (
                            <button
                              key={channel.id}
                              onClick={() => setActiveConversationId(channel.id)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                activeConversationId === channel.id 
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
                                  {channel.lastMessageTime && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(channel.lastMessageTime, { addSuffix: false, locale: dateLocale })}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {channel.members?.length || 0} {t.messages.members} • {channel.lastMessage || t.messages.noMessages}
                                </p>
                              </div>
                              {channel.unreadCount > 0 && (
                                <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                                  {channel.unreadCount}
                                </Badge>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Show only direct messages */}
                  {conversationTab === 'direct' && (
                    <div className="p-2">
                      {directChannels.length === 0 ? (
                        <div className="text-center py-8 px-4 text-muted-foreground">
                          <p className="text-sm">{language === 'fr' ? 'Aucun message direct' : 'No direct messages'}</p>
                        </div>
                      ) : (
                        directChannels.map(channel => (
                          <button
                            key={channel.id}
                            onClick={() => setActiveConversationId(channel.id)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                              activeConversationId === channel.id 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-secondary"
                            )}
                          >
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={getChannelAvatar(channel) || ''} />
                                <AvatarFallback>{getChannelName(channel).charAt(0)}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">{getChannelName(channel)}</p>
                                {channel.lastMessageTime && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(channel.lastMessageTime, { addSuffix: false, locale: dateLocale })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {channel.lastMessage || t.messages.noMessages}
                              </p>
                            </div>
                            {channel.unreadCount > 0 && (
                              <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                                {channel.unreadCount}
                              </Badge>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* Show only groups */}
                  {conversationTab === 'group' && (
                    <div className="p-2">
                      {groupChannels.length === 0 ? (
                        <div className="text-center py-8 px-4 text-muted-foreground">
                          <p className="text-sm">{language === 'fr' ? 'Aucun groupe' : 'No groups'}</p>
                        </div>
                      ) : (
                        groupChannels.map(channel => (
                          <button
                            key={channel.id}
                            onClick={() => setActiveConversationId(channel.id)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                              activeConversationId === channel.id 
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
                                {channel.lastMessageTime && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(channel.lastMessageTime, { addSuffix: false, locale: dateLocale })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {channel.members?.length || 0} {t.messages.members} • {channel.lastMessage || t.messages.noMessages}
                              </p>
                            </div>
                            {channel.unreadCount > 0 && (
                              <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                                {channel.unreadCount}
                              </Badge>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </Tabs>

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
                        {t.messages.online}
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
                        {selectedChannel.members?.length || 0} {t.messages.members}
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
                {selectedChannel.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'fr' ? 'Aucun message' : 'No messages yet'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'fr' ? 'Envoyez le premier message!' : 'Send the first message!'}
                    </p>
                  </div>
                ) : (
                  selectedChannel.messages.map((message, index) => {
                    const isMe = message.senderId === supabaseUser?.id;
                    const showAvatar = !isMe && (index === 0 || selectedChannel.messages[index - 1]?.senderId !== message.senderId);
                    
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
                            <AvatarImage src={message.senderAvatar} />
                            <AvatarFallback>{message.senderName?.charAt(0) || '?'}</AvatarFallback>
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
                            <p className="text-xs font-medium mb-1 opacity-70">{message.senderName}</p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className={cn(
                            "text-[10px] mt-1",
                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {format(message.timestamp, 'HH:mm', { locale: dateLocale })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
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
                    disabled={isSending}
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2">
                    <Smile className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <Button onClick={handleSendMessage} className="gap-2" disabled={isSending}>
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
