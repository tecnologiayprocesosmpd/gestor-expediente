import { ReactNode, useEffect, useRef } from 'react';
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
  currentView?: 'dashboard' | 'expedientes' | 'view' | 'editor' | 'agenda' | 'oficios';
  onNavigate?: (view: 'dashboard' | 'expedientes' | 'agenda' | 'oficios') => void;
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

export function Layout({ 
  children, 
  currentView = 'dashboard', 
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
}: LayoutProps) {
  const { user } = useUser();
  const { logout: securityLogout } = useSecurity();
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Reset scroll to top when view changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [currentView]);

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
    <div className="flex flex-col w-full">
      {/* Full Width Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-soft h-20 flex items-center justify-between px-6 w-full">
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
      <div className="flex w-full h-[calc(100vh-5rem)]">
        <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <AppSidebar 
            currentView={currentView}
            onNavigate={onNavigate}
            onCreateExpedient={onCreateExpedient}
            isExpedientView={isExpedientView}
            onRadicacionInterna={onRadicacionInterna}
            onRegresarRadicacionInterna={onRegresarRadicacionInterna}
            onExportPDF={onExportPDF}
            onTramites={onTramites}
            onNuevaActuacion={onNuevaActuacion}
            onNavegar={onNavegar}
            onChangeStatus={onChangeStatus}
            onOficio={onOficio}
            showRegresarRadicacionInterna={showRegresarRadicacionInterna}
          />
        </div>
        
        <div ref={mainContentRef} className="flex-1 flex flex-col min-w-0 overflow-y-auto h-[calc(100vh-5rem)]">
          {/* Main Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}