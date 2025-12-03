import { 
  LayoutGrid, 
  Users, 
  BarChart3, 
  Calendar, 
  Zap, 
  Shield,
  MessageSquare,
  Clock
} from 'lucide-react';

const features = [
  {
    icon: LayoutGrid,
    title: 'Tableaux Kanban',
    description: 'Visualisez votre workflow avec des tableaux personnalisables et des cartes glisser-déposer.',
  },
  {
    icon: Users,
    title: 'Collaboration d\'équipe',
    description: 'Travaillez ensemble en temps réel avec des commentaires, mentions et partage de fichiers.',
  },
  {
    icon: BarChart3,
    title: 'Analytiques détaillés',
    description: 'Suivez la progression avec des graphiques et métriques de performance.',
  },
  {
    icon: Calendar,
    title: 'Vue Calendrier',
    description: 'Planifiez et visualisez vos tâches avec une vue calendrier intuitive.',
  },
  {
    icon: Zap,
    title: 'Automatisations',
    description: 'Automatisez les tâches répétitives et gagnez du temps précieux.',
  },
  {
    icon: Shield,
    title: 'Sécurité avancée',
    description: 'Vos données sont protégées avec un chiffrement de bout en bout.',
  },
  {
    icon: MessageSquare,
    title: 'Chat intégré',
    description: 'Communiquez directement avec votre équipe sans changer d\'application.',
  },
  {
    icon: Clock,
    title: 'Suivi du temps',
    description: 'Enregistrez le temps passé sur chaque tâche et optimisez votre productivité.',
  },
];

export function Features() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des fonctionnalités puissantes pour gérer vos projets de A à Z
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elevated animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
