import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, Users, ArrowRight } from "lucide-react";
import { useUser, type UserProfile } from "@/contexts/UserContext";

const profiles = [
  {
    id: 'mesa-entrada' as UserProfile,
    title: 'Mesa de Entrada',
    description: 'Gestión integral de expedientes y comunicación con oficinas dependientes',
    role: 'mesa' as const,
    icon: FileText,
    features: ['Crear expedientes', 'Comunicación con oficinas', 'Gestión completa', 'Exportar a PDF'],
    bgClass: 'bg-gradient-primary'
  },
  {
    id: 'defensoria' as UserProfile,
    title: 'Defensoría',
    description: 'Visualización y seguimiento de expedientes asignados',
    role: 'oficina' as const,
    icon: Building2,
    features: ['Visualizar expedientes', 'Seguimiento de casos', 'Consulta de documentos', 'Solo lectura'],
    bgClass: 'bg-gradient-secondary'
  },
  {
    id: 'secretaria' as UserProfile,
    title: 'Secretaría',
    description: 'Acceso a expedientes para consulta y revisión',
    role: 'oficina' as const,
    icon: Users,
    features: ['Consultar expedientes', 'Revisión de documentos', 'Acceso restringido', 'Solo lectura'],
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
            Sistema de Gestión de Expedientes
          </h1>
          <p className="text-xl text-muted-foreground">
            Seleccione su perfil para acceder al sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <Badge variant="secondary" className="w-fit mx-auto">
                    {profile.role === 'mesa' ? 'Gestión Completa' : 'Solo Lectura'}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {profile.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {profile.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>

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
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Sistema desarrollado para la gestión eficiente de documentos y expedientes
          </p>
        </div>
      </div>
    </div>
  );
}