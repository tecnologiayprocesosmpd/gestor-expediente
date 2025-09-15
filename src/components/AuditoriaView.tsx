import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  FileText,
  TrendingUp,
  Calendar
} from "lucide-react";

export function AuditoriaView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('mes-actual');
  const [selectedArea, setSelectedArea] = useState('todas');

  // Mock data para auditoría
  const auditoriaData = {
    estadisticas: {
      expedientesCreados: 156,
      expedientesCerrados: 98,
      actuacionesPendientes: 23,
      tiempoPromedioResolucion: 14.5, // días
      cumplimientoPlazos: 87, // porcentaje
      usuariosActivos: 12
    },
    actividadReciente: [
      {
        id: 'aud-001',
        fecha: new Date('2024-01-30T10:30:00'),
        usuario: 'Dr. María González',
        accion: 'Creación de expediente',
        detalle: 'EXP-2024-008 - Amparo contra Resolución',
        tipo: 'creacion',
        expediente: 'EXP-2024-008'
      },
      {
        id: 'aud-002',
        fecha: new Date('2024-01-30T09:15:00'),
        usuario: 'Dra. Ana Martínez',
        accion: 'Firma de actuación',
        detalle: 'Actuación Nº 3 - EXP-2024-003',
        tipo: 'firma',
        expediente: 'EXP-2024-003'
      },
      {
        id: 'aud-003',
        fecha: new Date('2024-01-30T08:45:00'),
        usuario: 'Dr. Carlos López',
        accion: 'Derivación de expediente', 
        detalle: 'EXP-2024-006 derivado a Defensoría Civil',
        tipo: 'derivacion',
        expediente: 'EXP-2024-006'
      },
      {
        id: 'aud-004',
        fecha: new Date('2024-01-29T16:20:00'),
        usuario: 'Dra. Laura Pérez',
        accion: 'Modificación de expediente',
        detalle: 'Actualización de datos - EXP-2024-005',
        tipo: 'modificacion', 
        expediente: 'EXP-2024-005'
      }
    ],
    alertas: [
      {
        id: 'alert-001',
        tipo: 'plazo-vencido',
        titulo: 'Plazo vencido - EXP-2024-002',
        descripcion: 'El expediente tiene actuaciones vencidas hace 3 días',
        fecha: new Date('2024-01-27'),
        prioridad: 'alta'
      },
      {
        id: 'alert-002',
        tipo: 'sin-actividad',
        titulo: 'Expediente sin actividad - EXP-2024-004',
        descripcion: 'No ha tenido movimientos en los últimos 15 días',
        fecha: new Date('2024-01-15'),
        prioridad: 'media'
      }
    ],
    rendimiento: {
      porOficina: [
        { oficina: 'Mesa de Entrada', expedientes: 45, actuaciones: 120, promedioDias: 12.3 },
        { oficina: 'Defensoría Penal', expedientes: 32, actuaciones: 89, promedioDias: 18.7 },
        { oficina: 'Defensoría Civil', expedientes: 28, actuaciones: 67, promedioDias: 15.2 },
        { oficina: 'Secretaría General', expedientes: 51, actuaciones: 134, promedioDias: 11.8 }
      ],
      porUsuario: [
        { usuario: 'Dr. María González', expedientes: 23, actuaciones: 45, cumplimiento: 92 },
        { usuario: 'Dra. Ana Martínez', expedientes: 19, actuaciones: 38, cumplimiento: 89 },
        { usuario: 'Dr. Carlos López', expedientes: 16, actuaciones: 32, cumplimiento: 85 },
        { usuario: 'Dra. Laura Pérez', expedientes: 18, actuaciones: 39, cumplimiento: 94 }
      ]
    }
  };

  const getAccionIcon = (tipo: string) => {
    switch (tipo) {
      case 'creacion':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'firma':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'derivacion':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'modificacion':
        return <Eye className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertBadge = (prioridad: string) => {
    const variants = {
      alta: 'destructive',
      media: 'secondary',
      baja: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[prioridad as keyof typeof variants] || 'outline'}>
        {prioridad === 'alta' && <AlertTriangle className="w-3 h-3 mr-1" />}
        {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Auditoría del Sistema</h1>
          <p className="text-muted-foreground">Monitoreo y seguimiento de la actividad del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, expediente o acción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes-actual">Mes Actual</SelectItem>
                <SelectItem value="ultima-semana">Última Semana</SelectItem>
                <SelectItem value="ultimo-trimestre">Último Trimestre</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las Áreas</SelectItem>
                <SelectItem value="mesa-entrada">Mesa de Entrada</SelectItem>
                <SelectItem value="defensoria-penal">Defensoría Penal</SelectItem>
                <SelectItem value="defensoria-civil">Defensoría Civil</SelectItem>
                <SelectItem value="secretaria">Secretaría General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expedientes Creados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{auditoriaData.estadisticas.expedientesCreados}</div>
            <p className="text-xs text-muted-foreground">Este período</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expedientes Cerrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{auditoriaData.estadisticas.expedientesCerrados}</div>
            <p className="text-xs text-muted-foreground">Este período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{auditoriaData.estadisticas.actuacionesPendientes}</div>
            <p className="text-xs text-muted-foreground">Actuaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{auditoriaData.estadisticas.tiempoPromedioResolucion}</div>
            <p className="text-xs text-muted-foreground">Días resolución</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{auditoriaData.estadisticas.cumplimientoPlazos}%</div>
            <p className="text-xs text-muted-foreground">De plazos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{auditoriaData.estadisticas.usuariosActivos}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="actividad" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="actividad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditoriaData.actividadReciente.map((actividad) => (
                  <div key={actividad.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getAccionIcon(actividad.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{actividad.usuario}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {actividad.fecha.toLocaleString('es-ES')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{actividad.accion}</p>
                      <p className="text-sm text-muted-foreground">{actividad.detalle}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertas y Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditoriaData.alertas.map((alerta) => (
                  <div key={alerta.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{alerta.titulo}</h4>
                          {getAlertBadge(alerta.prioridad)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alerta.descripcion}</p>
                        <p className="text-xs text-muted-foreground">
                          {alerta.fecha.toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rendimiento" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Oficina</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditoriaData.rendimiento.porOficina.map((oficina, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{oficina.oficina}</span>
                        <span className="text-xs text-muted-foreground">{oficina.promedioDias} días promedio</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span>{oficina.expedientes} expedientes</span>
                        <span>{oficina.actuaciones} actuaciones</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditoriaData.rendimiento.porUsuario.map((usuario, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{usuario.usuario}</span>
                        <Badge variant={usuario.cumplimiento >= 90 ? 'default' : 'secondary'}>
                          {usuario.cumplimiento}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span>{usuario.expedientes} expedientes</span>
                        <span>{usuario.actuaciones} actuaciones</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reportes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Reporte Mensual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Resumen completo de la actividad del mes actual
                </p>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Generar PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Análisis de Tendencias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Análisis de tendencias y patrones de trabajo
                </p>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Generar Análisis
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Productividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Reporte de productividad por usuario y oficina
                </p>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Generar Reporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}