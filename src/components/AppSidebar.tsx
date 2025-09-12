import { 
  Home, 
  FileText, 
  Users, 
  BarChart3, 
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
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppSidebarProps {
  currentView: string;
  onNavigate?: (view: 'dashboard' | 'expedientes' | 'legajos' | 'reportes') => void;
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
      id: 'legajos', 
      title: 'Legajos', 
      icon: Users,
      onClick: () => onNavigate?.('legajos')
    },
    { 
      id: 'reportes', 
      title: 'Reportes', 
      icon: BarChart3,
      onClick: () => onNavigate?.('reportes')
    },
  ];

  return (
    <Sidebar className="w-64">
      <SidebarContent>
        {/* User Profile Section */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <ProfileIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-foreground truncate">
                {user.name}
              </h2>
              <div className="flex flex-col gap-1 mt-1">
                <Badge variant="secondary" className="text-xs w-fit">
                  {user.profile === 'mesa-entrada' ? 'Mesa de Entrada' : 'Oficina'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    className={currentView === item.id ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        {canCreateExpedients && (
          <SidebarGroup>
            <SidebarGroupLabel>Acciones</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onCreateExpedient}>
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Expediente</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}