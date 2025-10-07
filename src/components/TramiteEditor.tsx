import { useState } from 'react';
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText } from "lucide-react";
import { tramiteStorage } from "@/utils/tramiteStorage";
import { Tramite } from "@/types/tramite";
import { toast } from "sonner";

interface TramiteEditorProps {
  expedientId: string;
  onBack: () => void;
}

export function TramiteEditor({ expedientId, onBack }: TramiteEditorProps) {
  const { user } = useUser();
  const [referencia, setReferencia] = useState('');
  const [numero] = useState(() => tramiteStorage.generateNumber(expedientId));
  const [fechaCreacion] = useState(new Date());

  const handleSave = () => {
    if (!referencia.trim()) {
      toast.error("La referencia es obligatoria");
      return;
    }

    const tramite: Tramite = {
      id: `tramite-${Date.now()}`,
      expedientId,
      numero,
      referencia: referencia.trim(),
      fechaCreacion,
      createdBy: user?.name || 'Usuario',
      finalizado: false
    };

    tramiteStorage.save(tramite);
    toast.success("Trámite creado exitosamente");
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nuevo Trámite</h1>
            <p className="text-muted-foreground">Información del trámite</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Información del Trámite</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="referencia" className="text-sm font-semibold">REFERENCIA *</Label>
            <textarea
              id="referencia"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              required
              placeholder="Describa la referencia del trámite..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="numero" className="text-sm font-medium text-muted-foreground">Número de Trámite</Label>
              <Input
                id="numero"
                value={numero}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed font-mono text-sm"
                title="Número autogenerado - No modificable"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha-creacion" className="text-sm font-medium text-muted-foreground">FECHA DE CREACIÓN</Label>
              <Input
                id="fecha-creacion"
                value={fechaCreacion.toLocaleDateString('es-ES')}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end pt-4">
        <Button 
          onClick={handleSave}
          disabled={!referencia.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
        >
          Guardar Trámite
        </Button>
      </div>
    </div>
  );
}
