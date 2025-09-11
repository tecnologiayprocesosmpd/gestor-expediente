import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, ArrowRight } from "lucide-react";
import { useUser, type UserProfile } from "@/contexts/UserContext";

const profiles = [
  {
    id: 'mesa-entrada' as UserProfile,
    title: 'Mesa de Entrada',
    role: 'mesa' as const,
    icon: FileText,
    bgClass: 'bg-gradient-primary'
  },
  {
    id: 'oficina' as UserProfile,
    title: 'Oficina',
    role: 'oficina' as const,
    icon: Building2,
    bgClass: 'bg-gradient-secondary'
  }
];

export function ProfileSelector() {
  const { setUser } = useUser();

  const handleSelectProfile = (profile: UserProfile) => {
    const selectedProfile = profiles.find(p => p.id === profile);
    if (selectedProfile) {
      setUser({
        profile,
        role: selectedProfile.role,
        name: `Usuario ${selectedProfile.title}`,
        department: selectedProfile.title
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            SAE MPD - Sistema de Administración de Expedientes
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Ministerio Pupilar y de la Defensa - San Miguel de Tucumán
          </p>
          <p className="text-lg text-muted-foreground">
            Seleccione su perfil para acceder al sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {profiles.map((profile) => {
            const Icon = profile.icon;
            return (
              <Card 
                key={profile.id}
                className="group hover:shadow-medium transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
                onClick={() => handleSelectProfile(profile.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 mx-auto rounded-2xl ${profile.bgClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-xl text-foreground">
                    {profile.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                  >
                    Ingresar como {profile.title}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}