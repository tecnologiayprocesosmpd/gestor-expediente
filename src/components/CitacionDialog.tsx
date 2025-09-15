import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fechasCitacionStorage } from '@/utils/agendaStorage';
import { useToast } from '@/hooks/use-toast';

interface CitacionDialogProps {
  expedientId: string;
  actuacionId?: string;
  onCitacionCreated?: () => void;
}

export function CitacionDialog({ expedientId, actuacionId, onCitacionCreated }: CitacionDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [citacion, setCitacion] = useState({
    fecha: new Date(),
    tipo: 'otro' as const,
    descripcion: ''
  });

  const handleSave = () => {
    if (!citacion.descripcion.trim()) {
      toast({
        title: "Error",
        description: "La descripción es obligatoria",
        variant: "destructive"
      });
      return;
    }

    fechasCitacionStorage.saveFechaCitacion({
      fecha: citacion.fecha,
      tipo: citacion.tipo,
      descripcion: citacion.descripcion,
      expedientId,
      actuacionId,
      completada: false
    });

    toast({
      title: "Citación agregada",
      description: "La fecha de citación se ha agregado al expediente y a la agenda"
    });

    setOpen(false);
    setCitacion({
      fecha: new Date(),
      tipo: 'otro',
      descripcion: ''
    });
    
    onCitacionCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Agregar Citación
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Fecha de Citación</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="fecha">Fecha y Hora</Label>
            <Input
              id="fecha"
              type="datetime-local"
              value={format(citacion.fecha, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setCitacion(prev => ({ 
                ...prev, 
                fecha: new Date(e.target.value) 
              }))}
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select 
              value={citacion.tipo} 
              onValueChange={(value) => setCitacion(prev => ({ ...prev, tipo: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audiencia">Audiencia</SelectItem>
                <SelectItem value="presentacion">Presentación</SelectItem>
                <SelectItem value="vencimiento">Vencimiento</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={citacion.descripcion}
              onChange={(e) => setCitacion(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe la citación o audiencia"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Agregar Citación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}