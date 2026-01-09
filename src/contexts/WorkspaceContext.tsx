import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser, UserRole, mapAppRoleToUserRole, mapUserRoleToAppRole } from './UserContext';
import { Database } from '@/integrations/supabase/types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Board = Database['public']['Tables']['boards']['Row'];
type WorkspaceMemberRow = Database['public']['Tables']['workspace_members']['Row'];

interface WorkspaceMember extends WorkspaceMemberRow {
  profile?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  projects: Project[];
  boards: Board[];
  members: WorkspaceMember[];
  isLoading: boolean;
  createWorkspace: (name: string, description?: string) => Promise<Workspace | null>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  addMember: (email: string, role: UserRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  addProject: (name: string, description?: string, color?: string) => Promise<Project | null>;
  updateProject: (projectId: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addBoard: (projectId: string, name: string, description?: string) => Promise<Board | null>;
  joinWorkspaceByCode: (code: string) => Promise<Workspace | null>;
  generateInviteLink: () => string;
  getUserProjects: (userId: string, userRole: UserRole) => Project[];
  refreshData: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { supabaseUser, isLoading: userLoading } = useUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's workspaces
  const fetchWorkspaces = async () => {
    if (!supabaseUser) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          workspaces (*)
        `)
        .eq('user_id', supabaseUser.id);

      if (error) throw error;

      const userWorkspaces = data
        ?.map(item => item.workspaces)
        .filter(Boolean) as Workspace[];

      setWorkspaces(userWorkspaces || []);

      // Set current workspace from localStorage or first one
      const savedWorkspaceId = localStorage.getItem('current_workspace_id');
      const savedWorkspace = userWorkspaces?.find(w => w.id === savedWorkspaceId);
      
      if (savedWorkspace) {
        setCurrentWorkspace(savedWorkspace);
      } else if (userWorkspaces?.length > 0) {
        setCurrentWorkspace(userWorkspaces[0]);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch workspace data (projects, boards, members)
  const fetchWorkspaceData = async () => {
    if (!currentWorkspace) {
      setProjects([]);
      setBoards([]);
      setMembers([]);
      return;
    }

    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);

      // Fetch boards for all projects
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        const { data: boardsData } = await supabase
          .from('boards')
          .select('*')
          .in('project_id', projectIds);

        setBoards(boardsData || []);
      } else {
        setBoards([]);
      }

      // Fetch members
      const { data: membersData } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      // Fetch profiles separately for each member
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        const membersWithProfiles: WorkspaceMember[] = membersData.map(member => ({
          ...member,
          profile: profilesData?.find(p => p.id === member.user_id) || undefined,
        }));

        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching workspace data:', error);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchWorkspaces();
    }
  }, [supabaseUser, userLoading]);

  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem('current_workspace_id', currentWorkspace.id);
      fetchWorkspaceData();
    }
  }, [currentWorkspace]);

  const refreshData = async () => {
    await fetchWorkspaces();
    await fetchWorkspaceData();
  };

  const createWorkspace = async (name: string, description?: string): Promise<Workspace | null> => {
    if (!supabaseUser) return null;

    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const invitationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: workspace, error } = await supabase
        .from('workspaces')
        .insert({
          name,
          description,
          slug,
          invitation_code: invitationCode,
          created_by: supabaseUser.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: supabaseUser.id,
          role: 'owner',
        });

      await fetchWorkspaces();
      setCurrentWorkspace(workspace);
      return workspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      return null;
    }
  };

  const updateWorkspace = async (id: string, data: Partial<Workspace>) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await fetchWorkspaces();
    } catch (error) {
      console.error('Error updating workspace:', error);
    }
  };

  const deleteWorkspace = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchWorkspaces();
    } catch (error) {
      console.error('Error deleting workspace:', error);
    }
  };

  const addMember = async (email: string, role: UserRole) => {
    if (!currentWorkspace) return;

    try {
      // Find user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!profile) {
        throw new Error('User not found');
      }

      const appRole = mapUserRoleToAppRole(role);

      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: currentWorkspace.id,
          user_id: profile.id,
          role: appRole,
        });

      await fetchWorkspaceData();
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await fetchWorkspaceData();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const addProject = async (name: string, description?: string, color?: string): Promise<Project | null> => {
    if (!currentWorkspace || !supabaseUser) return null;

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          workspace_id: currentWorkspace.id,
          name,
          description,
          color,
          created_by: supabaseUser.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create a default board for the project
      await supabase
        .from('boards')
        .insert({
          project_id: project.id,
          name: 'Tableau principal',
          is_default: true,
        });

      await fetchWorkspaceData();
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  };

  const updateProject = async (projectId: string, data: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', projectId);

      if (error) throw error;
      await fetchWorkspaceData();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      await fetchWorkspaceData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const addBoard = async (projectId: string, name: string, description?: string): Promise<Board | null> => {
    try {
      const { data: board, error } = await supabase
        .from('boards')
        .insert({
          project_id: projectId,
          name,
          description,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchWorkspaceData();
      return board;
    } catch (error) {
      console.error('Error creating board:', error);
      return null;
    }
  };

  const joinWorkspaceByCode = async (code: string): Promise<Workspace | null> => {
    if (!supabaseUser) return null;

    try {
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('invitation_code', code.toUpperCase())
        .single();

      if (error || !workspace) {
        throw new Error('Workspace not found');
      }

      // Add user as member
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: supabaseUser.id,
          role: 'member',
        });

      await fetchWorkspaces();
      setCurrentWorkspace(workspace);
      return workspace;
    } catch (error) {
      console.error('Error joining workspace:', error);
      return null;
    }
  };

  const generateInviteLink = (): string => {
    if (!currentWorkspace?.invitation_code) return '';
    return `${window.location.origin}/join/${currentWorkspace.invitation_code}`;
  };

  const getUserProjects = (userId: string, userRole: UserRole): Project[] => {
    // Admin sees all projects
    if (userRole === 'admin') {
      return projects;
    }
    
    // For now, return all projects - proper filtering would need project_members check
    return projects;
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      currentWorkspace,
      setCurrentWorkspace,
      projects,
      boards,
      members,
      isLoading,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      addMember,
      removeMember,
      addProject,
      updateProject,
      deleteProject,
      addBoard,
      joinWorkspaceByCode,
      generateInviteLink,
      getUserProjects,
      refreshData,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
