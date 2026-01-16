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
  Moon,
  Loader2,
  Mail,
  CheckCircle2,
  MessageCircle,
  AtSign,
  Clock
} from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, supabaseUser } = useUser();
  const { currentWorkspace } = useWorkspace();
  
  // Profile form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    tasksAssigned: true,
    comments: true,
    mentions: true,
    deadlineReminders: true,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!supabaseUser) return;

      setIsLoadingProfile(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (error) throw error;

        if (profile) {
          setFullName(profile.full_name || '');
          setEmail(profile.email || '');
          setBio(profile.bio || '');
          setPhone(profile.phone || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [supabaseUser]);

  const handleSaveProfile = async () => {
    if (!supabaseUser) {
      toast.error('Utilisateur non authentifié');
      return;
    }

    if (!fullName.trim()) {
      toast.error('Le nom complet est requis');
      return;
    }

    setIsSavingProfile(true);
    try {
      // Only update the fields that are allowed to be modified
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone?.trim() || null,
          bio: bio?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', supabaseUser.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Profil mis à jour avec succès!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      if (error.message?.includes('permission')) {
        toast.error('Vous n\'avez pas la permission de modifier ce profil');
      } else if (error.message?.includes('Duplicate')) {
        toast.error('Ces informations existent déjà');
      } else {
        toast.error('Erreur lors de la sauvegarde du profil');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Mot de passe mis à jour avec succès!');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoadingProfile) {
    return (
      <DashboardLayout title="Paramètres" subtitle="Gérez vos préférences et votre compte">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const userInitials = fullName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

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

                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>

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

                    <Label htmlFor="fullName">Nom complet *</Label>
                    <Input 
                      id="fullName" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      disabled
                      className="bg-muted"
                      placeholder="jean@taskflow.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Input 
                      id="role" 
                      value={user?.role || ''}
                      disabled
                      className="bg-muted"
                    />

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

                      value={bio}
                      onChange={(e) => setBio(e.target.value)}

                      defaultValue="Chef de projet passionné par l'innovation et le travail d'équipe."

                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFullName(user?.name || '');
                    setBio('');
                    setPhone('');
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  variant="gradient"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>

                <Button variant="outline">Annuler</Button>
                <Button variant="gradient">Enregistrer</Button>

              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Préférences de notifications</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Gérez comment et quand vous souhaitez recevoir des notifications.
                </p>

                {/* Notification preferences */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Notifications par email</p>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les mises à jour par email
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={() => toggleNotification('email')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Notifications push</p>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les notifications navigateur
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.push}
                      onCheckedChange={() => toggleNotification('push')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Tâches assignées</p>
                        <p className="text-sm text-muted-foreground">
                          Notifier quand une tâche vous est assignée
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.tasksAssigned}
                      onCheckedChange={() => toggleNotification('tasksAssigned')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Commentaires</p>
                        <p className="text-sm text-muted-foreground">
                          Notifier quand quelqu'un commente vos tâches
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.comments}
                      onCheckedChange={() => toggleNotification('comments')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition">
                    <div className="flex items-center gap-3">
                      <AtSign className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Mentions</p>
                        <p className="text-sm text-muted-foreground">
                          Notifier quand quelqu'un vous mentionne
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.mentions}
                      onCheckedChange={() => toggleNotification('mentions')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Rappels d'échéance</p>
                        <p className="text-sm text-muted-foreground">
                          Rappels pour les tâches approchant leur date limite
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.deadlineReminders}
                      onCheckedChange={() => toggleNotification('deadlineReminders')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={() => toast.info('Préférences réinitialisées')}
                >
                  Réinitialiser
                </Button>
                <Button 
                  variant="gradient"
                  onClick={() => toast.success('Préférences enregistrées')}
                >
                  Enregistrer les préférences
                </Button>
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

                    <Input 
                      id="currentPassword" 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Entrez votre nouveau mot de passe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                  </div>
                  <Button 
                    variant="gradient"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="w-full"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      'Mettre à jour'
                    )}
                  </Button>

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

                  <Switch disabled />

                  <Switch />

                </div>
              </div>

              {/* Sessions */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-4">Sessions actives</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>

                      <p className="font-medium text-sm">Navigateur actuel</p>
                      <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('fr-FR')} • Session en cours</p>
                    </div>
                    <span className="text-xs text-status-done font-medium">Actif</span>
                  </div>
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
