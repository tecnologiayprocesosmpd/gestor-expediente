import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format, isSameDay, isToday, isTomorrow, startOfDay, endOfDay, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users, FileText, Pencil, X, Search } from 'lucide-react';
import type { CitaAgenda, AgendaView } from '@/types/agenda';
import { agendaStorage } from '@/utils/agendaStorage';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface AgendaViewProps {
  onNavigateToExpedient?: (expedientId: string) => void;
  expedients?: Array<{ id: string; number: string; title: string; status: string }>;
}

export function AgendaView({ onNavigateToExpedient, expedients = [] }: AgendaViewProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [citas, setCitas] = useState<CitaAgenda[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCita, setNewCita] = useState({
    titulo: '',
    descripcion: '',
    fechaInicio: new Date(),
    tipo: 'reunion' as const,
    estado: 'programado' as const,
    ubicacion: '',
    participantes: '',
    expedientId: ''
  });
  const [selectedCita, setSelectedCita] = useState<CitaAgenda | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [editCita, setEditCita] = useState<CitaAgenda | null>(null);
  const [isCitaProxima, setIsCitaProxima] = useState(false);
  
  // Filtros separados
  const [searchProximas, setSearchProximas] = useState('');
  const [fechaProximas, setFechaProximas] = useState('');
  const [expedientFilterProximas, setExpedientFilterProximas] = useState('');
  
  const [searchHistorial, setSearchHistorial] = useState('');
  const [fechaHistorial, setFechaHistorial] = useState('');
  const [expedientFilterHistorial, setExpedientFilterHistorial] = useState('');

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = () => {
    const allCitas = agendaStorage.getCitas();
    setCitas(allCitas);
  };

  const getFilteredCitas = () => {
    const now = startOfDay(new Date());
    
    // Citas programadas (hoy y futuras)
    const citasProgramadas = citas.filter(cita => {
      const citaDate = startOfDay(new Date(cita.fechaInicio));
      return citaDate >= now;
    }).map(cita => ({
      ...cita,
      estado: 'programado' as const
    })).sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());

    // Historial (citas pasadas)
    const citasHistorial = citas.filter(cita => {
      const citaDate = startOfDay(new Date(cita.fechaInicio));
      return citaDate < now;
    }).map(cita => ({
      ...cita,
      estado: 'completada' as const
    })).sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());

    return { citasProgramadas, citasHistorial };
  };

  const handleCreateCita = () => {
    if (!newCita.titulo.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive"
      });
      return;
    }

    const cita = agendaStorage.saveCita({
      ...newCita,
      participantes: newCita.participantes ? newCita.participantes.split(',').map(p => p.trim()) : [],
      expedientId: newCita.expedientId || undefined,
      createdBy: user?.name || 'Usuario'
    });

    setCitas(prev => [...prev, cita]);
    setShowCreateDialog(false);
    setNewCita({
      titulo: '',
      descripcion: '',
      fechaInicio: new Date(),
      tipo: 'reunion',
      estado: 'programado',
      ubicacion: '',
      participantes: '',
      expedientId: ''
    });

    toast({
      title: "Evento creado",
      description: "El evento se ha agregado a la agenda"
    });
  };

  const getStatusColor = (estado: CitaAgenda['estado']) => {
    const colors = {
      'programado': 'bg-blue-100 text-blue-800 border-blue-200',
      'proximo': 'bg-amber-100 text-amber-800 border-amber-200',
      'hoy': 'bg-red-100 text-red-800 border-red-200',
      'completada': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[estado] || colors.programado;
  };

  const getEstadoLabel = (cita: CitaAgenda) => {
    if (isToday(new Date(cita.fechaInicio))) {
      return 'HOY';
    }
    return cita.estado.toUpperCase();
  };

  const handleViewDetails = (cita: CitaAgenda, isProxima: boolean = false) => {
    setSelectedCita(cita);
    setIsCitaProxima(isProxima);
    setShowDetailsDialog(true);
  };

  const handleEditCita = () => {
    setEditCita(selectedCita);
    setShowDetailsDialog(false);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editCita) return;

    agendaStorage.updateCita(editCita.id, editCita);
    loadCitas();
    setShowEditDialog(false);
    setEditCita(null);
    
    toast({
      title: "Evento actualizado",
      description: "Los cambios se han guardado correctamente"
    });
  };

  const handleCancelCita = () => {
    setShowDetailsDialog(false);
    setShowCancelDialog(true);
  };

  const confirmCancelCita = () => {
    if (!selectedCita) return;

    agendaStorage.deleteCita(selectedCita.id);
    loadCitas();
    setShowCancelDialog(false);
    setSelectedCita(null);
    
    toast({
      title: "Evento cancelado",
      description: "El evento ha sido eliminado de la agenda"
    });
  };

  const getTipoIcon = (tipo: CitaAgenda['tipo']) => {
    const icons = {
      'audiencia': <Users className="h-4 w-4" />,
      'citacion': <FileText className="h-4 w-4" />,
      'reunion': <Users className="h-4 w-4" />,
      'vencimiento': <Clock className="h-4 w-4" />,
      'otro': <CalendarIcon className="h-4 w-4" />
    };
    return icons[tipo] || icons.otro;
  };

  // Obtener días que tienen citas programadas
  const getDaysWithCitas = () => {
    return citas.map(cita => startOfDay(new Date(cita.fechaInicio)));
  };

  const daysWithCitas = getDaysWithCitas();

  const { citasProgramadas, citasHistorial } = getFilteredCitas();

  // Aplicar filtros a citas programadas
  const filteredCitasProgramadas = citasProgramadas.filter(cita => {
    const matchesSearch = searchProximas === '' || 
      cita.titulo.toLowerCase().includes(searchProximas.toLowerCase()) ||
      (cita.ubicacion && cita.ubicacion.toLowerCase().includes(searchProximas.toLowerCase()));
    
    const matchesFecha = fechaProximas === '' || 
      format(new Date(cita.fechaInicio), 'yyyy-MM-dd') === fechaProximas;

    const matchesExpedient = expedientFilterProximas === '' || cita.expedientId === expedientFilterProximas;
    
    return matchesSearch && matchesFecha && matchesExpedient;
  });

  // Aplicar filtros a historial
  const filteredCitasHistorial = citasHistorial.filter(cita => {
    const matchesSearch = searchHistorial === '' || 
      cita.titulo.toLowerCase().includes(searchHistorial.toLowerCase()) ||
      (cita.ubicacion && cita.ubicacion.toLowerCase().includes(searchHistorial.toLowerCase()));
    
    const matchesFecha = fechaHistorial === '' || 
      format(new Date(cita.fechaInicio), 'yyyy-MM-dd') === fechaHistorial;

    const matchesExpedient = expedientFilterHistorial === '' || cita.expedientId === expedientFilterHistorial;
    
    return matchesSearch && matchesFecha && matchesExpedient;
  });

  // Pagination for Citas Programadas
  const {
    currentPage: currentPageProgramadas,
    totalPages: totalPagesProgramadas,
    paginatedItems: paginatedCitasProgramadas,
    goToPage: goToPageProgramadas,
    nextPage: nextPageProgramadas,
    previousPage: previousPageProgramadas,
    canGoNext: canGoNextProgramadas,
    canGoPrevious: canGoPreviousProgramadas,
  } = usePagination({ items: filteredCitasProgramadas, itemsPerPage: 5 });

  // Pagination for Historial
  const {
    currentPage: currentPageHistorial,
    totalPages: totalPagesHistorial,
    paginatedItems: paginatedCitasHistorial,
    goToPage: goToPageHistorial,
    nextPage: nextPageHistorial,
    previousPage: previousPageHistorial,
    canGoNext: canGoNextHistorial,
    canGoPrevious: canGoPreviousHistorial,
  } = usePagination({ items: filteredCitasHistorial, itemsPerPage: 5 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Gestiona tus eventos y fechas importantes
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nuevo Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={newCita.titulo}
                    onChange={(e) => setNewCita(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Título del evento"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select 
                    value={newCita.tipo} 
                    onValueChange={(value) => setNewCita(prev => ({ ...prev, tipo: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audiencia">Audiencia</SelectItem>
                      <SelectItem value="citacion">Citación</SelectItem>
                      <SelectItem value="reunion">Reunión</SelectItem>
                      <SelectItem value="vencimiento">Vencimiento</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expediente">Expediente (opcional)</Label>
                  <Select 
                    value={newCita.expedientId || "none"} 
                    onValueChange={(value) => setNewCita(prev => ({ ...prev, expedientId: value === "none" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin vincular" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="none">Sin vincular</SelectItem>
                      {expedients.map(exp => (
                        <SelectItem key={exp.id} value={exp.id}>
                          {exp.number} - {exp.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fecha">Fecha y Hora</Label>
                  <Input
                    id="fecha"
                    type="datetime-local"
                    value={format(newCita.fechaInicio, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewCita(prev => ({ 
                      ...prev, 
                      fechaInicio: new Date(e.target.value) 
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    value={newCita.ubicacion}
                    onChange={(e) => setNewCita(prev => ({ ...prev, ubicacion: e.target.value }))}
                    placeholder="Lugar del evento"
                  />
                </div>

                <div>
                  <Label htmlFor="participantes">Participantes (opcional)</Label>
                  <Input
                    id="participantes"
                    value={newCita.participantes}
                    onChange={(e) => setNewCita(prev => ({ ...prev, participantes: e.target.value }))}
                    placeholder="Separar con comas: Juan Pérez, María García..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ingrese los nombres separados por comas
                  </p>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={newCita.descripcion}
                    onChange={(e) => setNewCita(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Detalles adicionales"
                  />
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground italic">
                  Los campos marcados con * son obligatorios
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCita}>
                  Crear Evento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {/* Filtros para Programadas */}
        <Card className="w-full">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">FILTROS - PROGRAMADAS</h3>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchProximas}
                  onChange={(e) => setSearchProximas(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Input
                type="date"
                value={fechaProximas}
                onChange={(e) => setFechaProximas(e.target.value)}
                className="h-9 w-40"
                placeholder="Fecha"
              />
              <Select value={expedientFilterProximas || "all"} onValueChange={(value) => setExpedientFilterProximas(value === "all" ? "" : value)}>
                <SelectTrigger className="h-9 w-56">
                  <SelectValue placeholder="Expediente" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">Todos</SelectItem>
                  {expedients.map(exp => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.number} - {exp.title.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(fechaProximas || expedientFilterProximas || searchProximas) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchProximas('');
                    setFechaProximas('');
                    setExpedientFilterProximas('');
                  }}
                  className="h-9"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Calendario y Programadas lado a lado */}
        <div className="flex gap-6 items-start">
          {/* Calendario */}
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Calendario</h2>
            <Card className="w-fit">
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={es}
                  className="pointer-events-auto p-3"
                  modifiers={{
                    hasCita: daysWithCitas
                  }}
                  modifiersClassNames={{
                    hasCita: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[hsl(var(--warning))] after:z-10"
                  }}
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4 w-fit",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    table: "w-fit border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-fit mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative"
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* PROGRAMADAS */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold tracking-tight mb-4">PROGRAMADAS</h2>
            
            <Card>
              <CardContent className="p-3">
                <div className="space-y-2 min-h-[200px]">{filteredCitasProgramadas.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {searchProximas || fechaProximas || expedientFilterProximas
                        ? 'No se encontraron eventos' 
                        : 'No hay eventos programados'}
                    </p>
                  </div>
                ) : (
                  <>
                    {paginatedCitasProgramadas.map((cita) => (
                    <div 
                      key={cita.id} 
                      className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer h-[72px]"
                      onClick={() => handleViewDetails(cita, true)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getTipoIcon(cita.tipo)}
                          <Badge 
                            className={isToday(new Date(cita.fechaInicio)) ? 'bg-red-100 text-red-800 border-red-200' : getStatusColor(cita.estado)} 
                            variant="outline"
                          >
                            {getEstadoLabel(cita)}
                          </Badge>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{cita.titulo}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {format(cita.fechaInicio, 'dd/MM/yyyy HH:mm', { locale: es })}
                            </div>
                            {cita.ubicacion && (
                              <div className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{cita.ubicacion}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {cita.expedientId && (
                          <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onNavigateToExpedient?.(cita.expedientId!)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    ))}

                    {/* Pagination for Programadas */}
                    {totalPagesProgramadas > 1 && (
                      <div className="mt-4 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={previousPageProgramadas}
                                className={!canGoPreviousProgramadas ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPagesProgramadas }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => goToPageProgramadas(page)}
                                  isActive={currentPageProgramadas === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={nextPageProgramadas}
                                className={!canGoNextProgramadas ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* HISTORIAL - Ancho completo */}
      <div className="w-full space-y-4">
        {/* Filtros para Historial */}
        <Card className="w-full">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">FILTROS - HISTORIAL</h3>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchHistorial}
                  onChange={(e) => setSearchHistorial(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Input
                type="date"
                value={fechaHistorial}
                onChange={(e) => setFechaHistorial(e.target.value)}
                className="h-9 w-40"
                placeholder="Fecha"
              />
              <Select value={expedientFilterHistorial || "all"} onValueChange={(value) => setExpedientFilterHistorial(value === "all" ? "" : value)}>
                <SelectTrigger className="h-9 w-56">
                  <SelectValue placeholder="Expediente" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">Todos</SelectItem>
                  {expedients.map(exp => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.number} - {exp.title.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(fechaHistorial || expedientFilterHistorial || searchHistorial) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchHistorial('');
                    setFechaHistorial('');
                    setExpedientFilterHistorial('');
                  }}
                  className="h-9"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <h2 className="text-2xl font-bold tracking-tight">HISTORIAL</h2>
        
        <Card>
          <CardContent className="p-3">
            <div className="space-y-2 min-h-[200px]">{filteredCitasHistorial.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {searchHistorial || fechaHistorial || expedientFilterHistorial
                        ? 'No se encontraron eventos en el historial' 
                        : 'No hay eventos en el historial'}
                    </p>
                  </div>
                ) : (
                  <>
                    {paginatedCitasHistorial.map((cita) => (
                  <div 
                    key={cita.id} 
                    className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer h-[72px]"
                    onClick={() => handleViewDetails(cita, false)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getTipoIcon(cita.tipo)}
                        <Badge className={getStatusColor(cita.estado)} variant="outline">
                          COMPLETADA
                        </Badge>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{cita.titulo}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Clock className="h-3 w-3" />
                            {format(cita.fechaInicio, 'dd/MM/yyyy HH:mm', { locale: es })}
                          </div>
                          {cita.ubicacion && (
                            <div className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{cita.ubicacion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {cita.expedientId && (
                        <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigateToExpedient?.(cita.expedientId!)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Ver Expediente
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  ))}

                  {/* Pagination for Historial */}
                  {totalPagesHistorial > 1 && (
                    <div className="mt-4 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={previousPageHistorial}
                              className={!canGoPreviousHistorial ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: totalPagesHistorial }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => goToPageHistorial(page)}
                                isActive={currentPageHistorial === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={nextPageHistorial}
                              className={!canGoNextHistorial ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Diálogo de detalles del evento */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Evento</DialogTitle>
          </DialogHeader>
          {selectedCita && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedCita.titulo}</h3>
                <div className="flex items-center gap-2 mb-3">
                  {getTipoIcon(selectedCita.tipo)}
                  <Badge className={getStatusColor(selectedCita.estado)} variant="outline">
                    {selectedCita.estado}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(selectedCita.fechaInicio, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}</span>
                </div>

                {selectedCita.ubicacion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCita.ubicacion}</span>
                  </div>
                )}

                {selectedCita.participantes && selectedCita.participantes.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">Participantes:</p>
                      <ul className="list-disc list-inside">
                        {selectedCita.participantes.map((participante, idx) => (
                          <li key={idx}>{participante}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {selectedCita.descripcion && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium mb-2">Descripción:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedCita.descripcion}
                  </p>
                </div>
              )}

              {selectedCita.observaciones && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium mb-2">Observaciones:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedCita.observaciones}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                {isCitaProxima && (
                  <>
                    <Button variant="outline" onClick={handleCancelCita}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar Evento
                    </Button>
                    <Button onClick={handleEditCita}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </>
                )}
                {!isCitaProxima && (
                  <Button onClick={() => setShowDetailsDialog(false)}>
                    Cerrar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición de cita */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          {editCita && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-titulo">Título *</Label>
                <Input
                  id="edit-titulo"
                  value={editCita.titulo}
                  onChange={(e) => setEditCita(prev => prev ? { ...prev, titulo: e.target.value } : null)}
                  placeholder="Título de la cita"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-tipo">Tipo</Label>
                <Select 
                  value={editCita.tipo} 
                  onValueChange={(value) => setEditCita(prev => prev ? { ...prev, tipo: value as any } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audiencia">Audiencia</SelectItem>
                    <SelectItem value="citacion">Citación</SelectItem>
                    <SelectItem value="reunion">Reunión</SelectItem>
                    <SelectItem value="vencimiento">Vencimiento</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-fecha">Fecha y Hora</Label>
                <Input
                  id="edit-fecha"
                  type="datetime-local"
                  value={format(editCita.fechaInicio, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setEditCita(prev => prev ? { 
                    ...prev, 
                    fechaInicio: new Date(e.target.value) 
                  } : null)}
                />
              </div>

              <div>
                <Label htmlFor="edit-ubicacion">Ubicación</Label>
                <Input
                  id="edit-ubicacion"
                  value={editCita.ubicacion || ''}
                  onChange={(e) => setEditCita(prev => prev ? { ...prev, ubicacion: e.target.value } : null)}
                  placeholder="Lugar del evento"
                />
              </div>

              <div>
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  value={editCita.descripcion || ''}
                  onChange={(e) => setEditCita(prev => prev ? { ...prev, descripcion: e.target.value } : null)}
                  placeholder="Detalles adicionales"
                />
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground italic">
                  Los campos marcados con * son obligatorios
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para cancelar cita */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el evento de forma permanente. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener evento</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelCita}>
              Sí, cancelar evento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}