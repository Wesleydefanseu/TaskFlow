import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { KanbanColumn } from '@/components/dashboard/KanbanColumn';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutGrid, 
  List, 
  Calendar,
  Filter,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

const columns = [
  {
    title: 'À faire',
    count: 5,
    color: 'bg-muted-foreground',
    tasks: [
      {
        id: '1',
        title: 'Recherche utilisateur',
        description: 'Conduire des interviews avec 10 utilisateurs',
        priority: 'medium' as const,
        dueDate: 'Lun 15',
        assignees: [{ name: 'Alice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }],
        comments: 3,
        labels: [{ name: 'Research', color: 'bg-status-review/20 text-status-review' }],
      },
      {
        id: '2',
        title: 'Wireframes dashboard',
        priority: 'low' as const,
        dueDate: 'Mar 16',
        assignees: [{ name: 'Bob' }],
        attachments: 2,
      },
      {
        id: '3',
        title: 'Documentation API',
        description: 'Documenter tous les endpoints REST',
        priority: 'high' as const,
        dueDate: 'Mer 17',
        comments: 1,
        labels: [{ name: 'Docs', color: 'bg-accent/20 text-accent' }],
      },
    ],
  },
  {
    title: 'En cours',
    count: 4,
    color: 'bg-status-progress',
    tasks: [
      {
        id: '4',
        title: 'Design système de composants',
        description: 'Créer la bibliothèque de composants UI',
        priority: 'high' as const,
        dueDate: 'Aujourd\'hui',
        assignees: [
          { name: 'Alice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
          { name: 'Charlie', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
        ],
        comments: 12,
        attachments: 5,
        labels: [{ name: 'Design', color: 'bg-primary/20 text-primary' }],
      },
      {
        id: '5',
        title: 'Intégration authentification',
        priority: 'urgent' as const,
        dueDate: 'Aujourd\'hui',
        assignees: [{ name: 'Bob', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }],
        comments: 8,
        labels: [{ name: 'Backend', color: 'bg-accent/20 text-accent' }],
      },
    ],
  },
  {
    title: 'En revue',
    count: 3,
    color: 'bg-status-review',
    tasks: [
      {
        id: '6',
        title: 'Page de profil utilisateur',
        description: 'Interface complète avec édition',
        priority: 'medium' as const,
        assignees: [
          { name: 'Diana' },
          { name: 'Alice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
        ],
        comments: 6,
        attachments: 2,
        labels: [{ name: 'Frontend', color: 'bg-status-done/20 text-status-done' }],
      },
      {
        id: '7',
        title: 'Optimisation performances',
        priority: 'high' as const,
        dueDate: 'Demain',
        comments: 4,
      },
    ],
  },
  {
    title: 'Terminé',
    count: 8,
    color: 'bg-status-done',
    tasks: [
      {
        id: '8',
        title: 'Setup projet initial',
        priority: 'low' as const,
        assignees: [{ name: 'Bob', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }],
        labels: [{ name: 'Setup', color: 'bg-muted text-muted-foreground' }],
      },
      {
        id: '9',
        title: 'Configuration CI/CD',
        priority: 'medium' as const,
        assignees: [{ name: 'Charlie', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }],
        comments: 2,
      },
    ],
  },
];

const Projects = () => {
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
          <Button variant="gradient" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6">
        {columns.map((column) => (
          <KanbanColumn key={column.title} {...column} />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
