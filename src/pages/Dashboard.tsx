import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { useUser, usePermissions, roleLabels } from '@/contexts/UserContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp,
  ArrowRight,
  Calendar,
  BarChart3,
  Shield,
  FolderKanban,
  Settings,
  Eye,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  due_date?: string;
  status: string;
}

interface Stats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  membersCount: number;
  projectsCount: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: userLoading } = useUser();
  const { currentWorkspace, projects, members, isLoading: workspaceLoading } = useWorkspace();
  const permissions = usePermissions();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    membersCount: 0,
    projectsCount: 0,
  });
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, userLoading, navigate]);

  // Redirect if no workspace selected
  useEffect(() => {
    if (!workspaceLoading && isAuthenticated && !currentWorkspace) {
      navigate('/workspaces');
    }
  }, [currentWorkspace, workspaceLoading, isAuthenticated, navigate]);

  // Fetch tasks from database
  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentWorkspace) return;

      try {
        // Get all boards for current workspace projects
        const projectIds = projects.map(p => p.id);
        if (projectIds.length === 0) {
          setTasks([]);
          setIsLoadingTasks(false);
          return;
        }

        const { data: boards } = await supabase
          .from('boards')
          .select('id')
          .in('project_id', projectIds);

        if (!boards || boards.length === 0) {
          setTasks([]);
          setIsLoadingTasks(false);
          return;
        }

        const boardIds = boards.map(b => b.id);

        // Get recent tasks
        const { data: tasksData, error } = await supabase
          .from('tasks')
          .select('*')
          .in('board_id', boardIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        setTasks(tasksData || []);

        // Calculate stats
        const { count: totalCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .in('board_id', boardIds);

        const { count: completedCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .in('board_id', boardIds)
          .eq('status', 'done');

        const { count: inProgressCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .in('board_id', boardIds)
          .eq('status', 'in_progress');

        setStats({
          totalTasks: totalCount || 0,
          completedTasks: completedCount || 0,
          inProgressTasks: inProgressCount || 0,
          membersCount: members.length,
          projectsCount: projects.length,
        });
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    if (!workspaceLoading && projects.length >= 0) {
      fetchTasks();
    }
  }, [currentWorkspace, projects, members, workspaceLoading]);

  const getStatsForRole = () => {
    const role = user?.role || 'developpeur';
    
    switch (role) {
      case 'admin':
        return [
          { title: 'Membres', value: stats.membersCount, change: 'Espace de travail', changeType: 'positive' as const, icon: Users },
          { title: 'Projets actifs', value: stats.projectsCount, change: 'Total', changeType: 'positive' as const, icon: FolderKanban },
          { title: 'Tâches terminées', value: stats.completedTasks, change: `/${stats.totalTasks} total`, changeType: 'positive' as const, icon: CheckCircle2 },
          { title: 'En cours', value: stats.inProgressTasks, change: 'Tâches', changeType: 'neutral' as const, icon: Clock },
        ];
      case 'chef_projet':
        return [
          { title: 'Mes projets', value: stats.projectsCount, change: 'Assignés', changeType: 'neutral' as const, icon: FolderKanban },
          { title: 'Équipe', value: stats.membersCount, change: 'Membres', changeType: 'positive' as const, icon: Users },
          { title: 'Tâches terminées', value: stats.completedTasks, change: 'Cette période', changeType: 'positive' as const, icon: CheckCircle2 },
          { title: 'En cours', value: stats.inProgressTasks, change: 'À suivre', changeType: 'neutral' as const, icon: TrendingUp },
        ];
      case 'developpeur':
        return [
          { title: 'Mes tâches', value: stats.totalTasks, change: 'Assignées', changeType: 'neutral' as const, icon: CheckCircle2 },
          { title: 'En cours', value: stats.inProgressTasks, change: 'Actives', changeType: 'neutral' as const, icon: Clock },
          { title: 'Terminées', value: stats.completedTasks, change: 'Complétées', changeType: 'positive' as const, icon: TrendingUp },
          { title: 'Projets', value: stats.projectsCount, change: 'Actifs', changeType: 'positive' as const, icon: BarChart3 },
        ];
      default:
        return [
          { title: 'Projets visibles', value: stats.projectsCount, change: 'Lecture seule', changeType: 'neutral' as const, icon: Eye },
          { title: 'Tâches totales', value: stats.totalTasks, change: 'Toutes', changeType: 'neutral' as const, icon: CheckCircle2 },
          { title: 'Membres', value: stats.membersCount, change: 'Équipe', changeType: 'neutral' as const, icon: Users },
          { title: 'Terminées', value: stats.completedTasks, change: 'Complétées', changeType: 'neutral' as const, icon: TrendingUp },
        ];
    }
  };

  if (userLoading || workspaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayStats = getStatsForRole();

  return (
    <DashboardLayout 
      title="Tableau de bord" 
      subtitle={`Bienvenue, ${user?.name || 'Utilisateur'}! Voici un aperçu de vos projets.`}
    >
      {/* Role Badge */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant="outline" className="gap-2 py-1.5 px-3">
          <Shield className="w-4 h-4" />
          {roleLabels[user?.role || 'developpeur']}
        </Badge>
        {currentWorkspace && (
          <Badge variant="secondary" className="gap-2 py-1.5 px-3">
            <FolderKanban className="w-4 h-4" />
            {currentWorkspace.name}
          </Badge>
        )}
        {user?.role === 'admin' && (
          <Link to="/settings">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Administration
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displayStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            iconColor={index === 0 ? "gradient-primary" : index === 1 ? "bg-status-progress" : index === 2 ? "bg-accent" : "bg-status-done"}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {user?.role === 'observateur' ? 'Tâches récentes (lecture seule)' : 'Tâches récentes'}
            </h2>
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                Voir tout
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune tâche pour le moment</p>
              <Link to="/projects">
                <Button variant="outline" size="sm" className="mt-4">
                  Créer une tâche
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard 
                  key={task.id}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  dueDate={task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : undefined}
                  assignees={[]}
                  comments={0}
                />
              ))}
            </div>
            </div>
          )}
        </div>

        {/* Team & Quick Actions */}
        <div className="space-y-6">
          {/* Team Members */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Équipe</h2>
              <Link to="/team">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun membre
              </p>
            ) : (
              <div className="space-y-4">
                {members.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(member.profile?.full_name || member.profile?.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card bg-status-done" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {member.profile?.full_name || member.profile?.email || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions - filtered by permissions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/projects">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs">Projets</span>
                </Button>
              </Link>
              <Link to="/calendar">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs">Calendrier</span>
                </Button>
              </Link>
              {permissions.canManageTeam && (
                <Link to="/team">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                    <Users className="w-5 h-5" />
                    <span className="text-xs">Équipe</span>
                  </Button>
                </Link>
              )}
              {permissions.canViewAnalytics && (
                <Link to="/analytics">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xs">Rapports</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
