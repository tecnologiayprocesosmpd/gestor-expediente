import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Building2, Clock, FileText } from "lucide-react";
import type { Actuacion } from "@/types/actuacion";

interface RadicacionInternaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expedientNumber: string;
  actuaciones: Actuacion[];
  onConfirm: (data: {
    oficina: string;
    fechaRegreso: string;
    actuacionesSeleccionadas: string[];
  }) => Promise<void>;
}

export function RadicacionInternaDialog({
  open,
  onOpenChange,
  expedientNumber,
  actuaciones,
  onConfirm
}: RadicacionInternaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [oficina, setOficina] = useState('');
  const [fechaRegreso, setFechaRegreso] = useState('');
  const [actuacionesSeleccionadas, setActuacionesSeleccionadas] = useState<string[]>([]);

  const oficinas = [
    { value: 'secretaria-1', label: 'Secretaría 1' },
    { value: 'secretaria-2', label: 'Secretaría 2' },
    { value: 'secretaria-3', label: 'Secretaría 3' },
    { value: 'secretaria-4', label: 'Secretaría 4' },
    { value: 'secretaria-5', label: 'Secretaría 5' },
    { value: 'secretaria-6', label: 'Secretaría 6' },
    { value: 'secretaria-7', label: 'Secretaría 7' },
    { value: 'secretaria-8', label: 'Secretaría 8' },
    { value: 'secretaria-civil', label: 'Secretaría Civil' },
    { value: 'secretaria-penal', label: 'Secretaría Penal' },
    { value: 'secretaria-laboral', label: 'Secretaría Laboral' },
    { value: 'secretaria-familia', label: 'Secretaría de Familia' },
    { value: 'oficina-tecnica', label: 'Oficina Técnica' },
    { value: 'contaduria', label: 'Contaduría' },
    { value: 'tesoreria', label: 'Tesorería' }
  ];

  const fechaEmision = new Date().toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Filtrar solo actuaciones firmadas
  const actuacionesFirmadas = actuaciones.filter(act => act.status === 'firmado');

  const handleActuacionToggle = (actuacionId: string, checked: boolean) => {
    if (checked) {
      setActuacionesSeleccionadas(prev => [...prev, actuacionId]);
    } else {
      setActuacionesSeleccionadas(prev => prev.filter(id => id !== actuacionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setActuacionesSeleccionadas(actuacionesFirmadas.map(act => act.id));
    } else {
      setActuacionesSeleccionadas([]);
    }
  };

  const handleConfirm = async () => {
    if (!oficina) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    if (actuacionesSeleccionadas.length === 0) {
      alert('Debe seleccionar al menos una actuación');
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        oficina,
        fechaRegreso,
        actuacionesSeleccionadas
      });
      
      // Reset form
      setOficina('');
      setFechaRegreso('');
      setActuacionesSeleccionadas([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error al procesar radicación:', error);
      alert('Error al procesar la radicación');
    } finally {
      setLoading(false);
    }
  };

  const allSelected = actuacionesFirmadas.length > 0 && actuacionesSeleccionadas.length === actuacionesFirmadas.length;
  const someSelected = actuacionesSeleccionadas.length > 0 && actuacionesSeleccionadas.length < actuacionesFirmadas.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Radicación de Expediente</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del expediente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Información del Expediente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <strong>Expediente:</strong> {expedientNumber}
              </p>
            </CardContent>
          </Card>

          {/* Datos de la radicación */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Oficina destino */}
              <div className="space-y-2">
                <Label htmlFor="oficina">Oficina Destino *</Label>
                <Select value={oficina} onValueChange={setOficina}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccionar oficina" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {oficinas.map((ofi) => (
                      <SelectItem key={ofi.value} value={ofi.value} className="hover:bg-muted">
                        {ofi.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha de radicación */}
              <div className="space-y-2">
                <Label htmlFor="fechaEmision">Fecha de Radicación</Label>
                <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{fechaEmision}</span>
                </div>
              </div>

              {/* Fecha de regreso */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fechaRegreso">Fecha de Regreso (Opcional)</Label>
                <Input
                  id="fechaRegreso"
                  type="datetime-local"
                  value={fechaRegreso}
                  onChange={(e) => setFechaRegreso(e.target.value)}
                  min={new Date().toISOString().slice(0, -8)}
                />
              </div>
            </div>
          </div>

          {/* Selección de actuaciones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Actuaciones a Enviar</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className={someSelected ? "data-[state=checked]:bg-orange-500" : ""}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    Seleccionar todas ({actuacionesSeleccionadas.length}/{actuacionesFirmadas.length})
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {actuacionesFirmadas.map((actuacion) => (
                  <div key={actuacion.id} className="flex items-start space-x-3 p-2 border rounded-md hover:bg-muted/50">
                    <Checkbox
                      id={actuacion.id}
                      checked={actuacionesSeleccionadas.includes(actuacion.id)}
                      onCheckedChange={(checked) => handleActuacionToggle(actuacion.id, !!checked)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={actuacion.id} className="text-sm font-medium cursor-pointer">
                        {actuacion.title}
                      </Label>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>#{actuacion.number}</span>
                        <span>{actuacion.createdAt.toLocaleDateString('es-ES')}</span>
                        <span className="text-green-600">
                          Firmado
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {actuacionesFirmadas.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay actuaciones firmadas disponibles para radicar
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="pt-2">
            <p className="text-xs text-muted-foreground italic">
              Los campos marcados con * son obligatorios
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !oficina || actuacionesSeleccionadas.length === 0}
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              'Radicar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}