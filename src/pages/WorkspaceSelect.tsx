import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUser } from '@/contexts/UserContext';
import { 
  Building2, 
  Plus, 
  Users, 
  FolderKanban, 
  ArrowRight,
  Link as LinkIcon,
  LayoutGrid,
  Loader2,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const WorkspaceSelect = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace, joinWorkspaceByCode, members, projects, isLoading } = useWorkspace();
  const { user, isAuthenticated, isLoading: userLoading, logout } = useUser();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  
  // Create workspace form
  const [wsName, setWsName] = useState('');
  const [wsDescription, setWsDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Join workspace form
  const [inviteCode, setInviteCode] = useState(code || '');

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, userLoading, navigate]);

  // Auto-join if code is in URL
  useEffect(() => {
    if (code && isAuthenticated) {
      handleJoinWorkspace(code);
    }
  }, [code, isAuthenticated]);

  const handleSelectWorkspace = (workspace: typeof workspaces[0]) => {
    setCurrentWorkspace(workspace);
    navigate('/dashboard');
  };

  const handleCreateWorkspace = async () => {
    if (!wsName.trim()) {
      toast.error('Le nom de l\'espace de travail est requis');
      return;
    }

    setIsSubmitting(true);
    try {
      const newWorkspace = await createWorkspace(wsName, wsDescription);

      if (newWorkspace) {
        toast.success('Espace de travail créé avec succès!');
        setCreateDialogOpen(false);
        setWsName('');
        setWsDescription('');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinWorkspace = async (codeToJoin?: string) => {
    const joinCode = codeToJoin || inviteCode;
    if (!joinCode.trim()) {
      toast.error('Le code d\'invitation est requis');
      return;
    }

    setIsSubmitting(true);
    try {
      const workspace = await joinWorkspaceByCode(joinCode);

      if (workspace) {
        toast.success(`Vous avez rejoint ${workspace.name}!`);
        setJoinDialogOpen(false);
        setInviteCode('');
        navigate('/dashboard');
      } else {
        toast.error('Code d\'invitation invalide');
      }
    } catch (error) {
      toast.error('Erreur lors de la jonction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
    toast.success('Déconnexion réussie');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
        <ThemeToggle />
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-6">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="gradient-text">TaskFlow</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Vos espaces de travail</h1>
          <p className="text-muted-foreground">
            Sélectionnez un espace de travail ou créez-en un nouveau
          </p>
          {user && (
            <p className="text-sm text-muted-foreground mt-2">
              Connecté en tant que <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        {workspaces.length === 0 ? (
          <Card className="text-center py-12 mb-8">
            <CardContent>
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun espace de travail</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre premier espace de travail ou rejoignez-en un existant
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {workspaces.map((workspace) => (
              <Card 
                key={workspace.id} 
                className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
                  currentWorkspace?.id === workspace.id ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => handleSelectWorkspace(workspace)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">{workspace.name}</CardTitle>
                  <CardDescription>{workspace.description || 'Aucune description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Espace de travail</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4" />
                      <span>Actif</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                <Plus className="w-5 h-5 mr-2" />
                Créer un espace de travail
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouvel espace de travail</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="ws-name">Nom de l'entreprise</Label>
                  <Input
                    id="ws-name"
                    placeholder="Ma Société SARL"
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ws-desc">Description</Label>
                  <Input
                    id="ws-desc"
                    placeholder="Description de votre entreprise..."
                    value={wsDescription}
                    onChange={(e) => setWsDescription(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCreateWorkspace} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Créer l'espace de travail
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <LinkIcon className="w-5 h-5 mr-2" />
                Rejoindre avec un code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rejoindre un espace de travail</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Code d'invitation</Label>
                  <Input
                    id="invite-code"
                    placeholder="Ex: ABC123"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                </div>
                <Button 
                  onClick={() => handleJoinWorkspace()} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Rejoindre
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelect;
