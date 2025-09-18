import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  LogOut,
  FileText,
  Building2,
  Shield
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useSecurity } from "@/contexts/SecurityContext";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: ReactNode;
  currentView?: 'dashboard' | 'expedientes' | 'view' | 'editor' | 'agenda';
  onNavigate?: (view: 'dashboard' | 'expedientes' | 'agenda') => void;
  onCreateExpedient?: () => void;
}

export function Layout({ children, currentView = 'dashboard', onNavigate, onCreateExpedient }: LayoutProps) {
  const { user } = useUser();
  const { logout: securityLogout } = useSecurity();

  const handleLogout = () => {
    securityLogout(); // Clear SecurityContext - UserContext will clear automatically
  };

  if (!user) return null;

  const getProfileIcon = () => {
    switch (user.profile) {
      case 'mesa-entrada':
        return 'FileText';
      case 'oficina':
        return 'Building2';
      default:
        return 'Shield';
    }
  };

  const ProfileIcon = getProfileIcon() === 'FileText' ? FileText : 
                     getProfileIcon() === 'Building2' ? Building2 : Shield;

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Full Width Header */}
      <header className="bg-card border-b shadow-soft h-20 flex items-center justify-between px-6 w-full">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <img 
              src="/assets/logo-mpd.png" 
              alt="Logo MPD Tucumán" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="h-6 w-px bg-border"></div>
          <h1 className="text-xl font-bold text-foreground">
            MPD - Sistema de Expedientes
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Salir</span>
        </Button>
      </header>

      {/* Sidebar + Main Content */}
      <div className="flex flex-1 w-full">
        <AppSidebar 
          currentView={currentView}
          onNavigate={onNavigate}
          onCreateExpedient={onCreateExpedient}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}