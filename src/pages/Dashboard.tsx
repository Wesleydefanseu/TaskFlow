import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp,
  ArrowRight,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

const recentTasks = [
  {
    id: '1',
    title: 'Finaliser le design de la landing page',
    description: 'Compléter les maquettes pour mobile et desktop',
    priority: 'high' as const,
    dueDate: 'Aujourd\'hui',
    assignees: [
      { name: 'Alice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
      { name: 'Bob', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    ],
    comments: 8,
    attachments: 3,
    labels: [{ name: 'Design', color: 'bg-primary/20 text-primary' }],
  },
  {
    id: '2',
    title: 'Intégration API de paiement',
    description: 'Connecter Stripe pour les abonnements',
    priority: 'urgent' as const,
    dueDate: 'Demain',
    assignees: [
      { name: 'Charlie', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
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
      { name: 'Diana' },
    ],
    comments: 2,
  },
];

const teamMembers = [
  { name: 'Alice Martin', role: 'Designer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', status: 'online' },
  { name: 'Bob Dupont', role: 'Développeur', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', status: 'online' },
  { name: 'Charlie Petit', role: 'Backend', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', status: 'away' },
  { name: 'Diana Moreau', role: 'QA', status: 'offline' },
];

const Dashboard = () => {
  return (
    <DashboardLayout title="Tableau de bord" subtitle="Bienvenue, Jean! Voici un aperçu de vos projets.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Tâches terminées"
          value={128}
          change="+12% cette semaine"
          changeType="positive"
          icon={CheckCircle2}
          iconColor="gradient-primary"
        />
        <StatsCard
          title="En cours"
          value={24}
          change="8 urgentes"
          changeType="negative"
          icon={Clock}
          iconColor="bg-status-progress"
        />
        <StatsCard
          title="Membres actifs"
          value={12}
          change="3 en ligne"
          changeType="neutral"
          icon={Users}
          iconColor="bg-accent"
        />
        <StatsCard
          title="Productivité"
          value="94%"
          change="+5% vs mois dernier"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-status-done"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Tâches récentes</h2>
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

          {/* Quick Actions */}
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
              <Link to="/team">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Users className="w-5 h-5" />
                  <span className="text-xs">Équipe</span>
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xs">Rapports</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
