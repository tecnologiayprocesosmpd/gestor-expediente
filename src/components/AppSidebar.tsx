import { 
  Home, 
  FileText, 
  Calendar,
  Plus,
  Building2,
  Shield
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AppSidebarProps {
  currentView: string;
  onNavigate?: (view: 'dashboard' | 'expedientes' | 'agenda') => void;
  onCreateExpedient?: () => void;
}

export function AppSidebar({ currentView, onNavigate, onCreateExpedient }: AppSidebarProps) {
  const { user } = useUser();

  if (!user) return null;

  const getProfileIcon = () => {
    switch (user.profile) {
      case 'mesa-entrada':
        return FileText;
      case 'oficina':
        return Building2;
      default:
        return Shield;
    }
  };

  const ProfileIcon = getProfileIcon();
  const canCreateExpedients = user.role === 'mesa';

  const navigationItems = [
    { 
      id: 'dashboard', 
      title: 'Inicio', 
      icon: Home,
      onClick: () => onNavigate?.('dashboard')
    },
    { 
      id: 'expedientes', 
      title: 'Expedientes', 
      icon: FileText,
      onClick: () => onNavigate?.('expedientes')
    },
    { 
      id: 'agenda', 
      title: 'Agenda', 
      icon: Calendar,
      onClick: () => onNavigate?.('agenda')
    },
  ];

  return (
    <div 
      className="group h-full min-h-screen bg-background border-r transition-all duration-300 hover:w-64 w-16 flex-shrink-0"
      onMouseLeave={(e) => {
        // Prevenir que se colapse si el mouse está sobre un dropdown/tooltip
        const relatedTarget = e.relatedTarget as Element;
        if (relatedTarget && relatedTarget.closest('[data-radix-popper-content-wrapper]')) {
          return;
        }
      }}
    >
      <div className="flex flex-col h-full min-h-screen">
        {/* User Profile Section */}
        <div className="p-4 border-b">
          <div className="flex items-center group-hover:space-x-3 justify-center group-hover:justify-start transition-all duration-300">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <ProfileIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
              <h2 className="text-sm font-semibold text-foreground truncate whitespace-nowrap">
                Bienvenido
              </h2>
              <h3 className="text-xs text-muted-foreground truncate whitespace-nowrap">
                {user.name}
              </h3>
              <div className="flex flex-col gap-1 mt-1">
                <Badge variant="secondary" className="text-xs w-fit">
                  {user.profile === 'mesa-entrada' ? 'Mesa de Entrada' : 'Oficina'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 flex flex-col h-full min-h-full">
          <div className="px-2 mb-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
              Navegación
            </h3>
          </div>
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center justify-center group-hover:justify-start p-3 rounded-lg transition-all duration-300 ${
                  currentView === item.id 
                    ? "bg-muted text-primary font-medium" 
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
                  {item.title}
                </span>
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          {canCreateExpedients && (
            <div className="mt-6">
              <div className="px-2 mb-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
                  Acciones
                </h3>
              </div>
              <div className="px-2">
                <button
                  onClick={onCreateExpedient}
                  className="w-full flex items-center justify-center group-hover:justify-start p-3 rounded-lg transition-all duration-300 hover:bg-muted/50 text-foreground"
                >
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
                    Nuevo Expediente
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}