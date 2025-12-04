import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, closestCorners, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DroppableColumn } from '@/components/dashboard/DroppableColumn';
import { DraggableTaskCard, Task } from '@/components/dashboard/DraggableTaskCard';
import { TaskForm } from '@/components/forms/TaskForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/contexts/UserContext';
import { 
  LayoutGrid, 
  List, 
  Calendar,
  Filter,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Recherche utilisateur',
    description: 'Conduire des interviews avec 10 utilisateurs',
    priority: 'medium',
    dueDate: 'Lun 15',
    assignees: [{ name: 'Alice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }],
    comments: 3,
    labels: [{ name: 'Research', color: 'bg-status-review/20 text-status-review' }],
    columnId: 'todo',
  },
  {
    id: '2',
    title: 'Wireframes dashboard',
    priority: 'low',
    dueDate: 'Mar 16',
    assignees: [{ name: 'Bob' }],
    attachments: 2,
    columnId: 'todo',
  },
  {
    id: '3',
    title: 'Documentation API',
    description: 'Documenter tous les endpoints REST',
    priority: 'high',
    dueDate: 'Mer 17',
    comments: 1,
    labels: [{ name: 'Docs', color: 'bg-accent/20 text-accent' }],
    columnId: 'todo',
  },
  {
    id: '4',
    title: 'Design système de composants',
    description: 'Créer la bibliothèque de composants UI',
    priority: 'high',
    dueDate: "Aujourd'hui",
    assignees: [
      { name: 'Alice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
      { name: 'Charlie', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    ],
    comments: 12,
    attachments: 5,
    labels: [{ name: 'Design', color: 'bg-primary/20 text-primary' }],
    columnId: 'in-progress',
  },
  {
    id: '5',
    title: 'Intégration authentification',
    priority: 'urgent',
    dueDate: "Aujourd'hui",
    assignees: [{ name: 'Bob', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }],
    comments: 8,
    labels: [{ name: 'Backend', color: 'bg-accent/20 text-accent' }],
    columnId: 'in-progress',
  },
  {
    id: '6',
    title: 'Page de profil utilisateur',
    description: 'Interface complète avec édition',
    priority: 'medium',
    assignees: [
      { name: 'Diana' },
      { name: 'Alice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    ],
    comments: 6,
    attachments: 2,
    labels: [{ name: 'Frontend', color: 'bg-status-done/20 text-status-done' }],
    columnId: 'review',
  },
  {
    id: '7',
    title: 'Optimisation performances',
    priority: 'high',
    dueDate: 'Demain',
    comments: 4,
    columnId: 'review',
  },
  {
    id: '8',
    title: 'Setup projet initial',
    priority: 'low',
    assignees: [{ name: 'Bob', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }],
    labels: [{ name: 'Setup', color: 'bg-muted text-muted-foreground' }],
    columnId: 'done',
  },
  {
    id: '9',
    title: 'Configuration CI/CD',
    priority: 'medium',
    assignees: [{ name: 'Charlie', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }],
    comments: 2,
    columnId: 'done',
  },
];

const columns = [
  { id: 'todo', title: 'À faire', color: 'bg-muted-foreground' },
  { id: 'in-progress', title: 'En cours', color: 'bg-status-progress' },
  { id: 'review', title: 'En revue', color: 'bg-status-review' },
  { id: 'done', title: 'Terminé', color: 'bg-status-done' },
];

const Projects = () => {
  const permissions = usePermissions();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedColumnId, setSelectedColumnId] = useState<string>('todo');

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask) return;

    // If dropping over a column
    if (columns.some(col => col.id === overId)) {
      if (activeTask.columnId !== overId) {
        setTasks(tasks.map(t => 
          t.id === activeId ? { ...t, columnId: overId } : t
        ));
      }
      return;
    }

    // If dropping over another task
    if (overTask && activeTask.columnId !== overTask.columnId) {
      setTasks(tasks.map(t => 
        t.id === activeId ? { ...t, columnId: overTask.columnId } : t
      ));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask) return;

    // If over a task in the same column, reorder
    if (overTask && activeTask.columnId === overTask.columnId) {
      const columnTasks = tasks.filter(t => t.columnId === activeTask.columnId);
      const oldIndex = columnTasks.findIndex(t => t.id === activeId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);
      
      const reorderedColumnTasks = arrayMove(columnTasks, oldIndex, newIndex);
      const otherTasks = tasks.filter(t => t.columnId !== activeTask.columnId);
      
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

  const handleTaskSubmit = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      setTasks(tasks.map(t => 
        t.id === editingTask.id ? { ...t, ...taskData } : t
      ));
    } else {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
      };
      setTasks([...tasks, newTask]);
    }
  };

  const getColumnTasks = (columnId: string) => 
    tasks.filter(t => t.columnId === columnId);

  return (
    <DashboardLayout title="Projets" subtitle="Site Web Refonte - Sprint 3">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendrier
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
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

      {/* Kanban Board with DnD */}
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
