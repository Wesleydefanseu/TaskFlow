import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamMemberForm } from '@/components/forms/TeamMemberForm';
import { usePermissions, UserRole, roleLabels } from '@/contexts/UserContext';
import { 
  Plus, 
  Mail, 
  Phone, 
  MoreHorizontal,
  Search,
  Filter,
  UserPlus,
  CheckCircle2,
  Clock,
  FolderKanban,
  Pencil,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  tasksCompleted: number;
  tasksInProgress: number;
  projects: number;
}

const initialMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Aminata Diallo',
    email: 'aminata@taskflow.sn',
    phone: '+221 77 123 45 67',
    role: 'chef_projet',
    department: 'Design',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200',
    status: 'online',
    tasksCompleted: 45,
    tasksInProgress: 8,
    projects: 4,
  },
  {
    id: '2',
    name: 'Kwame Asante',
    email: 'kwame@taskflow.sn',
    phone: '+233 24 567 8901',
    role: 'developpeur',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    status: 'online',
    tasksCompleted: 67,
    tasksInProgress: 12,
    projects: 5,
  },
  {
    id: '3',
    name: 'Ousmane Traoré',
    email: 'ousmane@taskflow.sn',
    phone: '+223 76 234 5678',
    role: 'developpeur',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    status: 'away',
    tasksCompleted: 52,
    tasksInProgress: 6,
    projects: 3,
  },
  {
    id: '4',
    name: 'Fatou Ndiaye',
    email: 'fatou@taskflow.sn',
    phone: '+221 78 345 6789',
    role: 'observateur',
    department: 'Quality',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    status: 'offline',
    tasksCompleted: 38,
    tasksInProgress: 4,
    projects: 4,
  },
  {
    id: '5',
    name: 'Aïcha Coulibaly',
    email: 'aicha@taskflow.sn',
    phone: '+225 07 456 7890',
    role: 'admin',
    department: 'Product',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    status: 'online',
    tasksCompleted: 89,
    tasksInProgress: 15,
    projects: 6,
  },
  {
    id: '6',
    name: 'Ibrahima Bah',
    email: 'ibrahima@taskflow.sn',
    phone: '+224 62 567 8901',
    role: 'developpeur',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    status: 'online',
    tasksCompleted: 34,
    tasksInProgress: 3,
    projects: 2,
  },
];

const Team = () => {
  const permissions = usePermissions();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = () => {
    setEditingMember(undefined);
    setFormOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const handleDeleteMember = (memberId: string) => {
    setMemberToDelete(memberId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      setMembers(members.filter(m => m.id !== memberToDelete));
      setMemberToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleSubmit = (data: Omit<TeamMember, 'id' | 'status' | 'tasksCompleted' | 'tasksInProgress' | 'projects' | 'phone'>) => {
    if (editingMember) {
      setMembers(members.map(m => 
        m.id === editingMember.id 
          ? { ...m, ...data }
          : m
      ));
    } else {
      const newMember: TeamMember = {
        ...data,
        id: Date.now().toString(),
        phone: '',
        status: 'offline',
        tasksCompleted: 0,
        tasksInProgress: 0,
        projects: 0,
      };
      setMembers([...members, newMember]);
    }
  };

  return (
    <DashboardLayout title="Équipe" subtitle="Gérez votre équipe et les permissions">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
          {permissions.canManageTeam && (
            <Button variant="gradient" size="sm" onClick={handleAddMember}>
              <UserPlus className="w-4 h-4 mr-2" />
              Inviter
            </Button>
          )}
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-elevated transition-all duration-300 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-lg">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card",
                    member.status === 'online' && "bg-status-done",
                    member.status === 'away' && "bg-status-progress",
                    member.status === 'offline' && "bg-muted"
                  )} />
                </div>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{roleLabels[member.role]}</p>
                </div>
              </div>
              {permissions.canManageTeam && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditMember(member)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Department Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{member.department}</Badge>
              <Badge variant="outline" className="text-xs">
                {roleLabels[member.role]}
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{member.phone}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-status-done mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">{member.tasksCompleted}</span>
                </div>
                <p className="text-xs text-muted-foreground">Terminées</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-status-progress mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">{member.tasksInProgress}</span>
                </div>
                <p className="text-xs text-muted-foreground">En cours</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-primary mb-1">
                  <FolderKanban className="w-4 h-4" />
                  <span className="font-semibold">{member.projects}</span>
                </div>
                <p className="text-xs text-muted-foreground">Projets</p>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Member Card */}
        {permissions.canManageTeam && (
          <button 
            onClick={handleAddMember}
            className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[280px]"
          >
            <div className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium">Ajouter un membre</span>
          </button>
        )}
      </div>

      {/* Team Member Form */}
      <TeamMemberForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editingMember}
        mode={editingMember ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce membre de l'équipe ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Team;
