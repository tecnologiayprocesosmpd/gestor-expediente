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

  // Define colors for each navigation item
  const getItemColors = (itemId: string) => {
    const colors = {
      dashboard: {
        bg: 'bg-blue-50 hover:bg-blue-100',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-800',
        activeBg: 'bg-blue-600',
        activeText: 'text-white'
      },
      expedientes: {
        bg: 'bg-green-50 hover:bg-green-100', 
        border: 'border-green-200',
        icon: 'text-green-600',
        text: 'text-green-800',
        activeBg: 'bg-green-600',
        activeText: 'text-white'
      },
      agenda: {
        bg: 'bg-purple-50 hover:bg-purple-100',
        border: 'border-purple-200', 
        icon: 'text-purple-600',
        text: 'text-purple-800',
        activeBg: 'bg-purple-600',
        activeText: 'text-white'
      }
    };
    return colors[itemId as keyof typeof colors] || colors.dashboard;
  };

  return (
    <div className="h-full min-h-screen bg-background border-r w-80 flex-shrink-0">
      <div className="flex flex-col h-full min-h-screen">
        {/* User Profile Section */}
        <div className="p-4 border-b">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-3">
              <ProfileIcon className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-foreground mb-1">
              Bienvenido
            </h2>
            <h3 className="text-xs text-muted-foreground mb-2">
              {user.name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {user.profile === 'mesa-entrada' ? 'Mesa de Entrada' : 'Oficina'}
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 flex flex-col">
          <div className="px-4 mb-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Navegación Principal
            </h3>
          </div>
          <nav className="flex flex-col gap-3 px-4">
            {navigationItems.map((item) => {
              const colors = getItemColors(item.id);
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    isActive 
                      ? `${colors.activeBg} ${colors.activeText} border-transparent shadow-lg` 
                      : `${colors.bg} ${colors.border} ${colors.text}`
                  }`}
                >
                  <item.icon className={`w-8 h-8 mb-2 ${isActive ? colors.activeText : colors.icon}`} />
                  <span className={`text-xs font-medium text-center leading-tight ${isActive ? colors.activeText : colors.text}`}>
                    {item.title}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          {canCreateExpedients && (
            <div className="mt-8">
              <div className="px-4 mb-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones Rápidas
                </h3>
              </div>
              <div className="px-4">
                <button
                  onClick={onCreateExpedient}
                  className="w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 transition-all duration-200"
                >
                  <Plus className="w-8 h-8 mb-2 text-orange-600" />
                  <span className="text-xs font-medium text-center leading-tight">
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