import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, X, Zap, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Gratuit',
    description: 'Parfait pour démarrer',
    price: '0',
    period: 'pour toujours',
    icon: Zap,
    features: [
      { name: 'Jusqu\'à 5 projets', included: true },
      { name: '3 membres d\'équipe', included: true },
      { name: 'Tableaux Kanban basiques', included: true },
      { name: 'Stockage 500 MB', included: true },
      { name: 'Support communautaire', included: true },
      { name: 'Automatisations', included: false },
      { name: 'Analytiques avancés', included: false },
      { name: 'Intégrations tierces', included: false },
    ],
    cta: 'Commencer gratuitement',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Pour les équipes en croissance',
    price: '12',
    period: 'par utilisateur/mois',
    icon: Users,
    features: [
      { name: 'Projets illimités', included: true },
      { name: 'Membres illimités', included: true },
      { name: 'Tableaux Kanban avancés', included: true },
      { name: 'Stockage 50 GB', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'Automatisations', included: true },
      { name: 'Analytiques avancés', included: true },
      { name: 'Intégrations tierces', included: true },
    ],
    cta: 'Essai gratuit 14 jours',
    variant: 'gradient' as const,
    popular: true,
  },
  {
    name: 'Entreprise',
    description: 'Pour les grandes organisations',
    price: 'Sur mesure',
    period: 'contactez-nous',
    icon: Building2,
    features: [
      { name: 'Tout du plan Pro', included: true },
      { name: 'SSO entreprise', included: true },
      { name: 'Stockage illimité', included: true },
      { name: 'SLA garanti 99.9%', included: true },
      { name: 'Account manager dédié', included: true },
      { name: 'Formation personnalisée', included: true },
      { name: 'API avancée', included: true },
      { name: 'Audit et conformité', included: true },
    ],
    cta: 'Contacter les ventes',
    variant: 'outline' as const,
    popular: false,
  },
];

const faqs = [
  {
    question: 'Puis-je changer de plan à tout moment?',
    answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.',
  },
  {
    question: 'Y a-t-il un engagement minimum?',
    answer: 'Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment.',
  },
  {
    question: 'Quels moyens de paiement acceptez-vous?',
    answer: 'Nous acceptons les cartes de crédit (Visa, Mastercard, Amex), PayPal, et les virements bancaires pour les plans Entreprise.',
  },
  {
    question: 'Offrez-vous des réductions pour les ONG?',
    answer: 'Oui, nous offrons 50% de réduction pour les organisations à but non lucratif. Contactez-nous pour en savoir plus.',
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Des tarifs <span className="gradient-text">simples et transparents</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos besoins. Commencez gratuitement, évoluez quand vous êtes prêt.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative rounded-2xl p-8 transition-all duration-300",
                    plan.popular 
                      ? "bg-card border-2 border-primary shadow-elevated scale-105" 
                      : "bg-card border border-border hover:border-primary/50"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full text-sm font-medium gradient-primary text-primary-foreground">
                        Le plus populaire
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <plan.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>

                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      {plan.price !== 'Sur mesure' && <span className="text-lg">€</span>}
                      <span className="text-5xl font-bold">{plan.price}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">{plan.period}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-status-done flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm",
                          !feature.included && "text-muted-foreground"
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/register" className="block">
                    <Button variant={plan.variant} className="w-full" size="lg">
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Questions fréquentes</h2>
              <p className="text-muted-foreground">Tout ce que vous devez savoir sur nos tarifs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card rounded-xl p-6 border border-border">
                  <h4 className="font-semibold mb-2">{faq.question}</h4>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Vous avez des questions?</h2>
            <p className="text-muted-foreground mb-8">
              Notre équipe est là pour vous aider à choisir le plan idéal pour votre équipe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="gradient" size="lg">
                  Démarrer l'essai gratuit
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">
                  Contacter les ventes
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
