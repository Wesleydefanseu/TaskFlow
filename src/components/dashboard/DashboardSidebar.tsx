import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Home, 
  FolderKanban, 
  Calendar, 
  Users, 
  Settings, 
  Plus,
  ChevronLeft,
  BarChart3,
  Bell,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';

const mainNav = [
  { icon: Home, label: 'Accueil', path: '/dashboard' },
  { icon: FolderKanban, label: 'Projets', path: '/projects' },
  { icon: Calendar, label: 'Calendrier', path: '/calendar' },
  { icon: BarChart3, label: 'Analytiques', path: '/analytics' },
  { icon: Users, label: 'Équipe', path: '/team' },
];

const projects = [
  { name: 'Site Web Refonte', color: 'bg-primary' },
  { name: 'App Mobile', color: 'bg-accent' },
  { name: 'Marketing Q1', color: 'bg-status-progress' },
  { name: 'Design System', color: 'bg-status-review' },
];

export function DashboardSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <aside className={cn(
      "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link to="/dashboard" className={cn("flex items-center gap-2 font-bold text-lg", collapsed && "justify-center")}>
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <LayoutGrid className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="gradient-text">TaskFlow</span>}
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("flex-shrink-0", collapsed && "hidden")}
          onClick={() => setCollapsed(true)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {mainNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}

        {/* Projects Section */}
        {!collapsed && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-3 px-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Projets
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {projects.map((project, index) => (
                <Link
                  key={index}
                  to={`/projects/${index + 1}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <div className={cn("w-2 h-2 rounded-full", project.color)} />
                  <span className="text-sm truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          to="/notifications"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
            location.pathname === '/notifications'
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary",
            collapsed && "justify-center px-2"
          )}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          {!collapsed && <span className="font-medium">Notifications</span>}
        </Link>
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Paramètres</span>}
        </Link>

        {collapsed && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full mt-2"
            onClick={() => setCollapsed(false)}
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Button>
        )}
      </div>
    </aside>
  );
}
