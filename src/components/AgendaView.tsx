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
import { format, isSameDay, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users, FileText } from 'lucide-react';
import type { CitaAgenda, AgendaView } from '@/types/agenda';
import { agendaStorage } from '@/utils/agendaStorage';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface AgendaViewProps {
  onNavigateToExpedient?: (expedientId: string) => void;
}

export function AgendaView({ onNavigateToExpedient }: AgendaViewProps) {
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
    estado: 'programada' as const,
    ubicacion: '',
    participantes: ''
  });

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = () => {
    const allCitas = agendaStorage.getCitas();
    setCitas(allCitas);
  };

  const getFilteredCitas = () => {
    const now = new Date();
    
    // Separar citas próximas y pasadas
    const citasProximas = citas.filter(cita => {
      const citaDate = new Date(cita.fechaInicio);
      return citaDate >= now;
    }).sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());

    const citasPasadas = citas.filter(cita => {
      const citaDate = new Date(cita.fechaInicio);
      return citaDate < now;
    }).sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());

    return { citasProximas, citasPasadas };
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
      createdBy: user?.name || 'Usuario'
    });

    setCitas(prev => [...prev, cita]);
    setShowCreateDialog(false);
    setNewCita({
      titulo: '',
      descripcion: '',
      fechaInicio: new Date(),
      tipo: 'reunion',
      estado: 'programada',
      ubicacion: '',
      participantes: ''
    });

    toast({
      title: "Cita creada",
      description: "La cita se ha agregado a la agenda"
    });
  };

  const getStatusColor = (estado: CitaAgenda['estado']) => {
    const colors = {
      'programada': 'bg-blue-100 text-blue-800 border-blue-200',
      'confirmada': 'bg-green-100 text-green-800 border-green-200',
      'reprogramada': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'cancelada': 'bg-red-100 text-red-800 border-red-200',
      'completada': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[estado] || colors.programada;
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

  const { citasProximas, citasPasadas } = getFilteredCitas();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y fechas importantes
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Cita</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={newCita.titulo}
                  onChange={(e) => setNewCita(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título de la cita"
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
                  placeholder="Lugar de la cita"
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={newCita.descripcion}
                  onChange={(e) => setNewCita(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Detalles adicionales"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCita}>
                  Crear Cita
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6">
        {/* Calendario */}
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Calendario</h2>
          <div className="border rounded-lg bg-card w-fit">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={es}
              className="pointer-events-auto p-3"
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
          </div>
        </div>

        {/* Citas Próximas */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Citas Próximas</h2>
          <div className="space-y-2">
            {citasProximas.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay citas programadas
                </p>
              </div>
            ) : (
              citasProximas.map((cita) => (
                <div 
                  key={cita.id} 
                  className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {getTipoIcon(cita.tipo)}
                      <Badge className={getStatusColor(cita.estado)} variant="outline">
                        {cita.estado}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{cita.titulo}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(cita.fechaInicio, 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                        {cita.ubicacion && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {cita.ubicacion}
                          </div>
                        )}
                        {cita.participantes && cita.participantes.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {cita.participantes.length} participante{cita.participantes.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {cita.expedientId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigateToExpedient?.(cita.expedientId!)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver Expediente
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Historial de Citas Pasadas */}
      {citasPasadas.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Historial</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-1">Tipo</div>
              <div className="col-span-3">Título</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-2">Ubicación</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2">Acciones</div>
            </div>
            <div className="divide-y">
              {citasPasadas.map((cita) => (
                <div 
                  key={cita.id} 
                  className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-1">
                    {getTipoIcon(cita.tipo)}
                  </div>
                  <div className="col-span-3">
                    <p className="font-medium text-muted-foreground">{cita.titulo}</p>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {format(cita.fechaInicio, 'dd/MM/yyyy HH:mm', { locale: es })}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {cita.ubicacion || '-'}
                  </div>
                  <div className="col-span-2">
                    <Badge className={getStatusColor(cita.estado)} variant="outline">
                      {cita.estado}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    {cita.expedientId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigateToExpedient?.(cita.expedientId!)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}