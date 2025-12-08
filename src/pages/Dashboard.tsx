import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { useUser, usePermissions, roleLabels } from '@/contexts/UserContext';
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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const recentTasks = [
  {
    id: '1',
    title: 'Finaliser le design de la landing page',
    description: 'Compléter les maquettes pour mobile et desktop',
    priority: 'high' as const,
    dueDate: 'Aujourd\'hui',
    assignees: [
      { name: 'Marie-Claire Fotso', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100' },
      { name: 'Patrick Nganou', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    ],
    comments: 8,
    attachments: 3,
    labels: [{ name: 'Design', color: 'bg-primary/20 text-primary' }],
  },
  {
    id: '2',
    title: 'Intégration API de paiement',
    description: 'Connecter Mobile Money pour les abonnements',
    priority: 'urgent' as const,
    dueDate: 'Demain',
    assignees: [
      { name: 'Emmanuel Ngono', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    ],
    comments: 5,
    attachments: 1,
    labels: [{ name: 'Backend', color: 'bg-accent/20 text-accent' }],
  },
  {
    id: '3',
    title: 'Tests unitaires composants',
    priority: 'medium' as const,
    dueDate: 'Dans 3 jours',
    assignees: [
      { name: 'Sandrine Tchamba', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    ],
    comments: 2,
  },
];

const teamMembers = [
  { name: 'Jean-Paul Mbarga', role: 'Chef de projet', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', status: 'online' },
  { name: 'Marie-Claire Fotso', role: 'Développeur Senior', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100', status: 'online' },
  { name: 'Patrick Nganou', role: 'Designer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', status: 'away' },
  { name: 'Sandrine Tchamba', role: 'QA', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', status: 'offline' },
];

// Admin specific stats
const adminStats = [
  { title: 'Utilisateurs actifs', value: 156, change: '+23 ce mois', changeType: 'positive' as const, icon: Users },
  { title: 'Projets actifs', value: 24, change: '+3 cette semaine', changeType: 'positive' as const, icon: FolderKanban },
  { title: 'Tâches terminées', value: 892, change: '+12% vs mois dernier', changeType: 'positive' as const, icon: CheckCircle2 },
  { title: 'Temps moyen', value: '2.3j', change: '-18% amélioration', changeType: 'positive' as const, icon: Clock },
];

// Chef de projet specific stats
const chefProjetStats = [
  { title: 'Mes projets', value: 8, change: '3 en cours', changeType: 'neutral' as const, icon: FolderKanban },
  { title: 'Équipe', value: 12, change: '10 actifs', changeType: 'positive' as const, icon: Users },
  { title: 'Tâches en retard', value: 3, change: 'À traiter', changeType: 'negative' as const, icon: Clock },
  { title: 'Progression', value: '78%', change: '+5% cette semaine', changeType: 'positive' as const, icon: TrendingUp },
];

// Développeur specific stats
const developpeurStats = [
  { title: 'Mes tâches', value: 15, change: '5 urgentes', changeType: 'negative' as const, icon: CheckCircle2 },
  { title: 'En cours', value: 4, change: '2 en revue', changeType: 'neutral' as const, icon: Clock },
  { title: 'Terminées', value: 128, change: '+8 cette semaine', changeType: 'positive' as const, icon: TrendingUp },
  { title: 'Sprint actuel', value: '67%', change: 'En bonne voie', changeType: 'positive' as const, icon: BarChart3 },
];

// Observateur specific stats
const observateurStats = [
  { title: 'Projets visibles', value: 12, change: 'Lecture seule', changeType: 'neutral' as const, icon: Eye },
  { title: 'Tâches totales', value: 234, change: '45 en cours', changeType: 'neutral' as const, icon: CheckCircle2 },
  { title: 'Membres équipe', value: 18, change: '15 actifs', changeType: 'neutral' as const, icon: Users },
  { title: 'Progression globale', value: '72%', change: 'Tous projets', changeType: 'neutral' as const, icon: TrendingUp },
];

const getStatsForRole = (role: string) => {
  switch (role) {
    case 'admin': return adminStats;
    case 'chef_projet': return chefProjetStats;
    case 'developpeur': return developpeurStats;
    case 'observateur': return observateurStats;
    default: return developpeurStats;
  }
};

const Dashboard = () => {
  const { user } = useUser();
  const permissions = usePermissions();
  const stats = getStatsForRole(user?.role || 'developpeur');

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
        {stats.map((stat, index) => (
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
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </div>
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
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                      member.status === 'online' ? 'bg-status-done' :
                      member.status === 'away' ? 'bg-status-progress' : 'bg-muted'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
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
