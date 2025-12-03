import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export function Hero() {
  const features = [
    'Tableaux Kanban intuitifs',
    'Collaboration en temps réel',
    'Analytiques avancés',
  ];

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Nouveau: Intégrations IA disponibles</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            Gérez vos projets{' '}
            <span className="gradient-text">simplement</span>
            {' '}et{' '}
            <span className="gradient-text">efficacement</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            TaskFlow est la plateforme de gestion de projet nouvelle génération qui aide les équipes à collaborer, organiser et livrer des projets exceptionnels.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Démarrer gratuitement
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl">
                Voir la démo
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-sm text-muted-foreground mb-4">Adopté par plus de 10,000 équipes</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="text-2xl font-bold">Startup</div>
              <div className="text-2xl font-bold">TechCorp</div>
              <div className="text-2xl font-bold">DesignLab</div>
              <div className="text-2xl font-bold hidden sm:block">DevStudio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
