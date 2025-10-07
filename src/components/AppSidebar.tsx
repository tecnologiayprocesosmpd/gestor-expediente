import { 
  Home, 
  FileText, 
  Calendar,
  Plus,
  Building2,
  Shield,
  Send,
  ArrowLeft,
  Download,
  Navigation,
  RefreshCw,
  FileCheck
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
  isExpedientView?: boolean;
  onRadicacionInterna?: () => void;
  onRegresarRadicacionInterna?: () => void;
  onExportPDF?: () => void;
  onTramites?: () => void;
  onNuevaActuacion?: () => void;
  onNavegar?: () => void;
  onChangeStatus?: () => void;
  onOficio?: () => void;
  showRegresarRadicacionInterna?: boolean;
}

export function AppSidebar({ 
  currentView, 
  onNavigate, 
  onCreateExpedient,
  isExpedientView = false,
  onRadicacionInterna,
  onRegresarRadicacionInterna,
  onExportPDF,
  onTramites,
  onNuevaActuacion,
  onNavegar,
  onChangeStatus,
  onOficio,
  showRegresarRadicacionInterna = false
}: AppSidebarProps) {
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
  const canCreateExpedients = true; // Ambos perfiles pueden crear expedientes

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
    }
  ];



  // Si estamos en vista de expediente, mostrar botones de acciones
  if (isExpedientView) {
    return (
      <div 
        className="bg-background border-r flex-shrink-0"
        style={{ width: '100px' }}
      >
        <div className="flex flex-col">
          <div className="pt-6 flex flex-col">
            <div className="px-2 mb-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                Acciones
              </h3>
            </div>
            <nav className="space-y-3 px-2 pb-6">
              <button
                onClick={onNavegar}
                className="w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-primary hover:text-primary-foreground bg-muted/50 text-foreground"
              >
                <Navigation className="w-6 h-6 mb-2" />
                <span className="text-xs text-center">
                  Navegar
                </span>
              </button>

              <button
                onClick={onRadicacionInterna}
                className="w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:text-white bg-muted/50 text-foreground"
              >
                <Send className="w-6 h-6 mb-2" />
                <span className="text-xs text-center">
                  Radicación Interna
                </span>
              </button>

              {showRegresarRadicacionInterna && (
                <button
                  onClick={onRegresarRadicacionInterna}
                  className="w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-green-600 hover:text-white bg-muted/50 text-foreground"
                >
                  <ArrowLeft className="w-6 h-6 mb-2" />
                  <span className="text-xs text-center">
                    Regresar Radicación Interna
                  </span>
                </button>
              )}

              <button
                onClick={onExportPDF}
                className="w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-muted text-foreground"
              >
                <Download className="w-6 h-6 mb-2" />
                <span className="text-xs text-center">
                  Exportar
                </span>
              </button>

              <button
                onClick={onTramites}
                className="w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-muted text-foreground"
              >
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-xs text-center">
                  Trámites
                </span>
              </button>

              <button
                onClick={onNuevaActuacion}
                className="w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-primary hover:text-primary-foreground bg-muted/50 text-foreground"
              >
                <Plus className="w-6 h-6 mb-2" />
                <span className="text-xs text-center">
                  Nueva Actuación
                </span>
              </button>

              <button
                onClick={onChangeStatus}
                className="w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-orange-600 hover:text-white bg-muted/50 text-foreground"
              >
                <RefreshCw className="w-6 h-6 mb-2" />
                <span className="text-xs text-center">
                  Estado Expediente
                </span>
              </button>

              <button
                onClick={onOficio}
                className="w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-purple-600 hover:text-white bg-muted/50 text-foreground"
              >
                <FileCheck className="w-6 h-6 mb-2" />
                <span className="text-xs text-center">
                  Oficio
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-background border-r flex-shrink-0"
      style={{ width: '100px' }}
    >
      <div className="flex flex-col">
        {/* Navigation */}
        <div className="pt-6 flex flex-col">
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

          {/* Quick Actions */}
          {canCreateExpedients && (
            <div className="mt-6 pb-6">
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