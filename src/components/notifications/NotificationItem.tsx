import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  AtSign, 
  MessageSquare, 
  ListTodo,
  Info,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Notification, useNotifications } from '@/contexts/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
}

const typeConfig = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  task: { icon: ListTodo, color: 'text-primary', bg: 'bg-primary/10' },
  mention: { icon: AtSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  comment: { icon: MessageSquare, color: 'text-cyan-500', bg: 'bg-cyan-500/10' }
};

export function NotificationItem({ notification, compact = false }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  const content = (
    <div
      className={cn(
        "group relative flex gap-3 p-3 rounded-lg transition-all duration-200",
        !notification.read && "bg-primary/5 border-l-2 border-primary",
        notification.read && "hover:bg-secondary/50",
        compact && "p-2"
      )}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", config.bg, compact && "w-8 h-8")}>
        <Icon className={cn("w-5 h-5", config.color, compact && "w-4 h-4")} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={cn(
              "font-medium text-sm",
              !notification.read && "text-foreground",
              notification.read && "text-muted-foreground"
            )}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {notification.message}
            </p>
          </div>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: fr })}
        </p>
      </div>

      {/* Actions */}
      <div className={cn(
        "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
        compact && "absolute right-2 top-2"
      )}>
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              markAsRead(notification.id);
            }}
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link to={notification.link} onClick={() => markAsRead(notification.id)}>
        {content}
      </Link>
    );
  }

  return content;
}
