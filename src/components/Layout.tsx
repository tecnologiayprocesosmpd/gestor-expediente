import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  LogOut
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useSecurity } from "@/contexts/SecurityContext";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: ReactNode;
  currentView?: 'dashboard' | 'expedientes' | 'view' | 'editor' | 'agenda';
  onNavigate?: (view: 'dashboard' | 'expedientes' | 'view' | 'editor' | 'agenda') => void;
  onCreateExpedient?: () => void;
}

export function Layout({ children, currentView = 'dashboard', onNavigate, onCreateExpedient }: LayoutProps) {
  const { user } = useUser();
  const { logout: securityLogout } = useSecurity();

  const handleLogout = () => {
    securityLogout(); // Clear SecurityContext - UserContext will clear automatically
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar 
        currentView={currentView}
        onNavigate={onNavigate}
        onCreateExpedient={onCreateExpedient}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b shadow-soft h-20 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
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

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}