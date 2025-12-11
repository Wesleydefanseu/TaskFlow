import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from './UserContext';

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
  managerId: string;
  memberIds: string[];
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  projectId: string;
  columns: { id: string; title: string; color: string }[];
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  logo?: string;
  industry: string;
  ownerId: string;
  members: WorkspaceMember[];
  projects: Project[];
  boards: Board[];
  inviteCode: string;
  createdAt: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (data: Omit<Workspace, 'id' | 'members' | 'projects' | 'boards' | 'inviteCode' | 'createdAt'>) => Workspace;
  updateWorkspace: (id: string, data: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  addMember: (workspaceId: string, member: Omit<WorkspaceMember, 'id' | 'joinedAt'>) => void;
  removeMember: (workspaceId: string, memberId: string) => void;
  addProject: (workspaceId: string, project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (workspaceId: string, projectId: string, data: Partial<Project>) => void;
  deleteProject: (workspaceId: string, projectId: string) => void;
  addBoard: (workspaceId: string, board: Omit<Board, 'id' | 'createdAt'>) => Board;
  updateBoard: (workspaceId: string, boardId: string, data: Partial<Board>) => void;
  deleteBoard: (workspaceId: string, boardId: string) => void;
  joinWorkspaceByCode: (code: string, member: Omit<WorkspaceMember, 'id' | 'joinedAt'>) => Workspace | null;
  generateInviteLink: (workspaceId: string) => string;
  getUserProjects: (userId: string, userRole: UserRole) => Project[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = 'taskflow_workspaces';

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Cameroon team members for demo
const cameroonMembers: Omit<WorkspaceMember, 'id' | 'joinedAt'>[] = [
  { name: 'Emmanuel Ngono', email: 'emmanuel.ngono@techcam.cm', role: 'admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', phone: '+237 690 123 456' },
  { name: 'Marie-Claire Fotso', email: 'mc.fotso@techcam.cm', role: 'chef_projet', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100', phone: '+237 691 234 567' },
  { name: 'Jean-Paul Mbarga', email: 'jp.mbarga@techcam.cm', role: 'developpeur', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', phone: '+237 692 345 678' },
  { name: 'Sandrine Tchamba', email: 's.tchamba@techcam.cm', role: 'developpeur', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', phone: '+237 693 456 789' },
  { name: 'Patrick Nganou', email: 'p.nganou@techcam.cm', role: 'observateur', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', phone: '+237 694 567 890' },
];

const createDemoWorkspace = (): Workspace => {
  const members = cameroonMembers.map((m, i) => ({
    ...m,
    id: `member-${i + 1}`,
    joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const projects: Project[] = [
    {
      id: 'proj-1',
      name: 'Site Web Refonte',
      description: 'Refonte complète du site web corporate',
      color: 'bg-primary',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      managerId: 'member-2',
      memberIds: ['member-2', 'member-3', 'member-4'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj-2',
      name: 'App Mobile',
      description: 'Application mobile iOS et Android',
      color: 'bg-accent',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-08-15',
      managerId: 'member-2',
      memberIds: ['member-2', 'member-3'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj-3',
      name: 'Marketing Q1',
      description: 'Campagne marketing premier trimestre',
      color: 'bg-status-progress',
      status: 'completed',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      managerId: 'member-1',
      memberIds: ['member-1', 'member-5'],
      createdAt: new Date().toISOString(),
    },
  ];

  const boards: Board[] = [
    {
      id: 'board-1',
      name: 'Sprint 3',
      projectId: 'proj-1',
      columns: [
        { id: 'todo', title: 'À faire', color: 'bg-muted-foreground' },
        { id: 'in-progress', title: 'En cours', color: 'bg-status-progress' },
        { id: 'review', title: 'En revue', color: 'bg-status-review' },
        { id: 'done', title: 'Terminé', color: 'bg-status-done' },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    id: 'ws-demo',
    name: 'TechCam Solutions',
    description: 'Entreprise de développement logiciel basée à Douala',
    industry: 'Technologie',
    logo: undefined,
    ownerId: 'member-1',
    members,
    projects,
    boards,
    inviteCode: 'TECH2024',
    createdAt: new Date().toISOString(),
  };
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [createDemoWorkspace()];
      }
    }
    return [createDemoWorkspace()];
  });

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(() => {
    const storedCurrent = localStorage.getItem('taskflow_current_workspace');
    if (storedCurrent) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ws = JSON.parse(stored);
        return ws.find((w: Workspace) => w.id === storedCurrent) || ws[0] || null;
      }
    }
    return workspaces[0] || null;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem('taskflow_current_workspace', currentWorkspace.id);
    }
  }, [currentWorkspace]);

  const createWorkspace = (data: Omit<Workspace, 'id' | 'members' | 'projects' | 'boards' | 'inviteCode' | 'createdAt'>) => {
    const newWorkspace: Workspace = {
      ...data,
      id: generateId(),
      members: [],
      projects: [],
      boards: [],
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    return newWorkspace;
  };

  const updateWorkspace = (id: string, data: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(prev => prev ? { ...prev, ...data } : prev);
    }
  };

  const deleteWorkspace = (id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(workspaces.find(w => w.id !== id) || null);
    }
  };

  const addMember = (workspaceId: string, member: Omit<WorkspaceMember, 'id' | 'joinedAt'>) => {
    const newMember: WorkspaceMember = {
      ...member,
      id: generateId(),
      joinedAt: new Date().toISOString(),
    };
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, members: [...w.members, newMember] } : w
    ));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, members: [...prev.members, newMember] } : prev);
    }
  };

  const removeMember = (workspaceId: string, memberId: string) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, members: w.members.filter(m => m.id !== memberId) } : w
    ));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, members: prev.members.filter(m => m.id !== memberId) } : prev);
    }
  };

  const addProject = (workspaceId: string, project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, projects: [...w.projects, newProject] } : w
    ));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, projects: [...prev.projects, newProject] } : prev);
    }
    return newProject;
  };

  const updateProject = (workspaceId: string, projectId: string, data: Partial<Project>) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, projects: w.projects.map(p => p.id === projectId ? { ...p, ...data } : p) } : w
    ));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, projects: prev.projects.map(p => p.id === projectId ? { ...p, ...data } : p) } : prev);
    }
  };

  const deleteProject = (workspaceId: string, projectId: string) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, projects: w.projects.filter(p => p.id !== projectId) } : w
    ));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, projects: prev.projects.filter(p => p.id !== projectId) } : prev);
    }
  };

  const addBoard = (workspaceId: string, board: Omit<Board, 'id' | 'createdAt'>) => {
    const newBoard: Board = {
      ...board,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, boards: [...w.boards, newBoard] } : w
    ));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, boards: [...prev.boards, newBoard] } : prev);
    }
    return newBoard;
  };

  const updateBoard = (workspaceId: string, boardId: string, data: Partial<Board>) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, boards: w.boards.map(b => b.id === boardId ? { ...b, ...data } : b) } : w
    ));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, boards: prev.boards.map(b => b.id === boardId ? { ...b, ...data } : b) } : prev);
    }
  };

  const deleteBoard = (workspaceId: string, boardId: string) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, boards: w.boards.filter(b => b.id !== boardId) } : w
    ));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, boards: prev.boards.filter(b => b.id !== boardId) } : prev);
    }
  };

  const joinWorkspaceByCode = (code: string, member: Omit<WorkspaceMember, 'id' | 'joinedAt'>) => {
    const workspace = workspaces.find(w => w.inviteCode === code.toUpperCase());
    if (workspace) {
      addMember(workspace.id, member);
      return workspace;
    }
    return null;
  };

  const generateInviteLink = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      return `${window.location.origin}/join/${workspace.inviteCode}`;
    }
    return '';
  };

  const getUserProjects = (userId: string, userRole: UserRole) => {
    if (!currentWorkspace) return [];
    
    // Admin voit tous les projets
    if (userRole === 'admin') {
      return currentWorkspace.projects;
    }
    
    // Chef de projet voit uniquement les projets où il est manager ou membre
    if (userRole === 'chef_projet') {
      return currentWorkspace.projects.filter(p => 
        p.managerId === userId || p.memberIds.includes(userId)
      );
    }
    
    // Développeur et observateur voient les projets où ils sont membres
    return currentWorkspace.projects.filter(p => p.memberIds.includes(userId));
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      currentWorkspace,
      setCurrentWorkspace,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      addMember,
      removeMember,
      addProject,
      updateProject,
      deleteProject,
      addBoard,
      updateBoard,
      deleteBoard,
      joinWorkspaceByCode,
      generateInviteLink,
      getUserProjects,
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
