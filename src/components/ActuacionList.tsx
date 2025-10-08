import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Edit3, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Plus,
  Undo2,
  RefreshCw,
  CalendarIcon,
  Filter,
  X
} from "lucide-react";
import { Actuacion } from "@/types/actuacion";
import { useUser } from "@/contexts/UserContext";
import { StatusChangeConfirmDialog } from "./StatusChangeConfirmDialog";
import { SelectActuacionEstadoDialog } from "./SelectActuacionEstadoDialog";
import { usePagination } from "@/hooks/usePagination";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ActuacionListProps {
  expedientId: string;
  actuaciones: Actuacion[];
  onViewActuacion?: (id: string) => void;
  onEditActuacion?: (id: string) => void;
  onCreateActuacion?: () => void;
  onChangeStatus?: (id: string, status: Actuacion['status']) => void;
  onCitacionCreated?: () => void;
}

export function ActuacionList({
  expedientId,
  actuaciones = [],
  onViewActuacion,
  onEditActuacion,
  onCreateActuacion,
  onChangeStatus,
  onCitacionCreated
}: ActuacionListProps) {
  const { user } = useUser();
  const canEdit = true; // Ambos perfiles pueden editar
  const canCreate = true; // Ambos perfiles pueden crear
  const [selectEstadoOpen, setSelectEstadoOpen] = useState(false);
  const [selectedActuacionId, setSelectedActuacionId] = useState<string | null>(null);
  
  // Filter states
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(undefined);
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(undefined);
  const [estadoFiltro, setEstadoFiltro] = useState<Actuacion['status'] | 'todos'>('todos');

  // Apply filters
  const actuacionesFiltradas = useMemo(() => {
    return actuaciones.filter(actuacion => {
      // Filter by fecha desde
      if (fechaDesde && actuacion.createdAt < fechaDesde) {
        return false;
      }
      
      // Filter by fecha hasta
      if (fechaHasta) {
        const fechaHastaEnd = new Date(fechaHasta);
        fechaHastaEnd.setHours(23, 59, 59, 999);
        if (actuacion.createdAt > fechaHastaEnd) {
          return false;
        }
      }
      
      // Filter by status
      if (estadoFiltro !== 'todos' && actuacion.status !== estadoFiltro) {
        return false;
      }
      
      return true;
    });
  }, [actuaciones, fechaDesde, fechaHasta, estadoFiltro]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedActuaciones,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
  } = usePagination({ items: actuacionesFiltradas, itemsPerPage: 4 });

  const hasActiveFilters = fechaDesde || fechaHasta || estadoFiltro !== 'todos';

  const clearFilters = () => {
    setFechaDesde(undefined);
    setFechaHasta(undefined);
    setEstadoFiltro('todos');
  };

  const canRevertFromFirmado = (actuacion: Actuacion): boolean => {
    if (actuacion.status !== 'firmado' || !actuacion.signedAt) return false;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const timeSinceSigned = Date.now() - actuacion.signedAt.getTime();
    return timeSinceSigned < twentyFourHours;
  };

  const handleStatusButtonClick = (actuacionId: string, currentStatus: Actuacion['status']) => {
    if (!canEdit || !onChangeStatus) return;

    if (currentStatus === 'borrador') {
      // Directo a para-firmar con confirmación
      onChangeStatus(actuacionId, 'para-firmar');
    } else if (currentStatus === 'para-firmar') {
      // Abrir diálogo para elegir entre volver a borrador o firmado
      setSelectedActuacionId(actuacionId);
      setSelectEstadoOpen(true);
    }
  };

  const handleSelectEstado = (newStatus: Actuacion['status']) => {
    if (selectedActuacionId && onChangeStatus) {
      onChangeStatus(selectedActuacionId, newStatus);
      setSelectedActuacionId(null);
    }
  };

  const handleRevertFromFirmado = (actuacionId: string) => {
    if (onChangeStatus) {
      onChangeStatus(actuacionId, 'para-firmar');
    }
  };

  const getStatusBadge = (status: Actuacion['status']) => {
    if (status === 'borrador') {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Borrador
        </Badge>
      );
    }
    
    if (status === 'para-firmar') {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          <Clock className="w-3 h-3 mr-1" />
          Para Firma
        </Badge>
      );
    }
    
    if (status === 'firmado') {
      return (
        <Badge variant="outline" className="border-green-500 text-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Firmado
        </Badge>
      );
    }
  };

  const getStatusButton = (actuacion: Actuacion) => {
    const { status, id } = actuacion;
    
    if (status === 'borrador') {
      return (
        <StatusChangeConfirmDialog
          onConfirm={() => handleStatusButtonClick(id, status)}
          message="¿Está seguro de enviar la actuación para firma?"
        >
          <Button
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Estado actuación
          </Button>
        </StatusChangeConfirmDialog>
      );
    }
    
    if (status === 'para-firmar') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusButtonClick(id, status)}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Estado actuación
        </Button>
      );
    }
    
    if (status === 'firmado') {
      const canRevert = canRevertFromFirmado(actuacion);
      return canRevert ? (
        <StatusChangeConfirmDialog
          onConfirm={() => handleRevertFromFirmado(id)}
          title="Revertir firma"
          message="¿Está seguro de revertir esta actuación a 'Para Firma'? Esta acción se puede realizar solo dentro de las 24 horas posteriores a la firma."
        >
          <Button
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Estado actuación
          </Button>
        </StatusChangeConfirmDialog>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Estado actuación
        </Button>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <span>Actuaciones</span>
          <Badge variant="secondary">{actuaciones.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        {actuaciones.length > 0 && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
              
              {/* Fecha Desde */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal",
                      !fechaDesde && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaDesde ? format(fechaDesde, "PPP", { locale: es }) : "Desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaDesde}
                    onSelect={setFechaDesde}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>

              {/* Fecha Hasta */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal",
                      !fechaHasta && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaHasta ? format(fechaHasta, "PPP", { locale: es }) : "Hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaHasta}
                    onSelect={setFechaHasta}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>

              {/* Estado Filter */}
              <Select value={estadoFiltro} onValueChange={(value) => setEstadoFiltro(value as Actuacion['status'] | 'todos')}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="para-firmar">Para Firma</SelectItem>
                  <SelectItem value="firmado">Firmado</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar filtros
                </Button>
              )}
            </div>
            
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground">
                Mostrando {actuacionesFiltradas.length} de {actuaciones.length} actuaciones
              </p>
            )}
          </div>
        )}

        {actuaciones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No hay actuaciones en este expediente</p>
            {canCreate && (
              <Button 
                onClick={onCreateActuacion}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Actuación
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedActuaciones.map((actuacion) => {
              const borderColor = 
                actuacion.status === 'borrador' ? 'border-orange-500' :
                actuacion.status === 'para-firmar' ? 'border-blue-500' :
                'border-green-500';
              
              return (
                <div 
                  key={actuacion.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 hover:bg-muted/20 transition-colors cursor-pointer ${borderColor}`}
                  onClick={() => onViewActuacion?.(actuacion.id)}
                >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-sm text-muted-foreground">
                      Actuación #{actuacion.number}
                    </span>
                    {getStatusBadge(actuacion.status)}
                  </div>
                  <h4 className="font-medium text-foreground mb-1">
                    {actuacion.title}
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Creado el {actuacion.createdAt.toLocaleDateString('es-ES')} por {actuacion.createdBy}</p>
                    {actuacion.status === 'firmado' && actuacion.signedAt && (
                      <p className="text-primary">
                        Firmado el {actuacion.signedAt.toLocaleDateString('es-ES')} 
                        {actuacion.signedBy && ` por ${actuacion.signedBy}`}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {canEdit && (actuacion.status === 'borrador' || actuacion.status === 'para-firmar') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditActuacion?.(actuacion.id)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}

                  {canEdit && getStatusButton(actuacion)}
                </div>
              </div>
              );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={previousPage}
                        className={!canGoPrevious ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => goToPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={nextPage}
                        className={!canGoNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <SelectActuacionEstadoDialog
        open={selectEstadoOpen}
        onOpenChange={setSelectEstadoOpen}
        currentStatus="para-firmar"
        onSelect={handleSelectEstado}
      />
    </Card>
  );
}