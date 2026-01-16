import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, MessageSquare, Paperclip, Clock, GripVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignees?: { name: string; avatar?: string }[];
  comments?: number;
  attachments?: number;
  labels?: { name: string; color: string }[];
  columnId: string;
}

interface DraggableTaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const priorityStyles = {
  low: 'bg-priority-low/10 text-priority-low',
  medium: 'bg-priority-medium/10 text-priority-medium',
  high: 'bg-priority-high/10 text-priority-high',
  urgent: 'bg-priority-urgent/10 text-priority-urgent',
};

const priorityLabels = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente',
};

export function DraggableTaskCard({ task, onEdit, onDelete }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { title, description, priority, dueDate, assignees = [], comments = 0, attachments = 0, labels = [] } = task;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border border-border rounded-xl p-4 hover:shadow-card transition-all duration-200 cursor-pointer group relative",
        isDragging && "opacity-50 shadow-lg scale-105 z-50"
      )}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-3 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn("px-2 py-0.5 rounded-full text-xs font-medium", label.color)}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{title}</h4>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(task);
          }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
      )}

      {/* Priority & Due Date */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priorityStyles[priority])}>
          {priorityLabels[priority]}
        </span>
        {dueDate && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {dueDate}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {assignees.slice(0, 3).map((assignee, index) => (
            <Avatar key={index} className="h-6 w-6 border-2 border-card">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-xs">{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {assignees.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium border-2 border-card">
              +{assignees.length - 3}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-muted-foreground">
          {comments > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3 h-3" />
              {comments}
            </span>
          )}
          {attachments > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Paperclip className="w-3 h-3" />
              {attachments}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
