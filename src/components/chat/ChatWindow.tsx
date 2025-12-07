import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  X, 
  Send, 
  Minimize2, 
  ChevronLeft,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ChatWindow() {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    sendMessage, 
    markAsRead,
    totalUnread 
  } = useChat();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversationId, activeConversation?.messages.length]);

  const handleSend = () => {
    if (!message.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary hover:scale-105 transition-transform z-50"
      >
        <MessageSquare className="w-6 h-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] flex items-center justify-center text-xs font-bold bg-destructive text-destructive-foreground rounded-full px-1">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 bg-card border border-border rounded-2xl shadow-elevated z-50 transition-all duration-300 overflow-hidden",
      isMinimized ? "w-72 h-14" : "w-80 sm:w-96 h-[500px]"
    )}>
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border bg-secondary/30">
        {activeConversationId && !isMinimized ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveConversationId(null)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activeConversation?.participantAvatar} />
                  <AvatarFallback>{activeConversation?.participantName.charAt(0)}</AvatarFallback>
                </Avatar>
                <Circle className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-current",
                  activeConversation?.participantStatus === 'online' && "text-status-done",
                  activeConversation?.participantStatus === 'away' && "text-status-progress",
                  activeConversation?.participantStatus === 'offline' && "text-muted"
                )} />
              </div>
              <span className="font-medium text-sm">{activeConversation?.participantName}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="font-semibold">Messages</span>
            {totalUnread > 0 && (
              <span className="min-w-[20px] h-5 flex items-center justify-center text-xs font-bold bg-destructive text-destructive-foreground rounded-full px-1.5">
                {totalUnread}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsOpen(false); setActiveConversationId(null); }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {activeConversationId ? (
            /* Chat View */
            <div className="flex flex-col h-[calc(500px-56px)]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {activeConversation?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        msg.senderId === 'me' ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {msg.senderId !== 'me' && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={msg.senderAvatar} />
                          <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        msg.senderId === 'me' 
                          ? "bg-primary text-primary-foreground rounded-tr-sm" 
                          : "bg-secondary rounded-tl-sm"
                      )}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          msg.senderId === 'me' ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {format(msg.timestamp, 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Écrire un message..."
                    className="flex-1 px-4 py-2 bg-secondary rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button 
                    variant="gradient" 
                    size="icon" 
                    className="h-10 w-10 rounded-full"
                    onClick={handleSend}
                    disabled={!message.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Conversations List */
            <ScrollArea className="h-[calc(500px-56px)]">
              <div className="p-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conv.participantAvatar} />
                        <AvatarFallback>{conv.participantName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Circle className={cn(
                        "absolute bottom-0 right-0 w-3.5 h-3.5 fill-current border-2 border-card rounded-full",
                        conv.participantStatus === 'online' && "text-status-done",
                        conv.participantStatus === 'away' && "text-status-progress",
                        conv.participantStatus === 'offline' && "text-muted"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{conv.participantName}</span>
                        {conv.lastMessageTime && (
                          <span className="text-[10px] text-muted-foreground">
                            {format(conv.lastMessageTime, 'HH:mm', { locale: fr })}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="min-w-[20px] h-5 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full px-1.5">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </>
      )}
    </div>
  );
}
