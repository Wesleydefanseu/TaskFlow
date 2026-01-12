import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GanttChart, GanttTask } from '@/components/charts/GanttChart';
import { PertDiagram, PertNode } from '@/components/charts/PertDiagram';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, GitBranch, Calendar, Loader2 } from 'lucide-react';

const ProjectPlanning = () => {
  const { projects, boards } = useWorkspace();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [pertNodes, setPertNodes] = useState<PertNode[]>([]);
  const [stats, setStats] = useState({
    totalDuration: 0,
    criticalTasks: 0,
    avgProgress: 0,
  });

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        let boardIds: string[] = [];

        if (selectedProject === 'all') {
          boardIds = boards.map(b => b.id);
        } else {
          boardIds = boards.filter(b => b.project_id === selectedProject).map(b => b.id);
        }

        if (boardIds.length === 0) {
          setGanttTasks([]);
          setPertNodes([]);
          setIsLoading(false);
          return;
        }

        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .in('board_id', boardIds)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Transform to Gantt tasks
        const now = new Date();
        const ganttData: GanttTask[] = (tasks || []).map((task, index) => {
          const startDate = new Date(task.created_at);
          const endDate = task.due_date ? new Date(task.due_date) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const progress = task.status === 'done' ? 100 
            : task.status === 'review' ? 75 
            : task.status === 'in_progress' ? 50 
            : 0;

          const colorMap: Record<string, string> = {
            done: 'bg-status-done',
            review: 'bg-status-review',
            in_progress: 'bg-status-progress',
            todo: 'bg-muted-foreground',
          };

          return {
            id: task.id,
            name: task.title,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            progress,
            color: colorMap[task.status] || 'bg-primary',
            dependencies: index > 0 ? [tasks[index - 1].id] : undefined,
          };
        });

        // Transform to PERT nodes
        const pertData: PertNode[] = (tasks || []).map((task, index) => {
          const startDate = new Date(task.created_at);
          const endDate = task.due_date ? new Date(task.due_date) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

          const statusMap: Record<string, 'completed' | 'in-progress' | 'not-started'> = {
            done: 'completed',
            review: 'in-progress',
            in_progress: 'in-progress',
            todo: 'not-started',
          };

          return {
            id: task.id,
            name: task.title,
            duration: duration,
            dependencies: index > 0 ? [tasks[index - 1].id] : [],
            status: statusMap[task.status] || 'not-started',
          };
        });

        setGanttTasks(ganttData);
        setPertNodes(pertData);

        // Calculate stats
        if (ganttData.length > 0) {
          const totalProgress = ganttData.reduce((sum, t) => sum + t.progress, 0);
          const avgProgress = Math.round(totalProgress / ganttData.length);
          const criticalTasks = ganttData.filter(t => t.progress < 50).length;
          
          // Calculate total duration
          const dates = ganttData.flatMap(t => [new Date(t.startDate), new Date(t.endDate)]);
          const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
          const totalDuration = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

          setStats({
            totalDuration,
            criticalTasks,
            avgProgress,
          });
        } else {
          setStats({ totalDuration: 0, criticalTasks: 0, avgProgress: 0 });
        }

      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [selectedProject, boards]);

  if (isLoading) {
    return (
      <DashboardLayout title="Planification" subtitle="Diagrammes Gantt et PERT">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: project.color || '#6366f1' }} 
                  />
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
            <div className="text-2xl font-bold">{stats.totalDuration} jours</div>
            <p className="text-xs text-muted-foreground">Estimation basée sur les tâches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches en retard</CardTitle>
            <GitBranch className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.criticalTasks}</div>
            <p className="text-xs text-muted-foreground">Progression &lt; 50%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression moyenne</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
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
              {ganttTasks.length > 0 ? (
                <GanttChart tasks={ganttTasks} />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Aucune tâche disponible
                </div>
              )}
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
              {pertNodes.length > 0 ? (
                <PertDiagram nodes={pertNodes} />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Aucune tâche disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ProjectPlanning;
