import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Calendar
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ExpedientSummary } from "@/types/expedient";
import { agendaStorage, fechasCitacionStorage } from "@/utils/agendaStorage";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardProps {
  expedients: ExpedientSummary[];
  onCreateExpedient?: () => void;
  onViewExpedient?: (id: string) => void;
  onEditExpedient?: (id: string) => void;
  onNavigateToExpedients?: () => void;
  onNavigateToActuaciones?: () => void;
  onCreateActuacion?: () => void;
  onFilterExpedients?: (status: string) => void;
}

export function Dashboard({ 
  expedients = [], 
  onCreateExpedient, 
  onViewExpedient, 
  onEditExpedient,
  onNavigateToExpedients,
  onNavigateToActuaciones,
  onCreateActuacion,
  onFilterExpedients
}: DashboardProps) {
  const { user } = useUser();
  const [novedades, setNovedades] = useState<any[]>([]);

  if (!user) return null;

  // Cargar novedades de agenda
  useEffect(() => {
    const cargarNovedades = () => {
      const citas = agendaStorage.getCitas();
      const fechasCitacion = fechasCitacionStorage.getFechasCitacion();
      
      // Combinar y ordenar por fecha más reciente
      const todasNovedades = [
        ...citas.map(cita => ({
          id: cita.id,
          tipo: 'cita',
          titulo: cita.titulo,
          descripcion: cita.descripcion,
          fecha: cita.updatedAt || cita.createdAt,
          estado: cita.estado,
          expedientId: cita.expedientId
        })),
        ...fechasCitacion.map(fecha => ({
          id: fecha.id,
          tipo: 'citacion',
          titulo: `Citación programada - ${fecha.descripcion}`,
          descripcion: `Fecha: ${format(fecha.fecha, "dd 'de' MMMM, HH:mm 'hs'", { locale: es })}`,
          fecha: fecha.createdAt,
          estado: fecha.completada ? 'completada' : 'programada',
          expedientId: fecha.expedientId
        }))
      ];
      
      // Ordenar por fecha más reciente y tomar los primeros 5
      const novedadesOrdenadas = todasNovedades
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5);
      
      setNovedades(novedadesOrdenadas);
    };

    cargarNovedades();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarNovedades, 30000);
    return () => clearInterval(interval);
  }, []);

  const canEdit = user.role === 'mesa';
  
  // Para oficinas, solo mostrar expedientes asignados (mock - aquí filtrarías por oficina asignada)
  const filteredExpedients = user.role === 'oficina' 
    ? expedients.filter(e => e.status === 'en_tramite' || e.status === 'pausado') // Mock: asumimos que estos están asignados
    : expedients;
    
  const recentExpedients = filteredExpedients.slice(0, 5);
  
  const stats = {
    total: filteredExpedients.length,
    draft: filteredExpedients.filter(e => e.status === 'draft').length,
    en_tramite: filteredExpedients.filter(e => e.status === 'en_tramite').length,
    pausados: filteredExpedients.filter(e => e.status === 'pausado').length,
  };

  const getStatusBadge = (status: 'draft' | 'en_tramite' | 'pausado') => {
    const colors = {
      draft: 'bg-[hsl(var(--status-draft))] text-[hsl(var(--status-draft-foreground))] border-[hsl(var(--status-draft))]',
      en_tramite: 'bg-[hsl(var(--status-en-tramite))] text-[hsl(var(--status-en-tramite-foreground))] border-[hsl(var(--status-en-tramite))]',
      pausado: 'bg-[hsl(var(--status-pausado))] text-[hsl(var(--status-pausado-foreground))] border-[hsl(var(--status-pausado))]'
    };
    
    const labels = {
      draft: 'Borrador',
      en_tramite: 'En Trámite',
      pausado: 'Pausado'
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getStatusBorderClass = (status: 'draft' | 'en_tramite' | 'pausado') => {
    const borderColors = {
      draft: 'border-[hsl(var(--status-draft))]',
      en_tramite: 'border-[hsl(var(--status-en-tramite))]',
      pausado: 'border-[hsl(var(--status-pausado))]'
    };
    
    return borderColors[status];
  };

  return (
    <div className="space-y-6">
      {/* Funciones Principales - Solo para Mesa de Entrada */}
      {user.role === 'mesa' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
            onClick={() => onFilterExpedients?.('derivados')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-blue-900 mb-1">EXPEDIENTES</h3>
              <p className="text-xs text-blue-700">Para recibir</p>
              <Badge className="mt-2 bg-blue-600 text-white text-xs">Asignados</Badge>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
            onClick={() => {/* TODO: Navegación a oficios */}}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-blue-900 mb-1">OFICIOS</h3>
              <p className="text-xs text-blue-700">Gestión de oficios</p>
              <Badge className="mt-2 bg-blue-600 text-white text-xs">Disponible</Badge>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
            onClick={() => onNavigateToActuaciones?.()}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-blue-900 mb-1">ACTUACIONES</h3>
              <p className="text-xs text-blue-700">Para firmar</p>
              <Badge className="mt-2 bg-blue-600 text-white text-xs">Pendientes</Badge>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
            onClick={() => onCreateActuacion?.()}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-blue-900 mb-1">ACTUACIONES</h3>
              <p className="text-xs text-blue-700">Para agregar</p>
              <Badge className="mt-2 bg-blue-600 text-white text-xs">Crear nueva</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* NOVEDADES */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            NOVEDADES
          </CardTitle>
        </CardHeader>
        <CardContent>
          {novedades.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">No hay novedades recientes en la agenda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {novedades.map((novedad) => {
                const getBorderColor = (tipo: string, estado: string) => {
                  if (tipo === 'cita') {
                    switch (estado) {
                      case 'programada': return 'border-green-100';
                      case 'completada': return 'border-blue-100';
                      case 'cancelada': return 'border-red-100';
                      default: return 'border-gray-100';
                    }
                  } else {
                    return estado === 'completada' ? 'border-purple-100' : 'border-orange-100';
                  }
                };

                const getTextColor = (tipo: string, estado: string) => {
                  if (tipo === 'cita') {
                    switch (estado) {
                      case 'programada': return 'text-green-900';
                      case 'completada': return 'text-blue-900';
                      case 'cancelada': return 'text-red-900';
                      default: return 'text-gray-900';
                    }
                  } else {
                    return estado === 'completada' ? 'text-purple-900' : 'text-orange-900';
                  }
                };

                const getDescColor = (tipo: string, estado: string) => {
                  if (tipo === 'cita') {
                    switch (estado) {
                      case 'programada': return 'text-green-700';
                      case 'completada': return 'text-blue-700';
                      case 'cancelada': return 'text-red-700';
                      default: return 'text-gray-700';
                    }
                  } else {
                    return estado === 'completada' ? 'text-purple-700' : 'text-orange-700';
                  }
                };

                const getBadgeStyle = (tipo: string, estado: string) => {
                  if (tipo === 'cita') {
                    switch (estado) {
                      case 'programada': return 'border-green-300 text-green-700';
                      case 'completada': return 'border-blue-300 text-blue-700';
                      case 'cancelada': return 'border-red-300 text-red-700';
                      default: return 'border-gray-300 text-gray-700';
                    }
                  } else {
                    return estado === 'completada' ? 'border-purple-300 text-purple-700' : 'border-orange-300 text-orange-700';
                  }
                };

                const getEstadoLabel = (tipo: string, estado: string) => {
                  if (tipo === 'cita') {
                    switch (estado) {
                      case 'programada': return 'Programada';
                      case 'completada': return 'Completada';
                      case 'cancelada': return 'Cancelada';
                      default: return 'Pendiente';
                    }
                  } else {
                    return estado === 'completada' ? 'Completada' : 'Programada';
                  }
                };

                const timeAgo = (date: Date) => {
                  const now = new Date();
                  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                  
                  if (diffInHours < 1) return 'Hace menos de 1 hora';
                  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
                  
                  const diffInDays = Math.floor(diffInHours / 24);
                  if (diffInDays === 1) return 'Ayer';
                  if (diffInDays < 7) return `Hace ${diffInDays} días`;
                  
                  return format(date, "dd/MM/yyyy", { locale: es });
                };

                return (
                  <div key={novedad.id} className={`p-3 bg-white rounded-lg border ${getBorderColor(novedad.tipo, novedad.estado)}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-medium text-sm ${getTextColor(novedad.tipo, novedad.estado)}`}>
                          {novedad.titulo}
                        </h4>
                        <p className={`text-xs mt-1 ${getDescColor(novedad.tipo, novedad.estado)}`}>
                          {novedad.descripcion}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {timeAgo(new Date(novedad.fecha))}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getBadgeStyle(novedad.tipo, novedad.estado)}`}>
                        {getEstadoLabel(novedad.tipo, novedad.estado)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}