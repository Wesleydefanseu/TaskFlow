import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  FolderKanban
} from 'lucide-react';
import { cn } from '@/lib/utils';

const teamMembers = [
  {
    id: 1,
    name: 'Alice Martin',
    email: 'alice@taskflow.com',
    phone: '+33 6 12 34 56 78',
    role: 'Lead Designer',
    department: 'Design',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    status: 'online',
    tasksCompleted: 45,
    tasksInProgress: 8,
    projects: 4,
  },
  {
    id: 2,
    name: 'Bob Dupont',
    email: 'bob@taskflow.com',
    phone: '+33 6 23 45 67 89',
    role: 'Senior Developer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    status: 'online',
    tasksCompleted: 67,
    tasksInProgress: 12,
    projects: 5,
  },
  {
    id: 3,
    name: 'Charlie Petit',
    email: 'charlie@taskflow.com',
    phone: '+33 6 34 56 78 90',
    role: 'Backend Engineer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    status: 'away',
    tasksCompleted: 52,
    tasksInProgress: 6,
    projects: 3,
  },
  {
    id: 4,
    name: 'Diana Moreau',
    email: 'diana@taskflow.com',
    phone: '+33 6 45 67 89 01',
    role: 'QA Engineer',
    department: 'Quality',
    status: 'offline',
    tasksCompleted: 38,
    tasksInProgress: 4,
    projects: 4,
  },
  {
    id: 5,
    name: 'Emma Bernard',
    email: 'emma@taskflow.com',
    phone: '+33 6 56 78 90 12',
    role: 'Product Manager',
    department: 'Product',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    status: 'online',
    tasksCompleted: 89,
    tasksInProgress: 15,
    projects: 6,
  },
  {
    id: 6,
    name: 'François Leroy',
    email: 'francois@taskflow.com',
    phone: '+33 6 67 89 01 23',
    role: 'DevOps Engineer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    status: 'online',
    tasksCompleted: 34,
    tasksInProgress: 3,
    projects: 2,
  },
];

const Team = () => {
  return (
    <DashboardLayout title="Équipe" subtitle="Gérez votre équipe et les permissions">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
          <Button variant="gradient" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Inviter
          </Button>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
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
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Department Badge */}
            <div className="mb-4">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                {member.department}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </div>
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
        <button className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[280px]">
          <div className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium">Ajouter un membre</span>
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Team;
