import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamMemberForm } from '@/components/forms/TeamMemberForm';
import { usePermissions, UserRole, roleLabels } from '@/contexts/UserContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
<<<<<<< HEAD
import { useNotifications } from '@/contexts/NotificationsContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { inviteTeamMember, updateTeamMemberRole } from '@/lib/api';
=======
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3
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
<<<<<<< HEAD
  Loader2,
  Copy,
  RefreshCw,
  Link as LinkIcon
=======
  Loader2
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3
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

<<<<<<< HEAD
// Generate unique invitation code
const generateInvitationCode = (workspaceId: string): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const workspacePart = workspaceId.substring(0, 4).toUpperCase();
  return `${workspacePart}-${randomPart}-${timestamp}`;
};

const Team = () => {
  const permissions = usePermissions();
  const { currentWorkspace, members, removeMember } = useWorkspace();
  const { addNotification } = useNotifications();
=======
const Team = () => {
  const permissions = usePermissions();
  const { currentWorkspace, members, removeMember } = useWorkspace();
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
  const [invitationCode, setInvitationCode] = useState<string>('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
=======
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!currentWorkspace) return;
      
      setIsLoading(true);
      try {
<<<<<<< HEAD
        // Generate invitation code if workspace exists
        if (currentWorkspace && !invitationCode) {
          const code = generateInvitationCode(currentWorkspace.id);
          setInvitationCode(code);
        }

=======
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3
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

<<<<<<< HEAD
  const copyInvitationCode = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode);
      toast.success('Code d\'invitation copié!');
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const regenerateInvitationCode = () => {
    if (!currentWorkspace) return;
    setIsGeneratingCode(true);
    setTimeout(() => {
      const newCode = generateInvitationCode(currentWorkspace.id);
      setInvitationCode(newCode);
      setIsGeneratingCode(false);
      toast.success('Code d\'invitation régénéré');
    }, 500);
  };

=======
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3
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
<<<<<<< HEAD
        try {
          // First, remove from database
          const { error } = await supabase
            .from('workspace_members')
            .delete()
            .eq('id', member.id);

          if (error) {
            console.error('Error deleting member:', error);
            toast.error('Erreur lors de la suppression du membre');
            return;
          }

          // Then update the local state
          setTeamMembers(prev => prev.filter(m => m.id !== memberToDelete));
          
          // Also call removeMember to update context
          await removeMember(member.user_id);
          
          toast.success('Membre supprimé avec succès');
          await addNotification({
            type: 'warning',
            title: 'Membre supprimé',
            message: `${member.name} a été retiré de l'équipe`,
          });
        } catch (error) {
          console.error('Error in confirmDelete:', error);
          toast.error('Erreur lors de la suppression');
        }
=======
        await removeMember(member.user_id);
        setTeamMembers(prev => prev.filter(m => m.id !== memberToDelete));
        toast.success('Membre supprimé avec succès');
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3
      }
      setMemberToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleSubmit = async (data: any) => {
<<<<<<< HEAD
    if (!currentWorkspace) {
      toast.error('Aucun espace de travail sélectionné');
      return;
    }

=======
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3
    if (editingMember) {
      // Update existing member role
      try {
        const roleMap: Record<UserRole, string> = {
          'admin': 'admin',
          'chef_projet': 'manager',
          'developpeur': 'member',
          'observateur': 'viewer'
        };
        
<<<<<<< HEAD
        await updateTeamMemberRole(currentWorkspace.id, editingMember.user_id, roleMap[data.role] as 'owner' | 'admin' | 'manager' | 'member' | 'viewer');
        
        setTeamMembers(prev => prev.map(m => 
          m.id === editingMember.id 
            ? { ...m, role: data.role }
=======
        await supabase
          .from('workspace_members')
          .update({ role: roleMap[data.role] || 'member' })
          .eq('id', editingMember.id);
        
        setTeamMembers(prev => prev.map(m => 
          m.id === editingMember.id 
            ? { ...m, ...data }
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3
            : m
        ));
        toast.success('Membre mis à jour');
      } catch (error) {
<<<<<<< HEAD
        console.error('Error updating member:', error);
        toast.error('Erreur lors de la mise à jour');
      }
    } else {
      // Invite new member
      try {
        const roleMap: Record<UserRole, string> = {
          'admin': 'admin',
          'chef_projet': 'manager',
          'developpeur': 'member',
          'observateur': 'viewer'
        };

        // Verify email format
        if (!data.email || !data.email.includes('@')) {
          toast.error('Email invalide');
          return;
        }

        // Check if user already exists in workspace
        const existingMember = members.find(m => m.profile?.email === data.email);
        if (existingMember) {
          toast.error('Ce membre existe déjà dans l\'équipe');
          return;
        }

        // Invite the member
        await inviteTeamMember(
          currentWorkspace.id,
          data.email,
          roleMap[data.role] as 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
        );

        // Create local TeamMember object for UI update
        const newMember: TeamMember = {
          id: `temp-${Date.now()}`,
          user_id: data.email,
          name: data.name,
          email: data.email,
          phone: '',
          role: data.role,
          department: data.department || 'Non défini',
          avatar: undefined,
          status: 'offline' as const,
          tasksCompleted: 0,
          tasksInProgress: 0,
          projects: 0,
        };

        setTeamMembers(prev => [...prev, newMember]);
        toast.success('Membre invité avec succès!');
        await addNotification({
          type: 'info',
          title: 'Nouveau membre invité',
          message: `${data.name} (${data.email}) a été invité à rejoindre l'équipe`,
        });
      } catch (error: any) {
        console.error('Error inviting member:', error);
        if (error.message?.includes('User not found') || error.message?.includes('not found')) {
          toast.error('Utilisateur non trouvé - assurez-vous que l\'email est correct');
        } else if (error.message?.includes('already')) {
          toast.error('Ce membre existe déjà');
        } else {
          toast.error('Erreur lors de l\'invitation');
        }
      }
=======
        toast.error('Erreur lors de la mise à jour');
      }
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3
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

<<<<<<< HEAD
      {/* Invitation Code Section */}
      {permissions.canManageTeam && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Code d'invitation
              </h3>
              <p className="text-sm text-muted-foreground">
                Partagez ce code avec les personnes que vous souhaitez inviter à rejoindre votre équipe
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none px-3 py-2 bg-background border border-primary/20 rounded-lg font-mono text-sm font-semibold text-primary">
                {invitationCode}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyInvitationCode}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={regenerateInvitationCode}
                disabled={isGeneratingCode}
              >
                {isGeneratingCode ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
=======
      {/* Team Grid */}
>>>>>>> 7c5b40d96b3de0e8733d266ffcec6d7c72edffa3
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
