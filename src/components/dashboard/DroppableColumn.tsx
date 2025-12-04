import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraggableTaskCard, Task } from './DraggableTaskCard';
import { cn } from '@/lib/utils';

interface DroppableColumnProps {
  id: string;
  title: string;
  count: number;
  color: string;
  tasks: Task[];
  onAddTask?: (columnId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function DroppableColumn({ 
  id, 
  title, 
  count, 
  color, 
  tasks, 
  onAddTask,
  onEditTask,
  onDeleteTask 
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

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
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => onAddTask?.(id)}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-3 overflow-y-auto pr-2 min-h-[200px] rounded-xl transition-colors p-2 -m-2",
          isOver && "bg-primary/5 border-2 border-dashed border-primary/30"
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <DraggableTaskCard 
              key={task.id} 
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Add Task Button */}
        <button 
          onClick={() => onAddTask?.(id)}
          className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Ajouter une tâche</span>
        </button>
      </div>
    </div>
  );
}
