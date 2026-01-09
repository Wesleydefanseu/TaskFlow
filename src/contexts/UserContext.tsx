import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'chef_projet' | 'developpeur' | 'observateur';
export type AppRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  chef_projet: 'Chef de projet',
  developpeur: 'Développeur',
  observateur: 'Observateur',
};

// Map app_role from DB to UserRole for UI
export const mapAppRoleToUserRole = (appRole: AppRole): UserRole => {
  switch (appRole) {
    case 'owner':
    case 'admin':
      return 'admin';
    case 'manager':
      return 'chef_projet';
    case 'member':
      return 'developpeur';
    case 'viewer':
      return 'observateur';
    default:
      return 'observateur';
  }
};

export const mapUserRoleToAppRole = (userRole: UserRole): AppRole => {
  switch (userRole) {
    case 'admin':
      return 'admin';
    case 'chef_projet':
      return 'manager';
    case 'developpeur':
      return 'member';
    case 'observateur':
      return 'viewer';
    default:
      return 'viewer';
  }
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
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);

        // Fetch user profile if session exists
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        // Get user role from workspace_members if in a workspace
        let userRole: UserRole = 'observateur';
        
        const { data: memberData } = await supabase
          .from('workspace_members')
          .select('role')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle();

        if (memberData) {
          userRole = mapAppRoleToUserRole(memberData.role as AppRole);
        }

        setUser({
          id: profile.id,
          name: profile.full_name || profile.email,
          email: profile.email,
          role: userRole,
          avatar: profile.avatar_url || undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (email: string, password: string, role: UserRole) => {
    // This is now handled by Supabase auth - kept for compatibility
    const mockUser: User = {
      id: '1',
      name: email.split('@')[0],
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    };
    setUser(mockUser);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSupabaseUser(null);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      supabaseUser,
      session,
      setUser, 
      login, 
      logout, 
      isAuthenticated: !!session,
      isLoading
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
