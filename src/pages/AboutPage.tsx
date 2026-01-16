import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Target, Heart, Lightbulb, Users, MapPin, Mail, Phone } from 'lucide-react';

const team = [
  {
    name: 'Mamadou Diop',
    role: 'CEO & Co-fondateur',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Passionné par la productivité et le leadership depuis 15 ans.',
  },
  {
    name: 'Aïssatou Sow',
    role: 'CTO & Co-fondatrice',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200',
    bio: 'Ingénieure logiciel avec expertise en systèmes distribués.',
  },
  {
    name: 'Ibrahima Ndiaye',
    role: 'Head of Product',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    bio: 'Designer de produits axé sur l\'expérience utilisateur.',
  },
  {
    name: 'Fatoumata Coulibaly',
    role: 'Head of Marketing',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Experte en growth et stratégie de marque.',
  },
  {
    name: 'Oumar Traoré',
    role: 'Lead Developer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    bio: 'Développeur full-stack spécialisé React et Node.js.',
  },
  {
    name: 'Mariama Bah',
    role: 'Customer Success',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    bio: 'Dévouée à la satisfaction et au succès des clients.',
  },
];

const values = [
  {
    icon: Target,
    title: 'Focus',
    description: 'Nous nous concentrons sur ce qui compte vraiment pour nos utilisateurs.',
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'Nous aimons ce que nous faisons et cela se reflète dans notre produit.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Nous cherchons constamment à améliorer et innover.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Nous croyons en la force du travail d\'équipe.',
  },
];

const stats = [
  { value: '50K+', label: 'Utilisateurs actifs' },
  { value: '120+', label: 'Pays' },
  { value: '5M+', label: 'Tâches créées' },
  { value: '99.9%', label: 'Uptime' },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 gradient-accent opacity-5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Notre mission: <span className="gradient-text">simplifier le travail d'équipe</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Depuis 2020, nous aidons des milliers d'équipes à mieux collaborer et à atteindre leurs objectifs. 
                TaskFlow est né de la conviction que la gestion de projet devrait être simple, intuitive et agréable.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Nos valeurs</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ces principes guident chacune de nos décisions et façonnent notre culture d'entreprise.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4">
                    <value.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Notre équipe</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Une équipe passionnée basée à Dakar, avec des collaborateurs à travers l'Afrique.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <div key={index} className="bg-card rounded-2xl p-6 border border-border text-center hover:shadow-elevated transition-shadow">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-2xl">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-primary text-sm mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Contactez-nous</h2>
                <p className="text-muted-foreground">
                  Une question? Notre équipe est là pour vous aider.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-xl bg-secondary/30">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Adresse</h4>
                  <p className="text-muted-foreground text-sm">
                    Plateau, Dakar<br />Sénégal
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl bg-secondary/30">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-muted-foreground text-sm">
                    contact@taskflow.sn<br />support@taskflow.sn
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl bg-secondary/30">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Téléphone</h4>
                  <p className="text-muted-foreground text-sm">
                    +221 33 123 45 67<br />Lun-Ven, 9h-18h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 gradient-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Rejoignez l'aventure TaskFlow
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Nous recrutons! Consultez nos offres d'emploi et rejoignez une équipe dynamique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                  Commencer maintenant
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                Voir les offres
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
