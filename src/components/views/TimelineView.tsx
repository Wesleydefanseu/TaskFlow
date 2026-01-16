import { useState } from 'react';
import { Task } from '@/components/dashboard/DraggableTaskCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

const priorityColors = {
  urgent: 'bg-destructive',
  high: 'bg-status-review',
  medium: 'bg-status-progress',
  low: 'bg-muted-foreground',
};

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function TimelineView({ tasks, onTaskClick }: TimelineViewProps) {
  const [startDate, setStartDate] = useState(() => startOfWeek(new Date(), { locale: fr }));
  const [daysToShow, setDaysToShow] = useState(14);

  const days = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, daysToShow - 1),
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    setStartDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setDaysToShow(prev => {
      if (direction === 'in') return Math.max(7, prev - 7);
      return Math.min(28, prev + 7);
    });
  };

  // Group tasks by assignee
  const tasksByAssignee: Record<string, Task[]> = {};
  tasks.forEach(task => {
    const assignee = task.assignees?.[0]?.name || 'Non assigné';
    if (!tasksByAssignee[assignee]) tasksByAssignee[assignee] = [];
    tasksByAssignee[assignee].push(task);
  });

  const getTaskPosition = (task: Task, dayIndex: number) => {
    // Simplified positioning - in real app would use actual dates
    const startOffset = Math.floor(Math.random() * 3);
    const duration = Math.floor(Math.random() * 4) + 2;
    return { start: startOffset, duration };
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {format(startDate, 'd MMM', { locale: fr })} - {format(addDays(startDate, daysToShow - 1), 'd MMM yyyy', { locale: fr })}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleZoom('in')} disabled={daysToShow <= 7}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleZoom('out')} disabled={daysToShow >= 28}>
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            {/* Header - Days */}
            <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${daysToShow}, 1fr)` }}>
              <div className="p-3 border-r border-border bg-secondary/50">
                <span className="text-sm font-medium text-muted-foreground">Équipe</span>
              </div>
              {days.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-2 text-center border-r border-border last:border-r-0",
                    isToday(day) && "bg-primary/10",
                    day.getDay() === 0 || day.getDay() === 6 ? "bg-secondary/30" : ""
                  )}
                >
                  <p className="text-xs text-muted-foreground">
                    {format(day, 'EEE', { locale: fr })}
                  </p>
                  <p className={cn(
                    "text-sm font-medium",
                    isToday(day) && "text-primary"
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
            </div>

            {/* Rows - Assignees */}
            {Object.entries(tasksByAssignee).map(([assignee, assigneeTasks]) => (
              <div
                key={assignee}
                className="grid border-b border-border last:border-b-0"
                style={{ gridTemplateColumns: `200px repeat(${daysToShow}, 1fr)` }}
              >
                {/* Assignee Info */}
                <div className="p-3 border-r border-border bg-secondary/30 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={assigneeTasks[0]?.assignees?.[0]?.avatar} />
                    <AvatarFallback>{assignee.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{assignee}</p>
                    <p className="text-xs text-muted-foreground">{assigneeTasks.length} tâches</p>
                  </div>
                </div>

                {/* Timeline Cells */}
                <div
                  className="relative col-span-full row-start-1 col-start-2"
                  style={{ height: '80px' }}
                >
                  {/* Grid lines */}
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${daysToShow}, 1fr)` }}>
                    {days.map((day, i) => (
                      <div
                        key={i}
                        className={cn(
                          "border-r border-border last:border-r-0",
                          isToday(day) && "bg-primary/5",
                          day.getDay() === 0 || day.getDay() === 6 ? "bg-secondary/20" : ""
                        )}
                      />
                    ))}
                  </div>

                  {/* Tasks */}
                  <TooltipProvider>
                    {assigneeTasks.slice(0, 2).map((task, taskIndex) => {
                      const position = { start: taskIndex * 3, duration: 3 + taskIndex };
                      const leftPercent = (position.start / daysToShow) * 100;
                      const widthPercent = (position.duration / daysToShow) * 100;

                      return (
                        <Tooltip key={task.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "absolute cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md rounded-md px-2 py-1 text-white text-xs font-medium truncate",
                                priorityColors[task.priority]
                              )}
                              style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                                top: `${8 + taskIndex * 32}px`,
                                maxWidth: `calc(${widthPercent}% - 4px)`,
                              }}
                              onClick={() => onTaskClick?.(task)}
                            >
                              {task.title}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[300px]">
                            <div className="space-y-1">
                              <p className="font-medium">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-muted-foreground">{task.description}</p>
                              )}
                              <p className="text-xs">Échéance: {task.dueDate || 'Non définie'}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-muted-foreground">Priorité:</span>
        {Object.entries(priorityColors).map(([priority, color]) => (
          <div key={priority} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded", color)} />
            <span className="capitalize">{priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
