import { 
  Home, 
  FileText, 
  Calendar,
  Plus,
  Building2,
  Shield,
  Inbox,
  Search,
  BarChart3,
  TrendingUp
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
  onNavigate?: (view: 'dashboard' | 'expedientes' | 'agenda' | 'casos-pendientes' | 'auditoria' | 'cuatrimestre') => void;
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

  // Navegación específica para Mesa de Entrada
  const mesaEntradaItems = user.role === 'mesa' ? [
    {
      id: 'casos-pendientes',
      title: 'Casos Pendientes',
      icon: Inbox,
      onClick: () => onNavigate?.('casos-pendientes')
    }
  ] : [];

  // Navegación para reportes y auditoría
  const reportesItems = [
    {
      id: 'auditoria',
      title: 'Auditoría',
      icon: Search,
      onClick: () => onNavigate?.('auditoria')
    },
    {
      id: 'cuatrimestre',
      title: '1er Cuatrimestre',
      icon: BarChart3,
      onClick: () => onNavigate?.('cuatrimestre')
    }
  ];

  return (
    <div 
      className="h-full min-h-screen bg-background border-r w-1/2 flex-shrink-0"
    >
      <div className="flex flex-col h-full min-h-screen">
        {/* User Profile Section */}
        <div className="p-4 border-b">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <ProfileIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-sm font-semibold text-foreground">
                Bienvenido
              </h2>
              <h3 className="text-xs text-muted-foreground">
                {user.name}
              </h3>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {user.profile === 'mesa-entrada' ? 'Mesa de Entrada' : 'Oficina'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 flex flex-col h-full min-h-full">
          <div className="px-2 mb-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
              Navegación
            </h3>
          </div>
          <nav className="space-y-3 px-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${
                  currentView === item.id 
                    ? "bg-muted text-primary font-medium" 
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <item.icon className="w-6 h-6 mb-2" />
                <span className="text-xs text-center">
                  {item.title}
                </span>
              </button>
            ))}
          </nav>

          {/* Mesa de Entrada specific navigation - HIDDEN */}
          {/* {mesaEntradaItems.length > 0 && (
            <>
              <div className="px-2 mb-2 mt-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
                  Gestión
                </h3>
              </div>
              <nav className="space-y-1 px-2">
                {mesaEntradaItems.map((item) => (
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
            </>
          )} */}

          {/* Reportes navigation - HIDDEN */}
          {/* <div className="px-2 mb-2 mt-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
              Reportes
            </h3>
          </div>
          <nav className="space-y-1 px-2">
            {reportesItems.map((item) => (
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
          </nav> */}

          {/* Quick Actions */}
          {canCreateExpedients && (
            <div className="mt-6">
              <div className="px-2 mb-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                  Acciones
                </h3>
              </div>
              <div className="px-2">
                <button
                  onClick={onCreateExpedient}
                  className="w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-muted/50 text-foreground"
                >
                  <Plus className="w-6 h-6 mb-2" />
                  <span className="text-xs text-center">
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