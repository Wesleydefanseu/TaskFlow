import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUser, UserRole, roleLabels } from '@/contexts/UserContext';
import { 
  Building2, 
  Plus, 
  Users, 
  FolderKanban, 
  ArrowRight,
  Link as LinkIcon,
  LayoutGrid 
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const industries = [
  'Technologie',
  'Finance',
  'Santé',
  'Éducation',
  'Commerce',
  'Industrie',
  'Services',
  'Autre',
];

const WorkspaceSelect = () => {
  const navigate = useNavigate();
  const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace, joinWorkspaceByCode } = useWorkspace();
  const { user, login } = useUser();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  
  // Create workspace form
  const [wsName, setWsName] = useState('');
  const [wsDescription, setWsDescription] = useState('');
  const [wsIndustry, setWsIndustry] = useState('Technologie');
  
  // Join workspace form
  const [inviteCode, setInviteCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinRole, setJoinRole] = useState<UserRole>('developpeur');

  const handleSelectWorkspace = (workspace: typeof workspaces[0]) => {
    setCurrentWorkspace(workspace);
    // Simulate login with first member if no user
    if (!user && workspace.members.length > 0) {
      const member = workspace.members[0];
      login(member.email, 'password', member.role);
    }
    navigate('/dashboard');
  };

  const handleCreateWorkspace = () => {
    if (!wsName.trim()) {
      toast.error('Le nom de l\'espace de travail est requis');
      return;
    }

    const newWorkspace = createWorkspace({
      name: wsName,
      description: wsDescription,
      industry: wsIndustry,
      ownerId: user?.id || 'owner-1',
    });

    toast.success('Espace de travail créé avec succès!');
    setCreateDialogOpen(false);
    setCurrentWorkspace(newWorkspace);
    setWsName('');
    setWsDescription('');
    navigate('/dashboard');
  };

  const handleJoinWorkspace = () => {
    if (!inviteCode.trim()) {
      toast.error('Le code d\'invitation est requis');
      return;
    }

    const workspace = joinWorkspaceByCode(inviteCode, {
      name: joinName || 'Nouveau membre',
      email: joinEmail || 'nouveau@exemple.com',
      role: joinRole,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      phone: '+237 690 000 000',
    });

    if (workspace) {
      toast.success(`Vous avez rejoint ${workspace.name}!`);
      setJoinDialogOpen(false);
      login(joinEmail, 'password', joinRole);
      setCurrentWorkspace(workspace);
      navigate('/dashboard');
    } else {
      toast.error('Code d\'invitation invalide');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 flex items-center gap-4">
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
        </div>

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
                <CardDescription>{workspace.description || workspace.industry}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{workspace.members.length} membres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4" />
                    <span>{workspace.projects.length} projets</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                <div className="space-y-2">
                  <Label htmlFor="ws-industry">Secteur d'activité</Label>
                  <Select value={wsIndustry} onValueChange={setWsIndustry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateWorkspace} className="w-full">
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
                <div className="space-y-2">
                  <Label htmlFor="join-name">Votre nom</Label>
                  <Input
                    id="join-name"
                    placeholder="Jean Dupont"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="join-email">Votre email</Label>
                  <Input
                    id="join-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={joinEmail}
                    onChange={(e) => setJoinEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="join-role">Votre rôle</Label>
                  <Select value={joinRole} onValueChange={(v: UserRole) => setJoinRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleJoinWorkspace} className="w-full">
                  Rejoindre
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Code de démo pour rejoindre TechCam Solutions: <code className="bg-secondary px-2 py-1 rounded">TECH2024</code>
        </p>
      </div>
    </div>
  );
};

export default WorkspaceSelect;
