import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { usePermissions } from '@/contexts/UserContext';
import { Plus, LayoutGrid, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const defaultColumns = [
  { id: 'todo', title: 'À faire', color: 'bg-muted-foreground' },
  { id: 'in-progress', title: 'En cours', color: 'bg-status-progress' },
  { id: 'review', title: 'En revue', color: 'bg-status-review' },
  { id: 'done', title: 'Terminé', color: 'bg-status-done' },
];

const Boards = () => {
  const navigate = useNavigate();
  const { currentWorkspace, addBoard, deleteBoard } = useWorkspace();
  const permissions = usePermissions();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  
  const [boardName, setBoardName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const boards = currentWorkspace?.boards || [];
  const projects = currentWorkspace?.projects || [];

  const handleCreateBoard = () => {
    if (!boardName.trim()) {
      toast.error('Le nom du tableau est requis');
      return;
    }
    if (!selectedProjectId) {
      toast.error('Veuillez sélectionner un projet');
      return;
    }
    if (!currentWorkspace) return;

    addBoard(currentWorkspace.id, {
      name: boardName,
      projectId: selectedProjectId,
      columns: defaultColumns,
    });

    toast.success('Tableau créé avec succès!');
    setCreateDialogOpen(false);
    setBoardName('');
    setSelectedProjectId('');
  };

  const handleDeleteBoard = () => {
    if (!currentWorkspace || !selectedBoardId) return;
    
    deleteBoard(currentWorkspace.id, selectedBoardId);
    toast.success('Tableau supprimé');
    setDeleteDialogOpen(false);
    setSelectedBoardId(null);
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Projet inconnu';
  };

  const getProjectColor = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.color || 'bg-muted';
  };

  return (
    <DashboardLayout title="Tableaux" subtitle="Gérez vos tableaux Kanban">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {boards.length} tableau{boards.length > 1 ? 'x' : ''} au total
        </p>
        {permissions.canCreateProject && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau tableau
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau tableau</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="board-name">Nom du tableau</Label>
                  <Input
                    id="board-name"
                    placeholder="Sprint 4"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Projet associé</Label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un projet" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${project.color}`} />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateBoard} className="w-full">
                  Créer le tableau
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {boards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <LayoutGrid className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun tableau</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier tableau pour organiser vos tâches
            </p>
            {permissions.canCreateProject && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un tableau
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Card 
              key={board.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
              onClick={() => navigate(`/projects?board=${board.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5" />
                    {board.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${getProjectColor(board.projectId)} mr-2`} />
                    {getProjectName(board.projectId)}
                  </CardDescription>
                </div>
                {permissions.canDeleteProject && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBoardId(board.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {board.columns.map((col) => (
                    <div key={col.id} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${col.color}`} />
                      <span className="text-xs text-muted-foreground">{col.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce tableau?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les tâches du tableau seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBoard} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Boards;
