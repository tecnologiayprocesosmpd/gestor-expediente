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
    // Always show upcoming appointments for the month
    const now = new Date();
    const startDate = now;
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

    return citas.filter(cita => {
      const citaDate = new Date(cita.fechaInicio);
      return citaDate >= startDate && citaDate <= endDate;
    }).sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
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

  const citasFiltradas = getFilteredCitas();

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="calendar-wrapper border rounded-lg p-4 bg-background">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={es}
                className="w-full"
              />
            </div>
            
            <div className="mt-4 space-y-2">
              <Label>Vista</Label>
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="dia">Día</SelectItem>
                  <SelectItem value="semana">Semana</SelectItem>
                  <SelectItem value="mes">Mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Citas */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Citas</h2>
          <div className="space-y-2">
            {citasFiltradas.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay citas programadas este mes
                </p>
              </div>
            ) : (
              citasFiltradas.map((cita) => (
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
    </div>
  );
}