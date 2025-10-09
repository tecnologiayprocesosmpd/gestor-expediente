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
  Bell,
  CheckCircle,
  User
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ExpedientSummary } from "@/types/expedient";
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
  const [novedades] = useState<any[]>([]); // Funcionalidad desactivada temporalmente
  const [actuacionesParaFirma, setActuacionesParaFirma] = useState<number>(0);
  const [showExpedientSelector, setShowExpedientSelector] = useState(false);
  const [showActuacionesParaFirma, setShowActuacionesParaFirma] = useState(false);
  const [actuacionesParaFirmaList, setActuacionesParaFirmaList] = useState<any[]>([]);
  const [expedientesExpanded, setExpedientesExpanded] = useState(false);

  if (!user) return null;

  // Cargar actuaciones para firma
  useEffect(() => {
    const cargarActuacionesParaFirma = () => {
      const paraFirma = actuacionStorage.getActuacionesParaFirma();
      setActuacionesParaFirma(paraFirma.length);
      setActuacionesParaFirmaList(paraFirma);
    };

    cargarActuacionesParaFirma();

    const handleActuacionChange = () => {
      cargarActuacionesParaFirma();
    };

    window.addEventListener('actuacionStatusChanged', handleActuacionChange);
    
    const interval = setInterval(cargarActuacionesParaFirma, 30000);
    
    return () => {
      window.removeEventListener('actuacionStatusChanged', handleActuacionChange);
      clearInterval(interval);
    };
  }, []);

  const canEdit = true; // Ambos perfiles pueden editar
  
  // Mostrar todos los expedientes para ambos perfiles
  const filteredExpedients = expedients;
    
  const recentExpedients = filteredExpedients.slice(0, 5);
  
  // Expedientes para recibir
  const expedientesParaRecibir = filteredExpedients.filter(exp => exp.status === 'en_tramite');
  
  const stats = {
    total: filteredExpedients.length,
    draft: filteredExpedients.filter(e => e.status === 'draft').length,
    en_tramite: filteredExpedients.filter(e => e.status === 'en_tramite').length,
    paralizado: filteredExpedients.filter(e => e.status === 'paralizado').length,
    archivados: filteredExpedients.filter(e => e.status === 'archivado').length,
  };

  const getStatusBadge = (status: 'draft' | 'en_tramite' | 'paralizado' | 'archivado') => {
    const colors = {
      draft: 'bg-[hsl(var(--status-draft))] text-[hsl(var(--status-draft-foreground))] border-[hsl(var(--status-draft))]',
      en_tramite: 'bg-[hsl(var(--status-en-tramite))] text-[hsl(var(--status-en-tramite-foreground))] border-[hsl(var(--status-en-tramite))]',
      paralizado: 'bg-amber-500 text-white border-amber-500',
      archivado: 'bg-[hsl(var(--status-archivado))] text-[hsl(var(--status-archivado-foreground))] border-[hsl(var(--status-archivado))]'
    };
    
    const labels = {
      draft: 'Borrador',
      en_tramite: 'En Trámite',
      paralizado: 'Paralizado',
      archivado: 'Archivado'
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getStatusBorderClass = (status: 'draft' | 'en_tramite' | 'paralizado' | 'archivado') => {
    const borderColors = {
      draft: 'border-[hsl(var(--status-draft))]',
      en_tramite: 'border-[hsl(var(--status-en-tramite))]',
      paralizado: 'border-amber-500',
      archivado: 'border-[hsl(var(--status-archivado))]'
    };
    
    return borderColors[status];
  };

  // Pagination desactivada - novedades sin funcionalidad

  return (
    <div className="space-y-6">
      {/* Funciones Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto items-start">
        <ExpedientesParaRecibir 
          expedients={filteredExpedients}
          onRecibirExpediente={onRecibirExpediente}
          onExpandChange={setExpedientesExpanded}
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

      {/* Expansión de Expedientes para Recibir */}
      {expedientesExpanded && (
        <Card className="border-2 border-[hsl(var(--card-inicio-border))] bg-gradient-to-br from-[hsl(var(--card-inicio-light))] to-white">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--card-inicio))]">Expedientes para Recibir</CardTitle>
          </CardHeader>
          <CardContent>
            {expedientesParaRecibir.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <p className="text-muted-foreground">No hay expedientes pendientes de recibir</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expedientesParaRecibir.map((expedient) => (
                  <div 
                    key={expedient.id}
                    className="bg-white rounded-lg border-2 border-[hsl(var(--card-inicio-border))] p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-[hsl(var(--card-inicio))] bg-[hsl(var(--card-inicio-light))] px-3 py-1 rounded font-semibold">
                          {expedient.number}
                        </span>
                        <Badge className="bg-green-100 text-green-700">
                          En Trámite
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold text-base text-gray-900 line-clamp-2">
                        {expedient.title}
                      </h4>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[hsl(var(--card-inicio))]" />
                          <span>Creado por: {expedient.createdBy}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[hsl(var(--card-inicio))]" />
                          <span>
                            {format(new Date(expedient.createdAt), "dd/MM/yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => onRecibirExpediente?.(expedient.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        RECIBIR EXPEDIENTE
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* NOVEDADES - Funcionalidad desactivada temporalmente */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            NOVEDADES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Funcionalidad en desarrollo</p>
          </div>
        </CardContent>
      </Card>

      {/* Modal para seleccionar expediente */}
      <Dialog open={showExpedientSelector} onOpenChange={setShowExpedientSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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