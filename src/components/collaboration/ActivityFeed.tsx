import { useRealtime, Activity } from '@/contexts/RealtimeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CheckCircle2, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  UserPlus, 
  ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const actionIcons: Record<Activity['action'], React.ReactNode> = {
  created: <Plus className="w-3.5 h-3.5" />,
  updated: <Edit3 className="w-3.5 h-3.5" />,
  deleted: <Trash2 className="w-3.5 h-3.5" />,
  completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  commented: <MessageSquare className="w-3.5 h-3.5" />,
  assigned: <UserPlus className="w-3.5 h-3.5" />,
  moved: <ArrowRight className="w-3.5 h-3.5" />,
};

const actionColors: Record<Activity['action'], string> = {
  created: 'bg-status-done/20 text-status-done',
  updated: 'bg-status-progress/20 text-status-progress',
  deleted: 'bg-destructive/20 text-destructive',
  completed: 'bg-status-done/20 text-status-done',
  commented: 'bg-primary/20 text-primary',
  assigned: 'bg-accent/20 text-accent',
  moved: 'bg-status-review/20 text-status-review',
};

const actionText: Record<Activity['action'], string> = {
  created: 'a créé',
  updated: 'a mis à jour',
  deleted: 'a supprimé',
  completed: 'a terminé',
  commented: 'a commenté sur',
  assigned: 'a assigné',
  moved: 'a déplacé',
};

interface ActivityFeedProps {
  maxItems?: number;
  compact?: boolean;
}

export function ActivityFeed({ maxItems = 10, compact = false }: ActivityFeedProps) {
  const { activities } = useRealtime();
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <ScrollArea className={cn("pr-4", compact ? "h-[200px]" : "h-[400px]")}>
      <div className="space-y-4">
        {displayedActivities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              "flex gap-3 animate-in slide-in-from-top-2",
              index === 0 && "duration-300"
            )}
          >
            <div className="relative">
              <Avatar className={cn("border-2 border-background", compact ? "h-8 w-8" : "h-10 w-10")}>
                <AvatarImage src={activity.userAvatar} />
                <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 rounded-full p-1",
                actionColors[activity.action]
              )}>
                {actionIcons[activity.action]}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn("text-foreground", compact ? "text-xs" : "text-sm")}>
                <span className="font-medium">{activity.userName}</span>
                {' '}
                <span className="text-muted-foreground">{actionText[activity.action]}</span>
                {' '}
                <span className="font-medium text-primary">{activity.targetName}</span>
              </p>
              {activity.details && (
                <p className={cn(
                  "text-muted-foreground mt-0.5",
                  compact ? "text-[10px]" : "text-xs"
                )}>
                  {activity.details}
                </p>
              )}
              <p className={cn(
                "text-muted-foreground mt-1",
                compact ? "text-[10px]" : "text-xs"
              )}>
                {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
