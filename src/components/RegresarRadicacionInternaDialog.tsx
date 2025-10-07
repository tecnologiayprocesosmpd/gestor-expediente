import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, Clock } from "lucide-react";

interface RegresarRadicacionInternaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expedientNumber: string;
  oficinaRemitente: string;
  onConfirm: (data: {
    fechaRegreso: string;
  }) => Promise<void>;
}

export function RegresarRadicacionInternaDialog({
  open,
  onOpenChange,
  expedientNumber,
  oficinaRemitente,
  onConfirm
}: RegresarRadicacionInternaDialogProps) {
  const [loading, setLoading] = useState(false);

  const fechaRegreso = new Date().toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm({
        fechaRegreso
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error al procesar regreso de radicación interna:', error);
      alert('Error al procesar el regreso de la radicación interna');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Regresar Radicación Interna</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del expediente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Información del Expediente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Expediente:</strong> {expedientNumber}</p>
                <p><strong>Oficina Remitente:</strong> {oficinaRemitente}</p>
              </div>
            </CardContent>
          </Card>

          {/* Fecha de regreso */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Fecha de Regreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{fechaRegreso}</span>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            Esta radicación interna será devuelta a la oficina remitente con la fecha y hora actual registrada.
          </p>
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
            disabled={loading}
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar Regreso'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}