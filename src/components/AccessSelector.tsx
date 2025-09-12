import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  Users, 
  Archive,
  Shield,
  Clock,
  ArrowRight
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const accessAreas = {
  'mesa-entrada': [
    {
      id: 'expedientes',
      title: 'Gestión de Expedientes',
      description: 'Crear, modificar y administrar expedientes',
      icon: FileText,
      permissions: ['create_expedient', 'edit_expedient', 'view_expedient'],
      bgClass: 'bg-gradient-primary'
    },
    {
      id: 'ingreso-tramites',
      title: 'Ingreso de Trámites',
      description: 'Registrar nuevos trámites y solicitudes',
      icon: FolderOpen,
      permissions: ['create_tramite'],
      bgClass: 'bg-gradient-secondary'
    },
    {
      id: 'reportes',
      title: 'Reportes y Estadísticas',
      description: 'Generar reportes de actividad y estadísticas',
      icon: BarChart3,
      permissions: ['view_reports'],
      bgClass: 'bg-gradient-accent'
    }
  ],
  'oficina': [
    {
      id: 'expedientes',
      title: 'Consulta de Expedientes',
      description: 'Consultar y realizar seguimiento de expedientes',
      icon: FileText,
      permissions: ['view_expedient'],
      bgClass: 'bg-gradient-primary'
    },
    {
      id: 'actuaciones',
      title: 'Gestión de Actuaciones',
      description: 'Crear y administrar actuaciones procesales',
      icon: Archive,
      permissions: ['create_actuacion', 'edit_actuacion'],
      bgClass: 'bg-gradient-secondary'
    },
    {
      id: 'legajos',
      title: 'Administración de Legajos',
      description: 'Gestionar legajos personales y profesionales',
      icon: Users,
      permissions: ['view_legajo', 'edit_legajo'],
      bgClass: 'bg-gradient-accent'
    },
    {
      id: 'reportes',
      title: 'Reportes Especializados',
      description: 'Generar reportes específicos de área',
      icon: BarChart3,
      permissions: ['view_reports'],
      bgClass: 'bg-gradient-subtle'
    }
  ]
};

interface AccessSelectorProps {
  onSelectAccess: (areaId: string) => void;
}

export function AccessSelector({ onSelectAccess }: AccessSelectorProps) {
  const { user, logout } = useUser();

  if (!user) return null;

  const userAreas = accessAreas[user.profile] || [];

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Bienvenido al Sistema MPD
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-xl text-muted-foreground">
              {user.name}
            </p>
            <Badge variant="secondary" className="text-sm">
              {user.department}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Seleccione el área a la que desea acceder
          </p>
        </div>

        {/* User Info Bar */}
        <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Sesión activa desde</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date().toLocaleTimeString('es-AR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={logout}
            className="text-sm"
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Access Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAreas.map((area) => {
            const Icon = area.icon;
            return (
              <Card 
                key={area.id}
                className="group hover:shadow-medium transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 overflow-hidden"
                onClick={() => onSelectAccess(area.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${area.bgClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                    {area.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {area.description}
                  </p>
                  
                  {/* Permissions Preview */}
                  <div className="flex flex-wrap gap-1 justify-center">
                    {area.permissions.slice(0, 2).map((permission) => (
                      <Badge 
                        key={permission} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {permission.replace('_', ' ')}
                      </Badge>
                    ))}
                    {area.permissions.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{area.permissions.length - 2} más
                      </Badge>
                    )}
                  </div>

                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                  >
                    Acceder al Área
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Acciones rápidas disponibles para su perfil
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {user.role === 'mesa' && (
              <>
                <Badge variant="secondary" className="text-xs">
                  Crear Expedientes
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Registrar Trámites
                </Badge>
              </>
            )}
            {user.role === 'oficina' && (
              <>
                <Badge variant="secondary" className="text-xs">
                  Consultar Expedientes
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Crear Actuaciones
                </Badge>
              </>
            )}
            <Badge variant="secondary" className="text-xs">
              Generar Reportes
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}