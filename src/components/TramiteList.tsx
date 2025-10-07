import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  FileText,
  Plus,
  Calendar,
  User,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { Tramite } from "@/types/tramite";
import { tramiteStorage } from "@/utils/tramiteStorage";
import { toast } from "sonner";

interface TramiteListProps {
  tramites: Tramite[];
  onCreateTramite: () => void;
  onBack: () => void;
  onTramiteUpdated: () => void;
}

export function TramiteList({ tramites, onCreateTramite, onBack, onTramiteUpdated }: TramiteListProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tramiteToFinalize, setTramiteToFinalize] = useState<string | null>(null);

  const handleFinalizarClick = (tramiteId: string) => {
    setTramiteToFinalize(tramiteId);
    setShowConfirmDialog(true);
  };

  const handleConfirmFinalize = () => {
    if (tramiteToFinalize) {
      const tramite = tramites.find(t => t.id === tramiteToFinalize);
      if (tramite) {
        const updatedTramite = { ...tramite, finalizado: true };
        tramiteStorage.save(updatedTramite);
        toast.success("Trámite finalizado");
        onTramiteUpdated();
      }
    }
    setShowConfirmDialog(false);
    setTramiteToFinalize(null);
  };

  // Get only the last tramite (most recent)
  const lastTramite = tramites.length > 0
    ? tramites.reduce((latest, current) => 
        current.fechaCreacion > latest.fechaCreacion ? current : latest
      )
    : null;

  // Check if can create new tramite
  const canCreateNew = !lastTramite || lastTramite.finalizado;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trámites</h1>
            <p className="text-muted-foreground">
              Gestión de trámites del expediente
            </p>
          </div>
        </div>
        <Button 
          onClick={onCreateTramite}
          disabled={!canCreateNew}
          title={!canCreateNew ? "Debe finalizar el trámite actual antes de crear uno nuevo" : ""}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Trámite
        </Button>
      </div>

      {/* Tramite Card */}
      {!lastTramite ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-2">No hay trámites</h3>
            <p className="text-muted-foreground mb-6">
              No hay trámites disponibles para este expediente.
            </p>
            <Button onClick={onCreateTramite}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Trámite
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trámite Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Número */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Número</label>
              <p className="text-lg font-mono text-primary mt-1">{lastTramite.numero}</p>
            </div>

            {/* Referencia */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Referencia</label>
              <p className="text-foreground mt-1">{lastTramite.referencia}</p>
            </div>

            {/* Creado por */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Creado por</label>
              <div className="flex items-center mt-1">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{lastTramite.createdBy}</span>
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
              <div className="flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{lastTramite.fechaCreacion.toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>

            {/* Estado y acción */}
            <div className="pt-4 border-t">
              {lastTramite.finalizado ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Finalizado
                </Badge>
              ) : (
                <Button
                  variant="default"
                  onClick={() => handleFinalizarClick(lastTramite.id)}
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Finalizar Trámite
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Finalizar trámite?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea finalizar este trámite? Esta acción permitirá crear un nuevo trámite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmFinalize}>
              Finalizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
