import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamMemberForm } from '@/components/forms/TeamMemberForm';
import { usePermissions, UserRole, roleLabels } from '@/contexts/UserContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  Trash2,
  Loader2
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
  user_id: string;
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

const Team = () => {
  const permissions = usePermissions();
  const { currentWorkspace, members, removeMember } = useWorkspace();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!currentWorkspace) return;
      
      setIsLoading(true);
      try {
        // Transform workspace members to TeamMember format
        const teamData: TeamMember[] = await Promise.all(
          members.map(async (member) => {
            // Get task counts for this member
            const { data: assignedTasks } = await supabase
              .from('task_assignees')
              .select('task_id, tasks(status)')
              .eq('user_id', member.user_id);
            
            const tasksCompleted = assignedTasks?.filter(
              (t: any) => t.tasks?.status === 'done'
            ).length || 0;
            
            const tasksInProgress = assignedTasks?.filter(
              (t: any) => t.tasks?.status === 'in_progress'
            ).length || 0;

            // Get project count
            const { data: projectMemberships } = await supabase
              .from('project_members')
              .select('project_id')
              .eq('user_id', member.user_id);

            const roleMap: Record<string, UserRole> = {
              'owner': 'admin',
              'admin': 'admin',
              'manager': 'chef_projet',
              'member': 'developpeur',
              'viewer': 'observateur'
            };

            return {
              id: member.id,
              user_id: member.user_id,
              name: member.profile?.full_name || member.profile?.email || 'Unknown',
              email: member.profile?.email || '',
              phone: '',
              role: roleMap[member.role] || 'developpeur',
              department: 'Non défini',
              avatar: member.profile?.avatar_url || undefined,
              status: 'online' as const,
              tasksCompleted,
              tasksInProgress,
              projects: projectMemberships?.length || 0,
            };
          })
        );
        
        setTeamMembers(teamData);
      } catch (error) {
        console.error('Error fetching team data:', error);
        toast.error('Erreur lors du chargement de l\'équipe');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [currentWorkspace, members]);

  const filteredMembers = teamMembers.filter(member =>
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

  const confirmDelete = async () => {
    if (memberToDelete) {
      const member = teamMembers.find(m => m.id === memberToDelete);
      if (member) {
        await removeMember(member.user_id);
        setTeamMembers(prev => prev.filter(m => m.id !== memberToDelete));
        toast.success('Membre supprimé avec succès');
      }
      setMemberToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleSubmit = async (data: any) => {
    if (editingMember) {
      // Update existing member role
      try {
        const roleMap: Record<UserRole, string> = {
          'admin': 'admin',
          'chef_projet': 'manager',
          'developpeur': 'member',
          'observateur': 'viewer'
        };
        
        await supabase
          .from('workspace_members')
          .update({ role: roleMap[data.role] || 'member' })
          .eq('id', editingMember.id);
        
        setTeamMembers(prev => prev.map(m => 
          m.id === editingMember.id 
            ? { ...m, ...data }
            : m
        ));
        toast.success('Membre mis à jour');
      } catch (error) {
        toast.error('Erreur lors de la mise à jour');
      }
    }
    setFormOpen(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Équipe" subtitle="Gérez votre équipe et les permissions">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun membre dans l'équipe</p>
          {permissions.canManageTeam && (
            <Button variant="outline" className="mt-4" onClick={handleAddMember}>
              <Plus className="w-4 h-4 mr-2" />
              Inviter un membre
            </Button>
          )}
        </div>
      ) : (
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
      )}

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
