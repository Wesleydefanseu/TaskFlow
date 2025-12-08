import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/components/dashboard/DraggableTaskCard';
import { AssigneeSelector, TeamMember } from './AssigneeSelector';
import { cameroonTeamMembers } from '@/data/cameroonTeam';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Omit<Task, 'id'>) => void;
  initialData?: Task;
  columnId?: string;
  mode: 'create' | 'edit';
}

export function TaskForm({ open, onOpenChange, onSubmit, initialData, columnId, mode }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<Task['priority']>(initialData?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [selectedAssignees, setSelectedAssignees] = useState<TeamMember[]>([]);

  const availableMembers: TeamMember[] = cameroonTeamMembers.map(m => ({
    id: m.id,
    name: m.name,
    email: m.email,
    avatar: m.avatar,
    role: m.role,
  }));

  useEffect(() => {
    if (initialData?.assignees) {
      const mappedAssignees = initialData.assignees.map((a, index) => ({
        id: `assignee-${index}`,
        name: a.name,
        email: '',
        avatar: a.avatar,
        role: '',
      }));
      setSelectedAssignees(mappedAssignees);
    } else {
      setSelectedAssignees([]);
    }
  }, [initialData, open]);

  const handleAssign = (member: TeamMember) => {
    setSelectedAssignees(prev => [...prev, member]);
  };

  const handleRemove = (memberId: string) => {
    setSelectedAssignees(prev => prev.filter(a => a.id !== memberId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      priority,
      dueDate,
      columnId: columnId || initialData?.columnId || 'todo',
      assignees: selectedAssignees.map(a => ({ name: a.name, avatar: a.avatar })),
      comments: initialData?.comments || 0,
      attachments: initialData?.attachments || 0,
      labels: initialData?.labels || [],
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setSelectedAssignees([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nouvelle tâche' : 'Modifier la tâche'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre de la tâche"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez la tâche..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignés</Label>
            <AssigneeSelector
              selectedAssignees={selectedAssignees}
              availableMembers={availableMembers}
              onAssign={handleAssign}
              onRemove={handleRemove}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="gradient">
              {mode === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
