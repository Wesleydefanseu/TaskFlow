import { useRealtime, Presence } from '@/contexts/RealtimeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const statusColors: Record<Presence['status'], string> = {
  online: 'bg-status-done',
  away: 'bg-status-progress',
  busy: 'bg-destructive',
};

const statusText: Record<Presence['status'], string> = {
  online: 'En ligne',
  away: 'Absent',
  busy: 'Occupé',
};

interface PresenceIndicatorProps {
  showAll?: boolean;
  maxDisplay?: number;
}

export function PresenceIndicator({ showAll = false, maxDisplay = 4 }: PresenceIndicatorProps) {
  const { presences, onlineUsers } = useRealtime();
  const displayUsers = showAll ? presences : onlineUsers;
  const visibleUsers = displayUsers.slice(0, maxDisplay);
  const remainingCount = displayUsers.length - maxDisplay;

  return (
    <TooltipProvider>
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {visibleUsers.map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:scale-110 transition-transform">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
                    statusColors[user.status]
                  )} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        statusColors[user.status]
                      )} />
                      <span className="text-xs text-muted-foreground">
                        {statusText[user.status]}
                      </span>
                    </div>
                    {user.currentPage && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Sur: {user.currentPage}
                      </p>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="ml-1 h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                <span className="text-xs font-medium text-muted-foreground">
                  +{remainingCount}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="space-y-2">
                {displayUsers.slice(maxDisplay).map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{user.name}</span>
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      statusColors[user.status]
                    )} />
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        <div className="ml-3 text-xs text-muted-foreground">
          {onlineUsers.length} en ligne
        </div>
      </div>
    </TooltipProvider>
  );
}
