import { useState } from 'react';
import { Task } from '@/components/dashboard/DraggableTaskCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal,
  Calendar,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig = {
  urgent: { color: 'text-destructive', bg: 'bg-destructive/10', icon: '🔴' },
  high: { color: 'text-status-review', bg: 'bg-status-review/10', icon: '🟠' },
  medium: { color: 'text-status-progress', bg: 'bg-status-progress/10', icon: '🟡' },
  low: { color: 'text-muted-foreground', bg: 'bg-muted', icon: '🟢' },
};

interface ListViewProps {
  tasks: Task[];
  groupBy: 'status' | 'priority' | 'assignee';
  onTaskClick?: (task: Task) => void;
  onTaskComplete?: (taskId: string, completed: boolean) => void;
}

export function ListView({ tasks, groupBy, onTaskClick, onTaskComplete }: ListViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['todo', 'in-progress', 'review', 'done']));
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const groupTasks = () => {
    const groups: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      let key: string;
      if (groupBy === 'status') {
        key = task.columnId;
      } else if (groupBy === 'priority') {
        key = task.priority;
      } else {
        key = task.assignees?.[0]?.name || 'Non assigné';
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });
    
    return groups;
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const handleComplete = (taskId: string) => {
    const newCompleted = !completedTasks.has(taskId);
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (newCompleted) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
    onTaskComplete?.(taskId, newCompleted);
  };

  const groups = groupTasks();
  const groupLabels: Record<string, string> = {
    'todo': 'À faire',
    'in-progress': 'En cours',
    'review': 'En revue',
    'done': 'Terminé',
    'urgent': 'Urgent',
    'high': 'Haute',
    'medium': 'Moyenne',
    'low': 'Basse',
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-[auto_1fr_120px_120px_100px_40px] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
        <div className="w-6" />
        <div>Tâche</div>
        <div>Assigné</div>
        <div>Échéance</div>
        <div>Priorité</div>
        <div />
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([group, groupTasks]) => (
        <div key={group} className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Group Header */}
          <button
            onClick={() => toggleGroup(group)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
          >
            {expandedGroups.has(group) ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="font-medium">{groupLabels[group] || group}</span>
            <Badge variant="secondary" className="text-xs">
              {groupTasks.length}
            </Badge>
          </button>

          {/* Tasks */}
          {expandedGroups.has(group) && (
            <div className="divide-y divide-border">
              {groupTasks.map(task => {
                const isCompleted = completedTasks.has(task.id);
                const priority = priorityConfig[task.priority];
                
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "grid grid-cols-[auto_1fr_120px_120px_100px_40px] gap-4 px-4 py-3 items-center hover:bg-secondary/30 transition-colors cursor-pointer",
                      isCompleted && "opacity-50"
                    )}
                    onClick={() => onTaskClick?.(task)}
                  >
                    {/* Checkbox */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => handleComplete(task.id)}
                      />
                    </div>

                    {/* Task Info */}
                    <div className="min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        isCompleted && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Assignees */}
                    <div className="flex -space-x-1">
                      {task.assignees?.slice(0, 3).map((assignee, i) => (
                        <Avatar key={i} className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {!task.assignees?.length && (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-1.5 text-sm">
                      {task.dueDate ? (
                        <>
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className={cn(
                            task.dueDate === "Aujourd'hui" && "text-destructive font-medium"
                          )}>
                            {task.dueDate}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="flex items-center gap-1.5">
                      <Flag className={cn("w-3.5 h-3.5", priority.color)} />
                      <span className={cn("text-xs font-medium capitalize", priority.color)}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
