import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GanttChart, GanttTask } from '@/components/charts/GanttChart';
import { PertDiagram, PertNode } from '@/components/charts/PertDiagram';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, GitBranch, Calendar } from 'lucide-react';

// Demo data for Gantt chart
const demoGanttTasks: GanttTask[] = [
  {
    id: '1',
    name: 'Analyse des besoins',
    startDate: '2024-12-01',
    endDate: '2024-12-10',
    progress: 100,
    color: 'bg-status-done',
    assignee: 'Marie-Claire Fotso',
  },
  {
    id: '2',
    name: 'Design UI/UX',
    startDate: '2024-12-08',
    endDate: '2024-12-20',
    progress: 85,
    color: 'bg-status-progress',
    dependencies: ['1'],
    assignee: 'Sandrine Tchamba',
  },
  {
    id: '3',
    name: 'Développement Backend',
    startDate: '2024-12-15',
    endDate: '2024-12-30',
    progress: 60,
    color: 'bg-primary',
    dependencies: ['1'],
    assignee: 'Jean-Paul Mbarga',
  },
  {
    id: '4',
    name: 'Développement Frontend',
    startDate: '2024-12-18',
    endDate: '2025-01-05',
    progress: 40,
    color: 'bg-accent',
    dependencies: ['2'],
    assignee: 'Emmanuel Ngono',
  },
  {
    id: '5',
    name: 'Intégration API',
    startDate: '2024-12-28',
    endDate: '2025-01-08',
    progress: 20,
    color: 'bg-status-review',
    dependencies: ['3', '4'],
    assignee: 'Jean-Paul Mbarga',
  },
  {
    id: '6',
    name: 'Tests et QA',
    startDate: '2025-01-05',
    endDate: '2025-01-15',
    progress: 0,
    color: 'bg-muted-foreground',
    dependencies: ['5'],
    assignee: 'Patrick Nganou',
  },
  {
    id: '7',
    name: 'Déploiement',
    startDate: '2025-01-14',
    endDate: '2025-01-18',
    progress: 0,
    color: 'bg-destructive',
    dependencies: ['6'],
    assignee: 'Emmanuel Ngono',
  },
];

// Demo data for PERT diagram
const demoPertNodes: PertNode[] = [
  {
    id: '1',
    name: 'Analyse des besoins',
    duration: 10,
    dependencies: [],
    status: 'completed',
  },
  {
    id: '2',
    name: 'Design UI/UX',
    duration: 13,
    dependencies: ['1'],
    status: 'in-progress',
  },
  {
    id: '3',
    name: 'Développement Backend',
    duration: 16,
    dependencies: ['1'],
    status: 'in-progress',
  },
  {
    id: '4',
    name: 'Développement Frontend',
    duration: 19,
    dependencies: ['2'],
    status: 'in-progress',
  },
  {
    id: '5',
    name: 'Intégration API',
    duration: 12,
    dependencies: ['3', '4'],
    status: 'not-started',
  },
  {
    id: '6',
    name: 'Tests et QA',
    duration: 11,
    dependencies: ['5'],
    status: 'not-started',
  },
  {
    id: '7',
    name: 'Déploiement',
    duration: 5,
    dependencies: ['6'],
    status: 'not-started',
  },
];

const ProjectPlanning = () => {
  const { currentWorkspace } = useWorkspace();
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const projects = currentWorkspace?.projects || [];

  return (
    <DashboardLayout title="Planification" subtitle="Diagrammes Gantt et PERT">
      <div className="flex items-center justify-between mb-6">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Sélectionner un projet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les projets</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${project.color}`} />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée totale</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48 jours</div>
            <p className="text-xs text-muted-foreground">Du 01/12/2024 au 18/01/2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches critiques</CardTitle>
            <GitBranch className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">4</div>
            <p className="text-xs text-muted-foreground">Sur le chemin critique</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression moyenne</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">44%</div>
            <p className="text-xs text-muted-foreground">Du projet global</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gantt" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gantt" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Diagramme de Gantt
          </TabsTrigger>
          <TabsTrigger value="pert" className="gap-2">
            <GitBranch className="w-4 h-4" />
            Diagramme PERT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gantt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagramme de Gantt</CardTitle>
              <CardDescription>
                Visualisez la chronologie des tâches avec leurs dépendances et progression
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <GanttChart tasks={demoGanttTasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pert" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagramme PERT</CardTitle>
              <CardDescription>
                Analysez le chemin critique et les marges de temps de chaque tâche
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <PertDiagram nodes={demoPertNodes} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ProjectPlanning;
