import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Building2, 
  Users, 
  LogOut, 
  Home, 
  Plus,
  Search,
  BarChart3
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface LayoutProps {
  children: ReactNode;
  currentView?: 'dashboard' | 'expedientes' | 'view' | 'editor' | 'legajos' | 'reportes';
  onNavigate?: (view: 'dashboard' | 'expedientes' | 'view' | 'editor' | 'legajos' | 'reportes') => void;
  onCreateExpedient?: () => void;
}

export function Layout({ children, currentView = 'dashboard', onNavigate, onCreateExpedient }: LayoutProps) {
  const { user, logout } = useUser();

  if (!user) return null;

  const getProfileIcon = () => {
    switch (user.profile) {
      case 'mesa-entrada':
        return FileText;
      case 'oficina':
        return Building2;
      default:
        return FileText;
    }
  };

  const ProfileIcon = getProfileIcon();

  const canCreateExpedients = user.role === 'mesa';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <ProfileIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    SAE MPD - Sistema de Expedientes
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {user.profile === 'mesa-entrada' ? 'Mesa de Entrada' : 'Oficina'}
                    </Badge>
                    <Badge 
                      variant={user.role === 'mesa' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {user.role === 'mesa' ? 'Control Total' : 'Solo Actuaciones'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">
                {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate?.('dashboard')}
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Button>
              <Button
                variant={currentView === 'expedientes' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate?.('expedientes')}
                className="flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Expedientes</span>
              </Button>
              <Button
                variant={currentView === 'legajos' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate?.('legajos')}
                className="flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Legajos</span>
              </Button>
              <Button
                variant={currentView === 'reportes' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate?.('reportes')}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reportes</span>
              </Button>
            </div>

            {canCreateExpedients && (
              <Button
                onClick={onCreateExpedient}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Expediente</span>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}