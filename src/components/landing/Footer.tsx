import { Link } from 'react-router-dom';
import { LayoutGrid, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="gradient-text">TaskFlow</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              La plateforme de gestion de projet moderne pour les équipes ambitieuses.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Produit</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Fonctionnalités</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Tarifs</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Intégrations</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Ressources</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Documentation</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">API</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Blog</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Tutoriels</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">À propos</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Carrières</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Contact</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Partenaires</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 TaskFlow. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Confidentialité
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
