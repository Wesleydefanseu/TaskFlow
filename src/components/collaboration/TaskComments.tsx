import { useState } from 'react';
import { useRealtime, TaskComment } from '@/contexts/RealtimeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, Smile, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const emojiOptions = ['👍', '❤️', '🎉', '😄', '🤔', '👀', '🔥', '✅'];

interface TaskCommentsProps {
  taskId: string;
  className?: string;
}

export function TaskComments({ taskId, className }: TaskCommentsProps) {
  const { getTaskComments, addComment, addReaction } = useRealtime();
  const [newComment, setNewComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  
  const comments = getTaskComments(taskId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const mentions = newComment.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
    addComment(taskId, newComment, mentions);
    setNewComment('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === '@') {
      setShowMentions(true);
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun commentaire. Soyez le premier à commenter!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onReact={(emoji) => addReaction(comment.id, emoji)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-border">
        <div className="relative">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un commentaire... (@ pour mentionner)"
            className="min-h-[80px] pr-20 resize-none"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
              <AtSign className="w-4 h-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex gap-1">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewComment(prev => prev + emoji)}
                      className="p-1.5 hover:bg-secondary rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button 
              type="submit" 
              variant="gradient" 
              size="icon" 
              className="h-8 w-8"
              disabled={!newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

interface CommentItemProps {
  comment: TaskComment;
  onReact: (emoji: string) => void;
}

function CommentItem({ comment, onReact }: CommentItemProps) {
  return (
    <div className="group animate-in slide-in-from-bottom-2">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.userAvatar} />
          <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.userName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(comment.timestamp, { addSuffix: true, locale: fr })}
            </span>
            {comment.edited && (
              <span className="text-xs text-muted-foreground">(modifié)</span>
            )}
          </div>
          <p className="text-sm mt-1 text-foreground whitespace-pre-wrap">
            {comment.content.split(/(@\w+)/g).map((part, i) => 
              part.startsWith('@') ? (
                <span key={i} className="text-primary font-medium">{part}</span>
              ) : part
            )}
          </p>
          
          {/* Reactions */}
          <div className="flex items-center gap-2 mt-2">
            {comment.reactions?.map((reaction, i) => (
              <button
                key={i}
                onClick={() => onReact(reaction.emoji)}
                className="flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full hover:bg-secondary/80 transition-colors text-xs"
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.users.length}</span>
              </button>
            ))}
            
            {/* Add reaction button */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-secondary rounded">
                  <Smile className="w-4 h-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex gap-1">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onReact(emoji)}
                      className="p-1.5 hover:bg-secondary rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
