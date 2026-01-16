import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, closestCorners, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DroppableColumn } from '@/components/dashboard/DroppableColumn';
import { DraggableTaskCard, Task } from '@/components/dashboard/DraggableTaskCard';
import { TaskForm } from '@/components/forms/TaskForm';
import { ListView } from '@/components/views/ListView';
import { TimelineView } from '@/components/views/TimelineView';
import { PresenceIndicator } from '@/components/collaboration/PresenceIndicator';
import { ActivityFeed } from '@/components/collaboration/ActivityFeed';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePermissions } from '@/contexts/UserContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  createTask,
  updateTask,
  deleteTask,
  assignTaskToUsers,
  unassignTaskFromUser,
} from '@/lib/api';
import { 
  LayoutGrid, 
  List, 
  Calendar,
  Filter,
  SlidersHorizontal,
  Plus,
  GanttChart,
  Sparkles,
  Activity,
  Loader2
} from 'lucide-react';

const columns = [
  { id: 'todo', title: 'À faire', color: 'bg-muted-foreground' },
  { id: 'in_progress', title: 'En cours', color: 'bg-status-progress' },
  { id: 'review', title: 'En revue', color: 'bg-status-review' },
  { id: 'done', title: 'Terminé', color: 'bg-status-done' },
];

const Projects = () => {
  const permissions = usePermissions();
  const { boards, projects, members } = useWorkspace();
  const { addNotification } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedColumnId, setSelectedColumnId] = useState<string>('todo');
  const [currentView, setCurrentView] = useState('kanban');
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'assignee'>('status');
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (boards.length === 0) {
        setIsLoading(false);
        return;
      }

      const boardId = selectedBoardId || boards[0]?.id;
      if (!boardId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // First, try a simpler query to check if tasks exist
        const { data: simpleTasks, error: simpleError } = await supabase
          .from('tasks')
          .select('*')
          .eq('board_id', boardId)
          .order('position', { ascending: true });

        if (simpleError) {
          console.error('Simple query error:', simpleError);
          throw simpleError;
        }

        // If simple query works, try the complex query
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            task_assignees(
              user_id,
              profiles(id, full_name, avatar_url)
            ),
            task_labels(
              labels(id, name, color)
            )
          `)
          .eq('board_id', boardId)
          .order('position', { ascending: true });

        if (error) {
          console.warn('Complex query failed, using simple data:', error);
          // Fall back to simple data if complex query fails
          const formattedTasks: Task[] = (simpleTasks || []).map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || undefined,
            priority: task.priority as 'urgent' | 'high' | 'medium' | 'low',
            dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }) : undefined,
            columnId: task.status.replace('_', '-'),
            assignees: [],
            labels: [],
            comments: 0,
            attachments: 0,
          }));
          setTasks(formattedTasks);
        } else {
          const formattedTasks: Task[] = (data || []).map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || undefined,
            priority: task.priority as 'urgent' | 'high' | 'medium' | 'low',
            dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }) : undefined,
            columnId: task.status.replace('_', '-'),
            assignees: task.task_assignees?.map((a: any) => ({
              name: a.profiles?.full_name || 'Unknown',
              avatar: a.profiles?.avatar_url || undefined,
            })) || [],
            labels: task.task_labels?.map((l: any) => ({
              name: l.labels?.name || '',
              color: `bg-[${l.labels?.color}]/20 text-[${l.labels?.color}]`,
            })) || [],
            comments: 0,
            attachments: 0,
          }));
          setTasks(formattedTasks);
        }

        if (!selectedBoardId) setSelectedBoardId(boardId);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Don't show error toast for now, just log it
        // toast.error('Erreur lors du chargement des tâches');
        setTasks([]); // Set empty array to prevent crashes
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [boards, selectedBoardId]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTaskItem) return;

    if (columns.some(col => col.id === overId || col.id === overId.replace('-', '_'))) {
      const normalizedColumnId = overId.includes('_') ? overId.replace('_', '-') : overId;
      if (activeTaskItem.columnId !== normalizedColumnId) {
        setTasks(tasks.map(t => 
          t.id === activeId ? { ...t, columnId: normalizedColumnId } : t
        ));
      }
      return;
    }

    if (overTask && activeTaskItem.columnId !== overTask.columnId) {
      setTasks(tasks.map(t => 
        t.id === activeId ? { ...t, columnId: overTask.columnId } : t
      ));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTaskItem = tasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    // Update in database
    try {
      const status = activeTaskItem.columnId.replace('-', '_') as 'todo' | 'in_progress' | 'review' | 'done';
      await supabase
        .from('tasks')
        .update({ status })
        .eq('id', activeId);
    } catch (error) {
      console.error('Error updating task status:', error);
    }

    const overTask = tasks.find(t => t.id === overId);
    if (overTask && activeTaskItem.columnId === overTask.columnId) {
      const columnTasks = tasks.filter(t => t.columnId === activeTaskItem.columnId);
      const oldIndex = columnTasks.findIndex(t => t.id === activeId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);
      
      const reorderedColumnTasks = arrayMove(columnTasks, oldIndex, newIndex);
      const otherTasks = tasks.filter(t => t.columnId !== activeTaskItem.columnId);
      
      setTasks([...otherTasks, ...reorderedColumnTasks]);
    }
  };

  const handleAddTask = (columnId: string) => {
    if (!permissions.canCreateTask) return;
    setEditingTask(undefined);
    setSelectedColumnId(columnId);
    setTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    if (!permissions.canEditTask) return;
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleTaskSubmit = async (taskData: Omit<Task, 'id'>) => {
    if (!selectedBoardId) return;

    try {
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.columnId.replace('-', '_') as 'todo' | 'in_progress' | 'review' | 'done',
          due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
        });

        // Handle assignees updates
        if (taskData.assignees && taskData.assignees.length > 0) {
          // Get current assignees
          const currentAssignees = editingTask.assignees || [];
          const newAssigneeNames = taskData.assignees.map(a => a.name);
          
          // Find members to remove
          const assigneesToRemove = currentAssignees.filter(
            a => !newAssigneeNames.includes(a.name)
          );
          
          // Remove old assignees
          for (const assignee of assigneesToRemove) {
            const member = members.find(m => m.profile?.full_name === assignee.name);
            if (member) {
              await unassignTaskFromUser(editingTask.id, member.user_id);
            }
          }
          
          // Add new assignees
          const newMemberIds = taskData.assignees
            .map(a => members.find(m => m.profile?.full_name === a.name)?.user_id)
            .filter(Boolean) as string[];
          
          if (newMemberIds.length > 0) {
            try {
              await assignTaskToUsers(editingTask.id, newMemberIds);
            } catch (err: any) {
              if (!err.message?.includes('already assigned')) {
                throw err;
              }
            }
          }
        }

        setTasks(tasks.map(t => 
          t.id === editingTask.id ? { ...t, ...taskData } : t
        ));
        toast.success('Tâche mise à jour');

        await addNotification({
          type: 'task',
          title: 'Tâche mise à jour',
          message: `La tâche "${taskData.title}" a été mise à jour`,
        });

      } else {
        // Create new task
        const newTask = await createTask(
          selectedBoardId,
          taskData.title,
          {
            description: taskData.description,
            status: taskData.columnId.replace('-', '_') as 'todo' | 'in_progress' | 'review' | 'done',
            priority: taskData.priority,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
          }
        );

        // Assign task to selected users
        if (taskData.assignees && taskData.assignees.length > 0) {
          const memberIds = taskData.assignees
            .map(assignee => 
              members.find(m => m.profile?.full_name === assignee.name)?.user_id
            )
            .filter(Boolean) as string[];
          
          if (memberIds.length > 0) {
            try {
              await assignTaskToUsers(newTask.id, memberIds);
            } catch (err: any) {
              console.warn('Error assigning task:', err);
              // Don't fail if assignment fails
            }
          }
        }

        const formattedTask: Task = {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority as 'urgent' | 'high' | 'medium' | 'low',
          dueDate: newTask.due_date ? new Date(newTask.due_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }) : undefined,
          columnId: taskData.columnId,
          assignees: taskData.assignees || [],
          labels: [],
          comments: 0,
          attachments: 0,
        };

        setTasks([...tasks, formattedTask]);
        toast.success('Tâche créée');
        await addNotification({
          type: 'task',
          title: 'Nouvelle tâche créée',
          message: `La tâche "${taskData.title}" a été créée avec succès`,
        });
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const getColumnTasks = (columnId: string) => {
    const normalizedColumnId = columnId.replace('_', '-');
    return tasks.filter(t => t.columnId === normalizedColumnId || t.columnId === columnId);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Projets" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const currentProject = projects.find(p => 
    boards.find(b => b.id === selectedBoardId)?.project_id === p.id
  );

  return (
    <DashboardLayout title="Projets" subtitle={currentProject?.name || 'Sélectionnez un projet'}>
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Tabs value={currentView} onValueChange={setCurrentView}>
            <TabsList>
              <TabsTrigger value="kanban" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="w-4 h-4" />
                Liste
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <GanttChart className="w-4 h-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="w-4 h-4" />
                Calendrier
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Online Users */}
          <div className="hidden lg:block">
            <PresenceIndicator maxDisplay={3} />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* AI Assistant */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Assistant IA
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Assistant IA</SheetTitle>
                <SheetDescription>Assistant IA pour vous aider avec vos tâches</SheetDescription>
              </SheetHeader>
              <AIAssistant className="h-full border-0 rounded-none" />
            </SheetContent>
          </Sheet>

          {/* Activity Feed */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Activity className="w-4 h-4" />
                Activité
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Activité récente</SheetTitle>
                <SheetDescription>Flux d'activité récente du projet</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ActivityFeed maxItems={15} />
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Trier
          </Button>
          {permissions.canCreateTask && (
            <Button variant="gradient" size="sm" onClick={() => handleAddTask('todo')}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle tâche
            </Button>
          )}
        </div>
      </div>

      {/* Views */}
      {boards.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground mb-4">Aucun tableau disponible. Créez d'abord un projet.</p>
          <Button variant="outline" onClick={() => window.location.href = '/boards'}>
            Aller aux tableaux
          </Button>
        </div>
      ) : (
        <>
          {currentView === 'kanban' && (
            <DndContext
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6">
                {columns.map((column) => {
                  const columnTasks = getColumnTasks(column.id);
                  return (
                    <DroppableColumn
                      key={column.id}
                      id={column.id}
                      title={column.title}
                      count={columnTasks.length}
                      color={column.color}
                      tasks={columnTasks}
                      onAddTask={permissions.canCreateTask ? handleAddTask : undefined}
                      onEditTask={permissions.canEditTask ? handleEditTask : undefined}
                    />
                  );
                })}
              </div>

              <DragOverlay>
                {activeTask && <DraggableTaskCard task={activeTask} />}
              </DragOverlay>
            </DndContext>
          )}

          {currentView === 'list' && (
            <ListView
              tasks={tasks}
              groupBy={groupBy}
              onTaskClick={handleEditTask}
            />
          )}

          {currentView === 'timeline' && (
            <TimelineView
              tasks={tasks}
              onTaskClick={handleEditTask}
            />
          )}

          {currentView === 'calendar' && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Vue Calendrier</h3>
              <p className="text-sm text-muted-foreground">
                Accédez à la page Calendrier pour une vue complète avec gestion des événements.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/calendar'}>
                Ouvrir le calendrier
              </Button>
            </div>
          )}
        </>
      )}

      {/* Task Form */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        columnId={selectedColumnId}
        mode={editingTask ? 'edit' : 'create'}
      />
    </DashboardLayout>
  );
};

export default Projects;
