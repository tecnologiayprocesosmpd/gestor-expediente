import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Calendar,
  PenTool,
  Bell
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ExpedientSummary } from "@/types/expedient";
import { agendaStorage, fechasCitacionStorage } from "@/utils/agendaStorage";
import { actuacionStorage } from "@/utils/actuacionStorage";
import { useState, useEffect } from "react";
import { ExpedientesParaRecibir } from "./ExpedientesParaRecibir";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardProps {
  expedients: ExpedientSummary[];
  onCreateExpedient?: () => void;
  onViewExpedient?: (id: string, createActuacion?: boolean) => void;
  onEditExpedient?: (id: string) => void;
  onNavigateToExpedients?: () => void;
  onCreateActuacion?: () => void;
  onFilterExpedients?: (status: string) => void;
  onRecibirExpediente?: (expedientId: string) => void;
  onNavigateToActuacionesParaFirma?: () => void;
  onNavigateToOficios?: () => void;
}

export function Dashboard({ 
  expedients = [], 
  onCreateExpedient, 
  onViewExpedient, 
  onEditExpedient,
  onNavigateToExpedients,
  onCreateActuacion,
  onFilterExpedients,
  onRecibirExpediente,
  onNavigateToActuacionesParaFirma,
  onNavigateToOficios
}: DashboardProps) {
  const { user } = useUser();
  const [novedades, setNovedades] = useState<any[]>([]);
  const [actuacionesParaFirma, setActuacionesParaFirma] = useState<number>(0);
  const [notificacionesActuaciones, setNotificacionesActuaciones] = useState<any[]>([]);
  const [showExpedientSelector, setShowExpedientSelector] = useState(false);
  const [showActuacionesParaFirma, setShowActuacionesParaFirma] = useState(false);
  const [actuacionesParaFirmaList, setActuacionesParaFirmaList] = useState<any[]>([]);

  if (!user) return null;

  // Cargar novedades de agenda y actuaciones
  useEffect(() => {
    const cargarNovedades = () => {
      const citas = agendaStorage.getCitas();
      const fechasCitacion = fechasCitacionStorage.getFechasCitacion();
      const notificacionesActuaciones = actuacionStorage.getNotifications();
      
      // Actualizar contador de actuaciones para firma
      const paraFirma = actuacionStorage.getActuacionesParaFirma();
      setActuacionesParaFirma(paraFirma.length);
      setActuacionesParaFirmaList(paraFirma);
      
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
        })),
        ...notificacionesActuaciones.map(notif => ({
          id: notif.id,
          tipo: 'actuacion',
          titulo: notif.title,
          descripcion: `Cambió de ${notif.previousStatus} a ${notif.newStatus}`,
          fecha: notif.createdAt,
          estado: notif.read ? 'leida' : 'nueva',
          expedientId: notif.expedientId
        }))
      ];
      
      // Ordenar por fecha más reciente y tomar los primeros 5
      const novedadesOrdenadas = todasNovedades
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5);
      
      setNovedades(novedadesOrdenadas);
      setNotificacionesActuaciones(notificacionesActuaciones);
    };

    cargarNovedades();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarNovedades, 30000);
    return () => clearInterval(interval);
  }, []);

  const canEdit = true; // Ambos perfiles pueden editar
  
  // Mostrar todos los expedientes para ambos perfiles
  const filteredExpedients = expedients;
    
  const recentExpedients = filteredExpedients.slice(0, 5);
  
  const stats = {
    total: filteredExpedients.length,
    draft: filteredExpedients.filter(e => e.status === 'draft').length,
    en_tramite: filteredExpedients.filter(e => e.status === 'en_tramite').length,
    pausados: filteredExpedients.filter(e => e.status === 'pausado').length,
  };

  const getStatusBadge = (status: 'draft' | 'derivado' | 'recibido' | 'en_tramite' | 'pausado') => {
    const colors = {
      draft: 'bg-[hsl(var(--status-draft))] text-[hsl(var(--status-draft-foreground))] border-[hsl(var(--status-draft))]',
      derivado: 'bg-[hsl(var(--status-derivado))] text-[hsl(var(--status-derivado-foreground))] border-[hsl(var(--status-derivado))]',
      recibido: 'bg-[hsl(var(--status-recibido))] text-[hsl(var(--status-recibido-foreground))] border-[hsl(var(--status-recibido))]',
      en_tramite: 'bg-[hsl(var(--status-en-tramite))] text-[hsl(var(--status-en-tramite-foreground))] border-[hsl(var(--status-en-tramite))]',
      pausado: 'bg-[hsl(var(--status-pausado))] text-[hsl(var(--status-pausado-foreground))] border-[hsl(var(--status-pausado))]'
    };
    
    const labels = {
      draft: 'Borrador',
      derivado: 'Derivado',
      recibido: 'Recibido',
      en_tramite: 'En Trámite',
      pausado: 'Pausado'
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getStatusBorderClass = (status: 'draft' | 'derivado' | 'recibido' | 'en_tramite' | 'pausado') => {
    const borderColors = {
      draft: 'border-[hsl(var(--status-draft))]',
      derivado: 'border-[hsl(var(--status-derivado))]',
      recibido: 'border-[hsl(var(--status-recibido))]',
      en_tramite: 'border-[hsl(var(--status-en-tramite))]',
      pausado: 'border-[hsl(var(--status-pausado))]'
    };
    
    return borderColors[status];
  };

  return (
    <div className="space-y-6">
      {/* Funciones Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <ExpedientesParaRecibir 
          expedients={filteredExpedients}
          onRecibirExpediente={onRecibirExpediente}
        />

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-[hsl(var(--card-inicio-border))] bg-gradient-to-br from-[hsl(var(--card-inicio-light))] to-[hsl(var(--card-inicio-light))]"
          onClick={() => onNavigateToOficios?.()}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-[hsl(var(--card-inicio))] rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm text-[hsl(var(--card-inicio))] mb-1">OFICIOS</h3>
            <p className="text-xs text-[hsl(var(--card-inicio))] opacity-80">Gestión de oficios</p>
            <Badge className="mt-2 bg-[hsl(var(--card-inicio))] text-white text-xs">Disponible</Badge>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-[hsl(var(--card-inicio-border))] bg-gradient-to-br from-[hsl(var(--card-inicio-light))] to-[hsl(var(--card-inicio-light))]"
          onClick={() => setShowExpedientSelector(true)}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-[hsl(var(--card-inicio))] rounded-lg flex items-center justify-center mx-auto mb-3">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm text-[hsl(var(--card-inicio))] mb-1">ACTUACIONES</h3>
            <p className="text-xs text-[hsl(var(--card-inicio))] opacity-80">Para crear</p>
            <Badge className="mt-2 bg-[hsl(var(--card-inicio))] text-white text-xs">Disponible</Badge>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-[hsl(var(--card-inicio-border))] bg-gradient-to-br from-[hsl(var(--card-inicio-light))] to-[hsl(var(--card-inicio-light))] relative"
          onClick={() => setShowActuacionesParaFirma(true)}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-[hsl(var(--card-inicio))] rounded-lg flex items-center justify-center mx-auto mb-3">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm text-[hsl(var(--card-inicio))] mb-1">ACTUACIONES</h3>
            <p className="text-xs text-[hsl(var(--card-inicio))] opacity-80">Para firma</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge className="bg-[hsl(var(--card-inicio))] text-white text-xs">
                {actuacionesParaFirma} pendiente{actuacionesParaFirma !== 1 ? 's' : ''}
              </Badge>
              {actuacionesParaFirma > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <Bell className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  } else if (tipo === 'actuacion') {
                    return estado === 'leida' ? 'border-purple-100' : 'border-orange-100';
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
                  } else if (tipo === 'actuacion') {
                    return estado === 'leida' ? 'text-purple-900' : 'text-orange-900';
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
                  } else if (tipo === 'actuacion') {
                    return estado === 'leida' ? 'text-purple-700' : 'text-orange-700';
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
                  } else if (tipo === 'actuacion') {
                    return estado === 'leida' ? 'border-purple-300 text-purple-700' : 'border-orange-300 text-orange-700';
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
                  } else if (tipo === 'actuacion') {
                    return estado === 'leida' ? 'Leída' : 'Nueva';
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

      {/* Modal para seleccionar expediente */}
      <Dialog open={showExpedientSelector} onOpenChange={setShowExpedientSelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleccionar Expediente para Crear Actuación</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {filteredExpedients.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">No hay expedientes disponibles</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExpedients.map((expedient) => (
                  <div
                    key={expedient.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${getStatusBorderClass(expedient.status)}`}
                    onClick={() => {
                      setShowExpedientSelector(false);
                      onViewExpedient?.(expedient.id, true); // Pass true to indicate we want to create actuación
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{expedient.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Creado: {format(new Date(expedient.createdAt), "dd/MM/yyyy", { locale: es })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Actualizado: {format(new Date(expedient.updatedAt), "dd/MM/yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(expedient.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para firmar actuaciones */}
      <Dialog open={showActuacionesParaFirma} onOpenChange={setShowActuacionesParaFirma}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Actuaciones Para Firmar</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {actuacionesParaFirmaList.length === 0 ? (
              <div className="text-center py-8">
                <PenTool className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">No hay actuaciones pendientes de firma</p>
              </div>
            ) : (
              <div className="space-y-2">
                {actuacionesParaFirmaList.map((actuacion) => (
                  <div
                    key={actuacion.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-orange-200 bg-orange-50/50"
                    onClick={() => {
                      // Cambiar estado a firmado
                      const updatedActuacion = {
                        ...actuacion,
                        status: 'firmado' as const,
                        signedAt: new Date(),
                        signedBy: user?.name || 'Usuario',
                        updatedAt: new Date()
                      };
                      
                      actuacionStorage.saveActuacion(updatedActuacion);
                      
                      // Actualizar la lista
                      const newList = actuacionesParaFirmaList.filter(a => a.id !== actuacion.id);
                      setActuacionesParaFirmaList(newList);
                      setActuacionesParaFirma(newList.length);
                      
                      setShowActuacionesParaFirma(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{actuacion.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tipo: {actuacion.tipo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Creado: {format(new Date(actuacion.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expediente ID: {actuacion.expedientId}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          Para Firmar
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs">
                          Firmar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}