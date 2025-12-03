import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle2, 
  Clock,
  Target,
  Calendar,
  Download
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
  Cell
} from 'recharts';

const taskCompletionData = [
  { name: 'Lun', completed: 12, created: 8 },
  { name: 'Mar', completed: 19, created: 15 },
  { name: 'Mer', completed: 15, created: 12 },
  { name: 'Jeu', completed: 22, created: 18 },
  { name: 'Ven', completed: 25, created: 20 },
  { name: 'Sam', completed: 8, created: 5 },
  { name: 'Dim', completed: 5, created: 3 },
];

const projectProgressData = [
  { name: 'Site Web', progress: 75 },
  { name: 'App Mobile', progress: 45 },
  { name: 'Marketing', progress: 90 },
  { name: 'Design System', progress: 60 },
  { name: 'API', progress: 30 },
];

const taskDistribution = [
  { name: 'À faire', value: 25, color: 'hsl(var(--muted-foreground))' },
  { name: 'En cours', value: 35, color: 'hsl(var(--status-progress))' },
  { name: 'En revue', value: 15, color: 'hsl(var(--status-review))' },
  { name: 'Terminé', value: 25, color: 'hsl(var(--status-done))' },
];

const Analytics = () => {
  return (
    <DashboardLayout title="Analytiques" subtitle="Statistiques et performances de l'équipe">
      {/* Time Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-secondary rounded-lg p-1">
          <Button variant="secondary" size="sm">7 jours</Button>
          <Button variant="ghost" size="sm">30 jours</Button>
          <Button variant="ghost" size="sm">90 jours</Button>
          <Button variant="ghost" size="sm">Année</Button>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Tâches terminées"
          value={106}
          change="+23% vs semaine dernière"
          changeType="positive"
          icon={CheckCircle2}
          iconColor="gradient-primary"
        />
        <StatsCard
          title="Temps moyen"
          value="2.4j"
          change="-12% amélioration"
          changeType="positive"
          icon={Clock}
          iconColor="bg-accent"
        />
        <StatsCard
          title="Taux de complétion"
          value="94%"
          change="+5% vs objectif"
          changeType="positive"
          icon={Target}
          iconColor="bg-status-done"
        />
        <StatsCard
          title="Membres actifs"
          value={12}
          change="Tous actifs cette semaine"
          changeType="neutral"
          icon={Users}
          iconColor="bg-status-progress"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Task Completion Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Activité des tâches</h3>
              <p className="text-sm text-muted-foreground">Tâches créées vs terminées</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Terminées</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-muted-foreground">Créées</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={taskCompletionData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-muted-foreground" fontSize={12} />
              <YAxis className="text-muted-foreground" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
              />
              <Area 
                type="monotone" 
                dataKey="created" 
                stroke="hsl(var(--accent))" 
                fillOpacity={1} 
                fill="url(#colorCreated)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="mb-6">
            <h3 className="font-semibold">Distribution des tâches</h3>
            <p className="text-sm text-muted-foreground">Par statut</p>
          </div>
          <div className="flex items-center justify-center">
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
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {taskDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="mb-6">
          <h3 className="font-semibold">Progression des projets</h3>
          <p className="text-sm text-muted-foreground">Avancement global de chaque projet</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectProgressData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} className="text-muted-foreground" fontSize={12} />
            <YAxis type="category" dataKey="name" className="text-muted-foreground" fontSize={12} width={100} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value}%`, 'Progression']}
            />
            <Bar 
              dataKey="progress" 
              fill="hsl(var(--primary))" 
              radius={[0, 4, 4, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
