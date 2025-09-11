import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  FileText, 
  Calendar,
  Download,
  TrendingUp,
  Users,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { Reporte, EstadisticaExpedientes, EstadisticaLegajos } from "@/types/reporte";

// Mock data para estadísticas
const mockEstadisticasExpedientes: EstadisticaExpedientes = {
  totalExpedientes: 127,
  expedientesPorEstado: [
    { estado: 'Activos', cantidad: 45 },
    { estado: 'Borradores', cantidad: 23 },
    { estado: 'Cerrados', cantidad: 39 },
    { estado: 'Archivados', cantidad: 20 }
  ],
  expedientesPorPrioridad: [
    { prioridad: 'Alta', cantidad: 15 },
    { prioridad: 'Media', cantidad: 67 },
    { prioridad: 'Baja', cantidad: 45 }
  ],
  expedientesPorDepartamento: [
    { departamento: 'Mesa de Entrada', cantidad: 42 },
    { departamento: 'Defensoría Penal', cantidad: 35 },
    { departamento: 'Defensoría Civil', cantidad: 28 },
    { departamento: 'Secretaría General', cantidad: 22 }
  ],
  tendenciaMensual: [
    { mes: 'Ene', cantidad: 18 },
    { mes: 'Feb', cantidad: 22 },
    { mes: 'Mar', cantidad: 25 },
    { mes: 'Abr', cantidad: 19 },
    { mes: 'May', cantidad: 31 },
    { mes: 'Jun', cantidad: 12 }
  ]
};

const mockEstadisticasLegajos: EstadisticaLegajos = {
  totalEmpleados: 86,
  empleadosPorDepartamento: [
    { departamento: 'Defensoría Penal', cantidad: 28 },
    { departamento: 'Defensoría Civil', cantidad: 24 },
    { departamento: 'Secretaría General', cantidad: 18 },
    { departamento: 'Mesa de Entrada', cantidad: 16 }
  ],
  empleadosPorEstado: [
    { estado: 'Activos', cantidad: 72 },
    { estado: 'En Licencia', cantidad: 8 },
    { estado: 'Suspendidos', cantidad: 4 },
    { estado: 'Cesantes', cantidad: 2 }
  ],
  licenciasPorTipo: [
    { tipo: 'Médicas', cantidad: 45 },
    { tipo: 'Vacaciones', cantidad: 38 },
    { tipo: 'Administrativas', cantidad: 12 },
    { tipo: 'Estudio', cantidad: 7 }
  ],
  sancionesPorTipo: [
    { tipo: 'Llamado Atención', cantidad: 15 },
    { tipo: 'Apercibimiento', cantidad: 8 },
    { tipo: 'Suspensión', cantidad: 3 },
    { tipo: 'Cesantía', cantidad: 1 }
  ]
};

interface ReportesManagerProps {
  onGenerateReport?: (params: any) => void;
}

export function ReportesManager({ onGenerateReport }: ReportesManagerProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  
  const expedientes = mockEstadisticasExpedientes;
  const legajos = mockEstadisticasLegajos;

  const handleGenerateReport = (tipo: string) => {
    const params = {
      tipo,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      departamento: departamentoSeleccionado === 'todos' ? undefined : departamentoSeleccionado || undefined
    };
    onGenerateReport?.(params);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes y Estadísticas</h1>
        <p className="text-muted-foreground">
          Panel de control y análisis de datos del MPD
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="expedientes">Expedientes</TabsTrigger>
          <TabsTrigger value="legajos">Legajos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Resumen General */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-primary text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Total Expedientes</CardTitle>
                <FileText className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expedientes.totalExpedientes}</div>
                <p className="text-xs text-white/70">Sistema completo</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-secondary text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Total Empleados</CardTitle>
                <Users className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{legajos.totalEmpleados}</div>
                <p className="text-xs text-white/70">Personal activo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expedientes Activos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {expedientes.expedientesPorEstado.find(e => e.estado === 'Activos')?.cantidad || 0}
                </div>
                <p className="text-xs text-muted-foreground">En proceso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {legajos.empleadosPorEstado.find(e => e.estado === 'Activos')?.cantidad || 0}
                </div>
                <p className="text-xs text-muted-foreground">En servicio</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Expedientes por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expedientes.expedientesPorEstado.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.estado}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${(item.cantidad / expedientes.totalExpedientes) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{item.cantidad}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Empleados por Departamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {legajos.empleadosPorDepartamento.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.departamento}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary rounded-full"
                            style={{ 
                              width: `${(item.cantidad / legajos.totalEmpleados) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{item.cantidad}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expedientes" className="space-y-6">
          {/* Filtros para Expedientes */}
          <Card>
            <CardHeader>
              <CardTitle>Generar Reporte de Expedientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
                  <Input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
                  <Input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Departamento</label>
                  <Select value={departamentoSeleccionado} onValueChange={setDepartamentoSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los departamentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="mesa-entrada">Mesa de Entrada</SelectItem>
                      <SelectItem value="defensoria-penal">Defensoría Penal</SelectItem>
                      <SelectItem value="defensoria-civil">Defensoría Civil</SelectItem>
                      <SelectItem value="secretaria">Secretaría General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => handleGenerateReport('expedientes')}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generar Reporte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas Detalladas de Expedientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Por Prioridad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expedientes.expedientesPorPrioridad.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="font-medium">{item.prioridad}</span>
                      <Badge variant="secondary">{item.cantidad}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expedientes.tendenciaMensual.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.mes} 2024</span>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{item.cantidad}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="legajos" className="space-y-6">
          {/* Generador de Reporte de Legajos */}
          <Card>
            <CardHeader>
              <CardTitle>Generar Reporte de Legajos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateReport('empleados-activos')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Users className="w-6 h-6" />
                  <span>Empleados Activos</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateReport('licencias')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Calendar className="w-6 h-6" />
                  <span>Reporte de Licencias</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateReport('sanciones')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <FileText className="w-6 h-6" />
                  <span>Historial de Sanciones</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas de Legajos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Licencias por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {legajos.licenciasPorTipo.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="font-medium">{item.tipo}</span>
                      <Badge variant="outline">{item.cantidad}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sanciones por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {legajos.sancionesPorTipo.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="font-medium">{item.tipo}</span>
                      <Badge variant="destructive">{item.cantidad}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}