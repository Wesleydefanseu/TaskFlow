import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
  Upload,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout title="Paramètres" subtitle="Gérez vos préférences et votre compte">
      <div className="max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Apparence</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Facturation</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
                
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" />
                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Changer la photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG ou GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" defaultValue="Jean" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" defaultValue="Dupont" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="jean@taskflow.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" defaultValue="+33 6 12 34 56 78" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-24 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Quelques mots sur vous..."
                      defaultValue="Chef de projet passionné par l'innovation et le travail d'équipe."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline">Annuler</Button>
                <Button variant="gradient">Enregistrer</Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Préférences de notification</h3>

              <div className="space-y-4">
                {[
                  { title: 'Notifications par email', description: 'Recevoir des emails pour les mises à jour importantes' },
                  { title: 'Notifications push', description: 'Recevoir des notifications dans le navigateur' },
                  { title: 'Tâches assignées', description: 'Être notifié quand une tâche vous est assignée' },
                  { title: 'Commentaires', description: 'Être notifié des nouveaux commentaires' },
                  { title: 'Mentions', description: 'Être notifié quand quelqu\'un vous mentionne' },
                  { title: 'Rappels de deadline', description: 'Recevoir des rappels avant les échéances' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={index < 4} />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Apparence</h3>

              {/* Theme Selection */}
              <div>
                <Label className="mb-4 block">Thème</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                      theme === 'light' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <Sun className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Clair</p>
                      <p className="text-sm text-muted-foreground">Interface lumineuse</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                      theme === 'dark' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <Moon className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Sombre</p>
                      <p className="text-sm text-muted-foreground">Interface sombre</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Language */}
              <div>
                <Label className="mb-4 block">Langue</Label>
                <div className="flex items-center gap-4">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <select className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Sécurité</h3>

              {/* Change Password */}
              <div className="space-y-4">
                <h4 className="font-medium">Changer le mot de passe</h4>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button variant="gradient">Mettre à jour</Button>
                </div>
              </div>

              {/* Two Factor */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Authentification à deux facteurs</h4>
                    <p className="text-sm text-muted-foreground">
                      Ajoutez une couche de sécurité supplémentaire
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              {/* Sessions */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-4">Sessions actives</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Chrome sur MacOS</p>
                      <p className="text-xs text-muted-foreground">Paris, France • Session actuelle</p>
                    </div>
                    <span className="text-xs text-status-done font-medium">Actif</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Safari sur iPhone</p>
                      <p className="text-xs text-muted-foreground">Paris, France • Il y a 2 heures</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Révoquer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Facturation</h3>

              {/* Current Plan */}
              <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Plan Pro</h4>
                  <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">Actif</span>
                </div>
                <p className="text-2xl font-bold">29€ <span className="text-sm font-normal opacity-80">/mois</span></p>
                <p className="text-sm opacity-80 mt-1">Prochain renouvellement le 15 janvier 2025</p>
              </div>

              {/* Payment Method */}
              <div>
                <h4 className="font-medium mb-4">Méthode de paiement</h4>
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expire 12/26</p>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
              </div>

              {/* Billing History */}
              <div>
                <h4 className="font-medium mb-4">Historique de facturation</h4>
                <div className="space-y-2">
                  {[
                    { date: '15 Déc 2024', amount: '29€', status: 'Payé' },
                    { date: '15 Nov 2024', amount: '29€', status: 'Payé' },
                    { date: '15 Oct 2024', amount: '29€', status: 'Payé' },
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{invoice.date}</p>
                        <p className="text-sm text-muted-foreground">Plan Pro mensuel</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <p className="text-xs text-status-done">{invoice.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
