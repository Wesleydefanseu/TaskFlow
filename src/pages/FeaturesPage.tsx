import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { 
  LayoutGrid, 
  Users, 
  BarChart3, 
  Calendar, 
  Zap, 
  Shield,
  MessageSquare,
  Clock,
  CheckCircle2,
  Layers,
  Globe,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: LayoutGrid,
    title: 'Tableaux Kanban',
    description: 'Visualisez votre workflow avec des tableaux personnalisables et des cartes glisser-déposer. Organisez vos tâches par statut, priorité ou équipe.',
    benefits: ['Drag & drop intuitif', 'Colonnes personnalisables', 'Filtres avancés'],
  },
  {
    icon: Users,
    title: 'Collaboration d\'équipe',
    description: 'Travaillez ensemble en temps réel avec des commentaires, mentions et partage de fichiers. Attribuez des tâches et suivez la progression.',
    benefits: ['Mentions @utilisateur', 'Partage de fichiers', 'Historique des modifications'],
  },
  {
    icon: BarChart3,
    title: 'Analytiques détaillés',
    description: 'Suivez la progression avec des graphiques et métriques de performance. Identifiez les goulots d\'étranglement et optimisez vos processus.',
    benefits: ['Tableaux de bord visuels', 'Rapports exportables', 'Métriques temps réel'],
  },
  {
    icon: Calendar,
    title: 'Vue Calendrier',
    description: 'Planifiez et visualisez vos tâches avec une vue calendrier intuitive. Gérez les échéances et évitez les conflits.',
    benefits: ['Vue jour/semaine/mois', 'Synchronisation agenda', 'Rappels automatiques'],
  },
  {
    icon: Zap,
    title: 'Automatisations',
    description: 'Automatisez les tâches répétitives et gagnez du temps précieux. Créez des workflows personnalisés sans code.',
    benefits: ['Règles conditionnelles', 'Actions automatiques', 'Intégrations tierces'],
  },
  {
    icon: Shield,
    title: 'Sécurité avancée',
    description: 'Vos données sont protégées avec un chiffrement de bout en bout. Contrôle d\'accès granulaire par rôle.',
    benefits: ['Chiffrement AES-256', 'SSO entreprise', 'Audit trail complet'],
  },
  {
    icon: MessageSquare,
    title: 'Chat intégré',
    description: 'Communiquez directement avec votre équipe sans changer d\'application. Discussions en temps réel par projet.',
    benefits: ['Messages instantanés', 'Canaux par projet', 'Partage de médias'],
  },
  {
    icon: Clock,
    title: 'Suivi du temps',
    description: 'Enregistrez le temps passé sur chaque tâche et optimisez votre productivité. Rapports détaillés par projet.',
    benefits: ['Timer intégré', 'Rapports de temps', 'Facturation simplifiée'],
  },
];

const additionalFeatures = [
  { icon: CheckCircle2, title: 'Listes de tâches', description: 'Créez et gérez des listes imbriquées' },
  { icon: Layers, title: 'Templates', description: 'Réutilisez vos configurations préférées' },
  { icon: Globe, title: 'Multi-langue', description: 'Interface disponible en plusieurs langues' },
  { icon: Smartphone, title: 'Mobile friendly', description: 'Accessible sur tous vos appareils' },
];

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Des fonctionnalités <span className="gradient-text">puissantes</span> pour votre équipe
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Découvrez tous les outils dont vous avez besoin pour gérer vos projets efficacement et collaborer avec votre équipe.
              </p>
              <Link to="/register">
                <Button variant="gradient" size="lg">
                  Commencer gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Features Grid */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elevated"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Et bien plus encore...</h2>
              <p className="text-muted-foreground">Des fonctionnalités supplémentaires pour améliorer votre productivité</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {additionalFeatures.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 gradient-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Prêt à transformer votre façon de travailler?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Rejoignez des milliers d'équipes qui utilisent TaskFlow pour gérer leurs projets.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                Essai gratuit de 14 jours
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
