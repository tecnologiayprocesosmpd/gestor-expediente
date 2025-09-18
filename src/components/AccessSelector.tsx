import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  Users, 
  Archive,
  Shield,
  Clock,
  ChevronDown
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";

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
  const [selectedArea, setSelectedArea] = useState<string>('');

  if (!user) return null;

  const userAreas = accessAreas[user.profile] || [];

  const handleSelectChange = (value: string) => {
    setSelectedArea(value);
  };

  const handleAccess = () => {
    if (selectedArea) {
      onSelectAccess(selectedArea);
    }
  };

  const getSelectedAreaData = () => {
    return userAreas.find(area => area.id === selectedArea);
  };

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

        {/* Access Area Selector */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-medium">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Seleccionar Área de Acceso</CardTitle>
              <p className="text-muted-foreground">
                Elija el área del sistema a la que desea acceder
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dropdown Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Área disponible para su perfil:
                </label>
                <Select value={selectedArea} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full h-12 bg-background">
                    <SelectValue placeholder="Seleccione un área..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {userAreas.map((area) => {
                      const Icon = area.icon;
                      return (
                        <SelectItem 
                          key={area.id} 
                          value={area.id}
                          className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                        >
                          <div className="flex items-center gap-3 py-2">
                            <div className={`w-8 h-8 rounded-lg ${area.bgClass} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-foreground">
                                {area.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {area.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Area Preview */}
              {selectedArea && getSelectedAreaData() && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getSelectedAreaData()?.bgClass} flex items-center justify-center`}>
                      {(() => {
                        const selectedAreaData = getSelectedAreaData();
                        const Icon = selectedAreaData?.icon;
                        return Icon ? <Icon className="w-5 h-5 text-white" /> : null;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {getSelectedAreaData()?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getSelectedAreaData()?.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Permissions */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Permisos incluidos:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {getSelectedAreaData()?.permissions.map((permission) => (
                        <Badge 
                          key={permission} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Access Button */}
              <Button 
                onClick={handleAccess}
                disabled={!selectedArea}
                className="w-full h-12 bg-gradient-primary hover:bg-gradient-primary/90 disabled:opacity-50"
              >
                Acceder al Área Seleccionada
                <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Acciones rápidas disponibles para su perfil
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="text-xs">
              Crear Expedientes
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Registrar Trámites
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Consultar Expedientes
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Crear Actuaciones
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Generar Reportes
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}