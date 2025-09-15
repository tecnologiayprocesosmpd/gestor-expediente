import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  Calendar as CalendarIcon,
  Filter,
  History,
  FileCheck,
  UsersIcon,
  Activity,
  Archive,
  Clipboard,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AuditoriaView() {
  const [activeSection, setActiveSection] = useState('calendario');
  const [fechaDesde, setFechaDesde] = useState<Date>();
  const [fechaHasta, setFechaHasta] = useState<Date>();
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const secciones = [
    { id: 'calendario', label: 'Calendario de Búsqueda', icon: CalendarIcon },
    { id: 'historia', label: 'Historia', icon: History },
    { id: 'diligencia', label: 'Diligencia', icon: FileCheck },
    { id: 'justiciables', label: 'Control de Justiciables', icon: UsersIcon },
    { id: 'movimientos', label: 'Movimientos Diarios', icon: Activity },
    { id: 'estados', label: 'Estado de Expedientes', icon: Archive },
    { id: 'agenda', label: 'Movimientos de Agenda', icon: Clipboard },
    { id: 'tramites', label: 'Trámites', icon: FileText },
    { id: 'diligenciamientos', label: 'Diligenciamientos sin Envío', icon: Send }
  ];

  const estadosExpediente = [
    'todos', 'tramite', 'archivado', 'paralizado', 'elevado', 'urgente', 
    'habilitado', 'habilitado elecciones provinciales', 'reconocido', 'caduco', 
    'extinto', 'fusionado', 'rehabilitado', 'eliminado ley 9111'
  ];

  const tiposDiligencia = [
    'todos', 'citacion', 'notificacion', 'embargo', 'inspeccion', 'pericia', 'otros'
  ];

  const motivosAgenda = [
    'todos', 'toma de muestra', 'audiencia', 'vencimientos', 'cumpleanos', 
    'nota', 'evaluacion medica', 'vencido', 'plazos del pago de sentencia'
  ];

  const estadosAgenda = ['todos', 'pendiente', 'finalizado', 'suspendido'];

  const DateRangePicker = ({ 
    fechaDesde, 
    fechaHasta, 
    onFechaDesdeChange, 
    onFechaHastaChange,
    placeholder = "Seleccionar rango de fechas"
  }: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    onFechaDesdeChange: (date: Date | undefined) => void;
    onFechaHastaChange: (date: Date | undefined) => void;
    placeholder?: string;
  }) => (
    <div className="flex gap-2 items-center">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Desde</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !fechaDesde && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fechaDesde ? format(fechaDesde, "dd/MM/yyyy") : "Desde"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fechaDesde}
              onSelect={onFechaDesdeChange}
              locale={es}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Hasta</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !fechaHasta && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fechaHasta ? format(fechaHasta, "dd/MM/yyyy") : "Hasta"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fechaHasta}
              onSelect={onFechaHastaChange}
              locale={es}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sistema de Auditoría</h1>
          <p className="text-muted-foreground">Panel de control y búsqueda avanzada</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Navigation Menu */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {secciones.map((seccion) => {
              const Icon = seccion.icon;
              return (
                <Button
                  key={seccion.id}
                  variant={activeSection === seccion.id ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col gap-2"
                  onClick={() => setActiveSection(seccion.id)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs text-center">{seccion.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Search - Main View */}
      {activeSection === 'calendario' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendario de Búsqueda Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateRangePicker
              fechaDesde={fechaDesde}
              fechaHasta={fechaHasta}
              onFechaDesdeChange={setFechaDesde}
              onFechaHastaChange={setFechaHasta}
            />
            <div className="flex gap-2">
              <Button className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avanzados
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historia Section */}
      {activeSection === 'historia' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historia del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <DateRangePicker
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                onFechaDesdeChange={setFechaDesde}
                onFechaHastaChange={setFechaHasta}
              />
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="para-firmar">Para Firmar</SelectItem>
                  <SelectItem value="firmado">Firmado</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Buscar Historia
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diligencia Section */}
      {activeSection === 'diligencia' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Control de Diligencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Fecha de Salida</h4>
                <DateRangePicker
                  fechaDesde={fechaDesde}
                  fechaHasta={fechaHasta}
                  onFechaDesdeChange={setFechaDesde}
                  onFechaHastaChange={setFechaHasta}
                />
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Fecha de Regreso</h4>
                <DateRangePicker
                  fechaDesde={fechaDesde}
                  fechaHasta={fechaHasta}
                  onFechaDesdeChange={setFechaDesde}
                  onFechaHastaChange={setFechaHasta}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tipo de Diligencia" />
                </SelectTrigger>
                <SelectContent>
                  {tiposDiligencia.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Buscar Diligencias
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control de Justiciables */}
      {activeSection === 'justiciables' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              Control de Justiciables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {['Sin partes', '1 parte', '2 partes', '3 partes', '4 partes', '5+ partes'].map((filtro, index) => (
                <Button key={index} variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{index === 0 ? '0' : index === 5 ? '5+' : index}</div>
                    <div className="text-xs">Procesos</div>
                  </div>
                </Button>
              ))}
            </div>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Filtrar por Partes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Movimientos Diarios */}
      {activeSection === 'movimientos' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Movimientos Diarios de Expedientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Principal', 
                'Incidente', 
                'Cuaderno de pruebas ACTOR', 
                'Cuaderno de pruebas DEMANDADO',
                'Cuaderno de pruebas CODEMANDADO',
                'Queja'
              ].map((tipo, index) => (
                <Button key={index} variant="outline" className="justify-start">
                  {tipo}
                </Button>
              ))}
            </div>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Ver Movimientos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Estados de Expedientes */}
      {activeSection === 'estados' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Estados de Expedientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {estadosExpediente.map((estado) => (
                <Button key={estado} variant="outline" className="justify-start text-xs">
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </Button>
              ))}
            </div>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Filtrar por Estado
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Movimientos de Agenda */}
      {activeSection === 'agenda' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="w-5 h-5" />
              Movimientos de Agenda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateRangePicker
              fechaDesde={fechaDesde}
              fechaHasta={fechaHasta}
              onFechaDesdeChange={setFechaDesde}
              onFechaHastaChange={setFechaHasta}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Motivo" />
                </SelectTrigger>
                <SelectContent>
                  {motivosAgenda.map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo.charAt(0).toUpperCase() + motivo.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosAgenda.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Buscar en Agenda
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trámites */}
      {activeSection === 'tramites' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Trámites con Movimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateRangePicker
              fechaDesde={fechaDesde}
              fechaHasta={fechaHasta}
              onFechaDesdeChange={setFechaDesde}
              onFechaHastaChange={setFechaHasta}
            />
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Buscar Trámites
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Diligenciamientos sin Envío */}
      {activeSection === 'diligenciamientos' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Diligenciamientos sin Fecha de Envío
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateRangePicker
              fechaDesde={fechaDesde}
              fechaHasta={fechaHasta}
              onFechaDesdeChange={setFechaDesde}
              onFechaHastaChange={setFechaHasta}
            />
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Ver Diligenciamientos Pendientes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}