import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock,
  Target,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';

const Analytics = () => {
  const { currentWorkspace, projects, members } = useWorkspace();
  const [timeRange, setTimeRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    avgTimePerTask: 0,
    completionRate: 0,
  });
  const [taskDistribution, setTaskDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
  const [projectProgressData, setProjectProgressData] = useState<{ name: string; progress: number }[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<{ name: string; tasks: number; avatar?: string }[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentWorkspace) return;
      
      setIsLoading(true);
      try {
        // Fetch all tasks from workspace projects
        const projectIds = projects.map(p => p.id);
        
        if (projectIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Get boards for projects
        const { data: boards } = await supabase
          .from('boards')
          .select('id, project_id')
          .in('project_id', projectIds);

        const boardIds = boards?.map(b => b.id) || [];

        if (boardIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Get all tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .in('board_id', boardIds);

        const allTasks = tasks || [];
        const completed = allTasks.filter(t => t.status === 'done').length;
        const inProgress = allTasks.filter(t => t.status === 'in_progress').length;
        const todo = allTasks.filter(t => t.status === 'todo').length;
        const review = allTasks.filter(t => t.status === 'review').length;

        setStats({
          totalTasks: allTasks.length,
          completedTasks: completed,
          inProgressTasks: inProgress,
          avgTimePerTask: allTasks.length > 0 ? 2.4 : 0,
          completionRate: allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0,
        });

        setTaskDistribution([
          { name: 'À faire', value: todo, color: 'hsl(var(--muted-foreground))' },
          { name: 'En cours', value: inProgress, color: 'hsl(var(--status-progress))' },
          { name: 'En revue', value: review, color: 'hsl(var(--status-review))' },
          { name: 'Terminé', value: completed, color: 'hsl(var(--status-done))' },
        ]);

        // Project progress
        const projectProgress = await Promise.all(
          projects.slice(0, 5).map(async (project) => {
            const projectBoards = boards?.filter(b => b.project_id === project.id) || [];
            const projectBoardIds = projectBoards.map(b => b.id);
            const projectTasks = allTasks.filter(t => projectBoardIds.includes(t.board_id));
            const projectCompleted = projectTasks.filter(t => t.status === 'done').length;
            const progress = projectTasks.length > 0 
              ? Math.round((projectCompleted / projectTasks.length) * 100) 
              : 0;
            
            return { name: project.name, progress };
          })
        );
        setProjectProgressData(projectProgress);

        // Team performance
        const teamStats = await Promise.all(
          members.slice(0, 5).map(async (member) => {
            const { data: assignees } = await supabase
              .from('task_assignees')
              .select('task_id, tasks(status)')
              .eq('user_id', member.user_id);

            const completedCount = assignees?.filter(
              (a: any) => a.tasks?.status === 'done'
            ).length || 0;

            return {
              name: member.profile?.full_name || 'Unknown',
              tasks: completedCount,
              avatar: member.profile?.avatar_url || undefined,
            };
          })
        );
        setTeamPerformance(teamStats.sort((a, b) => b.tasks - a.tasks));

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentWorkspace, projects, members]);

  if (isLoading) {
    return (
      <DashboardLayout title="Analytiques" subtitle="Statistiques et performances">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytiques" subtitle="Statistiques et performances de l'équipe">
      {/* Time Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-secondary rounded-lg p-1">
          {['7days', '30days', '90days', 'year'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={cn(timeRange === range && 'bg-background shadow-sm')}
            >
              {range === '7days' && '7 jours'}
              {range === '30days' && '30 jours'}
              {range === '90days' && '90 jours'}
              {range === 'year' && 'Année'}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exporter le rapport
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tâches terminées</p>
              <p className="text-3xl font-bold mt-1">{stats.completedTasks}</p>
              <div className="flex items-center gap-1 mt-2 text-status-done">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">sur {stats.totalTasks}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-status-done/10">
              <CheckCircle2 className="w-6 h-6 text-status-done" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En cours</p>
              <p className="text-3xl font-bold mt-1">{stats.inProgressTasks}</p>
              <div className="flex items-center gap-1 mt-2 text-status-progress">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">tâches actives</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-accent/10">
              <Clock className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taux de complétion</p>
              <p className="text-3xl font-bold mt-1">{stats.completionRate}%</p>
              <div className="flex items-center gap-1 mt-2 text-status-done">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">progression</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <Target className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Membres actifs</p>
              <p className="text-3xl font-bold mt-1">{members.length}</p>
              <div className="flex items-center gap-1 mt-2 text-status-progress">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">dans l'équipe</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-status-progress/10">
              <Zap className="w-6 h-6 text-status-progress" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            Performance équipe
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <PieChartIcon className="w-4 h-4" />
            Projets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Distribution */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold">Distribution des tâches</h3>
                <p className="text-sm text-muted-foreground">Par statut</p>
              </div>
              {taskDistribution.some(t => t.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={taskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {taskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {taskDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </Card>

            {/* Project Progress */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold">Progression des projets</h3>
                <p className="text-sm text-muted-foreground">Par projet</p>
              </div>
              {projectProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectProgressData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} className="text-muted-foreground" fontSize={12} />
                    <YAxis type="category" dataKey="name" className="text-muted-foreground" fontSize={12} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Progression %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Aucun projet disponible
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold">Classement de l'équipe</h3>
              <p className="text-sm text-muted-foreground">Par tâches terminées</p>
            </div>
            {teamPerformance.length > 0 ? (
              <div className="space-y-4">
                {teamPerformance.map((member, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      i === 0 && "bg-yellow-500/20 text-yellow-500",
                      i === 1 && "bg-gray-400/20 text-gray-400",
                      i === 2 && "bg-orange-500/20 text-orange-500",
                      i > 2 && "bg-muted text-muted-foreground"
                    )}>
                      {i + 1}
                    </span>
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.tasks} tâches terminées</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Aucune donnée d'équipe disponible
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold">Santé des projets</h3>
              <p className="text-sm text-muted-foreground">Progression globale</p>
            </div>
            {projectProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={projectProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} className="text-muted-foreground" fontSize={12} />
                  <YAxis type="category" dataKey="name" className="text-muted-foreground" fontSize={12} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Progression" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Aucun projet disponible
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Analytics;
