import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignees?: { name: string; avatar?: string }[];
  comments?: number;
  attachments?: number;
  labels?: { name: string; color: string }[];
}

interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  tasks: Task[];
}

export function KanbanColumn({ title, count, color, tasks }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          <h3 className="font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}

        {/* Add Task Button */}
        <button className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Ajouter une tâche</span>
        </button>
      </div>
    </div>
  );
}
