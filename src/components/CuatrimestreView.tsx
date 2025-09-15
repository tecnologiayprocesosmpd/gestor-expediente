import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  FileText,
  Users,
  Clock,
  Target,
  Download,
  Filter
} from "lucide-react";

export function CuatrimestreView() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedCuatrimestre, setSelectedCuatrimestre] = useState('1');

  // Mock data para el primer cuatrimestre
  const cuatrimestreData = {
    resumen: {
      periodo: 'Enero - Abril 2024',
      expedientesTotales: 423,
      expedientesCerrados: 287,
      expedientesPendientes: 136,
      promedioResolucion: 18.3, // días
      cumplimientoMetas: 78, // porcentaje
      usuariosActivos: 15
    },
    metas: {
      expedientesObjetivo: 400,
      tiempoObjetivo: 15, // días
      cumplimientoObjetivo: 85, // porcentaje
      satisfaccionObjetivo: 90 // porcentaje
    },
    evolucionMensual: [
      { mes: 'Enero', expedientes: 98, cerrados: 67, promedioDias: 19.2, cumplimiento: 72 },
      { mes: 'Febrero', expedientes: 112, cerrados: 89, promedioDias: 17.8, cumplimiento: 79 },
      { mes: 'Marzo', expedientes: 105, cerrados: 78, promedioDias: 18.1, cumplimiento: 76 },
      { mes: 'Abril', expedientes: 108, cerrados: 53, promedioDias: 17.9, cumplimiento: 82 }
    ],
    indicadoresClave: {
      eficiencia: 74.2, // expedientes cerrados / expedientes totales * 100
      productividad: 28.2, // expedientes por usuario
      calidad: 91.5, // satisfacción cliente
      puntualidad: 78.3 // cumplimiento plazos
    },
    comparativoAnterior: {
      expedientes: { actual: 423, anterior: 389, cambio: 8.7 },
      tiempoPromedio: { actual: 18.3, anterior: 21.2, cambio: -13.7 },
      cumplimiento: { actual: 78, anterior: 71, cambio: 9.9 }
    },
    porArea: [
      { 
        area: 'Mesa de Entrada',
        expedientes: 156,
        cerrados: 108,
        promedioDias: 16.2,
        eficiencia: 69.2,
        equipo: 4
      },
      {
        area: 'Defensoría Penal', 
        expedientes: 89,
        cerrados: 67,
        promedioDias: 22.1,
        eficiencia: 75.3,
        equipo: 3
      },
      {
        area: 'Defensoría Civil',
        expedientes: 98,
        cerrados: 72,
        promedioDias: 19.8,
        eficiencia: 73.5,
        equipo: 4
      },
      {
        area: 'Secretaría General',
        expedientes: 80,
        cerrados: 40,
        promedioDias: 14.5,
        eficiencia: 50.0,
        equipo: 4
      }
    ],
    topUsuarios: [
      { usuario: 'Dra. Ana Martínez', expedientes: 45, promedio: 15.2, calificacion: 96 },
      { usuario: 'Dr. María González', expedientes: 42, promedio: 16.8, calificacion: 94 },
      { usuario: 'Dr. Carlos López', expedientes: 38, promedio: 19.1, calificacion: 89 },
      { usuario: 'Dra. Laura Pérez', expedientes: 35, promedio: 17.5, calificacion: 92 }
    ]
  };

  const getTrendIcon = (cambio: number) => {
    if (cambio > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (cambio < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (cambio: number) => {
    if (cambio > 0) return 'text-green-600';
    if (cambio < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reporte 1er Cuatrimestre</h1>
          <p className="text-muted-foreground">Análisis detallado del rendimiento del {cuatrimestreData.resumen.periodo}</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCuatrimestre} onValueChange={setSelectedCuatrimestre}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Cuatrimestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1er Cuatrimestre</SelectItem>
              <SelectItem value="2">2do Cuatrimestre</SelectItem>
              <SelectItem value="3">3er Cuatrimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Resumen del Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Expedientes:</span>
              <span className="font-semibold">{cuatrimestreData.resumen.expedientesTotales}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cerrados:</span>
              <span className="font-semibold text-green-600">{cuatrimestreData.resumen.expedientesCerrados}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pendientes:</span>
              <span className="font-semibold text-orange-600">{cuatrimestreData.resumen.expedientesPendientes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tiempo Promedio:</span>
              <span className="font-semibold">{cuatrimestreData.resumen.promedioResolucion} días</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Meta Expedientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-xl font-bold">{cuatrimestreData.resumen.expedientesTotales}</div>
              <Progress 
                value={(cuatrimestreData.resumen.expedientesTotales / cuatrimestreData.metas.expedientesObjetivo) * 100}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                Meta: {cuatrimestreData.metas.expedientesObjetivo}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Eficiencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-xl font-bold">{cuatrimestreData.indicadoresClave.eficiencia}%</div>
              <Progress 
                value={cuatrimestreData.indicadoresClave.eficiencia}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                Expedientes cerrados
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Calidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-xl font-bold text-green-600">{cuatrimestreData.indicadoresClave.calidad}%</div>
              <Progress 
                value={cuatrimestreData.indicadoresClave.calidad}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                Satisfacción
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Puntualidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-xl font-bold text-blue-600">{cuatrimestreData.indicadoresClave.puntualidad}%</div>
              <Progress 
                value={cuatrimestreData.indicadoresClave.puntualidad}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                Cumplimiento plazos
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparativo vs Período Anterior */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo vs Período Anterior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{cuatrimestreData.comparativoAnterior.expedientes.actual}</div>
              <div className="text-sm text-muted-foreground mb-2">Expedientes Totales</div>
              <div className={`flex items-center justify-center gap-1 text-sm ${getTrendColor(cuatrimestreData.comparativoAnterior.expedientes.cambio)}`}>
                {getTrendIcon(cuatrimestreData.comparativoAnterior.expedientes.cambio)}
                {Math.abs(cuatrimestreData.comparativoAnterior.expedientes.cambio)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{cuatrimestreData.comparativoAnterior.tiempoPromedio.actual}</div>
              <div className="text-sm text-muted-foreground mb-2">Días Promedio</div>
              <div className={`flex items-center justify-center gap-1 text-sm ${getTrendColor(cuatrimestreData.comparativoAnterior.tiempoPromedio.cambio)}`}>
                {getTrendIcon(cuatrimestreData.comparativoAnterior.tiempoPromedio.cambio)}
                {Math.abs(cuatrimestreData.comparativoAnterior.tiempoPromedio.cambio)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{cuatrimestreData.comparativoAnterior.cumplimiento.actual}%</div>
              <div className="text-sm text-muted-foreground mb-2">Cumplimiento</div>
              <div className={`flex items-center justify-center gap-1 text-sm ${getTrendColor(cuatrimestreData.comparativoAnterior.cumplimiento.cambio)}`}>
                {getTrendIcon(cuatrimestreData.comparativoAnterior.cumplimiento.cambio)}
                {Math.abs(cuatrimestreData.comparativoAnterior.cumplimiento.cambio)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para análisis detallado */}
      <Tabs defaultValue="evolucion" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evolucion">Evolución Mensual</TabsTrigger>
          <TabsTrigger value="areas">Por Área</TabsTrigger>
          <TabsTrigger value="usuarios">Top Usuarios</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores KPI</TabsTrigger>
        </TabsList>

        <TabsContent value="evolucion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución Mensual del Cuatrimestre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cuatrimestreData.evolucionMensual.map((mes, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{mes.mes}</h3>
                      <Badge variant={mes.cumplimiento >= 80 ? 'default' : 'secondary'}>
                        {mes.cumplimiento}% Cumplimiento
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Expedientes</div>
                        <div className="font-semibold text-lg">{mes.expedientes}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Cerrados</div>
                        <div className="font-semibold text-lg text-green-600">{mes.cerrados}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Promedio Días</div>
                        <div className="font-semibold text-lg">{mes.promedioDias}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Eficiencia</div>
                        <div className="font-semibold text-lg">{((mes.cerrados / mes.expedientes) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Área</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cuatrimestreData.porArea.map((area, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{area.area}</h3>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{area.equipo} miembros</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Expedientes</div>
                        <div className="font-semibold text-lg">{area.expedientes}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Cerrados</div>
                        <div className="font-semibold text-lg text-green-600">{area.cerrados}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Promedio Días</div>
                        <div className="font-semibold text-lg">{area.promedioDias}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Eficiencia</div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-lg">{area.eficiencia}%</div>
                          <Progress value={area.eficiencia} className="w-20 h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Usuarios del Cuatrimestre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cuatrimestreData.topUsuarios.map((usuario, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                        <h3 className="font-semibold">{usuario.usuario}</h3>
                      </div>
                      <Badge variant={usuario.calificacion >= 90 ? 'default' : 'secondary'}>
                        {usuario.calificacion}% Calidad
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Expedientes</div>
                        <div className="font-semibold text-lg">{usuario.expedientes}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Promedio Días</div>
                        <div className="font-semibold text-lg">{usuario.promedio}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Productividad</div>
                        <div className="font-semibold text-lg">{(usuario.expedientes / 4).toFixed(1)}/mes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicadores" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Clave de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Eficiencia Operacional</span>
                    <span className="text-sm font-semibold">{cuatrimestreData.indicadoresClave.eficiencia}%</span>
                  </div>
                  <Progress value={cuatrimestreData.indicadoresClave.eficiencia} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Productividad</span>
                    <span className="text-sm font-semibold">{cuatrimestreData.indicadoresClave.productividad}</span>
                  </div>
                  <Progress value={(cuatrimestreData.indicadoresClave.productividad / 40) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Calidad del Servicio</span>
                    <span className="text-sm font-semibold">{cuatrimestreData.indicadoresClave.calidad}%</span>
                  </div>
                  <Progress value={cuatrimestreData.indicadoresClave.calidad} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Puntualidad</span>
                    <span className="text-sm font-semibold">{cuatrimestreData.indicadoresClave.puntualidad}%</span>
                  </div>
                  <Progress value={cuatrimestreData.indicadoresClave.puntualidad} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metas vs Resultados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Expedientes</span>
                    <span className="text-sm">
                      {cuatrimestreData.resumen.expedientesTotales} / {cuatrimestreData.metas.expedientesObjetivo}
                    </span>
                  </div>
                  <Progress 
                    value={(cuatrimestreData.resumen.expedientesTotales / cuatrimestreData.metas.expedientesObjetivo) * 100} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tiempo Promedio</span>
                    <span className="text-sm">
                      {cuatrimestreData.resumen.promedioResolucion} / {cuatrimestreData.metas.tiempoObjetivo} días
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - ((cuatrimestreData.resumen.promedioResolucion - cuatrimestreData.metas.tiempoObjetivo) / cuatrimestreData.metas.tiempoObjetivo) * 100)} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cumplimiento</span>
                    <span className="text-sm">
                      {cuatrimestreData.resumen.cumplimientoMetas}% / {cuatrimestreData.metas.cumplimientoObjetivo}%
                    </span>
                  </div>
                  <Progress 
                    value={(cuatrimestreData.resumen.cumplimientoMetas / cuatrimestreData.metas.cumplimientoObjetivo) * 100} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Satisfacción</span>
                    <span className="text-sm">
                      {cuatrimestreData.indicadoresClave.calidad}% / {cuatrimestreData.metas.satisfaccionObjetivo}%
                    </span>
                  </div>
                  <Progress 
                    value={(cuatrimestreData.indicadoresClave.calidad / cuatrimestreData.metas.satisfaccionObjetivo) * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}