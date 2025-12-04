import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'chef_projet' | 'developpeur' | 'observateur';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  chef_projet: 'Chef de projet',
  developpeur: 'Développeur',
  observateur: 'Observateur',
};

export const rolePermissions: Record<UserRole, {
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canManageTeam: boolean;
  canViewAnalytics: boolean;
  canEditSettings: boolean;
}> = {
  admin: {
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canManageTeam: true,
    canViewAnalytics: true,
    canEditSettings: true,
  },
  chef_projet: {
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: false,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canManageTeam: true,
    canViewAnalytics: true,
    canEditSettings: false,
  },
  developpeur: {
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canManageTeam: false,
    canViewAnalytics: true,
    canEditSettings: false,
  },
  observateur: {
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canCreateTask: false,
    canEditTask: false,
    canDeleteTask: false,
    canManageTeam: false,
    canViewAnalytics: true,
    canEditSettings: false,
  },
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string, role: UserRole) => {
    // Simulated login - in production, this would be an API call
    const mockUser: User = {
      id: '1',
      name: email.split('@')[0],
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function usePermissions() {
  const { user } = useUser();
  if (!user) return rolePermissions.observateur;
  return rolePermissions[user.role];
}
