import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Search,
  Eye,
  Edit,
  Briefcase,
  Calendar,
  AlertTriangle,
  Activity
} from "lucide-react";
import { EmpleadoLegajo, Designacion, Licencia, Sancion, HistorialClinico } from "@/types/legajo";
import { useUser } from "@/contexts/UserContext";

// Mock data
const mockEmpleados: EmpleadoLegajo[] = [
  {
    id: '1',
    dni: '12345678',
    apellido: 'González',
    nombre: 'María',
    email: 'maria.gonzalez@mpd.gov.ar',
    telefono: '381-1234567',
    fechaIngreso: new Date('2020-03-15'),
    cargo: 'Defensora Pública',
    departamento: 'Defensoría Penal',
    estado: 'activo',
    designaciones: [],
    licencias: [],
    sanciones: [],
    historialClinico: [],
    createdAt: new Date('2020-03-15'),
    updatedAt: new Date()
  },
  {
    id: '2',
    dni: '87654321',
    apellido: 'López',
    nombre: 'Carlos',
    email: 'carlos.lopez@mpd.gov.ar',
    fechaIngreso: new Date('2019-08-20'),
    cargo: 'Secretario Letrado',
    departamento: 'Secretaría General',
    estado: 'licencia',
    designaciones: [],
    licencias: [],
    sanciones: [],
    historialClinico: [],
    createdAt: new Date('2019-08-20'),
    updatedAt: new Date()
  }
];

interface LegajoManagerProps {
  onViewLegajo?: (id: string) => void;
  onEditLegajo?: (id: string) => void;
  onCreateLegajo?: () => void;
}

export function LegajoManager({
  onViewLegajo,
  onEditLegajo,
  onCreateLegajo
}: LegajoManagerProps) {
  const { user } = useUser();
  const [empleados] = useState<EmpleadoLegajo[]>(mockEmpleados);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('todos');

  const canEdit = true; // Ambos perfiles pueden editar

  const filteredEmpleados = empleados.filter(empleado => {
    const matchesSearch = 
      empleado.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.dni.includes(searchTerm) ||
      empleado.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = selectedEstado === 'todos' || empleado.estado === selectedEstado;
    
    return matchesSearch && matchesEstado;
  });

  const getEstadoBadge = (estado: EmpleadoLegajo['estado']) => {
    const config = {
      'activo': { variant: 'default' as const, label: 'Activo', icon: Activity },
      'licencia': { variant: 'secondary' as const, label: 'En Licencia', icon: Calendar },
      'suspendido': { variant: 'destructive' as const, label: 'Suspendido', icon: AlertTriangle },
      'cesante': { variant: 'outline' as const, label: 'Cesante', icon: AlertTriangle }
    };

    const { variant, label, icon: Icon } = config[estado];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const estadisticas = {
    total: empleados.length,
    activos: empleados.filter(e => e.estado === 'activo').length,
    enLicencia: empleados.filter(e => e.estado === 'licencia').length,
    suspendidos: empleados.filter(e => e.estado === 'suspendido').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Legajos</h1>
          <p className="text-muted-foreground">
            Administración de expedientes de personal del MPD
          </p>
        </div>
        {canEdit && (
          <Button onClick={onCreateLegajo}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Legajo
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.activos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Licencia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.enLicencia}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.suspendidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, apellido, DNI o cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['todos', 'activo', 'licencia', 'suspendido'].map((estado) => (
                <Button
                  key={estado}
                  variant={selectedEstado === estado ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedEstado(estado)}
                >
                  {estado === 'todos' ? 'Todos' : 
                   estado === 'activo' ? 'Activos' :
                   estado === 'licencia' ? 'En Licencia' : 'Suspendidos'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Empleados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Legajos de Personal</span>
            <Badge variant="secondary">{filteredEmpleados.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmpleados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No se encontraron empleados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmpleados.map((empleado) => (
                <div 
                  key={empleado.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:shadow-soft transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">
                        {empleado.apellido}, {empleado.nombre}
                      </span>
                      {getEstadoBadge(empleado.estado)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>DNI:</strong> {empleado.dni}</p>
                      <p><strong>Cargo:</strong> {empleado.cargo}</p>
                      <p><strong>Departamento:</strong> {empleado.departamento}</p>
                      <p><strong>Ingreso:</strong> {empleado.fechaIngreso.toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewLegajo?.(empleado.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    {canEdit && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onEditLegajo?.(empleado.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}