import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Zap
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

const taskCompletionData = [
  { name: 'Lun', completed: 12, created: 8, velocity: 4 },
  { name: 'Mar', completed: 19, created: 15, velocity: 4 },
  { name: 'Mer', completed: 15, created: 12, velocity: 3 },
  { name: 'Jeu', completed: 22, created: 18, velocity: 4 },
  { name: 'Ven', completed: 25, created: 20, velocity: 5 },
  { name: 'Sam', completed: 8, created: 5, velocity: 3 },
  { name: 'Dim', completed: 5, created: 3, velocity: 2 },
];

const monthlyTrend = [
  { month: 'Jan', tasks: 120, hours: 480 },
  { month: 'Fév', tasks: 145, hours: 520 },
  { month: 'Mar', tasks: 132, hours: 490 },
  { month: 'Avr', tasks: 168, hours: 560 },
  { month: 'Mai', tasks: 189, hours: 620 },
  { month: 'Juin', tasks: 210, hours: 680 },
];

const projectProgressData = [
  { name: 'Site Web', progress: 75, budget: 85, onTime: 90 },
  { name: 'App Mobile', progress: 45, budget: 60, onTime: 40 },
  { name: 'Marketing', progress: 90, budget: 95, onTime: 100 },
  { name: 'Design System', progress: 60, budget: 70, onTime: 80 },
  { name: 'API', progress: 30, budget: 40, onTime: 50 },
];

const taskDistribution = [
  { name: 'À faire', value: 25, color: 'hsl(var(--muted-foreground))' },
  { name: 'En cours', value: 35, color: 'hsl(var(--status-progress))' },
  { name: 'En revue', value: 15, color: 'hsl(var(--status-review))' },
  { name: 'Terminé', value: 25, color: 'hsl(var(--status-done))' },
];

const teamPerformance = [
  { name: 'Marie-Claire', tasks: 45, score: 92, avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100' },
  { name: 'Jean-Paul', tasks: 38, score: 88, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { name: 'Sandrine', tasks: 42, score: 95, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { name: 'Emmanuel', tasks: 35, score: 85, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
  { name: 'Patrick', tasks: 28, score: 78, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
];

const radarData = [
  { subject: 'Vitesse', A: 85, fullMark: 100 },
  { subject: 'Qualité', A: 92, fullMark: 100 },
  { subject: 'Collaboration', A: 78, fullMark: 100 },
  { subject: 'Innovation', A: 65, fullMark: 100 },
  { subject: 'Efficacité', A: 88, fullMark: 100 },
  { subject: 'Communication', A: 72, fullMark: 100 },
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7days');

  return (
    <DashboardLayout title="Analytiques Avancés" subtitle="Statistiques et performances de l'équipe">
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
              <p className="text-3xl font-bold mt-1">1,284</p>
              <div className="flex items-center gap-1 mt-2 text-status-done">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+23%</span>
                <span className="text-xs text-muted-foreground ml-1">vs période précédente</span>
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
              <p className="text-sm text-muted-foreground">Temps moyen par tâche</p>
              <p className="text-3xl font-bold mt-1">2.4h</p>
              <div className="flex items-center gap-1 mt-2 text-status-done">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-sm font-medium">-12%</span>
                <span className="text-xs text-muted-foreground ml-1">amélioration</span>
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
              <p className="text-3xl font-bold mt-1">94%</p>
              <div className="flex items-center gap-1 mt-2 text-status-done">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+5%</span>
                <span className="text-xs text-muted-foreground ml-1">vs objectif</span>
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
              <p className="text-sm text-muted-foreground">Vélocité d'équipe</p>
              <p className="text-3xl font-bold mt-1">42</p>
              <div className="flex items-center gap-1 mt-2 text-status-progress">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">points/sprint</span>
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
            {/* Task Activity Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold">Activité des tâches</h3>
                  <p className="text-sm text-muted-foreground">Tâches créées vs terminées</p>
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
                  <Area type="monotone" dataKey="completed" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCompleted)" />
                  <Area type="monotone" dataKey="created" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorCreated)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Task Distribution */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold">Distribution des tâches</h3>
                <p className="text-sm text-muted-foreground">Par statut</p>
              </div>
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
                    <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold">Tendance mensuelle</h3>
              <p className="text-sm text-muted-foreground">Évolution sur les 6 derniers mois</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                <YAxis yAxisId="left" className="text-muted-foreground" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" className="text-muted-foreground" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Tâches" />
                <Line yAxisId="right" type="monotone" dataKey="hours" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} name="Heures" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Radar */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold">Performance globale</h3>
                <p className="text-sm text-muted-foreground">Indicateurs clés de l'équipe</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="subject" className="text-muted-foreground" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Équipe" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            {/* Team Leaderboard */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold">Classement de l'équipe</h3>
                <p className="text-sm text-muted-foreground">Top performers ce mois</p>
              </div>
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
                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.tasks} tâches terminées</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{member.score}</p>
                      <p className="text-xs text-muted-foreground">score</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold">Santé des projets</h3>
              <p className="text-sm text-muted-foreground">Progression, budget et respect des délais</p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={projectProgressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} className="text-muted-foreground" fontSize={12} />
                <YAxis type="category" dataKey="name" className="text-muted-foreground" fontSize={12} width={100} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Progression" />
                <Bar dataKey="budget" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Budget utilisé" />
                <Bar dataKey="onTime" fill="hsl(var(--status-done))" radius={[0, 4, 4, 0]} name="Dans les temps" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Analytics;
